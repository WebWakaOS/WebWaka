/**
 * PR Firm vertical route tests — P11
 * FSM: seeded → claimed → nipr_verified → active → suspended
 * Guards: guardClaimedToNiprVerified, guardL2AiCap, guardFractionalKobo, guardNoClientStrategyInAi (all sync)
 * ≥10 cases: CRUD, FSM, campaigns, media coverage, billing, AI.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './pr-firm.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createCampaign: vi.fn(), createMediaCoverage: vi.fn(), createBilling: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-pr-firm', () => ({
  PrFirmRepository: vi.fn(() => mockRepo),
  isValidPrFirmTransition: vi.fn().mockReturnValue(true),
  guardClaimedToNiprVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoClientStrategyInAi: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'pr_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', firmName: 'Brand Masters PR', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create PR firm profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', firmName: 'Brand Masters PR' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.firmName).toBe('Brand Masters PR');
  });

  it('T3: creates profile scoped to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', firmName: 'Lagos Comms Ltd' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get PR firm profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/pr_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('pr_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/pr_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_c').request('/profiles/pr_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('pr_001', 'tnt_c');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions to claimed and calls updateStatus', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/pr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('pr_001', 'tnt_a', 'claimed');
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/pr_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPrFirmTransition } = await import('@webwaka/verticals-pr-firm');
    vi.mocked(isValidPrFirmTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/pr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if NIPR guard fails on nipr_verified', async () => {
    const { guardClaimedToNiprVerified } = await import('@webwaka/verticals-pr-firm');
    vi.mocked(guardClaimedToNiprVerified).mockReturnValueOnce({ allowed: false, reason: 'NIPR accreditation missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/pr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'nipr_verified' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /profiles/:id/campaigns — create campaign', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with campaign', async () => {
    const campaign = { id: 'cmp_001', profileId: 'pr_001', campaignName: 'Q1 Brand Push', budgetKobo: 50000000 };
    mockRepo.createCampaign.mockResolvedValueOnce(campaign);
    const res = await makeApp().request('/profiles/pr_001/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'ref_c001', campaignName: 'Q1 Brand Push', campaignType: 'digital', budgetKobo: 50000000, startDate: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof campaign;
    expect(body.campaignName).toBe('Q1 Brand Push');
  });

  it('returns 422 if fractional kobo guard fails', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-pr-firm');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9 violation' });
    const res = await makeApp().request('/profiles/pr_001/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'ref_c001', campaignName: 'Test', campaignType: 'print', budgetKobo: 0.5, startDate: 1700000000 }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/media-coverage — record media coverage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with media coverage record', async () => {
    const coverage = { id: 'cov_001', profileId: 'pr_001', mediaName: 'The Punch', sentiment: 'positive' };
    mockRepo.createMediaCoverage.mockResolvedValueOnce(coverage);
    const res = await makeApp().request('/profiles/pr_001/media-coverage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId: 'cmp_001', mediaName: 'The Punch', coverageDate: 1700000000, sentiment: 'positive' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof coverage;
    expect(body.mediaName).toBe('The Punch');
  });
});

describe('POST /profiles/:id/billing — create billing record', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with billing record', async () => {
    const billing = { id: 'bil_001', profileId: 'pr_001', retainerKobo: 500000000 };
    mockRepo.createBilling.mockResolvedValueOnce(billing);
    const res = await makeApp().request('/profiles/pr_001/billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'ref_c001', billingMonth: '2024-01', retainerKobo: 500000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof billing;
    expect(body.retainerKobo).toBe(500000000);
  });
});

describe('POST /profiles/:id/ai/campaign-insights — AI advisory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns queued status when guards allow', async () => {
    const res = await makeApp().request('/profiles/pr_001/ai/campaign-insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2 }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('queued');
  });

  it('returns 403 when L2 cap guard fails', async () => {
    const { guardL2AiCap } = await import('@webwaka/verticals-pr-firm');
    vi.mocked(guardL2AiCap).mockReturnValueOnce({ allowed: false, reason: 'L2 cap exceeded' });
    const res = await makeApp().request('/profiles/pr_001/ai/campaign-insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 5 }) });
    expect(res.status).toBe(403);
  });

  it('returns 403 when client strategy PII guard fails', async () => {
    const { guardNoClientStrategyInAi } = await import('@webwaka/verticals-pr-firm');
    vi.mocked(guardNoClientStrategyInAi).mockReturnValueOnce({ allowed: false, reason: 'P13: client strategy PII detected' });
    const res = await makeApp().request('/profiles/pr_001/ai/campaign-insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2, clientStrategy: 'confidential' }) });
    expect(res.status).toBe(403);
  });
});
