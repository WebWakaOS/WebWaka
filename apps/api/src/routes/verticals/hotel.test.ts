/**
 * Hotel vertical route tests — P11
 * FSM: seeded → claimed → frsc_verified → active (old-style, b['status'] body key)
 * Sub-resources: rooms, reservations, revenue summary
 * ≥10 cases: CRUD, FSM, rooms, reservations, revenue, T3 isolation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { hotelRoutes } from './hotel.js';

const { mockRepo } = vi.hoisted(() => ({
  mockRepo: {
    createProfile: vi.fn(), findProfileById: vi.fn(), findProfileByWorkspace: vi.fn(),
    updateProfile: vi.fn(), transitionStatus: vi.fn(),
    createRoom: vi.fn(), listRooms: vi.fn(),
    createReservation: vi.fn(), listReservations: vi.fn(),
    createRevenueSummary: vi.fn(), listRevenueSummaries: vi.fn(),
  },
}));

vi.mock('@webwaka/verticals-hotel', () => ({
  HotelRepository: vi.fn(() => mockRepo),
  isValidHotelTransition: vi.fn().mockReturnValue(true),
}));

const stubDb = { prepare: () => ({ bind: () => ({ first: async () => null, run: async () => ({ success: true }), all: async () => ({ results: [] }) }) }) };

function makeApp(tenantId = 'tnt_a') {
  const w = new Hono<{ Bindings: { DB: unknown; JWT_SECRET: string; ENVIRONMENT: string } }>();
  w.use('*', async (c, next) => { c.env = { DB: stubDb, JWT_SECRET: 'test', ENVIRONMENT: 'development' } as never; c.set('auth' as never, { userId: 'usr_a', tenantId } as never); await next(); });
  w.route('/', hotelRoutes);
  return w;
}

const MOCK = { id: 'ht_001', workspaceId: 'wsp_a', tenantId: 'tnt_a', hotelName: 'Eko Atlantic Hotel', status: 'seeded' };
const CLAIMED = { ...MOCK, status: 'claimed' };

describe('POST / — create hotel profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with hotel key', async () => {
    mockRepo.createProfile.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_a', hotel_name: 'Eko Atlantic Hotel' }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { hotel: typeof MOCK };
    expect(body.hotel.hotelName).toBe('Eko Atlantic Hotel');
  });

  it('returns 400 if required fields missing', async () => {
    const res = await makeApp().request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotel_name: 'Test' }) });
    expect(res.status).toBe(400);
  });

  it('T3: scopes profile to tenantId', async () => {
    mockRepo.createProfile.mockResolvedValueOnce({ ...MOCK, tenantId: 'tnt_b' });
    await makeApp('tnt_b').request('/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workspace_id: 'wsp_b', hotel_name: 'Abuja Grand Hotel' }) });
    expect(mockRepo.createProfile).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tnt_b' }));
  });
});

describe('GET /workspace/:workspaceId — find by workspace', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns hotel profile', async () => {
    mockRepo.findProfileByWorkspace.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/workspace/wsp_a');
    expect(res.status).toBe(200);
    const body = await res.json() as { hotel: typeof MOCK };
    expect(body.hotel.id).toBe('ht_001');
  });
});

describe('GET /:id — get hotel profile', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns profile when found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ht_001');
    expect(res.status).toBe(200);
    const body = await res.json() as { hotel: typeof MOCK };
    expect(body.hotel.id).toBe('ht_001');
  });

  it('returns 404 when not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ht_999');
    expect(res.status).toBe(404);
  });

  it('T3: uses tenantId from auth', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    await makeApp('tnt_b').request('/ht_001');
    expect(mockRepo.findProfileById).toHaveBeenCalledWith('ht_001', 'tnt_b');
  });
});

describe('POST /:id/transition — FSM (status key)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('transitions status using status body key', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    mockRepo.transitionStatus.mockResolvedValueOnce(CLAIMED);
    const res = await makeApp().request('/ht_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(200);
    const body = await res.json() as { hotel: typeof CLAIMED };
    expect(body.hotel.status).toBe('claimed');
  });

  it('returns 422 if status missing (profile found)', async () => {
    const { isValidHotelTransition } = await import('@webwaka/verticals-hotel');
    vi.mocked(isValidHotelTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ht_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    expect(res.status).toBe(422);
  });

  it('returns 404 if profile not found', async () => {
    mockRepo.findProfileById.mockResolvedValueOnce(null);
    const res = await makeApp().request('/ht_999/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'claimed' }) });
    expect(res.status).toBe(404);
  });

  it('returns 422 for invalid FSM transition', async () => {
    const { isValidHotelTransition } = await import('@webwaka/verticals-hotel');
    vi.mocked(isValidHotelTransition).mockReturnValueOnce(false);
    mockRepo.findProfileById.mockResolvedValueOnce(MOCK);
    const res = await makeApp().request('/ht_001/transition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) });
    expect(res.status).toBe(422);
  });
});

describe('POST /:id/rooms — create room', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with room record', async () => {
    const room = { id: 'room_001', profileId: 'ht_001', roomNumber: '101', roomType: 'deluxe', ratePerNightKobo: 2500000 };
    mockRepo.createRoom.mockResolvedValueOnce(room);
    const res = await makeApp().request('/ht_001/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room_number: '101', room_type: 'deluxe', floor: 1, rate_per_night_kobo: 2500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { room: typeof room };
    expect(body.room.roomType).toBe('deluxe');
  });
});

describe('GET /:id/rooms — list rooms', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns list of rooms', async () => {
    mockRepo.listRooms.mockResolvedValueOnce([{ id: 'room_001' }, { id: 'room_002' }]);
    const res = await makeApp().request('/ht_001/rooms');
    expect(res.status).toBe(200);
    const body = await res.json() as { rooms: { id: string }[]; count: number };
    expect(body.rooms).toHaveLength(2);
    expect(body.count).toBe(2);
  });
});

describe('POST /:id/reservations — create reservation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with reservation', async () => {
    const reservation = { id: 'res_001', profileId: 'ht_001', roomId: 'room_001', guestRefId: 'ref_g001', totalKobo: 7500000 };
    mockRepo.createReservation.mockResolvedValueOnce(reservation);
    const res = await makeApp().request('/ht_001/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room_id: 'room_001', guest_ref_id: 'ref_g001', check_in: 1700000000, check_out: 1700259200, nights: 3, total_kobo: 7500000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { reservation: typeof reservation };
    expect(body.reservation.totalKobo).toBe(7500000);
  });
});

describe('POST /:id/revenue-summary — create revenue summary', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns 201 with revenue summary', async () => {
    const summary = { id: 'rev_001', profileId: 'ht_001', summaryDate: 1700000000, totalRevenueKobo: 15000000000 };
    mockRepo.createRevenueSummary.mockResolvedValueOnce(summary);
    const res = await makeApp().request('/ht_001/revenue-summary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ summary_date: 1700000000, rooms_available: 50, rooms_sold: 38, total_revenue_kobo: 15000000000, revpar_kobo: 300000 }) });
    expect(res.status).toBe(201);
    const body = await res.json() as { summary: typeof summary };
    expect(body.summary.totalRevenueKobo).toBe(15000000000);
  });
});
