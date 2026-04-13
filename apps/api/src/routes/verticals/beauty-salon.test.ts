/**
 * Beauty Salon vertical route tests — P8 Set A (V-COMM-EXT-A3)
 * ≥10 cases: CRUD, FSM, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { beautySalonRoutes } from './beauty-salon.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(),
    findProfilesByWorkspace: vi.fn(),
    findProfileById: vi.fn(),
    updateProfile: vi.fn(),
    transitionProfile: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-beauty-salon', () => ({
  BeautySalonRepository: vi.fn(() => mockRepo),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToPermitVerified: vi.fn().mockReturnValue({ allowed: true }),
  isValidBeautySalonTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = {
  prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }),
};

function makeApp(tenantId = 'tnt_a') {
  const wrapper = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  wrapper.use('*', async (c, next) => {
    c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 1 } as never);
    await next();
  });
  wrapper.route('/', beautySalonRoutes);
  return wrapper;
}

const MOCK_PROFILE = { id: 'bs_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', salonName: 'Glam Studio', state: 'Lagos', status: 'seeded' };

describe('POST / — create beauty salon profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', salon_name: 'Glam Studio', state: 'Lagos' }),
    });
    expect(res.status).toBe(201);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await makeApp().request('/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a' }),
    });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId comes from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    await makeApp('tnt_b').request('/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', salon_name: 'Glam Studio', state: 'Lagos' }),
    });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId', () => {
  it('returns 200', async () => {
    mockRepo.findProfilesByWorkspace.mockResolvedValueOnce([MOCK_PROFILE]);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
  });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const res = await makeApp().request('/bs_001');
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /:id — update', () => {
  it('returns 200 on successful update', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce({ ...MOCK_PROFILE, salonName: 'Updated Salon' });
    const res = await makeApp().request('/bs_001', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salon_name: 'Updated Salon' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce(null);
    const res = await makeApp().request('/nonexistent', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ salon_name: 'X' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    mockIsValid.mockReturnValueOnce(false);
    const res = await makeApp().request('/bs_001/transition', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_status: 'active' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValid.mockReturnValueOnce(true);
    mockRepo.transitionProfile.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed' });
    const res = await makeApp().request('/bs_001/transition', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_status: 'claimed' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/nonexistent/transition', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to_status: 'claimed' }),
    });
    expect(res.status).toBe(404);
  });
});
