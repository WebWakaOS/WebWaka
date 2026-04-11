/**
 * @webwaka/verticals-tyre-shop — Domain types
 * M10 Commerce P3 — Task V-COMM-EXT-C13
 *
 * FSM: seeded → claimed → active (3-state informal)
 * KYC: Tier 1 sufficient
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type TyreShopFSMState = 'seeded' | 'claimed' | 'active';
export type TyreJobType = 'sale' | 'repair' | 'balancing' | 'alignment';
export type TyreJobStatus = 'intake' | 'in_progress' | 'completed';

export interface TyreShopProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  state: string | null;
  lga: string | null;
  status: TyreShopFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTyreShopInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  state?: string | undefined;
  lga?: string | undefined;
}

export interface UpdateTyreShopInput {
  shopName?: string | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  status?: TyreShopFSMState | undefined;
}

export interface TyreCatalogueItem {
  id: string;
  workspaceId: string;
  tenantId: string;
  brand: string;
  size: string;
  unitPriceKobo: number;
  quantityInStock: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTyreCatalogueItemInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  brand: string;
  size: string;
  unitPriceKobo: number;
  quantityInStock?: number | undefined;
}

export interface TyreJob {
  id: string;
  workspaceId: string;
  tenantId: string;
  vehiclePlate: string;
  jobType: TyreJobType;
  tyreSize: string | null;
  priceKobo: number;
  status: TyreJobStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTyreJobInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  vehiclePlate: string;
  jobType: TyreJobType;
  tyreSize?: string | undefined;
  priceKobo: number;
}

export const VALID_TYRE_SHOP_TRANSITIONS: Record<TyreShopFSMState, TyreShopFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['active'],
  active: [],
};

export function isValidTyreShopTransition(from: TyreShopFSMState, to: TyreShopFSMState): boolean {
  return VALID_TYRE_SHOP_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim tyre shop profile' };
  return { allowed: true };
}

export function guardClaimedToActive(_ctx: Record<string, never>): { allowed: boolean; reason?: string } {
  return { allowed: true };
}
