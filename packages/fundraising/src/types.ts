/**
 * @webwaka/fundraising — Domain types
 *
 * Platform Invariants:
 *   T3  — tenant_id on all records
 *   T4  — all monetary values in integer kobo (never floats)
 *   P9  — integer kobo assertions at application layer
 *   P13 — donor_phone, pledger_phone, bank_account_number never forwarded to AI
 *
 * Assumptions encoded inline:
 *   [A1] Contribution cap: driven by policy engine (contribution_cap category).
 *        Default: 5,000,000,000 kobo = ₦50,000,000 for INEC-regulated political campaigns.
 *        Stored per campaign in contributionCapKobo. Non-political = 0 (no cap).
 *   [A2] CBN: pass-through via Paystack Transfers; no pooled escrow.
 *   [A3] Church tithe_records: bridged to this system via migration adapter.
 */

export type CampaignType =
  | 'general'
  | 'political'
  | 'emergency'
  | 'community'
  | 'election'
  | 'church'
  | 'ngo'
  | 'personal'
  | 'education'
  | 'health';

export type CampaignStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type CampaignVisibility = 'public' | 'private' | 'unlisted';

export type ContributionStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type PaymentChannel = 'card' | 'bank_transfer' | 'ussd' | 'mobile_money';

export type PledgeFrequency = 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type PledgeStatus = 'active' | 'paused' | 'cancelled' | 'fulfilled';

export type PayoutStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'rejected';
export type HitlStatus = 'pending' | 'approved' | 'rejected';

export type DeclarationType =
  | 'inec_political'
  | 'cbn_psp_exempt'
  | 'ndpr_dpa'
  | 'church_tithe_migration'
  | 'ngo_it_exempt';

// ---------------------------------------------------------------------------
// Core campaign
// ---------------------------------------------------------------------------

