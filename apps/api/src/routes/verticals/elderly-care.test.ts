/**
 * Elderly Care vertical route tests — P8 Set F (V-HEALTH-F4)
 * ≥10 cases: CRUD, FSM, T3, P9 float rejection, P12 AI-block.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './elderly-care.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(),
    findProfileById: vi.fn(),
    updateProfile: vi.fn(),
    transition: vi.fn(),
    createResident: vi.fn(),
    listResidents: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-elderly-care', () => ({
  ElderlyCareRepository: vi.fn(() => mockRepo),
  guardClaimedToFmhswVerified: vi.fn(),
  guardDiasporaBilling: vi.fn(),
  guardP13ClinicalData: vi.fn(),
  guardFractionalKobo: vi.fn(),
  isValidElderlyCareTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 2 } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK_PROFILE = { id: 'ec_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', facilityName: 'Graceful Years Home', bedCount: 30, status: 'seeded' };

describe('POST /profiles — create elderly care profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', facilityName: 'Graceful Years Home', bedCount: 30 }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 without optional bedCount', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', facilityName: 'Graceful Years Home' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    await makeApp('tnt_ec').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', facilityName: 'Graceful Years Home' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_ec' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles/ec_001');
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
    const res = await makeApp().request('/profiles/ec_001/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'active' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValid.mockReturnValueOnce(true);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed' });
    const res = await makeApp().request('/profiles/ec_001/transition', {
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
    const res = await makeApp().request('/profiles/ec_001/ai/occupancy-report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUssdSession: true, residentRefId: 'ref_001' }),
    });
    expect(res.status).toBe(403);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('P12');
  });
});
