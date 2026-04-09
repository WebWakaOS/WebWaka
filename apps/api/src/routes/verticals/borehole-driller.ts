/**
 * Borehole Driller vertical routes — M12 Commerce P3
 *
 * POST   /borehole-driller                              — Create profile
 * GET    /borehole-driller/workspace/:workspaceId       — Get by workspace (T3)
 * GET    /borehole-driller/:id                          — Get profile (T3)
 * PATCH  /borehole-driller/:id                          — Update profile
 * POST   /borehole-driller/:id/transition               — FSM transition
 * POST   /borehole-driller/:id/projects                 — Create borehole project (P9)
 * GET    /borehole-driller/:id/projects                 — List projects (T3)
 * PATCH  /borehole-driller/:id/projects/:projectId/status — Update project status
 * POST   /borehole-driller/:id/rigs                     — Register rig
 * GET    /borehole-driller/:id/rigs                     — List rigs (T3)
 * PATCH  /borehole-driller/:id/rigs/:rigId/status       — Update rig status
 * GET    /borehole-driller/:id/ai-advisory              — AI advisory
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  BoreholeDrillerRepository,
  guardSeedToClaimed,
  guardClaimedToCorenVerified,
  isValidBoreholeDrillerTransition,
} from '@webwaka/verticals-borehole-driller';
import type { BoreholeDrillerFSMState, BoreholeProjectStatus, RigStatus } from '@webwaka/verticals-borehole-driller';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const boreholeDrillerRoutes = new Hono<{ Bindings: Env }>();

boreholeDrillerRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; company_name?: string; coren_number?: string; state_water_board_reg?: string; cac_rc?: string; rig_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.company_name) return c.json({ error: 'workspace_id, company_name are required' }, 400);
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, companyName: body.company_name, corenNumber: body.coren_number, stateWaterBoardReg: body.state_water_board_reg, cacRc: body.cac_rc, rigCount: body.rig_count });
  return c.json({ borehole_driller: profile }, 201);
});

boreholeDrillerRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ borehole_driller: profile });
});

boreholeDrillerRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Borehole driller profile not found' }, 404);
  return c.json({ borehole_driller: profile });
});

boreholeDrillerRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { company_name?: string; coren_number?: string; state_water_board_reg?: string; cac_rc?: string; rig_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { companyName: body.company_name, corenNumber: body.coren_number, stateWaterBoardReg: body.state_water_board_reg, cacRc: body.cac_rc, rigCount: body.rig_count });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ borehole_driller: updated });
});

boreholeDrillerRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as BoreholeDrillerFSMState;
  if (!isValidBoreholeDrillerTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'coren_verified') {
    const g = guardClaimedToCorenVerified({ corenNumber: profile.corenNumber ?? null, stateWaterBoardReg: profile.stateWaterBoardReg ?? null, kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ borehole_driller: updated });
});

boreholeDrillerRoutes.post('/:id/projects', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { client_phone?: string; location_address?: string; state?: string; depth_metres?: number; casing_type?: string; total_cost_kobo?: number; deposit_kobo?: number; water_board_approval_number?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.client_phone || !body.location_address || body.depth_metres === undefined || body.total_cost_kobo === undefined) return c.json({ error: 'client_phone, location_address, depth_metres, total_cost_kobo are required' }, 400);
  const repo = new BoreholeDrillerRepository(c.env.DB);
  try {
    const project = await repo.createProject({ workspaceId: id, tenantId: auth.tenantId, clientPhone: body.client_phone, locationAddress: body.location_address, state: body.state, depthMetres: body.depth_metres, casingType: body.casing_type, totalCostKobo: body.total_cost_kobo, depositKobo: body.deposit_kobo, waterBoardApprovalNumber: body.water_board_approval_number });
    return c.json({ project }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

boreholeDrillerRoutes.get('/:id/projects', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const projects = await repo.listProjects(id, auth.tenantId);
  return c.json({ projects, count: projects.length });
});

boreholeDrillerRoutes.patch('/:id/projects/:projectId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { projectId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const updated = await repo.updateProjectStatus(projectId, auth.tenantId, body.status as BoreholeProjectStatus);
  if (!updated) return c.json({ error: 'Project not found' }, 404);
  return c.json({ project: updated });
});

boreholeDrillerRoutes.post('/:id/rigs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { rig_name?: string; rig_capacity_metres?: number; current_project_id?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.rig_name || body.rig_capacity_metres === undefined) return c.json({ error: 'rig_name, rig_capacity_metres are required' }, 400);
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const rig = await repo.createRig({ workspaceId: id, tenantId: auth.tenantId, rigName: body.rig_name, rigCapacityMetres: body.rig_capacity_metres, currentProjectId: body.current_project_id });
  return c.json({ rig }, 201);
});

boreholeDrillerRoutes.get('/:id/rigs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const rigs = await repo.listRigs(id, auth.tenantId);
  return c.json({ rigs, count: rigs.length });
});

boreholeDrillerRoutes.patch('/:id/rigs/:rigId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { rigId } = c.req.param();
  let body: { status?: string; current_project_id?: string | null };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new BoreholeDrillerRepository(c.env.DB);
  const updated = await repo.updateRigStatus(rigId, auth.tenantId, body.status as RigStatus, body.current_project_id);
  if (!updated) return c.json({ error: 'Rig not found' }, 404);
  return c.json({ rig: updated });
});

boreholeDrillerRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new BoreholeDrillerRepository(c.env.DB);
    const projects = await repo.listProjects(id, auth.tenantId);
    const advisory = projects.map(p => ({ status: p.status, depth_metres: p.depthMetres, total_cost_kobo: p.totalCostKobo, balance_kobo: p.balanceKobo }));
    return c.json({ capability: 'PROJECT_CASHFLOW', advisory_data: advisory, count: advisory.length });
  },
);
