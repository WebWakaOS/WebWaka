/**
 * Platform Analytics API — MED-011 (PROD-03) — P6-A
 *
 * Provides aggregate platform statistics for super_admin operators.
 * All routes require `super_admin` role.
 *
 * Route map:
 *   GET /platform/analytics/summary   — totals: tenants, workspaces, transactions, revenue
 *   GET /platform/analytics/tenants   — paginated tenant list with workspace count + plan
 *   GET /platform/analytics/verticals — vertical usage heatmap (workspace count per vertical)
 *
 * Platform Invariants:
 *   T3 — No tenant_id filter here; super_admin sees cross-tenant aggregates
 *   P9 — All monetary totals returned as INTEGER kobo
 *   SEC — super_admin guard on all routes; no PII exposed beyond tenant IDs
 *
 * Milestone 6 — Admin Platform Features (Phase 6)
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

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
}

export const analyticsRoutes = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Auth guard helper (consistent with other route files)
// ---------------------------------------------------------------------------

function requireSuperAdmin(auth: { role?: string } | null | undefined): boolean {
  return auth?.role === 'super_admin';
}

// ---------------------------------------------------------------------------
// GET /platform/analytics/summary
// Returns platform-wide totals for the admin overview dashboard.
// ---------------------------------------------------------------------------

analyticsRoutes.get('/summary', async (c) => {
  const auth = c.get('auth') as { role?: string } | undefined;
  if (!requireSuperAdmin(auth)) {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  // Run all aggregate queries in parallel
  const [tenantCount, workspaceCount, txSummary, verticalTop10] = await Promise.all([
    db
      .prepare('SELECT COUNT(*) AS cnt FROM organizations')
      .first<{ cnt: number }>(),
    db
      .prepare("SELECT COUNT(*) AS cnt FROM workspaces WHERE subscription_status = 'active'")
      .first<{ cnt: number }>(),
    db
      .prepare(
        `SELECT
           COUNT(*)                                                        AS tx_count,
           COALESCE(SUM(CASE WHEN type = 'credit' THEN amount_wc ELSE 0 END), 0) AS revenue_kobo
         FROM wc_transactions
         WHERE created_at >= datetime('now', '-30 days')`,
      )
      .first<{ tx_count: number; revenue_kobo: number }>(),
    db
      .prepare(
        `SELECT vertical_slug, COUNT(*) AS workspace_count
         FROM workspace_verticals
         GROUP BY vertical_slug
         ORDER BY workspace_count DESC
         LIMIT 10`,
      )
      .all<{ vertical_slug: string; workspace_count: number }>(),
  ]);

  return c.json({
    totalTenants: tenantCount?.cnt ?? 0,
    activeWorkspaces: workspaceCount?.cnt ?? 0,
    last30Days: {
      transactionCount: txSummary?.tx_count ?? 0,
      revenueKobo: txSummary?.revenue_kobo ?? 0,
    },
    topVerticals: verticalTop10.results ?? [],
    generatedAt: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// GET /platform/analytics/tenants
// Paginated tenant list with workspace count and subscription plan.
// ---------------------------------------------------------------------------

analyticsRoutes.get('/tenants', async (c) => {
  const auth = c.get('auth') as { role?: string } | undefined;
  if (!requireSuperAdmin(auth)) {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  const rawPage = parseInt(c.req.query('page') ?? '1', 10);
  const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const perPage = 50;
  const offset = (page - 1) * perPage;

  const { results } = await db
    .prepare(
      `SELECT
         o.id            AS tenant_id,
         o.name          AS tenant_name,
         o.slug          AS tenant_slug,
         o.created_at,
         COUNT(w.id)     AS workspace_count,
         MAX(s.plan)     AS subscription_plan,
         MAX(s.status)   AS subscription_status
       FROM organizations o
       LEFT JOIN workspaces w ON w.tenant_id = o.id
       LEFT JOIN subscriptions s ON s.workspace_id = w.id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(perPage, offset)
    .all<{
      tenant_id: string;
      tenant_name: string;
      tenant_slug: string;
      created_at: string;
      workspace_count: number;
      subscription_plan: string | null;
      subscription_status: string | null;
    }>();

  return c.json({ tenants: results ?? [], page, perPage });
});

// ---------------------------------------------------------------------------
// GET /platform/analytics/verticals
// Vertical usage heatmap — count of workspaces per vertical slug.
// ---------------------------------------------------------------------------

analyticsRoutes.get('/verticals', async (c) => {
  const auth = c.get('auth') as { role?: string } | undefined;
  if (!requireSuperAdmin(auth)) {
    return c.json({ error: 'super_admin role required' }, 403);
  }

  const db = c.env.DB as unknown as D1Like;

  const { results } = await db
    .prepare(
      `SELECT vertical_slug, COUNT(*) AS workspace_count
       FROM workspace_verticals
       GROUP BY vertical_slug
       ORDER BY workspace_count DESC`,
    )
    .all<{ vertical_slug: string; workspace_count: number }>();

  return c.json({ verticals: results ?? [], total: results?.length ?? 0 });
});
