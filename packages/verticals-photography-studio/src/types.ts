/**
 * @webwaka/verticals-photography-studio — types + FSM guards (M10)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 cap — booking pipeline aggregate; no client details to AI (P13)
 * P9: all monetary values in kobo integers
 * P13: client_ref_id opaque; no client details in AI
 * T3: all queries scoped to tenant_id
 * KYC: Tier 1 for standard bookings; Tier 2 for commercial shoots above ₦500,000
 */

export type PhotographyStudioFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type ShootType = 'wedding' | 'corporate' | 'music_video' | 'event' | 'portrait' | 'fashion';
export type BookingStatus = 'enquiry' | 'confirmed' | 'shoot_day' | 'editing' | 'delivered';
export type EquipmentCategory = 'camera' | 'lens' | 'lighting' | 'drone' | 'other';
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs_repair';

const FSM_TRANSITIONS: Record<PhotographyStudioFSMState, PhotographyStudioFSMState[]> = {
  seeded:      ['claimed'],
  claimed:     ['cac_verified'],
  cac_verified: ['active'],
  active:      ['suspended'],
  suspended:   ['active'],
};

export function isValidPhotographyStudioTransition(from: PhotographyStudioFSMState, to: PhotographyStudioFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToCacVerified(input: { cacRc: string | null }): GuardResult {
  if (!input.cacRc || input.cacRc.trim() === '') {
    return { allowed: false, reason: 'CAC RC required to verify photography studio' };
  }
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'Photography studio AI capped at L2 advisory' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'Photography studio AI capped at L2' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardNoClientDataInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = ['client_ref_id', 'clientRefId', 'location', 'shoot_date', 'shootDate'];
  for (const key of forbidden) {
    if (key in payload) return { allowed: false, reason: `P13: client detail "${key}" must not pass to AI` };
  }
  return { allowed: true };
}

export interface PhotographyStudioProfile {
  id: string; workspaceId: string; tenantId: string;
  studioName: string; apconRegistered: boolean; nujAffiliation: string | null; cacRc: string | null;
  status: PhotographyStudioFSMState; createdAt: number; updatedAt: number;
}

export interface PhotoBooking {
  id: string; profileId: string; tenantId: string;
  clientRefId: string; shootType: ShootType; shootDate: number; location: string | null;
  packageFeeKobo: number; depositKobo: number; balanceKobo: number;
  deliverableRef: string | null; status: BookingStatus; createdAt: number; updatedAt: number;
}

export interface PhotoEquipment {
  id: string; profileId: string; tenantId: string;
  itemName: string; category: EquipmentCategory; purchaseCostKobo: number;
  condition: EquipmentCondition; createdAt: number;
}

export interface CreatePhotographyStudioInput {
  id?: string; workspaceId: string; tenantId: string;
  studioName: string; apconRegistered?: boolean; nujAffiliation?: string; cacRc?: string;
}

export interface CreateBookingInput {
  id?: string; profileId: string; tenantId: string;
  clientRefId: string; shootType: ShootType; shootDate: number; location?: string;
  packageFeeKobo: number; depositKobo?: number; deliverableRef?: string;
}

export interface CreateEquipmentInput {
  id?: string; profileId: string; tenantId: string;
  itemName: string; category: EquipmentCategory; purchaseCostKobo: number; condition?: EquipmentCondition;
}
