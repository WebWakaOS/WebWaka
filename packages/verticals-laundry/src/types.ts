/**
 * @webwaka/verticals-laundry — Domain types (M10)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 — DEMAND_PLANNING, CASH_FLOW_FORECAST; no client_ref_id (P13)
 * P9: all monetary in kobo integers
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type LaundryFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type LaundryOrderStatus = 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'delivered';

const FSM_TRANSITIONS: Record<LaundryFSMState, LaundryFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidLaundryTransition(from: LaundryFSMState, to: LaundryFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Laundry AI capped at L2' };
  return { allowed: true };
}

export interface LaundryProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; cacRc: string | null;
  serviceType: string; status: LaundryFSMState; createdAt: number; updatedAt: number;
}
export interface CreateLaundryInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; serviceType?: string; cacRc?: string;
}
export interface LaundryPriceItem {
  id: string; profileId: string; tenantId: string; itemType: string; service: string;
  priceKobo: number; createdAt: number; updatedAt: number;
}
export interface LaundryOrder {
  id: string; profileId: string; tenantId: string; clientRefId: string; items: string;
  pickupDate: number | null; deliveryDate: number | null; totalKobo: number;
  status: LaundryOrderStatus; createdAt: number; updatedAt: number;
}
export interface LaundrySubscription {
  id: string; profileId: string; tenantId: string; clientRefId: string; packageName: string;
  frequency: string; priceKobo: number; itemsIncluded: number; startDate: number;
  endDate: number | null; status: string; createdAt: number;
}
