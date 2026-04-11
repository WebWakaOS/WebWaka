/**
 * Used Car Dealer vertical routes — M11 Commerce P3
 *
 * POST   /used-car-dealer                         — Create profile
 * GET    /used-car-dealer/workspace/:workspaceId  — Get by workspace (T3)
 * GET    /used-car-dealer/:id                     — Get profile (T3)
 * PATCH  /used-car-dealer/:id                     — Update profile
 * POST   /used-car-dealer/:id/transition          — FSM transition
 * POST   /used-car-dealer/:id/listings            — Create car listing (P9, P13 VIN guard)
 * GET    /used-car-dealer/:id/listings            — List listings (T3)
 * PATCH  /used-car-dealer/:id/listings/:listingId/status — Update listing status
 * PATCH  /used-car-dealer/:id/listings/:listingId/inspection — Update inspection status
 * POST   /used-car-dealer/:id/test-drives         — Create test drive booking
 * GET    /used-car-dealer/:id/test-drives         — List test drive bookings (T3)
 * GET    /used-car-dealer/:id/ai-advisory         — AI advisory (P13: VIN stripped)
 *
 * Platform Invariants: T3, P9, P13
 */

import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  UsedCarDealerRepository,
  guardSeedToClaimed,
  guardClaimedToFrscVerified,
  isValidUsedCarDealerTransition,
} from '@webwaka/verticals-used-car-dealer';
import type { UsedCarDealerFSMState } from '@webwaka/verticals-used-car-dealer';
import { aiConsentGate } from '@webwaka/superagent';
import type { Env } from '../../env.js';

export const usedCarDealerRoutes = new Hono<{ Bindings: Env }>();

usedCarDealerRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: { workspace_id?: string; dealership_name?: string; cac_rc?: string; frsc_dealer_licence?: string; mssn_membership?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.workspace_id || !body.dealership_name) return c.json({ error: 'workspace_id, dealership_name are required' }, 400);
  const repo = new UsedCarDealerRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body.workspace_id, tenantId: auth.tenantId, dealershipName: body.dealership_name, cacRc: body.cac_rc, frscDealerLicence: body.frsc_dealer_licence, mssnMembership: body.mssn_membership });
  return c.json({ used_car_dealer: profile }, 201);
});

usedCarDealerRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { workspaceId } = c.req.param();
  const repo = new UsedCarDealerRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(workspaceId, auth.tenantId);
  return c.json({ used_car_dealer: profile });
});

usedCarDealerRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new UsedCarDealerRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Used car dealer profile not found' }, 404);
  return c.json({ used_car_dealer: profile });
});

usedCarDealerRoutes.patch('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { dealership_name?: string; cac_rc?: string; frsc_dealer_licence?: string; mssn_membership?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new UsedCarDealerRepository(c.env.DB);
  const updated = await repo.updateProfile(id, auth.tenantId, { dealershipName: body.dealership_name, cacRc: body.cac_rc, frscDealerLicence: body.frsc_dealer_licence, mssnMembership: body.mssn_membership });
  if (!updated) return c.json({ error: 'Profile not found' }, 404);
  return c.json({ used_car_dealer: updated });
});

usedCarDealerRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string; kycTier?: number };
  const { id } = c.req.param();
  let body: { to_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.to_status) return c.json({ error: 'to_status is required' }, 400);
  const repo = new UsedCarDealerRepository(c.env.DB);
  const profile = await repo.findProfileById(id, auth.tenantId);
  if (!profile) return c.json({ error: 'Profile not found' }, 404);
  const from = profile.status;
  const to = body.to_status as UsedCarDealerFSMState;
  if (!isValidUsedCarDealerTransition(from, to)) return c.json({ error: `Invalid FSM transition: ${from} → ${to}` }, 422);
  if (to === 'claimed') {
    const g = guardSeedToClaimed({ kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 403);
  }
  if (to === 'frsc_verified') {
    const g = guardClaimedToFrscVerified({ frscDealerLicence: profile.frscDealerLicence ?? null, kycTier: auth.kycTier ?? 0 });
    if (!g.allowed) return c.json({ error: g.reason }, 422);
  }
  const updated = await repo.transitionStatus(id, auth.tenantId, to);
  return c.json({ used_car_dealer: updated });
});

