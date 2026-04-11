/**
 * @webwaka/verticals-tax-consultant — types + FSM guards (M12)
 * FSM: seeded → claimed → firs_verified → active → suspended
 * L3 HITL MANDATORY for ALL AI calls (tax advice output)
 * P13: client_ref_id opaque; TIN/liability NEVER to AI (tax privilege)
 * P9: all monetary values in kobo integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for professional billing; Tier 3 for client fund management above ₦10M
 */

export type TaxConsultantFSMState =
  | 'seeded'
  | 'claimed'
  | 'firs_verified'
  | 'active'
  | 'suspended';

export type TaxType = 'VAT' | 'CIT' | 'PAYE' | 'WHT' | 'SDL';
export type TaxFileStatus = 'pending' | 'filed' | 'assessed' | 'paid' | 'appealed';

const FSM_TRANSITIONS: Record<TaxConsultantFSMState, TaxConsultantFSMState[]> = {
  seeded:       ['claimed'],
  claimed:      ['firs_verified'],
  firs_verified: ['active'],
  active:       ['suspended'],
  suspended:    ['active'],
};

export function isValidTaxConsultantTransition(from: TaxConsultantFSMState, to: TaxConsultantFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToFirsVerified(input: { firsTaxAgentCert: string | null }): GuardResult {
  if (!input.firsTaxAgentCert || input.firsTaxAgentCert.trim() === '') {
    return { allowed: false, reason: 'FIRS tax agent certificate required to verify tax consultant' };
  }
  return { allowed: true };
}

export function guardL3HitlRequired(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel !== 'L3_HITL' && input.autonomyLevel !== 3) {
    return { allowed: false, reason: 'L3 HITL mandatory for ALL tax consultant AI calls — tax privilege protection' };
  }
  return { allowed: true };
}

export function guardNoTaxPrivilegeDataInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = [
    'client_ref_id', 'clientRefId', 'firs_tin', 'firsTin', 'tin',
    'liability_kobo', 'liabilityKobo', 'firs_ref', 'firsRef',
  ];
  for (const key of forbidden) {
    if (key in payload) {
      return { allowed: false, reason: `P13 TAX PRIVILEGE: field "${key}" must NEVER pass to AI` };
    }
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface TaxConsultantProfile {
  id: string; workspaceId: string; tenantId: string;
  firmName: string; firsTaxAgentCert: string | null; citnMembership: string | null; cacRc: string | null;
  status: TaxConsultantFSMState; createdAt: number; updatedAt: number;
}

export interface TaxClientFile {
  id: string; profileId: string; tenantId: string;
  clientRefId: string; taxType: TaxType; firsTin: string; filingPeriod: string;
  liabilityKobo: number; filedDate: number | null; firsRef: string | null;
  status: TaxFileStatus; createdAt: number; updatedAt: number;
}

export interface TaxRemittance {
  id: string; profileId: string; tenantId: string;
  clientRefId: string; taxType: TaxType; period: string;
  amountKobo: number; remittanceDate: number; bankRef: string | null; createdAt: number;
}

export interface TaxBilling {
  id: string; profileId: string; tenantId: string;
  clientRefId: string; period: string; professionalFeeKobo: number; paidKobo: number; createdAt: number;
}

export interface CreateTaxConsultantInput {
  id?: string; workspaceId: string; tenantId: string;
  firmName: string; firsTaxAgentCert?: string; citnMembership?: string; cacRc?: string;
}

export interface CreateTaxFileInput {
  id?: string; profileId: string; tenantId: string;
  clientRefId: string; taxType: TaxType; firsTin: string; filingPeriod: string; liabilityKobo: number;
}

export interface CreateRemittanceInput {
  id?: string; profileId: string; tenantId: string;
  clientRefId: string; taxType: TaxType; period: string;
  amountKobo: number; remittanceDate: number; bankRef?: string;
}

export interface CreateTaxBillingInput {
  id?: string; profileId: string; tenantId: string;
  clientRefId: string; period: string; professionalFeeKobo: number; paidKobo?: number;
}
