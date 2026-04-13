/**
 * Road Transport Union (NURTW/NUC) vertical routes — M8c Transport
 *
 * POST   /road-transport-union                              — Create union profile
 * GET    /road-transport-union/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /road-transport-union/:id                          — Get profile (T3)
 * PATCH  /road-transport-union/:id                          — Update profile
 * POST   /road-transport-union/:id/transition               — FSM transition
 *
 * FSM: seeded → claimed → active ↔ suspended
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import {
  RtuRepository,
  isValidRtuTransition,
} from '@webwaka/verticals-road-transport-union';
import type { RtuFSMState } from '@webwaka/verticals-road-transport-union';
import type { Env } from '../../env.js';

export const roadTransportUnionRoutes = new Hono<{ Bindings: Env }>();

roadTransportUnionRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; union_name?: string; member_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.union_name) return c.json({ error: 'workspace_id, union_name are required' }, 400);
  const repo = new RtuRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, unionName: body.union_name, memberCount: body.member_count });
  return c.json({ road_transport_union: profile }, 201);
});

roadTransportUnionRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new RtuRepository(c.env.DB);
  const profiles = await repo.findByWorkspace(workspaceId, auth.tenantId);
  return c.json({ road_transport_unions: profiles });
});

roadTransportUnionRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new RtuRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Road transport union profile not found' }, 404);
  return c.json({ road_transport_union: profile });
});

roadTransportUnionRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { union_name?: string; registration_ref?: string; member_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new RtuRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { unionName: body.union_name, registrationRef: body.registration_ref, memberCount: body.member_count });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ road_transport_union: updated });
});

roadTransportUnionRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new RtuRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Profile not found' }, 404);
  if (!isValidRtuTransition(current.status, body.to as RtuFSMState)) {
    return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  }
  const updated = await repo.transition(id, auth.tenantId, body.to as RtuFSMState);
  return c.json({ road_transport_union: updated });
});