usedCarDealerRoutes.post('/:id/listings', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { make?: string; model?: string; year?: number; vin?: string; mileage_km?: number; asking_price_kobo?: number; colour_exterior?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.make || !body.model || body.year === undefined || body.mileage_km === undefined || body.asking_price_kobo === undefined) return c.json({ error: 'make, model, year, mileage_km, asking_price_kobo are required' }, 400);
  const repo = new UsedCarDealerRepository(c.env.DB);
  try {
    const listing = await repo.createListing({ workspaceId: id, tenantId: auth.tenantId, make: body.make, model: body.model, year: body.year, vin: body.vin, mileageKm: body.mileage_km, askingPriceKobo: body.asking_price_kobo, colourExterior: body.colour_exterior });
    return c.json({ listing }, 201);
  } catch (err) {
    if (err instanceof Error && err.message.includes('P9')) return c.json({ error: err.message }, 422);
    throw err;
  }
});

usedCarDealerRoutes.get('/:id/listings', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new UsedCarDealerRepository(c.env.DB);
  const listings = await repo.listListings(id, auth.tenantId);
  return c.json({ listings, count: listings.length });
});

usedCarDealerRoutes.patch('/:id/listings/:listingId/status', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { listingId } = c.req.param();
  let body: { status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.status) return c.json({ error: 'status is required' }, 400);
  const repo = new UsedCarDealerRepository(c.env.DB);
  const updated = await repo.updateListingStatus(listingId, auth.tenantId, body.status as never);
  if (!updated) return c.json({ error: 'Listing not found' }, 404);
  return c.json({ listing: updated });
});

usedCarDealerRoutes.patch('/:id/listings/:listingId/inspection', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { listingId } = c.req.param();
  let body: { inspection_status?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.inspection_status) return c.json({ error: 'inspection_status is required' }, 400);
  const repo = new UsedCarDealerRepository(c.env.DB);
  const updated = await repo.updateInspectionStatus(listingId, auth.tenantId, body.inspection_status as never);
  if (!updated) return c.json({ error: 'Listing not found' }, 404);
  return c.json({ listing: updated });
});

usedCarDealerRoutes.post('/:id/test-drives', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  let body: { listing_id?: string; client_phone?: string; scheduled_at?: number };
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body.listing_id || !body.client_phone || body.scheduled_at === undefined) return c.json({ error: 'listing_id, client_phone, scheduled_at are required' }, 400);
  const repo = new UsedCarDealerRepository(c.env.DB);
  const booking = await repo.createTestDriveBooking({ workspaceId: id, tenantId: auth.tenantId, listingId: body.listing_id, clientPhone: body.client_phone, scheduledAt: body.scheduled_at });
  return c.json({ test_drive: booking }, 201);
});

usedCarDealerRoutes.get('/:id/test-drives', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const { id } = c.req.param();
  const repo = new UsedCarDealerRepository(c.env.DB);
  const bookings = await repo.listBookings(id, auth.tenantId);
  return c.json({ test_drives: bookings, count: bookings.length });
});

// AI advisory — P13: VIN stripped; make/model/price/mileage only
usedCarDealerRoutes.get(
  '/:id/ai-advisory',
  aiConsentGate as MiddlewareHandler<{ Bindings: Env }>,
  async (c) => {
    const auth = c.get('auth') as { userId: string; tenantId: string };
    const { id } = c.req.param();
    const repo = new UsedCarDealerRepository(c.env.DB);
    const listings = await repo.listListings(id, auth.tenantId);
    const advisory = listings.map(l => ({ make: l.make, model: l.model, year: l.year, mileage_km: l.mileageKm, asking_price_kobo: l.askingPriceKobo, status: l.status }));
    return c.json({ capability: 'PRICING_ADVISOR', advisory_data: advisory, count: advisory.length });
  },
);
