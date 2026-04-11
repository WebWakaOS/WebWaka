/**
 * @webwaka/verticals-event-planner — types + FSM guards (M9)
 * FSM: seeded → claimed → licence_verified → active → suspended
 * AI: L2 cap — event pipeline aggregate; no client details to AI (P13)
 * P9: all monetary values in kobo integers; guest_count as integer
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for deposit collection; Tier 3 for events above ₦5M
 */

export type EventPlannerFSMState =
  | 'seeded'
  | 'claimed'
  | 'licence_verified'
  | 'active'
  | 'suspended';

export type EventType = 'wedding' | 'birthday' | 'corporate' | 'funeral' | 'other';
export type EventStatus = 'enquiry' | 'confirmed' | 'in_planning' | 'day_of' | 'completed';
export type VendorType = 'caterer' | 'decorator' | 'DJ' | 'MC' | 'usher' | 'photographer' | 'other';
export type VendorStatus = 'booked' | 'confirmed' | 'cancelled';

const FSM_TRANSITIONS: Record<EventPlannerFSMState, EventPlannerFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['licence_verified'],
  licence_verified: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidEventPlannerTransition(from: EventPlannerFSMState, to: EventPlannerFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToLicenceVerified(input: { stateEventLicence: string | null }): GuardResult {
  if (!input.stateEventLicence || input.stateEventLicence.trim() === '') {
    return { allowed: false, reason: 'State event licence required to verify event planner' };
  }
  return { allowed: true };
}

export function guardKycForDeposit(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for event deposit collection' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'Event planner AI capped at L2 advisory' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'Event planner AI capped at L2' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardNoClientDataInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = ['client_phone', 'clientPhone', 'event_id', 'eventId', 'venue'];
  for (const key of forbidden) {
    if (key in payload) return { allowed: false, reason: `P13: client detail "${key}" must not pass to AI` };
  }
  return { allowed: true };
}

export interface EventPlannerProfile {
  id: string; workspaceId: string; tenantId: string;
  companyName: string; stateEventLicence: string | null; cacRc: string | null;
  status: EventPlannerFSMState; createdAt: number; updatedAt: number;
}

export interface PlannedEvent {
  id: string; profileId: string; tenantId: string;
  clientPhone: string; eventType: EventType; eventDate: number; venue: string | null;
  guestCount: number; totalBudgetKobo: number; depositKobo: number; balanceKobo: number;
  status: EventStatus; createdAt: number; updatedAt: number;
}

export interface EventVendor {
  id: string; eventId: string; tenantId: string;
  vendorType: VendorType; vendorPhone: string; vendorName: string;
  agreedFeeKobo: number; depositPaidKobo: number;
  status: VendorStatus; createdAt: number;
}

export interface EventTask {
  id: string; eventId: string; tenantId: string;
  taskName: string; dueDate: number | null; completed: boolean; createdAt: number;
}

export interface CreateEventPlannerInput {
  id?: string; workspaceId: string; tenantId: string;
  companyName: string; stateEventLicence?: string; cacRc?: string;
}

export interface CreateEventInput {
  id?: string; profileId: string; tenantId: string;
  clientPhone: string; eventType: EventType; eventDate: number; venue?: string;
  guestCount: number; totalBudgetKobo: number; depositKobo?: number;
}

export interface CreateVendorInput {
  id?: string; eventId: string; tenantId: string;
  vendorType: VendorType; vendorPhone: string; vendorName: string;
  agreedFeeKobo: number; depositPaidKobo?: number;
}

export interface CreateTaskInput {
  id?: string; eventId: string; tenantId: string;
  taskName: string; dueDate?: number;
}
