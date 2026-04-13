/**
 * Water Vendor vertical route tests — P11
 * FSM: seeded → claimed → nafdac_verified → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, product prices, delivery orders, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { waterVendorRoutes } from './water-vendor.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createProductPrice: vi.fn(), listProductPrices: vi.fn(),
    createDeliveryOrder: vi.fn(), listDeliveryOrders: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-water-vendor', () => ({
  WaterVendorRepository: vi.fn(() => mockRepo),
  isValidWaterVendorTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToNafdacVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', waterVendorRoutes);
  return w;
}

const MOCK = { id: 'wv_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', brandName: 'Pure H2O Ventures', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create water vendor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with water_vendor key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', brand_name: 'Pure H2O Ventures' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { water_vendor: typeof MOCK };
    expect(body.water_vendor.brandName).toBe('Pure H2O Ventures');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', brand_name: 'Crystal Waters' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns water_vendor profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { water_vendor: typeof MOCK };
    expect(body.water_vendor.id).toBe('wv_001');
  });
});

describe('GET /:id — get water vendor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/wv_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { water_vendor: typeof MOCK };
    expect(body.water_vendor.id).toBe('wv_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/wv_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/wv_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('wv_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/wv_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { water_vendor: typeof CLAIMED };
    expect(body.water_vendor.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/wv_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/wv_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidWaterVendorTransition } = await import('@webwaka/verticals-water-vendor');
    vi.mocked(isValidWaterVendorTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/wv_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'nafdac_verified' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/product-prices — create product price', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with product price record', async () => {
    const price = { id: 'pp_001', profileId: 'wv_001', productType: 'sachet', volumeLitres: 0.5, unitPriceKobo: 3000 };
    mockRepo.createProductPrice.mockResolvedValueOnce(price);
    const res = await makeApp().request('/wv_001/product-prices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_type: 'sachet', volume_litres: 0.5, unit_price_kobo: 3000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { product_price: typeof price };
    expect(body.product_price.productType).toBe('sachet');
  });
});

describe('GET /:id/product-prices — list product prices', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of product prices', async () => {
    mockRepo.listProductPrices.mockResolvedValueOnce([{ id: 'pp_001' }, { id: 'pp_002' }]);
    const res = await makeApp().request('/wv_001/product-prices');
    expect(res.status).toBe(200);
    const body = await res.json() as { product_prices: { id: string }[]; count: number };
    expect(body.product_prices).toHaveLength(2);
  });
});

describe('POST /:id/delivery-orders — create delivery order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with delivery order', async () => {
    const order = { id: 'do_001', profileId: 'wv_001', clientPhone: '08012345678', quantityUnits: 50, totalKobo: 17500000 };
    mockRepo.createDeliveryOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/wv_001/delivery-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_phone: '08012345678', delivery_address: '15 Lagos Street', product_type: 'bottle', quantity_units: 50, total_kobo: 17500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { delivery_order: typeof order };
    expect(body.delivery_order.quantityUnits).toBe(50);
  });
});
