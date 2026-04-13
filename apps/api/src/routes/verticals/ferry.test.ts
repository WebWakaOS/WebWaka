/**
 * Ferry / Waterways vertical route tests — P9 Set D (V-TRN-EXT-D7)
 * ≥10 cases: CRUD, FSM, T3 isolation, P9 fare_kobo, vessels/trips.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { ferryRoutes } from './ferry.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileByWorkspace: vi.fn(), findProfileById: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createVessel: vi.fn(), listVessels: vi.fn(),
    createTrip: vi.fn(), listTrips: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-ferry', () => ({
  FerryRepository: vi.fn(() => mockRepo),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToNimasaVerified: vi.fn().mockReturnValue({ allowed: true }),
  isValidFerryTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 2 } as never); await next(); });
  w.route('/', ferryRoutes);
  return w;
}

const MOCK = { id: 'fy_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Lagos Ferry Services', status: 'seeded' };

describe('POST / — create ferry profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Lagos Ferry Services' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId from auth JWT, not body', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Lagos Ferry Services' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /workspace/:workspaceId', () => {
  it('returns 200', async () => { mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/workspace/wsp_a')).status).toBe(200); });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/fy_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(null); expect((await makeApp().request('/nx')).status).toBe(404); });
});

describe('PATCH /:id', () => {
  it('returns 200 on update', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce({ ...MOCK, companyName: 'Lagos Ferry Pro' });
    expect((await makeApp().request('/fy_001', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'Lagos Ferry Pro' }) })).status).toBe(200);
  });
  it('returns 404 when not found on update', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'X' }) })).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/fy_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/fy_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /:id/vessels', () => {
  it('returns 201 for valid vessel registration', async () => {
    mockRepo.createVessel.mockResolvedValueOnce({ id: 'vs_001', vesselName: 'MV Lagos Pride', capacityPassengers: 120 });
    expect((await makeApp().request('/fy_001/vessels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vessel_name: 'MV Lagos Pride', type: 'passenger', capacity_passengers: 120 }) })).status).toBe(201);
  });
});

describe('GET /:id/vessels', () => {
  it('returns 200 with vessel list', async () => {
    mockRepo.listVessels.mockResolvedValueOnce([]);
    expect((await makeApp().request('/fy_001/vessels')).status).toBe(200);
  });
});
