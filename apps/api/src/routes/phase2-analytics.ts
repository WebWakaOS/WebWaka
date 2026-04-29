/**
 * Phase 2 Analytics Routes — T004
 *
 * GET /analytics/v2/workspace       — workspace metrics (3 key: activeGroups, contributions, openCases)
 * GET /analytics/v2/groups/:id      — group metrics (memberCount, broadcastCount, eventCount)
 * GET /analytics/v2/campaigns/:id   — campaign metrics (raisedKobo, contributorCount, pendingPayouts)
 *
 * M12 gate: analytics dashboard must return 3 workspace metrics.
 *
 * Platform Invariants:
 *   T3  — tenantId from JWT on every query
 *   P13 — queries return aggregate counts, no PII
 */

import { Hono } from 'hono';
import type { Env } from '../env.js';
import type { AuthContext } from '@webwaka/types';
import { getWorkspaceMetrics, getGroupMetrics, getCampaignMetrics } from '@webwaka/analytics';

type AppEnv = { Bindings: Env; Variables: { auth: AuthContext } };

interface D1Like {
  prepare(sql: string): {
    bind(...args: unknown[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export const phase2AnalyticsRoutes = new Hono<AppEnv>();

phase2AnalyticsRoutes.get('/workspace', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const workspaceId = c.req.query('workspaceId') ?? auth.workspaceId;
  if (!workspaceId) return c.json({ error: 'workspaceId required' }, 400);

  const db = c.env.DB as unknown as D1Like;
  const metrics = await getWorkspaceMetrics(db, auth.tenantId, workspaceId);
  return c.json({ metrics });
});

phase2AnalyticsRoutes.get('/groups/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const db = c.env.DB as unknown as D1Like;
  const metrics = await getGroupMetrics(db, auth.tenantId, c.req.param('id'));
  return c.json({ metrics });
});

phase2AnalyticsRoutes.get('/campaigns/:id', async (c) => {
  const auth = c.get('auth');
  if (!auth?.tenantId) return c.json({ error: 'unauthorized' }, 401);

  const db = c.env.DB as unknown as D1Like;
  const metrics = await getCampaignMetrics(db, auth.tenantId, c.req.param('id'));
  return c.json({ metrics });
});
