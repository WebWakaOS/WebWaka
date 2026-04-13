/**
 * Private School vertical route tests — P11
 * FSM: seeded → claimed → subeb_verified → active
 * Guards: guardClaimedToSubebVerified, guardFractionalKobo (all sync)
 * ≥10 cases: CRUD, FSM, students, fees, teachers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './private-school.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateProfile: vi.fn(), transition: vi.fn(),
    createStudent: vi.fn(), createFeesLog: vi.fn(), createTeacher: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-private-school', () => ({
  PrivateSchoolRepository: vi.fn(() => mockRepo),
  isValidPrivateSchoolTransition: vi.fn().mockReturnValue(true),
  guardClaimedToSubebVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'sch_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', schoolName: 'Beacon Academy', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create private school profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', schoolName: 'Beacon Academy' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.schoolName).toBe('Beacon Academy');
  });

  it('T3: creates profile scoped to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', schoolName: 'Sunrise School' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get private school profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/sch_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('sch_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/sch_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_c').request('/profiles/sch_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('sch_001', 'tnt_c');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions to claimed and returns updated profile', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transition.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/sch_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/sch_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPrivateSchoolTransition } = await import('@webwaka/verticals-private-school');
    vi.mocked(isValidPrivateSchoolTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/sch_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if SUBEB guard fails on subeb_verified', async () => {
    const { guardClaimedToSubebVerified } = await import('@webwaka/verticals-private-school');
    vi.mocked(guardClaimedToSubebVerified).mockReturnValueOnce({ allowed: false, reason: 'SUBEB approval missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/sch_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'subeb_verified' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /profiles/:id/students — create student record', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with student record', async () => {
    const student = { id: 'stu_001', profileId: 'sch_001', classLevel: 'JSS1', termFeeKobo: 15000000 };
    mockRepo.createStudent.mockResolvedValueOnce(student);
    const res = await makeApp().request('/profiles/sch_001/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classLevel: 'JSS1', admissionDate: 1700000000, termFeeKobo: 15000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof student;
    expect(body.classLevel).toBe('JSS1');
  });

  it('returns 422 if P9 guard fails on termFeeKobo', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-private-school');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9 fractional kobo' });
    const res = await makeApp().request('/profiles/sch_001/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classLevel: 'JSS1', termFeeKobo: 0.5 }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/fees — record fee payment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with fee log', async () => {
    const feeLog = { id: 'fee_001', studentRefId: 'ref_s001', term: '2024/25 1st', feeKobo: 15000000 };
    mockRepo.createFeesLog.mockResolvedValueOnce(feeLog);
    const res = await makeApp().request('/profiles/sch_001/fees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentRefId: 'ref_s001', term: '2024/25 1st', feeKobo: 15000000, paidKobo: 15000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof feeLog;
    expect(body.term).toBe('2024/25 1st');
  });
});

describe('POST /profiles/:id/teachers — create teacher record', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with teacher record', async () => {
    const teacher = { id: 'tch_001', profileId: 'sch_001', teacherName: 'Mr Adewale', monthlySalaryKobo: 8000000 };
    mockRepo.createTeacher.mockResolvedValueOnce(teacher);
    const res = await makeApp().request('/profiles/sch_001/teachers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teacherName: 'Mr Adewale', qualification: 'B.Ed', assignedClass: 'JSS1', monthlySalaryKobo: 8000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof teacher;
    expect(body.teacherName).toBe('Mr Adewale');
  });
});
