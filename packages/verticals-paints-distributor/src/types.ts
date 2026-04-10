/**
 * @webwaka/verticals-paints-distributor — Domain types (M12)
 * FSM: seeded → claimed → son_verified → active → suspended
 * AI: L2 — SALES_FORECAST, INVENTORY_REORDER; no client_ref_id (P13)
 * P9: all monetary in kobo; container size in litres×100 (integer)
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type PaintsDistributorFSMState = 'seeded' | 'claimed' | 'son_verified' | 'active' | 'suspended';
export type FinishType = 'matt' | 'gloss' | 'eggshell' | 'primer' | 'satin';
export type PaintsOrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered';

const FSM_TRANSITIONS: Record<PaintsDistributorFSMState, PaintsDistributorFSMState[]> = {
  seeded: ['claimed'], claimed: ['son_verified'], son_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidPaintsDistributorTransition(from: PaintsDistributorFSMState, to: PaintsDistributorFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Paints distributor AI capped at L2' };
  return { allowed: true };
}

export interface PaintsDistributorProfile {
  id: string; workspaceId: string; tenantId: string; companyName: string; sonCert: string | null;
  nafdacRef: string | null; cacRc: string | null; status: PaintsDistributorFSMState; createdAt: number; updatedAt: number;
}
export interface CreatePaintsDistributorInput {
  id?: string; workspaceId: string; tenantId: string; companyName?: string;
  sonCert?: string; nafdacRef?: string; cacRc?: string;
  businessName?: string;
}
export interface PaintsInventoryItem {
  id: string; profileId: string; tenantId: string; brandName: string; colourCode: string | null;
  finishType: FinishType; containerLitresX100: number; qtyInStock: number;
  costPriceKobo: number; retailPriceKobo: number; reorderLevel: number; createdAt: number; updatedAt: number;
}
export interface PaintsOrder {
  id: string; profileId: string; tenantId: string; clientRefId: string; items: string;
  totalKobo: number; orderDate: number; deliveryDate: number | null; isBulk: boolean;
  status: PaintsOrderStatus; createdAt: number; updatedAt: number;
}
