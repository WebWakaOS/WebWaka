/**
 * @webwaka/verticals-artisanal-mining — Domain types
 * M12 Commerce P3 — Task V-COMM-EXT-C1
 *
 * FSM: seeded → claimed → mmsd_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:          KYC Tier 1
 *   claimed → mmsd_verified:   MMSD permit number required; KYC Tier 2
 * Platform Invariants: P9 (kobo/gram integers), T3 (tenant_id always present)
 * P13: offtaker names never passed to AI layer
 */

export type ArtisanalMiningFSMState =
  | 'seeded'
  | 'claimed'
  | 'mmsd_verified'
  | 'active'
  | 'suspended';

export interface ArtisanalMiningProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  mmsdPermit: string | null;
  mineralType: string | null;
  state: string | null;
  lga: string | null;
  status: ArtisanalMiningFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateArtisanalMiningInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  mmsdPermit?: string | undefined;
  mineralType?: string | undefined;
  state?: string | undefined;
  lga?: string | undefined;
}

export interface UpdateArtisanalMiningInput {
  companyName?: string | undefined;
  mmsdPermit?: string | null | undefined;
  mineralType?: string | null | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  status?: ArtisanalMiningFSMState | undefined;
}

export interface MiningProductionLog {
  id: string;
  workspaceId: string;
  tenantId: string;
  mineralType: string;
  weightGrams: number;
  qualityGrade: string | null;
  salePriceKobo: number;
  offtakerName: string | null;
  saleDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProductionLogInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  mineralType: string;
  weightGrams: number;
  qualityGrade?: string | undefined;
  salePriceKobo: number;
  offtakerName?: string | undefined;
  saleDate?: number | undefined;
}

export interface MiningPermit {
  id: string;
  workspaceId: string;
  tenantId: string;
  permitNumber: string;
  permitType: string | null;
  validFrom: number | null;
  validUntil: number | null;
  state: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMiningPermitInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  permitNumber: string;
  permitType?: string | undefined;
  validFrom?: number | undefined;
  validUntil?: number | undefined;
  state?: string | undefined;
}

export const VALID_ARTISANAL_MINING_TRANSITIONS: Record<ArtisanalMiningFSMState, ArtisanalMiningFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['mmsd_verified', 'suspended'],
  mmsd_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidArtisanalMiningTransition(from: ArtisanalMiningFSMState, to: ArtisanalMiningFSMState): boolean {
  return VALID_ARTISANAL_MINING_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim artisanal mining profile' };
  return { allowed: true };
}

export function guardClaimedToMmsdVerified(ctx: { mmsdPermit: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.mmsdPermit) return { allowed: false, reason: 'MMSD permit number required for mmsd_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for mmsd_verified transition' };
  return { allowed: true };
}
