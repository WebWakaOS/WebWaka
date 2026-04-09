/**
 * @webwaka/verticals-electrical-fittings — Domain types
 * M12 Commerce P3 — Task V-COMM-EXT-C6
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * KYC: Tier 1 retail; Tier 2 contractor credit
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type ElectricalFittingsFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type ProductType = 'cable' | 'switch' | 'socket' | 'breaker' | 'conduit' | 'other';
export type OrderStatus = 'placed' | 'confirmed' | 'dispatched' | 'delivered' | 'settled';

export interface ElectricalFittingsProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  cacRc: string | null;
  sonDealerReg: string | null;
  marketLocation: string | null;
  status: ElectricalFittingsFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateElectricalFittingsInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  cacRc?: string | undefined;
  sonDealerReg?: string | undefined;
  marketLocation?: string | undefined;
}

export interface UpdateElectricalFittingsInput {
  companyName?: string | undefined;
  cacRc?: string | null | undefined;
  sonDealerReg?: string | null | undefined;
  marketLocation?: string | null | undefined;
  status?: ElectricalFittingsFSMState | undefined;
}

export interface ElectricalCatalogueItem {
  id: string;
  workspaceId: string;
  tenantId: string;
  productName: string;
  type: ProductType;
  sonTypeNumber: string | null;
  unit: string;
  unitPriceKobo: number;
  quantityInStock: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateElectricalCatalogueItemInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  productName: string;
  type: ProductType;
  sonTypeNumber?: string | undefined;
  unit: string;
  unitPriceKobo: number;
  quantityInStock?: number | undefined;
}

export interface ElectricalOrder {
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

export interface CreateElectricalOrderInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  items?: string | undefined;
  totalKobo: number;
  creditAccountId?: string | undefined;
}

export const VALID_ELECTRICAL_FITTINGS_TRANSITIONS: Record<ElectricalFittingsFSMState, ElectricalFittingsFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['cac_verified', 'suspended'],
  cac_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidElectricalFittingsTransition(from: ElectricalFittingsFSMState, to: ElectricalFittingsFSMState): boolean {
  return VALID_ELECTRICAL_FITTINGS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim electrical fittings profile' };
  return { allowed: true };
}

export function guardClaimedToCacVerified(ctx: { cacRc: string | null }): { allowed: boolean; reason?: string } {
  if (!ctx.cacRc) return { allowed: false, reason: 'CAC RC number required for cac_verified transition' };
  return { allowed: true };
}
