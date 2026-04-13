/**
 * Artisanal Mining vertical route tests — P9 Set G (V-MIN-G4)
 * Transport-old-style: POST /, body {to_status}, repo.transitionStatus, guards sync.
 * ≥10 cases: CRUD, FSM, T3, production logs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { artisanalMiningRoutes } from './artisanal-mining.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileByWorkspace: vi.fn(), findProfileById: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createProductionLog: vi.fn(), listProductionLogs: vi.fn(),
    createPermit: vi.fn(), listPermits: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-artisanal-mining', () => ({
  ArtisanalMiningRepository: vi.fn(() => mockRepo),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToMmsdVerified: vi.fn().mockReturnValue({ allowed: true }),
  isValidArtisanalMiningTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 2 } as never); await next(); });
  w.route('/', artisanalMiningRoutes);
  return w;
}

const MOCK = { id: 'am_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Plateau Miners Co-op', status: 'seeded' };

describe('POST / — create artisanal mining profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Plateau Miners Co-op' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when company_name missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Plateau Miners Co-op' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /workspace/:workspaceId', () => {
  it('returns 200', async () => { mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/workspace/wsp_a')).status).toBe(200); });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/am_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(null); expect((await makeApp().request('/nx')).status).toBe(404); });
});

describe('PATCH /:id', () => {
  it('returns 200 on update', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce({ ...MOCK, companyName: 'Plateau Miners Pro' });
    expect((await makeApp().request('/am_001', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'Plateau Miners Pro' }) })).status).toBe(200);
  });
  it('returns 404 when not found on update', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'X' }) })).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/am_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/am_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(404);
  });
});

describe('GET /:id/production-logs', () => {
  it('returns 200 with production log list', async () => {
    mockRepo.listProductionLogs.mockResolvedValueOnce([]);
    expect((await makeApp().request('/am_001/production-logs')).status).toBe(200);
  });
});
