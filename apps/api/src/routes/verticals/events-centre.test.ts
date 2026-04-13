/**
 * Events Centre vertical route tests — P11
 * FSM: seeded → claimed → licence_verified → active → suspended
 * Guards: guardClaimedToLicenceVerified, guardL2AiCap, guardFractionalKobo (all sync)
 * ≥10 cases: CRUD, FSM, sections, bookings, AI.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './events-centre.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createSection: vi.fn(), createBooking: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-events-centre', () => ({
  EventsCentreRepository: vi.fn(() => mockRepo),
  isValidEventsCentreTransition: vi.fn().mockReturnValue(true),
  guardClaimedToLicenceVerified: vi.fn().mockReturnValue({ allowed: true }),
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

const MOCK = { id: 'ec_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', centreName: 'Eko Events Centre', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create events centre profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', centreName: 'Eko Events Centre' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.centreName).toBe('Eko Events Centre');
  });

  it('T3: creates with correct tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', centreName: 'Lekki Centre' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get events centre', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/ec_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('ec_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/ec_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_c').request('/profiles/ec_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ec_001', 'tnt_c');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions to claimed and calls updateStatus', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/ec_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('ec_001', 'tnt_a', 'claimed');
  });

  it('returns 404 if profile missing', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/ec_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid transition', async () => {
    const { isValidEventsCentreTransition } = await import('@webwaka/verticals-events-centre');
    vi.mocked(isValidEventsCentreTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/ec_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if licence guard fails', async () => {
    const { guardClaimedToLicenceVerified } = await import('@webwaka/verticals-events-centre');
    vi.mocked(guardClaimedToLicenceVerified).mockReturnValueOnce({ allowed: false, reason: 'state licence missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/ec_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'licence_verified' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /profiles/:id/sections — create section', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with section', async () => {
    const section = { id: 'sec_001', sectionName: 'Main Hall', capacityGuests: 1000, dailyRateKobo: 50000000 };
    mockRepo.createSection.mockResolvedValueOnce(section);
    const res = await makeApp().request('/profiles/ec_001/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sectionName: 'Main Hall', capacityGuests: 1000, dailyRateKobo: 50000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof section;
    expect(body.sectionName).toBe('Main Hall');
  });

  it('returns 422 if P9 fractional kobo guard fails', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-events-centre');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9 violation' });
    const res = await makeApp().request('/profiles/ec_001/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sectionName: 'VIP Room', capacityGuests: 50, dailyRateKobo: 0.5 }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/bookings — create booking', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with booking', async () => {
    const booking = { id: 'bk_001', profileId: 'ec_001', packageKobo: 100000000 };
    mockRepo.createBooking.mockResolvedValueOnce(booking);
    const res = await makeApp().request('/profiles/ec_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientPhone: '08012345678', sectionIds: ['sec_001'], eventType: 'conference', startDate: 1700000000, endDate: 1700086400, totalNights: 1, packageKobo: 100000000, depositKobo: 30000000, balanceKobo: 70000000 }) });
    expect(res.status).toBe(201);
  });

  it('returns 409 on booking conflict', async () => {
    mockRepo.createBooking.mockRejectedValueOnce(new Error('section conflict'));
    const res = await makeApp().request('/profiles/ec_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientPhone: '08099999999', sectionIds: ['sec_001'], eventType: 'wedding', startDate: 1700000000, endDate: 1700086400, totalNights: 1, packageKobo: 100000000, depositKobo: 30000000, balanceKobo: 70000000 }) });
    expect(res.status).toBe(409);
  });
});

describe('POST /profiles/:id/ai/section-utilisation — AI advisory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns queued status', async () => {
    const res = await makeApp().request('/profiles/ec_001/ai/section-utilisation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2 }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('queued');
  });

  it('returns 403 when L2 cap exceeded', async () => {
    const { guardL2AiCap } = await import('@webwaka/verticals-events-centre');
    vi.mocked(guardL2AiCap).mockReturnValueOnce({ allowed: false, reason: 'L2 cap exceeded' });
    const res = await makeApp().request('/profiles/ec_001/ai/section-utilisation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 5 }) });
    expect(res.status).toBe(403);
  });
});
