/**
 * @webwaka/verticals-shoemaker — Domain types
 * M10 Commerce P3 — Task V-COMM-EXT-C11
 *
 * FSM: seeded → claimed → active (3-state informal)
 * KYC: Tier 1 sufficient
 * Platform Invariants: P9 (kobo integers; shoe size as integer), T3 (tenant_id always present)
 */

export type ShoemakerFSMState = 'seeded' | 'claimed' | 'active';
export type ShoemakerJobStatus = 'intake' | 'in_progress' | 'ready' | 'collected';
export type JobType = 'new_pair' | 'repair' | 'sole_replacement' | 'custom';

export interface ShoemakerProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  speciality: string | null;
  state: string | null;
  lga: string | null;
  status: ShoemakerFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateShoemakerInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  speciality?: string | undefined;
  state?: string | undefined;
  lga?: string | undefined;
}

export interface UpdateShoemakerInput {
  shopName?: string | undefined;
  speciality?: string | null | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  status?: ShoemakerFSMState | undefined;
}

export interface ShoemakerJob {
  id: string;
  workspaceId: string;
  tenantId: string;
  customerPhone: string;
  jobType: JobType;
  shoeSize: number;
  material: string | null;
  priceKobo: number;
  depositKobo: number;
  balanceKobo: number;
  dueDate: number | null;
  status: ShoemakerJobStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateShoemakerJobInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  customerPhone: string;
  jobType: JobType;
  shoeSize: number;
  material?: string | undefined;
  priceKobo: number;
  depositKobo?: number | undefined;
  balanceKobo?: number | undefined;
  dueDate?: number | undefined;
}

export interface ShoemakerCatalogueItem {
  id: string;
  workspaceId: string;
  tenantId: string;
  itemName: string;
  priceKobo: number;
  shoeSize: number | null;
  stockCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateShoemakerCatalogueItemInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  itemName: string;
  priceKobo: number;
  shoeSize?: number | undefined;
  stockCount?: number | undefined;
}

export const VALID_SHOEMAKER_TRANSITIONS: Record<ShoemakerFSMState, ShoemakerFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['active'],
  active: [],
};

export function isValidShoemakerTransition(from: ShoemakerFSMState, to: ShoemakerFSMState): boolean {
  return VALID_SHOEMAKER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim shoemaker profile' };
  return { allowed: true };
}

export function guardClaimedToActive(_ctx: Record<string, never>): { allowed: boolean; reason?: string } {
  return { allowed: true };
}
