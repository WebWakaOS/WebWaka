/**
 * @webwaka/verticals-cold-room — types + FSM guards (M10)
 * FSM: seeded → claimed → nafdac_verified → active → suspended
 * ADL-010: AI at L2 maximum — temperature anomaly alerts informational only
 * Temperature stored as integer millidegrees Celsius (no floats)
 * P9: all kobo values must be integers; capacity as integer kg
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for storage billing; Tier 3 for bulk commodity collateral above ₦50M
 */

export type ColdRoomFSMState =
  | 'seeded'
  | 'claimed'
  | 'nafdac_verified'
  | 'active'
  | 'suspended';

export type UnitStatus = 'active' | 'maintenance' | 'fault';
export type AgreementStatus = 'active' | 'withdrawn';

const FSM_TRANSITIONS: Record<ColdRoomFSMState, ColdRoomFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['nafdac_verified'],
  nafdac_verified: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidColdRoomTransition(
  from: ColdRoomFSMState,
  to: ColdRoomFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNafdacVerified(input: {
  nafdacColdChainCert: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.nafdacColdChainCert) return { allowed: false, reason: 'NAFDAC cold chain certificate required' };
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for NAFDAC verification' };
  return { allowed: true };
}

export function guardKycForBulkCollateral(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for bulk commodity collateral above ₦50M' };
  return { allowed: true };
}

export function guardIntegerTemperature(tempMc: number): GuardResult {
  if (!Number.isInteger(tempMc)) return { allowed: false, reason: 'Temperature must be an integer millidegrees Celsius (no floats)' };
  return { allowed: true };
}

export function guardIntegerCapacity(kg: number): GuardResult {
  if (!Number.isInteger(kg) || kg < 0) return { allowed: false, reason: 'Capacity must be a non-negative integer kg' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: cold-room AI capped at L2 — no automated intervention' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface ColdRoomProfile {
  id: string; workspaceId: string; tenantId: string;
  facilityName: string; nafdacColdChainCert: string | null; sonCert: string | null;
  capacityKg: number; cacRc: string | null;
  status: ColdRoomFSMState; createdAt: number; updatedAt: number;
}

export interface ColdRoomUnit {
  id: string; profileId: string; tenantId: string;
  unitNumber: string; capacityKg: number; currentTempMc: number;
  status: UnitStatus; createdAt: number; updatedAt: number;
}

export interface ColdStorageAgreement {
  id: string; profileId: string; tenantId: string;
  clientPhone: string; commodityType: string; quantityKg: number;
  dailyRateKobo: number; entryDate: number; exitDate: number | null;
  totalChargedKobo: number; status: AgreementStatus; createdAt: number; updatedAt: number;
}

export interface ColdTempLog {
  id: string; profileId: string; tenantId: string;
  unitId: string; logTime: number; temperatureMc: number; alertFlag: boolean; createdAt: number;
}

export interface CreateColdRoomInput {
  id?: string; workspaceId: string; tenantId: string;
  facilityName: string; nafdacColdChainCert?: string; sonCert?: string;
  capacityKg?: number; cacRc?: string;
}

export interface CreateUnitInput {
  id?: string; profileId: string; tenantId: string;
  unitNumber: string; capacityKg: number; currentTempMc?: number;
}

export interface CreateAgreementInput {
  id?: string; profileId: string; tenantId: string;
  clientPhone: string; commodityType: string; quantityKg: number;
  dailyRateKobo: number; entryDate: number;
}

export interface CreateTempLogInput {
  id?: string; profileId: string; tenantId: string;
  unitId: string; logTime: number; temperatureMc: number; alertFlag?: boolean;
}
