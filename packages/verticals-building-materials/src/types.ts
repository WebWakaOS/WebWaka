/**
 * @webwaka/verticals-building-materials — Domain types
 * M12 Commerce P3 — Task V-COMM-EXT-C3
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * KYC: Tier 2 for contractor credit; Tier 3 for bulk >₦5M
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 * P13: contractor PII never passed to AI layer
 */

export type BuildingMaterialsFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type ProductCategory = 'cement' | 'steel' | 'roofing' | 'tiles' | 'glass' | 'paint' | 'sanitary';
export type OrderStatus = 'placed' | 'confirmed' | 'dispatched' | 'delivered' | 'invoiced' | 'settled';

export interface BuildingMaterialsProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  cacRc: string | null;
  sonDealerNumber: string | null;
  marketCluster: string | null;
  status: BuildingMaterialsFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBuildingMaterialsInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  cacRc?: string | undefined;
  sonDealerNumber?: string | undefined;
  marketCluster?: string | undefined;
}

export interface UpdateBuildingMaterialsInput {
  companyName?: string | undefined;
  cacRc?: string | null | undefined;
  sonDealerNumber?: string | null | undefined;
  marketCluster?: string | null | undefined;
  status?: BuildingMaterialsFSMState | undefined;
}

export interface CatalogueItem {
  id: string;
  workspaceId: string;
  tenantId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  unitPriceKobo: number;
  quantityInStock: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCatalogueItemInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  productName: string;
  category: ProductCategory;
  unit: string;
  unitPriceKobo: number;
  quantityInStock?: number | undefined;
}

export interface MaterialsOrder {
  id: string;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  clientName: string;
  orderItems: string;
  totalKobo: number;
  creditAccountId: string | null;
  deliveryAddress: string | null;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMaterialsOrderInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  clientName: string;
  orderItems?: string | undefined;
  totalKobo: number;
  creditAccountId?: string | undefined;
  deliveryAddress?: string | undefined;
}

export interface ContractorCreditAccount {
  id: string;
  workspaceId: string;
  tenantId: string;
  contractorPhone: string;
  contractorName: string;
  creditLimitKobo: number;
  balanceOwingKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateContractorCreditInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  contractorPhone: string;
  contractorName: string;
  creditLimitKobo: number;
  balanceOwingKobo?: number | undefined;
}

export const VALID_BUILDING_MATERIALS_TRANSITIONS: Record<BuildingMaterialsFSMState, BuildingMaterialsFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['cac_verified', 'suspended'],
  cac_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidBuildingMaterialsTransition(from: BuildingMaterialsFSMState, to: BuildingMaterialsFSMState): boolean {
  return VALID_BUILDING_MATERIALS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim building materials profile' };
  return { allowed: true };
}

export function guardClaimedToCacVerified(ctx: { cacRc: string | null }): { allowed: boolean; reason?: string } {
  if (!ctx.cacRc) return { allowed: false, reason: 'CAC RC number required for cac_verified transition' };
  return { allowed: true };
}
