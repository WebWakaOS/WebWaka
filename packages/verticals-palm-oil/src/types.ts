/**
 * @webwaka/verticals-palm-oil — types + FSM guards (M12)
 * FSM: seeded → claimed → nafdac_verified → active → suspended
 * ADL-010: AI at L2 maximum — yield forecasts and price alerts advisory only
 * P13: no supplier details in AI — aggregate kg/ml stats only
 * P9: all kobo values must be integers; FFB weight as integer kg; oil as integer ml
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for sales; Tier 3 for export operations
 */

export type PalmOilFSMState =
  | 'seeded'
  | 'claimed'
  | 'nafdac_verified'
  | 'active'
  | 'suspended';

export type FfbSource = 'own_farm' | 'purchased';

const FSM_TRANSITIONS: Record<PalmOilFSMState, PalmOilFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['nafdac_verified'],
  nafdac_verified: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidPalmOilTransition(
  from: PalmOilFSMState,
  to: PalmOilFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNafdacVerified(input: {
  nafdacProductNumber: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.nafdacProductNumber) return { allowed: false, reason: 'NAFDAC product number required' };
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for NAFDAC verification' };
  return { allowed: true };
}

export function guardKycForExport(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for palm oil export operations' };
  return { allowed: true };
}

export function guardIntegerKg(kg: number): GuardResult {
  if (!Number.isInteger(kg) || kg < 0) return { allowed: false, reason: 'Weight must be a non-negative integer kg' };
  return { allowed: true };
}

export function guardIntegerMl(ml: number): GuardResult {
  if (!Number.isInteger(ml) || ml < 0) return { allowed: false, reason: 'Oil volume must be a non-negative integer ml (no float litres)' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: palm oil AI capped at L2 — no automated trading decisions' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface PalmOilProfile {
  id: string; workspaceId: string; tenantId: string;
  millName: string; nafdacProductNumber: string | null; niforAffiliation: string | null;
  stateAgricExtensionReg: string | null;
  status: PalmOilFSMState; createdAt: number; updatedAt: number;
}

export interface PalmFfbIntake {
  id: string; profileId: string; tenantId: string;
  ffbSource: FfbSource; quantityKg: number; costPerKgKobo: number;
  intakeDate: number; supplierPhone: string | null; createdAt: number;
}

export interface PalmProductionBatch {
  id: string; profileId: string; tenantId: string;
  processingDate: number; ffbInputKg: number; oilOutputMl: number;
  kernelOutputKg: number; productionCostKobo: number; createdAt: number;
}

export interface PalmOilSale {
  id: string; profileId: string; tenantId: string;
  buyerPhone: string; quantityMl: number; pricePerLitreKobo: number;
  totalKobo: number; saleDate: number; createdAt: number;
}

export interface CreatePalmOilInput {
  id?: string; workspaceId: string; tenantId: string;
  millName: string; nafdacProductNumber?: string; niforAffiliation?: string;
  stateAgricExtensionReg?: string;
}

export interface CreateFfbIntakeInput {
  id?: string; profileId: string; tenantId: string;
  ffbSource?: FfbSource; quantityKg: number; costPerKgKobo: number;
  intakeDate: number; supplierPhone?: string;
}

export interface CreateBatchInput {
  id?: string; profileId: string; tenantId: string;
  processingDate: number; ffbInputKg: number; oilOutputMl: number;
  kernelOutputKg?: number; productionCostKobo: number;
}

export interface CreateSaleInput {
  id?: string; profileId: string; tenantId: string;
  buyerPhone: string; quantityMl: number; pricePerLitreKobo: number;
  totalKobo: number; saleDate: number;
}
