/**
 * Hair Salon vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, services, daily logs, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { hairSalonRoutes } from './hair-salon.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createService: vi.fn(), listServices: vi.fn(),
    createDailyLog: vi.fn(), listDailyLogs: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-hair-salon', () => ({
  HairSalonRepository: vi.fn(() => mockRepo),
  isValidHairSalonTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToActive: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', hairSalonRoutes);
  return w;
}

const MOCK = { id: 'hs_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', salonName: 'Glam Hair Studio', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create hair salon profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with hair_salon key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', salon_name: 'Glam Hair Studio' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { hair_salon: typeof MOCK };
    expect(body.hair_salon.salonName).toBe('Glam Hair Studio');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', salon_name: 'Abuja Hair Lounge' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns hair_salon profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { hair_salon: typeof MOCK };
    expect(body.hair_salon.id).toBe('hs_001');
  });
});

describe('GET /:id — get hair salon profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/hs_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { hair_salon: typeof MOCK };
    expect(body.hair_salon.id).toBe('hs_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/hs_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/hs_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('hs_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/hs_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { hair_salon: typeof CLAIMED };
    expect(body.hair_salon.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/hs_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/hs_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidHairSalonTransition } = await import('@webwaka/verticals-hair-salon');
    vi.mocked(isValidHairSalonTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/hs_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/services — create service', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with service record', async () => {
    const service = { id: 'svc_001', profileId: 'hs_001', serviceName: 'Relaxer', priceKobo: 500000 };
    mockRepo.createService.mockResolvedValueOnce(service);
    const res = await makeApp().request('/hs_001/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service_name: 'Relaxer', category: 'chemical', price_kobo: 500000, duration_minutes: 90 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { service: typeof service };
    expect(body.service.serviceName).toBe('Relaxer');
  });
});

describe('GET /:id/services — list services', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of services', async () => {
    mockRepo.listServices.mockResolvedValueOnce([{ id: 'svc_001' }, { id: 'svc_002' }, { id: 'svc_003' }]);
    const res = await makeApp().request('/hs_001/services');
    expect(res.status).toBe(200);
    const body = await res.json() as { services: { id: string }[]; count: number };
    expect(body.services).toHaveLength(3);
    expect(body.count).toBe(3);
  });
});

describe('POST /:id/daily-log — create daily revenue log', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with daily log', async () => {
    const log = { id: 'log_001', profileId: 'hs_001', totalRevenueKobo: 3500000, customerCount: 7 };
    mockRepo.createDailyLog.mockResolvedValueOnce(log);
    const res = await makeApp().request('/hs_001/daily-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ log_date: 1700000000, revenue_kobo: 3500000, customer_count: 7 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { daily_log: typeof log };
    expect(body.daily_log.customerCount).toBe(7);
  });
});
