/**
 * Hair Salon / Barbing Salon vertical routes — M10 Commerce P3
 *
 * POST   /hair-salon                         — Create profile
 * GET    /hair-salon/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /hair-salon/:id                     — Get profile (T3)
 * PATCH  /hair-salon/:id                     — Update profile
 * POST   /hair-salon/:id/transition          — FSM transition
 * POST   /hair-salon/:id/services            — Create service (P9)
 * GET    /hair-salon/:id/services            — List services (T3)
 * POST   /hair-salon/:id/daily-log           — Record daily log (P9)
 * GET    /hair-salon/:id/daily-log           — List daily logs (T3)
 * GET    /hair-salon/:id/ai-advisory         — AI advisory
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  HairSalonRepository,
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidHairSalonTransition,
} from '@webwaka/verticals-hair-salon';
import type { HairSalonFSMState } from '@webwaka/verticals-hair-salon';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const hairSalonRoutes = new Hono<{ Bindings: Env }>();

hairSalonRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; salon_name?: string; type?: string; lg_permit_number?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.salon_name) return c.json({ error: 'workspace_id, salon_name are required' }, 400);
  const repo = new HairSalonRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, salonName: body.salon_name, type: (body.type ?? 'barbing') as never, lgPermitNumber: body.lg_permit_number, state: body.state, lga: body.lga });
  return c.json({ hair_salon: profile }, 201);
});

hairSalonRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new HairSalonRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ hair_salon: profile });
});

hairSalonRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new HairSalonRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Hair salon profile not found' }, 404);
  return c.json({ hair_salon: profile });
});

hairSalonRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { salon_name?: string; type?: string; lg_permit_number?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new HairSalonRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { salonName: body.salon_name, type: body.type as never, lgPermitNumber: body.lg_permit_number, state: body.state, lga: body.lga });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ hair_salon: updated });
});

hairSalonRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new HairSalonRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as HairSalonFSMState;
  if (!isValidHairSalonTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'active') {
    const g = guardClaimedToActive({} as never);
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ hair_salon: updated });
});

hairSalonRoutes.post('/:id/services', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { service_name?: string; price_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.service_name || body.price_kobo === undefined) return c.json({ error: 'service_name, price_kobo are required' }, 400);
  const repo = new HairSalonRepository(c.env.DB);
  try {
    const service = await repo.createService({ workspaceId: id, tenantId: auth.tenantId, serviceName: body.service_name, priceKobo: body.price_kobo });
    return c.json({ service }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

hairSalonRoutes.get('/:id/services', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new HairSalonRepository(c.env.DB);
  const services = await repo.listServices(id, auth.tenantId);
  return c.json({ services, count: services.length });
});

hairSalonRoutes.post('/:id/daily-log', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { log_date?: number; customers_served?: number; revenue_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.log_date === undefined || body.revenue_kobo === undefined) return c.json({ error: 'log_date, revenue_kobo are required' }, 400);
  const repo = new HairSalonRepository(c.env.DB);
  try {
    const log = await repo.createDailyLog({ workspaceId: id, tenantId: auth.tenantId, logDate: body.log_date, customersServed: body.customers_served, revenueKobo: body.revenue_kobo });
    return c.json({ daily_log: log }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

hairSalonRoutes.get('/:id/daily-log', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new HairSalonRepository(c.env.DB);
  const logs = await repo.listDailyLogs(id, auth.tenantId);
  return c.json({ daily_logs: logs, count: logs.length });
});

hairSalonRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new HairSalonRepository(c.env.DB);
    const logs = await repo.listDailyLogs(id, auth.tenantId);
    const advisory = logs.map(l => ({ log_date: l.logDate, customers_served: l.customersServed, revenue_kobo: l.revenueKobo }));
    return c.json({ capability: 'SALES_FORECAST', advisory_data: advisory, count: advisory.length });
  },
);
