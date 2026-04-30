/**
 * @webwaka/verticals-gym — Domain types (canonical)
 *
 * Canonical slug: `gym` (per vertical-duplicates-and-merge-decisions.md, decision M1)
 * Deprecated alias: `gym-fitness` (routed here via synonym map)
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 — VENUE_UTILIZATION_REPORT; aggregate membership counts only; no member_ref_id (P13)
 * P9: all monetary in kobo integers
 * P13: member_ref_id opaque; health metrics (weight/height) NEVER to AI
 * T3: tenant_id always present
 */

export type GymFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type GymFitnessFSMState = GymFSMState; // Alias for backward compat with gym-fitness imports
export type MembershipType = 'daily' | 'monthly' | 'quarterly' | 'annual';
export type MembershipStatus = 'active' | 'expired' | 'paused' | 'cancelled';
export type EquipmentCondition = 'good' | 'fair' | 'poor' | 'decommissioned';

const FSM_TRANSITIONS: Record<GymFSMState, GymFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['cac_verified'],
  cac_verified: ['active'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidGymTransition(from: GymFSMState, to: GymFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Alias for backward compat with @webwaka/verticals-gym-fitness imports */
export const isValidGymFitnessTransition = isValidGymTransition;

export const VALID_GYM_TRANSITIONS: Array<[GymFSMState, GymFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'cac_verified'],
  ['cac_verified', 'active'],
  ['active', 'suspended'],
  ['suspended', 'active'],
];

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardNoHealthMetricsToAi(input: { includesHealthMetrics?: boolean }): GuardResult {
  if (input.includesHealthMetrics) return { allowed: false, reason: 'Health metrics (weight/height) must not be passed to AI (P13)' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Gym AI capped at L2' };
  return { allowed: true };
}

export interface GymProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  businessName: string;
  gymName?: string;
  cacRc: string | null;
  nasfcCert: string | null;
  nfscnCert?: string | null;
  gymType?: string;
  capacity?: number;
  status: GymFSMState;
  createdAt: number;
  updatedAt: number;
}

/** Alias for backward compat with @webwaka/verticals-gym-fitness imports */
export type GymFitnessProfile = GymProfile;

export interface CreateGymInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  businessName?: string;
  gymName?: string;
  gymType?: string;
  cacRc?: string;
  nasfcCert?: string;
  nfscnCert?: string;
  capacity?: number;
}

/** Alias for backward compat */
export type CreateGymFitnessInput = CreateGymInput;

export interface GymMembership {
  id: string;
  profileId: string;
  tenantId: string;
  memberRefId: string;
  plan: string;
  membershipType?: MembershipType;
  monthlyFeeKobo: number;
  feeKobo?: number;
  startDate: number;
  endDate: number | null;
  status: MembershipStatus;
  createdAt: number;
  updatedAt: number;
}

export interface GymEquipment {
  id: string;
  profileId: string;
  tenantId: string;
  equipmentName: string;
  category: string | null;
  purchaseCostKobo: number;
  purchaseDate: number | null;
  maintenanceDue: number | null;
  condition: EquipmentCondition;
  createdAt: number;
  updatedAt: number;
}

export interface GymClassSchedule {
  id: string;
  profileId: string;
  tenantId: string;
  className: string;
  trainerRef: string | null;
  dayOfWeek: number;
  startTime: number;
  durationMinutes: number;
  capacity: number;
  feeKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface GymSession {
  id: string;
  profileId: string;
  tenantId: string;
  memberRefId: string;
  sessionDate: number;
  durationMinutes: number;
  sessionType: string;
  trainerRefId: string | null;
  createdAt: number;
}

export interface GymEquipmentLog {
  id: string;
  profileId: string;
  tenantId: string;
  equipmentName: string;
  maintenanceDate: number;
  notes: string | null;
  costKobo: number;
  createdAt: number;
}

export interface UpdateGymInput {
  displayName?: string | undefined;
  status?: GymFSMState | undefined;
}
