/**
 * Okada / Keke vertical route tests — P11
 * FSM: seeded → claimed → lasg_registered → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, vehicles, pilots, trips, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { okadaKekeRoutes } from './okada-keke.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    addVehicle: vi.fn(), listVehicles: vi.fn(),
    addPilot: vi.fn(), listPilots: vi.fn(),
    recordTrip: vi.fn(), listTrips: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-okada-keke', () => ({
  OkadaKekeRepository: vi.fn(() => mockRepo),
  isValidOkadaKekeTransition: vi.fn().mockReturnValue(true),
  guardLagosOkadaBan: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', okadaKekeRoutes);
  return w;
}

const MOCK = { id: 'ok_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'Lagos Keke Union', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create okada/keke profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with okada_keke key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'Lagos Keke Union' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { okada_keke: typeof MOCK };
    expect(body.okada_keke.businessName).toBe('Lagos Keke Union');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Kano Okada Co-op' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get okada/keke profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ok_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { okada_keke: typeof MOCK };
    expect(body.okada_keke.id).toBe('ok_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ok_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ok_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ok_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ok_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { okada_keke: typeof CLAIMED };
    expect(body.okada_keke.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidOkadaKekeTransition } = await import('@webwaka/verticals-okada-keke');
    vi.mocked(isValidOkadaKekeTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ok_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ok_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidOkadaKekeTransition } = await import('@webwaka/verticals-okada-keke');
    vi.mocked(isValidOkadaKekeTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ok_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/vehicles — register vehicle', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with vehicle', async () => {
    const vehicle = { id: 'veh_001', profileId: 'ok_001', plateNumber: 'KJA234AB', category: 'keke_napep' };
    mockRepo.addVehicle.mockResolvedValueOnce(vehicle);
    const res = await makeApp().request('/ok_001/vehicles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: 'keke_napep', plate_number: 'KJA234AB', make_model: 'Bajaj RE' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { vehicle: typeof vehicle };
    expect(body.vehicle.category).toBe('keke_napep');
  });
});

describe('GET /:id/vehicles — list vehicles', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of vehicles', async () => {
    mockRepo.listVehicles.mockResolvedValueOnce([{ id: 'veh_001' }, { id: 'veh_002' }]);
    const res = await makeApp().request('/ok_001/vehicles');
    expect(res.status).toBe(200);
    const body = await res.json() as { vehicles: { id: string }[]; count: number };
    expect(body.vehicles).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/pilots — register pilot', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with pilot', async () => {
    const pilot = { id: 'plt_001', profileId: 'ok_001', pilotRefId: 'ref_emeka', licenceNumber: 'LIC001' };
    mockRepo.addPilot.mockResolvedValueOnce(pilot);
    const res = await makeApp().request('/ok_001/pilots', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pilot_ref_id: 'ref_emeka', licence_number: 'LIC001', vehicle_id: 'veh_001' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { pilot: typeof pilot };
    expect(body.pilot.pilotRefId).toBe('ref_emeka');
  });
});

describe('POST /:id/trips — record trip', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with trip', async () => {
    const trip = { id: 'trp_001', profileId: 'ok_001', pilotId: 'plt_001', fareKobo: 150000 };
    mockRepo.recordTrip.mockResolvedValueOnce(trip);
    const res = await makeApp().request('/ok_001/trips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pilot_id: 'plt_001', passenger_ref_id: 'ref_pax_001', fare_kobo: 150000, trip_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { trip: typeof trip };
    expect(body.trip.fareKobo).toBe(150000);
  });
});
