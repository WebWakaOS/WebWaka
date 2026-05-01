/**
 * Bank Transfer Payment Routes — P21
 *
 * Implements the "Bank Transfer as Default Payment" flow for offline markets.
 * Full FSM: pending → proof_submitted → confirmed | rejected | expired
 *
 * Routes:
 *   POST /bank-transfer                     — create new bank transfer order
 *   GET  /bank-transfer                     — list orders for workspace
 *   GET  /bank-transfer/:orderId            — get single order with status
 *   POST /bank-transfer/:orderId/proof      — submit proof of payment (buyer)
 *   POST /bank-transfer/:orderId/confirm    — confirm payment received (seller/admin)
 *   POST /bank-transfer/:orderId/reject     — reject proof (seller/admin)
 *   POST /bank-transfer/:orderId/dispute    — raise dispute (buyer, within 24h of confirmation)
 *   GET  /bank-transfer/:orderId/dispute    — get dispute for order
 *
 * Platform Invariants:
 *   T3 — All queries tenant-scoped (tenant_id from JWT, never from body)
 *   P9 — All amounts integer kobo
 *
 * Auth:
 *   All routes require JWT auth (applied at router level)
 *   Confirm/reject require 'owner' or 'admin' role on the workspace
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { publishEvent } from '../lib/publish-event.js';
import { BankTransferEventType, WalletEventType } from '@webwaka/events';
import { confirmFunding } from '@webwaka/hl-wallet';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
  };
}

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const bankTransferRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// Reference generator — WKA-YYYYMMDD-XXXXX format
// ---------------------------------------------------------------------------

function generateReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).toUpperCase().slice(2, 7);
  return `WKA-${date}-${random}`;
}

// ---------------------------------------------------------------------------
// POST /bank-transfer — Create a new bank transfer order
// ---------------------------------------------------------------------------

bankTransferRoutes.post('/', async (c) => {
  const auth = c.get('auth');

  let body: {
    workspace_id?: string;
    seller_entity_id?: string;
    amount_kobo?: number;
    currency_code?: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    buyer_id?: string;
    expires_in_hours?: number;
  } = {};

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.workspace_id || !body.seller_entity_id || !body.amount_kobo) {
    return c.json({ error: 'workspace_id, seller_entity_id and amount_kobo are required' }, 400);
  }

  if (!Number.isInteger(body.amount_kobo) || body.amount_kobo <= 0) {
    return c.json({ error: 'amount_kobo must be a positive integer (P9 invariant)' }, 422);
  }

  const db = c.env.DB as unknown as D1Like;
  const id = crypto.randomUUID();
  const reference = generateReference();
  const expiresInHours = body.expires_in_hours ?? 48;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInHours * 3600;

  await db
    .prepare(
      `INSERT INTO bank_transfer_orders
       (id, workspace_id, tenant_id, buyer_id, seller_entity_id, amount_kobo, currency_code,
        reference, bank_name, account_number, account_name, status, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      body.workspace_id,
      auth.tenantId,
      body.buyer_id ?? null,
      body.seller_entity_id,
      body.amount_kobo,
      body.currency_code ?? 'NGN',
      reference,
      body.bank_name ?? null,
      body.account_number ?? null,
      body.account_name ?? null,
      expiresAt,
    )
    .run();

  const order = await db
    .prepare(`SELECT * FROM bank_transfer_orders WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(id, auth.tenantId)
    .first<Record<string, unknown>>();

  // N-092: bank_transfer.initiated event
  void publishEvent(c.env, {
    eventId: id,
    eventKey: BankTransferEventType.BankTransferInitiated,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: body.workspace_id,
    payload: { order_id: id, amount_kobo: body.amount_kobo, reference },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ order }, 201);
});

// ---------------------------------------------------------------------------
// GET /bank-transfer — List orders for a workspace
// ---------------------------------------------------------------------------

bankTransferRoutes.get('/', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.query('workspace_id');
  const status = c.req.query('status');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 100);

  if (!workspaceId) {
    return c.json({ error: 'workspace_id query parameter is required' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;

  const VALID_BT_STATUSES = ['pending', 'proof_submitted', 'confirmed', 'rejected', 'expired'] as const;
  if (status && !(VALID_BT_STATUSES as readonly string[]).includes(status)) {
    return c.json({ error: `Invalid status. Must be one of: ${VALID_BT_STATUSES.join(', ')}` }, 400);
  }

  const querySql = status
    ? `SELECT * FROM bank_transfer_orders WHERE workspace_id = ? AND tenant_id = ? AND status = ? ORDER BY created_at DESC LIMIT ?`
    : `SELECT * FROM bank_transfer_orders WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT ?`;
  const binds: unknown[] = status
    ? [workspaceId, auth.tenantId, status, limit]
    : [workspaceId, auth.tenantId, limit];

  const orders = await db.prepare(querySql).bind(...binds).all<Record<string, unknown>>();

  return c.json({ orders: orders.results, total: orders.results.length });
});

// ---------------------------------------------------------------------------
// GET /bank-transfer/:orderId — Get single order
// ---------------------------------------------------------------------------

bankTransferRoutes.get('/:orderId', async (c) => {
  const auth = c.get('auth');
  const orderId = c.req.param('orderId');
  const db = c.env.DB as unknown as D1Like;

  const order = await db
    .prepare(`SELECT * FROM bank_transfer_orders WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(orderId, auth.tenantId)
    .first<Record<string, unknown>>();

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json({ order });
});

// ---------------------------------------------------------------------------
// POST /bank-transfer/:orderId/proof — Submit proof of payment (buyer)
// FSM: pending → proof_submitted
// ---------------------------------------------------------------------------

bankTransferRoutes.post('/:orderId/proof', async (c) => {
  const auth = c.get('auth');
  const orderId = c.req.param('orderId');
  const db = c.env.DB as unknown as D1Like;

  const order = await db
    .prepare(
      `SELECT id, status, expires_at, tenant_id FROM bank_transfer_orders
       WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(orderId, auth.tenantId)
    .first<{ id: string; status: string; expires_at: number; tenant_id: string }>();

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.status !== 'pending') {
    return c.json({ error: `Cannot submit proof: order is in '${order.status}' status` }, 409);
  }
  if (Math.floor(Date.now() / 1000) > order.expires_at) {
    return c.json({ error: 'Order has expired' }, 410);
  }

  let body: { proof_url?: string } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.proof_url) {
    return c.json({ error: 'proof_url is required' }, 400);
  }

  // Validate proof_url is a well-formed absolute URL to prevent injection of
  // arbitrary or relative strings that would be stored and later rendered/fetched.
  try {
    const parsed = new URL(body.proof_url);
    if (parsed.protocol !== 'https:') {
      return c.json({ error: 'proof_url must be an HTTPS URL' }, 400);
    }
  } catch {
    return c.json({ error: 'proof_url must be a valid absolute URL' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `UPDATE bank_transfer_orders
       SET status = 'proof_submitted', proof_url = ?, proof_submitted_at = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(body.proof_url, now, now, orderId, auth.tenantId)
    .run();

  // N-092: bank_transfer.processing event (proof submitted → under review)
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: BankTransferEventType.BankTransferProcessing,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { order_id: orderId },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ success: true, status: 'proof_submitted' });
});

// ---------------------------------------------------------------------------
// POST /bank-transfer/:orderId/confirm — Confirm payment (seller/admin)
// FSM: proof_submitted → confirmed
// ---------------------------------------------------------------------------

bankTransferRoutes.post('/:orderId/confirm', async (c) => {
  const auth = c.get('auth');
  const orderId = c.req.param('orderId');
  const db = c.env.DB as unknown as D1Like;

  // SEC-BT-01: only admins/super-admins (workspace sellers) may confirm proof
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required to confirm bank transfers' }, 403);
  }

  const order = await db
    .prepare(
      `SELECT id, status, tenant_id FROM bank_transfer_orders
       WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(orderId, auth.tenantId)
    .first<{ id: string; status: string; tenant_id: string }>();

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.status !== 'proof_submitted') {
    return c.json({ error: `Cannot confirm: order is in '${order.status}' status` }, 409);
  }

  const now = Math.floor(Date.now() / 1000);
  // TOCTOU guard: add status predicate to UPDATE so a concurrent confirm
  // request that races past the SELECT check cannot double-confirm the order.
  await db
    .prepare(
      `UPDATE bank_transfer_orders
       SET status = 'confirmed', confirmed_at = ?, confirmed_by = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ? AND status = 'proof_submitted'`,
    )
    .bind(now, auth.userId, now, orderId, auth.tenantId)
    .run();

  // N-092: bank_transfer.completed event (high severity — financial confirmation)
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: BankTransferEventType.BankTransferCompleted,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { order_id: orderId, confirmed_by: auth.userId },
    source: 'api',
    severity: 'critical',
    correlationId: c.get('requestId') ?? undefined,
  });

  // WF-021/022: Auto-credit wallet if this bank transfer has an associated hl_funding_request.
  // If hitl_required = 1, skip auto-credit and notify super-admin to confirm via platform-admin.
  try {
    // T3 fix: scope hl_funding_requests lookup to the caller's tenant to prevent
    // cross-tenant wallet auto-credit if an orderId is guessed by another tenant.
    const fr = await db
      .prepare(
        `SELECT id, tenant_id, hitl_required FROM hl_funding_requests
         WHERE bank_transfer_order_id = ? AND tenant_id = ? AND status = 'pending' LIMIT 1`,
      )
      .bind(orderId, auth.tenantId)
      .first<{ id: string; tenant_id: string; hitl_required: number }>();

    if (fr) {
      if (fr.hitl_required === 0) {
        // Auto-confirm: debit and credit wallet immediately
        // WF-032: pass KV so balance cap is checked at confirmation time too.
        // WALLET_KV is always bound in apps/api. Fallback to null KV (CBN defaults) if not.
        const walletKv = c.env.WALLET_KV ?? { get: async (_: string): Promise<string | null> => null };
        await confirmFunding(c.env.DB as never, walletKv as never, fr.id, fr.tenant_id, auth.userId);
        void publishEvent(c.env, {
          eventId:   crypto.randomUUID(),
          eventKey:  WalletEventType.WalletFundingConfirmed,
          tenantId:  fr.tenant_id,
          actorId:   auth.userId,
          actorType: 'user',
          severity:  'critical',
          payload: {
            funding_request_id:      fr.id,
            bank_transfer_order_id:  orderId,
            confirmed_by:            auth.userId,
          },
          source: 'api',
          correlationId: c.get('requestId') ?? undefined,
        });
      } else {
        // HITL required: leave funding request pending, alert super-admin
        void publishEvent(c.env, {
          eventId:   crypto.randomUUID(),
          eventKey:  WalletEventType.WalletFundingHitlRequired,
          tenantId:  fr.tenant_id,
          actorId:   'system',
          actorType: 'system',
          severity:  'critical',
          payload: {
            funding_request_id:      fr.id,
            bank_transfer_order_id:  orderId,
            triggered_by:            auth.userId,
            action_required:         'Confirm or reject via /platform-admin/wallets/funding/:id/confirm',
          },
          source: 'api',
          correlationId: c.get('requestId') ?? undefined,
        });
      }
    }
  } catch (walletErr) {
    // Never let wallet credit failure block the bank transfer confirmation response.
    // Super-admin can manually confirm via POST /platform-admin/wallets/funding/:id/confirm.
    console.error('[bank-transfer:confirm] wallet auto-confirm failed:', walletErr);
  }

  return c.json({ success: true, status: 'confirmed' });
});

// ---------------------------------------------------------------------------
// POST /bank-transfer/:orderId/reject — Reject proof (seller/admin)
// FSM: proof_submitted → rejected
// ---------------------------------------------------------------------------

bankTransferRoutes.post('/:orderId/reject', async (c) => {
  const auth = c.get('auth');
  const orderId = c.req.param('orderId');

  // SEC-BT-01: only admins/super-admins (workspace sellers) may reject proof
  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required to reject bank transfers' }, 403);
  }

  let body: { reason?: string } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;

  const order = await db
    .prepare(
      `SELECT id, status, tenant_id FROM bank_transfer_orders
       WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(orderId, auth.tenantId)
    .first<{ id: string; status: string; tenant_id: string }>();

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.status !== 'proof_submitted') {
    return c.json({ error: `Cannot reject: order is in '${order.status}' status` }, 409);
  }

  const now = Math.floor(Date.now() / 1000);
  // TOCTOU guard: add status predicate to UPDATE so a concurrent reject
  // request that races past the SELECT check cannot double-reject the order.
  await db
    .prepare(
      `UPDATE bank_transfer_orders
       SET status = 'rejected', rejection_reason = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ? AND status = 'proof_submitted'`,
    )
    .bind(body.reason ?? null, now, orderId, auth.tenantId)
    .run();

  // N-092: bank_transfer.failed event (high severity — proof rejected)
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: BankTransferEventType.BankTransferFailed,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { order_id: orderId, reason: body.reason, type: 'proof_rejected' },
    source: 'api',
    severity: 'critical',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ success: true, status: 'rejected' });
});

// ---------------------------------------------------------------------------
// POST /bank-transfer/:orderId/dispute — Raise a dispute (buyer)
// Only valid within 24h of confirmation
// ---------------------------------------------------------------------------

bankTransferRoutes.post('/:orderId/dispute', async (c) => {
  const auth = c.get('auth');
  const orderId = c.req.param('orderId');
  const db = c.env.DB as unknown as D1Like;

  const order = await db
    .prepare(
      `SELECT id, status, workspace_id, tenant_id, confirmed_at FROM bank_transfer_orders
       WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(orderId, auth.tenantId)
    .first<{
      id: string;
      status: string;
      workspace_id: string;
      tenant_id: string;
      confirmed_at: number | null;
    }>();

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.status !== 'confirmed') {
    return c.json({ error: 'Disputes can only be raised on confirmed orders' }, 409);
  }

  const now = Math.floor(Date.now() / 1000);
  const disputeWindowSecs = 24 * 3600;
  if (order.confirmed_at && now - order.confirmed_at > disputeWindowSecs) {
    return c.json({ error: 'Dispute window has closed (24h from confirmation)' }, 410);
  }

  let body: { reason?: string; disputed_amount_kobo?: number } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.reason) {
    return c.json({ error: 'reason is required' }, 400);
  }

  if (
    body.disputed_amount_kobo !== undefined &&
    (!Number.isInteger(body.disputed_amount_kobo) || body.disputed_amount_kobo <= 0)
  ) {
    return c.json({ error: 'disputed_amount_kobo must be a positive integer (P9 invariant)' }, 422);
  }

  // T3 fix: include tenant_id so one tenant cannot shadow another's dispute record.
  const existingDispute = await db
    .prepare(`SELECT id FROM bank_transfer_disputes WHERE transfer_order_id = ? AND tenant_id = ? LIMIT 1`)
    .bind(orderId, auth.tenantId)
    .first<{ id: string }>();

  if (existingDispute) {
    return c.json({ error: 'A dispute has already been raised for this order' }, 409);
  }

  const disputeId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO bank_transfer_disputes
       (id, transfer_order_id, workspace_id, tenant_id, raised_by, reason, disputed_amount_kobo,
        status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'open', unixepoch(), unixepoch())`,
    )
    .bind(
      disputeId,
      orderId,
      order.workspace_id,
      auth.tenantId,
      auth.userId,
      body.reason,
      body.disputed_amount_kobo ?? null,
    )
    .run();

  // N-092: bank_transfer.failed event (critical severity — dispute on confirmed transfer)
  void publishEvent(c.env, {
    eventId: disputeId,
    eventKey: BankTransferEventType.BankTransferFailed,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { order_id: orderId, dispute_id: disputeId, type: 'disputed', reason: body.reason, disputed_amount_kobo: body.disputed_amount_kobo ?? null },
    source: 'api',
    severity: 'critical',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ dispute_id: disputeId, status: 'open' }, 201);
});

// ---------------------------------------------------------------------------
// DELETE /bank-transfer/:orderId — Cancel a bank transfer order (N-092/T13)
// Only valid for orders in 'pending' status (before proof is submitted).
// FSM: pending → cancelled
// ---------------------------------------------------------------------------

bankTransferRoutes.delete('/:orderId', async (c) => {
  const auth = c.get('auth');
  const orderId = c.req.param('orderId');
  const db = c.env.DB as unknown as D1Like;

  const order = await db
    .prepare(
      // buyer_id is the correct column name — the table was created with buyer_id
      // (see INSERT at line ~100). Querying user_id would always return undefined
      // and break the ownership check below.
      `SELECT id, status, buyer_id, tenant_id FROM bank_transfer_orders
       WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(orderId, auth.tenantId)
    .first<{ id: string; status: string; buyer_id: string; tenant_id: string }>();

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.status !== 'pending') {
    return c.json({ error: `Cannot cancel: order is in '${order.status}' status` }, 409);
  }

  // Only the order creator (buyer) or admins can cancel.
  if (order.buyer_id !== (auth.userId as string) && auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Not authorised to cancel this order' }, 403);
  }

  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `UPDATE bank_transfer_orders
       SET status = 'cancelled', updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(now, orderId, auth.tenantId)
    .run();

  // N-092/T13: bank_transfer.cancelled event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: BankTransferEventType.BankTransferCancelled,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { order_id: orderId, cancelled_by: auth.userId },
    source: 'api',
    severity: 'warning',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ success: true, status: 'cancelled' });
});

// ---------------------------------------------------------------------------
// POST /bank-transfer/:orderId/request-otp — Request OTP for transfer verification (N-092/T13)
// Signals that the transfer is awaiting OTP confirmation before processing.
// FSM: processing → awaiting_otp
// ---------------------------------------------------------------------------

bankTransferRoutes.post('/:orderId/request-otp', async (c) => {
  const auth = c.get('auth');
  const orderId = c.req.param('orderId');
  const db = c.env.DB as unknown as D1Like;

  const order = await db
    .prepare(
      `SELECT id, status, tenant_id FROM bank_transfer_orders
       WHERE id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(orderId, auth.tenantId)
    .first<{ id: string; status: string; tenant_id: string }>();

  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (!['processing', 'proof_submitted'].includes(order.status)) {
    return c.json({ error: `Cannot request OTP: order is in '${order.status}' status` }, 409);
  }

  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `UPDATE bank_transfer_orders
       SET status = 'awaiting_otp', updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(now, orderId, auth.tenantId)
    .run();

  // N-092/T13: bank_transfer.awaiting_otp event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: BankTransferEventType.BankTransferAwaitingOtp,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    payload: { order_id: orderId, requested_by: auth.userId },
    source: 'api',
    severity: 'info',
    correlationId: c.get('requestId') ?? undefined,
  });

  return c.json({ success: true, status: 'awaiting_otp', message: 'OTP requested for this transfer' });
});

// ---------------------------------------------------------------------------
// GET /bank-transfer/:orderId/dispute — Get dispute for an order
// ---------------------------------------------------------------------------

bankTransferRoutes.get('/:orderId/dispute', async (c) => {
  const auth = c.get('auth');
  const orderId = c.req.param('orderId');
  const db = c.env.DB as unknown as D1Like;

  const dispute = await db
    .prepare(
      `SELECT * FROM bank_transfer_disputes
       WHERE transfer_order_id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(orderId, auth.tenantId)
    .first<Record<string, unknown>>();

  if (!dispute) {
    return c.json({ error: 'No dispute found for this order' }, 404);
  }

  return c.json({ dispute });
});
