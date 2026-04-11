/**
 * Shoemaker / Cobbler vertical routes — M10 Commerce P3
 *
 * POST   /shoemaker                         — Create profile
 * GET    /shoemaker/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /shoemaker/:id                     — Get profile (T3)
 * PATCH  /shoemaker/:id                     — Update profile
 * POST   /shoemaker/:id/transition          — FSM transition
 * POST   /shoemaker/:id/jobs                — Create bespoke job (P9 shoe_size integer)
 * GET    /shoemaker/:id/jobs                — List jobs (T3)
 * PATCH  /shoemaker/:id/jobs/:jobId/status  — Update job status
 * POST   /shoemaker/:id/catalogue           — Create catalogue item (P9)
 * GET    /shoemaker/:id/catalogue           — List catalogue (T3)
 * GET    /shoemaker/:id/ai-advisory         — AI advisory
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  ShoemakerRepository,
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidShoemakerTransition,
} from '@webwaka/verticals-shoemaker';
import type { ShoemakerFSMState } from '@webwaka/verticals-shoemaker';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const shoemakerRoutes = new Hono<{ Bindings: Env }>();

shoemakerRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; shop_name?: string; speciality?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.shop_name) return c.json({ error: 'workspace_id, shop_name are required' }, 400);
  const repo = new ShoemakerRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, shopName: body.shop_name, speciality: body.speciality, state: body.state, lga: body.lga });
  return c.json({ shoemaker: profile }, 201);
});

shoemakerRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new ShoemakerRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ shoemaker: profile });
});

shoemakerRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ShoemakerRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Shoemaker profile not found' }, 404);
  return c.json({ shoemaker: profile });
});

shoemakerRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { shop_name?: string; speciality?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new ShoemakerRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { shopName: body.shop_name, speciality: body.speciality, state: body.state, lga: body.lga });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ shoemaker: updated });
});

shoemakerRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new ShoemakerRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as ShoemakerFSMState;
  if (!isValidShoemakerTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'active') {
    const g = guardClaimedToActive({} as never);
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ shoemaker: updated });
});

shoemakerRoutes.post('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { customer_phone?: string; job_type?: string; shoe_size?: number; material?: string; price_kobo?: number; deposit_kobo?: number; due_date?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.customer_phone || !body.job_type || body.shoe_size === undefined || body.price_kobo === undefined) return c.json({ error: 'customer_phone, job_type, shoe_size, price_kobo are required' }, 400);
  const repo = new ShoemakerRepository(c.env.DB);
  try {
    const job = await repo.createJob({ workspaceId: id, tenantId: auth.tenantId, customerPhone: body.customer_phone, jobType: body.job_type as never, shoeSize: body.shoe_size, material: body.material, priceKobo: body.price_kobo, depositKobo: body.deposit_kobo, dueDate: body.due_date });
    return c.json({ job }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

shoemakerRoutes.get('/:id/jobs', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ShoemakerRepository(c.env.DB);
  const jobs = await repo.listJobs(id, auth.tenantId);
  return c.json({ jobs, count: jobs.length });
});

shoemakerRoutes.patch('/:id/jobs/:jobId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { jobId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new ShoemakerRepository(c.env.DB);
  const updated = await repo.updateJobStatus(jobId, auth.tenantId, body.status as never);
  if (!updated) return c.json({ error: 'Job not found' }, 404);
  return c.json({ job: updated });
});

shoemakerRoutes.post('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { item_name?: string; price_kobo?: number; shoe_size?: number; stock_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.item_name || body.price_kobo === undefined) return c.json({ error: 'item_name, price_kobo are required' }, 400);
  const repo = new ShoemakerRepository(c.env.DB);
  try {
    const item = await repo.createCatalogueItem({ workspaceId: id, tenantId: auth.tenantId, itemName: body.item_name, priceKobo: body.price_kobo, shoeSize: body.shoe_size, stockCount: body.stock_count });
    return c.json({ catalogue_item: item }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

shoemakerRoutes.get('/:id/catalogue', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new ShoemakerRepository(c.env.DB);
  const items = await repo.listCatalogueItems(id, auth.tenantId);
  return c.json({ catalogue: items, count: items.length });
});

shoemakerRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new ShoemakerRepository(c.env.DB);
    const jobs = await repo.listJobs(id, auth.tenantId);
    const advisory = jobs.map(j => ({ job_type: j.jobType, shoe_size: j.shoeSize, price_kobo: j.priceKobo, status: j.status }));
    return c.json({ capability: 'SALES_FORECAST', advisory_data: advisory, count: advisory.length });
  },
);
