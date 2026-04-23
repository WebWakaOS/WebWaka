/**
 * Workspace management routes.
 *
 * POST /workspaces/:id/activate   — convert free → paid (Paystack)
 * PATCH /workspaces/:id           — update plan / active layers / bank account
 * POST  /workspaces/:id/invite    — invite user → membership (MON-04: user limit)
 * POST  /workspaces/:id/offerings — create offering (MON-04: offering limit)
 * POST  /workspaces/:id/places    — create org/branch (MON-04: place limit)
 * GET   /workspaces/:id/analytics — basic usage metrics
 *
 * Platform Invariants:
 *   T3 — tenant_id on all queries
 *   T5 — entitlement checks gating layer updates
 *   MON-04 — free tier limits enforced on invite/offerings/places
 *   All routes require auth
 *
 * Milestone 5 — Workspace Activation + Management
 */

import { Hono } from 'hono';
import { Role } from '@webwaka/types';
import type { WorkspaceId, UserId, Subscription } from '@webwaka/types';
import { asId } from '@webwaka/types';
import { getWorkspaceById, addMember } from '@webwaka/entities';
import { initializePayment } from '@webwaka/payments';
import { evaluateUserLimit, evaluateOfferingLimit, evaluatePlaceLimit } from '@webwaka/entitlements';
import type { Env } from '../env.js';
import { WebhookDispatcher } from '../lib/webhook-dispatcher.js';
import { EmailService } from '../lib/email-service.js';
import { indexOffering } from '../lib/search-index.js';
import { publishEvent } from '../lib/publish-event.js';
import { WorkspaceEventType } from '@webwaka/events';

const workspaceRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Shared D1Like type
// ---------------------------------------------------------------------------

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<{ success: boolean }>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
  batch(statements: unknown[]): Promise<unknown[]>;
}

// ---------------------------------------------------------------------------
// Subscription limit helpers (MON-04)
// ---------------------------------------------------------------------------

