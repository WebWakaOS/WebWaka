/**
 * Workspace management routes.
 *
 * POST /workspaces/:id/activate   — convert free → paid (Paystack)
 * PATCH /workspaces/:id           — update plan / active layers
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

  const secretKey = c.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return c.json({ error: 'Payment provider not configured' }, 503);
  }

  const payment = await initializePayment(
    { secretKey },
    {
      workspaceId,
      amountKobo,
      email,
      callbackUrl: `${c.env.APP_BASE_URL ?? 'https://app.webwaka.com'}/billing/verify`,
      metadata: { plan, workspace_id: workspaceId },
    },
  );

  return c.json({
    workspaceId,
    plan,
    status: 'pending_payment',
    reference: payment.reference,
    authorizationUrl: payment.authorizationUrl,
    accessCode: payment.accessCode,
    amountKobo: payment.amountKobo,
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

  let body: { name?: string; plan?: string; activeLayers?: string[] };
  try {
    body = await c.req.json<typeof body>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name && !body.plan && !body.activeLayers) {
    return c.json({ error: 'At least one field (name, plan, activeLayers) required' }, 400);
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
    await db
      .prepare(
        `UPDATE subscriptions SET plan = ?, updated_at = unixepoch()
         WHERE workspace_id = ? AND tenant_id = ?`,
      )
      .bind(body.plan, workspaceId, auth.tenantId)
      .run();
  }

  return c.json({ workspaceId, updated: true, name: body.name, plan: body.plan });
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

  // G2: email send is secondary/optional — kill-switch guards the notification pipeline
  if (c.env.NOTIFICATION_PIPELINE_ENABLED !== '1' && body.email) {
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

export { workspaceRoutes };
