/**
 * Advertising Agency vertical route tests — P10 Set H
 * ≥10 cases: CRUD (health-style /profiles), FSM, T3 isolation, sub-resources.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './advertising-agency.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createCampaign: vi.fn(), createCampaignReport: vi.fn(), createCreative: vi.fn(), createMediaBuy: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-advertising-agency', () => ({
  AdvertisingAgencyRepository: vi.fn(() => mockRepo),
  isValidAdvertisingAgencyTransition: vi.fn().mockReturnValue(true),
  guardClaimedToApconVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardNoClientBriefInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerImpressions: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'aa_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', agencyName: 'Advert Pro', status: 'seeded' };

describe('POST /profiles — create advertising agency profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', agencyName: 'Advert Pro' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', agencyName: 'X Agency' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/aa_001')).status).toBe(200);
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
    const res = await makeApp().request('/profiles/aa_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidAdvertisingAgencyTransition } = await import('@webwaka/verticals-advertising-agency');
    (isValidAdvertisingAgencyTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/aa_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/campaigns', () => {
  it('returns 201 for valid campaign', async () => {
    mockRepo.createCampaign.mockResolvedValueOnce({ id: 'cmp_001', campaignName: 'Launch' });
    const res = await makeApp().request('/profiles/aa_001/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'cli_a', campaignName: 'Launch', budgetKobo: 5000000, startDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /campaigns/:campaignId/media-buys', () => {
  it('returns 201 for valid media buy', async () => {
    mockRepo.createMediaBuy.mockResolvedValueOnce({ id: 'mb_001', campaignId: 'cmp_001', channelType: 'tv', impressions: 500000 });
    const res = await makeApp().request('/campaigns/cmp_001/media-buys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channelType: 'tv', impressions: 500000, costKobo: 2000000, flightStart: 1700000000, flightEnd: 1701000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/ai/campaign-performance', () => {
  it('returns 200 for L2 AI campaign analysis', async () => {
    const res = await makeApp().request('/profiles/aa_001/ai/campaign-performance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2 }) });
    expect(res.status).toBe(200);
  });
});