async function fetchPlanSubscription(
  db: D1Like,
  tenantId: string,
  workspaceId: string,
): Promise<{ plan: string; status: string } | null> {
  return db
    .prepare(
      `SELECT plan, status FROM subscriptions
       WHERE workspace_id = ? AND tenant_id = ?
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(workspaceId, tenantId)
    .first<{ plan: string; status: string }>();
}

function toSubscription(row: { plan: string; status: string }): Subscription {
  return row as unknown as Subscription;
}

// ---------------------------------------------------------------------------
// POST /workspaces/:id/activate — Paystack stub
// Converts a workspace from free → starter plan. Payment processor is deferred (M6).
// ---------------------------------------------------------------------------

workspaceRoutes.post('/:id/activate', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('id') as WorkspaceId;
  const db = c.env.DB as unknown as D1Like;

  const workspace = await getWorkspaceById(db as Parameters<typeof getWorkspaceById>[0], auth.tenantId, workspaceId);

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  if ((workspace.ownerId as string) !== (auth.userId as string)) {
    return c.json({ error: 'Only the workspace owner can activate' }, 403);
  }

  let body: { email?: string; plan?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    body = {};
  }

  const email = body.email;
  if (!email) {
    return c.json({ error: 'email is required for payment initialization' }, 400);
  }

  const plan = body.plan ?? 'starter';
  const validPlans = ['starter', 'growth', 'enterprise'];
  if (!validPlans.includes(plan)) {
    return c.json({ error: `Invalid plan. Must be one of: ${validPlans.join('|')}` }, 400);
  }

  const PLAN_AMOUNTS: Record<string, number> = {
    starter: 5_000_00,
    growth: 20_000_00,
    enterprise: 100_000_00,
  };
  const amountKobo = PLAN_AMOUNTS[plan] ?? PLAN_AMOUNTS['starter']!;

  // ── Bank transfer (manual) mode ─────────────────────────────────────────────
  const isManualMode = !c.env.PAYSTACK_SECRET_KEY ||
    (c.env.DEFAULT_PAYMENT_MODE ?? 'bank_transfer') === 'bank_transfer';

  if (isManualMode) {
    let bankAccount: { bank_name: string; account_number: string; account_name: string; sort_code?: string } = {
      bank_name: 'Not configured', account_number: 'N/A', account_name: 'N/A',
    };
    // Priority: WALLET_KV platform:payment:bank_account → PLATFORM_BANK_ACCOUNT_JSON env fallback
    try {
      const kvRaw = c.env.WALLET_KV ? await c.env.WALLET_KV.get('platform:payment:bank_account') : null;
      if (kvRaw) {
        bankAccount = JSON.parse(kvRaw) as typeof bankAccount;
      } else if (c.env.PLATFORM_BANK_ACCOUNT_JSON) {
        bankAccount = JSON.parse(c.env.PLATFORM_BANK_ACCOUNT_JSON) as typeof bankAccount;
      }
    } catch { /* keep default */ }

    const wsSuffix  = workspaceId.replace(/-/g, '').slice(-8).toUpperCase();
    const rand      = Math.random().toString(36).slice(2, 7).toUpperCase();
    const reference = `WKUP-${wsSuffix}-${rand}`;
    const naira     = (amountKobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    const requestId = crypto.randomUUID().replace(/-/g, '');

    // Persist the upgrade request so the platform admin can confirm or reject it.
    await db
      .prepare(
        `INSERT OR IGNORE INTO workspace_upgrade_requests
           (id, workspace_id, tenant_id, plan, amount_kobo, reference,
            requester_email, status, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      )
      .bind(requestId, workspaceId, auth.tenantId, plan, amountKobo, reference,
            email ?? null, expiresAt)
      .run();

    return c.json({
      payment_mode:  'bank_transfer',
      upgrade_request_id: requestId,
      workspaceId,
      plan,
      amount_kobo:   amountKobo,
      amount_naira:  naira,
      reference,
      narration:     `WebWaka Plan Upgrade - ${reference}`,
      bank_account:  bankAccount,
      instructions:  `Transfer ₦${naira} to the account above. Use the reference ${reference} as your payment narration. Your workspace plan will be activated within 1 business day after payment confirmation by the platform team.`,
      expires_at:    expiresAt,
    }, 200);
  }

  // ── Paystack (online) mode ───────────────────────────────────────────────────
  const payment = await initializePayment(
    { secretKey: c.env.PAYSTACK_SECRET_KEY! },
    {
      workspaceId,
      amountKobo,
      email,
      callbackUrl: `${c.env.APP_BASE_URL ?? 'https://app.webwaka.com'}/billing/verify`,
      metadata: { plan, workspace_id: workspaceId },
    },
  );

  return c.json({
    payment_mode:      'paystack',
    workspaceId,
    plan,
    status:            'pending_payment',
    reference:         payment.reference,
    authorization_url: payment.authorizationUrl,
    access_code:       payment.accessCode,
    amount_kobo:       payment.amountKobo,
  }, 200);
});

// ---------------------------------------------------------------------------
// PATCH /workspaces/:id — Update plan and/or active layers
// ---------------------------------------------------------------------------

workspaceRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('id') as WorkspaceId;
  const db = c.env.DB as unknown as D1Like;

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const workspace = await getWorkspaceById(db as Parameters<typeof getWorkspaceById>[0], auth.tenantId, workspaceId);

  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  interface WorkspacePatchBody {
    name?:                  string;
    plan?:                  string;
    activeLayers?:          string[];
    defaultPaymentMethod?:  string;
    bankAccount?: {
      bank_name:      string;
      account_number: string;
      account_name:   string;
      bank_code?:     string;
      sort_code?:     string;
    };
  }

  let body: WorkspacePatchBody;
  try {
    body = await c.req.json<WorkspacePatchBody>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name && !body.plan && !body.activeLayers && !body.defaultPaymentMethod && !body.bankAccount) {
    return c.json({ error: 'At least one field (name, plan, activeLayers, defaultPaymentMethod, bankAccount) required' }, 400);
  }

  if (body.name !== undefined) {
    await db
      .prepare('UPDATE workspaces SET name = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?')
      .bind(body.name, workspaceId, auth.tenantId)
      .run();
  }

  if (body.plan !== undefined) {
    const validPlans = ['free', 'starter', 'growth', 'enterprise'];
    if (!validPlans.includes(body.plan)) {
      return c.json({ error: `Invalid plan. Must be one of: ${validPlans.join('|')}` }, 400);
    }
    // BUG-WS-03 fix: use INSERT OR REPLACE (upsert) so that a missing subscription
    // row (workspace created before subscriptions table existed) doesn't silently
    // drop the update.  REPLACE keeps atomicity without an extra read.
    await db
      .prepare(
        `INSERT INTO subscriptions (workspace_id, tenant_id, plan, created_at, updated_at)
         VALUES (?, ?, ?, unixepoch(), unixepoch())
         ON CONFLICT(workspace_id, tenant_id) DO UPDATE SET
           plan = excluded.plan,
           updated_at = excluded.updated_at`,
      )
      .bind(workspaceId, auth.tenantId, body.plan)
      .run();
  }

  // Bug fix: activeLayers was fired in the event but never persisted to the DB.
  if (body.activeLayers !== undefined) {
    const validLayers = ['discovery', 'operations', 'commerce', 'community', 'government'];
    const invalid = body.activeLayers.filter(l => !validLayers.includes(l));
    if (invalid.length > 0) {
      return c.json({ error: `Invalid layer(s): ${invalid.join(', ')}. Valid: ${validLayers.join('|')}` }, 400);
    }
    await db
      .prepare('UPDATE workspaces SET active_layers = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?')
      .bind(JSON.stringify(body.activeLayers), workspaceId, auth.tenantId)
      .run();
  }

  if (body.defaultPaymentMethod !== undefined) {
    const validMethods = ['bank_transfer', 'card', 'cash', 'ussd'];
    if (!validMethods.includes(body.defaultPaymentMethod)) {
      return c.json({ error: `Invalid defaultPaymentMethod. Must be one of: ${validMethods.join('|')}` }, 400);
    }
    await db
      .prepare('UPDATE workspaces SET default_payment_method = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?')
      .bind(body.defaultPaymentMethod, workspaceId, auth.tenantId)
      .run();
  }

  // Per-workspace receiving bank account (for workspace owner's own business payments).
  // This is different from the platform bank account (where subscription fees are paid to WebWaka).
  if (body.bankAccount !== undefined) {
    const ba = body.bankAccount;
    if (!ba.bank_name || !ba.account_number || !ba.account_name) {
      return c.json({ error: 'bankAccount requires bank_name, account_number, and account_name' }, 400);
    }
    if (!/^\d{10}$/.test(ba.account_number)) {
      return c.json({ error: 'bankAccount.account_number must be exactly 10 digits (Nigerian NUBAN format)' }, 400);
    }
    await db
      .prepare('UPDATE workspaces SET payment_bank_account_json = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?')
      .bind(JSON.stringify(ba), workspaceId, auth.tenantId)
      .run();
  }

  // N-081: workspace.settings_changed event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: WorkspaceEventType.WorkspaceSettingsChanged,
    tenantId: auth.tenantId,
    actorId: auth.userId as string,
    actorType: 'user',
    workspaceId,
    payload: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.plan !== undefined ? { plan: body.plan } : {}),
      ...(body.activeLayers !== undefined ? { active_layers: body.activeLayers } : {}),
      ...(body.defaultPaymentMethod !== undefined ? { default_payment_method: body.defaultPaymentMethod } : {}),
      ...(body.bankAccount !== undefined ? { bank_account_updated: true } : {}),
    },
    source: 'api',
    severity: 'info',
  });
  return c.json({
    workspaceId,
    updated: true,
    name:                  body.name,
    plan:                  body.plan,
    activeLayers:          body.activeLayers,
    defaultPaymentMethod:  body.defaultPaymentMethod,
    bankAccountUpdated:    body.bankAccount !== undefined,
  });
});

// ---------------------------------------------------------------------------
// POST /workspaces/:id/invite — Invite a user to join the workspace
// ---------------------------------------------------------------------------

