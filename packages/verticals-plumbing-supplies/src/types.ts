/**
 * @webwaka/verticals-plumbing-supplies — Domain types (M12)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 — SALES_FORECAST, INVENTORY_REORDER; no client_ref_id (P13)
 * P9: all monetary in kobo; pipe sizes in integer mm
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type PlumbingSuppliesFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type MaterialType = 'PVC' | 'copper' | 'steel' | 'brass' | 'PPR';
export type PlumbingOrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered';

const FSM_TRANSITIONS: Record<PlumbingSuppliesFSMState, PlumbingSuppliesFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidPlumbingSuppliesTransition(from: PlumbingSuppliesFSMState, to: PlumbingSuppliesFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Plumbing supplies AI capped at L2' };
  return { allowed: true };
}

export interface PlumbingSuppliesProfile {
  id: string; workspaceId: string; tenantId: string; companyName: string; sonCert: string | null;
  cacRc: string | null; status: PlumbingSuppliesFSMState; createdAt: number; updatedAt: number;
}
export interface CreatePlumbingSuppliesInput {
  id?: string; workspaceId: string; tenantId: string; companyName?: string; sonCert?: string; cacRc?: string;
  businessName?: string;
}
export interface PlumbingInventoryItem {
  id: string; profileId: string; tenantId: string; productName: string; productCode: string | null;
  materialType: MaterialType; sizeMm: number; qtyInStock: number; costPriceKobo: number;
  retailPriceKobo: number; reorderLevel: number; createdAt: number; updatedAt: number;
}
export interface PlumbingOrder {
  id: string; profileId: string; tenantId: string; clientRefId: string; items: string;
  totalKobo: number; orderDate: number; deliveryDate: number | null; isBulk: boolean;
  status: PlumbingOrderStatus; createdAt: number; updatedAt: number;
}
