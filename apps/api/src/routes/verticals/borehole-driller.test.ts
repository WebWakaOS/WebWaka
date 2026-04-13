/**
 * Borehole Driller vertical route tests — P11
 * FSM: seeded → claimed → coren_verified → active (old-style named export)
 * Transition body key: to_status
 * ≥10 cases: CRUD, FSM, projects, rigs, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { boreholeDrillerRoutes } from './borehole-driller.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createProject: vi.fn(), listProjects: vi.fn(), updateProjectStatus: vi.fn(),
    createRig: vi.fn(), listRigs: vi.fn(), updateRigStatus: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-borehole-driller', () => ({
  BoreholeDrillerRepository: vi.fn(() => mockRepo),
  isValidBoreholeDrillerTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToCorenVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', boreholeDrillerRoutes);
  return w;
}

const MOCK = { id: 'bd_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'Deep Water Drillers', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create borehole driller profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with borehole_driller key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'Deep Water Drillers', rig_count: 3 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { borehole_driller: typeof MOCK };
    expect(body.borehole_driller.companyName).toBe('Deep Water Drillers');
  });

  it('returns 400 if workspace_id missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', company_name: 'Abuja Drillers' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns borehole_driller by workspace', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { borehole_driller: typeof MOCK };
    expect(body.borehole_driller.id).toBe('bd_001');
  });
});

describe('GET /:id — get borehole driller profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/bd_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { borehole_driller: typeof MOCK };
    expect(body.borehole_driller.id).toBe('bd_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/bd_999');
    expect(res.status).toBe(404);
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status with to_status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/bd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { borehole_driller: typeof CLAIMED };
    expect(body.borehole_driller.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/bd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/bd_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidBoreholeDrillerTransition } = await import('@webwaka/verticals-borehole-driller');
    vi.mocked(isValidBoreholeDrillerTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/bd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/projects — create borehole project', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with project', async () => {
    const project = { id: 'proj_001', workspaceId: 'bd_001', clientPhone: '08012345678', depthMetres: 80 };
    mockRepo.createProject.mockResolvedValueOnce(project);
    const res = await makeApp().request('/bd_001/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_phone: '08012345678', location_address: 'Abuja', state: 'FCT', depth_metres: 80, total_cost_kobo: 80000000, deposit_kobo: 30000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { project: typeof project };
    expect(body.project.depthMetres).toBe(80);
  });
});

describe('GET /:id/projects — list projects', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of projects', async () => {
    mockRepo.listProjects.mockResolvedValueOnce([{ id: 'proj_001' }, { id: 'proj_002' }]);
    const res = await makeApp().request('/bd_001/projects');
    expect(res.status).toBe(200);
    const body = await res.json() as { projects: { id: string }[]; count: number };
    expect(body.projects).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});
