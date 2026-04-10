/**
 * Hotel vertical routes — M12 Set J
 * POST   /hotel                              — Create profile
 * GET    /hotel/workspace/:workspaceId       — Find by workspace (T3)
 * GET    /hotel/:id                          — Get profile (T3)
 * POST   /hotel/:id/transition               — FSM transition
 * POST   /hotel/:id/rooms                    — Add room
 * GET    /hotel/:id/rooms                    — List rooms (T3)
 * POST   /hotel/:id/reservations             — Create reservation (anti-double-booking)
 * GET    /hotel/:id/reservations             — List reservations (T3)
 * POST   /hotel/:id/revenue-summary          — Create revenue summary
 * GET    /hotel/:id/revenue-summary          — List revenue summaries (T3)
 */
import { Hono } from 'hono';
import { HotelRepository, isValidHotelTransition } from '@webwaka/verticals-hotel';
import type { HotelFSMState } from '@webwaka/verticals-hotel';
import type { Env } from '../../env.js';

export const hotelRoutes = new Hono<{ Bindings: Env }>();

hotelRoutes.post('/', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body['workspace_id'] || !body['hotel_name']) return c.json({ error: 'workspace_id, hotel_name required' }, 400);
  const repo = new HotelRepository(c.env.DB);
  const profile = await repo.createProfile({ workspaceId: body['workspace_id'] as string, tenantId: auth.tenantId, hotelName: body['hotel_name'] as string, hotelType: body['hotel_type'] as string | undefined, nihotourLicence: body['nihotour_licence'] as string | undefined, stateTourismBoardRef: body['state_tourism_board_ref'] as string | undefined, cacRc: body['cac_rc'] as string | undefined, starRating: body['star_rating'] as number | undefined });
  return c.json({ hotel: profile }, 201);
});

hotelRoutes.get('/workspace/:workspaceId', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HotelRepository(c.env.DB);
  const profile = await repo.findProfileByWorkspace(c.req.param('workspaceId'), auth.tenantId);
  return c.json({ hotel: profile });
});

hotelRoutes.get('/:id', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HotelRepository(c.env.DB);
  const profile = await repo.findProfileById(c.req.param('id'), auth.tenantId);
  if (!profile) return c.json({ error: 'Hotel profile not found' }, 404);
  return c.json({ hotel: profile });
});

hotelRoutes.post('/:id/transition', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new HotelRepository(c.env.DB);
  const profile = await repo.findProfileById(c.req.param('id'), auth.tenantId);
  if (!profile) return c.json({ error: 'Hotel profile not found' }, 404);
  const to = body['status'] as HotelFSMState;
  if (!isValidHotelTransition(profile.status, to)) return c.json({ error: `Invalid FSM transition ${profile.status} → ${to}` }, 422);
  const updated = await repo.transitionStatus(c.req.param('id'), auth.tenantId, to, { nihotourLicence: body['nihotour_licence'] as string | undefined, stateTourismBoardRef: body['state_tourism_board_ref'] as string | undefined });
  return c.json({ hotel: updated });
});

hotelRoutes.post('/:id/rooms', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body['room_number'] || body['rate_per_night_kobo'] === undefined) return c.json({ error: 'room_number, rate_per_night_kobo required' }, 400);
  const repo = new HotelRepository(c.env.DB);
  const room = await repo.createRoom(c.req.param('id'), auth.tenantId, { roomNumber: body['room_number'] as string, roomType: body['room_type'] as string, floor: body['floor'] as number | undefined, capacity: body['capacity'] as number | undefined, ratePerNightKobo: body['rate_per_night_kobo'] as number });
  return c.json({ room }, 201);
});

hotelRoutes.get('/:id/rooms', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HotelRepository(c.env.DB);
  const rooms = await repo.listRooms(c.req.param('id'), auth.tenantId);
  return c.json({ rooms, count: rooms.length });
});

hotelRoutes.post('/:id/reservations', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  if (!body['room_id'] || !body['guest_ref_id'] || body['check_in'] === undefined || body['check_out'] === undefined || body['nights'] === undefined || body['total_kobo'] === undefined) return c.json({ error: 'room_id, guest_ref_id, check_in, check_out, nights, total_kobo required' }, 400);
  const repo = new HotelRepository(c.env.DB);
  try {
    const reservation = await repo.createReservation(c.req.param('id'), auth.tenantId, { roomId: body['room_id'] as string, guestRefId: body['guest_ref_id'] as string, checkIn: body['check_in'] as number, checkOut: body['check_out'] as number, nights: body['nights'] as number, totalKobo: body['total_kobo'] as number, depositKobo: body['deposit_kobo'] as number | undefined });
    return c.json({ reservation }, 201);
  } catch (e) { return c.json({ error: (e as Error).message }, 422); }
});

hotelRoutes.get('/:id/reservations', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HotelRepository(c.env.DB);
  const reservations = await repo.listReservations(c.req.param('id'), auth.tenantId);
  return c.json({ reservations, count: reservations.length });
});

hotelRoutes.post('/:id/revenue-summary', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  let body: Record<string, unknown>;
  try { body = await c.req.json(); } catch { return c.json({ error: 'Invalid JSON body' }, 400); }
  const repo = new HotelRepository(c.env.DB);
  const summary = await repo.createRevenueSummary(c.req.param('id'), auth.tenantId, { summaryDate: body['summary_date'] as number, roomsAvailable: body['rooms_available'] as number, roomsSold: body['rooms_sold'] as number, totalRevenueKobo: body['total_revenue_kobo'] as number, revparKobo: body['revpar_kobo'] as number });
  return c.json({ summary }, 201);
});

hotelRoutes.get('/:id/revenue-summary', async (c) => {
  const auth = c.get('auth') as { userId: string; tenantId: string };
  const repo = new HotelRepository(c.env.DB);
  const summaries = await repo.listRevenueSummaries(c.req.param('id'), auth.tenantId);
  return c.json({ summaries, count: summaries.length });
});
