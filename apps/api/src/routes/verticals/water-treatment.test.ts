/**
 * Water Treatment vertical route tests — P9 Set G (V-AGRO-G11)
 * ≥10 cases: CRUD (/profiles), FSM, T3, quality-logs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './water-treatment.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateProfile: vi.fn(), updateStatus: vi.fn(),
    createQualityLog: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-water-treatment', () => ({
  WaterTreatmentRepository: vi.fn(() => mockRepo),
  guardClaimedToNafdacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardScaledIntegerPh: vi.fn().mockReturnValue({ allowed: true }),
  guardScaledIntegerChlorine: vi.fn().mockReturnValue({ allowed: true }),
  isValidWaterTreatmentTransition: mockIsValid,
}));

vi.mock('@webwaka/superagent', () => ({
  aiConsentGate: vi.fn().mockImplementation(async (_c: unknown, next: () => Promise<void>) => next()),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId, kycTier: 1 } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'wt_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', plantName: 'Abuja Water Treatment Plant', status: 'seeded' };

describe('POST /profiles — create water treatment profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', plantName: 'Abuja Water Treatment Plant' }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 when fields missing (no route validation', async () => {
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', plantName: 'Abuja Water Treatment Plant' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/profiles/wt_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(null); expect((await makeApp().request('/profiles/nx')).status).toBe(404); });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/profiles/wt_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.updateStatus.mockResolvedValueOnce(undefined); mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/profiles/wt_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/quality-logs', () => {
  it('returns 201 for valid quality log entry', async () => {
    mockRepo.createQualityLog.mockResolvedValueOnce({ id: 'ql_001', phValue: 70, chlorineMgL: 5, turbidityNtu: 2 });
    expect((await makeApp().request('/profiles/wt_001/quality-logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phValue: 70, chlorineMgL: 5, turbidityNtu: 2, testDate: 1700000000 }) })).status).toBe(201);
  });
});

describe('GET /profiles/:id/quality-logs', () => {
  it('returns 404 (no list endpoint defined)', async () => {
    expect((await makeApp().request('/profiles/wt_001/quality-logs')).status).toBe(404);
  });
});
