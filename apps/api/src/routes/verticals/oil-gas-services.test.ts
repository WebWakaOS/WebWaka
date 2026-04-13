/**
 * Oil & Gas Services vertical route tests — P10 Set I (old-style named export)
 * FSM: seeded → claimed → ncdmb_certified → dpr_registered → active
 * Dual-gate: ncdmb_certified required before dpr_registered
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources (contracts, personnel).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { oilGasServicesRoutes } from './oil-gas-services.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    transitionStatus: vi.fn(), createContract: vi.fn(), listPersonnel: vi.fn(),
    addPersonnel: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-oil-gas-services', () => ({
  OilGasServicesRepository: vi.fn(() => mockRepo),
  isValidOilGasServicesTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', oilGasServicesRoutes);
  return w;
}

const MOCK = { id: 'og_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'PetroServices Ltd', status: 'seeded' };

describe('POST / — create oil & gas services profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with oil_gas_services key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'PetroServices Ltd' }) });
    expect(res.status).toBe(201);
    const json = await res.json() as { oil_gas_services: unknown };
    expect(json).toHaveProperty('oil_gas_services');
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'X Oil' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });

  it('returns 400 when workspace_id or company_name missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });
});

describe('GET /:id', () => {
  it('returns 200 with oil_gas_services key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/og_001');
    expect(res.status).toBe(200);
    const json = await res.json() as { oil_gas_services: unknown };
    expect(json).toHaveProperty('oil_gas_services');
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
    expect((await makeApp().request('/og_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition (dual-gate)', async () => {
    const { isValidOilGasServicesTransition } = await import('@webwaka/verticals-oil-gas-services');
    (isValidOilGasServicesTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/og_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'dpr_registered' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) })).status).toBe(404);
  });

  it('T3: transition scoped to tenantId', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    await makeApp('tnt_b').request('/og_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('og_001', 'tnt_b');
  });
});

describe('POST /:id/contracts', () => {
  it('returns 201 for valid contract', async () => {
    mockRepo.createContract.mockResolvedValueOnce({ id: 'ctr_001', contractTitle: 'Pipeline Maintenance', contractValueKobo: 50000000, performanceBondKobo: 0, mobilisationKobo: 0 });
    const res = await makeApp().request('/og_001/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_ref_id: 'cli_a', contract_title: 'Pipeline Maintenance', contract_value_kobo: 50000000, start_date: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('GET /:id/personnel', () => {
  it('returns 200 with personnel list', async () => {
    mockRepo.listPersonnel.mockResolvedValueOnce([]);
    const res = await makeApp().request('/og_001/personnel');
    expect(res.status).toBe(200);
    const json = await res.json() as { personnel: unknown[]; count: number };
    expect(json).toHaveProperty('personnel');
    expect(json).toHaveProperty('count');
  });
});
