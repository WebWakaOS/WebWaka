/**
 * @webwaka/verticals-pr-firm — types + FSM guards (M12)
 * FSM: seeded → claimed → nipr_verified → active → suspended
 * AI: L2 cap — campaign pipeline aggregate; client strategy never to AI (P13)
 * P9: all monetary values in kobo integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for retainer billing; Tier 3 for government contracts above ₦5M
 */

export type PrFirmFSMState =
  | 'seeded'
  | 'claimed'
  | 'nipr_verified'
  | 'active'
  | 'suspended';

export type CampaignType = 'media' | 'event' | 'crisis' | 'launch' | 'digital';
export type CampaignStatus = 'planning' | 'active' | 'completed';
export type Sentiment = 'positive' | 'neutral' | 'negative';

const FSM_TRANSITIONS: Record<PrFirmFSMState, PrFirmFSMState[]> = {
  seeded:       ['claimed'],
  claimed:      ['nipr_verified'],
  nipr_verified: ['active'],
  active:       ['suspended'],
  suspended:    ['active'],
};

export function isValidPrFirmTransition(from: PrFirmFSMState, to: PrFirmFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNiprVerified(input: { niprAccreditation: string | null }): GuardResult {
  if (!input.niprAccreditation || input.niprAccreditation.trim() === '') {
    return { allowed: false, reason: 'NIPR accreditation required to verify PR firm' };
  }
  return { allowed: true };
}

export function guardKycForRetainerBilling(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for retainer billing' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'PR firm AI capped at L2 advisory — campaign aggregate only' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'PR firm AI capped at L2' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export function guardNoClientStrategyInAi(payload: Record<string, unknown>): GuardResult {
  const forbidden = ['client_ref_id', 'clientRefId', 'campaign_id', 'campaignId', 'campaign_name', 'campaignName'];
  for (const key of forbidden) {
    if (key in payload) return { allowed: false, reason: `P13: client/campaign detail "${key}" must not pass to AI` };
  }
  return { allowed: true };
}

export interface PrFirmProfile {
  id: string; workspaceId: string; tenantId: string;
  firmName: string; niprAccreditation: string | null; cacRc: string | null;
  status: PrFirmFSMState; createdAt: number; updatedAt: number;
}

export interface PrCampaign {
  id: string; profileId: string; tenantId: string;
  clientRefId: string; campaignName: string; campaignType: CampaignType;
  budgetKobo: number; startDate: number; endDate: number | null;
  status: CampaignStatus; createdAt: number; updatedAt: number;
}

export interface PrMediaCoverage {
  id: string; profileId: string; tenantId: string;
  campaignId: string; mediaName: string; coverageDate: number;
  clipRef: string | null; sentiment: Sentiment; createdAt: number;
}

export interface PrBilling {
  id: string; profileId: string; tenantId: string;
  clientRefId: string; billingMonth: string; retainerKobo: number;
  adHocKobo: number; totalKobo: number; paidKobo: number; createdAt: number;
}

export interface CreatePrFirmInput {
  id?: string; workspaceId: string; tenantId: string;
  firmName: string; niprAccreditation?: string; cacRc?: string;
}

export interface CreateCampaignInput {
  id?: string; profileId: string; tenantId: string;
  clientRefId: string; campaignName: string; campaignType: CampaignType;
  budgetKobo: number; startDate: number; endDate?: number;
}

export interface CreateMediaCoverageInput {
  id?: string; profileId: string; tenantId: string;
  campaignId: string; mediaName: string; coverageDate: number;
  clipRef?: string; sentiment?: Sentiment;
}

export interface CreateBillingInput {
  id?: string; profileId: string; tenantId: string;
  clientRefId: string; billingMonth: string; retainerKobo: number;
  adHocKobo?: number; paidKobo?: number;
}
