/**
 * @webwaka/verticals-hotel — Domain types (M9)
 * FSM: seeded → claimed → nihotour_verified → active → suspended
 * AI: L2 — REVENUE_FORECAST, OCCUPANCY_ADVISORY; aggregate only; no guest_ref_id (P13)
 * P9: all monetary in kobo integers; RevPAR in kobo
 * P13: guest_ref_id opaque — never to AI
 * T3: tenant_id always present
 * KYC: Tier 2 for billing; Tier 3 for institutional contracts above ₦50M
 */

export type HotelFSMState = 'seeded' | 'claimed' | 'nihotour_verified' | 'active' | 'suspended';
export type HotelType = 'hotel' | 'guesthouse' | 'shortlet';
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe' | 'shortlet';
export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type ReservationStatus = 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';

const FSM_TRANSITIONS: Record<HotelFSMState, HotelFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['nihotour_verified'],
  nihotour_verified: ['active'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidHotelTransition(from: HotelFSMState, to: HotelFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNihotourVerified(input: { nihotourLicence: string | null }): GuardResult {
  if (!input.nihotourLicence?.trim()) return { allowed: false, reason: 'NIHOTOUR licence required' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Hotel AI capped at L2' };
  if (input.autonomyLevel === 'L3_HITL') return { allowed: false, reason: 'Hotel AI capped at L2' };
  return { allowed: true };
}

export interface HotelProfile {
  id: string; workspaceId: string; tenantId: string; hotelName: string; hotelType: HotelType;
  nihotourLicence: string | null; stateTourismBoardRef: string | null; cacRc: string | null;
  starRating: number | null; status: HotelFSMState; createdAt: number; updatedAt: number;
}
export interface CreateHotelInput {
  id?: string; workspaceId: string; tenantId: string; hotelName: string; hotelType?: HotelType;
  nihotourLicence?: string; stateTourismBoardRef?: string; cacRc?: string; starRating?: number;
}
export interface HotelRoom {
  id: string; profileId: string; tenantId: string; roomNumber: string; roomType: RoomType;
  floor: number | null; capacity: number; ratePerNightKobo: number; status: RoomStatus; createdAt: number; updatedAt: number;
}
export interface HotelReservation {
  id: string; profileId: string; roomId: string; tenantId: string; guestRefId: string;
  checkIn: number; checkOut: number; nights: number; totalKobo: number; depositKobo: number;
  status: ReservationStatus; createdAt: number; updatedAt: number;
}
export interface HotelRevenueSummary {
  id: string; profileId: string; tenantId: string; summaryDate: number;
  roomsAvailable: number; roomsSold: number; totalRevenueKobo: number; revparKobo: number; createdAt: number;
}