workspaceRoutes.post('/:id/invite', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('id') as WorkspaceId;
  const db = c.env.DB as unknown as D1Like;

  const workspace = await getWorkspaceById(db as Parameters<typeof getWorkspaceById>[0], auth.tenantId, workspaceId);
  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  if (auth.role !== 'admin' && auth.role !== 'super_admin' && (workspace.ownerId as string) !== (auth.userId as string)) {
    return c.json({ error: 'Only workspace owners or admins can invite members' }, 403);
  }

  let body: { userId?: string; email?: string; role?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.userId && !body.email) {
    return c.json({ error: 'userId or email is required' }, 400);
  }

  // MON-04: enforce user limit before adding member
  const sub = await fetchPlanSubscription(db, auth.tenantId, workspaceId);
  if (sub) {
    const memberCount = await db
      .prepare(`SELECT COUNT(*) AS cnt FROM memberships WHERE workspace_id = ? AND tenant_id = ?`)
      .bind(workspaceId, auth.tenantId)
      .first<{ cnt: number }>();
    // evaluateUserLimit uses >= so passing the current member count is correct:
    // 2 >= 3 → allowed, 3 >= 3 → blocked.  The +1 that was previously here over-blocked
    // (a workspace with 2/3 members got a 403) — removed in favour of the correct >= check.
    const decision = evaluateUserLimit(toSubscription(sub), memberCount?.cnt ?? 0);
    if (!decision.allowed) {
      return c.json({
        error: decision.reason ?? 'User limit reached for your current plan',
        limit_exceeded: true,
        upgrade_url: `/workspaces/${workspaceId}/activate`,
      }, 403);
    }
  }

  const roleValue = body.role ?? 'member';
  const validRoles: string[] = Object.values(Role);
  if (!validRoles.includes(roleValue)) {
    return c.json({ error: `Invalid role. Must be one of: ${validRoles.join('|')}` }, 400);
  }

  const userId = body.userId ?? `usr_pending_${crypto.randomUUID().replace(/-/g, '')}`;

  await addMember(
    db as Parameters<typeof addMember>[0],
    auth.tenantId,
    workspaceId,
    asId<UserId>(userId),
    roleValue as Role,
  );

  // PROD-04: webhook dispatch (best effort)
  const inviteDispatcher = new WebhookDispatcher(c.env.DB, auth.tenantId);
  void inviteDispatcher.dispatch('workspace.member_added', {
    workspace_id: workspaceId,
    user_id: userId,
    role: roleValue,
    invited_by: auth.userId,
  }).catch(() => {});

  // N-081: workspace.invite_sent event (publishEvent is primary; email is best-effort secondary)
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: WorkspaceEventType.WorkspaceInviteSent,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId,
    payload: { workspace_id: workspaceId, invitee_id: userId, role: roleValue, has_email: !!body.email },
    source: 'api',
    severity: 'info',
  });

  // G2: email send is secondary/optional — kill-switch guards the notification pipeline.
  // BUG-WS-01 fix: was `!== '1'` (inverted), meaning email was sent only when the
  // pipeline was DISABLED.  Corrected to `=== '1'` so email fires when pipeline is ON.
  if (c.env.NOTIFICATION_PIPELINE_ENABLED === '1' && body.email) {
    const emailService = new EmailService(c.env.RESEND_API_KEY);
    void emailService.sendTransactional(body.email, 'workspace-invite', {
      inviter_name: String(auth.userId),
      workspace_name: workspace.name ?? workspaceId,
      invite_url: `${c.env.APP_BASE_URL ?? 'https://app.webwaka.com'}/join/${workspaceId}`,
      expires_in_hours: 48,
    }).catch(() => {});
  }

  return c.json({
    workspaceId,
    userId,
    role: roleValue,
    invited: true,
    invite_email_queued: !!body.email,
  }, 201);
});

// ---------------------------------------------------------------------------
// POST /workspaces/:id/offerings — create an offering (MON-04: limit check)
// ---------------------------------------------------------------------------

workspaceRoutes.post('/:id/offerings', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('id') as WorkspaceId;
  const db = c.env.DB as unknown as D1Like;

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const workspace = await getWorkspaceById(db as Parameters<typeof getWorkspaceById>[0], auth.tenantId, workspaceId);
  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  let body: {
    name?: string;
    description?: string;
    price_kobo?: number;
    sort_order?: number;
    is_published?: boolean;
  };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return c.json({ error: 'name is required' }, 400);
  }

  // P9: price_kobo must be a non-negative integer
  if (body.price_kobo !== undefined) {
    if (!Number.isInteger(body.price_kobo) || body.price_kobo < 0) {
      return c.json({ error: 'price_kobo must be a non-negative integer (P9)' }, 422);
    }
  }

  // MON-04: enforce offering limit before creation
  const sub = await fetchPlanSubscription(db, auth.tenantId, workspaceId);
  if (sub) {
    const offeringCount = await db
      .prepare(
        `SELECT COUNT(*) AS cnt FROM offerings WHERE workspace_id = ? AND tenant_id = ? AND is_published = 1`,
      )
      .bind(workspaceId, auth.tenantId)
      .first<{ cnt: number }>();
    const decision = evaluateOfferingLimit(toSubscription(sub), offeringCount?.cnt ?? 0);
    if (!decision.allowed) {
      return c.json({
        error: decision.reason ?? 'Offering limit reached for your current plan',
        limit_exceeded: true,
        upgrade_url: `/workspaces/${workspaceId}/activate`,
      }, 403);
    }
  }

  const offeringId = `off_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const isPublished = body.is_published !== false ? 1 : 0;

  await db
    .prepare(
      `INSERT INTO offerings (id, tenant_id, workspace_id, name, description, price_kobo, sort_order, is_published, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      offeringId,
      auth.tenantId,
      workspaceId,
      body.name.trim(),
      body.description ?? null,
      body.price_kobo ?? 0,
      body.sort_order ?? 0,
      isPublished,
    )
    .run();

  // P4-C: Sync to search index (non-fatal — search unavailability must not break offering creation)
  try {
    await indexOffering(db, {
      id: offeringId,
      name: body.name.trim(),
      description: body.description ?? null,
      category: null,
      tenantId: auth.tenantId,
      workspaceId,
      isPublished: isPublished === 1,
    });
  } catch (err) {
    console.error('[search-index] indexOffering failed (non-fatal):', err);
  }

  return c.json({
    offering_id: offeringId,
    workspace_id: workspaceId,
    name: body.name.trim(),
    price_kobo: body.price_kobo ?? 0,
    is_published: isPublished === 1,
    created: true,
  }, 201);
});

