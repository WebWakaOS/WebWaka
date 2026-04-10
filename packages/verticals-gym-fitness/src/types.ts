/**
 * @webwaka/verticals-gym-fitness — Domain types (M11)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 — VENUE_UTILIZATION_REPORT; aggregate membership counts only; no member_ref_id (P13)
 * P9: all monetary in kobo integers
 * P13: member_ref_id opaque; health metrics (weight/height) NEVER to AI
 * T3: tenant_id always present
 */

export type GymFitnessFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type MembershipType = 'daily' | 'monthly' | 'quarterly' | 'annual';
export type MembershipStatus = 'active' | 'expired' | 'paused' | 'cancelled';
export type EquipmentCondition = 'good' | 'fair' | 'poor' | 'decommissioned';

const FSM_TRANSITIONS: Record<GymFitnessFSMState, GymFitnessFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidGymFitnessTransition(from: GymFitnessFSMState, to: GymFitnessFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardNoHealthMetricsToAi(input: { includesHealthMetrics?: boolean }): GuardResult {
  if (input.includesHealthMetrics) return { allowed: false, reason: 'Health metrics (weight/height) must not be passed to AI (P13)' };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Gym AI capped at L2' };
  return { allowed: true };
}

export interface GymFitnessProfile {
  id: string; workspaceId: string; tenantId: string; gymName: string; cacRc: string | null;
  nfscnCert: string | null; gymType: string; status: GymFitnessFSMState; createdAt: number; updatedAt: number;
}
export interface CreateGymFitnessInput {
  id?: string; workspaceId: string; tenantId: string; gymName: string; gymType?: string;
  cacRc?: string; nfscnCert?: string;
}
export interface GymMembership {
  id: string; profileId: string; tenantId: string; memberRefId: string;
  membershipType: MembershipType; feeKobo: number; startDate: number; endDate: number | null;
  status: MembershipStatus; createdAt: number; updatedAt: number;
}
export interface GymEquipment {
  id: string; profileId: string; tenantId: string; equipmentName: string; category: string | null;
  purchaseCostKobo: number; purchaseDate: number | null; maintenanceDue: number | null;
  condition: EquipmentCondition; createdAt: number; updatedAt: number;
}
export interface GymClassSchedule {
  id: string; profileId: string; tenantId: string; className: string; trainerRef: string | null;
  dayOfWeek: number; startTime: number; durationMinutes: number; capacity: number;
  feeKobo: number; createdAt: number; updatedAt: number;
}
