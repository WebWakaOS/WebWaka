/**
 * Sports Academy vertical route tests — P8 Set F (V-HEALTH-F2)
 * ≥10 cases: CRUD, FSM, T3, P12 AI-block.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './sports-academy.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(),
    findProfileById: vi.fn(),
    updateProfile: vi.fn(),
    transition: vi.fn(),
    createMembership: vi.fn(),
    listMemberships: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-sports-academy', () => ({
  SportsAcademyRepository: vi.fn(() => mockRepo),
  guardClaimedToPermitVerified: vi.fn(),
  guardHighValueMembership: vi.fn(),
  guardP13HealthMetrics: vi.fn(),
  guardFractionalKobo: vi.fn(),
  isValidSportsAcademyTransition: mockIsValid,
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

const MOCK_PROFILE = { id: 'sa_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', academyName: 'Champions Academy', status: 'seeded' };

describe('POST /profiles — create sports academy profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', academyName: 'Champions Academy' }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 with optional type and cacRc', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK_PROFILE, type: 'football' });
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', academyName: 'Champions Academy', type: 'football', cacRc: 'RC9988' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    await makeApp('tnt_sa').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', academyName: 'Champions Academy' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_sa' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles/sa_001');
    expect(res.status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  it('returns 422 for invalid FSM transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    mockIsValid.mockReturnValueOnce(false);
    const res = await makeApp().request('/profiles/sa_001/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'active' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValid.mockReturnValueOnce(true);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed' });
    const res = await makeApp().request('/profiles/sa_001/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'claimed' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/nonexistent/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'claimed' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('P12: AI blocked on USSD sessions', () => {
  it('returns 403 when isUssdSession=true on AI endpoint', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles/sa_001/ai/utilisation-report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUssdSession: true, memberRefId: 'ref_001' }),
    });
    expect(res.status).toBe(403);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('P12');
  });
});
