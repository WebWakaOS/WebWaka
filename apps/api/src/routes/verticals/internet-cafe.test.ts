/**
 * Internet Cafe vertical route tests — P10 Set I (old-style named export)
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (stations, sessions).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { internetCafeRoutes } from './internet-cafe.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    transitionStatus: vi.fn(), addStation: vi.fn(), listStations: vi.fn(),
    startSession: vi.fn(), listSessions: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-internet-cafe', () => ({
  InternetCafeRepository: vi.fn(() => mockRepo),
  isValidInternetCafeTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', internetCafeRoutes);
  return w;
}

const MOCK = { id: 'ic_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'NetZone Cafe', status: 'seeded' };

describe('POST / — create internet cafe profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with internet_cafe key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'NetZone Cafe', workstation_count: 20 }) });
    expect(res.status).toBe(201);
    const json = await res.json() as { internet_cafe: unknown };
    expect(json).toHaveProperty('internet_cafe');
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'X Cafe' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });

  it('returns 400 when workspace_id missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'NetZone Cafe' }) });
    expect(res.status).toBe(400);
  });
});

describe('GET /:id', () => {
  it('returns 200 with internet_cafe key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ic_001');
    expect(res.status).toBe(200);
    const json = await res.json() as { internet_cafe: unknown };
    expect(json).toHaveProperty('internet_cafe');
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx')).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/ic_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidInternetCafeTransition } = await import('@webwaka/verticals-internet-cafe');
    (isValidInternetCafeTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/ic_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /:id/stations', () => {
  it('returns 201 for valid station addition', async () => {
    mockRepo.addStation.mockResolvedValueOnce({ id: 'stn_001', stationNumber: 'PC-01' });
    const res = await makeApp().request('/ic_001/stations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ station_number: 'PC-01', station_type: 'desktop' }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /:id/sessions', () => {
  it('returns 201 for valid session start', async () => {
    mockRepo.startSession.mockResolvedValueOnce({ id: 'sess_001', durationMinutes: 60 });
    const res = await makeApp().request('/ic_001/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ station_id: 'stn_001', customer_ref_id: 'cust_a', duration_minutes: 60, per_minute_kobo: 500, session_total_kobo: 30000 }) });
    expect(res.status).toBe(201);
  });
});
