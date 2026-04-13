/**
 * Generator Dealer vertical route tests — P10 Set I (old-style named export)
 * FSM: seeded → claimed → son_verified → active
 * Guards: guardSeedToClaimed, guardClaimedToSonVerified
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (units, service-jobs).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { generatorDealerRoutes } from './generator-dealer.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    transitionStatus: vi.fn(), createUnit: vi.fn(), listUnits: vi.fn(),
    createServiceJob: vi.fn(), listServiceJobs: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-generator-dealer', () => ({
  GeneratorDealerRepository: vi.fn(() => mockRepo),
  isValidGeneratorDealerTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToSonVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', generatorDealerRoutes);
  return w;
}

const MOCK = { id: 'gd_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'PowerGen Ltd', status: 'seeded' };

describe('POST / — create generator dealer profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with generator_dealer key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'PowerGen Ltd' }) });
    expect(res.status).toBe(201);
    const json = await res.json() as { generator_dealer: unknown };
    expect(json).toHaveProperty('generator_dealer');
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'X Power' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });

  it('returns 400 when workspace_id or company_name missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'PowerGen Ltd' }) });
    expect(res.status).toBe(400);
  });
});

describe('GET /:id', () => {
  it('returns 200 with generator_dealer key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gd_001');
    expect(res.status).toBe(200);
    const json = await res.json() as { generator_dealer: unknown };
    expect(json).toHaveProperty('generator_dealer');
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx')).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/gd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidGeneratorDealerTransition } = await import('@webwaka/verticals-generator-dealer');
    (isValidGeneratorDealerTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/gd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) })).status).toBe(404);
  });

  it('T3: transition scoped to tenantId', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    await makeApp('tnt_b').request('/gd_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('gd_001', 'tnt_b');
  });
});

describe('POST /:id/units', () => {
  it('returns 201 for valid unit addition', async () => {
    mockRepo.createUnit.mockResolvedValueOnce({ id: 'unit_001', brand: 'Lister' });
    const res = await makeApp().request('/gd_001/units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand: 'Lister', kva: 20, serial_number: 'SN001', sale_price_kobo: 3000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /:id/service-jobs', () => {
  it('returns 201 for valid service job', async () => {
    mockRepo.createServiceJob.mockResolvedValueOnce({ id: 'sj_001', unitSerial: 'SN001' });
    const res = await makeApp().request('/gd_001/service-jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unit_serial: 'SN001', client_phone: '08012345678', fault_description: 'Engine not starting', labour_kobo: 50000, total_kobo: 75000 }) });
    expect(res.status).toBe(201);
  });
});
