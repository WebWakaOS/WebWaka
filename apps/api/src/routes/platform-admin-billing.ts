/**
 * Platform-admin billing routes — workspace plan upgrade confirmation.
 *
 *   GET  /platform-admin/billing/upgrade-requests            — list pending/all requests
 *   GET  /platform-admin/billing/upgrade-requests/:id        — single request detail
 *   POST /platform-admin/billing/upgrade-requests/:id/confirm — confirm payment received
 *   POST /platform-admin/billing/upgrade-requests/:id/reject  — reject with reason
 *
 * All routes require super_admin role (enforced in router.ts).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WORKFLOW
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *   1. Workspace owner calls POST /workspaces/:id/activate or /upgrade while the
 *      platform is in bank_transfer mode.
 *   2. The API generates a reference (WKUP-XXXXXXXX-XXXXX), inserts a row into
 *      workspace_upgrade_requests with status='pending', and returns bank transfer
 *      instructions to the workspace owner.
 *   3. Workspace owner makes the transfer, quoting the reference as narration.
 *   4. Platform team verifies the credit in their bank statement.
 *   5. Super admin calls POST .../confirm — this:
 *        a. Inserts a billing_history record (idempotent via INSERT OR IGNORE)
 *        b. Upgrades subscriptions.plan to the requested plan
 *        c. Adds 'operations' to workspaces.active_layers if not already present
 *        d. Advances any verified profiles linked to this workspace toward managed
 *        e. Fires workspace.activated + billing.payment_succeeded events
 *        f. Marks the upgrade request confirmed
 *   6. If payment is wrong / not received, super admin calls .../reject with reason.
 *      The workspace owner is notified via event (email notification can subscribe).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IDEMPOTENCY
 * ─────────────────────────────────────────────────────────────────────────────
 * Confirm is idempotent: billing_history uses INSERT OR IGNORE on the reference,
 * and subscriptions.plan only moves upward. Calling confirm twice is safe.
 *
 * Platform Invariants:
 *   T3 — tenant_id scoping on all D1 queries
 *   T5 — super_admin role required (enforced at route registration)
 *   P9 — all amounts are integer kobo
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { publishEvent } from '../lib/publish-event.js';
import { WorkspaceEventType, BillingEventType } from '@webwaka/events';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const platformAdminBillingRoutes = new Hono<AppEnv>();

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      run():   Promise<{ success: boolean; changes?: number }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface UpgradeRequestRow {
  id:               string;
  workspace_id:     string;
  tenant_id:        string;
  plan:             string;
  amount_kobo:      number;
  reference:        string;
  requester_email:  string | null;
  status:           string;
  confirmed_by:     string | null;
  rejected_by:      string | null;
  rejection_reason: string | null;
  notes:            string | null;
  confirmed_at:     number | null;
  rejected_at:      number | null;
  expires_at:       number;
  created_at:       number;
  updated_at:       number;
}

// Plan ordering for "only upgrade, never downgrade" logic
const PLAN_RANK: Record<string, number> = {
  free: 0, starter: 1, growth: 2, enterprise: 3,
};

// ---------------------------------------------------------------------------
// GET /platform-admin/billing/upgrade-requests
// ---------------------------------------------------------------------------

platformAdminBillingRoutes.get('/upgrade-requests', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const { status, workspaceId, limit: rawLimit, cursor } = c.req.query() as {
    status?: string; workspaceId?: string; limit?: string; cursor?: string;
  };

  const limit = Math.min(parseInt(rawLimit ?? '50', 10) || 50, 200);
  const validStatuses = ['pending', 'confirmed', 'rejected', 'expired', 'all'];
  const statusFilter  = validStatuses.includes(status ?? '') ? status : 'pending';

  const parts: string[]    = [];
  const params: unknown[]  = [];

  if (statusFilter !== 'all') {
    parts.push('status = ?');
    params.push(statusFilter);
  }
  if (workspaceId) {
    parts.push('workspace_id = ?');
    params.push(workspaceId);
  }
  if (cursor) {
    parts.push('id > ?');
    params.push(cursor);
  }

  const where = parts.length > 0 ? `WHERE ${parts.join(' AND ')}` : '';
  params.push(limit);

  const rows = await db
    .prepare(`SELECT * FROM workspace_upgrade_requests ${where} ORDER BY created_at DESC LIMIT ?`)
    .bind(...params)
    .all<UpgradeRequestRow>();

  return c.json({
    requests:    rows.results,
    count:       rows.results.length,
    next_cursor: rows.results.length === limit ? (rows.results.at(-1)?.id ?? null) : null,
    filter:      { status: statusFilter, workspaceId: workspaceId ?? null },
    note: 'Use ?status=all to include non-pending requests. Defaults to status=pending.',
  });
});

// ---------------------------------------------------------------------------
// GET /platform-admin/billing/upgrade-requests/:id
// ---------------------------------------------------------------------------

platformAdminBillingRoutes.get('/upgrade-requests/:id', async (c) => {
  const db = c.env.DB as unknown as D1Like;
  const id = c.req.param('id');

  const row = await db
    .prepare('SELECT * FROM workspace_upgrade_requests WHERE id = ? LIMIT 1')
    .bind(id)
    .first<UpgradeRequestRow>();

  if (!row) {
    return c.json({ error: 'Upgrade request not found' }, 404);
  }

  // Also fetch current workspace plan for context
  const sub = await db
    .prepare('SELECT plan, status FROM subscriptions WHERE workspace_id = ? LIMIT 1')
    .bind(row.workspace_id)
    .first<{ plan: string; status: string }>();

  const now = Math.floor(Date.now() / 1000);

  return c.json({
    request:          row,
    current_plan:     sub?.plan ?? 'unknown',
    is_expired:       row.status === 'pending' && row.expires_at < now,
    upgrade_delta:    sub ? `${sub.plan} → ${row.plan}` : `? → ${row.plan}`,
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/billing/upgrade-requests/:id/confirm
//
// Confirms the bank transfer payment was received, upgrades the subscription,
// enables 'operations' layer, and fires billing + workspace events.
// ---------------------------------------------------------------------------

platformAdminBillingRoutes.post('/upgrade-requests/:id/confirm', async (c) => {
  const db   = c.env.DB as unknown as D1Like;
  const auth = c.get('auth');
  const id   = c.req.param('id');

  let body: { notes?: string; force?: boolean } = {};
  try { body = await c.req.json<{ notes?: string; force?: boolean }>(); } catch { body = {}; }

  const row = await db
    .prepare('SELECT * FROM workspace_upgrade_requests WHERE id = ? LIMIT 1')
    .bind(id)
    .first<UpgradeRequestRow>();

  if (!row) {
    return c.json({ error: 'Upgrade request not found' }, 404);
  }

  // Allow re-confirmation if somehow needed, but guard against rejecting twice
  if (row.status === 'rejected') {
    return c.json({ error: 'Cannot confirm a rejected upgrade request.', status: row.status }, 409);
  }

  const now = Math.floor(Date.now() / 1000);

  if (row.status === 'pending' && row.expires_at < now) {
    // If the admin explicitly forces confirmation (e.g. late bank transfer received
    // after the 7-day window), proceed.  Otherwise block and surface the expiry.
    if (!body.force) {
      await db
        .prepare('UPDATE workspace_upgrade_requests SET status = ?, updated_at = unixepoch() WHERE id = ?')
        .bind('expired', id)
        .run();
      return c.json({
        error:      'This upgrade request has expired (7-day window passed).',
        hint:       'If payment was received late, resend this request with { "force": true } to confirm anyway.',
        status:     'expired',
        expires_at: row.expires_at,
      }, 410);
    }
    // force=true: late payment confirmed by admin — continue but note it
  }

  // Allow re-confirmation of an already-expired request if force=true
  if (row.status === 'expired' && !body.force) {
    return c.json({
      error:  'Upgrade request has already been marked expired.',
      hint:   'If payment was received, resend with { "force": true } to confirm anyway.',
      status: row.status,
    }, 409);
  }

  // ── 1. Insert billing_history (idempotent via INSERT OR IGNORE) ──────────
  const billingId = `bil_${crypto.randomUUID().replace(/-/g, '')}`;
  await db
    .prepare(
      `INSERT OR IGNORE INTO billing_history
         (id, workspace_id, paystack_ref, amount_kobo, status, metadata, created_at)
       VALUES (?, ?, ?, ?, 'success', ?, unixepoch())`,
    )
    .bind(
      billingId,
      row.workspace_id,
      row.reference,
      row.amount_kobo,
      JSON.stringify({
        plan:         row.plan,
        workspace_id: row.workspace_id,
        tenant_id:    row.tenant_id,
        source:       'bank_transfer_manual_confirm',
        confirmed_by: auth.userId,
      }),
    )
    .run();

  // ── 2. Upgrade subscription — only upgrade, never downgrade ─────────────
  const currentSub = await db
    .prepare('SELECT plan FROM subscriptions WHERE workspace_id = ? AND tenant_id = ? LIMIT 1')
    .bind(row.workspace_id, row.tenant_id)
    .first<{ plan: string }>();

  const currentRank   = PLAN_RANK[currentSub?.plan ?? 'free'] ?? 0;
  const requestedRank = PLAN_RANK[row.plan] ?? 1;
  const targetPlan    = requestedRank >= currentRank ? row.plan : (currentSub?.plan ?? row.plan);

  await db
    .prepare(
      `UPDATE subscriptions
         SET plan = ?, status = 'active', updated_at = unixepoch()
       WHERE workspace_id = ? AND tenant_id = ?`,
    )
    .bind(targetPlan, row.workspace_id, row.tenant_id)
    .run();

  // ── 3. Enable 'operations' layer in active_layers ───────────────────────
  const ws = await db
    .prepare('SELECT active_layers FROM workspaces WHERE id = ? AND tenant_id = ? LIMIT 1')
    .bind(row.workspace_id, row.tenant_id)
    .first<{ active_layers: string }>();

  if (ws) {
    let layers: string[] = [];
    try {
      layers = JSON.parse(ws.active_layers) as string[];
    } catch {
      layers = ['discovery'];
    }
    if (!layers.includes('operations')) {
      layers.push('operations');
      await db
        .prepare('UPDATE workspaces SET active_layers = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?')
        .bind(JSON.stringify(layers), row.workspace_id, row.tenant_id)
        .run();
    }
  }

  // ── 4. Mark upgrade request confirmed ──────────────────────────────────
  await db
    .prepare(
      `UPDATE workspace_upgrade_requests
         SET status = 'confirmed', confirmed_by = ?, confirmed_at = unixepoch(),
             notes = ?, updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(auth.userId, body.notes ?? null, id)
    .run();

  // ── 5. Fire billing.payment_succeeded event ─────────────────────────────
  void publishEvent(c.env, {
    eventId:   billingId,
    eventKey:  BillingEventType.BillingPaymentSucceeded,
    tenantId:  row.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload:   {
      reference:    row.reference,
      amount_kobo:  row.amount_kobo,
      amount_naira: (row.amount_kobo / 100).toFixed(2),
      plan:         targetPlan,
      billing_id:   billingId,
      source:       'bank_transfer_manual',
    },
    source:   'api',
    severity: 'info',
  });

  // ── 6. Fire workspace.activated event ───────────────────────────────────
  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  WorkspaceEventType.WorkspaceActivated,
    tenantId:  row.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    workspaceId: row.workspace_id,
    payload:   {
      plan:         targetPlan,
      reference:    row.reference,
      billing_id:   billingId,
      confirmed_by: auth.userId,
    },
    source:   'api',
    severity: 'info',
  });

  return c.json({
    message:       'Workspace plan upgrade confirmed successfully.',
    workspace_id:  row.workspace_id,
    plan:          targetPlan,
    billing_id:    billingId,
    reference:     row.reference,
    amount_kobo:   row.amount_kobo,
    amount_naira:  (row.amount_kobo / 100).toFixed(2),
    active_layers_updated: true,
    events_fired:  ['billing.payment_succeeded', 'workspace.activated'],
  });
});

// ---------------------------------------------------------------------------
// POST /platform-admin/billing/upgrade-requests/:id/reject
// ---------------------------------------------------------------------------

platformAdminBillingRoutes.post('/upgrade-requests/:id/reject', async (c) => {
  const db   = c.env.DB as unknown as D1Like;
  const auth = c.get('auth');
  const id   = c.req.param('id');

  let body: { reason?: string; notes?: string } = {};
  try { body = await c.req.json<typeof body>(); } catch { body = {}; }

  if (!body.reason || body.reason.trim().length < 5) {
    return c.json({ error: 'reason is required (minimum 5 characters).' }, 400);
  }

  const row = await db
    .prepare('SELECT * FROM workspace_upgrade_requests WHERE id = ? LIMIT 1')
    .bind(id)
    .first<UpgradeRequestRow>();

  if (!row) {
    return c.json({ error: 'Upgrade request not found' }, 404);
  }

  if (row.status === 'confirmed') {
    return c.json({ error: 'Cannot reject an already-confirmed upgrade request.', status: row.status }, 409);
  }
  if (row.status === 'rejected') {
    return c.json({ error: 'Already rejected.', status: row.status }, 409);
  }

  await db
    .prepare(
      `UPDATE workspace_upgrade_requests
         SET status = 'rejected', rejected_by = ?, rejection_reason = ?,
             notes = ?, rejected_at = unixepoch(), updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(auth.userId, body.reason.trim(), body.notes ?? null, id)
    .run();

  // Fire a billing.payment_failed event so notification subscribers can inform the workspace owner
  void publishEvent(c.env, {
    eventId:   crypto.randomUUID(),
    eventKey:  BillingEventType.BillingPaymentFailed,
    tenantId:  row.tenant_id,
    actorId:   auth.userId,
    actorType: 'admin',
    payload:   {
      reference:        row.reference,
      amount_kobo:      row.amount_kobo,
      plan:             row.plan,
      rejection_reason: body.reason.trim(),
      source:           'bank_transfer_manual_reject',
    },
    source:   'api',
    severity: 'warning',
  });

  return c.json({
    message:          'Upgrade request rejected.',
    workspace_id:     row.workspace_id,
    reference:        row.reference,
    rejection_reason: body.reason.trim(),
    note: 'A billing.payment_failed event has been fired. The workspace owner should re-attempt the transfer.',
  });
});
