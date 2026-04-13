/**
 * Ward Representative vertical route tests — P11
 * FSM: seeded → claimed → active (old-style named export, body.to key for transition)
 * ≥10 cases: CRUD, FSM, polling units, projects, service requests, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { wardRepRoutes } from './ward-rep.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(), findById: vi.fn(), findByWorkspace: vi.fn(),
    update: vi.fn(), transition: vi.fn(),
    createPollingUnit: vi.fn(), createProject: vi.fn(), createServiceRequest: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-ward-rep', () => ({
  WardRepRepository: vi.fn(() => mockRepo),
  isValidWardRepTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', wardRepRoutes);
  return w;
}

const MOCK = { id: 'wr_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', councillorName: 'Hon. Bello Adisa', wardName: 'Ward 3', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create ward rep profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with ward_rep key', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', councillor_name: 'Hon. Bello Adisa', ward_name: 'Ward 3' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { ward_rep: typeof MOCK };
    expect(body.ward_rep.councillorName).toBe('Hon. Bello Adisa');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', councillor_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.create.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', councillor_name: 'Hon. Nneka Obi', ward_name: 'Ward 5' }) });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns ward_reps list', async () => {
    mockRepo.findByWorkspace.mockResolvedValueOnce([MOCK]);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { ward_reps: typeof MOCK[] };
    expect(body.ward_reps).toHaveLength(1);
  });
});

describe('GET /:id — get ward rep profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/wr_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { ward_rep: typeof MOCK };
    expect(body.ward_rep.id).toBe('wr_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/wr_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/wr_001');
    expect(mockRepo.findById).toHaveBeenCalledWith('wr_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (body.to key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using body.to key', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK);
    mockRepo.transition.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/wr_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { ward_rep: typeof CLAIMED };
    expect(body.ward_rep.status).toBe('claimed');
  });

  it('returns 400 if to state missing', async () => {
    const res = await makeApp().request('/wr_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/wr_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });
});

describe('POST /:id/polling-units — create polling unit', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with polling unit', async () => {
    const pu = { id: 'pu_001', profileId: 'wr_001', unitNumber: 'PU/LG001/W003/001', registeredVoters: 850 };
    mockRepo.createPollingUnit.mockResolvedValueOnce(pu);
    const res = await makeApp().request('/wr_001/polling-units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unit_number: 'PU/LG001/W003/001', address: 'Community Primary School', registered_voters: 850 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { polling_unit: typeof pu };
    expect(body.polling_unit.unitNumber).toBe('PU/LG001/W003/001');
  });
});

describe('POST /:id/projects — create project', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with project', async () => {
    const project = { id: 'proj_001', profileId: 'wr_001', projectName: 'Road Rehabilitation', amountKobo: 50000000000 };
    mockRepo.createProject.mockResolvedValueOnce(project);
    const res = await makeApp().request('/wr_001/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project_name: 'Road Rehabilitation', category: 'infrastructure', amount_kobo: 50000000000, status: 'ongoing' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { project: typeof project };
    expect(body.project.projectName).toBe('Road Rehabilitation');
  });
});

describe('POST /:id/service-requests — create service request', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with service request', async () => {
    const req = { id: 'sr_001', profileId: 'wr_001', requestType: 'streetlight', status: 'pending' };
    mockRepo.createServiceRequest.mockResolvedValueOnce(req);
    const res = await makeApp().request('/wr_001/service-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ request_type: 'streetlight', description: 'Broken streetlight on main road', location: 'Block A Junction', constituencyPhone: '08012345678' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { service_request: typeof req };
    expect(body.service_request.requestType).toBe('streetlight');
  });
});
