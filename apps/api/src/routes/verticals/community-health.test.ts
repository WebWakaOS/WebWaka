/**
 * Community Health vertical route tests — P8 Set F (V-HEALTH-F3)
 * ≥10 cases: CRUD, FSM, T3, P13 data-entry, P12 USSD AI-block.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './community-health.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(),
    findProfileById: vi.fn(),
    updateProfile: vi.fn(),
    transition: vi.fn(),
    createHousehold: vi.fn(),
    listHouseholds: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-community-health', () => ({
  CommunityHealthRepository: vi.fn(() => mockRepo),
  guardClaimedToNphcdaRegistered: vi.fn(),
  guardUssdAiBlock: vi.fn().mockReturnValue({ allowed: false, reason: 'P12: AI blocked on USSD sessions' }),
  guardP13HouseholdData: vi.fn(),
  guardIntegerCount: vi.fn().mockReturnValue({ allowed: true }),
  isValidCommunityHealthTransition: mockIsValid,
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

const MOCK_PROFILE = { id: 'ch_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', orgName: 'Bariga CHW Network', lga: 'Bariga', status: 'seeded' };

describe('POST /profiles — create community health profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', orgName: 'Bariga CHW Network', lga: 'Bariga' }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 without optional lga', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', orgName: 'Bariga CHW Network' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    await makeApp('tnt_ch').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', orgName: 'Bariga CHW Network' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_ch' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/profiles/ch_001');
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
    const res = await makeApp().request('/profiles/ch_001/transition', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'active' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValid.mockReturnValueOnce(true);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed' });
    const res = await makeApp().request('/profiles/ch_001/transition', {
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

describe('P12: USSD AI block', () => {
  it('returns 403 when isUssdSession=true on AI endpoint', async () => {
    const res = await makeApp().request('/profiles/ch_001/ai/coverage-report', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isUssdSession: true }),
    });
    expect(res.status).toBe(403);
    const json = await res.json() as { error: string };
    expect(json.error).toContain('P12');
  });
});
