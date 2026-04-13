/**
 * Phone Repair Shop vertical route tests — P11
 * FSM: seeded → claimed → active (to_status key; sync guards)
 * P9: IMEI stripped in AI advisory; P13: device PII isolated
 * ≥12 cases: CRUD, FSM (valid/invalid/404), guards, jobs, parts, T3, AI advisory.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { phoneRepairShopRoutes } from './phone-repair-shop.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createJob: vi.fn(), listJobs: vi.fn(), updateJobStatus: vi.fn(),
    createPart: vi.fn(), listParts: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-phone-repair-shop', () => ({
  PhoneRepairShopRepository: vi.fn(() => mockRepo),
  isValidPhoneRepairTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToActive: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a', kycTier = 1) {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier } as never); await next(); });
  w.route('/', phoneRepairShopRoutes);
  return w;
}

const MOCK = { id: 'prs_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', shopName: 'FixIt Fast', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create phone repair shop profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with phone_repair_shop key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', shop_name: 'FixIt Fast' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { phone_repair_shop: typeof MOCK };
    expect(body.phone_repair_shop.shopName).toBe('FixIt Fast');
  });

  it('returns 400 when workspace_id or shop_name missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shop_name: 'FixIt Fast' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', shop_name: 'Kano Repairs' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get phone repair shop profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 with profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/prs_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { phone_repair_shop: typeof MOCK };
    expect(body.phone_repair_shop.id).toBe('prs_001');
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/prs_999');
    expect(res.status).toBe(404);
  });
});

describe('POST /:id/transition — FSM (to_status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions seeded→claimed and returns updated profile', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/prs_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { phone_repair_shop: typeof CLAIMED };
    expect(body.phone_repair_shop.status).toBe('claimed');
  });

  it('returns 400 when to_status is missing', async () => {
    const res = await makeApp().request('/prs_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/prs_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPhoneRepairTransition } = await import('@webwaka/verticals-phone-repair-shop');
    vi.mocked(isValidPhoneRepairTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/prs_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/jobs — create repair job', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with job record', async () => {
    const job = { id: 'job_001', deviceBrand: 'Samsung', deviceModel: 'Galaxy S23', labourKobo: 15000, totalKobo: 25000 };
    mockRepo.createJob.mockResolvedValueOnce(job);
    const res = await makeApp().request('/prs_001/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customer_phone: '+2348012345678', device_brand: 'Samsung', device_model: 'Galaxy S23', fault_description: 'Cracked screen', labour_kobo: 15000, total_kobo: 25000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { job: typeof job };
    expect(body.job.deviceBrand).toBe('Samsung');
  });

  it('returns 400 when required job fields missing', async () => {
    const res = await makeApp().request('/prs_001/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ device_brand: 'Samsung' }) });
    expect(res.status).toBe(400);
  });
});

describe('GET /:id/jobs — list repair jobs', () => {
  it('returns jobs list with count', async () => {
    mockRepo.listJobs.mockResolvedValueOnce([{ id: 'job_001' }, { id: 'job_002' }]);
    const res = await makeApp().request('/prs_001/jobs');
    expect(res.status).toBe(200);
    const body = await res.json() as { jobs: { id: string }[]; count: number };
    expect(body.jobs).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/parts — create part', () => {
  it('returns 201 with part record', async () => {
    const part = { id: 'part_001', partName: 'Screen Assembly', unitCostKobo: 10000 };
    mockRepo.createPart.mockResolvedValueOnce(part);
    const res = await makeApp().request('/prs_001/parts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ part_name: 'Screen Assembly', compatible_models: 'Galaxy S23', quantity: 5, unit_cost_kobo: 10000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { part: typeof part };
    expect(body.part.partName).toBe('Screen Assembly');
  });
});

describe('GET /:id/ai-advisory — P13: IMEI stripped', () => {
  it('returns advisory data without IMEI or customer_phone', async () => {
    mockRepo.listJobs.mockResolvedValueOnce([{ deviceBrand: 'Samsung', status: 'completed', labourKobo: 15000, totalKobo: 25000, imei: '123456789012345', customerPhone: '+2348012345678' }]);
    const res = await makeApp().request('/prs_001/ai-advisory');
    expect(res.status).toBe(200);
    const body = await res.json() as { capability: string; advisory_data: { device_brand: string }[] };
    expect(body.capability).toBe('PARTS_DEMAND_FORECAST');
    expect(body.advisory_data).toHaveLength(1);
    const first = body.advisory_data[0]!;
    expect(first).not.toHaveProperty('imei');
    expect(first).not.toHaveProperty('customerPhone');
    expect(first.device_brand).toBe('Samsung');
  });
});
