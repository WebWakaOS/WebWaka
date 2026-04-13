/**
 * Land Surveyor vertical route tests — P11
 * FSM: seeded → claimed → surcon_registered → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, survey jobs, plans, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { landSurveyorRoutes } from './land-surveyor.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createSurveyJob: vi.fn(), listSurveyJobs: vi.fn(),
    createSurveyPlan: vi.fn(), listPlans: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-land-surveyor', () => ({
  LandSurveyorRepository: vi.fn(() => mockRepo),
  isValidLandSurveyorTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', landSurveyorRoutes);
  return w;
}

const MOCK = { id: 'lsv_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'Precision Surveys Ltd', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create land surveyor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with land_surveyor key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'Precision Surveys Ltd' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { land_surveyor: typeof MOCK };
    expect(body.land_surveyor.businessName).toBe('Precision Surveys Ltd');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Abuja Land Surveys' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get land surveyor profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/lsv_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { land_surveyor: typeof MOCK };
    expect(body.land_surveyor.id).toBe('lsv_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/lsv_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/lsv_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('lsv_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/lsv_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { land_surveyor: typeof CLAIMED };
    expect(body.land_surveyor.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidLandSurveyorTransition } = await import('@webwaka/verticals-land-surveyor');
    vi.mocked(isValidLandSurveyorTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/lsv_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/lsv_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidLandSurveyorTransition } = await import('@webwaka/verticals-land-surveyor');
    vi.mocked(isValidLandSurveyorTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/lsv_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/jobs — create survey job', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with survey job', async () => {
    const job = { id: 'job_001', profileId: 'lsv_001', clientRefId: 'ref_c001', surveyType: 'topographic', plotSize: '500sqm', totalKobo: 2000000 };
    mockRepo.createSurveyJob.mockResolvedValueOnce(job);
    const res = await makeApp().request('/lsv_001/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_ref_id: 'ref_c001', survey_type: 'topographic', plot_address: 'Maitama District, Abuja', plot_size: '500sqm', total_kobo: 2000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { job: typeof job };
    expect(body.job.surveyType).toBe('topographic');
  });
});

describe('GET /:id/jobs — list survey jobs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of survey jobs', async () => {
    mockRepo.listSurveyJobs.mockResolvedValueOnce([{ id: 'job_001' }, { id: 'job_002' }]);
    const res = await makeApp().request('/lsv_001/jobs');
    expect(res.status).toBe(200);
    const body = await res.json() as { jobs: { id: string }[]; count: number };
    expect(body.jobs).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/plans — upload survey plan', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with plan record', async () => {
    const plan = { id: 'pln_001', jobId: 'job_001', planNumber: 'PLN/LG/001/2024', areaSqmX100: 50000 };
    mockRepo.createSurveyPlan.mockResolvedValueOnce(plan);
    const res = await makeApp().request('/lsv_001/plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: 'job_001', plan_number: 'PLN/LG/001/2024', area_sqm_x100: 50000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { plan: typeof plan };
    expect(body.plan.planNumber).toBe('PLN/LG/001/2024');
  });
});
