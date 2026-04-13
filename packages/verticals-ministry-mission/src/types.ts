/**
 * @webwaka/verticals-ministry-mission — Domain types (M12) [Set J complete rewrite]
 * FSM: seeded → claimed → it_registered → active → suspended
 * AI: L2 — ENGAGEMENT_PIPELINE_REPORT, CASH_FLOW_FORECAST; donor_ref opaque (P13)
 * P9: all monetary in kobo integers
 * P13: donor_ref, founding_pastor_ref opaque — never to AI
 * T3: tenant_id always present
 * CAC Incorporated Trustee (IT) registration required
 */

export type MinistryMissionFSMState = 'seeded' | 'claimed' | 'it_registered' | 'active' | 'suspended';
export type MinistryServiceType = 'sunday' | 'midweek' | 'friday_juma' | 'special' | 'outreach';
export type MinistryDonationCategory = 'tithe' | 'offering' | 'special' | 'building_fund' | 'missions';
export type OrgType = 'church' | 'mosque' | 'mission' | 'outreach';

const FSM_TRANSITIONS: Record<MinistryMissionFSMState, MinistryMissionFSMState[]> = {
  seeded: ['claimed'], claimed: ['it_registered'], it_registered: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidMinistryMissionTransition(from: MinistryMissionFSMState, to: MinistryMissionFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardClaimedToItRegistered(input: { itNumber: string | null }): GuardResult {
  if (!input.itNumber?.trim()) return { allowed: false, reason: 'CAC Incorporated Trustee (IT) number required' };
  return { allowed: true };
}
export function guardNoDonorRefToAi(input: { includesDonorRef?: boolean }): GuardResult {
  if (input.includesDonorRef) return { allowed: false, reason: 'Donor references must not be passed to AI (P13)' };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Ministry AI capped at L2' };
  return { allowed: true };
}

export interface MinistryMissionProfile {
  id: string; workspaceId: string; tenantId: string; ministryName: string; itNumber: string | null;
  cacItCert?: string | null | undefined; denomination?: string | null | undefined; foundingPastorRef?: string | null | undefined;
  orgType?: OrgType | undefined; status: MinistryMissionFSMState; createdAt: number; updatedAt?: number | undefined;
  organizationId?: string | undefined;
  foundingYear?: number | null | undefined;
  totalMembers?: number | undefined;
}
export interface CreateMinistryMissionInput {
  id?: string; workspaceId: string; tenantId: string; ministryName: string; orgType?: OrgType;
  itNumber?: string; cacItCert?: string; denomination?: string; foundingPastorRef?: string;
  cacScn?: string;
  organizationId?: string;
  foundingYear?: number;
  totalMembers?: number;
  tinRef?: string;
  state?: string;
  lga?: string;
}
export interface MinistryService {
  id: string; profileId: string; tenantId: string; serviceType: MinistryServiceType;
  scheduledDate: number; attendanceCount: number; offeringKobo: number; tithKobo: number;
  notes: string | null; createdAt: number;
}
export interface MinistryDonation {
  id: string; profileId: string; tenantId: string; donorRef: string;
  amountKobo: number; donationDate: number; category: MinistryDonationCategory; createdAt: number;
}
export interface MinistryOutreach {
  id: string; profileId: string; tenantId: string; outreachType: string;
  outreachDate: number; beneficiaryCount: number; costKobo: number; location: string | null; createdAt: number;
}

// MinistryRepository types (distinct from MinistryMissionProfile)
export type MinistryProfile = MinistryMissionProfile;
export type CreateMinistryInput = CreateMinistryMissionInput;
export interface UpdateMinistryInput {
  ministryName?: string; itNumber?: string | null; foundingYear?: number | null;
  totalMembers?: number; status?: string; denomination?: string; state?: string; lga?: string;
}
export type MinistryFSMState = MinistryMissionFSMState;
