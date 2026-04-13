/**
 * IT Support vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, tickets, contracts, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { itSupportRoutes } from './it-support.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createTicket: vi.fn(), listTickets: vi.fn(), updateTicketStatus: vi.fn(),
    createServiceContract: vi.fn(), listContracts: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-it-support', () => ({
  ItSupportRepository: vi.fn(() => mockRepo),
  isValidITSupportTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', itSupportRoutes);
  return w;
}

const MOCK = { id: 'it_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'TechFix Solutions', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create IT support profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with it_support key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'TechFix Solutions' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { it_support: typeof MOCK };
    expect(body.it_support.businessName).toBe('TechFix Solutions');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'ByteWise Abuja' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /:id — get IT support profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/it_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { it_support: typeof MOCK };
    expect(body.it_support.id).toBe('it_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/it_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/it_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('it_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/it_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { it_support: typeof CLAIMED };
    expect(body.it_support.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidITSupportTransition } = await import('@webwaka/verticals-it-support');
    vi.mocked(isValidITSupportTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/it_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/it_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidITSupportTransition } = await import('@webwaka/verticals-it-support');
    vi.mocked(isValidITSupportTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/it_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/tickets — create support ticket', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with ticket', async () => {
    const ticket = { id: 'tkt_001', profileId: 'it_001', clientRefId: 'ref_c001', issueType: 'network', priority: 'high' };
    mockRepo.createTicket.mockResolvedValueOnce(ticket);
    const res = await makeApp().request('/it_001/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_ref_id: 'ref_c001', issue_type: 'network', description: 'Internet down at office', priority: 'high', sla_hours: 4 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { ticket: typeof ticket };
    expect(body.ticket.priority).toBe('high');
  });
});

describe('GET /:id/tickets — list tickets', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of tickets', async () => {
    mockRepo.listTickets.mockResolvedValueOnce([{ id: 'tkt_001' }, { id: 'tkt_002' }]);
    const res = await makeApp().request('/it_001/tickets');
    expect(res.status).toBe(200);
    const body = await res.json() as { tickets: { id: string }[]; count: number };
    expect(body.tickets).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/contracts — create maintenance contract', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with contract', async () => {
    const contract = { id: 'con_001', profileId: 'it_001', clientRefId: 'ref_c001', annualFeeKobo: 50000000 };
    mockRepo.createServiceContract.mockResolvedValueOnce(contract);
    const res = await makeApp().request('/it_001/contracts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_ref_id: 'ref_c001', annual_fee_kobo: 50000000, start_date: 1700000000, end_date: 1731536000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { contract: typeof contract };
    expect(body.contract.annualFeeKobo).toBe(50000000);
  });
});
