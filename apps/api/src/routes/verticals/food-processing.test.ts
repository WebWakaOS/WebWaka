/**
 * Food Processing vertical route tests — P9 Set G (V-AGRO-G8)
 * ≥10 cases: CRUD (/profiles), FSM, T3, P9 price_per_unit_kobo, batches.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './food-processing.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateProfile: vi.fn(), transition: vi.fn(),
    createBatch: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-food-processing', () => ({
  FoodProcessingRepository: vi.fn(() => mockRepo),
  guardClaimedToNafdacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  isValidFoodProcessingTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 1 } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'fp_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Abia Food Processors Ltd', status: 'seeded' };

describe('POST /profiles — create food processing profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', companyName: 'Abia Food Processors Ltd' }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 when fields missing (no route validation', async () => {
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', companyName: 'Abia Food Processors Ltd' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/profiles/fp_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(null); expect((await makeApp().request('/profiles/nx')).status).toBe(404); });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/profiles/fp_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/profiles/fp_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/batches', () => {
  it('returns 201 for valid production batch', async () => {
    mockRepo.createBatch.mockResolvedValueOnce({ id: 'bat_001', productName: 'Garri White 1kg', unitsProduced: 500, pricePerUnitKobo: 60000 });
    expect((await makeApp().request('/profiles/fp_001/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productName: 'Garri White 1kg', unitsProduced: 500, pricePerUnitKobo: 60000, productionDate: 1700000000 }) })).status).toBe(201);
  });
});

describe('GET /profiles/:id/batches', () => {
  it('returns 404 (no list endpoint defined)', async () => {
    expect((await makeApp().request('/profiles/fp_001/batches')).status).toBe(404);
  });
});

describe('GET /profiles/:id/ai-advisory — NDPR consent gate', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns advisory data (factory compliance, no personal data)', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded', nafdacManufacturingPermit: 'NAFDAC-MFG-001', sonProductCert: 'SON-001' });
    const res = await makeApp().request('/profiles/fp_001/ai-advisory');
    expect(res.status).toBe(200);
    const body = await res.json() as { capability: string; profile_summary: { nafdac_permit: boolean; son_certified: boolean }; count: number };
    expect(body.capability).toBe('PRODUCTION_DEMAND_ADVISORY');
    expect(body.profile_summary.nafdac_permit).toBe(true);
    expect(body.profile_summary.son_certified).toBe(true);
    expect(body.count).toBe(1);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/ai-advisory')).status).toBe(404);
  });
});
