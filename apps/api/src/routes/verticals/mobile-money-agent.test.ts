/**
 * Mobile Money Agent vertical route tests — P10 Set I
 * P13: BVN never in AI; float daily cap 30M kobo; Tier 3 KYC
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (transactions, float topup).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './mobile-money-agent.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createTransaction: vi.fn(), topupFloat: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-mobile-money-agent', () => ({
  MobileMoneyAgentRepository: vi.fn(() => mockRepo),
  isValidMobileMoneyAgentTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCbnAgentVerified: vi.fn().mockReturnValue({ allowed: true }),
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

const MOCK = { id: 'mma_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'QuickCash Agent', status: 'seeded' };

describe('POST /profiles — create mobile money agent profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'QuickCash Agent' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'X Agent' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/mma_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/mma_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidMobileMoneyAgentTransition } = await import('@webwaka/verticals-mobile-money-agent');
    (isValidMobileMoneyAgentTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/mma_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/transactions', () => {
  it('returns 201 for valid MMA transaction', async () => {
    mockRepo.createTransaction.mockResolvedValueOnce({ id: 'txn_001', transactionType: 'cash_in' });
    const res = await makeApp().request('/profiles/mma_001/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transactionType: 'cash_in', amountKobo: 50000, customerRefId: 'cust_a', walletProvider: 'opay' }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/float/topup', () => {
  it('returns 200 for valid float topup', async () => {
    mockRepo.topupFloat.mockResolvedValueOnce({ id: 'ft_001', amountKobo: 5000000 });
    const res = await makeApp().request('/profiles/mma_001/float/topup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountKobo: 5000000 }) });
    expect(res.status).toBe(200);
  });
});

describe('POST /profiles/:id/ai/float-utilisation', () => {
  it('returns 200 for L2 AI float utilisation analysis', async () => {
    const res = await makeApp().request('/profiles/mma_001/ai/float-utilisation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2 }) });
    expect(res.status).toBe(200);
  });
});
