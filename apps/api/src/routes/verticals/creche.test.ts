/**
 * Crèche vertical route tests — P11
 * FSM: seeded → claimed → subeb_verified → active
 * Guards: guardClaimedToSubebVerified, guardFractionalKobo (all sync)
 * NDPR: GET /:id/ai-advisory gated by aiConsentGate; only ageMonths + feeKobo in advisory (strictest data protection)
 * P13: child names/DOB/developmental notes NEVER in AI; child_ref_id is opaque
 * ≥10 cases: CRUD, FSM, children, attendance, billing, AI advisory.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './creche.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), transition: vi.fn(),
    createChild: vi.fn(), listChildren: vi.fn(),
    recordAttendance: vi.fn(), createBilling: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-creche', () => ({
  CrecheRepository: vi.fn(() => mockRepo),
  isValidCrecheTransition: vi.fn().mockReturnValue(true),
  guardClaimedToSubebVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
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

const MOCK = { id: 'cr_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', crecheName: 'Sunshine Crèche', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create crèche profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', crecheName: 'Sunshine Crèche' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.crecheName).toBe('Sunshine Crèche');
  });

  it('T3: creates profile scoped to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', crecheName: 'Star Crèche' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get crèche profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/cr_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('cr_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/cr_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with correct tenantId', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/profiles/cr_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('cr_001', 'tnt_b');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions profile and returns updated', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transition.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/cr_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid transition', async () => {
    const { isValidCrecheTransition } = await import('@webwaka/verticals-creche');
    vi.mocked(isValidCrecheTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/children — create child record', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with child record (opaque childRefId)', async () => {
    const child = { id: 'child_001', childRefId: 'ref_abc123', ageMonths: 18, profileId: 'cr_001' };
    mockRepo.createChild.mockResolvedValueOnce(child);
    const res = await makeApp().request('/profiles/cr_001/children', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ageMonths: 18, admissionDate: 1700000000, monthlyFeeKobo: 5000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('GET /profiles/:id/children — list children', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of children', async () => {
    mockRepo.listChildren.mockResolvedValueOnce([{ childRefId: 'ref_001' }, { childRefId: 'ref_002' }]);
    const res = await makeApp().request('/profiles/cr_001/children');
    expect(res.status).toBe(200);
    const body = await res.json() as { childRefId: string }[];
    expect(body).toHaveLength(2);
  });
});

describe('POST /profiles/:id/attendance — record attendance', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with attendance record', async () => {
    const record = { id: 'att_001', childRefId: 'ref_001', present: true };
    mockRepo.recordAttendance.mockResolvedValueOnce(record);
    const res = await makeApp().request('/profiles/cr_001/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ childRefId: 'ref_001', attendanceDate: 1700000000, present: true }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /profiles/:id/billing — create billing', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with billing record', async () => {
    const billing = { id: 'bil_001', childRefId: 'ref_001', feeKobo: 5000000 };
    mockRepo.createBilling.mockResolvedValueOnce(billing);
    const res = await makeApp().request('/profiles/cr_001/billing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ childRefId: 'ref_001', billingPeriod: '2024-01', feeKobo: 5000000, paidKobo: 5000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof billing;
    expect(body.feeKobo).toBe(5000000);
  });
});

describe('GET /profiles/:id/ai-advisory — NDPR consent gate (STRICTEST)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns only ageMonths and monthlyFeeKobo — no names, IDs, or developmental data', async () => {
    mockRepo.listChildren.mockResolvedValueOnce([
      { ageMonths: 18, monthlyFeeKobo: 5000000, childRefId: 'ref_secret_001', childName: 'should not appear' },
      { ageMonths: 24, monthlyFeeKobo: 6000000, childRefId: 'ref_secret_002', childName: 'also should not appear' },
    ]);
    const res = await makeApp().request('/profiles/cr_001/ai-advisory');
    expect(res.status).toBe(200);
    const body = await res.json() as { capability: string; advisory_data: Record<string, unknown>[]; count: number; hitl_required: boolean };
    expect(body.capability).toBe('ENROLLMENT_CAPACITY_ADVISORY');
    expect(body.count).toBe(2);
    expect(body.hitl_required).toBe(true);
    expect(body.advisory_data[0]).toHaveProperty('age_months', 18);
    expect(body.advisory_data[0]).toHaveProperty('monthly_fee_kobo', 5000000);
    expect(body.advisory_data[0]).not.toHaveProperty('childRefId');
    expect(body.advisory_data[0]).not.toHaveProperty('childName');
  });

  it('returns empty advisory when no children enrolled', async () => {
    mockRepo.listChildren.mockResolvedValueOnce([]);
    const res = await makeApp().request('/profiles/cr_001/ai-advisory');
    expect(res.status).toBe(200);
    const body = await res.json() as { count: number; hitl_required: boolean };
    expect(body.count).toBe(0);
    expect(body.hitl_required).toBe(true);
  });
});
