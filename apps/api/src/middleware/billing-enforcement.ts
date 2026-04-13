/**
 * Billing Enforcement Middleware — Sprint 7 / PROD-09
 *
 * Checks subscription status on authenticated requests.
 * Enforcement states:
 *   active   → full access
 *   free     → always passes (no enforcement)
 *   grace_period → read + write allowed, warning header set
 *   suspended    → read-only mode (GET allowed, writes blocked)
 *   terminated   → all access blocked
 *
 * Grace period: 7 days after subscription period end.
 * After grace: subscription transitions to suspended.
 *
 * Platform Invariants:
 *   T3 — tenant_id on subscription lookup
 */

import type { Context, Next } from 'hono';
import type { Env } from '../env.js';

const GRACE_PERIOD_DAYS = 7;
const GRACE_PERIOD_SECONDS = GRACE_PERIOD_DAYS * 24 * 60 * 60;

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const EXEMPT_PATHS = new Set([
  '/health',
  '/health/version',
  '/health/ready',
  '/auth/login',
  '/auth/verify',
  '/auth/refresh',
  '/auth/me',
  '/payments/verify',
]);

function isExemptPath(path: string): boolean {
  if (EXEMPT_PATHS.has(path)) return true;
  if (path.startsWith('/health/')) return true;
  if (path.startsWith('/billing/')) return true;
  if (path.startsWith('/onboarding/')) return true;
  if (path.startsWith('/payments/')) return true;
  return false;
}

interface SubscriptionRow {
  plan: string;
  status: string;
  current_period_end: number;
  grace_period_end: number | null;
  enforcement_status: string;
}

export async function billingEnforcementMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next,
): Promise<void | Response> {
  const auth = c.get('auth');
  if (!auth) {
    await next();
    return;
  }

  const path = new URL(c.req.url).pathname;
  if (isExemptPath(path)) {
    await next();
    return;
  }

  const tenantId = (auth as { tenantId?: string }).tenantId;
  const workspaceId = (auth as { workspaceId?: string }).workspaceId;

  if (!tenantId) {
    await next();
    return;
  }

  try {
    let sub: SubscriptionRow | null = null;

    if (workspaceId) {
      sub = await c.env.DB.prepare(
        'SELECT plan, status, current_period_end, grace_period_end, enforcement_status FROM subscriptions WHERE workspace_id = ? AND tenant_id = ? LIMIT 1'
      ).bind(workspaceId, tenantId).first<SubscriptionRow>();
    }

    if (!sub) {
      sub = await c.env.DB.prepare(
        'SELECT plan, status, current_period_end, grace_period_end, enforcement_status FROM subscriptions WHERE tenant_id = ? LIMIT 1'
      ).bind(tenantId).first<SubscriptionRow>();
    }

    if (!sub || sub.plan === 'free') {
      await next();
      return;
    }

    if (sub.status === 'active' && sub.enforcement_status === 'none') {
      const now = Math.floor(Date.now() / 1000);
      if (sub.current_period_end > 0 && now > sub.current_period_end) {
        const gracePeriodEnd = sub.current_period_end + GRACE_PERIOD_SECONDS;

        const graceUpdateSql = workspaceId
          ? `UPDATE subscriptions SET status = 'past_due', enforcement_status = 'grace_period',
             grace_period_end = ?, last_enforcement_at = ?, updated_at = ?
             WHERE tenant_id = ? AND workspace_id = ?`
          : `UPDATE subscriptions SET status = 'past_due', enforcement_status = 'grace_period',
             grace_period_end = ?, last_enforcement_at = ?, updated_at = ?
             WHERE tenant_id = ? AND workspace_id = (SELECT workspace_id FROM subscriptions WHERE tenant_id = ? AND status = 'active' LIMIT 1)`;

        if (workspaceId) {
          await c.env.DB.prepare(graceUpdateSql).bind(gracePeriodEnd, now, now, tenantId, workspaceId).run();
        } else {
          await c.env.DB.prepare(graceUpdateSql).bind(gracePeriodEnd, now, now, tenantId, tenantId).run();
        }

        c.header('X-Billing-Status', 'grace_period');
        c.header('X-Grace-Period-End', new Date(gracePeriodEnd * 1000).toISOString());
        await next();
        return;
      }

      await next();
      return;
    }

    if (sub.enforcement_status === 'grace_period') {
      const now = Math.floor(Date.now() / 1000);
      const graceEnd = sub.grace_period_end ?? (sub.current_period_end + GRACE_PERIOD_SECONDS);

      if (now > graceEnd) {
        const suspendUpdateSql = workspaceId
          ? `UPDATE subscriptions SET status = 'suspended', enforcement_status = 'suspended',
             last_enforcement_at = ?, updated_at = ?
             WHERE tenant_id = ? AND workspace_id = ?`
          : `UPDATE subscriptions SET status = 'suspended', enforcement_status = 'suspended',
             last_enforcement_at = ?, updated_at = ?
             WHERE tenant_id = ? AND workspace_id = (SELECT workspace_id FROM subscriptions WHERE tenant_id = ? AND enforcement_status = 'grace_period' LIMIT 1)`;

        if (workspaceId) {
          await c.env.DB.prepare(suspendUpdateSql).bind(now, now, tenantId, workspaceId).run();
        } else {
          await c.env.DB.prepare(suspendUpdateSql).bind(now, now, tenantId, tenantId).run();
        }

        if (!READ_METHODS.has(c.req.method)) {
          return c.json({
            error: 'Subscription suspended',
            code: 'BILLING_SUSPENDED',
            message: 'Your subscription has been suspended due to non-payment. Please update your payment method to restore full access.',
          }, 402);
        }

        c.header('X-Billing-Status', 'suspended');
        await next();
        return;
      }

      c.header('X-Billing-Status', 'grace_period');
      c.header('X-Grace-Period-End', new Date(graceEnd * 1000).toISOString());
      await next();
      return;
    }

    if (sub.enforcement_status === 'suspended' || sub.status === 'suspended') {
      if (!READ_METHODS.has(c.req.method)) {
        return c.json({
          error: 'Subscription suspended',
          code: 'BILLING_SUSPENDED',
          message: 'Your subscription has been suspended due to non-payment. Please update your payment method to restore full access.',
        }, 402);
      }

      c.header('X-Billing-Status', 'suspended');
      await next();
      return;
    }

    if (sub.enforcement_status === 'terminated' || sub.status === 'cancelled') {
      return c.json({
        error: 'Subscription terminated',
        code: 'BILLING_TERMINATED',
        message: 'Your subscription has been terminated. Please contact support to reactivate your account.',
      }, 402);
    }

    await next();
  } catch {
    if (!READ_METHODS.has(c.req.method)) {
      return c.json({
        error: 'Billing check unavailable',
        code: 'BILLING_CHECK_FAILED',
        message: 'Unable to verify subscription status. Write operations are temporarily blocked. Please try again shortly.',
      }, 503);
    }
    await next();
  }
}
