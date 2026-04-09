/**
 * Electronics Repair Shop vertical routes — M9 Commerce P2 A7
 *
 * POST   /electronics-repair                              — Create profile
 * GET    /electronics-repair/workspace/:workspaceId       — List (T3)
 * GET    /electronics-repair/:id                          — Get profile
 * PATCH  /electronics-repair/:id                          — Update
 * POST   /electronics-repair/:id/transition               — FSM transition
 * POST   /electronics-repair/:id/repair-jobs              — Create repair job (P9)
 * GET    /electronics-repair/:id/repair-jobs              — List repair jobs
 * PATCH  /electronics-repair/:id/repair-jobs/:jobId       — Advance job status
 * POST   /electronics-repair/:id/parts                    — Add part (P9)
 * GET    /electronics-repair/:id/parts                    — List parts
 * GET    /electronics-repair/:id/ai-advisory              — AI parts demand (P10/P12/P13)
 *
 * Platform Invariants: T3, P9, P10, P12, P13 (no IMEI/customerPhone to AI)
 * KYC Tier 2 required for device resale above ₦100,000
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { ElectronicsRepairRepository, guardSeedToClaimed, guardClaimedToCacVerified, isValidElectronicsRepairTransition } from '@webwaka/verticals-electronics-repair';
import type { ElectronicsRepairFSMState, RepairJobStatus, LocationCluster } from '@webwaka/verticals-electronics-repair';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const electronicsRepairRoutes = new Hono<{ Bindings: Env }>();

electronicsRepairRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; shop_name?: string; state?: string; location_cluster?: string; cac_number?: string; son_registration?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.shop_name || !body.state) return c.json({ error: 'workspace_id, shop_name, state are required' }, 400);
  const repo = new ElectronicsRepairRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, shopName: body.shop_name, state: body.state, locationCluster: body.location_cluster as LocationCluster | undefined, cacNumber: body.cac_number, sonRegistration: body.son_registration });
  return c.json({ electronics_repair: profile }, 201);
});

electronicsRepairRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new ElectronicsRepairRepository(c.env.DB);
  const profile = await repo.findProfileById(workspaceId, auth.tenantId);
  return c.json({ electronics_repair: profile });
});

electronicsRepairRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ElectronicsRepairRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Electronics repair profile not found' }, 404);
  return c.json({ electronics_repair: profile });
});

electronicsRepairRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { shop_name?: string; state?: string; location_cluster?: string; cac_number?: string; son_registration?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ElectronicsRepairRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { shopName: body.shop_name, state: body.state, locationCluster: body.location_cluster as LocationCluster | undefined, cacNumber: body.cac_number, sonRegistration: body.son_registration });
  if (!updated) return c.json({ error: 'Electronics repair profile not found' }, 404);
  return c.json({ electronics_repair: updated });
});

electronicsRepairRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new ElectronicsRepairRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as ElectronicsRepairFSMState;
  if (!isValidElectronicsRepairTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'cac_verified') {
    const g = guardClaimedToCacVerified({ cacNumber: profile.cacNumber });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionProfile(id, auth.tenantId, to);
  return c.json({ electronics_repair: updated });
});

electronicsRepairRoutes.post('/:id/repair-jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { device_type?: string; brand?: string; fault_description?: string; customer_phone?: string; model?: string; imei?: string; labour_cost_kobo?: number; parts_cost_kobo?: number; warranty_days?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.device_type || !body.brand || !body.fault_description || !body.customer_phone) {
    return c.json({ error: 'device_type, brand, fault_description, customer_phone are required' }, 400);
  }
  const repo = new ElectronicsRepairRepository(c.env.DB);
  try {
    const job = await repo.createRepairJob({ workspaceId: id, tenantId: auth.tenantId, deviceType: body.device_type, brand: body.brand, faultDescription: body.fault_description, customerPhone: body.customer_phone, model: body.model, imei: body.imei, labourCostKobo: body.labour_cost_kobo, partsCostKobo: body.parts_cost_kobo, warrantyDays: body.warranty_days });
    return c.json({ repair_job: job }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

electronicsRepairRoutes.get('/:id/repair-jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const status = c.req.query('status') as RepairJobStatus | undefined;
  const repo = new ElectronicsRepairRepository(c.env.DB);
  const jobs = await repo.listRepairJobs(id, auth.tenantId, status);
  return c.json({ repair_jobs: jobs, count: jobs.length });
});

electronicsRepairRoutes.patch('/:id/repair-jobs/:jobId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { jobId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new ElectronicsRepairRepository(c.env.DB);
  const job = await repo.advanceRepairJobStatus(jobId, auth.tenantId, body.status as RepairJobStatus);
  if (!job) return c.json({ error: 'Repair job not found' }, 404);
  return c.json({ repair_job: job });
});

electronicsRepairRoutes.post('/:id/parts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { part_name?: string; quantity?: number; unit_cost_kobo?: number; compatible_models?: string; supplier?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.part_name || body.quantity === undefined || body.unit_cost_kobo === undefined) {
    return c.json({ error: 'part_name, quantity, unit_cost_kobo are required' }, 400);
  }
  const repo = new ElectronicsRepairRepository(c.env.DB);
  try {
    const part = await repo.createPart({ workspaceId: id, tenantId: auth.tenantId, partName: body.part_name, quantity: body.quantity, unitCostKobo: body.unit_cost_kobo, compatibleModels: body.compatible_models, supplier: body.supplier });
    return c.json({ part }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('[P9]')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

electronicsRepairRoutes.get('/:id/parts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ElectronicsRepairRepository(c.env.DB);
  const parts = await repo.listParts(id, auth.tenantId);
  return c.json({ parts, count: parts.length });
});

// P10/P12/P13 gated AI advisory — parts demand by device brand, no IMEI/customerPhone
electronicsRepairRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new ElectronicsRepairRepository(c.env.DB);
    const parts = await repo.listParts(id, auth.tenantId);
    // P13: part_name + quantity only — no customer phone, no IMEI
    const advisory = parts.map(p => ({ part_name: p.partName, quantity: p.quantity, unit_cost_kobo: p.unitCostKobo }));
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: advisory, count: advisory.length });
  },
);
