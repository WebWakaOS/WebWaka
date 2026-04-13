/**
 * Gym / Fitness Centre vertical route tests — P11
 * FSM: seeded → claimed → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, memberships, sessions, equipment-log, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { gymFitnessRoutes } from './gym-fitness.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createMembership: vi.fn(), listMemberships: vi.fn(),
    logSession: vi.fn(), listSessions: vi.fn(),
    logEquipmentMaintenance: vi.fn(), listEquipmentMaintenance: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-gym-fitness', () => ({
  GymFitnessRepository: vi.fn(() => mockRepo),
  isValidGymFitnessTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', gymFitnessRoutes);
  return w;
}

const MOCK = { id: 'gf_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'IronBody Gym Lagos', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create gym/fitness profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with gym_fitness key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'IronBody Gym Lagos' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { gym_fitness: typeof MOCK };
    expect(body.gym_fitness.businessName).toBe('IronBody Gym Lagos');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'FitLife Abuja' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns gym_fitness profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { gym_fitness: typeof MOCK };
    expect(body.gym_fitness.id).toBe('gf_001');
  });
});

describe('GET /:id — get gym/fitness profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gf_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { gym_fitness: typeof MOCK };
    expect(body.gym_fitness.id).toBe('gf_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/gf_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/gf_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('gf_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/gf_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { gym_fitness: typeof CLAIMED };
    expect(body.gym_fitness.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidGymFitnessTransition } = await import('@webwaka/verticals-gym-fitness');
    vi.mocked(isValidGymFitnessTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gf_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/gf_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidGymFitnessTransition } = await import('@webwaka/verticals-gym-fitness');
    vi.mocked(isValidGymFitnessTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/gf_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/memberships — create membership', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with membership', async () => {
    const membership = { id: 'mem_001', profileId: 'gf_001', memberRefId: 'usr_m001', plan: 'monthly', monthlyFeeKobo: 1500000 };
    mockRepo.createMembership.mockResolvedValueOnce(membership);
    const res = await makeApp().request('/gf_001/memberships', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_ref_id: 'usr_m001', plan: 'monthly', monthly_fee_kobo: 1500000, start_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { membership: typeof membership };
    expect(body.membership.plan).toBe('monthly');
  });
});

describe('GET /:id/memberships — list memberships', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of memberships', async () => {
    mockRepo.listMemberships.mockResolvedValueOnce([{ id: 'mem_001' }, { id: 'mem_002' }]);
    const res = await makeApp().request('/gf_001/memberships');
    expect(res.status).toBe(200);
    const body = await res.json() as { memberships: { id: string }[]; count: number };
    expect(body.memberships).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/sessions — create PT session', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with session', async () => {
    const session = { id: 'ses_001', profileId: 'gf_001', memberRefId: 'usr_m001', sessionType: 'personal_training', durationMinutes: 60 };
    mockRepo.logSession.mockResolvedValueOnce(session);
    const res = await makeApp().request('/gf_001/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_ref_id: 'usr_m001', session_date: 1700000000, duration_minutes: 60, session_type: 'personal_training' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { session: typeof session };
    expect(body.session.sessionType).toBe('personal_training');
  });
});

describe('POST /:id/equipment-log — log equipment maintenance', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with equipment log', async () => {
    const log = { id: 'eql_001', profileId: 'gf_001', equipmentName: 'Treadmill #3', maintenanceDate: 1700000000, costKobo: 250000 };
    mockRepo.logEquipmentMaintenance.mockResolvedValueOnce(log);
    const res = await makeApp().request('/gf_001/equipment-log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipment_name: 'Treadmill #3', maintenance_date: 1700000000, cost_kobo: 250000, notes: 'Belt replaced' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { log: typeof log };
    expect(body.log.equipmentName).toBe('Treadmill #3');
  });
});
