/**
 * Palm Oil vertical route tests — P11
 * FSM: seeded → claimed → nafdac_verified → active
 * Guards: guardClaimedToNafdacVerified, guardIntegerMl, guardL2AiCap, guardFractionalKobo (all sync)
 * ≥10 cases: CRUD, FSM, FFB intake, batches, sales, AI.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './palm-oil.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), transition: vi.fn(),
    updateNafdacNumber: vi.fn(), createFfbIntake: vi.fn(),
    createBatch: vi.fn(), createSale: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-palm-oil', () => ({
  PalmOilRepository: vi.fn(() => mockRepo),
  isValidPalmOilTransition: vi.fn().mockReturnValue(true),
  guardClaimedToNafdacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerMl: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'po_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', millName: 'Cross River Palm Mill', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create palm oil profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', millName: 'Cross River Palm Mill' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.millName).toBe('Cross River Palm Mill');
  });

  it('T3: creates profile scoped to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', millName: 'Benue Palm Mill' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get palm oil profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/po_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('po_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/po_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/profiles/po_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('po_001', 'tnt_b');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions to claimed and returns updated profile', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transition.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/po_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/po_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPalmOilTransition } = await import('@webwaka/verticals-palm-oil');
    vi.mocked(isValidPalmOilTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/po_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if nafdac guard fails on nafdac_verified', async () => {
    const { guardClaimedToNafdacVerified } = await import('@webwaka/verticals-palm-oil');
    vi.mocked(guardClaimedToNafdacVerified).mockReturnValueOnce({ allowed: false, reason: 'nafdac number missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/po_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'nafdac_verified' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /profiles/:id/ffb-intake — record FFB intake', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with FFB intake record', async () => {
    const intake = { id: 'ffb_001', profileId: 'po_001', quantityKg: 5000, costPerKgKobo: 15000 };
    mockRepo.createFfbIntake.mockResolvedValueOnce(intake);
    const res = await makeApp().request('/profiles/po_001/ffb-intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantityKg: 5000, costPerKgKobo: 15000, intakeDate: 1700000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof intake;
    expect(body.quantityKg).toBe(5000);
  });

  it('returns 422 if P9 fractional kobo guard fails', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-palm-oil');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9: fractional kobo' });
    const res = await makeApp().request('/profiles/po_001/ffb-intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantityKg: 100, costPerKgKobo: 0.5, intakeDate: 1700000000 }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/batches — create processing batch', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with batch record', async () => {
    const batch = { id: 'bat_001', profileId: 'po_001', oilOutputMl: 2000000 };
    mockRepo.createBatch.mockResolvedValueOnce(batch);
    const res = await makeApp().request('/profiles/po_001/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ processingDate: 1700000000, ffbInputKg: 5000, oilOutputMl: 2000000, productionCostKobo: 500000000 }) });
    expect(res.status).toBe(201);
  });

  it('returns 422 if integer ml guard fails', async () => {
    const { guardIntegerMl } = await import('@webwaka/verticals-palm-oil');
    vi.mocked(guardIntegerMl).mockReturnValueOnce({ allowed: false, reason: 'oilOutputMl must be integer' });
    const res = await makeApp().request('/profiles/po_001/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ processingDate: 1700000000, ffbInputKg: 1000, oilOutputMl: 500.5, productionCostKobo: 100000 }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/sales — record sale', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with sale record', async () => {
    const sale = { id: 'sal_001', profileId: 'po_001', quantityMl: 500000, totalKobo: 25000000 };
    mockRepo.createSale.mockResolvedValueOnce(sale);
    const res = await makeApp().request('/profiles/po_001/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ buyerPhone: '08012345678', quantityMl: 500000, pricePerLitreKobo: 50000, totalKobo: 25000000, saleDate: 1700000000 }) });
    expect(res.status).toBe(201);
  });
});

describe('POST /ai/prompt — AI advisory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns ai_advisory_queued status', async () => {
    const res = await makeApp().request('/ai/prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2 }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('ai_advisory_queued');
  });

  it('returns 403 when L2 cap exceeded', async () => {
    const { guardL2AiCap } = await import('@webwaka/verticals-palm-oil');
    vi.mocked(guardL2AiCap).mockReturnValueOnce({ allowed: false, reason: 'L2 cap exceeded' });
    const res = await makeApp().request('/ai/prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 5 }) });
    expect(res.status).toBe(403);
  });
});
