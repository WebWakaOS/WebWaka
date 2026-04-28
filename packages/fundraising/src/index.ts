/**
 * @webwaka/fundraising — Public API
 *
 * Build Once Use Infinitely (P1):
 *   Shared fundraising engine — NO vertical-specific logic in core.
 *   Church (campaign_type='church'), political (campaign_type='political'),
 *   NGO, personal, emergency — all use this same engine.
 *
 * Deprecated inputs absorbed:
 *   - campaign_donations (0048): bridged via campaign_donation_bridge table
 *   - tithe_records (0052): bridged via tithe_fundraising_bridge table
 */

export * from './types.js';
export * from './entitlements.js';

export {
  createCampaign,
  getCampaign,
  listCampaigns,
  listPublicCampaigns,
  updateCampaign,
  moderateCampaign,
  createContribution,
  confirmContribution,
  listContributions,
  getDonorWall,
  createPledge,
  createMilestone,
  listMilestones,
  createUpdate,
  listUpdates,
  createReward,
  createPayoutRequest,
  approvePayoutRequest,
  rejectPayoutRequest,
  listPayoutRequests,
  addComplianceDeclaration,
  migrateTitheToFundraising,
  getCampaignStats,
  checkInecCap,
  INEC_DEFAULT_CAP_KOBO,
} from './repository.js';

export type { D1Like } from './repository.js';

export const PACKAGE_VERSION = '0.1.0';
export const VERTICAL_SLUG = 'fundraising';

// ---------------------------------------------------------------------------
// Phase 2: Dues Collection (FR-VM-15)
// ---------------------------------------------------------------------------

export type {
  DuesSchedule,
  DuesPayment,
  MemberDuesStatus,
  CreateDuesScheduleInput,
  RecordDuesPaymentInput,
  DuesPeriod,
  DuesScheduleStatus,
  DuesPaymentStatus,
  DuesPaymentChannel,
} from './dues.js';
export { assertIntegerKobo } from './dues.js';
export {
  createDuesSchedule,
  getDuesSchedule,
  listDuesSchedules,
  closeDuesSchedule,
  recordDuesPayment,
  listSchedulePayments,
  getMemberDuesStatus,
} from './dues-repository.js';

// ---------------------------------------------------------------------------
// Phase 2: Mutual Aid (FR-VM-16)
// ---------------------------------------------------------------------------

export type {
  MutualAidRequest,
  MutualAidVote,
  MutualAidStatus,
  CreateMutualAidRequestInput,
  CastVoteInput,
  DisburseInput,
} from './mutual-aid.js';
export {
  createMutualAidRequest,
  getMutualAidRequest,
  listMutualAidRequests,
  castVote,
  getRequestVotes,
  disburseMutualAid,
} from './mutual-aid-repository.js';
