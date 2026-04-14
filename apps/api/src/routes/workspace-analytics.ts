/**
 * Workspace Analytics Routes — P23
 *
 * Tenant-scoped analytics for workspace operators.
 * Reads from analytics_snapshots (pre-computed by projections CRON)
 * and falls back to live aggregation when no snapshot is available.
 *
 * Routes:
 *   GET /analytics/workspace/:workspaceId/summary   — daily/weekly/monthly summary
 *   GET /analytics/workspace/:workspaceId/trend     — revenue trend over N days
 *   GET /analytics/workspace/:workspaceId/payments  — payment method breakdown
 *
 * Platform Invariants:
 *   T3 — All queries scoped by tenant_id from JWT
 *   P9 — All monetary values returned as INTEGER kobo
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

export const workspaceAnalyticsRoutes = new Hono<AppEnv>();

// ---------------------------------------------------------------------------
// GET /analytics/workspace/:workspaceId/summary
// ---------------------------------------------------------------------------

workspaceAnalyticsRoutes.get('/:workspaceId/summary', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('workspaceId');
  const period = (c.req.query('period') ?? 'day') as 'day' | 'week' | 'month';
  const date = c.req.query('date') ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  if (!['day', 'week', 'month'].includes(period)) {
    return c.json({ error: "period must be 'day', 'week', or 'month'" }, 400);
  }

  const db = c.env.DB as unknown as D1Like;

  const snapshot = await db
    .prepare(
      `SELECT * FROM analytics_snapshots
       WHERE tenant_id = ? AND workspace_id = ? AND snapshot_date = ? AND period_type = ?
       LIMIT 1`,
    )
    .bind(auth.tenantId, workspaceId, date, period)
    .first<{
      total_orders: number;
      total_revenue_kobo: number;
      unique_customers: number;
      new_customers: number;
      top_vertical: string | null;
      payment_cash_kobo: number;
      payment_card_kobo: number;
      payment_transfer_kobo: number;
      payment_ussd_kobo: number;
      computed_at: string;
    }>();

  if (snapshot) {
    return c.json({ period, date, source: 'snapshot', ...snapshot });
  }

  // Fallback: live aggregation from bank_transfer_orders
  // (primary payment table — has workspace_id, tenant_id, amount_kobo, buyer_id)
  const live = await db
    .prepare(
      `SELECT
         COUNT(*) as total_orders,
         COALESCE(SUM(amount_kobo), 0) as total_revenue_kobo,
         COUNT(DISTINCT COALESCE(buyer_id, '')) as unique_customers
       FROM bank_transfer_orders
       WHERE tenant_id = ? AND workspace_id = ? AND status = 'confirmed'
         AND date(created_at, 'unixepoch') = ?`,
    )
    .bind(auth.tenantId, workspaceId, date)
    .first<{
      total_orders: number;
      total_revenue_kobo: number;
      unique_customers: number;
    }>();

  return c.json({
    period,
    date,
    source: 'live',
    total_orders: live?.total_orders ?? 0,
    total_revenue_kobo: live?.total_revenue_kobo ?? 0,
    unique_customers: live?.unique_customers ?? 0,
    new_customers: 0,
    top_vertical: null,
    payment_cash_kobo: 0,
    payment_card_kobo: 0,
    payment_transfer_kobo: live?.total_revenue_kobo ?? 0,
    payment_ussd_kobo: 0,
  });
});

// ---------------------------------------------------------------------------
// GET /analytics/workspace/:workspaceId/trend
// Revenue trend for the last N days (default 30)
// ---------------------------------------------------------------------------

workspaceAnalyticsRoutes.get('/:workspaceId/trend', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('workspaceId');
  const days = Math.min(parseInt(c.req.query('days') ?? '30'), 365);
  const db = c.env.DB as unknown as D1Like;

  const rows = await db
    .prepare(
      `SELECT snapshot_date, total_revenue_kobo, total_orders, unique_customers
       FROM analytics_snapshots
       WHERE tenant_id = ? AND workspace_id = ? AND period_type = 'day'
         AND snapshot_date >= date('now', ?)
       ORDER BY snapshot_date ASC`,
    )
    .bind(auth.tenantId, workspaceId, `-${days} days`)
    .all<{
      snapshot_date: string;
      total_revenue_kobo: number;
      total_orders: number;
      unique_customers: number;
    }>();

  return c.json({
    workspace_id: workspaceId,
    days,
    trend: rows.results,
    total_points: rows.results.length,
  });
});

// ---------------------------------------------------------------------------
// GET /analytics/workspace/:workspaceId/payments
// Payment method breakdown for a date range
// ---------------------------------------------------------------------------

workspaceAnalyticsRoutes.get('/:workspaceId/payments', async (c) => {
  const auth = c.get('auth');
  const workspaceId = c.req.param('workspaceId');
  const since = c.req.query('since') ?? new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
  const db = c.env.DB as unknown as D1Like;

  const rows = await db
    .prepare(
      `SELECT
         COALESCE(SUM(payment_cash_kobo), 0) as cash_kobo,
         COALESCE(SUM(payment_card_kobo), 0) as card_kobo,
         COALESCE(SUM(payment_transfer_kobo), 0) as transfer_kobo,
         COALESCE(SUM(payment_ussd_kobo), 0) as ussd_kobo,
         COALESCE(SUM(total_revenue_kobo), 0) as total_kobo
       FROM analytics_snapshots
       WHERE tenant_id = ? AND workspace_id = ? AND period_type = 'day'
         AND snapshot_date >= ?`,
    )
    .bind(auth.tenantId, workspaceId, since)
    .first<{
      cash_kobo: number;
      card_kobo: number;
      transfer_kobo: number;
      ussd_kobo: number;
      total_kobo: number;
    }>();

  return c.json({
    workspace_id: workspaceId,
    since,
    payment_breakdown: {
      cash_kobo: rows?.cash_kobo ?? 0,
      card_kobo: rows?.card_kobo ?? 0,
      transfer_kobo: rows?.transfer_kobo ?? 0,
      ussd_kobo: rows?.ussd_kobo ?? 0,
      total_kobo: rows?.total_kobo ?? 0,
    },
  });
});
