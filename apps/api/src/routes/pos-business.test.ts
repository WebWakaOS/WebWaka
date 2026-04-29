/**
 * POS Business route tests — P3-D
 * ≥15 cases covering products, sales, customers + P9 invariant checks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { posBusinessRoutes } from './pos-business.js';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { mockInventoryRepo, mockSalesRepo, mockCustomerRepo } = vi.hoisted(() => ({
  mockInventoryRepo: {
    create: vi.fn(),
    findByWorkspace: vi.fn(),
    findLowStock: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    adjustStock: vi.fn(),
    deactivate: vi.fn(),
  },
  mockSalesRepo: {
    recordSale: vi.fn(),
    listByWorkspace: vi.fn(),
    findSaleById: vi.fn(),
    dailySummary: vi.fn(),
  },
  mockCustomerRepo: {
    create: vi.fn(),
    listByWorkspace: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    awardLoyalty: vi.fn(),
    redeemLoyalty: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-pos-business', () => ({
  InventoryRepository: vi.fn(() => mockInventoryRepo),
  SalesRepository: vi.fn(() => mockSalesRepo),
  CustomerRepository: vi.fn(() => mockCustomerRepo),
}));

// ---------------------------------------------------------------------------
// Stub DB
// ---------------------------------------------------------------------------

const stubDb = {
  prepare: () => ({
    bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }),
  }),
};

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function makeApp(tenantId = 'tnt_a', userId = 'usr_a') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    c.set('auth' as never, { userId, tenantId } as never);
    await next();
  });
  app.route('/pos-business', posBusinessRoutes);
  return app;
}

const MOCK_PRODUCT = { id: 'prd_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', name: 'Rice (5kg)', priceKobo: 250000, stockQty: 100, active: true };
const MOCK_SALE = { id: 'sal_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', totalKobo: 250000, paymentMethod: 'cash' };
const MOCK_CUSTOMER = { id: 'cus_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', name: 'Chukwuemeka Nwosu', loyaltyPoints: 0 };

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

describe('POST /pos-business/products', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 when required fields are missing', async () => {
    const app = makeApp();
    const res = await app.request('/pos-business/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 201 for valid product creation', async () => {
    mockInventoryRepo.create.mockResolvedValueOnce(MOCK_PRODUCT);
    const app = makeApp();
    const res = await app.request('/pos-business/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', name: 'Rice (5kg)', price_kobo: 250000 }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ product: { id: string } }>();
    expect(body.product.id).toBe('prd_001');
  });

  it('T3: create called with tenantId from auth', async () => {
    mockInventoryRepo.create.mockResolvedValueOnce(MOCK_PRODUCT);
    const app = makeApp('tnt_B');
    await app.request('/pos-business/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', name: 'Beans', price_kobo: 180000 }),
    });
    expect(mockInventoryRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_B' }));
  });
});

describe('GET /pos-business/products/:workspaceId', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with product list', async () => {
    mockInventoryRepo.findByWorkspace.mockResolvedValueOnce([MOCK_PRODUCT]);
    const app = makeApp();
    const res = await app.request('/pos-business/products/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json<{ products: unknown[]; count: number }>();
    expect(body.count).toBe(1);
  });

  it('T3: findByWorkspace called with tenantId', async () => {
    mockInventoryRepo.findByWorkspace.mockResolvedValueOnce([]);
    const app = makeApp('tnt_C');
    await app.request('/pos-business/products/wsp_a');
    expect(mockInventoryRepo.findByWorkspace).toHaveBeenCalledWith('wsp_a', 'tnt_C', expect.any(Boolean));
  });
});

describe('GET /pos-business/product/:id', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 when product found', async () => {
    mockInventoryRepo.findById.mockResolvedValueOnce(MOCK_PRODUCT);
    const app = makeApp();
    const res = await app.request('/pos-business/product/prd_001');
    expect(res.status).toBe(200);
    const body = await res.json<{ product: { id: string } }>();
    expect(body.product.id).toBe('prd_001');
  });

  it('returns 404 when product not found', async () => {
    mockInventoryRepo.findById.mockResolvedValueOnce(null);
    const app = makeApp();
    const res = await app.request('/pos-business/product/prd_missing');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /pos-business/product/:id', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 for invalid JSON body', async () => {
    const app = makeApp();
    const res = await app.request('/pos-business/product/prd_001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('Invalid JSON body');
  });

  it('returns 200 on successful update', async () => {
    mockInventoryRepo.update.mockResolvedValueOnce({ ...MOCK_PRODUCT, name: 'Updated Product' });
    const app = makeApp();
    const res = await app.request('/pos-business/product/prd_001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Product' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ product: { name: string } }>();
    expect(body.product.name).toBe('Updated Product');
  });

  it('returns 404 when product to update is not found', async () => {
    mockInventoryRepo.update.mockResolvedValueOnce(null);
    const app = makeApp();
    const res = await app.request('/pos-business/product/prd_missing', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Product' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 400 on update error', async () => {
    mockInventoryRepo.update.mockRejectedValueOnce(new Error('Update failed'));
    const app = makeApp();
    const res = await app.request('/pos-business/product/prd_001', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Product' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('Update failed');
  });
});

// ---------------------------------------------------------------------------
// Sales — P9 invariant testing
// ---------------------------------------------------------------------------

describe('POST /pos-business/sales', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 when items array is empty', async () => {
    const app = makeApp();
    const res = await app.request('/pos-business/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', payment_method: 'cash', items: [] }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid payment_method', async () => {
    const app = makeApp();
    const res = await app.request('/pos-business/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', payment_method: 'crypto', items: [{ product_id: 'prd_001', qty: 1, price_kobo: 250000 }] }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 201 for valid cash sale', async () => {
    mockSalesRepo.recordSale.mockResolvedValueOnce(MOCK_SALE);
    const app = makeApp();
    const res = await app.request('/pos-business/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', payment_method: 'cash', items: [{ product_id: 'prd_001', qty: 1, price_kobo: 250000 }] }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ sale: { id: string } }>();
    expect(body.sale.id).toBe('sal_001');
  });

  it('T3: recordSale includes tenantId from auth', async () => {
    mockSalesRepo.recordSale.mockResolvedValueOnce(MOCK_SALE);
    const app = makeApp('tnt_D');
    await app.request('/pos-business/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', payment_method: 'transfer', items: [{ product_id: 'prd_001', qty: 2, price_kobo: 500000 }] }),
    });
    expect(mockSalesRepo.recordSale).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_D' }));
  });
});

describe('GET /pos-business/sales/:workspaceId', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with sales list', async () => {
    mockSalesRepo.listByWorkspace.mockResolvedValueOnce([MOCK_SALE]);
    const app = makeApp();
    const res = await app.request('/pos-business/sales/wsp_a');
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

describe('POST /pos-business/customers', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid customer creation', async () => {
    mockCustomerRepo.create.mockResolvedValueOnce(MOCK_CUSTOMER);
    const app = makeApp();
    const res = await app.request('/pos-business/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', name: 'Chukwuemeka Nwosu', phone: '08012345678' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ customer: { id: string } }>();
    expect(body.customer.id).toBe('cus_001');
  });
});

describe('GET /pos-business/customers/:workspaceId', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with customer list', async () => {
    mockCustomerRepo.listByWorkspace.mockResolvedValueOnce([MOCK_CUSTOMER]);
    const app = makeApp();
    const res = await app.request('/pos-business/customers/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json<{ customers: unknown[]; count: number }>();
    expect(body.count).toBe(1);
  });

  it('T3: listByWorkspace called with tenantId', async () => {
    mockCustomerRepo.listByWorkspace.mockResolvedValueOnce([]);
    const app = makeApp('tnt_E');
    await app.request('/pos-business/customers/wsp_a');
    expect(mockCustomerRepo.listByWorkspace).toHaveBeenCalledWith('wsp_a', 'tnt_E', expect.any(Number));
  });
});
