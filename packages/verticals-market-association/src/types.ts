/**
 * @webwaka/verticals-market-association — Domain types (M12)
 * FSM: seeded → claimed → cac_registered → active → suspended
 * AI: L1 aggregate only — ENGAGEMENT_PIPELINE_REPORT; no member_ref_id (P13)
 * P9: all monetary in kobo integers
 * P13: member_ref_id opaque
 * T3: tenant_id always present
 */

export type MarketAssociationFSMState = 'seeded' | 'claimed' | 'cac_registered' | 'active' | 'suspended';
export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type LevyType = 'daily' | 'weekly' | 'monthly' | 'special';

const FSM_TRANSITIONS: Record<MarketAssociationFSMState, MarketAssociationFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_registered'], cac_registered: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidMarketAssociationTransition(from: MarketAssociationFSMState, to: MarketAssociationFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL1AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 1) return { allowed: false, reason: 'Market association AI capped at L1 aggregate only' };
  return { allowed: true };
}
export function guardNoMemberRefToAi(input: { includesMemberRef?: boolean }): GuardResult {
  if (input.includesMemberRef) return { allowed: false, reason: 'Member references must not be passed to AI (P13)' };
  return { allowed: true };
}

export interface MarketAssociationProfile {
  id: string; workspaceId: string; tenantId: string; associationName: string; cacItCert: string | null;
  marketName: string | null; state: string | null; lga: string | null;
  status: MarketAssociationFSMState; createdAt: number; updatedAt: number;
}
export interface CreateMarketAssociationInput {
  id?: string; workspaceId: string; tenantId: string; associationName?: string;
  cacItCert?: string; marketName?: string; state?: string; lga?: string;
  cacScn?: string;
  lgaRef?: string;
  totalStalls?: number;
}
export interface MarketMember {
  id: string; profileId: string; tenantId: string; memberRefId: string; stallNumber: string | null;
  tradeType: string | null; duesMonthlyKobo: number; registrationDate: number;
  status: MemberStatus; createdAt: number; updatedAt: number;
}
export interface MarketLevy {
  id: string; profileId: string; tenantId: string; memberRefId: string; levyType: LevyType;
  amountKobo: number; paymentDate: number; createdAt: number;
}
export interface MarketMeeting {
  id: string; profileId: string; tenantId: string; meetingDate: number;
  attendanceCount: number; resolutions: string | null; createdAt: number;
}
