/**
 * @webwaka/verticals-laundry-service — Domain types (M11)
 * Laundromat / coin/card laundry — distinct from laundry dry-cleaner vertical
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 — VENUE_UTILIZATION_REPORT, CASH_FLOW_FORECAST; no client_ref_id (P13)
 * P9: all monetary in kobo; capacity in kg×100 integers
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type LaundryServiceFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type MachineType = 'washer' | 'dryer' | 'washer_dryer';
export type MachineStatus = 'available' | 'in_use' | 'maintenance';
export type SessionStatus = 'active' | 'completed' | 'cancelled';

const FSM_TRANSITIONS: Record<LaundryServiceFSMState, LaundryServiceFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidLaundryServiceTransition(from: LaundryServiceFSMState, to: LaundryServiceFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Laundry service AI capped at L2' };
  return { allowed: true };
}

export interface LaundryServiceProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; cacRc: string | null;
  machineCount?: number; capacityKgPerLoadX100?: number; status: LaundryServiceFSMState; createdAt: number; updatedAt: number;
  serviceArea: string | null;
}
export interface CreateLaundryServiceInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string;
  cacRc?: string; machineCount?: number; capacityKgPerLoadX100?: number;
  serviceArea?: string;
}
export interface LaundryServiceMachine {
  id: string; profileId: string; tenantId: string; machineNumber: string; machineType: MachineType;
  capacityKgX100: number; status: MachineStatus; createdAt: number; updatedAt: number;
}
export interface LaundryServiceSession {
  id: string; profileId: string; tenantId: string; machineId: string; clientRefId: string;
  loadCount: number; washPriceKobo: number; dryPriceKobo: number; totalKobo: number;
  startTime: number; endTime: number | null; status: SessionStatus; createdAt: number;
}
export interface LaundryServiceSubscription {
  id: string; profileId: string; tenantId: string; clientRefId: string;
  loadsPerMonth: number; monthlyPriceKobo: number; startDate: number; endDate: number | null;
  status: string; createdAt: number;
}

export interface LaundryServiceOrder {
  id: string; profileId: string; tenantId: string; customerRefId: string; itemCount: number;
  itemTypes: string | null; totalKobo: number; pickupDate: number | null; returnDate: number | null;
  expressService: boolean; status: 'pending' | 'picked_up' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';
  createdAt: number; updatedAt: number;
}
export type LaundryServiceRoute = LaundryServiceProfile;
