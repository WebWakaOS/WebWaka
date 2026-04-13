/**
 * Rehab Centre vertical route tests — P8 Set F (V-HEALTH-F5)
 * ≥10 cases: CRUD, FSM, T3, P9 integer guard, KYC Tier 3, P12 USSD AI-block.
 * CRITICAL: P13 — resident_ref_id opaque; L3 HITL mandatory.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './rehab-centre.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(),
    findProfileById: vi.fn(),
    updateProfile: vi.fn(),
    transition: vi.fn(),
    createAdmission: vi.fn(),
    listAdmissions: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-rehab-centre', () => ({
  RehabCentreRepository: vi.fn(() => mockRepo),
  guardClaimedToNdleaVerified: vi.fn(),
  guardAiHitl: vi.fn(),
  guardKycTier3: vi.fn().mockReturnValue({ allowed: true }),
  guardP13ResidentData: vi.fn(),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardPositiveInteger: vi.fn().mockReturnValue({ allowed: true }),
  isValidRehabCentreTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a', kycTier = 3) {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK_PROFILE = { id: 'rh_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', centreName: 'Hope Recovery Centre', bedCount: 20, kycTier: 3, status: 'seeded' };

describe('POST /profiles — create rehab centre profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for Tier-3 KYC valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', centreName: 'Hope Recovery Centre', bedCount: 20, kycTier: 3 }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 without optional bedCount', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', centreName: 'Hope Recovery Centre', kycTier: 3 }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    await makeApp('tnt_rh').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', centreName: 'Hope Recovery Centre', kycTier: 3 }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_rh' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles/rh_001');
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    mockIsValid.mockReturnValueOnce(false);
    const res = await makeApp().request('/profiles/rh_001/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'active' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValid.mockReturnValueOnce(true);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed' });
    const res = await makeApp().request('/profiles/rh_001/transition', {
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

describe('P9: balanceKobo must be integer', () => {
  it('returns 422 when balanceKobo is a float', async () => {
    const res = await makeApp().request('/profiles/rh_001/enrolments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programmeId: 'prog_001', depositKobo: 10000, balanceKobo: 5000.5 }),
    });
    expect(res.status).toBe(422);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('P9');
  });
});

describe('P12: AI blocked on USSD sessions', () => {
  it('returns 403 when isUssdSession=true on AI endpoint', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles/rh_001/ai/occupancy-report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUssdSession: true }),
    });
    expect(res.status).toBe(403);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('P12');
  });
});
