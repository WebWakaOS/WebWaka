/**
 * Furniture Maker vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, orders, material inventory, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { furnitureMakerRoutes } from './furniture-maker.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(),
    addMaterialInventory: vi.fn(), listMaterialInventory: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-furniture-maker', () => ({
  FurnitureMakerRepository: vi.fn(() => mockRepo),
  isValidFurnitureMakerTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', furnitureMakerRoutes);
  return w;
}

const MOCK = { id: 'fm_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'CraftWood Nigeria', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create furniture maker profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with furniture_maker key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'CraftWood Nigeria' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { furniture_maker: typeof MOCK };
    expect(body.furniture_maker.businessName).toBe('CraftWood Nigeria');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Aba Wood Workshop' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get furniture maker profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/fm_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { furniture_maker: typeof MOCK };
    expect(body.furniture_maker.id).toBe('fm_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/fm_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/fm_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('fm_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/fm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { furniture_maker: typeof CLAIMED };
    expect(body.furniture_maker.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidFurnitureMakerTransition } = await import('@webwaka/verticals-furniture-maker');
    vi.mocked(isValidFurnitureMakerTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/fm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/fm_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidFurnitureMakerTransition } = await import('@webwaka/verticals-furniture-maker');
    vi.mocked(isValidFurnitureMakerTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/fm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/orders — create furniture order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', profileId: 'fm_001', clientRefId: 'ref_c001', itemDescription: 'Dining Table', totalKobo: 8000000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/fm_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_ref_id: 'ref_c001', item_description: 'Dining Table', item_type: 'dining_set', quantity: 1, deposit_kobo: 4000000, total_kobo: 8000000, delivery_date: 1700259200 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.itemDescription).toBe('Dining Table');
  });
});

describe('GET /:id/orders — list orders', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of orders', async () => {
    mockRepo.listOrders.mockResolvedValueOnce([{ id: 'ord_001' }, { id: 'ord_002' }]);
    const res = await makeApp().request('/fm_001/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as { orders: { id: string }[]; count: number };
    expect(body.orders).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/inventory — add material to inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with inventory item', async () => {
    const item = { id: 'inv_001', profileId: 'fm_001', materialName: 'Mahogany Wood', unitCostKobo: 500000 };
    mockRepo.addMaterialInventory.mockResolvedValueOnce(item);
    const res = await makeApp().request('/fm_001/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ material_name: 'Mahogany Wood', unit: 'planks', quantity_in_stock: 50, unit_cost_kobo: 500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { item: typeof item };
    expect(body.item.materialName).toBe('Mahogany Wood');
  });
});

describe('GET /:id/inventory — list material inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns inventory list', async () => {
    mockRepo.listMaterialInventory.mockResolvedValueOnce([{ id: 'inv_001' }]);
    const res = await makeApp().request('/fm_001/inventory');
    expect(res.status).toBe(200);
    const body = await res.json() as { inventory: { id: string }[]; count: number };
    expect(body.inventory).toHaveLength(1);
  });
});
