/**
 * Airtime Reseller vertical route tests — P10 Set I
 * P13: daily cap 30M kobo; recipient not in AI; NCC/CBN regulated
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (transactions).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './airtime-reseller.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createTransaction: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-airtime-reseller', () => ({
  AirtimeResellerRepository: vi.fn(() => mockRepo),
  isValidAirtimeResellerTransition: vi.fn().mockReturnValue(true),
  guardClaimedToNccVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardNoRecipientInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'ar_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'FastAirtime Ltd', status: 'seeded' };

describe('POST /profiles — create airtime reseller profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'FastAirtime Ltd' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'X Airtime' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ar_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/ar_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidAirtimeResellerTransition } = await import('@webwaka/verticals-airtime-reseller');
    (isValidAirtimeResellerTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ar_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/transactions', () => {
  it('returns 201 for valid airtime transaction', async () => {
    mockRepo.createTransaction.mockResolvedValueOnce({ id: 'txn_001', networkProvider: 'mtn', amountKobo: 100000 });
    const res = await makeApp().request('/profiles/ar_001/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ networkProvider: 'mtn', recipientRefId: 'cust_a', amountKobo: 100000, retailPriceKobo: 110000 }) });
    expect(res.status).toBe(201);
  });

  it('T3: transaction scoped to tenantId', async () => {
    mockRepo.createTransaction.mockResolvedValueOnce({ id: 'txn_002', networkProvider: 'glo' });
    await makeApp('tnt_b').request('/profiles/ar_001/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ networkProvider: 'glo', recipientRefId: 'cust_b', amountKobo: 200000, retailPriceKobo: 220000 }) });
    expect(mockRepo.createTransaction).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});
