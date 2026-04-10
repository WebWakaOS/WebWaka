/**
 * @webwaka/verticals-orphanage — Domain types (M12)
 * FSM: seeded → claimed → dss_licensed → active → suspended
 * AI: L3 HITL MANDATORY on ALL AI; aggregate population counts ONLY
 * P9: all monetary in kobo integers
 * P13 (ABSOLUTE): NO child PII; NO child_ref_id; aggregate counts ONLY
 * T3: tenant_id always present
 * KYC: Tier 1 (NGO)
 */

export type OrphanageFSMState = 'seeded' | 'claimed' | 'dss_licensed' | 'active' | 'suspended';
export type DonationType = 'cash' | 'kind' | 'food' | 'clothing' | 'medical';
export type ExpenseType = 'feeding' | 'medical' | 'education' | 'clothing' | 'utilities' | 'staffing';

const FSM_TRANSITIONS: Record<OrphanageFSMState, OrphanageFSMState[]> = {
  seeded: ['claimed'], claimed: ['dss_licensed'], dss_licensed: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidOrphanageTransition(from: OrphanageFSMState, to: OrphanageFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardClaimedToDssLicensed(input: { dssLicense: string | null }): GuardResult {
  if (!input.dssLicense?.trim()) return { allowed: false, reason: 'DSS (Department of Social Services) licence required' };
  return { allowed: true };
}
export function guardL3HitlMandatoryAll(_input: unknown): GuardResult {
  return { allowed: false, reason: 'Orphanage: ALL AI advisory requires L3 HITL (human-in-the-loop) mandatory review — no autonomous AI output' };
}
export function guardNoChildPiiToAi(input: { includesChildPii?: boolean }): GuardResult {
  if (input.includesChildPii) return { allowed: false, reason: 'NO child PII to AI — absolute rule (P13 hardest classification)' };
  return { allowed: true };
}
export function guardAiAggregateCountsOnly(input: { includesChildRef?: boolean }): GuardResult {
  if (input.includesChildRef) return { allowed: false, reason: 'AI input may only include aggregate population counts — no child_ref_id (P13 absolute)' };
  return { allowed: true };
}

export interface OrphanageProfile {
  id: string; workspaceId: string; tenantId: string; orgName: string; dssLicense: string | null;
  cacItCert: string | null; fmwsdReg: string | null; capacity: number;
  status: OrphanageFSMState; createdAt: number; updatedAt: number;
}
export interface CreateOrphanageInput {
  id?: string; workspaceId: string; tenantId: string; orgName: string; capacity?: number;
  dssLicense?: string; cacItCert?: string; fmwsdReg?: string;
}
export interface OrphanagePopulationSummary {
  id: string; profileId: string; tenantId: string; reportDate: number;
  totalChildren: number; age05: number; age612: number; age1318: number;
  genderMale: number; genderFemale: number; createdAt: number;
}
export interface OrphanageDonation {
  id: string; profileId: string; tenantId: string; donorRef: string;
  amountKobo: number; donationDate: number; donationType: DonationType; createdAt: number;
}
export interface OrphanageExpenditure {
  id: string; profileId: string; tenantId: string; expenseType: ExpenseType;
  amountKobo: number; expenseDate: number; notes: string | null; createdAt: number;
}
