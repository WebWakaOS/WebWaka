/**
 * @webwaka/verticals-iron-steel — Domain types (M12)
 * FSM: seeded → claimed → son_verified → active → suspended
 * AI: L2 — SALES_FORECAST, INVENTORY_REORDER; no client_ref_id (P13)
 * P9: all monetary in kobo; lengths in mm INTEGER; thickness in mm×10 INTEGER
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type IronSteelFSMState = 'seeded' | 'claimed' | 'son_verified' | 'active' | 'suspended';
export type IronSteelOrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered';

const FSM_TRANSITIONS: Record<IronSteelFSMState, IronSteelFSMState[]> = {
  seeded: ['claimed'], claimed: ['son_verified'], son_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidIronSteelTransition(from: IronSteelFSMState, to: IronSteelFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardClaimedToSonVerified(input: { sonCert: string | null }): GuardResult {
  if (!input.sonCert?.trim()) return { allowed: false, reason: 'SON certification required' };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Iron & steel AI capped at L2' };
  return { allowed: true };
}

export interface IronSteelProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; sonCert: string | null;
  cacRc: string | null; productType: string; status: IronSteelFSMState; createdAt: number; updatedAt: number;
}
export interface CreateIronSteelInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; productType?: string;
  sonCert?: string; cacRc?: string;
}
export interface IronSteelInventoryItem {
  id: string; profileId: string; tenantId: string; productName: string; grade: string | null;
  lengthMm: number; thicknessMm10: number; qtyInStock: number; unitPriceKobo: number;
  reorderLevel: number; createdAt: number; updatedAt: number;
}
export interface IronSteelOrder {
  id: string; profileId: string; tenantId: string; clientRefId: string; items: string;
  totalKobo: number; orderDate: number; deliveryDate: number | null; isBulk: boolean;
  status: IronSteelOrderStatus; createdAt: number; updatedAt: number;
}