export interface FundraisingCampaign {
  id: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string;
  story: string | null;
  campaignType: CampaignType;
  goalKobo: number;
  raisedKobo: number;
  contributorCount: number;
  currencyCode: string;
  beneficiaryName: string;
  beneficiaryWorkspaceId: string | null;
  coverImageUrl: string | null;
  status: CampaignStatus;
  visibility: CampaignVisibility;
  endsAt: number | null;
  /** Contribution cap in kobo. 0 = no cap. For political campaigns defaults to INEC ₦50m cap. */
  contributionCapKobo: number;
  /** Whether contributor disclosure is required (INEC mandate for political campaigns). */
  disclosureRequired: boolean;
  ndprConsentRequired: boolean;
  donorWallEnabled: boolean;
  anonymousAllowed: boolean;
  rewardsEnabled: boolean;
  hitlRequired: boolean;
  moderationNote: string | null;
  moderatedBy: string | null;
  moderatedAt: number | null;
  groupId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCampaignInput {
  workspaceId: string;
  tenantId: string;
  title: string;
  slug: string;
  description: string;
  story?: string;
  campaignType?: CampaignType;
  goalKobo?: number;
  currencyCode?: string;
  beneficiaryName: string;
  beneficiaryWorkspaceId?: string;
  coverImageUrl?: string;
  visibility?: CampaignVisibility;
  endsAt?: number;
  /** Override the default contribution cap in kobo. Defaults to policy engine value for political campaigns. */
  contributionCapKobo?: number;
  /** Require contributor disclosure (e.g. INEC mandate). Defaults to true for political campaigns. */
  disclosureRequired?: boolean;
  ndprConsentRequired?: boolean;
  donorWallEnabled?: boolean;
  anonymousAllowed?: boolean;
  rewardsEnabled?: boolean;
  groupId?: string;
}

export interface UpdateCampaignInput {
  title?: string;
  description?: string;
  story?: string;
  goalKobo?: number;
  coverImageUrl?: string;
  visibility?: CampaignVisibility;
  endsAt?: number;
  status?: CampaignStatus;
  donorWallEnabled?: boolean;
  anonymousAllowed?: boolean;
  rewardsEnabled?: boolean;
}

// ---------------------------------------------------------------------------
// Contributions
// ---------------------------------------------------------------------------

export interface FundraisingContribution {
  id: string;
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  donorUserId: string | null;
  donorDisplayName: string | null;
  donorPhone: string;
  amountKobo: number;
  paystackRef: string | null;
  paymentChannel: PaymentChannel;
  status: ContributionStatus;
  isAnonymous: boolean;
  pledgeId: string | null;
  rewardId: string | null;
  ndprConsented: boolean;
  complianceVerified: boolean;
  createdAt: number;
  confirmedAt: number | null;
}

export interface CreateContributionInput {
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  donorPhone: string;
  amountKobo: number;
  donorUserId?: string;
  donorDisplayName?: string;
  paystackRef?: string;
  paymentChannel?: PaymentChannel;
  isAnonymous?: boolean;
  pledgeId?: string;
  rewardId?: string;
  ndprConsented?: boolean;
}

// ---------------------------------------------------------------------------
// Pledges
// ---------------------------------------------------------------------------

export interface FundraisingPledge {
  id: string;
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  pledgerPhone: string;
  pledgerUserId: string | null;
  amountKobo: number;
  frequency: PledgeFrequency;
  totalPaidKobo: number;
  status: PledgeStatus;
  nextDueAt: number | null;
  createdAt: number;
}

export interface CreatePledgeInput {
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  pledgerPhone: string;
  pledgerUserId?: string;
  amountKobo: number;
  frequency?: PledgeFrequency;
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------

export interface FundraisingMilestone {
  id: string;
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  targetKobo: number;
  reachedAt: number | null;
  description: string | null;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Updates
// ---------------------------------------------------------------------------

export interface FundraisingUpdate {
  id: string;
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  body: string;
  mediaUrl: string | null;
  visibility: 'all' | 'donors_only';
  postedBy: string;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Rewards
// ---------------------------------------------------------------------------

export interface FundraisingReward {
  id: string;
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  description: string | null;
  minAmountKobo: number;
  quantity: number;
  claimedCount: number;
  createdAt: number;
}

export interface FundraisingRewardClaim {
  id: string;
  rewardId: string;
  contributionId: string;
  workspaceId: string;
  tenantId: string;
  donorPhone: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  claimedAt: number;
}

// ---------------------------------------------------------------------------
// Payout requests
// ---------------------------------------------------------------------------

export interface FundraisingPayoutRequest {
  id: string;
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  requestedBy: string;
  amountKobo: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankCode: string;
  reason: string;
  hitlRequired: boolean;
  hitlStatus: HitlStatus;
  hitlReviewerId: string | null;
  hitlReviewedAt: number | null;
  hitlNote: string | null;
  paystackTransferCode: string | null;
  status: PayoutStatus;
  processedAt: number | null;
  createdAt: number;
}

export interface CreatePayoutRequestInput {
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  requestedBy: string;
  amountKobo: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankCode: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Compliance declarations
// ---------------------------------------------------------------------------

export interface FundraisingComplianceDeclaration {
  id: string;
  campaignId: string;
  workspaceId: string;
  tenantId: string;
  declarationType: DeclarationType;
  declaredBy: string;
  declaredAt: number;
  referenceDoc: string | null;
  notes: string | null;
  status: 'declared' | 'verified' | 'expired';
}

// ---------------------------------------------------------------------------
// Public campaign profile (for brand/discovery surfaces)
// ---------------------------------------------------------------------------

export interface FundraisingCampaignPublicProfile {
  id: string;
  title: string;
  slug: string;
  description: string;
  story: string | null;
  campaignType: CampaignType;
  goalKobo: number;
  raisedKobo: number;
  contributorCount: number;
  currencyCode: string;
  beneficiaryName: string;
  coverImageUrl: string | null;
  status: CampaignStatus;
  endsAt: number | null;
  donorWallEnabled: boolean;
  anonymousAllowed: boolean;
  rewardsEnabled: boolean;
  createdAt: number;
}

// ---------------------------------------------------------------------------
// Donation wall entry (public, display-only)
// ---------------------------------------------------------------------------

export interface DonorWallEntry {
  displayName: string | null;
  amountKobo: number;
  message: string | null;
  contributedAt: number;
}
