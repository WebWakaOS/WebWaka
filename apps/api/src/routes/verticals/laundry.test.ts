/**
 * Laundry vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, orders, subscriptions, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { laundryRoutes } from './laundry.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(), updateOrderStatus: vi.fn(),
    createSubscription: vi.fn(), listSubscriptions: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-laundry', () => ({
  LaundryRepository: vi.fn(() => mockRepo),
  isValidLaundryTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', laundryRoutes);
  return w;
}

const MOCK = { id: 'lnd_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'CleanPlus Laundry', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create laundry profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with laundry key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'CleanPlus Laundry' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { laundry: typeof MOCK };
    expect(body.laundry.businessName).toBe('CleanPlus Laundry');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Wash King Abuja' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns laundry profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { laundry: typeof MOCK };
    expect(body.laundry.id).toBe('lnd_001');
  });
});

describe('GET /:id — get laundry profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/lnd_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { laundry: typeof MOCK };
    expect(body.laundry.id).toBe('lnd_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/lnd_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/lnd_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('lnd_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/lnd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { laundry: typeof CLAIMED };
    expect(body.laundry.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidLaundryTransition } = await import('@webwaka/verticals-laundry');
    vi.mocked(isValidLaundryTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/lnd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/lnd_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidLaundryTransition } = await import('@webwaka/verticals-laundry');
    vi.mocked(isValidLaundryTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/lnd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/orders — create laundry order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', profileId: 'lnd_001', customerPhone: '08012345678', totalKobo: 400000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/lnd_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_phone: '08012345678', service_type: 'wash_and_iron', items_count: 10, price_per_item_kobo: 40000, total_kobo: 400000, pickup_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.totalKobo).toBe(400000);
  });
});

describe('GET /:id/orders — list orders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of orders', async () => {
    mockRepo.listOrders.mockResolvedValueOnce([{ id: 'ord_001' }, { id: 'ord_002' }]);
    const res = await makeApp().request('/lnd_001/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as { orders: { id: string }[]; count: number };
    expect(body.orders).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/subscriptions — create subscription', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with subscription', async () => {
    const sub = { id: 'sub_001', profileId: 'lnd_001', customerPhone: '08012345678', planType: 'monthly' };
    mockRepo.createSubscription.mockResolvedValueOnce(sub);
    const res = await makeApp().request('/lnd_001/subscriptions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_phone: '08012345678', plan_type: 'monthly', monthly_fee_kobo: 1200000, start_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { subscription: typeof sub };
    expect(body.subscription.planType).toBe('monthly');
  });
});
