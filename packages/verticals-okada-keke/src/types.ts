/**
 * @webwaka/verticals-okada-keke — Domain types (M11) [Set J rewrite]
 * FSM: seeded → claimed → nurtw_registered → active → suspended
 * AI: L2 — CASH_FLOW_FORECAST; aggregate daily returns only — no driver_ref (P13)
 * P9: all monetary in kobo integers
 * P13: driver_ref_id, owner_ref_id opaque
 * T3: tenant_id always present
 * State ban awareness: Lagos 2022 okada ban; Kano restrictions
 */

export type OkadaKekeFSMState = 'seeded' | 'claimed' | 'nurtw_registered' | 'active' | 'suspended';
export type VehicleType = 'okada' | 'keke' | 'both';
export type BanStatus = 'active' | 'banned' | 'restricted';

const FSM_TRANSITIONS: Record<OkadaKekeFSMState, OkadaKekeFSMState[]> = {
  seeded: ['claimed'], claimed: ['nurtw_registered'], nurtw_registered: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidOkadaKekeTransition(from: OkadaKekeFSMState, to: OkadaKekeFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardStateBanCheck(input: { state: string | null; vehicleType: string; banStatus: string }): GuardResult {
  if (input.banStatus === 'banned') return { allowed: false, reason: `${input.vehicleType} operations are banned in this state/LGA` };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Okada/Keke AI capped at L2' };
  return { allowed: true };
}
export function guardNoDriverRefToAi(input: { includesDriverRef?: boolean }): GuardResult {
  if (input.includesDriverRef) return { allowed: false, reason: 'Driver ref must not be passed to AI (P13)' };
  return { allowed: true };
}

export interface OkadaKekeProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; nurtwMembership: string | null;
  lvaaReg: string | null; cacRc: string | null; vehicleCategory: VehicleType;
  operatingState: string | null; status: OkadaKekeFSMState; createdAt: number; updatedAt: number;
}
export interface CreateOkadaKekeInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; vehicleCategory?: VehicleType;
  nurtwMembership?: string; lvaaReg?: string; cacRc?: string; operatingState?: string;
}
export interface OkadaKekeVehicle {
  id: string; profileId: string; tenantId: string; category: VehicleType; makeModel: string | null;
  plateNumber: string; vehicleYear: number | null; motorVehicleLicence: string | null;
  insurancePolicyRef: string | null; status: string; createdAt: number; updatedAt: number;
}
export interface OkadaKekePilot {
  id: string; profileId: string; tenantId: string; pilotRefId: string; licenceNumber: string | null;
  vehicleId: string | null; lasgRiderBadge: string | null; status: string; createdAt: number; updatedAt: number;
}
export interface OkadaKekeTrip {
  id: string; profileId: string; tenantId: string; pilotId: string; passengerRefId: string;
  tripDate: number; fareKobo: number; paymentMethod: string; status: string; createdAt: number;
}
export interface OkadaKekeFleetVehicle {
  id: string; profileId: string; tenantId: string; vehicleType: VehicleType; plateNumber: string | null;
  regNumber: string | null; ownerRefId: string | null; driverRefId: string | null;
  status: string; createdAt: number; updatedAt: number;
}
export interface OkadaKekeDailyReturn {
  id: string; profileId: string; tenantId: string; vehicleId: string; driverRefId: string;
  returnDate: number; revenueKobo: number; levyKobo: number; netKobo: number; createdAt: number;
}
export interface OkadaKekeLevy {
  id: string; profileId: string; tenantId: string; levyType: string;
  amountKobo: number; frequency: string; createdAt: number; updatedAt: number;
}
