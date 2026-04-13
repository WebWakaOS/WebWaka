/**
 * Photography Studio vertical route tests — P11
 * FSM: seeded → claimed → cac_verified → active → suspended
 * Guards: guardClaimedToCacVerified, guardL2AiCap, guardFractionalKobo, guardNoClientDataInAi (all sync)
 * ≥10 cases: CRUD, FSM, bookings, equipment, AI.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './photography-studio.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createBooking: vi.fn(), createEquipment: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-photography-studio', () => ({
  PhotographyStudioRepository: vi.fn(() => mockRepo),
  isValidPhotographyStudioTransition: vi.fn().mockReturnValue(true),
  guardClaimedToCacVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
  guardNoClientDataInAi: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'ps_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', studioName: 'Capture Lagos Studio', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create photography studio profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', studioName: 'Capture Lagos Studio' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.studioName).toBe('Capture Lagos Studio');
  });

  it('T3: creates profile scoped to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', studioName: 'Abuja Frames' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get photography studio profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/ps_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('ps_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/ps_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_c').request('/profiles/ps_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ps_001', 'tnt_c');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions to claimed and calls updateStatus', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/ps_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('ps_001', 'tnt_a', 'claimed');
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/ps_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidPhotographyStudioTransition } = await import('@webwaka/verticals-photography-studio');
    vi.mocked(isValidPhotographyStudioTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/ps_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if CAC guard fails on cac_verified', async () => {
    const { guardClaimedToCacVerified } = await import('@webwaka/verticals-photography-studio');
    vi.mocked(guardClaimedToCacVerified).mockReturnValueOnce({ allowed: false, reason: 'CAC RC missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/ps_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'cac_verified' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /profiles/:id/bookings — create booking', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with booking', async () => {
    const booking = { id: 'bk_001', profileId: 'ps_001', shootType: 'wedding', packageFeeKobo: 30000000 };
    mockRepo.createBooking.mockResolvedValueOnce(booking);
    const res = await makeApp().request('/profiles/ps_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'ref_c001', shootType: 'wedding', shootDate: 1700000000, packageFeeKobo: 30000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof booking;
    expect(body.shootType).toBe('wedding');
  });

  it('returns 422 if P9 fractional kobo guard fails', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-photography-studio');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9 violation' });
    const res = await makeApp().request('/profiles/ps_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientRefId: 'ref_001', shootType: 'portrait', shootDate: 1700000000, packageFeeKobo: 0.5 }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/equipment — add equipment', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with equipment record', async () => {
    const eq = { id: 'eq_001', itemName: 'Canon EOS R5', category: 'camera', purchaseCostKobo: 200000000 };
    mockRepo.createEquipment.mockResolvedValueOnce(eq);
    const res = await makeApp().request('/profiles/ps_001/equipment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemName: 'Canon EOS R5', category: 'camera', purchaseCostKobo: 200000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof eq;
    expect(body.itemName).toBe('Canon EOS R5');
  });
});

describe('POST /profiles/:id/ai/booking-insights — AI advisory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns queued status when guards allow', async () => {
    const res = await makeApp().request('/profiles/ps_001/ai/booking-insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2 }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('queued');
  });

  it('returns 403 when L2 cap guard fails', async () => {
    const { guardL2AiCap } = await import('@webwaka/verticals-photography-studio');
    vi.mocked(guardL2AiCap).mockReturnValueOnce({ allowed: false, reason: 'L2 cap exceeded' });
    const res = await makeApp().request('/profiles/ps_001/ai/booking-insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 5 }) });
    expect(res.status).toBe(403);
  });
});
