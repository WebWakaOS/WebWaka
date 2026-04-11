/**
 * @webwaka/verticals-land-surveyor — Domain types (M11)
 * FSM: seeded → claimed → surcon_verified → active → suspended
 * AI: L2 max; L3 HITL if output adjacent to land identity data
 * P9: all monetary in kobo integers
 * P13: client_ref_id, title_ref (land parcel identity) opaque — NEVER to AI
 * T3: tenant_id always present
 * KYC: Tier 2 for fees; Tier 3 for government registry above ₦5M
 */

export type LandSurveyorFSMState = 'seeded' | 'claimed' | 'surcon_verified' | 'active' | 'suspended';
export type SurveyType = 'boundary' | 'topographic' | 'cadastral' | 'subdivision' | 'beacon_renewal';
export type SurveyJobStatus = 'enquiry' | 'site_visit' | 'surveying' | 'computation' | 'report' | 'delivered';

const FSM_TRANSITIONS: Record<LandSurveyorFSMState, LandSurveyorFSMState[]> = {
  seeded: ['claimed'], claimed: ['surcon_verified'], surcon_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidLandSurveyorTransition(from: LandSurveyorFSMState, to: LandSurveyorFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardClaimedToSurconVerified(input: { surconLicence: string | null }): GuardResult {
  if (!input.surconLicence?.trim()) return { allowed: false, reason: 'SURCON licence required' };
  return { allowed: true };
}
export function guardNoLandIdentityToAi(input: { includesTitleRef?: boolean; includesClientRef?: boolean }): GuardResult {
  if (input.includesTitleRef || input.includesClientRef)
    return { allowed: false, reason: 'Title ref / client ref (land identity) must not go to AI (P13) — requires L3 HITL' };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Land surveyor AI capped at L2' };
  return { allowed: true };
}

export interface LandSurveyorProfile {
  id: string; workspaceId: string; tenantId: string; companyName?: string; surconLicence?: string | null;
  cacRc: string | null; specialisation?: string; status: LandSurveyorFSMState; createdAt: number; updatedAt: number;
  businessName?: string;
  surconReg?: string | null;
  state?: string | null;
  lga?: string | null;
}
export interface CreateLandSurveyorInput {
  id?: string; workspaceId: string; tenantId: string; companyName?: string; specialisation?: string;
  surconLicence?: string; cacRc?: string;
  businessName?: string;
  lga?: string;
  surconReg?: string;
  state?: string;
}
export interface SurveyJob {
  id: string; profileId: string; tenantId: string; clientRefId: string; titleRef?: string | null;
  surveyType: SurveyType; location?: string | null; professionalFeeKobo?: number;
  disbursementKobo?: number; totalKobo?: number; jobDate: number; completedDate: number | null;
  status: SurveyJobStatus; createdAt: number; updatedAt: number;
  landRefId?: string;
  locationState?: string;
  locationLga?: string | null;
  feePaidKobo?: number;
}
export interface SurveyEquipment {
  id: string; profileId: string; tenantId: string; equipmentName: string; model: string | null;
  purchaseCostKobo: number; purchaseDate: number | null; calibrationDue: number | null;
  status: string; createdAt: number; updatedAt: number;
}

export interface SurveyPlan {
  id: string; profileId?: string; tenantId: string; surveyJobId?: string;
  planNumber?: string; planDate?: number; status?: string; createdAt: number;
  jobId?: string;
  beaconCount?: number;
  areaSqmX100?: number;
  sealDate?: number | null;
  bearingNotes?: string | null;
}
