/**
 * Tyre Shop / Alignment Centre vertical routes — M10 Commerce P3
 *
 * POST   /tyre-shop                         — Create profile
 * GET    /tyre-shop/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /tyre-shop/:id                     — Get profile (T3)
 * PATCH  /tyre-shop/:id                     — Update profile
 * POST   /tyre-shop/:id/transition          — FSM transition
 * POST   /tyre-shop/:id/catalogue           — Create catalogue item (P9)
 * GET    /tyre-shop/:id/catalogue           — List catalogue (T3)
 * POST   /tyre-shop/:id/jobs                — Create job (P9)
 * GET    /tyre-shop/:id/jobs                — List jobs (T3)
 * PATCH  /tyre-shop/:id/jobs/:jobId/status  — Update job status
 * GET    /tyre-shop/:id/ai-advisory         — AI advisory
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  TyreShopRepository,
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidTyreShopTransition,
} from '@webwaka/verticals-tyre-shop';
import type { TyreShopFSMState } from '@webwaka/verticals-tyre-shop';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const tyreShopRoutes = new Hono<{ Bindings: Env }>();

tyreShopRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; shop_name?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.shop_name) return c.json({ error: 'workspace_id, shop_name are required' }, 400);
  const repo = new TyreShopRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, shopName: body.shop_name, state: body.state, lga: body.lga });
  return c.json({ tyre_shop: profile }, 201);
});

tyreShopRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new TyreShopRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ tyre_shop: profile });
});

tyreShopRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new TyreShopRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Tyre shop profile not found' }, 404);
  return c.json({ tyre_shop: profile });
});

tyreShopRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { shop_name?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new TyreShopRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { shopName: body.shop_name, state: body.state, lga: body.lga });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ tyre_shop: updated });
});

tyreShopRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new TyreShopRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as TyreShopFSMState;
  if (!isValidTyreShopTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'active') {
    const g = guardClaimedToActive({} as never);
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ tyre_shop: updated });
});

tyreShopRoutes.post('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { brand?: string; size?: string; unit_price_kobo?: number; quantity_in_stock?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.brand || !body.size || body.unit_price_kobo === undefined) return c.json({ error: 'brand, size, unit_price_kobo are required' }, 400);
  const repo = new TyreShopRepository(c.env.DB);
  try {
    const item = await repo.createCatalogueItem({ workspaceId: id, tenantId: auth.tenantId, brand: body.brand, size: body.size, unitPriceKobo: body.unit_price_kobo, quantityInStock: body.quantity_in_stock });
    return c.json({ catalogue_item: item }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

tyreShopRoutes.get('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new TyreShopRepository(c.env.DB);
  const items = await repo.listCatalogueItems(id, auth.tenantId);
  return c.json({ catalogue: items, count: items.length });
});

tyreShopRoutes.post('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { vehicle_plate?: string; job_type?: string; tyre_size?: string; price_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.vehicle_plate || !body.job_type || body.price_kobo === undefined) return c.json({ error: 'vehicle_plate, job_type, price_kobo are required' }, 400);
  const repo = new TyreShopRepository(c.env.DB);
  try {
    const job = await repo.createJob({ workspaceId: id, tenantId: auth.tenantId, vehiclePlate: body.vehicle_plate, jobType: body.job_type as never, tyreSize: body.tyre_size, priceKobo: body.price_kobo });
    return c.json({ job }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

tyreShopRoutes.get('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new TyreShopRepository(c.env.DB);
  const jobs = await repo.listJobs(id, auth.tenantId);
  return c.json({ jobs, count: jobs.length });
});

tyreShopRoutes.patch('/:id/jobs/:jobId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { jobId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new TyreShopRepository(c.env.DB);
  const updated = await repo.updateJobStatus(jobId, auth.tenantId, body.status as never);
  if (!updated) return c.json({ error: 'Job not found' }, 404);
  return c.json({ job: updated });
});

tyreShopRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new TyreShopRepository(c.env.DB);
    const jobs = await repo.listJobs(id, auth.tenantId);
    const advisory = jobs.map(j => ({ job_type: j.jobType, tyre_size: j.tyreSize, price_kobo: j.priceKobo, status: j.status }));
    return c.json({ capability: 'DEMAND_PLANNING', advisory_data: advisory, count: advisory.length });
  },
);
