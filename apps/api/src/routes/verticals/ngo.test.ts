/**
 * NGO / Non-Profit vertical route tests — P10 Set I
 * FSM: seeded → claimed → cac_registered → active → suspended
 * P13: no beneficiary PII to AI; L2 cap
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (funding).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './ngo.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(), findById: vi.fn(), transition: vi.fn(), createFunding: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-ngo', () => ({
  NgoRepository: vi.fn(() => mockRepo),
  isValidNgoTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'ngo_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', organizationId: 'org_a', sector: 'education', status: 'seeded' };

describe('POST /profiles — create NGO profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', organizationId: 'org_a', sector: 'education' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', organizationId: 'org_b', sector: 'health' }) });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ngo_001')).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx')).status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findById.mockResolvedValue(MOCK);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/profiles/ngo_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidNgoTransition } = await import('@webwaka/verticals-ngo');
    (isValidNgoTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ngo_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });

  it('T3: transition uses auth tenantId', async () => {
    mockRepo.findById.mockResolvedValue(MOCK);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    await makeApp('tnt_b').request('/profiles/ngo_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(mockRepo.findById).toHaveBeenCalledWith('ngo_001', 'tnt_b');
  });
});

describe('POST /profiles/:id/funding', () => {
  it('returns 201 for valid donation record', async () => {
    mockRepo.createFunding.mockResolvedValueOnce({ id: 'fund_001', amountKobo: 500000 });
    const res = await makeApp().request('/profiles/ngo_001/funding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ donorName: 'Emeka Foundation', amountKobo: 500000, currency: 'NGN', purpose: 'scholarships', paystackRef: 'txn_001' }) });
    expect(res.status).toBe(201);
  });

  it('T3: funding scoped to tenantId', async () => {
    mockRepo.createFunding.mockResolvedValueOnce({ id: 'fund_002' });
    await makeApp('tnt_c').request('/profiles/ngo_001/funding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ donorName: 'X Foundation', amountKobo: 200000 }) });
    expect(mockRepo.createFunding).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_c' }));
  });
});
