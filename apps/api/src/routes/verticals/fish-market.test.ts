/**
 * Fish Market / Wet Market vertical route tests — P9 Set G (V-AGRO-G7)
 * ≥10 cases: CRUD (/profiles), FSM, T3, P9 integer grams, stock.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './fish-market.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateProfile: vi.fn(), transition: vi.fn(),
    createStock: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-fish-market', () => ({
  FishMarketRepository: vi.fn(() => mockRepo),
  guardClaimedToNafdacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerGrams: vi.fn().mockReturnValue({ allowed: true }),
  guardExpiryAlert: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  isValidFishMarketTransition: mockIsValid,
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

const MOCK = { id: 'fm_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', marketName: 'Balogun Fish Market', status: 'seeded' };

describe('POST /profiles — create fish market profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', marketName: 'Balogun Fish Market' }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 when fields missing (no route validation', async () => {
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', marketName: 'Balogun Fish Market' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/profiles/fm_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(null); expect((await makeApp().request('/profiles/nx')).status).toBe(404); });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/profiles/fm_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/profiles/fm_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/stock — P9 integer grams, price_per_kg_kobo', () => {
  it('returns 201 for valid stock entry with integer grams', async () => {
    mockRepo.createStock.mockResolvedValueOnce({ id: 'stk_001', fishType: 'catfish', weightGrams: 50000, pricePerKgKobo: 180000 });
    expect((await makeApp().request('/profiles/fm_001/stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fishType: 'catfish', weightGrams: 50000, pricePerKgKobo: 180000, arrivalDate: 1700000000 }) })).status).toBe(201);
  });
});

describe('GET /profiles/:id/stock', () => {
  it('returns 404 (no list endpoint defined)', async () => {
    expect((await makeApp().request('/profiles/fm_001/stock')).status).toBe(404);
  });
});
