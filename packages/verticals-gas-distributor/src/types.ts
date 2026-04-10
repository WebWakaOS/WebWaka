/**
 * @webwaka/verticals-gas-distributor — Domain types (M10)
 * FSM: seeded → claimed → dpr_verified → active → suspended
 * AI: L2 — INVENTORY_REORDER_ALERT, CASH_FLOW_FORECAST; no customer_ref_id (P13)
 * P9: all monetary in kobo integers
 * CRITICAL: cylinder sizes in INTEGER GRAMS — NEVER float kg
 * P13: customer_ref_id opaque
 * T3: tenant_id always present
 * KYC: Tier 2 retail; Tier 3 bulk above ₦5M
 */

export type GasDistributorFSMState = 'seeded' | 'claimed' | 'dpr_verified' | 'active' | 'suspended';
export type GasOrderStatus = 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'returned';
export const VALID_CYLINDER_SIZES_GRAMS = [3000, 5000, 12500, 25000, 50000] as const;
export type CylinderSizeGrams = typeof VALID_CYLINDER_SIZES_GRAMS[number];

const FSM_TRANSITIONS: Record<GasDistributorFSMState, GasDistributorFSMState[]> = {
  seeded: ['claimed'], claimed: ['dpr_verified'], dpr_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidGasDistributorTransition(from: GasDistributorFSMState, to: GasDistributorFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardNoCylinderSizeFloat(input: { cylinderSizeGrams: unknown }): GuardResult {
  if (typeof input.cylinderSizeGrams !== 'number' || !Number.isInteger(input.cylinderSizeGrams))
    return { allowed: false, reason: 'cylinder_size_grams must be integer grams — no floats (P9)' };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Gas distributor AI capped at L2' };
  return { allowed: true };
}

export interface GasDistributorProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string;
  dprDealerLicence: string | null; nuprcRef: string | null; lpgassocMembership: string | null;
  cacRc: string | null; status: GasDistributorFSMState; createdAt: number; updatedAt: number;
}
export interface CreateGasDistributorInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string;
  dprDealerLicence?: string; nuprcRef?: string; lpgassocMembership?: string; cacRc?: string;
}
export interface GasInventoryItem {
  id: string; profileId: string; tenantId: string; cylinderSizeGrams: number; stockCount: number;
  refillPriceKobo: number; bulkPriceKobo: number; reorderLevel: number; createdAt: number; updatedAt: number;
}
export interface GasOrder {
  id: string; profileId: string; tenantId: string; customerRefId: string;
  cylinderSizeGrams: number; quantity: number; unitPriceKobo: number; totalKobo: number;
  orderDate: number; deliveryDate: number | null; isBulk: boolean; status: GasOrderStatus;
  createdAt: number; updatedAt: number;
}
export interface GasSafetyLog {
  id: string; profileId: string; tenantId: string; inspectionDate: number;
  inspectorRef: string | null; cylindersInspected: number; passed: boolean; notes: string | null; createdAt: number;
}
