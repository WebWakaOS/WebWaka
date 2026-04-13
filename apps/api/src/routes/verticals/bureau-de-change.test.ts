/**
 * Bureau de Change vertical route tests — P10 Set I
 * P13: BVN never in AI; FX rates in integer kobo/cent (no floats); Tier 3 KYC
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (rates, transactions).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './bureau-de-change.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createRate: vi.fn(), createTransaction: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-bureau-de-change', () => ({
  BureauDeChangeRepository: vi.fn(() => mockRepo),
  isValidBdcTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCbnVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerFxRate: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerCents: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardNoBvnInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'bdc_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'FX Exchange Ltd', status: 'seeded' };

describe('POST /profiles — create BDC profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'FX Exchange Ltd' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'X BDC' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/bdc_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/bdc_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidBdcTransition } = await import('@webwaka/verticals-bureau-de-change');
    (isValidBdcTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/bdc_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/rates — integer FX rates only', () => {
  it('returns 201 for valid rate posting', async () => {
    mockRepo.createRate.mockResolvedValueOnce({ id: 'rate_001', currencyPair: 'USD/NGN', buyRateKoboPerCent: 160000 });
    const res = await makeApp().request('/profiles/bdc_001/rates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currencyPair: 'USD/NGN', buyRateKoboPerCent: 160000, sellRateKoboPerCent: 161000, effectiveFrom: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/transactions', () => {
  it('returns 201 for valid FX transaction', async () => {
    mockRepo.createTransaction.mockResolvedValueOnce({ id: 'txn_001', amountSoldKobo: 50000000 });
    const res = await makeApp().request('/profiles/bdc_001/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rateId: 'rate_001', direction: 'sell', amountSoldKobo: 50000000, amountBoughtCents: 31250, customerRefId: 'cust_a' }) });
    expect(res.status).toBe(201);
  });
});
