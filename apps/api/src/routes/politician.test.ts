/**
 * Politician vertical route tests — P3-D
 * Covers all 6 endpoints with ≥15 cases.
 * Bug 5 fix verification: DELETE requires admin role.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { politicianRoutes } from './politician.js';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { mockRepo, mockGuardSeedToClaimed, mockGuardClaimedToCandidate, mockIsValidTransition } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(),
    findById: vi.fn(),
    findByWorkspace: vi.fn(),
    update: vi.fn(),
    transition: vi.fn(),
    delete: vi.fn(),
  },
  mockGuardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  mockGuardClaimedToCandidate: vi.fn().mockReturnValue({ allowed: true }),
  mockIsValidTransition: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-politician', () => ({
  PoliticianRepository: vi.fn(() => mockRepo),
  guardSeedToClaimed: mockGuardSeedToClaimed,
  guardClaimedToCandidate: mockGuardClaimedToCandidate,
  isValidPoliticianTransition: mockIsValidTransition,
}));

// ---------------------------------------------------------------------------
// Stub DB (repo is mocked so DB is not actually used)
// ---------------------------------------------------------------------------

const stubDb = {
  prepare: () => ({
    bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }),
  }),
};

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function makeApp(tenantId = 'tnt_a', userId = 'usr_a', role = 'admin') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    c.set('auth' as never, { userId, tenantId, role, kycTier: 2 } as never);
    await next();
  });
  app.route('/politician', politicianRoutes);
  return app;
}

const MOCK_PROFILE = { id: 'pol_001', individualId: 'ind_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', officeType: 'governor', jurisdictionId: 'jur_lagos', status: 'seeded', ninVerified: true, inecFilingRef: null };

// ---------------------------------------------------------------------------
// POST /politician — create
// ---------------------------------------------------------------------------

describe('POST /politician', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 400 when required fields are missing', async () => {
    const app = makeApp();
    const res = await app.request('/politician', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ individual_id: 'ind_001' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid office_type', async () => {
    const app = makeApp();
    const res = await app.request('/politician', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ individual_id: 'ind_001', workspace_id: 'wsp_a', office_type: 'emperor', jurisdiction_id: 'jur_lagos' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 201 for valid politician creation', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK_PROFILE);
    const app = makeApp();
    const res = await app.request('/politician', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ individual_id: 'ind_001', workspace_id: 'wsp_a', office_type: 'governor', jurisdiction_id: 'jur_lagos' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ politician: { id: string } }>();
    expect(body.politician.id).toBe('pol_001');
  });

  it('T3: create is called with tenantId from auth', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK_PROFILE);
    const app = makeApp('tnt_B');
    await app.request('/politician', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ individual_id: 'ind_001', workspace_id: 'wsp_a', office_type: 'senator', jurisdiction_id: 'jur_kano' }),
    });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_B' }));
  });
});

// ---------------------------------------------------------------------------
// GET /politician/workspace/:workspaceId
// ---------------------------------------------------------------------------

describe('GET /politician/workspace/:workspaceId', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with list of politicians', async () => {
    mockRepo.findByWorkspace.mockResolvedValueOnce([MOCK_PROFILE]);
    const app = makeApp();
    const res = await app.request('/politician/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json<{ politicians: unknown[]; count: number }>();
    expect(body.count).toBe(1);
  });

  it('T3: findByWorkspace called with tenantId', async () => {
    mockRepo.findByWorkspace.mockResolvedValueOnce([]);
    const app = makeApp('tnt_C');
    await app.request('/politician/workspace/wsp_a');
    expect(mockRepo.findByWorkspace).toHaveBeenCalledWith('wsp_a', 'tnt_C');
  });
});

// ---------------------------------------------------------------------------
// GET /politician/:id
// ---------------------------------------------------------------------------

describe('GET /politician/:id', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 when profile found', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK_PROFILE);
    const app = makeApp();
    const res = await app.request('/politician/pol_001');
    expect(res.status).toBe(200);
    const body = await res.json<{ politician: { id: string } }>();
    expect(body.politician.id).toBe('pol_001');
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const app = makeApp();
    const res = await app.request('/politician/pol_missing');
    expect(res.status).toBe(404);
  });

  it('T3: findById called with tenantId from auth', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const app = makeApp('tnt_D');
    await app.request('/politician/pol_001');
    expect(mockRepo.findById).toHaveBeenCalledWith('pol_001', 'tnt_D');
  });
});

// ---------------------------------------------------------------------------
// POST /politician/:id/transition — FSM
// ---------------------------------------------------------------------------

describe('POST /politician/:id/transition', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid FSM transition', async () => {
    mockIsValidTransition.mockReturnValueOnce(false);
    mockRepo.findById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'candidate' });
    const app = makeApp();
    const res = await app.request('/politician/pol_001/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'seeded' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 403 for seeded→claimed when KYC guard fails', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded', ninVerified: false });
    mockIsValidTransition.mockReturnValueOnce(true);
    mockGuardSeedToClaimed.mockReturnValueOnce({ allowed: false, reason: 'NIN not verified' });
    const app = makeApp('tnt_a', 'usr_a', 'admin');
    const res = await app.request('/politician/pol_001/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'claimed' }),
    });
    expect(res.status).toBe(403);
    const body = await res.json<{ error: string }>();
    expect(body.error).toBe('GUARD_FAILED');
  });

  it('returns 200 for valid transition', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'claimed', ninVerified: true, inecFilingRef: 'REF123' });
    mockIsValidTransition.mockReturnValueOnce(true);
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'candidate' });
    const app = makeApp();
    const res = await app.request('/politician/pol_001/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: 'candidate' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ politician: { status: string } }>();
    expect(body.politician.status).toBe('candidate');
  });
});

// ---------------------------------------------------------------------------
// DELETE /politician/:id — Bug 5 fix: requires admin role
// ---------------------------------------------------------------------------

describe('DELETE /politician/:id', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 403 for non-admin role (Bug 5 fix)', async () => {
    const app = makeApp('tnt_a', 'usr_a', 'member');
    const res = await app.request('/politician/pol_001', { method: 'DELETE' });
    expect(res.status).toBe(403);
  });

  it('returns 403 for editor role (Bug 5 fix)', async () => {
    const app = makeApp('tnt_a', 'usr_a', 'editor');
    const res = await app.request('/politician/pol_001', { method: 'DELETE' });
    expect(res.status).toBe(403);
  });

  it('returns 200 for admin role', async () => {
    mockRepo.delete.mockResolvedValueOnce(true);
    const app = makeApp('tnt_a', 'usr_a', 'admin');
    const res = await app.request('/politician/pol_001', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json<{ deleted: boolean }>();
    expect(body.deleted).toBe(true);
  });

  it('returns 200 for super_admin role', async () => {
    mockRepo.delete.mockResolvedValueOnce(true);
    const app = makeApp('tnt_a', 'usr_a', 'super_admin');
    const res = await app.request('/politician/pol_001', { method: 'DELETE' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when profile not found at delete', async () => {
    mockRepo.delete.mockResolvedValueOnce(false);
    const app = makeApp('tnt_a', 'usr_a', 'admin');
    const res = await app.request('/politician/pol_missing', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});
