/**
 * @webwaka/verticals-handyman — Domain types (M9)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L1-L2 — CASH_FLOW_FORECAST; aggregate job counts only; no client_ref_id (P13)
 * P9: all monetary in kobo integers
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type HandymanFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type TradeType = 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'general' | 'all';
export type JobStatus = 'logged' | 'in_progress' | 'completed' | 'warranty_claim';

const FSM_TRANSITIONS: Record<HandymanFSMState, HandymanFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidHandymanTransition(from: HandymanFSMState, to: HandymanFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Handyman AI capped at L2' };
  return { allowed: true };
}

export interface HandymanProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; tradeType: TradeType;
  corenAwareness: string | null; nabtebCert: string | null; cacRc: string | null;
  state: string | null; lga: string | null; status: HandymanFSMState; createdAt: number; updatedAt: number;
}
export interface CreateHandymanInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; tradeType?: TradeType;
  corenAwareness?: string; nabtebCert?: string; cacRc?: string; state?: string; lga?: string;
}
export interface HandymanJob {
  id: string; profileId: string; tenantId: string; clientRefId: string; jobType: string;
  description: string | null; materialCostKobo: number; labourCostKobo: number; totalKobo: number;
  jobDate: number; completedDate: number | null; warrantyDays: number; status: JobStatus;
  createdAt: number; updatedAt: number;
}
export interface HandymanMaterial {
  id: string; profileId: string; tenantId: string; materialName: string; unit: string;
  quantity: number; unitCostKobo: number; reorderLevel: number; createdAt: number; updatedAt: number;
}
