/**
 * @webwaka/verticals-motorcycle-accessories — Domain types (M12)
 * FSM: seeded → claimed → son_verified → active → suspended
 * AI: L2 — INVENTORY_REORDER_ALERT, SALES_FORECAST; no customer_ref_id (P13)
 * P9: all monetary in kobo integers
 * P13: customer_ref_id opaque
 * T3: tenant_id always present
 */

export type MotorcycleAccessoriesFSMState = 'seeded' | 'claimed' | 'son_verified' | 'active' | 'suspended';
export type AccessoryCategory = 'helmet' | 'engine' | 'electrical' | 'chain' | 'exhaust' | 'body' | 'general';

const FSM_TRANSITIONS: Record<MotorcycleAccessoriesFSMState, MotorcycleAccessoriesFSMState[]> = {
  seeded: ['claimed'], claimed: ['son_verified'], son_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidMotorcycleAccessoriesTransition(from: MotorcycleAccessoriesFSMState, to: MotorcycleAccessoriesFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Motorcycle accessories AI capped at L2' };
  return { allowed: true };
}

export interface MotorcycleAccessoriesProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; sonCert: string | null;
  cacRc: string | null; status: MotorcycleAccessoriesFSMState; createdAt: number; updatedAt: number;
}
export interface CreateMotorcycleAccessoriesInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; sonCert?: string; cacRc?: string;
}
export interface MotorcycleAccessoriesInventoryItem {
  id: string; profileId: string; tenantId: string; partName: string; partNumber: string | null;
  brand: string | null; category: AccessoryCategory; qtyInStock: number;
  costPriceKobo: number; retailPriceKobo: number; wholesalePriceKobo: number;
  reorderLevel: number; createdAt: number; updatedAt: number;
}
export interface MotorcycleAccessoriesSale {
  id: string; profileId: string; tenantId: string; customerRefId: string | null;
  items: string; totalKobo: number; saleDate: number; isWholesale: boolean; createdAt: number;
}
