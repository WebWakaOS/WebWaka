/**
 * Event Hall vertical route tests — P11
 * FSM: seeded → claimed → licence_verified → active → suspended
 * Guards: guardClaimedToLicenceVerified, guardL2AiCap, guardNoClientDetailsInAi, guardFractionalKobo (all sync)
 * ≥10 cases: CRUD, FSM, bookings, AI, guards.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './event-hall.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createBooking: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-event-hall', () => ({
  EventHallRepository: vi.fn(() => mockRepo),
  isValidEventHallTransition: vi.fn().mockReturnValue(true),
  guardClaimedToLicenceVerified: vi.fn().mockReturnValue({ allowed: true }),
  guardL2AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardNoClientDetailsInAi: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'eh_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', hallName: 'Grand Event Hall', capacityGuests: 500, status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create event hall profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with hall profile', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', hallName: 'Grand Event Hall', capacityGuests: 500 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.hallName).toBe('Grand Event Hall');
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', hallName: 'Eko Hall', capacityGuests: 300 }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get event hall', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/eh_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('eh_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/eh_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_c').request('/profiles/eh_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('eh_001', 'tnt_c');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions and returns updated profile', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/eh_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('eh_001', 'tnt_a', 'claimed');
  });

  it('returns 404 if profile missing', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/eh_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid transition', async () => {
    const { isValidEventHallTransition } = await import('@webwaka/verticals-event-hall');
    vi.mocked(isValidEventHallTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/eh_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });

  it('returns 403 if licence guard fails on licence_verified', async () => {
    const { guardClaimedToLicenceVerified } = await import('@webwaka/verticals-event-hall');
    vi.mocked(guardClaimedToLicenceVerified).mockReturnValueOnce({ allowed: false, reason: 'licence missing' });
    mockRepo.findProfileById.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/eh_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'licence_verified' }) });
    expect(res.status).toBe(403);
  });
});

describe('POST /profiles/:id/bookings — create booking', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with booking', async () => {
    const booking = { id: 'bk_001', profileId: 'eh_001', eventType: 'wedding', hireRateKobo: 20000000 };
    mockRepo.createBooking.mockResolvedValueOnce(booking);
    const res = await makeApp().request('/profiles/eh_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientPhone: '08012345678', eventDate: 1700000000, eventType: 'wedding', capacityRequired: 300, hireRateKobo: 20000000, depositKobo: 5000000, balanceKobo: 15000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof booking;
    expect(body.eventType).toBe('wedding');
  });

  it('returns 422 if P9 fractional kobo guard fails', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-event-hall');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9: fractional kobo' });
    const res = await makeApp().request('/profiles/eh_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientPhone: '08012345678', eventDate: 1700000000, eventType: 'birthday', capacityRequired: 50, hireRateKobo: 0.5, depositKobo: 0, balanceKobo: 0 }) });
    expect(res.status).toBe(422);
  });

  it('returns 409 on double-booking conflict', async () => {
    mockRepo.createBooking.mockRejectedValueOnce(new Error('date conflict'));
    const res = await makeApp().request('/profiles/eh_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientPhone: '08099999999', eventDate: 1700000000, eventType: 'meeting', capacityRequired: 100, hireRateKobo: 10000000, depositKobo: 2000000, balanceKobo: 8000000 }) });
    expect(res.status).toBe(409);
  });
});

describe('POST /profiles/:id/ai/venue-utilisation — AI advisory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns queued status when guards allow', async () => {
    const res = await makeApp().request('/profiles/eh_001/ai/venue-utilisation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2 }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('queued');
  });

  it('returns 403 if L2 cap guard fails', async () => {
    const { guardL2AiCap } = await import('@webwaka/verticals-event-hall');
    vi.mocked(guardL2AiCap).mockReturnValueOnce({ allowed: false, reason: 'L2 cap exceeded' });
    const res = await makeApp().request('/profiles/eh_001/ai/venue-utilisation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 5 }) });
    expect(res.status).toBe(403);
  });

  it('returns 403 if PII guard blocks client details', async () => {
    const { guardNoClientDetailsInAi } = await import('@webwaka/verticals-event-hall');
    vi.mocked(guardNoClientDetailsInAi).mockReturnValueOnce({ allowed: false, reason: 'P13: client PII detected' });
    const res = await makeApp().request('/profiles/eh_001/ai/venue-utilisation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 2, clientPhone: '08099999999' }) });
    expect(res.status).toBe(403);
  });
});
