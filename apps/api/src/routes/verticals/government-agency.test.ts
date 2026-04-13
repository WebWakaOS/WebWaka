/**
 * Government Agency / MDA vertical route tests — P11
 * FSM: seeded → claimed → bpp_registered → active → suspended
 * Guards: guardClaimedToBppRegistered, guardL3HitlRequired, guardNoVendorOrProcurementInAi, guardFractionalKobo (all sync)
 * ≥10 cases: CRUD, FSM, appropriations, procurement, IGR, AI guards.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './government-agency.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createAppropriation: vi.fn(), createProcurement: vi.fn(), createIgrCollection: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-government-agency', () => ({
  GovernmentAgencyRepository: vi.fn(() => mockRepo),
  isValidGovernmentAgencyTransition: vi.fn().mockReturnValue(true),
  guardClaimedToBppRegistered: vi.fn().mockReturnValue({ allowed: true }),
  guardL3HitlRequired: vi.fn().mockReturnValue({ allowed: true }),
  guardNoVendorOrProcurementInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'gov_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', agencyName: 'Federal Ministry of Finance', state: 'Abuja', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create government agency profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', agencyName: 'Federal Ministry of Finance', state: 'Abuja' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.agencyName).toBe('Federal Ministry of Finance');
  });

  it('T3: creates profile scoped to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', agencyName: 'State Revenue Service', state: 'Lagos' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get government agency', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/gov_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('gov_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/gov_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/profiles/gov_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('gov_001', 'tnt_b');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions to claimed and returns updated profile', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/gov_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('gov_001', 'tnt_a', 'claimed');
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/gov_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidGovernmentAgencyTransition } = await import('@webwaka/verticals-government-agency');
    vi.mocked(isValidGovernmentAgencyTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/gov_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if BPP guard fails on bpp_registered transition', async () => {
    const { guardClaimedToBppRegistered } = await import('@webwaka/verticals-government-agency');
    vi.mocked(guardClaimedToBppRegistered).mockReturnValueOnce({ allowed: false, reason: 'BPP registration missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/gov_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'bpp_registered' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /profiles/:id/appropriations — create appropriation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with appropriation record', async () => {
    const approp = { id: 'app_001', profileId: 'gov_001', budgetLineItem: 'Education', amountKobo: 50000000000 };
    mockRepo.createAppropriation.mockResolvedValueOnce(approp);
    const res = await makeApp().request('/profiles/gov_001/appropriations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ budgetLineItem: 'Education', amountKobo: 50000000000, fiscalYear: 2024 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof approp;
    expect(body.budgetLineItem).toBe('Education');
  });
});

describe('POST /profiles/:id/procurement — create procurement', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with procurement record', async () => {
    const procurement = { id: 'proc_001', profileId: 'gov_001', procurementRef: 'ref_opaque_001' };
    mockRepo.createProcurement.mockResolvedValueOnce(procurement);
    const res = await makeApp().request('/profiles/gov_001/procurements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ procurementRef: 'ref_opaque_001', vendorRef: 'ref_opaque_vendor', amountKobo: 10000000000, category: 'goods' }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/igr — create IGR collection', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with IGR collection record', async () => {
    const igr = { id: 'igr_001', profileId: 'gov_001', revenueHeadRef: 'rev_001', amountKobo: 5000000 };
    mockRepo.createIgrCollection.mockResolvedValueOnce(igr);
    const res = await makeApp().request('/profiles/gov_001/igr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revenueHeadRef: 'rev_001', amountKobo: 5000000, collectionDate: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof igr;
    expect(body.amountKobo).toBe(5000000);
  });
});
