import type { HotelProfile, CreateHotelInput, HotelFSMState, HotelRoom, HotelReservation, HotelRevenueSummary } from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

function toProfile(r: Record<string, unknown>): HotelProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, hotelName: r['hotel_name'] as string, hotelType: r['hotel_type'] as HotelProfile['hotelType'], nihotourLicence: r['nihotour_licence'] as string | null, stateTourismBoardRef: r['state_tourism_board_ref'] as string | null, cacRc: r['cac_rc'] as string | null, starRating: r['star_rating'] as number | null, status: r['status'] as HotelFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}
function toRoom(r: Record<string, unknown>): HotelRoom {
  return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, roomNumber: r['room_number'] as string, roomType: r['room_type'] as HotelRoom['roomType'], floor: r['floor'] as number | null, capacity: r['capacity'] as number, ratePerNightKobo: r['rate_per_night_kobo'] as number, status: r['status'] as HotelRoom['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}
function toReservation(r: Record<string, unknown>): HotelReservation {
  return { id: r['id'] as string, profileId: r['profile_id'] as string, roomId: r['room_id'] as string, tenantId: r['tenant_id'] as string, guestRefId: r['guest_ref_id'] as string, checkIn: r['check_in'] as number, checkOut: r['check_out'] as number, nights: r['nights'] as number, totalKobo: r['total_kobo'] as number, depositKobo: r['deposit_kobo'] as number, status: r['status'] as HotelReservation['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class HotelRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateHotelInput): Promise<HotelProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO hotel_profiles (id,workspace_id,tenant_id,hotel_name,hotel_type,nihotour_licence,state_tourism_board_ref,cac_rc,star_rating,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.hotelName, input.hotelType ?? 'hotel', input.nihotourLicence ?? null, input.stateTourismBoardRef ?? null, input.cacRc ?? null, input.starRating ?? null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[hotel] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<HotelProfile | null> {
    const r = await this.db.prepare('SELECT * FROM hotel_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>(); return r ? toProfile(r) : null;
  }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<HotelProfile | null> {
    const r = await this.db.prepare('SELECT * FROM hotel_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId, tenantId).first<Record<string, unknown>>(); return r ? toProfile(r) : null;
  }
  async transitionStatus(id: string, tenantId: string, to: HotelFSMState, fields?: Partial<{ nihotourLicence: string; stateTourismBoardRef: string }>): Promise<HotelProfile> {
    const extra = fields?.nihotourLicence ? `, nihotour_licence='${fields.nihotourLicence}'` : '';
    await this.db.prepare(`UPDATE hotel_profiles SET status=?${extra}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to, id, tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[hotel] not found'); return p;
  }
  async createRoom(profileId: string, tenantId: string, input: { roomNumber: string; roomType: string; floor?: number; capacity?: number; ratePerNightKobo: number }): Promise<HotelRoom> {
    if (!Number.isInteger(input.ratePerNightKobo)) throw new Error('rate_per_night_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO hotel_rooms (id,profile_id,tenant_id,room_number,room_type,floor,capacity,rate_per_night_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,\'available\',unixepoch(),unixepoch())').bind(id, profileId, tenantId, input.roomNumber, input.roomType, input.floor ?? null, input.capacity ?? 1, input.ratePerNightKobo).run();
    const r = await this.db.prepare('SELECT * FROM hotel_rooms WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>(); if (!r) throw new Error('[hotel] room create failed'); return toRoom(r);
  }
  async listRooms(profileId: string, tenantId: string): Promise<HotelRoom[]> {
    const { results } = await this.db.prepare('SELECT * FROM hotel_rooms WHERE profile_id=? AND tenant_id=?').bind(profileId, tenantId).all<Record<string, unknown>>(); return results.map(toRoom);
  }
  async createReservation(profileId: string, tenantId: string, input: { roomId: string; guestRefId: string; checkIn: number; checkOut: number; nights: number; totalKobo: number; depositKobo?: number }): Promise<HotelReservation> {
    if (!Number.isInteger(input.totalKobo)) throw new Error('total_kobo must be integer (P9)');
    // check room availability
    const conflict = await this.db.prepare('SELECT id FROM hotel_reservations WHERE room_id=? AND tenant_id=? AND status NOT IN (\'cancelled\',\'checked_out\') AND check_in < ? AND check_out > ?').bind(input.roomId, tenantId, input.checkOut, input.checkIn).first<{ id: string }>();
    if (conflict) throw new Error('[hotel] Room already booked for this date range (double-booking prevention)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO hotel_reservations (id,profile_id,room_id,tenant_id,guest_ref_id,check_in,check_out,nights,total_kobo,deposit_kobo,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,\'pending\',unixepoch(),unixepoch())').bind(id, profileId, input.roomId, tenantId, input.guestRefId, input.checkIn, input.checkOut, input.nights, input.totalKobo, input.depositKobo ?? 0).run();
    const r = await this.db.prepare('SELECT * FROM hotel_reservations WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>(); if (!r) throw new Error('[hotel] reservation create failed'); return toReservation(r);
  }
  async listReservations(profileId: string, tenantId: string): Promise<HotelReservation[]> {
    const { results } = await this.db.prepare('SELECT * FROM hotel_reservations WHERE profile_id=? AND tenant_id=? ORDER BY check_in DESC').bind(profileId, tenantId).all<Record<string, unknown>>(); return results.map(toReservation);
  }
  async createRevenueSummary(profileId: string, tenantId: string, input: { summaryDate: number; roomsAvailable: number; roomsSold: number; totalRevenueKobo: number; revparKobo: number }): Promise<HotelRevenueSummary> {
    if (!Number.isInteger(input.totalRevenueKobo) || !Number.isInteger(input.revparKobo)) throw new Error('Revenue values must be integer kobo (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO hotel_revenue_summary (id,profile_id,tenant_id,summary_date,rooms_available,rooms_sold,total_revenue_kobo,revpar_kobo,created_at) VALUES (?,?,?,?,?,?,?,?,unixepoch())').bind(id, profileId, tenantId, input.summaryDate, input.roomsAvailable, input.roomsSold, input.totalRevenueKobo, input.revparKobo).run();
    const r = await this.db.prepare('SELECT * FROM hotel_revenue_summary WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>(); if (!r) throw new Error('[hotel] revenue summary create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, summaryDate: r['summary_date'] as number, roomsAvailable: r['rooms_available'] as number, roomsSold: r['rooms_sold'] as number, totalRevenueKobo: r['total_revenue_kobo'] as number, revparKobo: r['revpar_kobo'] as number, createdAt: r['created_at'] as number };
  }
  async listRevenueSummaries(profileId: string, tenantId: string): Promise<HotelRevenueSummary[]> {
    const { results } = await this.db.prepare('SELECT * FROM hotel_revenue_summary WHERE profile_id=? AND tenant_id=? ORDER BY summary_date DESC').bind(profileId, tenantId).all<Record<string, unknown>>();
    return results.map(r => ({ id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, summaryDate: r['summary_date'] as number, roomsAvailable: r['rooms_available'] as number, roomsSold: r['rooms_sold'] as number, totalRevenueKobo: r['total_revenue_kobo'] as number, revparKobo: r['revpar_kobo'] as number, createdAt: r['created_at'] as number }));
  }
}

export function guardSeedToClaimed(_profile: HotelProfile): { allowed: boolean; reason?: string } {
  return { allowed: true };
}
