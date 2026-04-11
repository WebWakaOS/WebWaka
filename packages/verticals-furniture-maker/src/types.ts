/**
 * @webwaka/verticals-furniture-maker — Domain types (M10)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 — SALES_FORECAST, INVENTORY_REORDER_ALERT; no client_ref_id (P13)
 * P9: all monetary in kobo integers
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type FurnitureMakerFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type FurnitureOrderStatus = 'intake' | 'design' | 'production' | 'finishing' | 'ready' | 'delivered';

const FSM_TRANSITIONS: Record<FurnitureMakerFSMState, FurnitureMakerFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidFurnitureMakerTransition(from: FurnitureMakerFSMState, to: FurnitureMakerFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Furniture maker AI capped at L2' };
  return { allowed: true };
}

export interface FurnitureMakerProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; cacRc: string | null;
  sonCert: string | null; workshopType: string; state: string | null; lga: string | null;
  status: FurnitureMakerFSMState; createdAt: number; updatedAt: number;
}
export interface CreateFurnitureMakerInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string;
  cacRc?: string; sonCert?: string; workshopType?: string; state?: string; lga?: string;
}
export interface FurnitureOrder {
  id: string; profileId: string; tenantId: string; clientRefId: string; itemType: string;
  quantity: number; unitPriceKobo: number; totalKobo: number; depositKobo: number;
  deliveryDate: number | null; status: FurnitureOrderStatus; createdAt: number; updatedAt: number;
}
export interface FurnitureProductionStage {
  id: string; orderId: string; tenantId: string; stage: string;
  startedAt: number | null; completedAt: number | null; notes: string | null; createdAt: number;
}
export interface FurnitureMaterialInventory {
  id: string; profileId: string; tenantId: string; materialName: string; unit: string;
  quantityInStock: number; unitCostKobo: number; reorderLevel: number; supplier: string | null;
  createdAt: number; updatedAt: number;
}
