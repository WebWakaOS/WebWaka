/**
 * Iron & Steel vertical route tests — P11
 * FSM: seeded → claimed → son_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, inventory, orders, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { ironSteelRoutes } from './iron-steel.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    addInventory: vi.fn(), listInventory: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-iron-steel', () => ({
  IronSteelRepository: vi.fn(() => mockRepo),
  isValidIronSteelTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', ironSteelRoutes);
  return w;
}

const MOCK = { id: 'is_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'SteelMasters Lagos', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create iron & steel profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with iron_steel key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'SteelMasters Lagos' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { iron_steel: typeof MOCK };
    expect(body.iron_steel.businessName).toBe('SteelMasters Lagos');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Abeokuta Steel Works' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get iron & steel profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/is_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { iron_steel: typeof MOCK };
    expect(body.iron_steel.id).toBe('is_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/is_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/is_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('is_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/is_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { iron_steel: typeof CLAIMED };
    expect(body.iron_steel.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidIronSteelTransition } = await import('@webwaka/verticals-iron-steel');
    vi.mocked(isValidIronSteelTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/is_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/is_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidIronSteelTransition } = await import('@webwaka/verticals-iron-steel');
    vi.mocked(isValidIronSteelTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/is_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/inventory — add steel product to inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with inventory item', async () => {
    const item = { id: 'inv_001', profileId: 'is_001', productName: 'Iron Rod 16mm', priceKobo: 120000 };
    mockRepo.addInventory.mockResolvedValueOnce(item);
    const res = await makeApp().request('/is_001/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_name: 'Iron Rod 16mm', product_type: 'rod', quantity_in_stock: 500, unit: 'lengths', cost_price_kobo: 90000, retail_price_kobo: 120000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { item: typeof item };
    expect(body.item.productName).toBe('Iron Rod 16mm');
  });
});

describe('GET /:id/inventory — list inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns inventory list', async () => {
    mockRepo.listInventory.mockResolvedValueOnce([{ id: 'inv_001' }, { id: 'inv_002' }]);
    const res = await makeApp().request('/is_001/inventory');
    expect(res.status).toBe(200);
    const body = await res.json() as { inventory: { id: string }[]; count: number };
    expect(body.inventory).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/orders — create steel order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', profileId: 'is_001', buyerPhone: '08012345678', totalKobo: 6000000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/is_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyer_phone: '08012345678', items: '[]', total_kobo: 6000000, delivery_date: 1700259200 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.totalKobo).toBe(6000000);
  });
});

describe('GET /:id/orders — list orders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of orders', async () => {
    mockRepo.listOrders.mockResolvedValueOnce([{ id: 'ord_001' }]);
    const res = await makeApp().request('/is_001/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as { orders: { id: string }[]; count: number };
    expect(body.orders).toHaveLength(1);
  });
});
