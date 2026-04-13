/**
 * Tyre Shop vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, catalogue, jobs, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { tyreShopRoutes } from './tyre-shop.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createCatalogueItem: vi.fn(), listCatalogueItems: vi.fn(),
    createJob: vi.fn(), listJobs: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-tyre-shop', () => ({
  TyreShopRepository: vi.fn(() => mockRepo),
  isValidTyreShopTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToActive: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', tyreShopRoutes);
  return w;
}

const MOCK = { id: 'ts_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', shopName: 'Safe Tyres Lagos', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create tyre shop profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with tyre_shop key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', shop_name: 'Safe Tyres Lagos' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { tyre_shop: typeof MOCK };
    expect(body.tyre_shop.shopName).toBe('Safe Tyres Lagos');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shop_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', shop_name: 'Ibadan Tyres' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns tyre_shop profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { tyre_shop: typeof MOCK };
    expect(body.tyre_shop.id).toBe('ts_001');
  });
});

describe('GET /:id — get tyre shop profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ts_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { tyre_shop: typeof MOCK };
    expect(body.tyre_shop.id).toBe('ts_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ts_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ts_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ts_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ts_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { tyre_shop: typeof CLAIMED };
    expect(body.tyre_shop.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/ts_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ts_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidTyreShopTransition } = await import('@webwaka/verticals-tyre-shop');
    vi.mocked(isValidTyreShopTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ts_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/catalogue — add tyre to catalogue', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with catalogue item', async () => {
    const item = { id: 'cat_001', brand: 'Bridgestone', size: '195/65R15', unitPriceKobo: 5500000 };
    mockRepo.createCatalogueItem.mockResolvedValueOnce(item);
    const res = await makeApp().request('/ts_001/catalogue', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand: 'Bridgestone', size: '195/65R15', unit_price_kobo: 5500000, quantity_in_stock: 20 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { catalogue_item: typeof item };
    expect(body.catalogue_item.brand).toBe('Bridgestone');
  });
});

describe('POST /:id/jobs — create tyre service job', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with job record', async () => {
    const job = { id: 'job_001', profileId: 'ts_001', vehiclePlate: 'LND123GH', jobType: 'replacement', priceKobo: 11000000 };
    mockRepo.createJob.mockResolvedValueOnce(job);
    const res = await makeApp().request('/ts_001/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicle_plate: 'LND123GH', job_type: 'replacement', price_kobo: 11000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { job: typeof job };
    expect(body.job.jobType).toBe('replacement');
  });
});

describe('GET /:id/jobs — list jobs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of jobs', async () => {
    mockRepo.listJobs.mockResolvedValueOnce([{ id: 'job_001' }, { id: 'job_002' }]);
    const res = await makeApp().request('/ts_001/jobs');
    expect(res.status).toBe(200);
    const body = await res.json() as { jobs: { id: string }[]; count: number };
    expect(body.jobs).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});
