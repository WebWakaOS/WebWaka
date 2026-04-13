/**
 * Hire Purchase vertical route tests — P10 Set I
 * P13: BVN never in AI; integer installments; Tier 3 KYC
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (assets, agreements, repayments).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './hire-purchase.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createAsset: vi.fn(), createAgreement: vi.fn(), createRepayment: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-hire-purchase', () => ({
  HirePurchaseRepository: vi.fn(() => mockRepo),
  isValidHirePurchaseTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCbnVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardNoBvnInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerInstallments: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'hp_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'HP Finance Ltd', status: 'seeded' };

describe('POST /profiles — create hire-purchase profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'HP Finance Ltd' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'X HP' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/hp_001')).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx')).status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValue(MOCK);
    mockRepo.updateStatus.mockResolvedValueOnce(undefined);
    expect((await makeApp().request('/profiles/hp_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidHirePurchaseTransition } = await import('@webwaka/verticals-hire-purchase');
    (isValidHirePurchaseTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/hp_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/assets', () => {
  it('returns 201 for valid asset creation', async () => {
    mockRepo.createAsset.mockResolvedValueOnce({ id: 'ast_001', assetType: 'vehicle' });
    const res = await makeApp().request('/profiles/hp_001/assets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetType: 'vehicle', assetDescription: 'Toyota Camry 2022', costPriceKobo: 25000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/agreements', () => {
  it('returns 201 for valid HP agreement', async () => {
    mockRepo.createAgreement.mockResolvedValueOnce({ id: 'agr_001', totalRepayableKobo: 30000000 });
    const res = await makeApp().request('/profiles/hp_001/agreements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId: 'ast_001', customerRefId: 'cust_a', depositKobo: 5000000, totalRepayableKobo: 30000000, installmentCount: 24, installmentKobo: 1250000, startDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /agreements/:agreementId/repayments', () => {
  it('returns 201 for valid repayment', async () => {
    mockRepo.createRepayment.mockResolvedValueOnce({ id: 'rep_001', amountKobo: 1250000 });
    const res = await makeApp().request('/agreements/agr_001/repayments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountKobo: 1250000, paystackRef: 'txn_001', paidDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});
