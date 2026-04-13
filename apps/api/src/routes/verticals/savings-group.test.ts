/**
 * Savings Group (Ajo / Esusu) vertical route tests — P10 Set I
 * FSM: seeded → claimed → cac_registered → active → suspended
 * P13: no member PII to AI; contribution amounts must be integer kobo
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (members, contributions).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './savings-group.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createGroup: vi.fn(), findGroupById: vi.fn(), transitionStatus: vi.fn(),
    addMember: vi.fn(), recordContribution: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-savings-group', () => ({
  SavingsGroupRepository: vi.fn(() => mockRepo),
  isValidSavingsGroupTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCacRegistered: vi.fn().mockReturnValue({ allowed: true }),
  guardContributionAmountIsInteger: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'sg_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', groupName: 'Eko Ajo', contributionAmountKobo: 10000, cycleFrequency: 'monthly', status: 'seeded' };

describe('POST /profiles — create savings group', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createGroup.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', groupName: 'Eko Ajo', contributionAmountKobo: 10000, cycleFrequency: 'monthly' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createGroup.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', groupName: 'X Ajo', contributionAmountKobo: 5000, cycleFrequency: 'weekly' }) });
    expect(mockRepo.createGroup).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when group found', async () => {
    mockRepo.findGroupById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/sg_001')).status).toBe(200);
  });

  it('returns 404 when group not found', async () => {
    mockRepo.findGroupById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx')).status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findGroupById.mockResolvedValue(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/profiles/sg_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidSavingsGroupTransition } = await import('@webwaka/verticals-savings-group');
    (isValidSavingsGroupTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findGroupById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/sg_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when group not found', async () => {
    mockRepo.findGroupById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });

  it('T3: transition uses auth tenantId', async () => {
    mockRepo.findGroupById.mockResolvedValue(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    await makeApp('tnt_b').request('/profiles/sg_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(mockRepo.findGroupById).toHaveBeenCalledWith('sg_001', 'tnt_b');
  });
});

describe('POST /profiles/:id/members', () => {
  it('returns 201 for valid member addition', async () => {
    mockRepo.addMember.mockResolvedValueOnce({ id: 'mem_001', memberRefId: 'usr_b' });
    const res = await makeApp().request('/profiles/sg_001/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberRefId: 'usr_b', collectionOrder: 1 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/contributions', () => {
  it('returns 201 for valid contribution', async () => {
    mockRepo.recordContribution.mockResolvedValueOnce({ id: 'con_001', amountKobo: 10000 });
    const res = await makeApp().request('/profiles/sg_001/contributions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberRefId: 'usr_b', amountKobo: 10000, cycleNumber: 1, paystackRef: 'txn_001', paidDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});
