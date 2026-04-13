/**
 * Accounting Firm vertical route tests — P10 Set H
 * ≥10 cases: CRUD (health-style /profiles), FSM, T3 isolation, sub-resources, guards.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './accounting-firm.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createEngagement: vi.fn(), createInvoice: vi.fn(), createCpdLog: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-accounting-firm', () => ({
  AccountingFirmRepository: vi.fn(() => mockRepo),
  isValidAccountingFirmTransition: vi.fn().mockReturnValue(true),
  guardClaimedToIcanVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoClientDataInAi: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'af_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', firmName: 'Acme Accounting', status: 'seeded' };

describe('POST /profiles — create accounting firm profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', firmName: 'Acme Accounting' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId injected from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', firmName: 'X Firm' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when profile found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    expect((await makeApp().request('/profiles/af_001')).status).toBe(200);
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
    const res = await makeApp().request('/profiles/af_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidAccountingFirmTransition } = await import('@webwaka/verticals-accounting-firm');
    (isValidAccountingFirmTransition as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/af_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 404 when profile not found on transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/engagements', () => {
  it('returns 201 for valid engagement', async () => {
    mockRepo.createEngagement.mockResolvedValueOnce({ id: 'eng_001', engagementType: 'audit', engagementFeeKobo: 500000 });
    const res = await makeApp().request('/profiles/af_001/engagements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'cli_a', engagementType: 'audit', engagementFeeKobo: 500000, startDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/invoices', () => {
  it('returns 201 for valid invoice', async () => {
    mockRepo.createInvoice.mockResolvedValueOnce({ id: 'inv_001', amountKobo: 500000 });
    const res = await makeApp().request('/profiles/af_001/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'cli_a', invoiceNumber: 'INV-001', amountKobo: 500000, issuedDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/cpd', () => {
  it('returns 201 for valid CPD log', async () => {
    mockRepo.createCpdLog.mockResolvedValueOnce({ id: 'cpd_001', cpdHours: 8 });
    const res = await makeApp().request('/profiles/af_001/cpd', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberRefId: 'mem_a', cpdProvider: 'ICAN', cpdHours: 8, completionDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});
