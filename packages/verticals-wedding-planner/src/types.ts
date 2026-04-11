/**
 * @webwaka/verticals-wedding-planner — types + FSM guards (M12)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 cap — wedding pipeline aggregate; no couple PII to AI (P13)
 * P9: all monetary values in kobo integers; guest_count as integer
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for deposit collection; Tier 3 for events above ₦10M
 */

export type WeddingPlannerFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type WeddingStyle = 'traditional' | 'church' | 'nikah' | 'court' | 'destination';
export type WeddingStatus = 'enquiry' | 'booked' | 'planning' | 'day_of' | 'completed';
export type WeddingVendorType = 'caterer' | 'decorator' | 'photographer' | 'DJ' | 'usher' | 'florist' | 'other';
export type TaskCategory = 'venue' | 'catering' | 'styling' | 'legal' | 'logistics';

const FSM_TRANSITIONS: Record<WeddingPlannerFSMState, WeddingPlannerFSMState[]> = {
  seeded:      ['claimed'],
  claimed:     ['cac_verified'],
  cac_verified: ['active'],
  active:      ['suspended'],
  suspended:   ['active'],
};

export function isValidWeddingPlannerTransition(from: WeddingPlannerFSMState, to: WeddingPlannerFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToCacVerified(input: { cacRc: string | null }): GuardResult {
  if (!input.cacRc || input.cacRc.trim() === '') {
    return { allowed: false, reason: 'CAC RC required to verify wedding planner' };
  }
  return { allowed: true };
}

export function guardKycForLargeEvent(input: { kycTier: number; totalBudgetKobo: number }): GuardResult {
  if (input.totalBudgetKobo > 1_000_000_000 && input.kycTier < 3) {
    return { allowed: false, reason: 'KYC Tier 3 required for events above ₦10M total budget' };
  }
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'Wedding planner AI capped at L2 advisory' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'Wedding planner AI capped at L2' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardNoCouplePiiInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = ['bride_ref', 'brideRef', 'groom_ref', 'groomRef', 'event_id', 'eventId', 'venue'];
  for (const key of forbidden) {
    if (key in payload) return { allowed: false, reason: `P13: couple/event detail "${key}" must not pass to AI` };
  }
  return { allowed: true };
}

export interface WeddingPlannerProfile {
  id: string; workspaceId: string; tenantId: string;
  companyName: string; cacRc: string | null; celebrantCert: string | null;
  status: WeddingPlannerFSMState; createdAt: number; updatedAt: number;
}

export interface WeddingEvent {
  id: string; profileId: string; tenantId: string;
  eventDate: number; venue: string | null; guestCount: number;
  totalBudgetKobo: number; depositKobo: number; balanceKobo: number;
  style: WeddingStyle; status: WeddingStatus; createdAt: number; updatedAt: number;
}

export interface WeddingVendor {
  id: string; eventId: string; tenantId: string;
  vendorType: WeddingVendorType; vendorPhone: string;
  agreedFeeKobo: number; depositPaidKobo: number;
  status: string; createdAt: number;
}

export interface WeddingTask {
  id: string; eventId: string; tenantId: string;
  taskName: string; category: TaskCategory; dueDate: number | null;
  completed: boolean; createdAt: number;
}

export interface CreateWeddingPlannerInput {
  id?: string; workspaceId: string; tenantId: string;
  companyName: string; cacRc?: string; celebrantCert?: string;
}

export interface CreateWeddingEventInput {
  id?: string; profileId: string; tenantId: string;
  eventDate: number; venue?: string; guestCount: number;
  totalBudgetKobo: number; depositKobo?: number; style?: WeddingStyle;
}

export interface CreateWeddingVendorInput {
  id?: string; eventId: string; tenantId: string;
  vendorType: WeddingVendorType; vendorPhone: string;
  agreedFeeKobo: number; depositPaidKobo?: number;
}

export interface CreateWeddingTaskInput {
  id?: string; eventId: string; tenantId: string;
  taskName: string; category?: TaskCategory; dueDate?: number;
}
