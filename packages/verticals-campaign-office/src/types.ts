/**
 * @webwaka/verticals-campaign-office — Domain types
 * M8b — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → inec_filed → active → campaign_closed
 * KYC: Tier 3 mandatory — campaign finance involves large value transactions
 * AI: L3 HITL MANDATORY — no campaign insight, donor analysis, or voter pattern
 *     output may be published without explicit human review
 * P9: All monetary in kobo (INEC Electoral Act 2022 campaign limits)
 * P13: donor_phone, donor_name never aggregated into AI prompts
 *
 * INEC Electoral Act 2022 spending caps (kobo):
 *   president:    100_000_000_000 (₦1bn)
 *   governor:      20_000_000_000 (₦200m)
 *   senator:        3_000_000_000 (₦30m)  — estimated
 *   rep:            1_500_000_000 (₦15m)  — estimated
 *   councillor:       300_000_000 (₦3m)   — estimated
 */

export type CampaignOfficeFSMState =
  | 'seeded'
  | 'claimed'
  | 'inec_filed'
  | 'active'
  | 'campaign_closed';

export type OfficeSought =
  | 'president'
  | 'governor'
  | 'senator'
  | 'rep'
  | 'councillor';

export type BudgetCategory = 'media' | 'rallies' | 'logistics' | 'materials' | 'personnel';

export type CampaignEventType = 'rally' | 'townhall' | 'doorstep';

export const INEC_SPENDING_CAP_KOBO: Record<OfficeSought, number> = {
  president: 100_000_000_000,
  governor: 20_000_000_000,
  senator: 3_000_000_000,
  rep: 1_500_000_000,
  councillor: 300_000_000,
};

export interface CampaignOfficeProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  candidateName: string;
  party: string | null;
  officeSought: OfficeSought;
  inecFilingRef: string | null;
  status: CampaignOfficeFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCampaignOfficeInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  candidateName: string;
  party?: string | undefined;
  officeSought: OfficeSought;
}

export interface UpdateCampaignOfficeInput {
  candidateName?: string | undefined;
  party?: string | null | undefined;
  inecFilingRef?: string | null | undefined;
  status?: CampaignOfficeFSMState | undefined;
}

export interface CampaignBudget {
  id: string;
  profileId: string;
  tenantId: string;
  category: BudgetCategory;
  budgetKobo: number;
  spentKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBudgetInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  category: BudgetCategory;
  budgetKobo: number;
  spentKobo?: number | undefined;
}

export interface CampaignDonor {
  id: string;
  profileId: string;
  tenantId: string;
  donorName: string;
  donorPhone: string | null;
  amountKobo: number;
  donationDate: number | null;
  inecDisclosureRequired: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateDonorInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  donorName: string;
  donorPhone?: string | undefined;
  amountKobo: number;
  donationDate?: number | undefined;
  inecDisclosureRequired?: boolean | undefined;
}

export interface CampaignVolunteer {
  id: string;
  profileId: string;
  tenantId: string;
  volunteerPhone: string | null;
  volunteerName: string;
  lga: string | null;
  ward: string | null;
  role: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateVolunteerInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  volunteerPhone?: string | undefined;
  volunteerName: string;
  lga?: string | undefined;
  ward?: string | undefined;
  role?: string | undefined;
}

export interface CampaignEvent {
  id: string;
  profileId: string;
  tenantId: string;
  eventType: CampaignEventType;
  location: string | null;
  lga: string | null;
  eventDate: number | null;
  estimatedAttendance: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCampaignEventInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  eventType?: CampaignEventType | undefined;
  location?: string | undefined;
  lga?: string | undefined;
  eventDate?: number | undefined;
  estimatedAttendance?: number | undefined;
}

export const VALID_CAMPAIGN_TRANSITIONS: Record<CampaignOfficeFSMState, CampaignOfficeFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['inec_filed'],
  inec_filed: ['active'],
  active: ['campaign_closed'],
  campaign_closed: [],
};

export function isValidCampaignTransition(from: CampaignOfficeFSMState, to: CampaignOfficeFSMState): boolean {
  return VALID_CAMPAIGN_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardClaimedToInecFiled(ctx: { inecFilingRef: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.inecFilingRef) return { allowed: false, reason: 'INEC filing reference required for inec_filed transition' };
  if (ctx.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for campaign office activation' };
  return { allowed: true };
}

export function guardInecSpendingCap(ctx: { officeSought: OfficeSought; totalBudgetKobo: number }): { allowed: boolean; reason?: string } {
  const cap = INEC_SPENDING_CAP_KOBO[ctx.officeSought];
  if (ctx.totalBudgetKobo > cap) return { allowed: false, reason: `Total budget exceeds INEC spending cap for ${ctx.officeSought} (max ${cap} kobo)` };
  return { allowed: true };
}

export function guardAiHitl(ctx: { autonomyLevel: string }): { allowed: boolean; reason?: string } {
  if (ctx.autonomyLevel !== 'L3_HITL') return { allowed: false, reason: 'L3 HITL flag mandatory for all AI routes in campaign-office vertical' };
  return { allowed: true };
}
