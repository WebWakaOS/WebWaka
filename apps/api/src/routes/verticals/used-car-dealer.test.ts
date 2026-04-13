/**
 * Used Car Dealer vertical route tests — P11
 * FSM: seeded → claimed → frsc_verified → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, listings, inspection, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { usedCarDealerRoutes } from './used-car-dealer.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createListing: vi.fn(), listListings: vi.fn(), updateListingStatus: vi.fn(), updateInspectionStatus: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-used-car-dealer', () => ({
  UsedCarDealerRepository: vi.fn(() => mockRepo),
  isValidUsedCarDealerTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToFrscVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', usedCarDealerRoutes);
  return w;
}

const MOCK = { id: 'ucd_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', dealershipName: 'Prime Motors Lagos', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create used car dealer profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with used_car_dealer key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', dealership_name: 'Prime Motors Lagos' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { used_car_dealer: typeof MOCK };
    expect(body.used_car_dealer.dealershipName).toBe('Prime Motors Lagos');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dealership_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', dealership_name: 'Kano Auto Centre' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns used_car_dealer profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { used_car_dealer: typeof MOCK };
    expect(body.used_car_dealer.id).toBe('ucd_001');
  });
});

describe('GET /:id — get used car dealer profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ucd_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { used_car_dealer: typeof MOCK };
    expect(body.used_car_dealer.id).toBe('ucd_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ucd_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ucd_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ucd_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ucd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { used_car_dealer: typeof CLAIMED };
    expect(body.used_car_dealer.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/ucd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ucd_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidUsedCarDealerTransition } = await import('@webwaka/verticals-used-car-dealer');
    vi.mocked(isValidUsedCarDealerTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ucd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/listings — create car listing', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with listing', async () => {
    const listing = { id: 'lst_001', profileId: 'ucd_001', makeModel: 'Toyota Camry 2018', askingPriceKobo: 850000000 };
    mockRepo.createListing.mockResolvedValueOnce(listing);
    const res = await makeApp().request('/ucd_001/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ make: 'Toyota', model: 'Camry', year: 2018, mileage_km: 85000, asking_price_kobo: 850000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { listing: typeof listing };
    expect(body.listing.askingPriceKobo).toBe(850000000);
  });
});

describe('GET /:id/listings — list car listings', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of listings', async () => {
    mockRepo.listListings.mockResolvedValueOnce([{ id: 'lst_001' }, { id: 'lst_002' }]);
    const res = await makeApp().request('/ucd_001/listings');
    expect(res.status).toBe(200);
    const body = await res.json() as { listings: { id: string }[]; count: number };
    expect(body.listings).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('PATCH /:id/listings/:listingId/inspection — update inspection status', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns updated listing with inspection data', async () => {
    const updated = { id: 'lst_001', profileId: 'ucd_001', inspectionStatus: 'passed', inspectionNotes: 'Good condition' };
    mockRepo.updateInspectionStatus.mockResolvedValueOnce(updated);
    const res = await makeApp().request('/ucd_001/listings/lst_001/inspection', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inspection_status: 'passed', inspection_notes: 'Good condition' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { listing: typeof updated };
    expect(body.listing.inspectionStatus).toBe('passed');
  });
});