// ---------------------------------------------------------------------------
// POST /workspaces/:id/places — register a managed place/branch (MON-04)
// ---------------------------------------------------------------------------

workspaceRoutes.post('/:id/places', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('id') as WorkspaceId;
  const db = c.env.DB as unknown as D1Like;

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const workspace = await getWorkspaceById(db as Parameters<typeof getWorkspaceById>[0], auth.tenantId, workspaceId);
  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  let body: {
    name?: string;
    category?: string;
    place_id?: string;
    address?: string;
    phone?: string;
    is_published?: boolean;
  };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return c.json({ error: 'name is required' }, 400);
  }

  // MON-04: enforce place limit before creation
  const sub = await fetchPlanSubscription(db, auth.tenantId, workspaceId);
  if (sub) {
    const placeCount = await db
      .prepare(
        `SELECT COUNT(*) AS cnt FROM organizations WHERE workspace_id = ? AND tenant_id = ?`,
      )
      .bind(workspaceId, auth.tenantId)
      .first<{ cnt: number }>();
    const decision = evaluatePlaceLimit(toSubscription(sub), placeCount?.cnt ?? 0);
    if (!decision.allowed) {
      return c.json({
        error: decision.reason ?? 'Place limit reached for your current plan',
        limit_exceeded: true,
        upgrade_url: `/workspaces/${workspaceId}/activate`,
      }, 403);
    }
  }

  const orgId = `org_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  const isPublished = body.is_published !== false ? 1 : 0;

  await db
    .prepare(
      `INSERT INTO organizations (id, tenant_id, workspace_id, name, category, place_id, is_published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      orgId,
      auth.tenantId,
      workspaceId,
      body.name.trim(),
      body.category ?? 'Business',
      body.place_id ?? null,
      isPublished,
    )
    .run();

  return c.json({
    organization_id: orgId,
    workspace_id: workspaceId,
    name: body.name.trim(),
    category: body.category ?? 'Business',
    is_published: isPublished === 1,
    created: true,
  }, 201);
});

// ---------------------------------------------------------------------------
// GET /workspaces/:id/analytics — Basic usage metrics
// ---------------------------------------------------------------------------

