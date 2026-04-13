/**
 * Handyman vertical route tests — P11
 * FSM: seeded → claimed → active (old-style named export, b['status'] body key)
 * ≥10 cases: CRUD, FSM, jobs, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { handymanRoutes } from './handyman.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createJob: vi.fn(), listJobs: vi.fn(), updateJobStatus: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-handyman', () => ({
  HandymanRepository: vi.fn(() => mockRepo),
  isValidHandymanTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', handymanRoutes);
  return w;
}

const MOCK = { id: 'hm_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'FixIt Fast Services', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create handyman profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with handyman key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'FixIt Fast Services' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { handyman: typeof MOCK };
    expect(body.handyman.businessName).toBe('FixIt Fast Services');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Lagos Handyman Pro' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns handyman profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { handyman: typeof MOCK };
    expect(body.handyman.id).toBe('hm_001');
  });
});

describe('GET /:id — get handyman profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/hm_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { handyman: typeof MOCK };
    expect(body.handyman.id).toBe('hm_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/hm_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/hm_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('hm_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/hm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { handyman: typeof CLAIMED };
    expect(body.handyman.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidHandymanTransition } = await import('@webwaka/verticals-handyman');
    vi.mocked(isValidHandymanTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/hm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/hm_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidHandymanTransition } = await import('@webwaka/verticals-handyman');
    vi.mocked(isValidHandymanTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/hm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/jobs — create handyman job', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with job record', async () => {
    const job = { id: 'job_001', profileId: 'hm_001', jobType: 'plumbing', totalKobo: 350000 };
    mockRepo.createJob.mockResolvedValueOnce(job);
    const res = await makeApp().request('/hm_001/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_ref_id: 'ref_c001', job_type: 'plumbing', total_kobo: 350000, job_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { job: typeof job };
    expect(body.job.jobType).toBe('plumbing');
  });
});

describe('GET /:id/jobs — list handyman jobs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of jobs with count', async () => {
    mockRepo.listJobs.mockResolvedValueOnce([{ id: 'job_001' }, { id: 'job_002' }]);
    const res = await makeApp().request('/hm_001/jobs');
    expect(res.status).toBe(200);
    const body = await res.json() as { jobs: { id: string }[]; count: number };
    expect(body.jobs).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});
