/**
 * Gas Distributor vertical route tests — P11
 * FSM: seeded → claimed → dpr_licensed → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, inventory, orders, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { gasDistributorRoutes } from './gas-distributor.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    addInventory: vi.fn(), listInventory: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-gas-distributor', () => ({
  GasDistributorRepository: vi.fn(() => mockRepo),
  isValidGasDistributorTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', gasDistributorRoutes);
  return w;
}

const MOCK = { id: 'gd_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'ProGas Nigeria', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create gas distributor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with gas_distributor key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'ProGas Nigeria' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { gas_distributor: typeof MOCK };
    expect(body.gas_distributor.businessName).toBe('ProGas Nigeria');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'SafeGas Kano' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get gas distributor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gd_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { gas_distributor: typeof MOCK };
    expect(body.gas_distributor.id).toBe('gd_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/gd_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/gd_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('gd_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/gd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { gas_distributor: typeof CLAIMED };
    expect(body.gas_distributor.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidGasDistributorTransition } = await import('@webwaka/verticals-gas-distributor');
    vi.mocked(isValidGasDistributorTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/gd_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidGasDistributorTransition } = await import('@webwaka/verticals-gas-distributor');
    vi.mocked(isValidGasDistributorTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/inventory — add gas cylinder to inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with inventory item', async () => {
    const item = { id: 'inv_001', profileId: 'gd_001', cylinderSize: '12.5kg', priceKobo: 900000 };
    mockRepo.addInventory.mockResolvedValueOnce(item);
    const res = await makeApp().request('/gd_001/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cylinder_size: '12.5kg', gas_type: 'LPG', quantity_in_stock: 100, cost_price_kobo: 750000, retail_price_kobo: 900000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { item: typeof item };
    expect(body.item.cylinderSize).toBe('12.5kg');
  });
});

describe('GET /:id/inventory — list inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns inventory list', async () => {
    mockRepo.listInventory.mockResolvedValueOnce([{ id: 'inv_001' }, { id: 'inv_002' }]);
    const res = await makeApp().request('/gd_001/inventory');
    expect(res.status).toBe(200);
    const body = await res.json() as { inventory: { id: string }[]; count: number };
    expect(body.inventory).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/orders — create gas order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', profileId: 'gd_001', customerPhone: '08012345678', totalKobo: 1800000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/gd_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_phone: '08012345678', cylinder_size: '12.5kg', quantity: 2, total_kobo: 1800000, delivery_address: '5 Marina, Lagos' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.totalKobo).toBe(1800000);
  });
});

describe('GET /:id/orders — list orders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of orders', async () => {
    mockRepo.listOrders.mockResolvedValueOnce([{ id: 'ord_001' }]);
    const res = await makeApp().request('/gd_001/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as { orders: { id: string }[]; count: number };
    expect(body.orders).toHaveLength(1);
  });
});
