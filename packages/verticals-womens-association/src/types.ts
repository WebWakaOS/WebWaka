/**
 * @webwaka/verticals-womens-association — Domain types
 * M8d — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:      KYC Tier 1
 *   cac_verified → active: KYC Tier 2 (welfare loan > ₦500k)
 * P9: All monetary amounts in integer kobo
 * P13: member PII never passed to AI layer
 */

export type WomensAssocFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type WomensAssocType =
  | 'market_women'
  | 'church_women'
  | 'professional_women'
  | 'community';

export type WelfareType = 'loan' | 'grant' | 'emergency';

export type WelfareStatus = 'active' | 'repaid' | 'defaulted';

export interface WomensAssocProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  assocName: string;
  type: WomensAssocType;
  cacReg: string | null;
  nwecAffiliation: string | null;
  state: string | null;
  lga: string | null;
  status: WomensAssocFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWomensAssocInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  assocName: string;
  type?: WomensAssocType | undefined;
  state?: string | undefined;
  lga?: string | undefined;
}

export interface UpdateWomensAssocInput {
  assocName?: string | undefined;
  type?: WomensAssocType | undefined;
  cacReg?: string | null | undefined;
  nwecAffiliation?: string | null | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  status?: WomensAssocFSMState | undefined;
}

export interface WomensAssocMember {
  id: string;
  profileId: string;
  tenantId: string;
  memberPhone: string | null;
  memberName: string;
  monthlyContributionKobo: number;
  contributionStatus: string;
  joinedDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMemberInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  memberPhone?: string | undefined;
  memberName: string;
  monthlyContributionKobo: number;
  contributionStatus?: string | undefined;
  joinedDate?: number | undefined;
}

export interface WomensAssocWelfare {
  id: string;
  profileId: string;
  memberId: string;
  tenantId: string;
  welfareType: WelfareType;
  amountKobo: number;
  repaymentSchedule: string | null;
  status: WelfareStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWelfareInput {
  id?: string | undefined;
  profileId: string;
  memberId: string;
  tenantId: string;
  welfareType?: WelfareType | undefined;
  amountKobo: number;
  repaymentSchedule?: string | undefined;
}

export interface WomensAssocMeeting {
  id: string;
  profileId: string;
  tenantId: string;
  meetingDate: number | null;
  agenda: string | null;
  minutesText: string | null;
  attendanceCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMeetingInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  meetingDate?: number | undefined;
  agenda?: string | undefined;
  minutesText?: string | undefined;
  attendanceCount?: number | undefined;
}

export const VALID_WOMENS_ASSOC_TRANSITIONS: Record<WomensAssocFSMState, WomensAssocFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['cac_verified', 'suspended'],
  cac_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidWomensAssocTransition(from: WomensAssocFSMState, to: WomensAssocFSMState): boolean {
  return VALID_WOMENS_ASSOC_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardClaimedToCacVerified(ctx: { cacReg: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.cacReg) return { allowed: false, reason: 'CAC registration required for cac_verified transition' };
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required' };
  return { allowed: true };
}

export function guardWelfareLoan(ctx: { amountKobo: number; kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.amountKobo > 50_000_000 && ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for welfare loan above ₦500k' };
  return { allowed: true };
}
