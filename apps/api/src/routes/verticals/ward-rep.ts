/**
 * Ward Representative / Polling Unit vertical routes — M12 Civic Extended
 *
 * POST   /ward-rep                              — Create profile
 * GET    /ward-rep/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /ward-rep/:id                          — Get profile (T3)
 * PATCH  /ward-rep/:id                          — Update profile
 * POST   /ward-rep/:id/transition               — FSM transition
 * POST   /ward-rep/:id/polling-units            — Create polling unit (integer voters)
 * POST   /ward-rep/:id/projects                 — Create ward project (P9)
 * POST   /ward-rep/:id/service-requests         — Create service request
 *
 * Platform Invariants: T3, P9, P13 (no constituent personal data to AI)
 * AI: L3 HITL mandatory
 */

import { Hono } from 'hono';
import {
  WardRepRepository,
  isValidWardRepTransition,
} from '@webwaka/verticals-ward-rep';
import type { WardRepFSMState } from '@webwaka/verticals-ward-rep';
import type { Env } from '../../env.js';

export const wardRepRoutes = new Hono<{ Bindings: Env }>();

wardRepRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; councillor_name?: string; ward_name?: string; lga?: string; state?: string; inec_ward_code?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.councillor_name || !body.ward_name) return c.json({ error: 'workspace_id, councillor_name, ward_name required' }, 400);
  const repo = new WardRepRepository(c.env.DB);
  const profile = await repo.create({ workspaceId: body.workspace_id, tenantId: auth.tenantId, councillorName: body.councillor_name, wardName: body.ward_name, lga: body.lga, state: body.state, inecWardCode: body.inec_ward_code });
  return c.json({ ward_rep: profile }, 201);
});

wardRepRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new WardRepRepository(c.env.DB);
  return c.json({ ward_reps: await repo.findByWorkspace(workspaceId, auth.tenantId) });
});

wardRepRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new WardRepRepository(c.env.DB);
  const profile = await repo.findById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Ward rep profile not found' }, 404);
  return c.json({ ward_rep: profile });
});

wardRepRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new WardRepRepository(c.env.DB);
  const updated = await repo.update(id, auth.tenantId, { councillorName: body['councillor_name'] as string | undefined, wardName: body['ward_name'] as string | undefined, lga: body['lga'] as string | null | undefined, state: body['state'] as string | null | undefined, inecWardCode: body['inec_ward_code'] as string | null | undefined });
  if (!updated) return c.json({ error: 'Ward rep profile not found' }, 404);
  return c.json({ ward_rep: updated });
});

wardRepRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { to?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to) return c.json({ error: 'to state required' }, 400);
  const repo = new WardRepRepository(c.env.DB);
  const current = await repo.findById(id, auth.tenantId);
  if (!current) return c.json({ error: 'Ward rep profile not found' }, 404);
  if (!isValidWardRepTransition(current.status, body.to as WardRepFSMState)) return c.json({ error: `Invalid transition ${current.status} → ${body.to}` }, 422);
  return c.json({ ward_rep: await repo.transition(id, auth.tenantId, body.to as WardRepFSMState) });
});

wardRepRoutes.post('/:id/polling-units', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { unit_number?: string; address?: string; registered_voters?: unknown };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.unit_number) return c.json({ error: 'unit_number required' }, 400);
  if (body.registered_voters !== undefined && !Number.isInteger(body.registered_voters)) return c.json({ error: 'registered_voters must be an integer' }, 422);
  const repo = new WardRepRepository(c.env.DB);
  const pu = await repo.createPollingUnit({ profileId: id, tenantId: auth.tenantId, unitNumber: body.unit_number, address: body.address, registeredVoters: body.registered_voters as number | undefined });
  return c.json({ polling_unit: pu }, 201);
});

wardRepRoutes.post('/:id/projects', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { project_name?: string; category?: string; amount_kobo?: unknown; status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.project_name || body.amount_kobo === undefined) return c.json({ error: 'project_name, amount_kobo required' }, 400);
  if (!Number.isInteger(body.amount_kobo) || (body.amount_kobo as number) < 0) return c.json({ error: 'amount_kobo must be a non-negative integer (P9)' }, 422);
  const repo = new WardRepRepository(c.env.DB);
  const project = await repo.createProject({ profileId: id, tenantId: auth.tenantId, projectName: body.project_name, category: body.category, amountKobo: body.amount_kobo as number, status: body.status });
  return c.json({ project }, 201);
});

wardRepRoutes.post('/:id/service-requests', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { request_type?: string; description?: string; ward?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.request_type) return c.json({ error: 'request_type required' }, 400);
  const repo = new WardRepRepository(c.env.DB);
  const sr = await repo.createServiceRequest({ profileId: id, tenantId: auth.tenantId, requestType: body.request_type, description: body.description, ward: body.ward });
  return c.json({ service_request: sr }, 201);
});
