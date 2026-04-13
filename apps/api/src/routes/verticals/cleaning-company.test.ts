/**
 * Cleaning Company vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, to_status body key)
 * ≥10 cases: CRUD, FSM, contracts, staff deployment, supplies, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { cleaningCompanyRoutes } from './cleaning-company.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createContract: vi.fn(), listContracts: vi.fn(),
    createStaffDeployment: vi.fn(), listStaffDeployments: vi.fn(),
    createSupply: vi.fn(), listSupplies: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-cleaning-company', () => ({
  CleaningCompanyRepository: vi.fn(() => mockRepo),
  isValidCleaningCompanyTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToCacVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', cleaningCompanyRoutes);
  return w;
}

const MOCK = { id: 'cc_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', companyName: 'SpotlessNG Cleaning', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create cleaning company profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with cleaning_company key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', company_name: 'SpotlessNG Cleaning' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { cleaning_company: typeof MOCK };
    expect(body.cleaning_company.companyName).toBe('SpotlessNG Cleaning');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', company_name: 'Abuja Cleaners' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns cleaning_company profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { cleaning_company: typeof MOCK };
    expect(body.cleaning_company.id).toBe('cc_001');
  });
});

describe('GET /:id — get cleaning company', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/cc_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { cleaning_company: typeof MOCK };
    expect(body.cleaning_company.id).toBe('cc_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/cc_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/cc_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('cc_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/cc_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { cleaning_company: typeof CLAIMED };
    expect(body.cleaning_company.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/cc_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/cc_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidCleaningCompanyTransition } = await import('@webwaka/verticals-cleaning-company');
    vi.mocked(isValidCleaningCompanyTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/cc_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/contracts — create cleaning contract', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with contract', async () => {
    const contract = { id: 'con_001', profileId: 'cc_001', clientName: 'Sterling Bank HQ', monthlyValueKobo: 500000000 };
    mockRepo.createContract.mockResolvedValueOnce(contract);
    const res = await makeApp().request('/cc_001/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_name: 'Sterling Bank HQ', client_phone: '08012345678', sites_count: 3, monthly_fee_kobo: 500000000, contract_start: 1700000000, contract_end: 1731600000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { contract: typeof contract };
    expect(body.contract.clientName).toBe('Sterling Bank HQ');
  });
});

describe('GET /:id/contracts — list contracts', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of contracts', async () => {
    mockRepo.listContracts.mockResolvedValueOnce([{ id: 'con_001' }, { id: 'con_002' }]);
    const res = await makeApp().request('/cc_001/contracts');
    expect(res.status).toBe(200);
    const body = await res.json() as { contracts: { id: string }[]; count: number };
    expect(body.contracts).toHaveLength(2);
  });
});

describe('POST /:id/staff — create staff deployment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with staff deployment', async () => {
    const deployment = { id: 'dep_001', profileId: 'cc_001', staffName: 'Amara Obi', siteName: 'Sterling HQ', contractId: 'con_001' };
    mockRepo.createStaffDeployment.mockResolvedValueOnce(deployment);
    const res = await makeApp().request('/cc_001/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contract_id: 'con_001', staff_name: 'Amara Obi', site_name: 'Sterling HQ', shift_type: 'day', monthly_salary_kobo: 50000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { staff_deployment: typeof deployment };
    expect(body.staff_deployment.staffName).toBe('Amara Obi');
  });
});
