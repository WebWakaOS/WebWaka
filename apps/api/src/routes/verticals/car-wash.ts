/**
 * Car Wash vertical routes — M10 Commerce P3
 *
 * POST   /car-wash                         — Create profile
 * GET    /car-wash/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /car-wash/:id                     — Get profile (T3)
 * PATCH  /car-wash/:id                     — Update profile
 * POST   /car-wash/:id/transition          — FSM transition
 * POST   /car-wash/:id/visits              — Record wash visit (P9)
 * GET    /car-wash/:id/visits              — List visits (T3)
 * GET    /car-wash/:id/loyalty/:plate      — Loyalty count for vehicle plate
 * GET    /car-wash/:id/ai-advisory         — AI advisory (P13)
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  CarWashRepository,
  guardSeedToClaimed,
  guardClaimedToActive,
  isValidCarWashTransition,
} from '@webwaka/verticals-car-wash';
import type { CarWashFSMState, WashType } from '@webwaka/verticals-car-wash';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const carWashRoutes = new Hono<{ Bindings: Env }>();

carWashRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; business_name?: string; lg_permit_number?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.business_name) return c.json({ error: 'workspace_id, business_name are required' }, 400);
  const repo = new CarWashRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, businessName: body.business_name, lgPermitNumber: body.lg_permit_number, state: body.state, lga: body.lga });
  return c.json({ car_wash: profile }, 201);
});

carWashRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new CarWashRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ car_wash: profile });
});

carWashRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CarWashRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Car wash profile not found' }, 404);
  return c.json({ car_wash: profile });
});

carWashRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { business_name?: string; lg_permit_number?: string; state?: string; lga?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new CarWashRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { businessName: body.business_name, lgPermitNumber: body.lg_permit_number, state: body.state, lga: body.lga });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ car_wash: updated });
});

carWashRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new CarWashRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as CarWashFSMState;
  if (!isValidCarWashTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'active') {
    const g = guardClaimedToActive({} as never);
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ car_wash: updated });
});

carWashRoutes.post('/:id/visits', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { vehicle_plate?: string; wash_type?: string; price_kobo?: number; visit_date?: number; loyalty_count?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.vehicle_plate || !body.wash_type || body.price_kobo === undefined) return c.json({ error: 'vehicle_plate, wash_type, price_kobo are required' }, 400);
  const repo = new CarWashRepository(c.env.DB);
  try {
    const visit = await repo.createVisit({ workspaceId: id, tenantId: auth.tenantId, vehiclePlate: body.vehicle_plate, washType: body.wash_type as WashType, priceKobo: body.price_kobo, visitDate: body.visit_date, loyaltyCount: body.loyalty_count });
    return c.json({ visit }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

carWashRoutes.get('/:id/visits', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new CarWashRepository(c.env.DB);
  const visits = await repo.listVisits(id, auth.tenantId);
  return c.json({ visits, count: visits.length });
});

carWashRoutes.get('/:id/loyalty/:plate', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { plate } = c.req.param();
  const repo = new CarWashRepository(c.env.DB);
  const count = await repo.getLoyaltyCount(plate, auth.tenantId);
  return c.json({ vehicle_plate: plate, loyalty_count: count });
});

carWashRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new CarWashRepository(c.env.DB);
    const visits = await repo.listVisits(id, auth.tenantId);
    const advisory = visits.map(v => ({ wash_type: v.washType, price_kobo: v.priceKobo, visit_date: v.visitDate }));
    return c.json({ capability: 'REVENUE_TREND', advisory_data: advisory, count: advisory.length });
  },
);
