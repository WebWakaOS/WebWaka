/**
 * Paints Distributor vertical route tests — P11
 * FSM: seeded → claimed → son_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, inventory, orders, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { paintsDistributorRoutes } from './paints-distributor.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    addInventory: vi.fn(), listInventory: vi.fn(),
    createOrder: vi.fn(), listOrders: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-paints-distributor', () => ({
  PaintsDistributorRepository: vi.fn(() => mockRepo),
  isValidPaintsDistributorTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', paintsDistributorRoutes);
  return w;
}

const MOCK = { id: 'pd_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'ColourPlex Distributors', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create paints distributor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with paints_distributor key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'ColourPlex Distributors' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { paints_distributor: typeof MOCK };
    expect(body.paints_distributor.businessName).toBe('ColourPlex Distributors');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Abuja Paints Hub' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns paints_distributor profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { paints_distributor: typeof MOCK };
    expect(body.paints_distributor.id).toBe('pd_001');
  });
});

describe('GET /:id — get paints distributor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/pd_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { paints_distributor: typeof MOCK };
    expect(body.paints_distributor.id).toBe('pd_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/pd_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/pd_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('pd_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/pd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { paints_distributor: typeof CLAIMED };
    expect(body.paints_distributor.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidPaintsDistributorTransition } = await import('@webwaka/verticals-paints-distributor');
    vi.mocked(isValidPaintsDistributorTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/pd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/pd_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPaintsDistributorTransition } = await import('@webwaka/verticals-paints-distributor');
    vi.mocked(isValidPaintsDistributorTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/pd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/inventory — add paint to inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with inventory item', async () => {
    const item = { id: 'inv_001', profileId: 'pd_001', brandName: 'Dulux Matt White', retailPriceKobo: 650000 };
    mockRepo.addInventory.mockResolvedValueOnce(item);
    const res = await makeApp().request('/pd_001/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_name: 'Dulux Matt White', product_type: 'emulsion', container_litres_x100: 400, quantity_in_stock: 100, unit_cost_kobo: 450000, retail_price_kobo: 650000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { item: typeof item };
    expect(body.item.brandName).toBe('Dulux Matt White');
  });
});

describe('GET /:id/inventory — list inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns inventory list', async () => {
    mockRepo.listInventory.mockResolvedValueOnce([{ id: 'inv_001' }, { id: 'inv_002' }]);
    const res = await makeApp().request('/pd_001/inventory');
    expect(res.status).toBe(200);
    const body = await res.json() as { inventory: { id: string }[]; count: number };
    expect(body.inventory).toHaveLength(2);
  });
});

describe('POST /:id/orders — create order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with order', async () => {
    const order = { id: 'ord_001', profileId: 'pd_001', totalKobo: 3250000 };
    mockRepo.createOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/pd_001/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_phone: '08012345678', items: '[]', total_kobo: 3250000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.totalKobo).toBe(3250000);
  });
});
