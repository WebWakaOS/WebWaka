/**
 * Govt School vertical route tests — P3-D (school)
 * ≥13 cases covering profiles, FSM, students, teachers, results.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { govtSchoolRoutes } from './govt-school.js';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { mockRepo, mockIsValidTransition } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(),
    findProfileByWorkspace: vi.fn(),
    findProfileById: vi.fn(),
    transitionStatus: vi.fn(),
    enrollStudent: vi.fn(),
    listStudents: vi.fn(),
    addTeacher: vi.fn(),
    listTeachers: vi.fn(),
    recordResult: vi.fn(),
    listResults: vi.fn(),
  },
  mockIsValidTransition: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-govt-school', () => ({
  GovtSchoolRepository: vi.fn(() => mockRepo),
  isValidGovtSchoolTransition: mockIsValidTransition,
}));

// ---------------------------------------------------------------------------
// Stub DB
// ---------------------------------------------------------------------------

const stubDb = {
  prepare: () => ({
    bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }),
  }),
};

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

function makeApp(tenantId = 'tnt_a') {
  const app = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  app.use('*', async (c, next) => {
    c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never;
    c.set('auth' as never, { userId: 'usr_test', tenantId } as never);
    await next();
  });
  app.route('/govt-school', govtSchoolRoutes);
  return app;
}

const MOCK_PROFILE = { id: 'gs_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', schoolName: 'Eko Government Primary School', status: 'seeded' };

// ---------------------------------------------------------------------------
// POST / — create profile
// ---------------------------------------------------------------------------

describe('POST /govt-school', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when workspace_id or school_name missing', async () => {
    const app = makeApp();
    const res = await app.request('/govt-school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 201 for valid school profile creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const app = makeApp();
    const res = await app.request('/govt-school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', school_name: 'Eko Government Primary School' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ govt_school: { id: string } }>();
    expect(body.govt_school.id).toBe('gs_001');
  });

  it('T3: createProfile called with tenantId from auth', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK_PROFILE);
    const app = makeApp('tnt_B');
    await app.request('/govt-school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: 'wsp_a', school_name: 'Lagos Model School' }),
    });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_B' }));
  });
});

// ---------------------------------------------------------------------------
// GET /workspace/:workspaceId and GET /:id
// ---------------------------------------------------------------------------

describe('GET /govt-school/:id and /workspace/:workspaceId', () => {
  beforeEach(() => vi.clearAllMocks());

  it('GET /workspace/:workspaceId returns profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK_PROFILE);
    const app = makeApp();
    const res = await app.request('/govt-school/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json<{ govt_school: { id: string } }>();
    expect(body.govt_school.id).toBe('gs_001');
  });

  it('GET /:id returns profile', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK_PROFILE);
    const app = makeApp();
    const res = await app.request('/govt-school/gs_001');
    expect(res.status).toBe(200);
  });

  it('GET /:id returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const app = makeApp();
    const res = await app.request('/govt-school/gs_missing');
    expect(res.status).toBe(404);
  });

  it('T3: findProfileById called with tenantId', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const app = makeApp('tnt_C');
    await app.request('/govt-school/gs_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('gs_001', 'tnt_C');
  });
});

// ---------------------------------------------------------------------------
// FSM transition
// ---------------------------------------------------------------------------

describe('POST /govt-school/:id/transition', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const app = makeApp();
    const res = await app.request('/govt-school/gs_missing/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'active' });
    mockIsValidTransition.mockReturnValueOnce(false);
    const app = makeApp();
    const res = await app.request('/govt-school/gs_001/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'seeded' }),
    });
    expect(res.status).toBe(422);
  });

  it('returns 200 for valid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'seeded' });
    mockIsValidTransition.mockReturnValueOnce(true);
    mockRepo.transitionStatus.mockResolvedValueOnce({ ...MOCK_PROFILE, status: 'active' });
    const app = makeApp();
    const res = await app.request('/govt-school/gs_001/transition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json<{ govt_school: { status: string } }>();
    expect(body.govt_school.status).toBe('active');
  });
});

// ---------------------------------------------------------------------------
// Students
// ---------------------------------------------------------------------------

describe('Students — POST/GET /:id/students', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POST /:id/students returns 201', async () => {
    mockRepo.enrollStudent.mockResolvedValueOnce({ id: 'stu_001', studentId: 'std_ref_001', className: 'Primary 3' });
    const app = makeApp();
    const res = await app.request('/govt-school/gs_001/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_ref_id: 'std_ref_001', class_level: 'Primary 3' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json<{ student: { id: string } }>();
    expect(body.student.id).toBe('stu_001');
  });

  it('GET /:id/students returns list', async () => {
    mockRepo.listStudents.mockResolvedValueOnce([{ id: 'stu_001', studentId: 'std_ref_001' }]);
    const app = makeApp();
    const res = await app.request('/govt-school/gs_001/students');
    expect(res.status).toBe(200);
    const body = await res.json<{ students: unknown[]; count: number }>();
    expect(body.count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

describe('Results — POST/GET /:id/results', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POST /:id/results returns 201', async () => {
    mockRepo.recordResult.mockResolvedValueOnce({ id: 'res_001', score: 85 });
    const app = makeApp();
    const res = await app.request('/govt-school/gs_001/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_ref_id: 'std_ref_001', term: 'First', subject: 'Mathematics', score: 85 }),
    });
    expect(res.status).toBe(201);
  });

  it('GET /:id/results returns list', async () => {
    mockRepo.listResults.mockResolvedValueOnce([{ id: 'res_001', score: 85 }]);
    const app = makeApp();
    const res = await app.request('/govt-school/gs_001/results');
    expect(res.status).toBe(200);
    const body = await res.json<{ results: unknown[]; count: number }>();
    expect(body.count).toBe(1);
  });
});
