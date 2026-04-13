/**
 * Generator Repair vertical route tests — P11
 * FSM: seeded → claimed → active (old-style named export, b['status'] body key)
 * ≥10 cases: CRUD, FSM, jobs, parts, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { generatorRepairRoutes } from './generator-repair.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createJob: vi.fn(), listJobs: vi.fn(),
    addPart: vi.fn(), listParts: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-generator-repair', () => ({
  GeneratorRepairRepository: vi.fn(() => mockRepo),
  isValidGeneratorRepairTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', generatorRepairRoutes);
  return w;
}

const MOCK = { id: 'gr_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'GenFix Nigeria', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create generator repair profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with generator_repair key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'GenFix Nigeria' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { generator_repair: typeof MOCK };
    expect(body.generator_repair.businessName).toBe('GenFix Nigeria');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Kano Gen Repairs' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns generator_repair profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { generator_repair: typeof MOCK };
    expect(body.generator_repair.id).toBe('gr_001');
  });
});

describe('GET /:id — get generator repair profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gr_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { generator_repair: typeof MOCK };
    expect(body.generator_repair.id).toBe('gr_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/gr_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/gr_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('gr_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (b[status] key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/gr_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { generator_repair: typeof CLAIMED };
    expect(body.generator_repair.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidGeneratorRepairTransition } = await import('@webwaka/verticals-generator-repair');
    vi.mocked(isValidGeneratorRepairTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gr_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/gr_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidGeneratorRepairTransition } = await import('@webwaka/verticals-generator-repair');
    vi.mocked(isValidGeneratorRepairTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gr_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/jobs — create repair job', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with job record', async () => {
    const job = { id: 'job_001', profileId: 'gr_001', equipmentType: 'generator', totalCostKobo: 200000 };
    mockRepo.createJob.mockResolvedValueOnce(job);
    const res = await makeApp().request('/gr_001/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_ref_id: 'ref_c001', equipment_type: 'generator', brand: 'Thermocool', total_cost_kobo: 200000, job_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { job: typeof job };
    expect(body.job.equipmentType).toBe('generator');
  });
});

describe('GET /:id/jobs — list repair jobs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of jobs', async () => {
    mockRepo.listJobs.mockResolvedValueOnce([{ id: 'job_001' }, { id: 'job_002' }]);
    const res = await makeApp().request('/gr_001/jobs');
    expect(res.status).toBe(200);
    const body = await res.json() as { jobs: { id: string }[]; count: number };
    expect(body.jobs).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/parts — add part to inventory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with part record', async () => {
    const part = { id: 'part_001', partName: 'Capacitor 35uf', unitCostKobo: 50000 };
    mockRepo.addPart.mockResolvedValueOnce(part);
    const res = await makeApp().request('/gr_001/parts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ part_name: 'Capacitor 35uf', quantity_in_stock: 50, unit_cost_kobo: 50000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { part: typeof part };
    expect(body.part.partName).toBe('Capacitor 35uf');
  });
});
