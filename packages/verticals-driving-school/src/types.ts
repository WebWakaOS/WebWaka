/**
 * @webwaka/verticals-driving-school — types + FSM guards (M9)
 * FSM: seeded → claimed → frsc_verified → active → suspended
 * P13: student_ref_id is opaque UUID — student names never in AI prompts
 * P9: all kobo values must be integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 1 for enrolment fees; Tier 2 for fleet financing above ₦5M
 */

export type DrivingSchoolFSMState =
  | 'seeded'
  | 'claimed'
  | 'frsc_verified'
  | 'active'
  | 'suspended';

export type CourseType = 'car' | 'truck' | 'motorcycle';
export type LessonType = 'theory' | 'practical';
export type TestStatus = 'pending' | 'booked' | 'passed' | 'failed';
export type VehicleStatus = 'active' | 'maintenance';

const FSM_TRANSITIONS: Record<DrivingSchoolFSMState, DrivingSchoolFSMState[]> = {
  seeded:       ['claimed'],
  claimed:      ['frsc_verified'],
  frsc_verified: ['active'],
  active:       ['suspended'],
  suspended:    ['active'],
};

export function isValidDrivingSchoolTransition(
  from: DrivingSchoolFSMState,
  to: DrivingSchoolFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToFrscVerified(input: {
  frscRegistration: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.frscRegistration) return { allowed: false, reason: 'FRSC registration number required' };
  if (input.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required for FRSC verification' };
  return { allowed: true };
}

export function guardKycForFleetFinancing(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for fleet financing above ₦5M' };
  return { allowed: true };
}

export function guardP13StudentData(input: { payloadKeys: string[] }): GuardResult {
  const banned = ['student_name', 'student_phone', 'student_address', 'test_result_detail', 'personal_data'];
  const violations = input.payloadKeys.filter(k => banned.some(b => k.toLowerCase().includes(b)));
  if (violations.length > 0) return { allowed: false, reason: `P13 violation: student PII in AI payload: ${violations.join(', ')}` };
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface DrivingSchoolProfile {
  id: string; workspaceId: string; tenantId: string;
  schoolName: string; frscRegistration: string | null; state: string | null; cacRc: string | null;
  status: DrivingSchoolFSMState; createdAt: number; updatedAt: number;
}

export interface DsStudent {
  id: string; profileId: string; tenantId: string;
  studentRefId: string; courseType: CourseType; enrolmentFeeKobo: number;
  lessonsPaid: number; startDate: number | null; frscTestDate: number | null;
  testStatus: TestStatus; certIssued: boolean; createdAt: number; updatedAt: number;
}

export interface DsLesson {
  id: string; profileId: string; tenantId: string;
  studentRefId: string; instructorId: string; vehicleId: string;
  lessonDate: number; lessonType: LessonType; attended: boolean; createdAt: number;
}

export interface DsVehicle {
  id: string; profileId: string; tenantId: string;
  vehiclePlate: string; type: CourseType; purchaseCostKobo: number;
  lastServiceDate: number | null; status: VehicleStatus; createdAt: number; updatedAt: number;
}

export interface CreateDrivingSchoolInput {
  id?: string; workspaceId: string; tenantId: string;
  schoolName: string; frscRegistration?: string; state?: string; cacRc?: string;
}

export interface UpdateDrivingSchoolInput {
  schoolName?: string; frscRegistration?: string | null; state?: string | null; cacRc?: string | null;
}

export interface CreateStudentInput {
  id?: string; profileId: string; tenantId: string;
  studentRefId?: string; courseType?: CourseType; enrolmentFeeKobo: number; lessonsPaid?: number;
}

export interface CreateLessonInput {
  id?: string; profileId: string; tenantId: string;
  studentRefId: string; instructorId: string; vehicleId: string;
  lessonDate: number; lessonType?: LessonType;
}

export interface CreateVehicleInput {
  id?: string; profileId: string; tenantId: string;
  vehiclePlate: string; type?: CourseType; purchaseCostKobo: number;
}
