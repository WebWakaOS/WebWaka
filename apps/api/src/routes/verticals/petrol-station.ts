/**
 * Petrol Station vertical routes — M11 Commerce P3
 *
 * POST   /petrol-station                         — Create profile
 * GET    /petrol-station/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /petrol-station/:id                     — Get profile (T3)
 * PATCH  /petrol-station/:id                     — Update profile
 * POST   /petrol-station/:id/transition          — FSM transition
 * POST   /petrol-station/:id/nozzles             — Create nozzle (P9)
 * GET    /petrol-station/:id/nozzles             — List nozzles (T3)
 * PATCH  /petrol-station/:id/nozzles/:nozzleId/closing — Update closing reading (P9)
 * POST   /petrol-station/:id/fleet-credits       — Create fleet credit account (P9)
 * GET    /petrol-station/:id/fleet-credits       — List fleet credit accounts (T3)
 * GET    /petrol-station/:id/ai-advisory         — AI advisory
 *
 * Platform Invariants: T3, P9
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  PetrolStationRepository,
  guardSeedToClaimed,
  guardClaimedToNuprcVerified,
  isValidPetrolStationTransition,
} from '@webwaka/verticals-petrol-station';
import type { PetrolStationFSMState } from '@webwaka/verticals-petrol-station';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const petrolStationRoutes = new Hono<{ Bindings: Env }>();

petrolStationRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; station_name?: string; nuprc_licence?: string; dpms_id?: string; address?: string; state?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.station_name) return c.json({ error: 'workspace_id, station_name are required' }, 400);
  const repo = new PetrolStationRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, stationName: body.station_name, nuprcLicence: body.nuprc_licence, dpmsId: body.dpms_id, address: body.address, state: body.state });
  return c.json({ petrol_station: profile }, 201);
});

petrolStationRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new PetrolStationRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ petrol_station: profile });
});

petrolStationRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new PetrolStationRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Petrol station profile not found' }, 404);
  return c.json({ petrol_station: profile });
});

petrolStationRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { station_name?: string; nuprc_licence?: string; dpms_id?: string; address?: string; state?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new PetrolStationRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { stationName: body.station_name, nuprcLicence: body.nuprc_licence, dpmsId: body.dpms_id, address: body.address, state: body.state });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ petrol_station: updated });
});

petrolStationRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new PetrolStationRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as PetrolStationFSMState;
  if (!isValidPetrolStationTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'nuprc_verified') {
    const g = guardClaimedToNuprcVerified({ nuprcLicence: profile.nuprcLicence ?? null, kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ petrol_station: updated });
});

petrolStationRoutes.post('/:id/nozzles', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { fuel_type?: string; pump_id?: string; opening_reading_litres?: number; price_per_litre_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.fuel_type || !body.pump_id || body.opening_reading_litres === undefined || body.price_per_litre_kobo === undefined) return c.json({ error: 'fuel_type, pump_id, opening_reading_litres, price_per_litre_kobo are required' }, 400);
  const repo = new PetrolStationRepository(c.env.DB);
  try {
    const nozzle = await repo.createNozzle({ workspaceId: id, tenantId: auth.tenantId, fuelType: body.fuel_type as never, pumpId: body.pump_id, openingReadingLitres: body.opening_reading_litres, pricePerLitreKobo: body.price_per_litre_kobo });
    return c.json({ nozzle }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

petrolStationRoutes.get('/:id/nozzles', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new PetrolStationRepository(c.env.DB);
  const nozzles = await repo.listNozzles(id, auth.tenantId);
  return c.json({ nozzles, count: nozzles.length });
});

petrolStationRoutes.patch('/:id/nozzles/:nozzleId/closing', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { nozzleId } = c.req.param();
  let body: { closing_reading_litres?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (body.closing_reading_litres === undefined) return c.json({ error: 'closing_reading_litres is required' }, 400);
  const repo = new PetrolStationRepository(c.env.DB);
  try {
    const updated = await repo.updateNozzleClosingReading(nozzleId, auth.tenantId, body.closing_reading_litres);
    if (!updated) return c.json({ error: 'Nozzle not found' }, 404);
    return c.json({ nozzle: updated });
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

petrolStationRoutes.post('/:id/fleet-credits', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { fleet_name?: string; fleet_phone?: string; credit_limit_kobo?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.fleet_name || !body.fleet_phone || body.credit_limit_kobo === undefined) return c.json({ error: 'fleet_name, fleet_phone, credit_limit_kobo are required' }, 400);
  const repo = new PetrolStationRepository(c.env.DB);
  try {
    const fleet = await repo.createFleetCredit({ workspaceId: id, tenantId: auth.tenantId, fleetName: body.fleet_name, fleetPhone: body.fleet_phone, creditLimitKobo: body.credit_limit_kobo });
    return c.json({ fleet_credit: fleet }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

petrolStationRoutes.get('/:id/fleet-credits', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new PetrolStationRepository(c.env.DB);
  const credits = await repo.listFleetCredits(id, auth.tenantId);
  return c.json({ fleet_credits: credits, count: credits.length });
});

petrolStationRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new PetrolStationRepository(c.env.DB);
    const nozzles = await repo.listNozzles(id, auth.tenantId);
    const advisory = nozzles.map(n => ({ fuel_type: n.fuelType, opening_reading_litres: n.openingReadingLitres, closing_reading_litres: n.closingReadingLitres, price_per_litre_kobo: n.pricePerLitreKobo }));
    return c.json({ capability: 'DEMAND_FORECAST', advisory_data: advisory, count: advisory.length });
  },
);
