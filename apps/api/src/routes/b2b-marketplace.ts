/**
 * B2B Marketplace Routes — P25
 *
 * Implements the Request-for-Quotation (RFQ) → Bid → Purchase Order → Invoice
 * lifecycle for business-to-business commerce on WebWaka OS.
 *
 * Routes:
 *   POST /b2b/rfqs                           — create new RFQ
 *   GET  /b2b/rfqs                           — list RFQs for tenant (buyer or seller)
 *   GET  /b2b/rfqs/:rfqId                    — get RFQ with bids
 *   POST /b2b/rfqs/:rfqId/bids               — submit bid (seller)
 *   POST /b2b/rfqs/:rfqId/bids/:bidId/accept — accept bid (buyer → creates PO)
 *   GET  /b2b/purchase-orders                — list POs for workspace
 *   GET  /b2b/purchase-orders/:poId          — get PO details
 *   POST /b2b/purchase-orders/:poId/deliver  — mark as delivered (seller)
 *   GET  /b2b/invoices                       — list invoices for workspace
 *   POST /b2b/invoices                       — create invoice for PO
 *   GET  /b2b/invoices/:invoiceId            — get invoice
 *   POST /b2b/disputes                       — raise marketplace dispute
 *   GET  /b2b/trust/:entityId               — get entity trust score
 *
 * Platform Invariants:
 *   T3 — All queries tenant-scoped (tenant_id from JWT)
 *   P9 — All amounts integer kobo/smallest unit
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const b2bMarketplaceRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// RFQ — Request for Quotation
// ---------------------------------------------------------------------------

b2bMarketplaceRoutes.post('/rfqs', async (c) => {
  const auth = c.get('auth');

  let body: {
    workspace_id?: string;
    buyer_entity_id?: string;
    category?: string;
    title?: string;
    description?: string;
    quantity?: number;
    unit?: string;
    target_price_kobo?: number;
    currency_code?: string;
    delivery_deadline?: number;
    expires_in_hours?: number;
  } = {};

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.workspace_id || !body.buyer_entity_id || !body.category || !body.title || !body.description) {
    return c.json({ error: 'workspace_id, buyer_entity_id, category, title, and description are required' }, 400);
  }

  if (body.target_price_kobo !== undefined && (!Number.isInteger(body.target_price_kobo) || body.target_price_kobo <= 0)) {
    return c.json({ error: 'target_price_kobo must be a positive integer (P9 invariant)' }, 422);
  }

  const db = c.env.DB as unknown as D1Like;
  const id = crypto.randomUUID();
  const expiresInHours = body.expires_in_hours ?? 72;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInHours * 3600;

  await db
    .prepare(
      `INSERT INTO b2b_rfqs
       (id, tenant_id, workspace_id, buyer_entity_id, category, title, description,
        quantity, unit, target_price_kobo, currency_code, status,
        delivery_deadline, expires_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      auth.tenantId,
      body.workspace_id,
      body.buyer_entity_id,
      body.category,
      body.title,
      body.description,
      body.quantity ?? null,
      body.unit ?? null,
      body.target_price_kobo ?? null,
      body.currency_code ?? 'NGN',
      body.delivery_deadline ?? null,
      expiresAt,
    )
    .run();

  const rfq = await db
    .prepare(`SELECT * FROM b2b_rfqs WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(id, auth.tenantId)
    .first<Record<string, unknown>>();

  return c.json({ rfq }, 201);
});

b2bMarketplaceRoutes.get('/rfqs', async (c) => {
  const auth = c.get('auth');
  const status = c.req.query('status');
  const category = c.req.query('category');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 100);
  const db = c.env.DB as unknown as D1Like;

  const VALID_RFQ_STATUSES = ['open', 'bidding', 'awarded', 'closed', 'expired'] as const;
  if (status && !(VALID_RFQ_STATUSES as readonly string[]).includes(status)) {
    return c.json({ error: `Invalid status. Must be one of: ${VALID_RFQ_STATUSES.join(', ')}` }, 400);
  }

  const rfqSql =
    `SELECT r.*, (SELECT COUNT(*) FROM b2b_rfq_bids b WHERE b.rfq_id = r.id) as bid_count` +
    ` FROM b2b_rfqs r WHERE r.tenant_id = ?` +
    (status ? ` AND r.status = ?` : ``) +
    (category ? ` AND r.category = ?` : ``) +
    ` ORDER BY r.created_at DESC LIMIT ?`;
  const rfqBinds: unknown[] = [auth.tenantId];
  if (status) rfqBinds.push(status);
  if (category) rfqBinds.push(category);
  rfqBinds.push(limit);

  const rfqs = await db.prepare(rfqSql).bind(...rfqBinds).all<Record<string, unknown>>();

  return c.json({ rfqs: rfqs.results, total: rfqs.results.length });
});

b2bMarketplaceRoutes.get('/rfqs/:rfqId', async (c) => {
  const auth = c.get('auth');
  const rfqId = c.req.param('rfqId');
  const db = c.env.DB as unknown as D1Like;

  const rfq = await db
    .prepare(`SELECT * FROM b2b_rfqs WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(rfqId, auth.tenantId)
    .first<Record<string, unknown>>();

  if (!rfq) return c.json({ error: 'RFQ not found' }, 404);

  const bids = await db
    .prepare(`SELECT * FROM b2b_rfq_bids WHERE rfq_id = ? AND tenant_id = ? ORDER BY created_at DESC`)
    .bind(rfqId, auth.tenantId)
    .all<Record<string, unknown>>();

  return c.json({ rfq, bids: bids.results });
});

// ---------------------------------------------------------------------------
// Bids
// ---------------------------------------------------------------------------

b2bMarketplaceRoutes.post('/rfqs/:rfqId/bids', async (c) => {
  const auth = c.get('auth');
  const rfqId = c.req.param('rfqId');
  const db = c.env.DB as unknown as D1Like;

  const rfq = await db
    .prepare(`SELECT id, status, tenant_id, expires_at FROM b2b_rfqs WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(rfqId, auth.tenantId)
    .first<{ id: string; status: string; tenant_id: string; expires_at: number }>();

  if (!rfq) return c.json({ error: 'RFQ not found' }, 404);
  if (!['open', 'bidding'].includes(rfq.status)) {
    return c.json({ error: `Cannot bid: RFQ is in '${rfq.status}' status` }, 409);
  }
  if (Math.floor(Date.now() / 1000) > rfq.expires_at) {
    return c.json({ error: 'RFQ has expired' }, 410);
  }

  let body: { seller_entity_id?: string; bid_amount_kobo?: number; currency_code?: string; notes?: string } = {};
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.seller_entity_id || !body.bid_amount_kobo) {
    return c.json({ error: 'seller_entity_id and bid_amount_kobo are required' }, 400);
  }

  if (!Number.isInteger(body.bid_amount_kobo) || body.bid_amount_kobo <= 0) {
    return c.json({ error: 'bid_amount_kobo must be a positive integer (P9 invariant)' }, 422);
  }

  const bidId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO b2b_rfq_bids
       (id, rfq_id, tenant_id, seller_entity_id, bid_amount_kobo, currency_code, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', unixepoch(), unixepoch())`,
    )
    .bind(bidId, rfqId, auth.tenantId, body.seller_entity_id, body.bid_amount_kobo, body.currency_code ?? 'NGN', body.notes ?? null)
    .run();

  await db
    .prepare(`UPDATE b2b_rfqs SET status = 'bidding', updated_at = unixepoch() WHERE id = ? AND status = 'open'`)
    .bind(rfqId)
    .run();

  return c.json({ bid_id: bidId, status: 'submitted' }, 201);
});

b2bMarketplaceRoutes.post('/rfqs/:rfqId/bids/:bidId/accept', async (c) => {
  const auth = c.get('auth');
  const rfqId = c.req.param('rfqId');
  const bidId = c.req.param('bidId');
  const db = c.env.DB as unknown as D1Like;

  const rfq = await db
    .prepare(`SELECT * FROM b2b_rfqs WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(rfqId, auth.tenantId)
    .first<{ id: string; status: string; workspace_id: string; buyer_entity_id: string; tenant_id: string }>();

  if (!rfq) return c.json({ error: 'RFQ not found' }, 404);
  if (rfq.status !== 'bidding') {
    return c.json({ error: 'RFQ must be in bidding status to accept a bid' }, 409);
  }

  const bid = await db
    .prepare(`SELECT * FROM b2b_rfq_bids WHERE id = ? AND rfq_id = ? AND tenant_id = ? LIMIT 1`)
    .bind(bidId, rfqId, auth.tenantId)
    .first<{ id: string; seller_entity_id: string; bid_amount_kobo: number; currency_code: string }>();

  if (!bid) return c.json({ error: 'Bid not found' }, 404);

  const poId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO b2b_purchase_orders
       (id, rfq_id, bid_id, tenant_id, buyer_entity_id, seller_entity_id, amount_kobo, currency_code,
        payment_method, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'bank_transfer', 'rfq_accepted', unixepoch(), unixepoch())`,
    )
    .bind(poId, rfqId, bidId, auth.tenantId, rfq.buyer_entity_id, bid.seller_entity_id, bid.bid_amount_kobo, bid.currency_code)
    .run();

  await db
    .prepare(`UPDATE b2b_rfq_bids SET status = 'accepted', updated_at = unixepoch() WHERE id = ?`)
    .bind(bidId)
    .run();

  await db
    .prepare(`UPDATE b2b_rfqs SET status = 'awarded', awarded_bid_id = ?, updated_at = unixepoch() WHERE id = ?`)
    .bind(bidId, rfqId)
    .run();

  return c.json({ purchase_order_id: poId, status: 'rfq_accepted' }, 201);
});

// ---------------------------------------------------------------------------
// Purchase Orders
// ---------------------------------------------------------------------------

b2bMarketplaceRoutes.get('/purchase-orders', async (c) => {
  const auth = c.get('auth');
  const status = c.req.query('status');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 100);
  const db = c.env.DB as unknown as D1Like;

  const VALID_PO_STATUSES = ['rfq_accepted', 'po_created', 'in_fulfillment', 'delivered', 'invoiced', 'paid', 'disputed', 'cancelled'] as const;
  if (status && !(VALID_PO_STATUSES as readonly string[]).includes(status)) {
    return c.json({ error: `Invalid status. Must be one of: ${VALID_PO_STATUSES.join(', ')}` }, 400);
  }

  const poSql = status
    ? `SELECT * FROM b2b_purchase_orders WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC LIMIT ?`
    : `SELECT * FROM b2b_purchase_orders WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?`;
  const poBinds: unknown[] = status ? [auth.tenantId, status, limit] : [auth.tenantId, limit];

  const pos = await db.prepare(poSql).bind(...poBinds).all<Record<string, unknown>>();

  return c.json({ purchase_orders: pos.results, total: pos.results.length });
});

b2bMarketplaceRoutes.get('/purchase-orders/:poId', async (c) => {
  const auth = c.get('auth');
  const poId = c.req.param('poId');
  const db = c.env.DB as unknown as D1Like;

  const po = await db
    .prepare(`SELECT * FROM b2b_purchase_orders WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(poId, auth.tenantId)
    .first<Record<string, unknown>>();

  if (!po) return c.json({ error: 'Purchase order not found' }, 404);
  return c.json({ purchase_order: po });
});

b2bMarketplaceRoutes.post('/purchase-orders/:poId/deliver', async (c) => {
  const auth = c.get('auth');
  const poId = c.req.param('poId');
  const db = c.env.DB as unknown as D1Like;

  const po = await db
    .prepare(`SELECT id, status, seller_entity_id, tenant_id FROM b2b_purchase_orders WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(poId, auth.tenantId)
    .first<{ id: string; status: string; seller_entity_id: string; tenant_id: string }>();

  if (!po) return c.json({ error: 'Purchase order not found' }, 404);
  if (!['rfq_accepted', 'po_created', 'in_fulfillment'].includes(po.status)) {
    return c.json({ error: `Cannot mark delivered: PO is in '${po.status}' status` }, 409);
  }

  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `UPDATE b2b_purchase_orders
       SET status = 'delivered', delivery_confirmed_at = ?, delivery_confirmed_by = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(now, auth.userId, now, poId, auth.tenantId)
    .run();

  return c.json({ success: true, status: 'delivered' });
});

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

b2bMarketplaceRoutes.post('/invoices', async (c) => {
  const auth = c.get('auth');

  let body: {
    purchase_order_id?: string;
    line_items?: Array<{ description: string; quantity: number; unit_price_kobo: number; total_kobo: number }>;
    tax_kobo?: number;
    payment_terms?: string;
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    due_date?: number;
  } = {};

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.purchase_order_id || !body.line_items?.length) {
    return c.json({ error: 'purchase_order_id and line_items are required' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;

  const po = await db
    .prepare(`SELECT * FROM b2b_purchase_orders WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(body.purchase_order_id, auth.tenantId)
    .first<{
      id: string;
      buyer_entity_id: string;
      seller_entity_id: string;
      amount_kobo: number;
      currency_code: string;
      tenant_id: string;
    }>();

  if (!po) return c.json({ error: 'Purchase order not found' }, 404);

  const subtotalKobo = body.line_items.reduce((sum, item) => sum + item.total_kobo, 0);
  const taxKobo = body.tax_kobo ?? 0;
  const totalKobo = subtotalKobo + taxKobo;

  if (!Number.isInteger(totalKobo) || totalKobo <= 0) {
    return c.json({ error: 'Total invoice amount must be a positive integer (P9 invariant)' }, 422);
  }

  // Use a UUID-derived suffix to avoid TOCTOU race conditions under concurrent requests.
  // COUNT(*)-based sequences are not safe on distributed edge workers.
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const uniqueSuffix = crypto.randomUUID().slice(0, 8).toUpperCase();
  const invoiceNumber = `INV-${date}-${uniqueSuffix}`;

  const invoiceId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO b2b_invoices
       (id, purchase_order_id, tenant_id, buyer_entity_id, seller_entity_id,
        invoice_number, line_items, subtotal_kobo, tax_kobo, total_kobo, currency_code,
        payment_terms, bank_name, account_number, account_name, status, due_date,
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, unixepoch(), unixepoch())`,
    )
    .bind(
      invoiceId,
      body.purchase_order_id,
      auth.tenantId,
      po.buyer_entity_id,
      po.seller_entity_id,
      invoiceNumber,
      JSON.stringify(body.line_items),
      subtotalKobo,
      taxKobo,
      totalKobo,
      po.currency_code,
      body.payment_terms ?? 'bank_transfer',
      body.bank_name ?? null,
      body.account_number ?? null,
      body.account_name ?? null,
      body.due_date ?? null,
    )
    .run();

  return c.json({ invoice_id: invoiceId, invoice_number: invoiceNumber, total_kobo: totalKobo }, 201);
});

b2bMarketplaceRoutes.get('/invoices', async (c) => {
  const auth = c.get('auth');
  const status = c.req.query('status');
  const limit = Math.min(parseInt(c.req.query('limit') ?? '50'), 100);
  const db = c.env.DB as unknown as D1Like;

  const VALID_INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;
  if (status && !(VALID_INVOICE_STATUSES as readonly string[]).includes(status)) {
    return c.json({ error: `Invalid status. Must be one of: ${VALID_INVOICE_STATUSES.join(', ')}` }, 400);
  }

  const invoiceSql = status
    ? `SELECT * FROM b2b_invoices WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC LIMIT ?`
    : `SELECT * FROM b2b_invoices WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?`;
  const invoiceBinds: unknown[] = status ? [auth.tenantId, status, limit] : [auth.tenantId, limit];

  const invoices = await db.prepare(invoiceSql).bind(...invoiceBinds).all<Record<string, unknown>>();

  return c.json({ invoices: invoices.results, total: invoices.results.length });
});

b2bMarketplaceRoutes.get('/invoices/:invoiceId', async (c) => {
  const auth = c.get('auth');
  const invoiceId = c.req.param('invoiceId');
  const db = c.env.DB as unknown as D1Like;

  const invoice = await db
    .prepare(`SELECT * FROM b2b_invoices WHERE id = ? AND tenant_id = ? LIMIT 1`)
    .bind(invoiceId, auth.tenantId)
    .first<Record<string, unknown>>();

  if (!invoice) return c.json({ error: 'Invoice not found' }, 404);
  return c.json({ invoice });
});

// ---------------------------------------------------------------------------
// Disputes
// ---------------------------------------------------------------------------

b2bMarketplaceRoutes.post('/disputes', async (c) => {
  const auth = c.get('auth');

  let body: {
    purchase_order_id?: string;
    invoice_id?: string;
    raised_by_entity?: string;
    against_entity?: string;
    reason?: string;
    evidence_urls?: string[];
  } = {};

  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.raised_by_entity || !body.against_entity || !body.reason) {
    return c.json({ error: 'raised_by_entity, against_entity, and reason are required' }, 400);
  }

  if (!body.purchase_order_id && !body.invoice_id) {
    return c.json({ error: 'Either purchase_order_id or invoice_id is required' }, 400);
  }

  const db = c.env.DB as unknown as D1Like;
  const disputeId = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO b2b_disputes
       (id, purchase_order_id, invoice_id, tenant_id, raised_by_entity, against_entity,
        reason, evidence_urls, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', unixepoch(), unixepoch())`,
    )
    .bind(
      disputeId,
      body.purchase_order_id ?? null,
      body.invoice_id ?? null,
      auth.tenantId,
      body.raised_by_entity,
      body.against_entity,
      body.reason,
      JSON.stringify(body.evidence_urls ?? []),
    )
    .run();

  return c.json({ dispute_id: disputeId, status: 'open' }, 201);
});

// ---------------------------------------------------------------------------
// Trust Scores
// ---------------------------------------------------------------------------

b2bMarketplaceRoutes.get('/trust/:entityId', async (c) => {
  const auth = c.get('auth');
  const entityId = c.req.param('entityId');
  const db = c.env.DB as unknown as D1Like;

  const score = await db
    .prepare(
      `SELECT entity_id, claim_tier, verification_tier, completed_transactions,
              dispute_rate_pct, trust_score, computed_at
       FROM entity_trust_scores
       WHERE entity_id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(entityId, auth.tenantId)
    .first<Record<string, unknown>>();

  if (!score) {
    return c.json({
      entity_id: entityId,
      trust_score: 0,
      claim_tier: 0,
      verification_tier: 0,
      completed_transactions: 0,
      dispute_rate_pct: 0,
      note: 'No trust score computed yet for this entity.',
    });
  }

  return c.json({ trust_score: score });
});
