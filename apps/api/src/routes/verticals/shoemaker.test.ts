/**
 * Shoemaker vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, jobs, catalogue, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { shoemakerRoutes } from './shoemaker.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createJob: vi.fn(), listJobs: vi.fn(), updateJobStatus: vi.fn(),
    createCatalogueItem: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-shoemaker', () => ({
  ShoemakerRepository: vi.fn(() => mockRepo),
  isValidShoemakerTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToActive: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', shoemakerRoutes);
  return w;
}

const MOCK = { id: 'sm_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', shopName: 'Cobbler King', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create shoemaker profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with shoemaker key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', shop_name: 'Cobbler King' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { shoemaker: typeof MOCK };
    expect(body.shoemaker.shopName).toBe('Cobbler King');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shop_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', shop_name: 'Ibadan Cobblers' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns shoemaker profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { shoemaker: typeof MOCK };
    expect(body.shoemaker.id).toBe('sm_001');
  });
});

describe('GET /:id — get shoemaker profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/sm_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { shoemaker: typeof MOCK };
    expect(body.shoemaker.id).toBe('sm_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/sm_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/sm_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('sm_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/sm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { shoemaker: typeof CLAIMED };
    expect(body.shoemaker.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/sm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/sm_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidShoemakerTransition } = await import('@webwaka/verticals-shoemaker');
    vi.mocked(isValidShoemakerTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/sm_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/jobs — create repair job', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with job record', async () => {
    const job = { id: 'job_001', profileId: 'sm_001', serviceType: 'sole_replacement', priceKobo: 150000 };
    mockRepo.createJob.mockResolvedValueOnce(job);
    const res = await makeApp().request('/sm_001/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_phone: '08012345678', job_type: 'sole_replacement', shoe_size: 42, price_kobo: 150000, due_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { job: typeof job };
    expect(body.job.serviceType).toBe('sole_replacement');
  });
});

describe('GET /:id/jobs — list repair jobs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of jobs', async () => {
    mockRepo.listJobs.mockResolvedValueOnce([{ id: 'job_001' }, { id: 'job_002' }]);
    const res = await makeApp().request('/sm_001/jobs');
    expect(res.status).toBe(200);
    const body = await res.json() as { jobs: { id: string }[]; count: number };
    expect(body.jobs).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/catalogue — add service to catalogue', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with catalogue item', async () => {
    const item = { id: 'cat_001', serviceName: 'Heel Replacement', priceKobo: 100000 };
    mockRepo.createCatalogueItem.mockResolvedValueOnce(item);
    const res = await makeApp().request('/sm_001/catalogue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_name: 'Heel Replacement', price_kobo: 100000, shoe_size: 42 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { catalogue_item: typeof item };
    expect(body.catalogue_item.serviceName).toBe('Heel Replacement');
  });
});
