/**
 * Laundry Service vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, orders, routes, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { laundryServiceRoutes } from './laundry-service.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(),
    addRoute: vi.fn(), listRoutes: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-laundry-service', () => ({
  LaundryServiceRepository: vi.fn(() => mockRepo),
  isValidLaundryServiceTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', laundryServiceRoutes);
  return w;
}

const MOCK = { id: 'ls_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'FreshWash Home Services', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create laundry service profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with laundry_service key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'FreshWash Home Services' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { laundry_service: typeof MOCK };
    expect(body.laundry_service.businessName).toBe('FreshWash Home Services');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Spin & Dry Kano' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns laundry_service profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { laundry_service: typeof MOCK };
    expect(body.laundry_service.id).toBe('ls_001');
  });
});

describe('GET /:id — get laundry service profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ls_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { laundry_service: typeof MOCK };
    expect(body.laundry_service.id).toBe('ls_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ls_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ls_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ls_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ls_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { laundry_service: typeof CLAIMED };
    expect(body.laundry_service.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidLaundryServiceTransition } = await import('@webwaka/verticals-laundry-service');
    vi.mocked(isValidLaundryServiceTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ls_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ls_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidLaundryServiceTransition } = await import('@webwaka/verticals-laundry-service');
    vi.mocked(isValidLaundryServiceTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ls_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/orders — create laundry service order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', profileId: 'ls_001', customerPhone: '08012345678', totalKobo: 350000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/ls_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_phone: '08012345678', service_type: 'pickup_delivery', items_count: 8, total_kobo: 350000, pickup_address: '15 Allen Ave, Ikeja' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.totalKobo).toBe(350000);
  });
});

describe('GET /:id/orders — list orders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of orders', async () => {
    mockRepo.listOrders.mockResolvedValueOnce([{ id: 'ord_001' }, { id: 'ord_002' }]);
    const res = await makeApp().request('/ls_001/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as { orders: { id: string }[]; count: number };
    expect(body.orders).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/routes — add service route', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with route', async () => {
    const route = { id: 'rte_001', profileId: 'ls_001', routeName: 'Lekki Phase 1', coverageAreas: 'Lekki Phase 1' };
    mockRepo.addRoute.mockResolvedValueOnce(route);
    const res = await makeApp().request('/ls_001/routes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ route_name: 'Lekki Phase 1', coverage_areas: 'Lekki Phase 1, Admiralty Way', pickup_days: 'Mon,Wed,Fri' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { route: typeof route };
    expect(body.route.routeName).toBe('Lekki Phase 1');
  });
});
