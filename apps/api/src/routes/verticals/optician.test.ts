/**
 * Optician vertical route tests — P11
 * FSM: seeded → claimed → codn_verified → active (old-style, b['status'] body key)
 * ≥10 cases: CRUD, FSM, vision-tests, eyewear-orders, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { opticianRoutes } from './optician.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    recordVisionTest: vi.fn(), listVisionTests: vi.fn(),
    createEyewearOrder: vi.fn(), listEyewearOrders: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-optician', () => ({
  OpticianRepository: vi.fn(() => mockRepo),
  isValidOpticianTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', opticianRoutes);
  return w;
}

const MOCK = { id: 'opt_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', businessName: 'ClearVision Opticals', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create optician profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with optician key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', business_name: 'ClearVision Opticals' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { optician: typeof MOCK };
    expect(body.optician.businessName).toBe('ClearVision Opticals');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ business_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', business_name: 'Eagle Eye Abuja' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns optician profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { optician: typeof MOCK };
    expect(body.optician.id).toBe('opt_001');
  });
});

describe('GET /:id — get optician profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/opt_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { optician: typeof MOCK };
    expect(body.optician.id).toBe('opt_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/opt_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/opt_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('opt_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/opt_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { optician: typeof CLAIMED };
    expect(body.optician.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidOpticianTransition } = await import('@webwaka/verticals-optician');
    vi.mocked(isValidOpticianTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/opt_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/opt_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidOpticianTransition } = await import('@webwaka/verticals-optician');
    vi.mocked(isValidOpticianTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/opt_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/vision-tests — create vision test', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with vision test', async () => {
    const test = { id: 'vt_001', profileId: 'opt_001', patientRefId: 'ref_p001', leftEyeSphX100: -175 };
    mockRepo.recordVisionTest.mockResolvedValueOnce(test);
    const res = await makeApp().request('/opt_001/vision-tests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patient_ref_id: 'ref_p001', test_date: 1700000000, right_eye_sph_x100: -200, left_eye_sph_x100: -175, consultation_fee_kobo: 500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { test: typeof test };
    expect(body.test.leftEyeSphX100).toBe(-175);
  });
});

describe('GET /:id/vision-tests — list vision tests', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of tests', async () => {
    mockRepo.listVisionTests.mockResolvedValueOnce([{ id: 'vt_001' }, { id: 'vt_002' }]);
    const res = await makeApp().request('/opt_001/vision-tests');
    expect(res.status).toBe(200);
    const body = await res.json() as { tests: { id: string }[]; count: number };
    expect(body.tests).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/eyewear-orders — create eyewear order', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with eyewear order', async () => {
    const order = { id: 'ewo_001', profileId: 'opt_001', patientRefId: 'ref_p001', eyewearType: 'glasses', totalKobo: 3500000 };
    mockRepo.createEyewearOrder.mockResolvedValueOnce(order);
    const res = await makeApp().request('/opt_001/eyewear-orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patient_ref_id: 'ref_p001', test_id: 'vt_001', eyewear_type: 'glasses', total_kobo: 3500000, order_date: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { order: typeof order };
    expect(body.order.eyewearType).toBe('glasses');
  });
});
