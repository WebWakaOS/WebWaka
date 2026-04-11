/**
 * @webwaka/verticals-funeral-home — types + FSM guards (M12)
 * FSM: seeded → claimed → mortuary_verified → active → suspended
 * L3 HITL MANDATORY for ALL AI calls
 * P13 CRITICAL: case_ref_id is opaque UUID — deceased identity NEVER stored or passed to AI
 * family_contact_phone used for billing reference only — never in AI payloads
 * P9: all monetary values in kobo integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for billing; Tier 3 for insurance-linked funeral cover management
 */

export type FuneralHomeFSMState =
  | 'seeded'
  | 'claimed'
  | 'mortuary_verified'
  | 'active'
  | 'suspended';

export type BurialType = 'christian' | 'muslim' | 'traditional' | 'other';
export type CaseStatus = 'active' | 'completed';
export type ServiceType = 'embalming' | 'casket' | 'hearse' | 'flowers' | 'venue' | 'burial_permit';

const FSM_TRANSITIONS: Record<FuneralHomeFSMState, FuneralHomeFSMState[]> = {
  seeded:            ['claimed'],
  claimed:           ['mortuary_verified'],
  mortuary_verified: ['active'],
  active:            ['suspended'],
  suspended:         ['active'],
};

export function isValidFuneralHomeTransition(from: FuneralHomeFSMState, to: FuneralHomeFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToMortuaryVerified(input: { stateMortuaryPermit: string | null }): GuardResult {
  if (!input.stateMortuaryPermit || input.stateMortuaryPermit.trim() === '') {
    return { allowed: false, reason: 'State mortuary permit required to verify funeral home' };
  }
  return { allowed: true };
}

export function guardL3HitlRequired(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel !== 'L3_HITL' && input.autonomyLevel !== 3) {
    return { allowed: false, reason: 'L3 HITL mandatory for ALL funeral home AI calls — deceased data protection' };
  }
  return { allowed: true };
}

export function guardNoDeceasedDataInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = [
    'case_ref_id', 'caseRefId', 'family_contact_phone', 'familyContactPhone',
    'burial_type', 'burialType', 'date_of_passing', 'dateOfPassing',
  ];
  for (const key of forbidden) {
    if (key in payload) {
      return { allowed: false, reason: `P13: deceased/case data key "${key}" must NEVER pass to AI` };
    }
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardOpaqueCaseRefId(caseRefId: string): GuardResult {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(caseRefId)) {
    return { allowed: false, reason: 'case_ref_id must be an opaque UUID — no deceased identity allowed' };
  }
  return { allowed: true };
}

export interface FuneralHomeProfile {
  id: string; workspaceId: string; tenantId: string;
  businessName: string; stateMortuaryPermit: string | null;
  lgBurialPermit: string | null; cacRc: string | null;
  status: FuneralHomeFSMState; createdAt: number; updatedAt: number;
}

export interface FuneralCase {
  id: string; profileId: string; tenantId: string;
  caseRefId: string; familyContactPhone: string; burialType: BurialType;
  dateOfPassing: number; burialDate: number | null;
  totalKobo: number; depositKobo: number; balanceKobo: number;
  burialPermitRef: string | null; status: CaseStatus; createdAt: number; updatedAt: number;
}

export interface FuneralService {
  id: string; profileId: string; tenantId: string;
  caseRefId: string; serviceType: ServiceType; costKobo: number; createdAt: number;
}

export interface CreateFuneralHomeInput {
  id?: string; workspaceId: string; tenantId: string;
  businessName: string; stateMortuaryPermit?: string; lgBurialPermit?: string; cacRc?: string;
}

export interface CreateCaseInput {
  id?: string; profileId: string; tenantId: string;
  caseRefId: string; familyContactPhone: string; burialType: BurialType;
  dateOfPassing: number; burialDate?: number; totalKobo: number; depositKobo?: number;
  burialPermitRef?: string;
}

export interface CreateServiceInput {
  id?: string; profileId: string; tenantId: string;
  caseRefId: string; serviceType: ServiceType; costKobo: number;
}
