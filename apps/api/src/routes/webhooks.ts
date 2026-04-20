/**
 * Webhook Subscription Routes — PROD-04 / N-133
 *
 * Provides CRUD management for workspace webhook subscriptions.
 * All routes are tenant-scoped (T3 invariant enforced).
 *
 * Routes:
 *   GET    /webhooks/events    — list available event types by plan tier (N-133/G25)
 *   POST   /webhooks          — register a new webhook endpoint (G25: tier-gated limit)
 *   GET    /webhooks          — list all subscriptions for the workspace
 *   GET    /webhooks/:id      — get a single subscription
 *   PATCH  /webhooks/:id      — update URL, events, active, or description
 *   DELETE /webhooks/:id      — delete a subscription (also cascades deliveries)
 *   GET    /webhooks/:id/deliveries — list delivery history for a subscription
 *
 * G25 subscription limits: standard=25, business=100, enterprise=unlimited
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

const webhookRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// G25 tier limits for webhook subscriptions (N-133)
// ---------------------------------------------------------------------------

const WEBHOOK_TIER_LIMITS: Record<string, number> = {
  free:       5,
  starter:    25,
  growth:     100,
  enterprise: Infinity,
};

// Event types available per tier (cumulative — higher tiers include lower tiers)
const TIER_EVENT_REGISTRY = {
  free: [
    'template.installed',
    'workspace.member_added',
    'payment.completed',
  ],
  starter: [
    'template.installed',
    'template.purchased',
    'workspace.member_added',
    'payment.completed',
    'kyc.approved',
    'kyc.rejected',
    'bank_transfer.completed',
    'bank_transfer.failed',
    'pos.sale_completed',
    'airtime.purchase_completed',
    'airtime.purchase_failed',
  ],
  growth: [
    'template.installed',
    'template.purchased',
    'workspace.member_added',
    'payment.completed',
    'kyc.approved',
    'kyc.rejected',
    'bank_transfer.completed',
    'bank_transfer.failed',
    'bank_transfer.initiated',
    'bank_transfer.processing',
    'pos.sale_completed',
    'pos.float_credited',
    'pos.float_debited',
    'airtime.purchase_completed',
    'airtime.purchase_failed',
    'b2b.rfq_created',
    'b2b.bid_submitted',
    'b2b.bid_accepted',
    'b2b.po_issued',
    'b2b.po_delivered',
    'b2b.invoice_raised',
    'claim.submitted',
    'claim.approved',
    'claim.rejected',
    'negotiation.session_started',
    'negotiation.accepted',
    'negotiation.rejected',
    'support.ticket_created',
    'support.ticket_resolved',
    'partner.onboarded',
    'partner.application_approved',
    'onboarding.completed',
    'transport.booking_created',
    'transport.trip_completed',
    '*',
  ],
  enterprise: ['*'],
} as const;

const VALID_EVENTS = [
  'template.installed',
  'template.purchased',
  'workspace.member_added',
  'payment.completed',
  'kyc.approved',
  'kyc.rejected',
  'bank_transfer.completed',
  'bank_transfer.failed',
  'bank_transfer.initiated',
  'bank_transfer.processing',
  'pos.sale_completed',
  'pos.float_credited',
  'pos.float_debited',
  'airtime.purchase_completed',
  'airtime.purchase_failed',
  'b2b.rfq_created',
  'b2b.bid_submitted',
  'b2b.bid_accepted',
  'b2b.po_issued',
  'b2b.po_delivered',
  'b2b.invoice_raised',
  'b2b.dispute_raised',
  'claim.submitted',
  'claim.approved',
  'claim.rejected',
  'claim.advanced',
  'negotiation.session_started',
  'negotiation.accepted',
  'negotiation.rejected',
  'negotiation.session_expired',
  'support.ticket_created',
  'support.ticket_resolved',
  'support.ticket_closed',
  'partner.onboarded',
  'partner.application_approved',
  'partner.application_rejected',
  'partner.sub_partner_created',
  'onboarding.started',
  'onboarding.completed',
  'onboarding.stalled',
  'transport.booking_created',
  'transport.booking_confirmed',
  'transport.trip_started',
  'transport.trip_completed',
  'transport.booking_cancelled',
  'ai.response_generated',
  'ai.budget_warning',
  'ai.budget_exhausted',
  'social.post_published',
  'social.follow_created',
  '*',
] as const;

type ValidEvent = typeof VALID_EVENTS[number];

function isValidEvent(e: string): e is ValidEvent {
  return (VALID_EVENTS as readonly string[]).includes(e);
}

// ---------------------------------------------------------------------------
// GET /webhooks/events — list available event types by plan tier (N-133)
// ---------------------------------------------------------------------------

webhookRoutes.get('/events', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const db = c.env.DB;

  let plan = 'free';
  if (auth.workspaceId) {
    const sub = await db
      .prepare(
        `SELECT plan FROM subscriptions WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT 1`,
      )
      .bind(String(auth.workspaceId), String(auth.tenantId))
      .first<{ plan: string }>();
    if (sub?.plan) plan = sub.plan;
  }

  const tierKey = (plan in TIER_EVENT_REGISTRY ? plan : 'starter') as keyof typeof TIER_EVENT_REGISTRY;
  const availableEvents = TIER_EVENT_REGISTRY[tierKey];
  const limit = WEBHOOK_TIER_LIMITS[plan] ?? WEBHOOK_TIER_LIMITS['starter']!;

  return c.json({
    plan,
    subscription_limit: limit === Infinity ? null : limit,
    available_events: availableEvents,
    all_events: VALID_EVENTS,
  });
});

/**
 * SSRF protection: reject URLs pointing to private/loopback/link-local addresses.
 * Returns an error string if the URL is unsafe, or null if it is safe.
 */
