/**
 * Building Materials vertical route tests — P11
 * FSM: seeded → claimed → son_verified → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, catalogue, orders, credit accounts, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { buildingMaterialsRoutes } from './building-materials.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createCatalogueItem: vi.fn(), listCatalogueItems: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(), updateOrderStatus: vi.fn(),
    createCreditAccount: vi.fn(), listCreditAccounts: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-building-materials', () => ({
  BuildingMaterialsRepository: vi.fn(() => mockRepo),
  isValidBuildingMaterialsTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToCacVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', buildingMaterialsRoutes);
  return w;
}

const MOCK = { id: 'bm_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Lagos Building Supplies', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create building materials profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with building_materials key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Lagos Building Supplies' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { building_materials: typeof MOCK };
    expect(body.building_materials.companyName).toBe('Lagos Building Supplies');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', company_name: 'Abuja Supplies' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get building materials profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/bm_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { building_materials: typeof MOCK };
    expect(body.building_materials.id).toBe('bm_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/bm_999');
    expect(res.status).toBe(404);
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/bm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { building_materials: typeof CLAIMED };
    expect(body.building_materials.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/bm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/bm_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidBuildingMaterialsTransition } = await import('@webwaka/verticals-building-materials');
    vi.mocked(isValidBuildingMaterialsTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/bm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/catalogue — add catalogue item', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with catalogue item', async () => {
    const item = { id: 'cat_001', productName: 'Dangote Cement 50kg', unitPriceKobo: 450000 };
    mockRepo.createCatalogueItem.mockResolvedValueOnce(item);
    const res = await makeApp().request('/bm_001/catalogue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_name: 'Dangote Cement 50kg', category: 'cement', unit: 'bag', unit_price_kobo: 450000, quantity_in_stock: 500 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { catalogue_item: typeof item };
    expect(body.catalogue_item.productName).toBe('Dangote Cement 50kg');
  });
});

describe('GET /:id/catalogue — list catalogue items', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of catalogue items', async () => {
    mockRepo.listCatalogueItems.mockResolvedValueOnce([{ id: 'cat_001' }, { id: 'cat_002' }]);
    const res = await makeApp().request('/bm_001/catalogue');
    expect(res.status).toBe(200);
    const body = await res.json() as { catalogue: { id: string }[]; count: number };
    expect(body.catalogue).toHaveLength(2);
  });
});

describe('POST /:id/orders — create order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', totalKobo: 9000000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/bm_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_phone: '08012345678', client_name: 'Adewale Builders', order_items: '[]', total_kobo: 9000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.totalKobo).toBe(9000000);
  });
});

describe('POST /:id/credit-accounts — create credit account', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with credit account', async () => {
    const account = { id: 'cred_001', clientName: 'Adewale Construction', creditLimitKobo: 5000000000 };
    mockRepo.createCreditAccount.mockResolvedValueOnce(account);
    const res = await makeApp().request('/bm_001/credit-accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contractor_name: 'Adewale Construction', contractor_phone: '08012345678', credit_limit_kobo: 5000000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { credit_account: typeof account };
    expect(body.credit_account.clientName).toBe('Adewale Construction');
  });
});
