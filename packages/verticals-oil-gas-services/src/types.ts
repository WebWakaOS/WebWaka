/**
 * @webwaka/verticals-oil-gas-services — Domain types (M12)
 * FSM: seeded → claimed → ncdmb_certified → dpr_registered → active → suspended (two regulatory gates)
 * AI: L2 — BILLING_FORECAST; no client_ref_id (P13)
 * P9: contract_value_kobo as INTEGER (64-bit) — NO REAL/FLOAT columns
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 * KYC: Tier 3 mandatory
 * local_content_pct_x100: percentage ×100 (e.g. 55% = 5500)
 */

export type OilGasServicesFSMState = 'seeded' | 'claimed' | 'ncdmb_certified' | 'dpr_registered' | 'active' | 'suspended';
export type ContractStatus = 'bid' | 'awarded' | 'mobilising' | 'active' | 'completed' | 'terminated';

const FSM_TRANSITIONS: Record<OilGasServicesFSMState, OilGasServicesFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['ncdmb_certified'],
  ncdmb_certified: ['dpr_registered'],
  dpr_registered: ['active'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidOilGasServicesTransition(from: OilGasServicesFSMState, to: OilGasServicesFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardClaimedToNcdmbCertified(input: { ncdmbCert: string | null }): GuardResult {
  if (!input.ncdmbCert?.trim()) return { allowed: false, reason: 'NCDMB certification required' };
  return { allowed: true };
}
export function guardNcdmbToDprRegistered(input: { dprRegistration: string | null }): GuardResult {
  if (!input.dprRegistration?.trim()) return { allowed: false, reason: 'DPR/NUPRC registration required' };
  return { allowed: true };
}
export function guardNoRealColumns(input: { usesFloatValue?: boolean }): GuardResult {
  if (input.usesFloatValue) return { allowed: false, reason: 'Oil & gas contracts: all values must be INTEGER kobo — no REAL/float columns (P9 critical)' };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Oil & gas services AI capped at L2' };
  return { allowed: true };
}
export function guardTier3Kyc(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 3) return { allowed: false, reason: 'Oil & gas services requires Tier 3 KYC' };
  return { allowed: true };
}

export interface OilGasServicesProfile {
  id: string; workspaceId: string; tenantId: string; companyName: string; ncdmbCert: string | null;
  dprRegistration: string | null; cacRc: string | null; serviceCategory: string;
  status: OilGasServicesFSMState; createdAt: number; updatedAt: number;
}
export interface CreateOilGasServicesInput {
  id?: string; workspaceId: string; tenantId: string; companyName: string; serviceCategory?: string;
  ncdmbCert?: string; dprRegistration?: string; cacRc?: string;
}
export interface OilGasContract {
  id: string; profileId: string; tenantId: string; clientRefId: string; contractTitle: string;
  contractValueKobo: number; localContentPctX100: number; startDate: number; endDate: number | null;
  mobilisationKobo: number; invoicedKobo: number; status: ContractStatus; createdAt: number; updatedAt: number;
}
export interface OilGasHseLog {
  id: string; profileId: string; tenantId: string; logDate: number; incidentCount: number;
  nearMissCount: number; manHours: number; ltifrX1000: number; notes: string | null; createdAt: number;
}
export interface OilGasNcdmbReport {
  id: string; profileId: string; tenantId: string; contractId: string; reportPeriod: string;
  localContentPctX100: number; nigerianStaffCount: number; expatriateStaffCount: number;
  localSpendKobo: number; createdAt: number;
}
