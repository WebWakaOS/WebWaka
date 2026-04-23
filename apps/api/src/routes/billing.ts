/**
 * Billing & Subscription Management Routes — Sprint 7/PROD-09 + Phase 17/MON-05
 *
 * Routes:
 *   GET  /billing/status               — get current billing/subscription status
 *   POST /billing/enforce              — admin-only: run enforcement check
 *   POST /billing/reactivate           — reactivate a suspended subscription after payment
 *   POST /billing/change-plan          — upgrade or downgrade plan (MON-05)
 *   POST /billing/cancel               — cancel subscription at period end (MON-05)
 *   POST /billing/revert-cancel        — undo a scheduled cancellation (MON-05)
 *   GET  /billing/history              — plan change history for the workspace (MON-05)
 *
 * Platform Invariants:
 *   T3 — tenant_id always from JWT, never user input
 *   All routes require auth (mounted with authMiddleware in router.ts)
 *
 * Plan hierarchy (ascending):
 *   free < starter < growth < enterprise
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import { publishEvent } from '../lib/publish-event.js';
import { BillingEventType, WorkspaceEventType } from '@webwaka/events';

type Auth = { userId: string; tenantId: string; role?: string; workspaceId?: string };

const GRACE_PERIOD_SECONDS = 7 * 24 * 60 * 60;

const PLAN_RANK: Record<string, number> = {
  free: 0,
  starter: 1,
  growth: 2,
  enterprise: 3,
};

const VALID_PLANS = Object.keys(PLAN_RANK);

const billingRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Helper — resolve caller's active subscription (workspace-scoped or tenant-scoped)
// ---------------------------------------------------------------------------

interface Subscription {
  id: string;
  workspace_id: string;
  plan: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  grace_period_end: number | null;
  enforcement_status: string;
  cancel_at_period_end: number;
  updated_at: number;
}

async function resolveSubscription(
  db: Env['DB'],
  auth: Auth,
): Promise<Subscription | null> {
  if (auth.workspaceId) {
    const sub = await db
      .prepare(
        `SELECT id, workspace_id, plan, status, current_period_start, current_period_end,
                grace_period_end, enforcement_status, cancel_at_period_end, updated_at
         FROM subscriptions WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`,
      )
      .bind(auth.workspaceId, auth.tenantId)
      .first<Subscription>();
    if (sub) return sub;
  }
  return db
    .prepare(
      `SELECT id, workspace_id, plan, status, current_period_start, current_period_end,
              grace_period_end, enforcement_status, cancel_at_period_end, updated_at
       FROM subscriptions WHERE tenant_id = ? LIMIT 1`,
    )
    .bind(auth.tenantId)
    .first<Subscription>();
}

async function recordPlanHistory(
  db: Env['DB'],
  opts: {
    subscriptionId: string;
    workspaceId: string;
    tenantId: string;
    changedBy: string;
    previousPlan: string;
    newPlan: string;
    changeType: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate' | 'revert_cancel';
    effectiveAt: number;
    notes?: string;
  },
): Promise<void> {
  const id = `sph_${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO subscription_plan_history
         (id, subscription_id, workspace_id, tenant_id, changed_by, previous_plan, new_plan,
          change_type, effective_at, created_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), ?)`,
    )
    .bind(
      id,
      opts.subscriptionId,
      opts.workspaceId,
      opts.tenantId,
      opts.changedBy,
      opts.previousPlan,
      opts.newPlan,
      opts.changeType,
      opts.effectiveAt,
      opts.notes ?? null,
    )
    .run();
}

// ---------------------------------------------------------------------------
// GET /billing/status
// ---------------------------------------------------------------------------

billingRoutes.get('/status', async (c) => {
  const auth = c.get('auth') as Auth;
  const sub = await resolveSubscription(c.env.DB, auth);

  if (!sub) {
    return c.json({
      tenantId: auth.tenantId,
      plan: 'free',
      status: 'active',
      enforcement_status: 'none',
      message: 'No subscription found — using free plan.',
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const daysUntilExpiry =
    sub.current_period_end > 0
      ? Math.ceil((sub.current_period_end - now) / 86400)
      : null;

  return c.json({
    tenantId: auth.tenantId,
    workspaceId: sub.workspace_id,
    plan: sub.plan,
    status: sub.status,
    enforcement_status: sub.enforcement_status,
    current_period_start: sub.current_period_start,
    current_period_end: sub.current_period_end,
    grace_period_end: sub.grace_period_end,
    cancel_at_period_end: sub.cancel_at_period_end === 1,
    days_until_expiry: daysUntilExpiry,
    updated_at: sub.updated_at,
  });
});

// ---------------------------------------------------------------------------
// POST /billing/enforce  (admin only)
// ---------------------------------------------------------------------------

billingRoutes.post('/enforce', async (c) => {
  const auth = c.get('auth') as Auth;

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required', code: 'FORBIDDEN' }, 403);
  }

  const db = c.env.DB;
  const now = Math.floor(Date.now() / 1000);
  const tenantId = auth.tenantId;

  const expiredActive = await db
    .prepare(
      `SELECT id, workspace_id, tenant_id, plan, current_period_end
       FROM subscriptions
       WHERE tenant_id = ? AND status = 'active' AND plan != 'free'
         AND current_period_end > 0 AND current_period_end < ?`,
    )
    .bind(tenantId, now)
    .all<{
      id: string;
      workspace_id: string;
      tenant_id: string;
      plan: string;
      current_period_end: number;
    }>();

  let transitionsToGrace = 0;
  for (const sub of expiredActive.results ?? []) {
    const gracePeriodEnd = sub.current_period_end + GRACE_PERIOD_SECONDS;
    await db
      .prepare(
        `UPDATE subscriptions SET status = 'past_due', enforcement_status = 'grace_period',
         grace_period_end = ?, last_enforcement_at = ?, updated_at = ?
         WHERE id = ? AND tenant_id = ? AND status = 'active'`,
      )
      .bind(gracePeriodEnd, now, now, sub.id, tenantId)
      .run();
    // N-082: billing.trial_ending for grace-period transition
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: BillingEventType.BillingTrialEnding,
      tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: sub.workspace_id,
      payload: { subscription_id: sub.id, plan: sub.plan, grace_period_end: gracePeriodEnd },
      source: 'api',
      severity: 'warning',
    });
    transitionsToGrace++;
  }

  const expiredGrace = await db
    .prepare(
      `SELECT id, workspace_id, tenant_id
       FROM subscriptions
       WHERE tenant_id = ? AND enforcement_status = 'grace_period'
         AND grace_period_end IS NOT NULL AND grace_period_end < ?`,
    )
    .bind(tenantId, now)
    .all<{ id: string; workspace_id: string; tenant_id: string }>();

  let transitionsToSuspended = 0;
  for (const sub of expiredGrace.results ?? []) {
    await db
      .prepare(
        `UPDATE subscriptions SET status = 'suspended', enforcement_status = 'suspended',
         last_enforcement_at = ?, updated_at = ?
         WHERE id = ? AND tenant_id = ? AND enforcement_status = 'grace_period'`,
      )
      .bind(now, now, sub.id, tenantId)
      .run();
    // N-082: billing.trial_expired for suspension transition
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: BillingEventType.BillingTrialExpired,
      tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: sub.workspace_id,
      payload: { subscription_id: sub.id },
      source: 'api',
      severity: 'critical',
    });

    // N-081/T2: workspace.suspended — billing enforcement suspended this workspace
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: WorkspaceEventType.WorkspaceSuspended,
      tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: sub.workspace_id,
      payload: { subscription_id: sub.id, reason: 'grace_period_expired' },
      source: 'api',
      severity: 'critical',
    });
    transitionsToSuspended++;
  }

  return c.json({
    enforced_at: new Date(now * 1000).toISOString(),
    transitions: {
      active_to_grace: transitionsToGrace,
      grace_to_suspended: transitionsToSuspended,
    },
    total_processed: transitionsToGrace + transitionsToSuspended,
  });
});

// ---------------------------------------------------------------------------
// POST /billing/reactivate
// ---------------------------------------------------------------------------

billingRoutes.post('/reactivate', async (c) => {
  const auth = c.get('auth') as Auth;
  const db = c.env.DB;

  const sub = await resolveSubscription(db, auth);
  if (!sub) {
    return c.json({ error: 'No subscription found', code: 'NOT_FOUND' }, 404);
  }

  if (sub.status === 'active' && sub.enforcement_status === 'none') {
    return c.json({ message: 'Subscription is already active', status: 'active' });
  }

  const recentPayment = await db
    .prepare(
      `SELECT id FROM billing_history
       WHERE workspace_id = ? AND tenant_id = ? AND status = 'success'
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(sub.workspace_id, auth.tenantId)
    .first<{ id: string }>();

  if (!recentPayment) {
    return c.json(
      {
        error: 'No successful payment found. Please make a payment before reactivating.',
        code: 'PAYMENT_REQUIRED',
      },
      402,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const periodEnd = now + 30 * 24 * 60 * 60;

  await db
    .prepare(
      `UPDATE subscriptions SET status = 'active', enforcement_status = 'none',
       grace_period_end = NULL, current_period_start = ?, current_period_end = ?,
       cancel_at_period_end = 0, last_enforcement_at = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(now, periodEnd, now, now, sub.id, auth.tenantId)
    .run();

  await recordPlanHistory(db, {
    subscriptionId: sub.id,
    workspaceId: sub.workspace_id,
    tenantId: auth.tenantId,
    changedBy: auth.userId,
    previousPlan: sub.plan,
    newPlan: sub.plan,
    changeType: 'reactivate',
    effectiveAt: now,
  });

  // N-082: billing.subscription_renewed for reactivation
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: BillingEventType.BillingSubscriptionRenewed,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: sub.workspace_id,
    payload: { subscription_id: sub.id, plan: sub.plan, change_type: 'reactivate' },
    source: 'api',
    severity: 'info',
  });

  return c.json({
    reactivated: true,
    status: 'active',
    new_period_end: new Date(periodEnd * 1000).toISOString(),
  });
});

// ---------------------------------------------------------------------------
// POST /billing/change-plan  (MON-05)
// Handles both upgrades and downgrades. Upgrades take effect immediately;
// downgrades take effect at the end of the current billing period.
// ---------------------------------------------------------------------------

billingRoutes.post('/change-plan', async (c) => {
  const auth = c.get('auth') as Auth;
  const db = c.env.DB;

  let body: { plan?: string; notes?: string };
  try {
    body = await c.req.json<{ plan?: string; notes?: string }>();
  } catch {
    return c.json({ error: 'Invalid JSON body', code: 'BAD_REQUEST' }, 400);
  }

  const { plan: newPlan, notes } = body;

  if (!newPlan || !VALID_PLANS.includes(newPlan)) {
    return c.json(
      {
        error: `Invalid plan. Valid plans: ${VALID_PLANS.join(', ')}`,
        code: 'INVALID_PLAN',
      },
      422,
    );
  }

  const sub = await resolveSubscription(db, auth);
  if (!sub) {
    return c.json({ error: 'No subscription found', code: 'NOT_FOUND' }, 404);
  }

  if (sub.status === 'suspended') {
    return c.json(
      {
        error: 'Cannot change plan on a suspended subscription. Reactivate first.',
        code: 'SUBSCRIPTION_SUSPENDED',
      },
      403,
    );
  }

  const currentPlan = sub.plan;
  if (currentPlan === newPlan) {
    return c.json(
      { error: 'Already on this plan', code: 'NO_CHANGE', current_plan: currentPlan },
      409,
    );
  }

  const currentRank = PLAN_RANK[currentPlan] ?? 0;
  const newRank = PLAN_RANK[newPlan] ?? 0;
  const isUpgrade = newRank > currentRank;
  const _changeType = isUpgrade ? 'upgrade' : 'downgrade';

  const now = Math.floor(Date.now() / 1000);

  if (isUpgrade) {
    const newPeriodEnd = now + 30 * 24 * 60 * 60;
    await db
      .prepare(
        `UPDATE subscriptions SET plan = ?, status = 'active', enforcement_status = 'none',
         grace_period_end = NULL, cancel_at_period_end = 0,
         current_period_start = ?, current_period_end = ?, updated_at = ?
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(newPlan, now, newPeriodEnd, now, sub.id, auth.tenantId)
      .run();

    await recordPlanHistory(db, {
      subscriptionId: sub.id,
      workspaceId: sub.workspace_id,
      tenantId: auth.tenantId,
      changedBy: auth.userId,
      previousPlan: currentPlan,
      newPlan,
      changeType: 'upgrade',
      effectiveAt: now,
      notes,
    });

    // N-082: billing.subscription_created for plan upgrade (new active subscription tier)
    void publishEvent(c.env, {
      eventId: sub.id,
      eventKey: BillingEventType.BillingSubscriptionCreated,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: sub.workspace_id,
      payload: { subscription_id: sub.id, previous_plan: currentPlan, new_plan: newPlan, change_type: 'upgrade' },
      source: 'api',
      severity: 'info',
    });
    // N-082: billing.subscription_renewed for plan upgrade
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: BillingEventType.BillingSubscriptionRenewed,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: sub.workspace_id,
      payload: { subscription_id: sub.id, previous_plan: currentPlan, new_plan: newPlan, change_type: 'upgrade' },
      source: 'api',
      severity: 'info',
    });

    return c.json({
      changed: true,
      change_type: 'upgrade',
      previous_plan: currentPlan,
      new_plan: newPlan,
      effective: 'immediate',
      new_period_end: new Date(newPeriodEnd * 1000).toISOString(),
    });
  } else {
    await db
      .prepare(
        `UPDATE subscriptions SET plan = ?, updated_at = ?
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(newPlan, now, sub.id, auth.tenantId)
      .run();

    await recordPlanHistory(db, {
      subscriptionId: sub.id,
      workspaceId: sub.workspace_id,
      tenantId: auth.tenantId,
      changedBy: auth.userId,
      previousPlan: currentPlan,
      newPlan,
      changeType: 'downgrade',
      effectiveAt: now,
      notes,
    });

    // N-082: billing.subscription_renewed for plan downgrade
    void publishEvent(c.env, {
      eventId: crypto.randomUUID(),
      eventKey: BillingEventType.BillingSubscriptionRenewed,
      tenantId: auth.tenantId,
      actorId: auth.userId,
      actorType: 'user',
      workspaceId: sub.workspace_id,
      payload: { subscription_id: sub.id, previous_plan: currentPlan, new_plan: newPlan, change_type: 'downgrade' },
      source: 'api',
      severity: 'info',
    });

    return c.json({
      changed: true,
      change_type: 'downgrade',
      previous_plan: currentPlan,
      new_plan: newPlan,
      effective: 'immediate',
      note: 'Plan downgraded. Feature access adjusted immediately.',
    });
  }
});

// ---------------------------------------------------------------------------
// POST /billing/cancel  (MON-05)
// Sets cancel_at_period_end = 1. Subscription remains active until period ends.
// ---------------------------------------------------------------------------

billingRoutes.post('/cancel', async (c) => {
  const auth = c.get('auth') as Auth;
  const db = c.env.DB;

  const sub = await resolveSubscription(db, auth);
  if (!sub) {
    return c.json({ error: 'No subscription found', code: 'NOT_FOUND' }, 404);
  }

  if (sub.plan === 'free') {
    return c.json(
      {
        error: 'Free plan cannot be cancelled. Simply stop using the service.',
        code: 'CANNOT_CANCEL_FREE',
      },
      422,
    );
  }

  if (sub.cancel_at_period_end === 1) {
    return c.json(
      {
        message: 'Subscription is already scheduled for cancellation.',
        cancels_at: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
      },
      409,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(now, sub.id, auth.tenantId)
    .run();

  await recordPlanHistory(db, {
    subscriptionId: sub.id,
    workspaceId: sub.workspace_id,
    tenantId: auth.tenantId,
    changedBy: auth.userId,
    previousPlan: sub.plan,
    newPlan: 'free',
    changeType: 'cancel',
    effectiveAt: sub.current_period_end ?? now,
  });

  // N-082: billing.subscription_cancelled event
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: BillingEventType.BillingSubscriptionCancelled,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: sub.workspace_id,
    payload: { subscription_id: sub.id, plan: sub.plan, cancels_at: sub.current_period_end },
    source: 'api',
    severity: 'warning',
  });

  return c.json({
    cancelled: true,
    cancels_at: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    message: 'Your subscription will remain active until the end of the current billing period.',
    current_plan: sub.plan,
  });
});

// ---------------------------------------------------------------------------
// POST /billing/revert-cancel  (MON-05)
// Undoes a scheduled cancellation while still in the billing period.
// ---------------------------------------------------------------------------

billingRoutes.post('/revert-cancel', async (c) => {
  const auth = c.get('auth') as Auth;
  const db = c.env.DB;

  const sub = await resolveSubscription(db, auth);
  if (!sub) {
    return c.json({ error: 'No subscription found', code: 'NOT_FOUND' }, 404);
  }

  if (sub.cancel_at_period_end !== 1) {
    return c.json(
      { error: 'No pending cancellation to revert', code: 'NO_PENDING_CANCEL' },
      409,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(
      `UPDATE subscriptions SET cancel_at_period_end = 0, updated_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(now, sub.id, auth.tenantId)
    .run();

  // Audit trail — migration 0229 adds 'revert_cancel' to the CHECK constraint.
  await recordPlanHistory(db, {
    subscriptionId: sub.id,
    workspaceId: sub.workspace_id,
    tenantId: auth.tenantId,
    changedBy: auth.userId,
    previousPlan: sub.plan,
    newPlan: sub.plan,
    changeType: 'revert_cancel',
    effectiveAt: now,
    notes: 'Scheduled cancellation reverted; subscription will auto-renew at period end.',
  });

  // N-082: billing.subscription_renewed for revert-cancel
  void publishEvent(c.env, {
    eventId: crypto.randomUUID(),
    eventKey: BillingEventType.BillingSubscriptionRenewed,
    tenantId: auth.tenantId,
    actorId: auth.userId,
    actorType: 'user',
    workspaceId: sub.workspace_id,
    payload: { subscription_id: sub.id, plan: sub.plan, change_type: 'revert_cancel' },
    source: 'api',
    severity: 'info',
  });

  return c.json({
    reverted: true,
    plan: sub.plan,
    message: 'Cancellation reverted. Subscription will auto-renew at period end.',
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
  });
});

// ---------------------------------------------------------------------------
// GET /billing/history  (MON-05)
// Returns the plan change history scoped by tenant_id (T3) AND workspace_id
// when the caller has a workspaceId in their JWT. This prevents workspace A
// from reading workspace B's billing history within the same tenant.
// ---------------------------------------------------------------------------

billingRoutes.get('/history', async (c) => {
  const auth = c.get('auth') as Auth;
  const db = c.env.DB;

  const limit = Math.min(parseInt(c.req.query('limit') ?? '20', 10), 100);
  const offset = parseInt(c.req.query('offset') ?? '0', 10);

  // T3 + workspace isolation:
  //   - Always filter by tenant_id (T3 invariant).
  //   - Also filter by workspace_id when present in the JWT, so workspace A
  //     cannot read workspace B's history within the same tenant.
  //   - Callers without a workspaceId (e.g. tenant super-admin) see all.
  type HistoryRow = {
    id: string;
    subscription_id: string;
    changed_by: string;
    previous_plan: string;
    new_plan: string;
    change_type: string;
    effective_at: number;
    created_at: number;
    notes: string | null;
  };

  const workspaceId = auth.workspaceId ?? null;
  const rows = await db
    .prepare(
      `SELECT id, subscription_id, changed_by, previous_plan, new_plan, change_type,
              effective_at, created_at, notes
       FROM subscription_plan_history
       WHERE tenant_id = ?
         AND (? IS NULL OR workspace_id = ?)
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(auth.tenantId, workspaceId, workspaceId, limit, offset)
    .all<HistoryRow>();

  return c.json({
    data: rows.results ?? [],
    limit,
    offset,
    count: (rows.results ?? []).length,
  });
});

export { billingRoutes };
