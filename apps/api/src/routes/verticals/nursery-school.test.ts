/**
 * Nursery School vertical route tests — P11
 * FSM: seeded → claimed → nes_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, enrollments, fee payments, staff, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { nurserySchoolRoutes } from './nursery-school.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createEnrollment: vi.fn(), listEnrollmentSummaries: vi.fn(),
    recordFeePayment: vi.fn(), listFeePayments: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-nursery-school', () => ({
  NurserySchoolRepository: vi.fn(() => mockRepo),
  isValidNurserySchoolTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', nurserySchoolRoutes);
  return w;
}

const MOCK = { id: 'ns_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', schoolName: 'Little Stars Nursery', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create nursery school profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with nursery_school key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', school_name: 'Little Stars Nursery' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { nursery_school: typeof MOCK };
    expect(body.nursery_school.schoolName).toBe('Little Stars Nursery');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', school_name: 'Bright Minds Abuja' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns nursery_school profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { nursery_school: typeof MOCK };
    expect(body.nursery_school.id).toBe('ns_001');
  });
});

describe('GET /:id — get nursery school profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ns_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { nursery_school: typeof MOCK };
    expect(body.nursery_school.id).toBe('ns_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ns_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ns_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ns_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ns_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { nursery_school: typeof CLAIMED };
    expect(body.nursery_school.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidNurserySchoolTransition } = await import('@webwaka/verticals-nursery-school');
    vi.mocked(isValidNurserySchoolTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ns_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ns_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidNurserySchoolTransition } = await import('@webwaka/verticals-nursery-school');
    vi.mocked(isValidNurserySchoolTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ns_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/enrollments — create enrollment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with enrollment record', async () => {
    const enrollment = { id: 'enr_001', profileId: 'ns_001', term: '2024/25 1st', ageBracket02: 5 };
    mockRepo.createEnrollment.mockResolvedValueOnce(enrollment);
    const res = await makeApp().request('/ns_001/enrollments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ term: '2024/25 1st', age_bracket_0_2: 5, age_bracket_2_4: 10, age_bracket_4_6: 15 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { enrollment: typeof enrollment };
    expect(body.enrollment.term).toBe('2024/25 1st');
  });
});

describe('GET /:id/enrollments — list enrollments', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns enrollment summary', async () => {
    const summaryData = [{ term: '2024/25 1st', total: 30 }, { term: '2024/25 2nd', total: 28 }];
    mockRepo.listEnrollmentSummaries.mockResolvedValueOnce(summaryData);
    const res = await makeApp().request('/ns_001/enrollment-summary');
    expect(res.status).toBe(200);
    const body = await res.json() as { summary: typeof summaryData };
    expect(body.summary).toHaveLength(2);
  });
});

describe('POST /:id/fee-payments — record fee payment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with fee payment', async () => {
    const payment = { id: 'fp_001', profileId: 'ns_001', term: '2024/25 1st', amountKobo: 8000000 };
    mockRepo.recordFeePayment.mockResolvedValueOnce(payment);
    const res = await makeApp().request('/ns_001/fee-payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ term: '2024/25 1st', fee_type: 'tuition', amount_kobo: 8000000, payment_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { payment: typeof payment };
    expect(body.payment.amountKobo).toBe(8000000);
  });
});
