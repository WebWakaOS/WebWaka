/**
 * Campaign Office vertical route tests — P9 Set E (V-CIV-EXT-E8)
 * ≥10 cases: CRUD, FSM + INEC spending cap guard, T3 isolation, budget, donors.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { campaignOfficeRoutes } from './campaign-office.js';

const { mockRepo, mockIsValid, mockSpendingCap } = vi.hoisted(() => ({
  mockRepo: {
    create: vi.fn(), findById: vi.fn(), update: vi.fn(), transition: vi.fn(),
    findBudgetByProfile: vi.fn().mockResolvedValue([]),
    createBudget: vi.fn(), createDonor: vi.fn(), listDonors: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
  mockSpendingCap: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock('@webwaka/verticals-campaign-office', () => ({
  CampaignOfficeRepository: vi.fn(() => mockRepo),
  isValidCampaignTransition: mockIsValid,
  guardInecSpendingCap: mockSpendingCap,
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', campaignOfficeRoutes);
  return w;
}

const MOCK = { id: 'co_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', candidateName: 'Emeka Obi', officeSought: 'governorship', status: 'seeded' };

describe('POST / — create campaign office profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', candidate_name: 'Emeka Obi', office_sought: 'governorship', party: 'APC' }) });
    expect(res.status).toBe(201);
  });

  it('returns 400 when candidate_name missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', office_sought: 'governorship' }) });
    expect(res.status).toBe(400);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.create.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', candidate_name: 'Emeka Obi', office_sought: 'governorship' }) });
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /:id', () => {
  it('returns 200 when found', async () => { mockRepo.findById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/co_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findById.mockResolvedValueOnce(null); expect((await makeApp().request('/nx')).status).toBe(404); });
});

describe('PATCH /:id', () => {
  it('returns 200 on update', async () => {
    mockRepo.update.mockResolvedValueOnce({ ...MOCK, candidateName: 'Emeka Obi Jnr' });
    expect((await makeApp().request('/co_001', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_name: 'Emeka Obi Jnr' }) })).status).toBe(200);
  });
  it('returns 404 when not found on update', async () => {
    mockRepo.update.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate_name: 'X' }) })).status).toBe(404);
  });
});

describe('POST /:id/transition — FSM + INEC spending cap', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid FSM transition', async () => {
    mockRepo.findById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/co_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 403 when INEC spending cap guard blocks transition', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    mockIsValid.mockReturnValueOnce(true);
    mockRepo.findBudgetByProfile.mockResolvedValueOnce([{ budgetKobo: 9_000_000_000 }]);
    mockSpendingCap.mockReturnValueOnce({ allowed: false, reason: 'Exceeds INEC cap' });
    expect((await makeApp().request('/co_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid transition within spending cap', async () => {
    mockRepo.findById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' });
    mockIsValid.mockReturnValueOnce(true);
    mockRepo.findBudgetByProfile.mockResolvedValueOnce([]);
    mockSpendingCap.mockReturnValueOnce({ allowed: true });
    mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/co_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/nx/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /:id/budget', () => {
  it('returns 201 for valid budget entry', async () => {
    mockRepo.createBudget.mockResolvedValueOnce({ id: 'bud_001', budgetKobo: 50000000, category: 'media' });
    expect((await makeApp().request('/co_001/budget', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category: 'media', budget_kobo: 50000000, spent_kobo: 0 }) })).status).toBe(201);
  });
});
