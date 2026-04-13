/**
 * Electrical Fittings vertical route tests — P11
 * FSM: seeded → claimed → son_verified → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, catalogue, orders, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { electricalFittingsRoutes } from './electrical-fittings.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createCatalogueItem: vi.fn(), listCatalogueItems: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(), updateOrderStatus: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-electrical-fittings', () => ({
  ElectricalFittingsRepository: vi.fn(() => mockRepo),
  isValidElectricalFittingsTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToCacVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', electricalFittingsRoutes);
  return w;
}

const MOCK = { id: 'ef_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Eko Electrical Supplies', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create electrical fittings profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with electrical_fittings key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Eko Electrical Supplies' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { electrical_fittings: typeof MOCK };
    expect(body.electrical_fittings.companyName).toBe('Eko Electrical Supplies');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', company_name: 'Kano Electrical Supplies' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns electrical_fittings profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { electrical_fittings: typeof MOCK };
    expect(body.electrical_fittings.id).toBe('ef_001');
  });
});

describe('GET /:id — get electrical fittings profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ef_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { electrical_fittings: typeof MOCK };
    expect(body.electrical_fittings.id).toBe('ef_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ef_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ef_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ef_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ef_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { electrical_fittings: typeof CLAIMED };
    expect(body.electrical_fittings.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/ef_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ef_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidElectricalFittingsTransition } = await import('@webwaka/verticals-electrical-fittings');
    vi.mocked(isValidElectricalFittingsTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ef_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/catalogue — add catalogue item', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with catalogue item', async () => {
    const item = { id: 'cat_001', productName: '2.5mm Twin Cable (100m)', unitPriceKobo: 1200000 };
    mockRepo.createCatalogueItem.mockResolvedValueOnce(item);
    const res = await makeApp().request('/ef_001/catalogue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_name: '2.5mm Twin Cable (100m)', type: 'cables', unit: 'roll', unit_price_kobo: 1200000, quantity_in_stock: 50 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { catalogue_item: typeof item };
    expect(body.catalogue_item.productName).toBe('2.5mm Twin Cable (100m)');
  });
});

describe('GET /:id/catalogue — list catalogue items', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of catalogue items', async () => {
    mockRepo.listCatalogueItems.mockResolvedValueOnce([{ id: 'cat_001' }, { id: 'cat_002' }]);
    const res = await makeApp().request('/ef_001/catalogue');
    expect(res.status).toBe(200);
    const body = await res.json() as { catalogue: { id: string }[]; count: number };
    expect(body.catalogue).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/orders — create order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', totalKobo: 6000000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/ef_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_phone: '08012345678', items: '[]', total_kobo: 6000000, credit_sale: false }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.totalKobo).toBe(6000000);
  });
});

describe('GET /:id/orders — list orders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of orders', async () => {
    mockRepo.listOrders.mockResolvedValueOnce([{ id: 'ord_001' }]);
    const res = await makeApp().request('/ef_001/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as { orders: { id: string }[]; count: number };
    expect(body.orders).toHaveLength(1);
  });
});
