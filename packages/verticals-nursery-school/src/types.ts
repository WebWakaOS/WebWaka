/**
 * @webwaka/verticals-nursery-school — Domain types (M12)
 * FSM: seeded → claimed → subeb_registered → active → suspended
 * AI: HIGHEST P13 — age bracket aggregate counts ONLY; NO child_ref_id ANYWHERE
 * P9: fee amounts in kobo integers
 * P13 (ABSOLUTE): no individual child data; no child_ref_id; age bracket aggregates only
 * T3: tenant_id always present
 */

export type NurserySchoolFSMState = 'seeded' | 'claimed' | 'subeb_registered' | 'active' | 'suspended';
export type FeeType = 'registration' | 'monthly' | 'termly';

const FSM_TRANSITIONS: Record<NurserySchoolFSMState, NurserySchoolFSMState[]> = {
  seeded: ['claimed'], claimed: ['subeb_registered'], subeb_registered: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidNurserySchoolTransition(from: NurserySchoolFSMState, to: NurserySchoolFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardNoChildDataToAi(input: { includesChildData?: boolean }): GuardResult {
  if (input.includesChildData) return { allowed: false, reason: 'NO child data of any kind to AI (P13 absolute — nursery/crèche hardest rule)' };
  return { allowed: true };
}
export function guardAiAggregateBracketsOnly(input: { includesChildRef?: boolean; includesIndividualData?: boolean }): GuardResult {
  if (input.includesChildRef || input.includesIndividualData)
    return { allowed: false, reason: 'AI input must only include age bracket aggregate counts — no child_ref_id, no individual rows (P13)' };
  return { allowed: true };
}

export interface NurserySchoolProfile {
  id: string; workspaceId: string; tenantId: string; schoolName: string; subebReg: string | null;
  lgaEduCert: string | null; proprietorRef: string | null; capacity: number;
  status: NurserySchoolFSMState; createdAt: number; updatedAt: number;
}
export interface CreateNurserySchoolInput {
  id?: string; workspaceId: string; tenantId: string; schoolName: string; capacity?: number;
  subebReg?: string; lgaEduCert?: string; proprietorRef?: string;
  nesCert?: string;
  siwesRef?: string;
  cacScn?: string;
  state?: string;
  lga?: string;
}
export interface NurseryEnrollmentSummary {
  id: string; profileId: string; tenantId: string; term: string;
  ageBracket02: number; ageBracket24: number; ageBracket46: number;
  totalEnrolled: number; totalGraduated: number; createdAt: number; updatedAt: number;
}
export interface NurseryFee {
  id: string; profileId: string; tenantId: string; feeType: FeeType;
  amountKobo: number; academicYear: string; createdAt: number; updatedAt: number;
}
export interface NurseryActivity {
  id: string; profileId: string; tenantId: string; activityDate: number; activityType: string;
  participantCount: number; createdAt: number;
}
