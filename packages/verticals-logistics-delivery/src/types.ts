/**
 * @webwaka/verticals-logistics-delivery — Domain types (M9)
 * FSM: seeded → claimed → frsc_verified → active → suspended
 * AI: L2 — ROUTE_EFFICIENCY (aggregate by zone), CASH_FLOW_FORECAST; no sender/recipient refs (P13)
 * P9: all monetary in kobo; weight in integer grams
 * P13: sender_ref_id, recipient_ref_id, driver_ref_id opaque
 * T3: tenant_id always present
 */

export type LogisticsDeliveryFSMState = 'seeded' | 'claimed' | 'frsc_verified' | 'active' | 'suspended';
export type ServiceType = 'same_day' | 'next_day' | 'interstate' | 'all';
export type PackageType = 'parcel' | 'document' | 'fragile' | 'bulk';
export type DeliveryStatus = 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'returned' | 'failed';
export type VehicleType = 'motorcycle' | 'car' | 'van' | 'truck';

const FSM_TRANSITIONS: Record<LogisticsDeliveryFSMState, LogisticsDeliveryFSMState[]> = {
  seeded: ['claimed'], claimed: ['frsc_verified'], frsc_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidLogisticsDeliveryTransition(from: LogisticsDeliveryFSMState, to: LogisticsDeliveryFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Logistics AI capped at L2' };
  return { allowed: true };
}

export interface LogisticsDeliveryProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; frscCert: string | null;
  cacRc: string | null; serviceType: ServiceType; status: LogisticsDeliveryFSMState; createdAt: number; updatedAt: number;
}
export interface CreateLogisticsDeliveryInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; serviceType?: ServiceType;
  frscCert?: string; cacRc?: string;
}
export interface DeliveryOrder {
  id: string; profileId: string; tenantId: string; senderRefId: string; recipientRefId: string;
  pickupAddress: string; deliveryAddress: string; packageType: PackageType; weightGrams: number;
  declaredValueKobo: number; deliveryFeeKobo: number; pickupDate: number | null; deliveryDate: number | null;
  status: DeliveryStatus; createdAt: number; updatedAt: number;
}
export interface DeliveryFleetVehicle {
  id: string; profileId: string; tenantId: string; vehicleType: VehicleType; plateNumber: string;
  capacityKgX100: number; driverRefId: string | null; status: string; createdAt: number; updatedAt: number;
}
