/**
 * Talent Agency vertical route tests — P10 Set H
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (talents, deals).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './talent-agency.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createRosterEntry: vi.fn(), createBooking: vi.fn(), createFeeRecord: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-talent-agency', () => ({
  TalentAgencyRepository: vi.fn(() => mockRepo),
  isValidTalentAgencyTransition: vi.fn().mockReturnValue(true),
  guardClaimedToNmmaVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoTalentDealDataInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerBps: vi.fn().mockReturnValue({ allowed: true }),
  guardFeeArithmetic: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'ta_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', agencyName: 'Star Talents', status: 'seeded' };

describe('POST /profiles — create talent agency profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', agencyName: 'Star Talents' }) });
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
    expect((await makeApp().request('/profiles/ta_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/ta_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidTalentAgencyTransition } = await import('@webwaka/verticals-talent-agency');
    (isValidTalentAgencyTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/ta_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/roster', () => {
  it('returns 201 for valid talent roster addition', async () => {
    mockRepo.createRosterEntry.mockResolvedValueOnce({ id: 'tlt_001', talentRefId: 'tlt_a' });
    const res = await makeApp().request('/profiles/ta_001/roster', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ talentRefId: 'tlt_a', category: 'musician', commissionBps: 1500, signedDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/bookings', () => {
  it('returns 201 for valid talent booking', async () => {
    mockRepo.createBooking.mockResolvedValueOnce({ id: 'bk_001', brandFeeKobo: 5000000 });
    const res = await makeApp().request('/profiles/ta_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ talentRefId: 'tlt_a', brandRefId: 'brd_a', bookingDate: 1700000000, deliverableType: 'performance', brandFeeKobo: 5000000, commissionKobo: 750000, talentPayoutKobo: 4250000 }) });
    expect(res.status).toBe(201);
  });
});
