/**
 * Abattoir vertical route tests — P11 + BUG-004
 * FSM: seeded → claimed → nafdac_verified → active
 * Guards: guardClaimedToNafdacVerified (sync), guardFractionalKobo (sync)
 * NDPR: GET /:id/ai-advisory gated by aiConsentGate; buyerPhone stripped before AI
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources, AI advisory (NDPR-clean).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './abattoir.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), transition: vi.fn(),
    updateNafdacReg: vi.fn(), createSlaughterLog: vi.fn(),
    createSale: vi.fn(), listSales: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-abattoir', () => ({
  AbattoirRepository: vi.fn(() => mockRepo),
  isValidAbattoirTransition: vi.fn().mockReturnValue(true),
  guardClaimedToNafdacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'ab_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', abattoirName: 'Agege Abattoir', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create abattoir profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', abattoirName: 'Agege Abattoir', capacityHeadPerDay: 50 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.abattoirName).toBe('Agege Abattoir');
  });

  it('scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    const res = await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', abattoirName: 'Lagos Abattoir' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.tenantId).toBe('tnt_b');
  });
});

describe('GET /profiles/:id — get abattoir profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/ab_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('ab_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/ab_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/profiles/ab_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ab_001', 'tnt_b');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status and returns updated profile', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transition.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/ab_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/ab_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidAbattoirTransition } = await import('@webwaka/verticals-abattoir');
    vi.mocked(isValidAbattoirTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/ab_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if nafdac guard fails', async () => {
    const { guardClaimedToNafdacVerified } = await import('@webwaka/verticals-abattoir');
    vi.mocked(guardClaimedToNafdacVerified).mockReturnValueOnce({ allowed: false, reason: 'nafdac_reg missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/ab_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'nafdac_verified' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /profiles/:id/slaughter-log — record slaughter', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with slaughter log', async () => {
    const log = { id: 'sl_001', profileId: 'ab_001', animalType: 'cattle', headCount: 10, meatYieldKg: 2000 };
    mockRepo.createSlaughterLog.mockResolvedValueOnce(log);
    const res = await makeApp().request('/profiles/ab_001/slaughter-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slaughterDate: 1700000000, animalType: 'cattle', headCount: 10, meatYieldKg: 2000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof log;
    expect(body.animalType).toBe('cattle');
  });
});

describe('POST /profiles/:id/sales — record sale', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with sale', async () => {
    const sale = { id: 'sale_001', profileId: 'ab_001', quantityKg: 500, pricePerKgKobo: 150000 };
    mockRepo.createSale.mockResolvedValueOnce(sale);
    const res = await makeApp().request('/profiles/ab_001/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyerPhone: '08012345678', animalType: 'cattle', quantityKg: 500, pricePerKgKobo: 150000, totalKobo: 75000000, saleDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });

  it('returns 422 if P9 fractional kobo guard fails', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-abattoir');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9: fractional kobo not allowed' });
    const res = await makeApp().request('/profiles/ab_001/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyerPhone: '08012345678', animalType: 'cattle', quantityKg: 1, pricePerKgKobo: 0.5, totalKobo: 0, saleDate: 1700000000 }) });
    expect(res.status).toBe(422);
  });
});

describe('GET /profiles/:id/sales — list sales', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of sales', async () => {
    mockRepo.listSales.mockResolvedValueOnce([{ id: 'sale_001' }, { id: 'sale_002' }]);
    const res = await makeApp().request('/profiles/ab_001/sales');
    expect(res.status).toBe(200);
    const body = await res.json() as { id: string }[];
    expect(body).toHaveLength(2);
  });
});

describe('GET /profiles/:id/ai-advisory — NDPR consent gate', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns advisory data stripped of buyerPhone PII', async () => {
    mockRepo.listSales.mockResolvedValueOnce([
      { animalType: 'cattle', quantityKg: 200, pricePerKgKobo: 350000, totalKobo: 70000000, saleDate: 1700000000, buyerPhone: '08012345678' },
    ]);
    const res = await makeApp().request('/profiles/ab_001/ai-advisory');
    expect(res.status).toBe(200);
    const body = await res.json() as { capability: string; advisory_data: Record<string, unknown>[]; count: number };
    expect(body.capability).toBe('SLAUGHTER_YIELD_FORECAST');
    expect(body.count).toBe(1);
    expect(body.advisory_data[0]).toHaveProperty('animal_type');
    expect(body.advisory_data[0]).not.toHaveProperty('buyerPhone');
    expect(body.advisory_data[0]).not.toHaveProperty('buyer_phone');
  });

  it('returns empty advisory when no sales yet', async () => {
    mockRepo.listSales.mockResolvedValueOnce([]);
    const res = await makeApp().request('/profiles/ab_001/ai-advisory');
    expect(res.status).toBe(200);
    const body = await res.json() as { count: number };
    expect(body.count).toBe(0);
  });
});