workspaceRoutes.get('/:id/analytics', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('id') as WorkspaceId;
  const db = c.env.DB as unknown as D1Like;

  const workspace = await getWorkspaceById(db as Parameters<typeof getWorkspaceById>[0], auth.tenantId, workspaceId);
  if (!workspace) {
    return c.json({ error: 'Workspace not found' }, 404);
  }

  // Member count
  const memberCount = await db
    .prepare('SELECT COUNT(*) AS cnt FROM memberships WHERE workspace_id = ? AND tenant_id = ?')
    .bind(workspaceId, auth.tenantId)
    .first<{ cnt: number }>();

  // Entity counts (individuals + organizations in this tenant)
  const individualCount = await db
    .prepare('SELECT COUNT(*) AS cnt FROM individuals WHERE tenant_id = ?')
    .bind(auth.tenantId)
    .first<{ cnt: number }>();

  const orgCount = await db
    .prepare('SELECT COUNT(*) AS cnt FROM organizations WHERE tenant_id = ?')
    .bind(auth.tenantId)
    .first<{ cnt: number }>();

  // Pending claim requests for this workspace's entities
  // SEC-003: Scoped to tenant — previously returned platform-wide count
  const pendingClaims = await db
    .prepare(
      `SELECT COUNT(*) AS cnt FROM claim_requests cr
       JOIN profiles p ON p.id = cr.profile_id
       WHERE cr.status = 'pending' AND (cr.tenant_id = ? OR cr.tenant_id IS NULL)`,
    )
    .bind(auth.tenantId)
    .first<{ cnt: number }>();

  return c.json({
    workspaceId,
    tenantId: auth.tenantId,
    metrics: {
      members: memberCount?.cnt ?? 0,
      individuals: individualCount?.cnt ?? 0,
      organizations: orgCount?.cnt ?? 0,
      pendingClaimRequests: pendingClaims?.cnt ?? 0,
    },
    generatedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// DELETE /workspaces/:id/members/:userId — Remove a member (N-081/T2)
// workspace.member_removed event
// ---------------------------------------------------------------------------

workspaceRoutes.delete('/:id/members/:userId', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('id') as WorkspaceId;
  const targetUserId = c.req.param('userId');
  const db = c.env.DB as unknown as D1Like;

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    const workspace = await getWorkspaceById(db as Parameters<typeof getWorkspaceById>[0], auth.tenantId, workspaceId);
    if (!workspace || (workspace.ownerId as string) !== (auth.userId as string)) {
      return c.json({ error: 'Admin role or workspace ownership required' }, 403);
    }
  }

  // Prevent self-removal
  if (targetUserId === (auth.userId as string)) {
    return c.json({ error: 'Cannot remove yourself from the workspace' }, 422);
  }

  const existing = await db
    .prepare('SELECT id FROM memberships WHERE workspace_id = ? AND user_id = ? AND tenant_id = ?')
    .bind(workspaceId, targetUserId, auth.tenantId)
    .first<{ id: string }>();

  if (!existing) {
    return c.json({ error: 'Member not found in this workspace' }, 404);
  }

  await db
    .prepare('DELETE FROM memberships WHERE workspace_id = ? AND user_id = ? AND tenant_id = ?')
    .bind(workspaceId, targetUserId, auth.tenantId)
    .run();

  // N-081/T2: workspace.member_removed event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: WorkspaceEventType.WorkspaceMemberRemoved,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId,
    payload: { removed_user_id: targetUserId, removed_by: auth.userId },
    source: 'api',
    severity: 'warning',
  });

  return c.json({ workspaceId, removedUserId: targetUserId, removed: true });
});

// ---------------------------------------------------------------------------
// PATCH /workspaces/:id/members/:userId/role — Change a member's role (N-081/T2)
// workspace.role_changed event
// ---------------------------------------------------------------------------

workspaceRoutes.patch('/:id/members/:userId/role', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('id') as WorkspaceId;
  const targetUserId = c.req.param('userId');
  const db = c.env.DB as unknown as D1Like;

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required to change member roles' }, 403);
  }

  let body: { role?: string };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const newRole = body.role;
  if (!newRole) {
    return c.json({ error: 'role is required' }, 400);
  }
  const validRoles: string[] = Object.values(Role);
  if (!validRoles.includes(newRole)) {
    return c.json({ error: `Invalid role. Must be one of: ${validRoles.join('|')}` }, 400);
  }

  const existing = await db
    .prepare('SELECT id, role FROM memberships WHERE workspace_id = ? AND user_id = ? AND tenant_id = ?')
    .bind(workspaceId, targetUserId, auth.tenantId)
    .first<{ id: string; role: string }>();

  if (!existing) {
    return c.json({ error: 'Member not found in this workspace' }, 404);
  }

  const previousRole = existing.role;

  await db
    .prepare('UPDATE memberships SET role = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?')
    .bind(newRole, existing.id, auth.tenantId)
    .run();

  // N-081/T2: workspace.role_changed event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: WorkspaceEventType.WorkspaceRoleChanged,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId,
    payload: { target_user_id: targetUserId, previous_role: previousRole, new_role: newRole },
    source: 'api',
    severity: 'info',
  });

  return c.json({ workspaceId, userId: targetUserId, previousRole, newRole, updated: true });
});

export { workspaceRoutes };
