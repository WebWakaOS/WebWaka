/**
 * @webwaka/verticals-training-institute — types + FSM guards (M9)
 * FSM: seeded → claimed → nbte_verified → active → suspended
 * P13: student_ref_id is opaque UUID — student names never in AI prompts
 * P9: all kobo values must be integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 1 for enrolment fees; Tier 2 for SIWES placement operations
 */

export type TrainingInstituteFSMState =
  | 'seeded'
  | 'claimed'
  | 'nbte_verified'
  | 'active'
  | 'suspended';

const FSM_TRANSITIONS: Record<TrainingInstituteFSMState, TrainingInstituteFSMState[]> = {
  seeded:       ['claimed'],
  claimed:      ['nbte_verified'],
  nbte_verified: ['active'],
  active:       ['suspended'],
  suspended:    ['active'],
};

export function isValidTrainingInstituteTransition(
  from: TrainingInstituteFSMState,
  to: TrainingInstituteFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNbteVerified(input: {
  nbteAccreditation: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.nbteAccreditation) return { allowed: false, reason: 'NBTE accreditation number required' };
  if (input.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required for NBTE verification' };
  return { allowed: true };
}

export function guardKycForSiwes(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for SIWES placement operations' };
  return { allowed: true };
}

export function guardP13StudentData(input: { payloadKeys: string[] }): GuardResult {
  const banned = ['student_name', 'student_phone', 'student_address', 'exam_score', 'individual_grade', 'individual_score'];
  const violations = input.payloadKeys.filter(k => banned.some(b => k.toLowerCase().includes(b)));
  if (violations.length > 0) return { allowed: false, reason: `P13 violation: student PII in AI payload: ${violations.join(', ')}` };
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface TrainingInstituteProfile {
  id: string; workspaceId: string; tenantId: string;
  instituteName: string; nbteAccreditation: string | null; itfRegistration: string | null;
  nabtebCentreNumber: string | null; cacRc: string | null;
  status: TrainingInstituteFSMState; createdAt: number; updatedAt: number;
}

export interface TiCourse {
  id: string; profileId: string; tenantId: string;
  courseName: string; tradeArea: string | null; durationWeeks: number;
  courseFeeKobo: number; nbteApprovalNumber: string | null; createdAt: number; updatedAt: number;
}

export interface TiStudent {
  id: string; profileId: string; tenantId: string;
  studentRefId: string; courseId: string; enrolmentDate: number | null;
  enrolmentFeeKobo: number; examFeeKobo: number; nabtebRegNumber: string | null;
  siwesPlacement: boolean; certIssued: boolean; createdAt: number; updatedAt: number;
}

export interface TiTrainer {
  id: string; profileId: string; tenantId: string;
  trainerName: string; qualification: string | null;
  assignedCourses: string | null; createdAt: number; updatedAt: number;
}

export interface CreateTrainingInstituteInput {
  id?: string; workspaceId: string; tenantId: string;
  instituteName: string; nbteAccreditation?: string; itfRegistration?: string;
  nabtebCentreNumber?: string; cacRc?: string;
}

export interface UpdateTrainingInstituteInput {
  instituteName?: string; nbteAccreditation?: string | null;
  itfRegistration?: string | null; nabtebCentreNumber?: string | null;
}

export interface CreateCourseInput {
  id?: string; profileId: string; tenantId: string;
  courseName: string; tradeArea?: string; durationWeeks: number;
  courseFeeKobo: number; nbteApprovalNumber?: string;
}

export interface CreateStudentInput {
  id?: string; profileId: string; tenantId: string;
  studentRefId?: string; courseId: string; enrolmentFeeKobo: number; examFeeKobo?: number;
  nabtebRegNumber?: string;
}

export interface CreateTrainerInput {
  id?: string; profileId: string; tenantId: string;
  trainerName: string; qualification?: string; assignedCourses?: string;
}
