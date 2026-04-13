/**
 * Pharmacy Chain vertical route tests — P11
 * FSM: seeded → claimed → nafdac_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, drug inventory, sales, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { pharmacyChainRoutes } from './pharmacy-chain.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    addDrugInventory: vi.fn(), listDrugInventory: vi.fn(),
    recordSale: vi.fn(), listSales: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-pharmacy-chain', () => ({
  PharmacyChainRepository: vi.fn(() => mockRepo),
  isValidPharmacyChainTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', pharmacyChainRoutes);
  return w;
}

const MOCK = { id: 'ph_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'MediPlus Pharmacy', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create pharmacy chain profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with pharmacy_chain key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'MediPlus Pharmacy' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { pharmacy_chain: typeof MOCK };
    expect(body.pharmacy_chain.businessName).toBe('MediPlus Pharmacy');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Kano Pharma' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get pharmacy chain profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ph_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { pharmacy_chain: typeof MOCK };
    expect(body.pharmacy_chain.id).toBe('ph_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ph_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ph_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ph_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ph_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { pharmacy_chain: typeof CLAIMED };
    expect(body.pharmacy_chain.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidPharmacyChainTransition } = await import('@webwaka/verticals-pharmacy-chain');
    vi.mocked(isValidPharmacyChainTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ph_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ph_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPharmacyChainTransition } = await import('@webwaka/verticals-pharmacy-chain');
    vi.mocked(isValidPharmacyChainTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ph_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/inventory — add drug to inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with inventory item', async () => {
    const item = { id: 'drug_001', profileId: 'ph_001', drugName: 'Amoxicillin 500mg', nafdacReg: 'NAFDAC/A7/001', unitPriceKobo: 150000 };
    mockRepo.addDrugInventory.mockResolvedValueOnce(item);
    const res = await makeApp().request('/ph_001/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ drug_name: 'Amoxicillin 500mg', nafdac_reg: 'NAFDAC/A7/001', quantity_in_stock: 100, unit_price_kobo: 150000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { item: typeof item };
    expect(body.item.drugName).toBe('Amoxicillin 500mg');
  });
});

describe('GET /:id/inventory — list drug inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of inventory items', async () => {
    mockRepo.listDrugInventory.mockResolvedValueOnce([{ id: 'drug_001' }, { id: 'drug_002' }]);
    const res = await makeApp().request('/ph_001/inventory');
    expect(res.status).toBe(200);
    const body = await res.json() as { inventory: { id: string }[]; count: number };
    expect(body.inventory).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/sales — record a drug sale', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with sale record', async () => {
    const sale = { id: 'sale_001', profileId: 'ph_001', drugId: 'drug_001', quantity: 30, totalKobo: 4500000 };
    mockRepo.recordSale.mockResolvedValueOnce(sale);
    const res = await makeApp().request('/ph_001/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ drug_id: 'drug_001', quantity: 30, unit_price_kobo: 150000, total_kobo: 4500000, sale_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { sale: typeof sale };
    expect(body.sale.quantity).toBe(30);
  });
});
