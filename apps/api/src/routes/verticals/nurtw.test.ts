/**
 * NURTW (National Union of Road Transport Workers) vertical route tests — P11
 * FSM: seeded → claimed → active (old-style named export, to_status body key)
 * ≥10 cases: CRUD, FSM, members, dues, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { nurtwRoutes } from './nurtw.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createMember: vi.fn(), listMembers: vi.fn(), createDuesLog: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-nurtw', () => ({
  NurtwRepository: vi.fn(() => mockRepo),
  isValidNurtwTransition: vi.fn().mockReturnValue(true),
  guardSeedToClaimed: vi.fn().mockReturnValue({ allowed: true }),
  guardClaimedToNurtwVerified: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', nurtwRoutes);
  return w;
}

const MOCK = { id: 'nt_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', unionName: 'Lagos NURTW Branch', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create NURTW profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with nurtw key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', union_name: 'Lagos NURTW Branch', chapter_level: 'state', nurtw_registration: 'NTW001', state: 'Lagos' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { nurtw: typeof MOCK };
    expect(body.nurtw.unionName).toBe('Lagos NURTW Branch');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ union_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', union_name: 'Abuja NURTW', chapter_level: 'local', nurtw_registration: 'NTW002', state: 'FCT' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns nurtw profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { nurtw: typeof MOCK };
    expect(body.nurtw.id).toBe('nt_001');
  });
});

describe('GET /:id — get NURTW profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/nt_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { nurtw: typeof MOCK };
    expect(body.nurtw.id).toBe('nt_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/nt_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/nt_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('nt_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (to_status)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using to_status key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/nt_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { nurtw: typeof CLAIMED };
    expect(body.nurtw.status).toBe('claimed');
  });

  it('returns 400 if to_status missing', async () => {
    const res = await makeApp().request('/nt_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(400);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/nt_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidNurtwTransition } = await import('@webwaka/verticals-nurtw');
    vi.mocked(isValidNurtwTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/nt_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to_status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/members — create member', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with member record', async () => {
    const member = { id: 'mem_001', profileId: 'nt_001', memberName: 'Adekunle Bakare', vehiclePlate: 'LND001AC' };
    mockRepo.createMember.mockResolvedValueOnce(member);
    const res = await makeApp().request('/nt_001/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_name: 'Adekunle Bakare', vehicle_plate: 'LND001AC', vehicle_type: 'bus', member_since: 1700000000, monthly_dues_kobo: 500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { member: typeof member };
    expect(body.member.memberName).toBe('Adekunle Bakare');
  });
});

describe('GET /:id/members — list members', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of members with count', async () => {
    mockRepo.listMembers.mockResolvedValueOnce([{ id: 'mem_001' }, { id: 'mem_002' }]);
    const res = await makeApp().request('/nt_001/members');
    expect(res.status).toBe(200);
    const body = await res.json() as { members: { id: string }[]; count: number };
    expect(body.members).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/members/:mid/dues — record dues payment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with dues record', async () => {
    const dues = { id: 'dues_001', memberId: 'mem_001', amountKobo: 500000 };
    mockRepo.createDuesLog.mockResolvedValueOnce(dues);
    const res = await makeApp().request('/nt_001/members/mem_001/dues', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount_kobo: 500000, collection_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { dues: typeof dues };
    expect(body.dues.amountKobo).toBe(500000);
  });
});
