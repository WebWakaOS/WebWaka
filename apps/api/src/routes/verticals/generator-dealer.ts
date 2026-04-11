/**
 * Generator Dealer vertical routes — M11 Commerce P3
 *
 * POST   /generator-dealer                         — Create profile
 * GET    /generator-dealer/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /generator-dealer/:id                     — Get profile (T3)
 * PATCH  /generator-dealer/:id                     — Update profile
 * POST   /generator-dealer/:id/transition          — FSM transition
 * POST   /generator-dealer/:id/units               — Create generator unit (P9 KVA integer)
 * GET    /generator-dealer/:id/units               — List units (T3)
 * PATCH  /generator-dealer/:id/units/:unitId/status — Update unit status
 * POST   /generator-dealer/:id/service-jobs        — Create service job (P9, P13)
 * GET    /generator-dealer/:id/service-jobs        — List service jobs (T3)
 * PATCH  /generator-dealer/:id/service-jobs/:jobId/status — Update service job status
 * POST   /generator-dealer/:id/spare-parts         — Create spare part
 * GET    /generator-dealer/:id/spare-parts         — List spare parts (T3)
 * GET    /generator-dealer/:id/ai-advisory         — AI advisory (P13: customer details stripped)
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  GeneratorDealerRepository,
  guardSeedToClaimed,
  guardClaimedToSonVerified,
  isValidGeneratorDealerTransition,
} from '@webwaka/verticals-generator-dealer';
import type { GeneratorDealerFSMState, GeneratorUnitStatus, ServiceJobStatus } from '@webwaka/verticals-generator-dealer';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const generatorDealerRoutes = new Hono<{ Bindings: Env }>();

generatorDealerRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; company_name?: string; cac_rc?: string; son_dealership?: string; dpr_fuel_licence?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.company_name) return c.json({ error: 'workspace_id, company_name are required' }, 400);
  const repo = new GeneratorDealerRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, companyName: body.company_name, cacRc: body.cac_rc, sonDealership: body.son_dealership, dprFuelLicence: body.dpr_fuel_licence });
  return c.json({ generator_dealer: profile }, 201);
});

generatorDealerRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new GeneratorDealerRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ generator_dealer: profile });
});

generatorDealerRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new GeneratorDealerRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Generator dealer profile not found' }, 404);
  return c.json({ generator_dealer: profile });
});

generatorDealerRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { company_name?: string; cac_rc?: string; son_dealership?: string; dpr_fuel_licence?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new GeneratorDealerRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { companyName: body.company_name, cacRc: body.cac_rc, sonDealership: body.son_dealership, dprFuelLicence: body.dpr_fuel_licence });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ generator_dealer: updated });
});

generatorDealerRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new GeneratorDealerRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as GeneratorDealerFSMState;
  if (!isValidGeneratorDealerTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'son_verified') {
    const g = guardClaimedToSonVerified({ sonDealership: profile.sonDealership ?? null, kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ generator_dealer: updated });
});

generatorDealerRoutes.post('/:id/units', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { brand?: string; kva?: number; serial_number?: string; sale_price_kobo?: number; warranty_months?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.brand || body.kva === undefined || !body.serial_number || body.sale_price_kobo === undefined) return c.json({ error: 'brand, kva, serial_number, sale_price_kobo are required' }, 400);
  const repo = new GeneratorDealerRepository(c.env.DB);
  try {
    const unit = await repo.createUnit({ workspaceId: id, tenantId: auth.tenantId, brand: body.brand, kva: body.kva, serialNumber: body.serial_number, salePriceKobo: body.sale_price_kobo, warrantyMonths: body.warranty_months });
    return c.json({ unit }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

generatorDealerRoutes.get('/:id/units', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new GeneratorDealerRepository(c.env.DB);
  const units = await repo.listUnits(id, auth.tenantId);
  return c.json({ units, count: units.length });
});

generatorDealerRoutes.patch('/:id/units/:unitId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { unitId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new GeneratorDealerRepository(c.env.DB);
  const updated = await repo.updateUnitStatus(unitId, auth.tenantId, body.status as GeneratorUnitStatus);
  if (!updated) return c.json({ error: 'Unit not found' }, 404);
  return c.json({ unit: updated });
});

generatorDealerRoutes.post('/:id/service-jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { unit_serial?: string; client_phone?: string; fault_description?: string; labour_kobo?: number; parts_kobo?: number; total_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.unit_serial || !body.client_phone || !body.fault_description || body.labour_kobo === undefined || body.total_kobo === undefined) return c.json({ error: 'unit_serial, client_phone, fault_description, labour_kobo, total_kobo are required' }, 400);
  const repo = new GeneratorDealerRepository(c.env.DB);
  try {
    const job = await repo.createServiceJob({ workspaceId: id, tenantId: auth.tenantId, unitSerial: body.unit_serial, clientPhone: body.client_phone, faultDescription: body.fault_description, labourKobo: body.labour_kobo, partsKobo: body.parts_kobo, totalKobo: body.total_kobo });
    return c.json({ service_job: job }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

generatorDealerRoutes.get('/:id/service-jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new GeneratorDealerRepository(c.env.DB);
  const jobs = await repo.listServiceJobs(id, auth.tenantId);
  return c.json({ service_jobs: jobs, count: jobs.length });
});

generatorDealerRoutes.patch('/:id/service-jobs/:jobId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { jobId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new GeneratorDealerRepository(c.env.DB);
  const updated = await repo.updateServiceJobStatus(jobId, auth.tenantId, body.status as ServiceJobStatus);
  if (!updated) return c.json({ error: 'Service job not found' }, 404);
  return c.json({ service_job: updated });
});

generatorDealerRoutes.post('/:id/spare-parts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { part_name?: string; compatible_brands?: string; quantity?: number; unit_cost_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.part_name || body.unit_cost_kobo === undefined) return c.json({ error: 'part_name, unit_cost_kobo are required' }, 400);
  const repo = new GeneratorDealerRepository(c.env.DB);
  try {
    const part = await repo.createSparePart({ workspaceId: id, tenantId: auth.tenantId, partName: body.part_name, compatibleBrands: body.compatible_brands, quantity: body.quantity, unitCostKobo: body.unit_cost_kobo });
    return c.json({ spare_part: part }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

generatorDealerRoutes.get('/:id/spare-parts', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new GeneratorDealerRepository(c.env.DB);
  const parts = await repo.listSpareParts(id, auth.tenantId);
  return c.json({ spare_parts: parts, count: parts.length });
});

// AI advisory — P13: client_phone stripped; fault + amounts only
generatorDealerRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new GeneratorDealerRepository(c.env.DB);
    const jobs = await repo.listServiceJobs(id, auth.tenantId);
    const advisory = jobs.map(j => ({ status: j.status, labour_kobo: j.labourKobo, total_kobo: j.totalKobo }));
    return c.json({ capability: 'SERVICE_DEMAND_FORECAST', advisory_data: advisory, count: advisory.length });
  },
);
