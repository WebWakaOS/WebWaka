/**
 * Motorcycle Accessories vertical route tests — P11
 * FSM: seeded → claimed → son_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, inventory, sales, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { motorcycleAccessoriesRoutes } from './motorcycle-accessories.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    addInventoryItem: vi.fn(), listInventory: vi.fn(),
    recordSale: vi.fn(), listSales: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-motorcycle-accessories', () => ({
  MotorcycleAccessoriesRepository: vi.fn(() => mockRepo),
  isValidMotorcycleAccessoriesTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', motorcycleAccessoriesRoutes);
  return w;
}

const MOCK = { id: 'ma_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'OkadaParts Express', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create motorcycle accessories profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with motorcycle_accessories key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'OkadaParts Express' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { motorcycle_accessories: typeof MOCK };
    expect(body.motorcycle_accessories.businessName).toBe('OkadaParts Express');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Kano Bike Parts' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns motorcycle_accessories profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { motorcycle_accessories: typeof MOCK };
    expect(body.motorcycle_accessories.id).toBe('ma_001');
  });
});

describe('GET /:id — get motorcycle accessories profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ma_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { motorcycle_accessories: typeof MOCK };
    expect(body.motorcycle_accessories.id).toBe('ma_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ma_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ma_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ma_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ma_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { motorcycle_accessories: typeof CLAIMED };
    expect(body.motorcycle_accessories.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidMotorcycleAccessoriesTransition } = await import('@webwaka/verticals-motorcycle-accessories');
    vi.mocked(isValidMotorcycleAccessoriesTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ma_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ma_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidMotorcycleAccessoriesTransition } = await import('@webwaka/verticals-motorcycle-accessories');
    vi.mocked(isValidMotorcycleAccessoriesTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ma_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/inventory — add inventory item', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with inventory item', async () => {
    const item = { id: 'inv_001', profileId: 'ma_001', partName: 'Chain Sprocket', retailPriceKobo: 120000 };
    mockRepo.addInventoryItem.mockResolvedValueOnce(item);
    const res = await makeApp().request('/ma_001/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ part_name: 'Chain Sprocket', qty_in_stock: 50, cost_price_kobo: 80000, retail_price_kobo: 120000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { item: typeof item };
    expect(body.item.partName).toBe('Chain Sprocket');
  });
});

describe('GET /:id/inventory — list inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns inventory list', async () => {
    mockRepo.listInventory.mockResolvedValueOnce([{ id: 'inv_001' }, { id: 'inv_002' }]);
    const res = await makeApp().request('/ma_001/inventory');
    expect(res.status).toBe(200);
    const body = await res.json() as { inventory: { id: string }[]; count: number };
    expect(body.inventory).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/sales — record sale', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with sale record', async () => {
    const sale = { id: 'sale_001', profileId: 'ma_001', totalKobo: 360000 };
    mockRepo.recordSale.mockResolvedValueOnce(sale);
    const res = await makeApp().request('/ma_001/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyer_phone: '08012345678', items: '[]', total_kobo: 360000, sale_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { sale: typeof sale };
    expect(body.sale.totalKobo).toBe(360000);
  });
});
