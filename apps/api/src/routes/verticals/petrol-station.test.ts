/**
 * Petrol Station vertical route tests — P11
 * FSM: seeded → claimed → dpr_verified → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, nozzles, fleet credit, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { petrolStationRoutes } from './petrol-station.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createNozzle: vi.fn(), listNozzles: vi.fn(), updateNozzleClosingReading: vi.fn(),
    createFleetCredit: vi.fn(), listFleetCredits: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-petrol-station', () => ({
  PetrolStationRepository: vi.fn(() => mockRepo),
  isValidPetrolStationTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToNuprcVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', petrolStationRoutes);
  return w;
}

const MOCK = { id: 'ps_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', stationName: 'Eagle Filling Station', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create petrol station profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with petrol_station key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', station_name: 'Eagle Filling Station' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { petrol_station: typeof MOCK };
    expect(body.petrol_station.stationName).toBe('Eagle Filling Station');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ station_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', station_name: 'Abuja Fuel Centre' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns petrol_station profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { petrol_station: typeof MOCK };
    expect(body.petrol_station.id).toBe('ps_001');
  });
});

describe('GET /:id — get petrol station profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ps_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { petrol_station: typeof MOCK };
    expect(body.petrol_station.id).toBe('ps_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ps_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ps_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ps_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ps_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { petrol_station: typeof CLAIMED };
    expect(body.petrol_station.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/ps_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ps_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPetrolStationTransition } = await import('@webwaka/verticals-petrol-station');
    vi.mocked(isValidPetrolStationTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ps_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/nozzles — create nozzle', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with nozzle record', async () => {
    const nozzle = { id: 'noz_001', profileId: 'ps_001', pumpNumber: 1, nozzleNumber: 1, productType: 'PMS' };
    mockRepo.createNozzle.mockResolvedValueOnce(nozzle);
    const res = await makeApp().request('/ps_001/nozzles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fuel_type: 'PMS', pump_id: 'P1', opening_reading_litres: 0, price_per_litre_kobo: 56700 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { nozzle: typeof nozzle };
    expect(body.nozzle.productType).toBe('PMS');
  });
});

describe('GET /:id/nozzles — list nozzles', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of nozzles', async () => {
    mockRepo.listNozzles.mockResolvedValueOnce([{ id: 'noz_001' }, { id: 'noz_002' }]);
    const res = await makeApp().request('/ps_001/nozzles');
    expect(res.status).toBe(200);
    const body = await res.json() as { nozzles: { id: string }[]; count: number };
    expect(body.nozzles).toHaveLength(2);
  });
});

describe('POST /:id/fleet-credits — create fleet credit', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with fleet credit', async () => {
    const credit = { id: 'fc_001', profileId: 'ps_001', fleetName: 'Dangote Fleet', creditLimitKobo: 10000000000 };
    mockRepo.createFleetCredit.mockResolvedValueOnce(credit);
    const res = await makeApp().request('/ps_001/fleet-credits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fleet_name: 'Dangote Fleet', fleet_phone: '08012345678', credit_limit_kobo: 10000000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { fleet_credit: typeof credit };
    expect(body.fleet_credit.fleetName).toBe('Dangote Fleet');
  });
});
