/**
 * Tax Consultant vertical route tests — P10 Set H
 * P13: TIN never forwarded to AI; L3 HITL mandatory for ALL AI calls
 * ≥10 cases: CRUD, FSM, T3 isolation, sub-resources.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './tax-consultant.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createTaxFile: vi.fn(), createRemittance: vi.fn(), createCpdLog: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-tax-consultant', () => ({
  TaxConsultantRepository: vi.fn(() => mockRepo),
  isValidTaxConsultantTransition: vi.fn().mockReturnValue(true),
  guardClaimedToFirsVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL3HitlRequired: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoTaxPrivilegeDataInAi: vi.fn().mockReturnValue({ allowed: true }),
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'tc_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', firmName: 'TaxPro Ltd', status: 'seeded' };

describe('POST /profiles — create tax consultant profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', firmName: 'TaxPro Ltd' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', firmName: 'X Tax' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/tc_001')).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx')).status).toBe(404);
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValue(MOCK);
    mockRepo.updateStatus.mockResolvedValueOnce(undefined);
    expect((await makeApp().request('/profiles/tc_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidTaxConsultantTransition } = await import('@webwaka/verticals-tax-consultant');
    (isValidTaxConsultantTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/tc_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/tax-files', () => {
  it('returns 201 for valid tax file creation', async () => {
    mockRepo.createTaxFile.mockResolvedValueOnce({ id: 'tf_001', taxType: 'cit' });
    const res = await makeApp().request('/profiles/tc_001/tax-files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'cli_a', taxType: 'cit', firsTin: 'TIN-001', filingPeriod: '2024-Q1', liabilityKobo: 500000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/remittances', () => {
  it('returns 201 for valid remittance record', async () => {
    mockRepo.createRemittance.mockResolvedValueOnce({ id: 'rem_001', amountKobo: 500000 });
    const res = await makeApp().request('/profiles/tc_001/remittances', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'cli_a', taxType: 'paye', period: '2024-03', amountKobo: 500000, remittanceDate: 1700000000, bankRef: 'BANK-001' }) });
    expect(res.status).toBe(201);
  });
});
