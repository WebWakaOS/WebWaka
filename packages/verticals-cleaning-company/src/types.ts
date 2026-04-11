/**
 * @webwaka/verticals-cleaning-company — Domain types
 * M11 Commerce P3 — Task V-COMM-EXT-C5
 * Corporate FM segment (distinct from Set A cleaning-service)
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * KYC: Tier 2 for payroll ops; Tier 3 for govt contracts >₦5M
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 * P13: staff PII never passed to AI layer
 */

export type CleaningCompanyFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type ContractStatus = 'active' | 'paused' | 'expired';

export interface CleaningCompanyProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  cacRc: string | null;
  bppRegistration: string | null;
  fmenvCert: string | null;
  status: CleaningCompanyFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCleaningCompanyInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  cacRc?: string | undefined;
  bppRegistration?: string | undefined;
  fmenvCert?: string | undefined;
}

export interface UpdateCleaningCompanyInput {
  companyName?: string | undefined;
  cacRc?: string | null | undefined;
  bppRegistration?: string | null | undefined;
  fmenvCert?: string | null | undefined;
  status?: CleaningCompanyFSMState | undefined;
}

export interface FmContract {
  id: string;
  workspaceId: string;
  tenantId: string;
  clientName: string;
  clientPhone: string;
  sitesCount: number;
  monthlyFeeKobo: number;
  contractStart: number | null;
  contractEnd: number | null;
  status: ContractStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFmContractInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientName: string;
  clientPhone: string;
  sitesCount?: number | undefined;
  monthlyFeeKobo: number;
  contractStart?: number | undefined;
  contractEnd?: number | undefined;
}

export interface FmStaffDeployment {
  id: string;
  workspaceId: string;
  tenantId: string;
  contractId: string;
  staffName: string;
  siteName: string;
  shiftType: string | null;
  monthlySalaryKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFmStaffDeploymentInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  contractId: string;
  staffName: string;
  siteName: string;
  shiftType?: string | undefined;
  monthlySalaryKobo: number;
}

export interface FmSupply {
  id: string;
  workspaceId: string;
  tenantId: string;
  supplyName: string;
  quantity: number;
  unitCostKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFmSupplyInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  supplyName: string;
  quantity?: number | undefined;
  unitCostKobo: number;
}

export const VALID_CLEANING_COMPANY_TRANSITIONS: Record<CleaningCompanyFSMState, CleaningCompanyFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['cac_verified', 'suspended'],
  cac_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidCleaningCompanyTransition(from: CleaningCompanyFSMState, to: CleaningCompanyFSMState): boolean {
  return VALID_CLEANING_COMPANY_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim cleaning company profile' };
  return { allowed: true };
}

export function guardClaimedToCacVerified(ctx: { cacRc: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.cacRc) return { allowed: false, reason: 'CAC RC number required for cac_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for cac_verified transition' };
  return { allowed: true };
}
