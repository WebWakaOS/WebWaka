/**
 * Electronics Repair vertical route tests — P8 Set A (V-COMM-EXT-A7)
 * ≥10 cases: CRUD, FSM, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { electronicsRepairRoutes } from './electronics-repair.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfilesByWorkspace: vi.fn(), findProfileById: vi.fn(),
    updateProfile: vi.fn(), transitionProfile: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-electronics-repair', () => ({
  ElectronicsRepairRepository: vi.fn(() => mockRepo),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }), guardClaimedToCacVerified: vi.fn().mockReturnValue({ allowed: true }),
  isValidElectronicsRepairTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 1 } as never); await next(); });
  w.route('/', electronicsRepairRoutes);
  return w;
}

const MOCK = { id: 'er_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', shopName: 'TechFix Hub', state: 'Lagos', status: 'seeded' };

describe('POST / — create electronics repair profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', shop_name: 'TechFix Hub', state: 'Lagos' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_e').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', shop_name: 'TechFix Hub', state: 'Lagos' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_e' }));
  });
});

describe('GET /workspace/:workspaceId', () => {
  it('returns 200', async () => { mockRepo.findProfilesByWorkspace.mockResolvedValueOnce([MOCK]); expect((await makeApp().request('/workspace/wsp_a')).status).toBe(200); });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/er_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(null); expect((await makeApp().request('/nonexistent')).status).toBe(404); });
});

describe('PATCH /:id', () => {
  it('returns 200 on update', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce({ ...MOCK, shopName: 'TechFix Pro' });
    expect((await makeApp().request('/er_001', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shop_name: 'TechFix Pro' }) })).status).toBe(200);
  });
  it('returns 404 when not found', async () => {
    mockRepo.updateProfile.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shop_name: 'X' }) })).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/er_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) })).status).toBe(422);
  });
  it('returns 200 for valid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transitionProfile.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/er_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(200);
  });
  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(404);
  });
});
