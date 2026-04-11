/**
 * @webwaka/verticals-water-vendor — Domain types
 * M10 Commerce P3 — Task V-COMM-EXT-C15
 *
 * FSM: seeded → claimed → nafdac_verified → active → suspended
 * KYC: Tier 2 for NAFDAC registration
 * Platform Invariants: P9 (kobo integers; volume in litres as integers), T3 (tenant_id always present)
 */

export type WaterVendorFSMState =
  | 'seeded'
  | 'claimed'
  | 'nafdac_verified'
  | 'active'
  | 'suspended';

export type WaterProductType = 'sachet' | 'bottle_75cl' | 'bottle_1_5l' | 'dispenser_19l' | 'tanker';
export type DeliveryStatus = 'pending' | 'dispatched' | 'delivered';

export interface WaterVendorProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  brandName: string;
  nafdacNumber: string | null;
  cacRc: string | null;
  factoryAddress: string | null;
  state: string | null;
  status: WaterVendorFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWaterVendorInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  brandName: string;
  nafdacNumber?: string | undefined;
  cacRc?: string | undefined;
  factoryAddress?: string | undefined;
  state?: string | undefined;
}

export interface UpdateWaterVendorInput {
  brandName?: string | undefined;
  nafdacNumber?: string | null | undefined;
  cacRc?: string | null | undefined;
  factoryAddress?: string | null | undefined;
  state?: string | null | undefined;
  status?: WaterVendorFSMState | undefined;
}

export interface WaterProductPrice {
  id: string;
  workspaceId: string;
  tenantId: string;
  productType: WaterProductType;
  volumeLitres: number;
  unitPriceKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWaterProductPriceInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  productType: WaterProductType;
  volumeLitres: number;
  unitPriceKobo: number;
}

export interface WaterDeliveryOrder {
  id: string;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  deliveryAddress: string;
  productType: WaterProductType;
  quantityUnits: number;
  totalKobo: number;
  status: DeliveryStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWaterDeliveryOrderInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  deliveryAddress: string;
  productType: WaterProductType;
  quantityUnits: number;
  totalKobo: number;
}

export const VALID_WATER_VENDOR_TRANSITIONS: Record<WaterVendorFSMState, WaterVendorFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['nafdac_verified', 'suspended'],
  nafdac_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidWaterVendorTransition(from: WaterVendorFSMState, to: WaterVendorFSMState): boolean {
  return VALID_WATER_VENDOR_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim water vendor profile' };
  return { allowed: true };
}

export function guardClaimedToNafdacVerified(ctx: { nafdacNumber: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.nafdacNumber) return { allowed: false, reason: 'NAFDAC registration number required for nafdac_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for nafdac_verified transition' };
  return { allowed: true };
}
