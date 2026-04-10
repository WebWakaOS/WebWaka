/**
 * @webwaka/verticals-accounting-firm — types + FSM guards (M9)
 * FSM: seeded → claimed → ican_verified → active → suspended
 * AI: L2 cap — billing analytics aggregate only; no client financial data to AI (P13)
 * P9: all monetary values in kobo integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for professional billing; Tier 3 for client fund management
 */

export type AccountingFirmFSMState =
  | 'seeded'
  | 'claimed'
  | 'ican_verified'
  | 'active'
  | 'suspended';

export type EngagementType = 'audit' | 'tax' | 'advisory' | 'bookkeeping' | 'payroll';
export type EngagementStatus = 'active' | 'completed' | 'cancelled';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

const FSM_TRANSITIONS: Record<AccountingFirmFSMState, AccountingFirmFSMState[]> = {
  seeded:       ['claimed'],
  claimed:      ['ican_verified'],
  ican_verified: ['active'],
  active:       ['suspended'],
  suspended:    ['active'],
};

export function isValidAccountingFirmTransition(
  from: AccountingFirmFSMState,
  to: AccountingFirmFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToIcanVerified(input: { icanRegistration: string | null }): GuardResult {
  if (!input.icanRegistration || input.icanRegistration.trim() === '') {
    return { allowed: false, reason: 'ICAN or ANAN registration required to verify accounting firm' };
  }
  return { allowed: true };
}

export function guardKycForProfessionalBilling(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for professional fee billing' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'Accounting firm AI capped at L2 advisory — billing analytics only' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'Accounting firm AI capped at L2' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardNoClientDataInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = ['client_ref_id', 'clientRefId', 'engagement_id', 'firs_tin', 'tin'];
  for (const key of forbidden) {
    if (key in payload) return { allowed: false, reason: `P13: client financial data key "${key}" must not pass to AI` };
  }
  return { allowed: true };
}

export interface AccountingFirmProfile {
  id: string; workspaceId: string; tenantId: string;
  firmName: string; icanRegistration: string | null; ananRegistration: string | null;
  firsAgentCert: string | null; cacRc: string | null;
  status: AccountingFirmFSMState; createdAt: number; updatedAt: number;
}

export interface AccountingEngagement {
  id: string; profileId: string; tenantId: string;
  clientRefId: string; engagementType: EngagementType;
  engagementFeeKobo: number; startDate: number; endDate: number | null;
  status: EngagementStatus; createdAt: number; updatedAt: number;
}

export interface AccountingInvoice {
  id: string; profileId: string; tenantId: string;
  clientRefId: string; engagementId: string | null;
  invoiceNumber: string; amountKobo: number; paidKobo: number;
  outstandingKobo: number; issuedDate: number; dueDate: number | null;
  status: InvoiceStatus; createdAt: number;
}

export interface AccountingCpdLog {
  id: string; profileId: string; tenantId: string;
  memberRefId: string; cpdProvider: string; cpdHours: number;
  completionDate: number; createdAt: number;
}

export interface CreateAccountingFirmInput {
  id?: string; workspaceId: string; tenantId: string;
  firmName: string; icanRegistration?: string; ananRegistration?: string;
  firsAgentCert?: string; cacRc?: string;
}

export interface CreateEngagementInput {
  id?: string; profileId: string; tenantId: string;
  clientRefId: string; engagementType: EngagementType;
  engagementFeeKobo: number; startDate: number; endDate?: number;
}

export interface CreateInvoiceInput {
  id?: string; profileId: string; tenantId: string;
  clientRefId: string; engagementId?: string; invoiceNumber: string;
  amountKobo: number; paidKobo?: number; issuedDate: number; dueDate?: number;
}

export interface CreateCpdLogInput {
  id?: string; profileId: string; tenantId: string;
  memberRefId: string; cpdProvider: string; cpdHours: number; completionDate: number;
}
