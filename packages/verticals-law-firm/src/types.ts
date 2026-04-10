/**
 * @webwaka/verticals-law-firm — types + FSM guards (M9)
 * FSM: seeded → claimed → nba_verified → active → suspended
 * CRITICAL: L3 HITL MANDATORY for ALL AI calls — legal privilege absolute
 * P13 ABSOLUTE: client matter data, case strategy, privileged communications NEVER to AI
 * matter_ref_id is opaque UUID — no client identity in any column
 * Time billing: integer minutes × rate_per_hour_kobo
 * P9: all monetary values in kobo integers; time in integer minutes
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for fee collection; Tier 3 for client fund management (EFCC)
 */

export type LawFirmFSMState =
  | 'seeded'
  | 'claimed'
  | 'nba_verified'
  | 'active'
  | 'suspended';

export type MatterType = 'litigation' | 'transaction' | 'advisory' | 'criminal' | 'family';
export type BillingType = 'retainer' | 'hourly' | 'fixed' | 'contingency';
export type MatterStatus = 'active' | 'closed' | 'archived';
export type CourtType = 'FHC' | 'SHC' | 'Appeal' | 'Magistrate';

const FSM_TRANSITIONS: Record<LawFirmFSMState, LawFirmFSMState[]> = {
  seeded:      ['claimed'],
  claimed:     ['nba_verified'],
  nba_verified: ['active'],
  active:      ['suspended'],
  suspended:   ['active'],
};

export function isValidLawFirmTransition(from: LawFirmFSMState, to: LawFirmFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNbaVerified(input: { nbaFirmRegistration: string | null }): GuardResult {
  if (!input.nbaFirmRegistration || input.nbaFirmRegistration.trim() === '') {
    return { allowed: false, reason: 'NBA firm registration required to verify law firm' };
  }
  return { allowed: true };
}

export function guardL3HitlRequired(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel !== 'L3_HITL' && input.autonomyLevel !== 3) {
    return { allowed: false, reason: 'L3 HITL mandatory for ALL law firm AI calls — legal privilege protection' };
  }
  return { allowed: true };
}

export function guardLegalPrivilege(payload: Record<string, unknown>): GuardResult {
  const forbidden = [
    'matter_ref_id', 'matterRefId', 'client_name', 'clientName',
    'case_details', 'caseDetails', 'fee_earner_ref_id', 'feeEarnerRefId',
    'matter_type', 'matterType',
  ];
  for (const key of forbidden) {
    if (key in payload) {
      return { allowed: false, reason: `P13 LEGAL PRIVILEGE: field "${key}" must never pass to AI — absolute protection` };
    }
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardIntegerMinutes(minutes: number): GuardResult {
  if (!Number.isInteger(minutes) || minutes <= 0) return { allowed: false, reason: 'Time billing: minutes must be a positive integer' };
  return { allowed: true };
}

export function guardOpaqueMatterRefId(matterRefId: string): GuardResult {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(matterRefId)) {
    return { allowed: false, reason: 'matter_ref_id must be an opaque UUID — no client identifiers allowed' };
  }
  return { allowed: true };
}

export interface LawFirmProfile {
  id: string; workspaceId: string; tenantId: string;
  firmName: string; nbaFirmRegistration: string | null; nbaBranch: string | null;
  njcAffiliated: boolean; cacRc: string | null;
  status: LawFirmFSMState; createdAt: number; updatedAt: number;
}

export interface LegalMatter {
  id: string; profileId: string; tenantId: string;
  matterRefId: string; matterType: MatterType; billingType: BillingType;
  agreedFeeKobo: number; status: MatterStatus; createdAt: number; updatedAt: number;
}

export interface LegalTimeEntry {
  id: string; profileId: string; tenantId: string;
  matterRefId: string; feeEarnerRefId: string; timeMinutes: number;
  ratePerHourKobo: number; amountKobo: number; entryDate: number; createdAt: number;
}

export interface LegalCourtCalendar {
  id: string; profileId: string; tenantId: string;
  matterRefId: string; courtDate: number; courtName: string;
  courtType: CourtType; hearingType: string; createdAt: number;
}

export interface LegalInvoice {
  id: string; profileId: string; tenantId: string;
  matterRefId: string; invoiceNumber: string; totalKobo: number;
  paidKobo: number; outstandingKobo: number; issuedDate: number; createdAt: number;
}

export interface CreateLawFirmInput {
  id?: string; workspaceId: string; tenantId: string;
  firmName: string; nbaFirmRegistration?: string; nbaBranch?: string;
  njcAffiliated?: boolean; cacRc?: string;
}

export interface CreateMatterInput {
  id?: string; profileId: string; tenantId: string;
  matterRefId: string; matterType: MatterType; billingType: BillingType; agreedFeeKobo: number;
}

export interface CreateTimeEntryInput {
  id?: string; profileId: string; tenantId: string;
  matterRefId: string; feeEarnerRefId: string; timeMinutes: number;
  ratePerHourKobo: number; amountKobo: number; entryDate: number;
}

export interface CreateCourtCalendarInput {
  id?: string; profileId: string; tenantId: string;
  matterRefId: string; courtDate: number; courtName: string; courtType: CourtType; hearingType: string;
}

export interface CreateLegalInvoiceInput {
  id?: string; profileId: string; tenantId: string;
  matterRefId: string; invoiceNumber: string; totalKobo: number; paidKobo?: number; issuedDate: number;
}
