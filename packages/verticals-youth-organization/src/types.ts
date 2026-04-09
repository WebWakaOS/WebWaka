/**
 * @webwaka/verticals-youth-organization — Domain types
 * M8d — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:      KYC Tier 1
 *   cac_verified → active: KYC Tier 2 (scholarship disbursements > ₦500k)
 * P9: All monetary amounts in integer kobo
 * P13: member names and phone numbers never passed to AI layer
 */

export type YouthOrgFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type YouthOrgType =
  | 'student_union'
  | 'community_youth'
  | 'nysc_cda'
  | 'political_youth_wing';

export interface YouthOrgProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  orgName: string;
  type: YouthOrgType;
  cacRegNumber: string | null;
  nyscCoordination: string | null;
  state: string | null;
  lga: string | null;
  status: YouthOrgFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateYouthOrgInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  orgName: string;
  type?: YouthOrgType | undefined;
  state?: string | undefined;
  lga?: string | undefined;
}

export interface UpdateYouthOrgInput {
  orgName?: string | undefined;
  type?: YouthOrgType | undefined;
  cacRegNumber?: string | null | undefined;
  nyscCoordination?: string | null | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  status?: YouthOrgFSMState | undefined;
}

export interface YouthOrgMember {
  id: string;
  profileId: string;
  tenantId: string;
  memberPhone: string | null;
  memberName: string;
  membershipYear: number | null;
  annualDuesKobo: number;
  duesPaid: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateYouthMemberInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  memberPhone?: string | undefined;
  memberName: string;
  membershipYear?: number | undefined;
  annualDuesKobo: number;
  duesPaid?: boolean | undefined;
}

export interface YouthOrgEvent {
  id: string;
  profileId: string;
  tenantId: string;
  eventName: string;
  eventDate: number | null;
  venue: string | null;
  description: string | null;
  attendanceCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateEventInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  eventName: string;
  eventDate?: number | undefined;
  venue?: string | undefined;
  description?: string | undefined;
  attendanceCount?: number | undefined;
}

export interface YouthOrgScholarship {
  id: string;
  profileId: string;
  tenantId: string;
  donorPhone: string | null;
  donorName: string | null;
  donatedAmountKobo: number;
  recipientName: string | null;
  awardAmountKobo: number;
  academicYear: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateScholarshipInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  donorPhone?: string | undefined;
  donorName?: string | undefined;
  donatedAmountKobo: number;
  recipientName?: string | undefined;
  awardAmountKobo: number;
  academicYear?: string | undefined;
}

export const VALID_YOUTH_ORG_TRANSITIONS: Record<YouthOrgFSMState, YouthOrgFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['cac_verified', 'suspended'],
  cac_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidYouthOrgTransition(from: YouthOrgFSMState, to: YouthOrgFSMState): boolean {
  return VALID_YOUTH_ORG_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardClaimedToCacVerified(ctx: { cacRegNumber: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.cacRegNumber) return { allowed: false, reason: 'CAC registration number required for cac_verified transition' };
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required' };
  return { allowed: true };
}

export function guardScholarshipDisbursement(ctx: { awardAmountKobo: number; kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.awardAmountKobo > 50_000_000 && ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for scholarship disbursement above ₦500k' };
  return { allowed: true };
}
