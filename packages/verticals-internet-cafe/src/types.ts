/**
 * @webwaka/verticals-internet-cafe — Domain types (M12)
 * FSM: seeded → claimed → ncc_registered → active → suspended
 * AI: L1-L2 — VENUE_UTILIZATION_REPORT, CASH_FLOW_FORECAST; no customer_ref_id (P13)
 * P9: all monetary in kobo; session duration in integer minutes
 * P13: customer_ref_id opaque
 * T3: tenant_id always present
 */

export type InternetCafeFSMState = 'seeded' | 'claimed' | 'ncc_registered' | 'active' | 'suspended';
export type StationType = 'computer' | 'printer' | 'scanner';
export type StationStatus = 'available' | 'in_use' | 'maintenance';
export type SessionStatus = 'active' | 'completed' | 'terminated';

const FSM_TRANSITIONS: Record<InternetCafeFSMState, InternetCafeFSMState[]> = {
  seeded: ['claimed'], claimed: ['ncc_registered'], ncc_registered: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidInternetCafeTransition(from: InternetCafeFSMState, to: InternetCafeFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Internet café AI capped at L2' };
  return { allowed: true };
}

export interface InternetCafeProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; nccReg: string | null;
  cacRc: string | null; workstationCount: number; status: InternetCafeFSMState; createdAt: number; updatedAt: number;
}
export interface CreateInternetCafeInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; workstationCount?: number;
  nccReg?: string; cacRc?: string;
}
export interface CafeStation {
  id: string; profileId: string; tenantId: string; stationNumber: string; stationType: StationType;
  status: StationStatus; createdAt: number; updatedAt: number;
}
export interface CafeSession {
  id: string; profileId: string; tenantId: string; stationId: string; customerRefId: string;
  startTime: number; durationMinutes: number; perMinuteKobo: number; sessionTotalKobo: number;
  status: SessionStatus; createdAt: number;
}
export interface CafeServiceOrder {
  id: string; profileId: string; tenantId: string; customerRefId: string; serviceType: string;
  quantity: number; unitPriceKobo: number; totalKobo: number; orderDate: number; createdAt: number;
}
