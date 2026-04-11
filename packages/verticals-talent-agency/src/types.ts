/**
 * @webwaka/verticals-talent-agency — types + FSM guards (M12)
 * FSM: seeded → claimed → nmma_verified → active → suspended
 * AI: L2 cap — booking pipeline aggregate; no deal terms to AI (P13)
 * P9: all monetary values in kobo integers
 * commission_bps: INTEGER basis points out of 10,000 (no floats)
 * Fee arithmetic: commission_kobo + talent_payout_kobo = brand_fee_kobo
 * P13: talent_ref_id opaque; deal terms NEVER to AI
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for talent payout; Tier 3 for international deals above ₦5M
 */

export type TalentAgencyFSMState =
  | 'seeded'
  | 'claimed'
  | 'nmma_verified'
  | 'active'
  | 'suspended';

export type TalentCategory = 'model' | 'actor' | 'singer' | 'influencer' | 'MC' | 'comedian';
export type TalentStatus = 'active' | 'inactive' | 'released';
export type BookingStatus = 'enquiry' | 'confirmed' | 'delivered' | 'paid';

const FSM_TRANSITIONS: Record<TalentAgencyFSMState, TalentAgencyFSMState[]> = {
  seeded:       ['claimed'],
  claimed:      ['nmma_verified'],
  nmma_verified: ['active'],
  active:       ['suspended'],
  suspended:    ['active'],
};

export function isValidTalentAgencyTransition(from: TalentAgencyFSMState, to: TalentAgencyFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNmmaVerified(input: { nmmaRegistration: string | null }): GuardResult {
  if (!input.nmmaRegistration || input.nmmaRegistration.trim() === '') {
    return { allowed: false, reason: 'NMMA registration required to verify talent agency' };
  }
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'Talent agency AI capped at L2 advisory — booking pipeline aggregate only' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'Talent agency AI capped at L2' };
  }
  return { allowed: true };
}

export function guardNoTalentDealDataInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = [
    'talent_ref_id', 'talentRefId', 'brand_ref_id', 'brandRefId',
    'commission_bps', 'commissionBps', 'deal_terms', 'dealTerms',
  ];
  for (const key of forbidden) {
    if (key in payload) return { allowed: false, reason: `P13: talent/deal data "${key}" must not pass to AI` };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardIntegerBps(bps: number): GuardResult {
  if (!Number.isInteger(bps) || bps < 0 || bps > 10000) {
    return { allowed: false, reason: 'commission_bps must be an integer between 0 and 10000 (basis points)' };
  }
  return { allowed: true };
}

export function guardFeeArithmetic(input: {
  brandFeeKobo: number; commissionKobo: number; talentPayoutKobo: number;
}): GuardResult {
  if (input.commissionKobo + input.talentPayoutKobo !== input.brandFeeKobo) {
    return { allowed: false, reason: `Fee arithmetic: commission_kobo (${input.commissionKobo}) + talent_payout_kobo (${input.talentPayoutKobo}) must equal brand_fee_kobo (${input.brandFeeKobo})` };
  }
  return { allowed: true };
}

export interface TalentAgencyProfile {
  id: string; workspaceId: string; tenantId: string;
  agencyName: string; nmmaRegistration: string | null;
  stateEntertainmentCert: string | null; cacRc: string | null;
  status: TalentAgencyFSMState; createdAt: number; updatedAt: number;
}

export interface TalentRosterEntry {
  id: string; profileId: string; tenantId: string;
  talentRefId: string; category: TalentCategory; commissionBps: number;
  signedDate: number; status: TalentStatus; createdAt: number; updatedAt: number;
}

export interface TalentBooking {
  id: string; profileId: string; tenantId: string;
  talentRefId: string; brandRefId: string; bookingDate: number;
  deliverableType: string; brandFeeKobo: number; commissionKobo: number;
  talentPayoutKobo: number; status: BookingStatus; createdAt: number; updatedAt: number;
}

export interface CreateTalentAgencyInput {
  id?: string; workspaceId: string; tenantId: string;
  agencyName: string; nmmaRegistration?: string; stateEntertainmentCert?: string; cacRc?: string;
}

export interface CreateTalentRosterInput {
  id?: string; profileId: string; tenantId: string;
  talentRefId: string; category: TalentCategory; commissionBps: number; signedDate: number;
}

export interface CreateBookingInput {
  id?: string; profileId: string; tenantId: string;
  talentRefId: string; brandRefId: string; bookingDate: number;
  deliverableType: string; brandFeeKobo: number; commissionKobo: number; talentPayoutKobo: number;
}
