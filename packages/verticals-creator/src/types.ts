/**
 * packages/verticals-creator — Domain types
 * (M8e — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → social_active → monetization_enabled → active
 * Creator / Influencer modeled as an Individual entity.
 * P9: monetary amounts in integer kobo (monthly rate, deal value).
 *     Rating stored as integer ×10 where applicable.
 */

export type CreatorFSMState =
  | 'seeded'
  | 'claimed'
  | 'social_active'
  | 'monetization_enabled'
  | 'active';

export type CreatorNiche =
  | 'lifestyle' | 'fashion' | 'comedy' | 'tech' | 'finance'
  | 'food' | 'travel' | 'sports' | 'beauty' | 'gaming'
  | 'education' | 'music' | 'others';

export type DealStatus =
  | 'enquiry' | 'negotiating' | 'confirmed' | 'delivered' | 'paid' | 'cancelled';

export interface CreatorProfile {
  id: string;
  individualId: string;
  workspaceId: string;
  tenantId: string;
  socialProfileId: string | null;
  communityId: string | null;
  niche: CreatorNiche;
  followerCount: number;
  verifiedBrand: boolean;
  monthlyRateKobo: number | null;
  status: CreatorFSMState;
  createdAt: number;
}

export interface BrandDeal {
  id: string;
  workspaceId: string;
  tenantId: string;
  creatorId: string;
  brandName: string;
  dealValueKobo: number | null;
  deliverables: string | null;  // JSON
  status: DealStatus;
  createdAt: number;
}

export interface CreateCreatorInput {
  id?: string;
  individualId: string;
  workspaceId: string;
  tenantId: string;
  niche: CreatorNiche;
  followerCount?: number;
  monthlyRateKobo?: number;
}

export interface UpdateCreatorInput {
  socialProfileId?: string | null;
  communityId?: string | null;
  niche?: CreatorNiche;
  followerCount?: number;
  verifiedBrand?: boolean;
  monthlyRateKobo?: number | null;
  status?: CreatorFSMState;
}

export interface CreateDealInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  creatorId: string;
  brandName: string;
  dealValueKobo?: number;
  deliverables?: string;
}

export interface UpdateDealInput {
  brandName?: string;
  dealValueKobo?: number | null;
  deliverables?: string | null;
  status?: DealStatus;
}

export const VALID_CREATOR_TRANSITIONS: Array<[CreatorFSMState, CreatorFSMState]> = [
  ['seeded',              'claimed'],
  ['claimed',             'social_active'],
  ['social_active',       'monetization_enabled'],
  ['monetization_enabled','active'],
];

export function isValidCreatorTransition(from: CreatorFSMState, to: CreatorFSMState): boolean {
  return VALID_CREATOR_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
