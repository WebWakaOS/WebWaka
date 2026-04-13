/**
 * Car Wash vertical route tests — P11
 * FSM: seeded → claimed → active (old-style with to_status body key)
 * ≥10 cases: CRUD, FSM, visits, loyalty, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { carWashRoutes } from './car-wash.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createVisit: vi.fn(), listVisits: vi.fn(), getLoyaltyCount: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-car-wash', () => ({
  CarWashRepository: vi.fn(() => mockRepo),
  isValidCarWashTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToActive: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', carWashRoutes);
  return w;
}

const MOCK = { id: 'cw_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'Sparkle Car Wash', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create car wash profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with car_wash key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'Sparkle Car Wash' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { car_wash: typeof MOCK };
    expect(body.car_wash.businessName).toBe('Sparkle Car Wash');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Lagos Car Wash' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns car_wash profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { car_wash: typeof MOCK };
    expect(body.car_wash.id).toBe('cw_001');
  });

  it('T3: scopes to tenantId', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/workspace/wsp_a');
    expect(mockRepo.findProfileByWorkspace).toHaveBeenCalledWith('wsp_a', 'tnt_b');
  });
});

describe('GET /:id — get car wash profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/cw_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { car_wash: typeof MOCK };
    expect(body.car_wash.id).toBe('cw_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/cw_999');
    expect(res.status).toBe(404);
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/cw_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/cw_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/cw_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidCarWashTransition } = await import('@webwaka/verticals-car-wash');
    vi.mocked(isValidCarWashTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/cw_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/visits — record wash visit', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with visit record', async () => {
    const visit = { id: 'vis_001', vehiclePlate: 'LND123GH', washType: 'full', priceKobo: 500000 };
    mockRepo.createVisit.mockResolvedValueOnce(visit);
    const res = await makeApp().request('/cw_001/visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicle_plate: 'LND123GH', wash_type: 'full', price_kobo: 500000, visit_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { visit: typeof visit };
    expect(body.visit.vehiclePlate).toBe('LND123GH');
  });
});

describe('GET /:id/visits — list visits', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of visits', async () => {
    mockRepo.listVisits.mockResolvedValueOnce([{ id: 'vis_001' }, { id: 'vis_002' }]);
    const res = await makeApp().request('/cw_001/visits');
    expect(res.status).toBe(200);
    const body = await res.json() as { visits: { id: string }[]; count: number };
    expect(body.visits).toHaveLength(2);
  });
});

describe('GET /:id/loyalty/:plate — get loyalty count', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns loyalty count for plate', async () => {
    mockRepo.getLoyaltyCount.mockResolvedValueOnce(5);
    const res = await makeApp().request('/cw_001/loyalty/LND123GH');
    expect(res.status).toBe(200);
    const body = await res.json() as { vehicle_plate: string; loyalty_count: number };
    expect(body.loyalty_count).toBe(5);
    expect(body.vehicle_plate).toBe('LND123GH');
  });
});