function ssrfCheck(rawUrl: string): string | null {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { return 'url must be a valid URL'; }

  const host = parsed.hostname.toLowerCase();

  // Reject non-http(s) schemes
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return 'url must use http or https';
  }

  // Block loopback addresses
  if (host === 'localhost' || host === '::1') return 'url must not target loopback addresses';

  // Block IPv4 private/loopback ranges
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [, a, b] = ipv4.map(Number) as [number, number, number, number, number];
    if (a === 127 || a === 0 || a === 10) return 'url must not target private or loopback IP ranges';
    if (a === 172 && b >= 16 && b <= 31) return 'url must not target private IP ranges';
    if (a === 192 && b === 168) return 'url must not target private IP ranges';
    if (a === 169 && b === 254) return 'url must not target link-local addresses (AWS metadata)';
    if (a === 100 && b >= 64 && b <= 127) return 'url must not target CGNAT ranges';
  }

  // Block .internal, .local, .localhost TLDs
  if (host.endsWith('.internal') || host.endsWith('.local') || host.endsWith('.localhost')) {
    return 'url must not target internal domains';
  }

  return null; // safe
}

// ---------------------------------------------------------------------------
// POST /webhooks — register a new subscription
// ---------------------------------------------------------------------------

webhookRoutes.post('/', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const db = c.env.DB;

  if (!auth.workspaceId) {
    return c.json({ error: 'workspace_id is required to register a webhook' }, 400);
  }

  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const { url, events, description } = body as {
    url?: unknown;
    events?: unknown;
    description?: unknown;
  };

  if (!url || typeof url !== 'string') {
    return c.json({ error: 'url is required and must be a string' }, 422);
  }

  // Validate URL + SSRF protection
  const ssrfErr = ssrfCheck(url);
  if (ssrfErr) return c.json({ error: ssrfErr }, 422);

  // Validate events
  if (!Array.isArray(events) || events.length === 0) {
    return c.json({ error: 'events must be a non-empty array' }, 422);
  }
  const invalidEvents = (events as unknown[]).filter((e) => typeof e !== 'string' || !isValidEvent(e));
  if (invalidEvents.length > 0) {
    return c.json({
      error: `Invalid event types: ${String(invalidEvents.join(', '))}. Valid: ${VALID_EVENTS.join(', ')}`,
    }, 422);
  }

  // G25: enforce tier-based subscription limit (N-133)
  const subRow = await db
    .prepare(
      `SELECT plan FROM subscriptions WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(String(auth.workspaceId), String(auth.tenantId))
    .first<{ plan: string }>();

  const currentPlan = subRow?.plan ?? 'free';
  const tierLimit = WEBHOOK_TIER_LIMITS[currentPlan] ?? WEBHOOK_TIER_LIMITS['free']!;

  if (isFinite(tierLimit)) {
    const countRow = await db
      .prepare(
        `SELECT COUNT(*) AS cnt FROM webhook_subscriptions WHERE workspace_id = ? AND tenant_id = ? AND active = 1`,
      )
      .bind(String(auth.workspaceId), String(auth.tenantId))
      .first<{ cnt: number }>();

    if ((countRow?.cnt ?? 0) >= tierLimit) {
      return c.json({
        error: `Webhook subscription limit reached for your plan (${currentPlan}: max ${tierLimit})`,
        limit: tierLimit,
        plan: currentPlan,
        upgrade_url: `/workspaces/${String(auth.workspaceId)}/activate`,
      }, 403);
    }
  }

  const id = crypto.randomUUID();
  const secret = crypto.randomUUID() + crypto.randomUUID();  // 72-char random secret
  const now = Math.floor(Date.now() / 1000);

  await db
    .prepare(
      `INSERT INTO webhook_subscriptions
         (id, workspace_id, tenant_id, url, events, secret, active, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    )
    .bind(
      id,
      String(auth.workspaceId),
      String(auth.tenantId),
      url,
      JSON.stringify(events),
      secret,
      description ? String(description) : null,
      now,
      now,
    )
    .run();

  return c.json({
    id,
    workspace_id: String(auth.workspaceId),
    url,
    events,
    secret,   // returned only on creation — store it securely, cannot be retrieved again
    active: true,
    description: description ? String(description) : null,
    created_at: now,
  }, 201);
});

