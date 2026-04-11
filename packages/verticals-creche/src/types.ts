/**
 * @webwaka/verticals-creche — types + FSM guards (M12)
 * FSM: seeded → claimed → subeb_verified → active → suspended
 * P13: child_ref_id is opaque UUID — MOST SENSITIVE data type; NO child PII ever to AI
 * L3 HITL MANDATORY for ALL AI calls — child data requires human review
 * P9: all kobo values must be integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for monthly billing
 */

export type CrecheFSMState =
  | 'seeded'
  | 'claimed'
  | 'subeb_verified'
  | 'active'
  | 'suspended';

const FSM_TRANSITIONS: Record<CrecheFSMState, CrecheFSMState[]> = {
  seeded:         ['claimed'],
  claimed:        ['subeb_verified'],
  subeb_verified: ['active'],
  active:         ['suspended'],
  suspended:      ['active'],
};

export function isValidCrecheTransition(
  from: CrecheFSMState,
  to: CrecheFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToSubebVerified(input: {
  subebRegistration: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.subebRegistration) return { allowed: false, reason: 'SUBEB registration number required' };
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for SUBEB verification' };
  return { allowed: true };
}

export function guardL3HitlRequired(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel !== 'L3_HITL' && input.autonomyLevel !== 3) {
    return { allowed: false, reason: 'L3 HITL mandatory for all AI calls on child data (creche)' };
  }
  return { allowed: true };
}

export function guardP13ChildData(input: { payloadKeys: string[] }): GuardResult {
  const banned = ['child_name', 'child_age', 'child_address', 'parent_name', 'developmental_notes', 'medical_notes'];
  const violations = input.payloadKeys.filter(k => banned.some(b => k.toLowerCase().includes(b)));
  if (violations.length > 0) return { allowed: false, reason: `P13 violation: child PII in AI payload: ${violations.join(', ')}` };
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface CrecheProfile {
  id: string; workspaceId: string; tenantId: string;
  crecheName: string; subebRegistration: string | null; stateSocialWelfareCert: string | null;
  cacRc: string | null; capacity: number;
  status: CrecheFSMState; createdAt: number; updatedAt: number;
}

export interface CrecheChild {
  id: string; profileId: string; tenantId: string;
  childRefId: string; ageMonths: number; admissionDate: number | null;
  monthlyFeeKobo: number; status: string; createdAt: number; updatedAt: number;
}

export interface CrecheAttendance {
  id: string; profileId: string; tenantId: string;
  childRefId: string; attendanceDate: number; present: boolean; createdAt: number;
}

export interface CrecheBilling {
  id: string; profileId: string; tenantId: string;
  childRefId: string; billingPeriod: string;
  feeKobo: number; paidKobo: number; outstandingKobo: number; createdAt: number; updatedAt: number;
}

export interface CreateCrecheInput {
  id?: string; workspaceId: string; tenantId: string;
  crecheName: string; subebRegistration?: string; stateSocialWelfareCert?: string;
  cacRc?: string; capacity?: number;
}

export interface UpdateCrecheInput {
  crecheName?: string; subebRegistration?: string | null;
  stateSocialWelfareCert?: string | null; capacity?: number;
}

export interface CreateChildInput {
  id?: string; profileId: string; tenantId: string;
  childRefId?: string; ageMonths: number; admissionDate?: number; monthlyFeeKobo: number;
}

export interface CreateAttendanceInput {
  id?: string; profileId: string; tenantId: string;
  childRefId: string; attendanceDate: number; present?: boolean;
}

export interface CreateBillingInput {
  id?: string; profileId: string; tenantId: string;
  childRefId: string; billingPeriod: string; feeKobo: number; paidKobo?: number;
}
