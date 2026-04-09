/**
 * Phone Repair Shop vertical routes — M10 Commerce P3
 *
 * POST   /phone-repair-shop                         — Create profile
 * GET    /phone-repair-shop/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /phone-repair-shop/:id                     — Get profile (T3)
 * PATCH  /phone-repair-shop/:id                     — Update profile
 * POST   /phone-repair-shop/:id/transition          — FSM transition
 * POST   /phone-repair-shop/:id/jobs                — Create repair job (P9, P13 IMEI guard)
 * GET    /phone-repair-shop/:id/jobs                — List jobs (T3)
 * PATCH  /phone-repair-shop/:id/jobs/:jobId/status  — Update job status
 * POST   /phone-repair-shop/:id/parts               — Create part (P9)
 * GET    /phone-repair-shop/:id/parts               — List parts (T3)
 * GET    /phone-repair-shop/:id/ai-advisory         — AI advisory (P13: IMEI stripped)
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  PhoneRepairShopRepository,
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidPhoneRepairTransition,
} from '@webwaka/verticals-phone-repair-shop';
import type { PhoneRepairFSMState } from '@webwaka/verticals-phone-repair-shop';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const phoneRepairShopRoutes = new Hono<{ Bindings: Env }>();

phoneRepairShopRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; shop_name?: string; lg_permit_number?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.shop_name) return c.json({ error: 'workspace_id, shop_name are required' }, 400);
  const repo = new PhoneRepairShopRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, shopName: body.shop_name, lgPermitNumber: body.lg_permit_number, state: body.state, lga: body.lga });
  return c.json({ phone_repair_shop: profile }, 201);
});

phoneRepairShopRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new PhoneRepairShopRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ phone_repair_shop: profile });
});

phoneRepairShopRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new PhoneRepairShopRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Phone repair shop profile not found' }, 404);
  return c.json({ phone_repair_shop: profile });
});

phoneRepairShopRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { shop_name?: string; lg_permit_number?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new PhoneRepairShopRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { shopName: body.shop_name, lgPermitNumber: body.lg_permit_number, state: body.state, lga: body.lga });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ phone_repair_shop: updated });
});

phoneRepairShopRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new PhoneRepairShopRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as PhoneRepairFSMState;
  if (!isValidPhoneRepairTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'active') {
    const g = guardClaimedToActive({} as never);
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ phone_repair_shop: updated });
});

phoneRepairShopRoutes.post('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { customer_phone?: string; device_brand?: string; device_model?: string; imei?: string; fault_description?: string; labour_kobo?: number; parts_kobo?: number; total_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.customer_phone || !body.device_brand || !body.device_model || !body.fault_description || body.labour_kobo === undefined || body.total_kobo === undefined) return c.json({ error: 'customer_phone, device_brand, device_model, fault_description, labour_kobo, total_kobo are required' }, 400);
  const repo = new PhoneRepairShopRepository(c.env.DB);
  try {
    const job = await repo.createJob({ workspaceId: id, tenantId: auth.tenantId, customerPhone: body.customer_phone, deviceBrand: body.device_brand, deviceModel: body.device_model, imei: body.imei, faultDescription: body.fault_description, labourKobo: body.labour_kobo, partsKobo: body.parts_kobo, totalKobo: body.total_kobo });
    return c.json({ job }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

phoneRepairShopRoutes.get('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new PhoneRepairShopRepository(c.env.DB);
  const jobs = await repo.listJobs(id, auth.tenantId);
  return c.json({ jobs, count: jobs.length });
});

phoneRepairShopRoutes.patch('/:id/jobs/:jobId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { jobId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new PhoneRepairShopRepository(c.env.DB);
  const updated = await repo.updateJobStatus(jobId, auth.tenantId, body.status as never);
  if (!updated) return c.json({ error: 'Job not found' }, 404);
  return c.json({ job: updated });
});

phoneRepairShopRoutes.post('/:id/parts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { part_name?: string; compatible_models?: string; quantity?: number; unit_cost_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.part_name || body.unit_cost_kobo === undefined) return c.json({ error: 'part_name, unit_cost_kobo are required' }, 400);
  const repo = new PhoneRepairShopRepository(c.env.DB);
  try {
    const part = await repo.createPart({ workspaceId: id, tenantId: auth.tenantId, partName: body.part_name, compatibleModels: body.compatible_models, quantity: body.quantity, unitCostKobo: body.unit_cost_kobo });
    return c.json({ part }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

phoneRepairShopRoutes.get('/:id/parts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new PhoneRepairShopRepository(c.env.DB);
  const parts = await repo.listParts(id, auth.tenantId);
  return c.json({ parts, count: parts.length });
});

// AI advisory — P13: IMEI and customer_phone stripped; device brand + amounts only
phoneRepairShopRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new PhoneRepairShopRepository(c.env.DB);
    const jobs = await repo.listJobs(id, auth.tenantId);
    const advisory = jobs.map(j => ({ device_brand: j.deviceBrand, status: j.status, labour_kobo: j.labourKobo, total_kobo: j.totalKobo }));
    return c.json({ capability: 'PARTS_DEMAND_FORECAST', advisory_data: advisory, count: advisory.length });
  },
);