// ---------------------------------------------------------------------------
// GET /webhooks — list subscriptions for the workspace
// ---------------------------------------------------------------------------

webhookRoutes.get('/', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const db = c.env.DB;

  const { results } = await db
    .prepare(
      `SELECT id, workspace_id, url, events, active, description, created_at, updated_at
         FROM webhook_subscriptions
        WHERE workspace_id = ? AND tenant_id = ?
        ORDER BY created_at DESC`,
    )
    .bind(String(auth.workspaceId), String(auth.tenantId))
    .all<{
      id: string;
      workspace_id: string;
      url: string;
      events: string;
      active: number;
      description: string | null;
      created_at: number;
      updated_at: number;
    }>();

  const subscriptions = results.map((r) => ({
    ...r,
    events: (() => { try { return JSON.parse(r.events) as string[]; } catch { return []; } })(),
    active: r.active === 1,
    // secret is NOT returned in list — security
  }));

  return c.json({ subscriptions, total: subscriptions.length });
});

// ---------------------------------------------------------------------------
// GET /webhooks/:id — get a single subscription
// ---------------------------------------------------------------------------

webhookRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const db = c.env.DB;
  const id = c.req.param('id');

  const sub = await db
    .prepare(
      `SELECT id, workspace_id, url, events, active, description, created_at, updated_at
         FROM webhook_subscriptions
        WHERE id = ? AND workspace_id = ? AND tenant_id = ?`,
    )
    .bind(id, String(auth.workspaceId), String(auth.tenantId))
    .first<{
      id: string;
      workspace_id: string;
      url: string;
      events: string;
      active: number;
      description: string | null;
      created_at: number;
      updated_at: number;
    }>();

  if (!sub) return c.json({ error: 'Webhook subscription not found' }, 404);

  return c.json({
    ...sub,
    events: (() => { try { return JSON.parse(sub.events) as string[]; } catch { return []; } })(),
    active: sub.active === 1,
  });
});

// ---------------------------------------------------------------------------
// PATCH /webhooks/:id — update subscription
// ---------------------------------------------------------------------------

webhookRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db
    .prepare('SELECT id FROM webhook_subscriptions WHERE id = ? AND workspace_id = ? AND tenant_id = ?')
    .bind(id, String(auth.workspaceId), String(auth.tenantId))
    .first<{ id: string }>();
  if (!existing) return c.json({ error: 'Webhook subscription not found' }, 404);

  let body: unknown;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON' }, 400); }

  const { url, events, active, description } = body as {
    url?: unknown;
    events?: unknown;
    active?: unknown;
    description?: unknown;
  };

  const updates: string[] = [];
  const binds: unknown[] = [];

  if (url !== undefined) {
    if (typeof url !== 'string') return c.json({ error: 'url must be a string' }, 422);
    // SSRF protection — same check as on creation
    const ssrfErrPatch = ssrfCheck(url);
    if (ssrfErrPatch) return c.json({ error: ssrfErrPatch }, 422);
    updates.push('url = ?');
    binds.push(url);
  }

  if (events !== undefined) {
    if (!Array.isArray(events) || events.length === 0) {
      return c.json({ error: 'events must be a non-empty array' }, 422);
    }
    const invalid = (events as unknown[]).filter((e) => typeof e !== 'string' || !isValidEvent(e));
    if (invalid.length > 0) return c.json({ error: `Invalid event types: ${String(invalid.join(', '))}` }, 422);
    updates.push('events = ?');
    binds.push(JSON.stringify(events));
  }

  if (active !== undefined) {
    if (typeof active !== 'boolean') return c.json({ error: 'active must be boolean' }, 422);
    updates.push('active = ?');
    binds.push(active ? 1 : 0);
  }

  if (description !== undefined) {
    updates.push('description = ?');
    binds.push(description ? String(description) : null);
  }

  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 422);

  const now = Math.floor(Date.now() / 1000);
  updates.push('updated_at = ?');
  binds.push(now, id, String(auth.workspaceId), String(auth.tenantId));

  await db
    .prepare(`UPDATE webhook_subscriptions SET ${updates.join(', ')} WHERE id = ? AND workspace_id = ? AND tenant_id = ?`)
    .bind(...binds)
    .run();

  return c.json({ success: true, updated_at: now });
});

// ---------------------------------------------------------------------------
// DELETE /webhooks/:id — delete a subscription (+ cascades deliveries)
// ---------------------------------------------------------------------------

webhookRoutes.delete('/:id', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const db = c.env.DB;
  const id = c.req.param('id');

  const existing = await db
    .prepare('SELECT id FROM webhook_subscriptions WHERE id = ? AND workspace_id = ? AND tenant_id = ?')
    .bind(id, String(auth.workspaceId), String(auth.tenantId))
    .first<{ id: string }>();
  if (!existing) return c.json({ error: 'Webhook subscription not found' }, 404);

  await db
    .prepare('DELETE FROM webhook_subscriptions WHERE id = ? AND workspace_id = ? AND tenant_id = ?')
    .bind(id, String(auth.workspaceId), String(auth.tenantId))
    .run();

  return c.json({ success: true });
});

// ---------------------------------------------------------------------------
// GET /webhooks/:id/deliveries — delivery history
// ---------------------------------------------------------------------------

webhookRoutes.get('/:id/deliveries', async (c) => {
  const auth = c.get('auth') as AuthContext;
  const db = c.env.DB;
  const id = c.req.param('id');

  // Verify subscription ownership (T3)
  const sub = await db
    .prepare('SELECT id FROM webhook_subscriptions WHERE id = ? AND workspace_id = ? AND tenant_id = ?')
    .bind(id, String(auth.workspaceId), String(auth.tenantId))
    .first<{ id: string }>();
  if (!sub) return c.json({ error: 'Webhook subscription not found' }, 404);

  const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10) || 1);
  const limit = Math.min(50, parseInt(c.req.query('limit') ?? '20', 10) || 20);
  const offset = (page - 1) * limit;

  const { results: deliveries } = await db
    .prepare(
      `SELECT id, event_type, status, attempts, last_error, delivered_at, created_at
         FROM webhook_deliveries
        WHERE subscription_id = ? AND tenant_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?`,
    )
    .bind(id, String(auth.tenantId), limit, offset)
    .all<{
      id: string;
      event_type: string;
      status: string;
      attempts: number;
      last_error: string | null;
      delivered_at: number | null;
      created_at: number;
    }>();

  return c.json({ subscription_id: id, deliveries, page, limit });
});

export { webhookRoutes };
