/**
 * Produce Storage / Market Aggregator vertical routes — M9
 *
 * POST   /produce-aggregator                              — Create profile
 * GET    /produce-aggregator/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /produce-aggregator/:id                          — Get profile (T3)
 * PATCH  /produce-aggregator/:id                          — Update profile
 * POST   /produce-aggregator/:id/transition               — FSM transition
 *
 * FSM: seeded → claimed → active
 * Platform Invariants: T3
 */

import { Hono } from 'hono';
import {
  ProduceAggregatorRepository,
  isValidProduceAggregatorTransition,
} from '@webwaka/verticals-produce-aggregator';
import type { ProduceAggregatorFSMState } from '@webwaka/verticals-produce-aggregator';
import type { Env } from '../../env.js';

export const produceAggregatorRoutes = new Hono<{ Bindings: Env }>();

produceAggregatorRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; display_name?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.display_name) return c.json({ error: 'workspace_id, display_name are required' }, 400);
  const repo = new ProduceAggregatorRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, displayName: body.display_name });
  return c.json({ produce_aggregator: profile }, 201);
});

produceAggregatorRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new ProduceAggregatorRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ produce_aggregator: profile });
});

produceAggregatorRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ProduceAggregatorRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Produce aggregator profile not found' }, 404);
  return c.json({ produce_aggregator: profile });
});

produceAggregatorRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { display_name?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ProduceAggregatorRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { displayName: body.display_name });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ produce_aggregator: updated });
});

produceAggregatorRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new ProduceAggregatorRepository(c.env.DB);
  const current = await repo.findProfileById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Profile not found' }, 404);
  if (!isValidProduceAggregatorTransition(current.status, body.to as ProduceAggregatorFSMState)) {
    return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  }
  const updated = await repo.transition(id, auth.tenantId, body.to as ProduceAggregatorFSMState);
  return c.json({ produce_aggregator: updated });
});
