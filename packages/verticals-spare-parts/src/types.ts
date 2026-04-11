/**
 * @webwaka/verticals-spare-parts — Domain types
 * M11 Commerce P3 — Task V-COMM-EXT-C12
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * KYC: Tier 2 for mechanic credit accounts
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 * P13: mechanic details never passed to AI layer
 */

export type SparePartsFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type PartCategory = 'engine' | 'suspension' | 'electrical' | 'brakes' | 'body' | 'other';
export type OrderStatus = 'placed' | 'confirmed' | 'dispatched' | 'delivered' | 'settled';

export interface SparePartsProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  cacRc: string | null;
  sonDealerNumber: string | null;
  marketLocation: string | null;
  status: SparePartsFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSparePartsInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  cacRc?: string | undefined;
  sonDealerNumber?: string | undefined;
  marketLocation?: string | undefined;
}

export interface UpdateSparePartsInput {
  shopName?: string | undefined;
  cacRc?: string | null | undefined;
  sonDealerNumber?: string | null | undefined;
  marketLocation?: string | null | undefined;
  status?: SparePartsFSMState | undefined;
}

export interface SparePart {
  id: string;
  workspaceId: string;
  tenantId: string;
  partName: string;
  partNumber: string | null;
  category: PartCategory;
  compatibleMakes: string;
  unitPriceKobo: number;
  quantityInStock: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSparePartInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  partName: string;
  partNumber?: string | undefined;
  category: PartCategory;
  compatibleMakes?: string | undefined;
  unitPriceKobo: number;
  quantityInStock?: number | undefined;
}

export interface MechanicCreditAccount {
  id: string;
  workspaceId: string;
  tenantId: string;
  mechanicPhone: string;
  mechanicName: string;
  creditLimitKobo: number;
  balanceOwingKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMechanicCreditInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  mechanicPhone: string;
  mechanicName: string;
  creditLimitKobo: number;
  balanceOwingKobo?: number | undefined;
}

export interface SparePartsOrder {
  id: string;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  items: string;
  totalKobo: number;
  creditAccountId: string | null;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSparePartsOrderInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  items?: string | undefined;
  totalKobo: number;
  creditAccountId?: string | undefined;
}

export const VALID_SPARE_PARTS_TRANSITIONS: Record<SparePartsFSMState, SparePartsFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['cac_verified', 'suspended'],
  cac_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidSparePartsTransition(from: SparePartsFSMState, to: SparePartsFSMState): boolean {
  return VALID_SPARE_PARTS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim spare parts profile' };
  return { allowed: true };
}

export function guardClaimedToCacVerified(ctx: { cacRc: string | null }): { allowed: boolean; reason?: string } {
  if (!ctx.cacRc) return { allowed: false, reason: 'CAC RC number required for cac_verified transition' };
  return { allowed: true };
}
