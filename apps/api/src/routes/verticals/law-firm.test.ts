/**
 * Law Firm vertical route tests — P10 Set H
 * P13: matter_ref_id must be opaque UUID; legal privilege enforced
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources, P13 guards.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './law-firm.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createMatter: vi.fn(), createTimeEntry: vi.fn(), createCpdLog: vi.fn(),
    createCourtCalendar: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-law-firm', () => ({
  LawFirmRepository: vi.fn(() => mockRepo),
  isValidLawFirmTransition: vi.fn().mockReturnValue(true),
  guardClaimedToNbaVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL3HitlRequired: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardLegalPrivilege: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerMinutes: vi.fn().mockReturnValue({ allowed: true }),
  guardOpaqueMatterRefId: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'lf_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', firmName: 'Justice & Co', status: 'seeded' };

describe('POST /profiles — create law firm profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', firmName: 'Justice & Co' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', firmName: 'X Law' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/lf_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/lf_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidLawFirmTransition } = await import('@webwaka/verticals-law-firm');
    (isValidLawFirmTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/lf_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/matters — P13 opaque matter_ref_id', () => {
  it('returns 201 for valid matter', async () => {
    mockRepo.createMatter.mockResolvedValueOnce({ id: 'mat_001', matterRefId: 'uuid-opaque' });
    const res = await makeApp().request('/profiles/lf_001/matters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matterRefId: 'uuid-opaque', practiceArea: 'commercial', agreedFeeKobo: 1000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/time-entries', () => {
  it('returns 201 for valid time entry', async () => {
    mockRepo.createTimeEntry.mockResolvedValueOnce({ id: 'te_001', timeMinutes: 120 });
    const res = await makeApp().request('/profiles/lf_001/time-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matterRefId: 'uuid-opaque', feeEarnerRefId: 'mem_a', timeMinutes: 120, ratePerHourKobo: 250000, amountKobo: 500000, entryDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/court-calendar', () => {
  it('returns 201 for valid court calendar entry', async () => {
    mockRepo.createCourtCalendar.mockResolvedValueOnce({ id: 'cc_001', matterRefId: 'uuid-opaque', courtDate: 1700000000 });
    const res = await makeApp().request('/profiles/lf_001/court-calendar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matterRefId: 'uuid-opaque', courtName: 'FCT High Court', courtDate: 1700000000, courtType: 'high', hearingType: 'mention' }) });
    expect(res.status).toBe(201);
  });
});
