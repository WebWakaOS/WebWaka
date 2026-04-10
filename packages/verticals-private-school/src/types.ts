/**
 * @webwaka/verticals-private-school — types + FSM guards (M12)
 * FSM: seeded → claimed → subeb_verified → active → suspended
 * P13: student_ref_id opaque UUID; no individual grades to AI (aggregate only)
 * P9: all kobo values must be integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for term fee collection; Tier 3 for payroll above ₦10M/term
 */

export type PrivateSchoolFSMState =
  | 'seeded'
  | 'claimed'
  | 'subeb_verified'
  | 'active'
  | 'suspended';

export type SchoolType = 'nursery' | 'primary' | 'secondary' | 'combined';
export type StudentStatus = 'active' | 'graduated' | 'withdrawn';

const FSM_TRANSITIONS: Record<PrivateSchoolFSMState, PrivateSchoolFSMState[]> = {
  seeded:         ['claimed'],
  claimed:        ['subeb_verified'],
  subeb_verified: ['active'],
  active:         ['suspended'],
  suspended:      ['active'],
};

export function isValidPrivateSchoolTransition(
  from: PrivateSchoolFSMState,
  to: PrivateSchoolFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToSubebVerified(input: {
  subebApproval: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.subebApproval) return { allowed: false, reason: 'SUBEB approval number required' };
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for SUBEB verification' };
  return { allowed: true };
}

export function guardKycForPayroll(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for payroll above ₦10M/term' };
  return { allowed: true };
}

export function guardP13StudentData(input: { payloadKeys: string[] }): GuardResult {
  const banned = ['student_name', 'student_grade', 'individual_score', 'exam_result', 'student_phone'];
  const violations = input.payloadKeys.filter(k => banned.some(b => k.toLowerCase().includes(b)));
  if (violations.length > 0) return { allowed: false, reason: `P13 violation: individual student data in AI payload: ${violations.join(', ')}` };
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface PrivateSchoolProfile {
  id: string; workspaceId: string; tenantId: string;
  schoolName: string; subebApproval: string | null; waecCentreNumber: string | null;
  necoCentreNumber: string | null; cacRc: string | null; schoolType: SchoolType;
  status: PrivateSchoolFSMState; createdAt: number; updatedAt: number;
}

export interface SchoolStudent {
  id: string; profileId: string; tenantId: string;
  studentRefId: string; classLevel: string; admissionDate: number | null;
  termFeeKobo: number; waecNecoRegNumber: string | null;
  status: StudentStatus; createdAt: number; updatedAt: number;
}

export interface SchoolFeesLog {
  id: string; profileId: string; tenantId: string;
  studentRefId: string; term: string;
  feeKobo: number; paidKobo: number; outstandingKobo: number;
  paymentDate: number | null; createdAt: number;
}

export interface SchoolTeacher {
  id: string; profileId: string; tenantId: string;
  teacherName: string; qualification: string | null;
  assignedClass: string | null; monthlySalaryKobo: number; createdAt: number; updatedAt: number;
}

export interface CreatePrivateSchoolInput {
  id?: string; workspaceId: string; tenantId: string;
  schoolName: string; subebApproval?: string; waecCentreNumber?: string;
  necoCentreNumber?: string; cacRc?: string; schoolType?: SchoolType;
}

export interface UpdatePrivateSchoolInput {
  schoolName?: string; subebApproval?: string | null;
  waecCentreNumber?: string | null; schoolType?: SchoolType;
}

export interface CreateStudentInput {
  id?: string; profileId: string; tenantId: string;
  studentRefId?: string; classLevel: string; admissionDate?: number; termFeeKobo: number;
}

export interface CreateFeesLogInput {
  id?: string; profileId: string; tenantId: string;
  studentRefId: string; term: string; feeKobo: number; paidKobo?: number; paymentDate?: number;
}

export interface CreateTeacherInput {
  id?: string; profileId: string; tenantId: string;
  teacherName: string; qualification?: string; assignedClass?: string; monthlySalaryKobo: number;
}
