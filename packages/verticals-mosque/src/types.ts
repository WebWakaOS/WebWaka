/**
 * @webwaka/verticals-mosque — Domain types
 * M8d — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → it_registered → active → suspended
 * KYC gates:
 *   seeded → claimed:        KYC Tier 1
 *   it_registered → active:  KYC Tier 2 (Waqf > ₦1M)
 * P9: All monetary amounts in integer kobo
 * P13: donor_phone never passed to AI layer; anonymous donation flag preserved
 */

export type MosqueFSMState =
  | 'seeded'
  | 'claimed'
  | 'it_registered'
  | 'active'
  | 'suspended';

export type DonationType = 'zakat' | 'sadaqah' | 'waqf' | 'general';

export type ProgrammeType = "jumu'ah" | 'tarawih' | 'eid' | 'lecture' | 'ramadan';

export interface MosqueProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  mosqueName: string;
  nsciaAffiliationNumber: string | null;
  itRegistrationNumber: string | null;
  state: string | null;
  lga: string | null;
  congregationSize: number;
  status: MosqueFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMosqueInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  mosqueName: string;
  nsciaAffiliationNumber?: string | undefined;
  state?: string | undefined;
  lga?: string | undefined;
  organizationId?: string;
}

export interface UpdateMosqueInput {
  mosqueName?: string | undefined;
  nsciaAffiliationNumber?: string | null | undefined;
  itRegistrationNumber?: string | null | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  congregationSize?: number | undefined;
  status?: MosqueFSMState | undefined;
}

export interface MosqueDonation {
  id: string;
  profileId: string;
  tenantId: string;
  donorAnonymous: boolean;
  donorPhone: string | null;
  donationType: DonationType;
  amountKobo: number;
  donationDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateDonationInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  donorAnonymous?: boolean | undefined;
  donorPhone?: string | undefined;
  donationType?: DonationType | undefined;
  amountKobo: number;
  donationDate?: number | undefined;
}

export interface MosqueProgramme {
  id: string;
  profileId: string;
  tenantId: string;
  programmeName: string;
  type: ProgrammeType;
  scheduledDate: number | null;
  attendanceCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProgrammeInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  programmeName: string;
  type?: ProgrammeType | undefined;
  scheduledDate?: number | undefined;
  attendanceCount?: number | undefined;
}

export interface MosqueMember {
  id: string;
  profileId: string;
  tenantId: string;
  memberPhone: string | null;
  memberName: string;
  zakatEligible: boolean;
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
  zakatEligible?: boolean | undefined;
  joinedDate?: number | undefined;
}

export const VALID_MOSQUE_TRANSITIONS: Record<MosqueFSMState, MosqueFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['it_registered', 'suspended'],
  it_registered: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidMosqueTransition(from: MosqueFSMState, to: MosqueFSMState): boolean {
  return VALID_MOSQUE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardClaimedToItRegistered(ctx: { itRegistrationNumber: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.itRegistrationNumber) return { allowed: false, reason: 'IT registration number required for it_registered transition' };
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required' };
  return { allowed: true };
}

export function guardWaqfFund(ctx: { amountKobo: number; kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.amountKobo > 100_000_000 && ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for Waqf/endowment fund above ₦1M' };
  return { allowed: true };
}
