/**
 * @webwaka/verticals-govt-school — Domain types (M12)
 * FSM: seeded → claimed → subeb_verified → active → suspended
 * AI: L2 — ENGAGEMENT_PIPELINE_REPORT; aggregate enrollment trends only; no student IDs (P13)
 * P9: grant amounts in kobo integers
 * P13: NO individual student data — aggregate only; teacher_ref_id opaque
 * T3: tenant_id always present
 */

export type GovtSchoolFSMState = 'seeded' | 'claimed' | 'subeb_verified' | 'active' | 'suspended';
export type SchoolType = 'primary' | 'secondary' | 'both';
export type GrantSource = 'UBEC' | 'SUBEB' | 'state' | 'federal';

const FSM_TRANSITIONS: Record<GovtSchoolFSMState, GovtSchoolFSMState[]> = {
  seeded: ['claimed'], claimed: ['subeb_verified'], subeb_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidGovtSchoolTransition(from: GovtSchoolFSMState, to: GovtSchoolFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardClaimedToSubebVerified(input: { subebRef: string | null }): GuardResult {
  if (!input.subebRef?.trim()) return { allowed: false, reason: 'SUBEB registration required' };
  return { allowed: true };
}
export function guardNoStudentDataToAi(input: { includesStudentRef?: boolean }): GuardResult {
  if (input.includesStudentRef) return { allowed: false, reason: 'Student data must not be passed to AI — aggregate only (P13)' };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Government school AI capped at L2' };
  return { allowed: true };
}

export interface GovtSchoolProfile {
  id: string; workspaceId: string; tenantId: string; schoolName: string; subebRef: string | null;
  ubecRef: string | null; nemisId: string | null; schoolType: SchoolType;
  lga: string | null; state: string | null; status: GovtSchoolFSMState; createdAt: number; updatedAt: number;
}
export interface CreateGovtSchoolInput {
  id?: string; workspaceId: string; tenantId: string; schoolName: string; schoolType?: SchoolType;
  subebRef?: string; ubecRef?: string; nemisId?: string; lga?: string; state?: string;
  nesreaCert?: string;
  ministryRef?: string;
  schoolLevel?: string;
}
export interface SchoolClass {
  id: string; profileId: string; tenantId: string; className: string; teacherRefId: string | null;
  studentCount: number; genderMale: number; genderFemale: number; academicYear: string;
  createdAt: number; updatedAt: number;
}
export interface SchoolEnrollmentSummary {
  id: string; profileId: string; tenantId: string; academicYear: string;
  totalEnrolled: number; totalGraduated: number; totalDropout: number;
  averageAttendancePct: number; createdAt: number; updatedAt: number;
}
export interface SchoolCapitationGrant {
  id: string; profileId: string; tenantId: string; grantYear: string;
  grantAmountKobo: number; disbursementDate: number | null; utilisedKobo: number;
  grantSource: GrantSource; createdAt: number; updatedAt: number;
}
