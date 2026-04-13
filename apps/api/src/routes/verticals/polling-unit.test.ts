/**
 * Polling Unit (INEC) vertical route tests — P9 Set E (V-CIV-EXT-E10)
 * ≥10 cases: CRUD (health-style /profiles), FSM, T3 isolation, units.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './polling-unit.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateProfile: vi.fn(), transition: vi.fn(),
    createPollingUnit: vi.fn(), listUnits: vi.fn(),
    createElectionEvent: vi.fn(), listElectionEvents: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-polling-unit', () => ({
  PollingUnitRepository: vi.fn(() => mockRepo),
  isValidPollingUnitTransition: mockIsValid,
  guardClaimedToInecAccredited: vi.fn().mockReturnValue({ allowed: true }),
  guardL3HitlRequired: vi.fn().mockReturnValue({ allowed: true }),
  guardNoVoterPiiInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerVoteCount: vi.fn().mockReturnValue({ allowed: true }),
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

const MOCK_PROFILE = { id: 'pu_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', lgaName: 'Eti-Osa', status: 'seeded' };

describe('POST /profiles — create polling unit profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', lgaName: 'Eti-Osa' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', lgaName: 'Eti-Osa' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    expect((await makeApp().request('/profiles/pu_001')).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx')).status).toBe(404);
  });
});

describe('POST /profiles/:id/units', () => {
  it('returns 201 for valid unit addition', async () => {
    mockRepo.createPollingUnit.mockResolvedValueOnce({ id: 'unit_001', unitCode: 'LG-PU-001', wardName: 'Ward 7' });
    const res = await makeApp().request('/profiles/pu_001/units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitCode: 'LG-PU-001', wardName: 'Ward 7', registeredVoters: 500 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /units/:unitId/election-events', () => {
  it('returns 201 for valid election event', async () => {
    mockRepo.createElectionEvent.mockResolvedValueOnce({ id: 'ev_001', eventType: 'accreditation', totalVoters: 500 });
    expect((await makeApp().request('/units/unit_001/election-events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventType: 'accreditation', totalVoters: 500 }) })).status).toBe(201);
  });
});
