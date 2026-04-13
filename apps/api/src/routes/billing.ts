/**
 * Billing Enforcement Routes — Sprint 7 / PROD-09
 *
 * Routes:
 *   POST /billing/enforce          — admin-only: run enforcement check on all subscriptions
 *   GET  /billing/status           — get current billing/subscription status for caller's workspace
 *   POST /billing/reactivate       — reactivate a suspended subscription after payment
 *
 * Platform Invariants:
 *   T3 — tenant_id on all queries
 *   All routes require auth
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

type Auth = { userId: string; tenantId: string; role?: string; workspaceId?: string };

const GRACE_PERIOD_SECONDS = 7 * 24 * 60 * 60;

const billingRoutes = new Hono<{ Bindings: Env }>();

billingRoutes.get('/status', async (c) => {
  const auth = c.get('auth') as Auth;
  const db = c.env.DB;

  let sub;
  if (auth.workspaceId) {
    sub = await db.prepare(
      `SELECT id, workspace_id, plan, status, current_period_start, current_period_end,
              grace_period_end, enforcement_status, cancel_at_period_end, updated_at
       FROM subscriptions WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`
    ).bind(auth.workspaceId, auth.tenantId).first<{
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
    }>();
  }

  if (!sub) {
    sub = await db.prepare(
      `SELECT id, workspace_id, plan, status, current_period_start, current_period_end,
              grace_period_end, enforcement_status, cancel_at_period_end, updated_at
       FROM subscriptions WHERE tenant_id = ? LIMIT 1`
    ).bind(auth.tenantId).first<{
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
    }>();
  }

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
  const daysUntilExpiry = sub.current_period_end > 0
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

billingRoutes.post('/enforce', async (c) => {
  const auth = c.get('auth') as Auth;

  if (auth.role !== 'admin' && auth.role !== 'super_admin') {
    return c.json({ error: 'Admin role required' }, 403);
  }

  const db = c.env.DB;
  const now = Math.floor(Date.now() / 1000);
  const tenantId = auth.tenantId;

  const expiredActive = await db.prepare(
    `SELECT id, workspace_id, tenant_id, plan, current_period_end
     FROM subscriptions
     WHERE tenant_id = ? AND status = 'active' AND plan != 'free' AND current_period_end > 0 AND current_period_end < ?`
  ).bind(tenantId, now).all<{
    id: string;
    workspace_id: string;
    tenant_id: string;
    plan: string;
    current_period_end: number;
  }>();

  let transitionsToGrace = 0;
  for (const sub of expiredActive.results ?? []) {
    const gracePeriodEnd = sub.current_period_end + GRACE_PERIOD_SECONDS;
    await db.prepare(
      `UPDATE subscriptions SET status = 'past_due', enforcement_status = 'grace_period',
       grace_period_end = ?, last_enforcement_at = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`
    ).bind(gracePeriodEnd, now, now, sub.id, tenantId).run();
    transitionsToGrace++;
  }

  const expiredGrace = await db.prepare(
    `SELECT id, workspace_id, tenant_id
     FROM subscriptions
     WHERE tenant_id = ? AND enforcement_status = 'grace_period' AND grace_period_end IS NOT NULL AND grace_period_end < ?`
  ).bind(tenantId, now).all<{ id: string; workspace_id: string; tenant_id: string }>();

  let transitionsToSuspended = 0;
  for (const sub of expiredGrace.results ?? []) {
    await db.prepare(
      `UPDATE subscriptions SET status = 'suspended', enforcement_status = 'suspended',
       last_enforcement_at = ?, updated_at = ?
       WHERE id = ? AND tenant_id = ?`
    ).bind(now, now, sub.id, tenantId).run();
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

billingRoutes.post('/reactivate', async (c) => {
  const auth = c.get('auth') as Auth;
  const db = c.env.DB;

  let sub;
  if (auth.workspaceId) {
    sub = await db.prepare(
      `SELECT id, workspace_id, status, enforcement_status
       FROM subscriptions WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`
    ).bind(auth.workspaceId, auth.tenantId).first<{
      id: string;
      workspace_id: string;
      status: string;
      enforcement_status: string;
    }>();
  }

  if (!sub) {
    sub = await db.prepare(
      `SELECT id, workspace_id, status, enforcement_status
       FROM subscriptions WHERE tenant_id = ? LIMIT 1`
    ).bind(auth.tenantId).first<{
      id: string;
      workspace_id: string;
      status: string;
      enforcement_status: string;
    }>();
  }

  if (!sub) {
    return c.json({ error: 'No subscription found' }, 404);
  }

  if (sub.status === 'active' && sub.enforcement_status === 'none') {
    return c.json({
      message: 'Subscription is already active',
      status: 'active',
    });
  }

  const recentPayment = await db.prepare(
    `SELECT id FROM billing_history
     WHERE workspace_id = ? AND tenant_id = ? AND status = 'success'
     ORDER BY created_at DESC LIMIT 1`
  ).bind(sub.workspace_id, auth.tenantId).first<{ id: string }>();

  if (!recentPayment) {
    return c.json({
      error: 'No successful payment found. Please make a payment before reactivating.',
      code: 'PAYMENT_REQUIRED',
    }, 402);
  }

  const now = Math.floor(Date.now() / 1000);
  const periodEnd = now + (30 * 24 * 60 * 60);

  await db.prepare(
    `UPDATE subscriptions SET status = 'active', enforcement_status = 'none',
     grace_period_end = NULL, current_period_start = ?, current_period_end = ?,
     last_enforcement_at = ?, updated_at = ?
     WHERE id = ? AND tenant_id = ?`
  ).bind(now, periodEnd, now, now, sub.id, auth.tenantId).run();

  return c.json({
    reactivated: true,
    status: 'active',
    new_period_end: new Date(periodEnd * 1000).toISOString(),
  });
});

export { billingRoutes };
