/**
 * Cold Room / Refrigerated Storage vertical route tests — P9 Set G (V-AGRO-G12)
 * ≥10 cases: CRUD (/profiles), FSM, T3, P9 price_kobo, units.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './cold-room.js';

const { mockRepo, mockIsValid } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateProfile: vi.fn(), transition: vi.fn(),
    createUnit: vi.fn(),
  },
  mockIsValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@webwaka/verticals-cold-room', () => ({
  ColdRoomRepository: vi.fn(() => mockRepo),
  guardClaimedToNafdacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardIntegerTemperature: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  isValidColdRoomTransition: mockIsValid,
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

const MOCK = { id: 'cr_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', facilityName: 'Katsina Cold Storage', status: 'seeded' };

describe('POST /profiles — create cold room profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 for valid creation', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', facilityName: 'Katsina Cold Storage' }) });
    expect(res.status).toBe(201);
  });

  it('returns 201 when fields missing (no route validation', async () => {
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a' }) });
    expect(res.status).toBe(201);
  });

  it('T3: tenantId from auth JWT', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    await makeApp('tnt_x').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', facilityName: 'Katsina Cold Storage' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_x' }));
  });
});

describe('GET /profiles/:id', () => {
  it('returns 200 when found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(MOCK); expect((await makeApp().request('/profiles/cr_001')).status).toBe(200); });
  it('returns 404 when not found', async () => { mockRepo.findProfileById.mockResolvedValueOnce(null); expect((await makeApp().request('/profiles/nx')).status).toBe(404); });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 422 for invalid transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK); mockIsValid.mockReturnValueOnce(false);
    expect((await makeApp().request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) })).status).toBe(422);
  });

  it('returns 200 for valid seeded→claimed transition', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce({ ...MOCK, status: 'seeded' }); mockIsValid.mockReturnValueOnce(true); mockRepo.transition.mockResolvedValueOnce({ ...MOCK, status: 'claimed' });
    expect((await makeApp().request('/profiles/cr_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(200);
  });

  it('returns 404 when profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    expect((await makeApp().request('/profiles/nx/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) })).status).toBe(404);
  });
});

describe('POST /profiles/:id/units — P9 daily_rate_kobo', () => {
  it('returns 201 for valid storage unit', async () => {
    mockRepo.createUnit.mockResolvedValueOnce({ id: 'unit_001', unitCode: 'CR-A1', capacityKg: 5000, setpointTemp: -5, dailyRateKobo: 120000 });
    expect((await makeApp().request('/profiles/cr_001/units', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ unitCode: 'CR-A1', capacityKg: 5000, setpointTemp: -5, dailyRateKobo: 120000 }) })).status).toBe(201);
  });
});

describe('GET /profiles/:id/units', () => {
  it('returns 404 (no list endpoint defined)', async () => {
    expect((await makeApp().request('/profiles/cr_001/units')).status).toBe(404);
  });
});
