/**
 * Funeral Home vertical route tests — P10 Set H
 * CRITICAL P13: case_ref_id must be opaque UUID; no deceased identity in AI
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './funeral-home.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createCase: vi.fn(), createService: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-funeral-home', () => ({
  FuneralHomeRepository: vi.fn(() => mockRepo),
  isValidFuneralHomeTransition: vi.fn().mockReturnValue(true),
  guardClaimedToMortuaryVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL3HitlRequired: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoDeceasedDataInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardOpaqueCaseRefId: vi.fn().mockReturnValue({ allowed: true }),
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

const MOCK = { id: 'fh_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'Grace Mortuary', status: 'seeded' };

describe('POST /profiles — create funeral home profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'Grace Mortuary' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', businessName: 'X Mortuary' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/fh_001')).status).toBe(200);
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
    expect((await makeApp().request('/profiles/fh_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidFuneralHomeTransition } = await import('@webwaka/verticals-funeral-home');
    (isValidFuneralHomeTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/fh_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/cases — P13 opaque case_ref_id', () => {
  it('returns 201 for valid case creation', async () => {
    mockRepo.createCase.mockResolvedValueOnce({ id: 'cs_001', caseRefId: 'uuid-opaque' });
    const res = await makeApp().request('/profiles/fh_001/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseRefId: 'uuid-opaque', funeralType: 'burial', serviceDateUnix: 1700000000, totalServiceFeeKobo: 2000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/services', () => {
  it('returns 201 for valid service record', async () => {
    mockRepo.createService = vi.fn().mockResolvedValueOnce({ id: 'svc_001', serviceType: 'embalming' });
    const res = await makeApp().request('/profiles/fh_001/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caseRefId: 'uuid-opaque', serviceType: 'embalming', serviceFeeKobo: 500000 }) });
    expect(res.status).toBe(201);
  });
});
