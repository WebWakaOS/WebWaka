/**
 * Admin AI Usage Endpoint — Wave 3 (A6-1)
 * WebWaka OS — GET /admin/ai/usage
 *
 * Aggregates AI usage from ai_usage_events by:
 *   - tenant (for platform admin super-view)
 *   - capability
 *   - provider
 *   - day (last 30 days)
 *
 * Access tiers:
 *   super_admin: can pass ?tenantId= to view any tenant
 *   admin / workspace_admin: scoped to their own tenantId
 *
 * Query params:
 *   ?days=30        — lookback window (max 90, default 30)
 *   ?tenantId=      — super_admin only: view another tenant
 *   ?capability=    — filter to a single capability
 *   ?provider=      — filter to a single provider
 *
 * Response:
 *   { summary: {...}, byCapability: [...], byProvider: [...], byDay: [...] }
 *
 * Platform Invariants:
 *   T3 — all queries scoped by tenantId unless super_admin
 *   P13 — no PII returned; only aggregates
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';

interface AuthShape {
  userId: string;
  tenantId: string;
  workspaceId?: string;
  role?: string;
}

const adminAiUsageRoutes = new Hono<{ Bindings: Env }>();

adminAiUsageRoutes.get('/usage', async (c) => {
  const auth = c.get('auth') as AuthShape | undefined;
  if (!auth?.tenantId) {
    return c.json({ error: 'Not authenticated' }, 401);
  }
  if (!['admin', 'super_admin', 'workspace_admin'].includes(auth.role ?? '')) {
    return c.json({ error: 'Admin role required' }, 403);
  }

  // Resolve target tenant
  let targetTenantId = auth.tenantId;
  if (auth.role === 'super_admin') {
    const qTenant = c.req.query('tenantId');
    if (qTenant) targetTenantId = qTenant;
  }

  // Lookback window
  const daysParam = parseInt(c.req.query('days') ?? '30', 10);
  const days = Math.min(Math.max(isNaN(daysParam) ? 30 : daysParam, 1), 90);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const capabilityFilter = c.req.query('capability');
  const providerFilter   = c.req.query('provider');

  // Build dynamic WHERE clauses
  const whereBase = `WHERE tenant_id = ? AND created_at >= ?`;
  const baseParams: unknown[] = [targetTenantId, cutoff];

  let whereExtra = '';
  const extraParams: unknown[] = [];
  if (capabilityFilter) { whereExtra += ' AND capability = ?'; extraParams.push(capabilityFilter); }
  if (providerFilter)   { whereExtra += ' AND provider = ?';   extraParams.push(providerFilter); }

  const where = whereBase + whereExtra;
  const params = [...baseParams, ...extraParams];

  const db = c.env.DB;

  // 1. Summary totals
  const summary = await db
    .prepare(
      `SELECT
         COUNT(*)            AS total_requests,
         SUM(wc_charged)     AS total_wc_charged,
         SUM(tokens_in)      AS total_tokens_in,
         SUM(tokens_out)     AS total_tokens_out,
         SUM(CASE WHEN error_code IS NOT NULL THEN 1 ELSE 0 END) AS total_errors,
         AVG(duration_ms)    AS avg_duration_ms
       FROM ai_usage_events ${where}`,
    )
    .bind(...params)
    .first<{
      total_requests: number; total_wc_charged: number;
      total_tokens_in: number; total_tokens_out: number;
      total_errors: number; avg_duration_ms: number;
    }>();

  // 2. By capability
  const { results: byCapability } = await db
    .prepare(
      `SELECT capability,
              COUNT(*)        AS requests,
              SUM(wc_charged) AS wc_charged,
              SUM(tokens_in + tokens_out) AS total_tokens
       FROM ai_usage_events ${where}
       GROUP BY capability ORDER BY wc_charged DESC LIMIT 20`,
    )
    .bind(...params)
    .all<{ capability: string; requests: number; wc_charged: number; total_tokens: number }>();

  // 3. By provider
  const { results: byProvider } = await db
    .prepare(
      `SELECT provider,
              COUNT(*)        AS requests,
              SUM(wc_charged) AS wc_charged,
              AVG(duration_ms) AS avg_duration_ms
       FROM ai_usage_events ${where}
       GROUP BY provider ORDER BY wc_charged DESC`,
    )
    .bind(...params)
    .all<{ provider: string; requests: number; wc_charged: number; avg_duration_ms: number }>();

  // 4. By day (daily spend trend)
  const { results: byDay } = await db
    .prepare(
      `SELECT date(created_at) AS day,
              COUNT(*)          AS requests,
              SUM(wc_charged)   AS wc_charged,
              SUM(CASE WHEN error_code IS NOT NULL THEN 1 ELSE 0 END) AS errors
       FROM ai_usage_events ${where}
       GROUP BY date(created_at) ORDER BY day ASC`,
    )
    .bind(...params)
    .all<{ day: string; requests: number; wc_charged: number; errors: number }>();

  return c.json({
    tenantId: targetTenantId,
    days,
    summary: {
      totalRequests:  summary?.total_requests  ?? 0,
      totalWcCharged: summary?.total_wc_charged ?? 0,
      totalTokensIn:  summary?.total_tokens_in  ?? 0,
      totalTokensOut: summary?.total_tokens_out ?? 0,
      totalErrors:    summary?.total_errors     ?? 0,
      avgDurationMs:  Math.round(summary?.avg_duration_ms ?? 0),
    },
    byCapability,
    byProvider,
    byDay,
  });
});

export { adminAiUsageRoutes };
