/**
 * Community Hall vertical route tests — P11
 * FSM: seeded → claimed → active (3-state)
 * Guards: guardL1AiCap (sync), guardFractionalKobo (sync)
 * ≥10 cases: CRUD, FSM, T3, bookings, maintenance, AI cap.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import app from './community-hall.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), updateStatus: vi.fn(),
    createBooking: vi.fn(), createMaintenance: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-community-hall', () => ({
  CommunityHallRepository: vi.fn(() => mockRepo),
  isValidCommunityHallTransition: vi.fn().mockReturnValue(true),
  guardL1AiCap: vi.fn().mockReturnValue({ allowed: true }),
  guardFractionalKobo: vi.fn().mockReturnValue({ allowed: true }),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', app);
  return w;
}

const MOCK = { id: 'ch_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', hallName: 'Ogun CDA Hall', lga: 'Ikeja', state: 'Lagos', capacitySeats: 200, status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST /profiles — create community hall profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with profile on success', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_a', hallName: 'Ogun CDA Hall', lga: 'Ikeja', state: 'Lagos', capacitySeats: 200 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof MOCK;
    expect(body.hallName).toBe('Ogun CDA Hall');
  });

  it('T3: creates profile scoped to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspaceId: 'wsp_b', hallName: 'Test Hall', lga: 'Mushin', state: 'Lagos', capacitySeats: 100 }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /profiles/:id — get community hall', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/ch_001');
    expect(res.status).toBe(200);
    const body = await res.json() as typeof MOCK;
    expect(body.id).toBe('ch_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/ch_999');
    expect(res.status).toBe(404);
  });

  it('T3: queries with tenantId', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/profiles/ch_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ch_001', 'tnt_b');
  });
});

describe('PATCH /profiles/:id/transition — FSM', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions to claimed and returns updated profile', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK).mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/profiles/ch_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(200);
    expect(mockRepo.updateStatus).toHaveBeenCalledWith('ch_001', 'tnt_a', 'claimed');
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/profiles/ch_999/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid transition', async () => {
    const { isValidCommunityHallTransition } = await import('@webwaka/verticals-community-hall');
    vi.mocked(isValidCommunityHallTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/profiles/ch_001/transition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /profiles/:id/bookings — create booking', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with booking', async () => {
    const booking = { id: 'bk_001', profileId: 'ch_001', groupName: 'Lagos CDA', hireFeeKobo: 5000000 };
    mockRepo.createBooking.mockResolvedValueOnce(booking);
    const res = await makeApp().request('/profiles/ch_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groupName: 'Lagos CDA', eventType: 'meeting', bookingDate: 1700000000, hireFeeKobo: 5000000, depositKobo: 1000000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof booking;
    expect(body.groupName).toBe('Lagos CDA');
  });

  it('returns 422 if fractional kobo guard fails', async () => {
    const { guardFractionalKobo } = await import('@webwaka/verticals-community-hall');
    vi.mocked(guardFractionalKobo).mockReturnValueOnce({ allowed: false, reason: 'P9: fractional kobo' });
    const res = await makeApp().request('/profiles/ch_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groupName: 'Test', eventType: 'meeting', bookingDate: 1700000000, hireFeeKobo: 0.5, depositKobo: 0 }) });
    expect(res.status).toBe(422);
  });

  it('returns 409 on double-booking conflict', async () => {
    mockRepo.createBooking.mockRejectedValueOnce(new Error('booking conflict'));
    const res = await makeApp().request('/profiles/ch_001/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ groupName: 'Test', eventType: 'meeting', bookingDate: 1700000000, hireFeeKobo: 5000000, depositKobo: 0 }) });
    expect(res.status).toBe(409);
  });
});

describe('POST /profiles/:id/maintenance — create maintenance record', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with maintenance record', async () => {
    const maintenance = { id: 'mt_001', profileId: 'ch_001', amountKobo: 200000 };
    mockRepo.createMaintenance.mockResolvedValueOnce(maintenance);
    const res = await makeApp().request('/profiles/ch_001/maintenance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contributionDate: 1700000000, contributorRef: 'ref_001', amountKobo: 200000, purpose: 'roof repair' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as typeof maintenance;
    expect(body.amountKobo).toBe(200000);
  });
});

describe('POST /profiles/:id/ai/booking-frequency — AI advisory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns queued status with L1 cap allowed', async () => {
    const res = await makeApp().request('/profiles/ch_001/ai/booking-frequency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 1 }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('queued');
  });

  it('returns 403 when L1 cap exceeded', async () => {
    const { guardL1AiCap } = await import('@webwaka/verticals-community-hall');
    vi.mocked(guardL1AiCap).mockReturnValueOnce({ allowed: false, reason: 'L1 cap exceeded' });
    const res = await makeApp().request('/profiles/ch_001/ai/booking-frequency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autonomyLevel: 5 }) });
    expect(res.status).toBe(403);
  });
});
