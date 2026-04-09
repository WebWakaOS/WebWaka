/**
 * @webwaka/verticals-professional-association — Domain types
 * M12 — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → regulatory_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:               KYC Tier 2
 *   regulatory_verified → active:   KYC Tier 3 (practising fund > ₦10M)
 * P9: All monetary amounts in integer kobo; CPD credits as integer hours
 * P13: Disciplinary case details NEVER passed to AI layer (P13 + legal privilege)
 */

export type ProfessionalAssocFSMState =
  | 'seeded'
  | 'claimed'
  | 'regulatory_verified'
  | 'active'
  | 'suspended';

export type AssocType = 'legal' | 'medical' | 'accounting' | 'engineering' | 'other';

export type MemberStatus = 'active' | 'suspended' | 'lapsed';

export interface ProfessionalAssocProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  assocName: string;
  assocType: AssocType;
  regulatoryBody: string | null;
  status: ProfessionalAssocFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProfessionalAssocInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  assocName: string;
  assocType?: AssocType | undefined;
  regulatoryBody?: string | undefined;
}

export interface UpdateProfessionalAssocInput {
  assocName?: string | undefined;
  assocType?: AssocType | undefined;
  regulatoryBody?: string | null | undefined;
  status?: ProfessionalAssocFSMState | undefined;
}

export interface ProfessionalAssocMember {
  id: string;
  profileId: string;
  tenantId: string;
  memberNumber: string | null;
  memberName: string;
  specialisation: string | null;
  annualDuesKobo: number;
  certValidUntil: number | null;
  cpdCreditsRequired: number;
  cpdCreditsEarned: number;
  status: MemberStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProfessionalMemberInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  memberNumber?: string | undefined;
  memberName: string;
  specialisation?: string | undefined;
  annualDuesKobo: number;
  certValidUntil?: number | undefined;
  cpdCreditsRequired?: number | undefined;
}

export interface UpdateProfessionalMemberInput {
  annualDuesKobo?: number | undefined;
  certValidUntil?: number | null | undefined;
  cpdCreditsRequired?: number | undefined;
  cpdCreditsEarned?: number | undefined;
  status?: MemberStatus | undefined;
}

export interface ProfessionalAssocCpd {
  id: string;
  memberId: string;
  profileId: string;
  tenantId: string;
  trainingName: string;
  provider: string | null;
  creditsEarned: number;
  completionDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCpdInput {
  id?: string | undefined;
  memberId: string;
  profileId: string;
  tenantId: string;
  trainingName: string;
  provider?: string | undefined;
  creditsEarned: number;
  completionDate?: number | undefined;
}

export const VALID_PROFESSIONAL_ASSOC_TRANSITIONS: Record<ProfessionalAssocFSMState, ProfessionalAssocFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['regulatory_verified', 'suspended'],
  regulatory_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidProfessionalAssocTransition(from: ProfessionalAssocFSMState, to: ProfessionalAssocFSMState): boolean {
  return VALID_PROFESSIONAL_ASSOC_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardClaimedToRegulatoryVerified(ctx: { regulatoryBody: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.regulatoryBody) return { allowed: false, reason: 'Regulatory body reference required for regulatory_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required' };
  return { allowed: true };
}

export function guardPractisingFund(ctx: { amountKobo: number; kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.amountKobo > 1_000_000_000 && ctx.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for practising fund management above ₦10M' };
  return { allowed: true };
}
