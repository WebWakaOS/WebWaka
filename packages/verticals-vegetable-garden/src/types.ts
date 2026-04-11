/**
 * @webwaka/verticals-vegetable-garden — types + FSM guards (M12)
 * FSM: seeded → claimed → active (3-state informal; FMARD extension code optional)
 * ADL-010: AI at L2 maximum — harvest forecasts and price alerts advisory only
 * P13: no buyer details in AI — aggregate crop stats only
 * P9: all kobo values must be integers; weights as integer grams; area as integer sqm
 * T3: all queries scoped to tenant_id
 * KYC: Tier 1 for basic operations; Tier 2 for bulk buyer contracts above ₦200,000
 */

export type VegetableGardenFSMState =
  | 'seeded'
  | 'claimed'
  | 'active';

export type PlotStatus = 'growing' | 'harvested' | 'resting';
export type InputType = 'seeds' | 'fertilizer' | 'pesticide';

const FSM_TRANSITIONS: Record<VegetableGardenFSMState, VegetableGardenFSMState[]> = {
  seeded:  ['claimed'],
  claimed: ['active'],
  active:  [],
};

export function isValidVegetableGardenTransition(
  from: VegetableGardenFSMState,
  to: VegetableGardenFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToActive(input: {
  kycTier: number;
}): GuardResult {
  if (input.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to activate vegetable garden' };
  return { allowed: true };
}

export function guardKycForBulkContract(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for bulk buyer contracts above ₦200,000' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: vegetable garden AI capped at L2 — no automated purchase/sell actions' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'ADL-010: agricultural AI capped at L2 advisory' };
  }
  return { allowed: true };
}

export function guardIntegerGrams(grams: number): GuardResult {
  if (!Number.isInteger(grams) || grams < 0) return { allowed: false, reason: 'Weight must be a non-negative integer grams' };
  return { allowed: true };
}

export function guardIntegerSqm(sqm: number): GuardResult {
  if (!Number.isInteger(sqm) || sqm <= 0) return { allowed: false, reason: 'Area must be a positive integer sqm' };
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface VegetableGardenProfile {
  id: string; workspaceId: string; tenantId: string;
  farmName: string; stateAgricReg: string | null; fmardExtensionCode: string | null;
  plotCount: number;
  status: VegetableGardenFSMState; createdAt: number; updatedAt: number;
}

export interface FarmPlot {
  id: string; profileId: string; tenantId: string;
  plotName: string; areaSqm: number; cropType: string;
  plantingDate: number | null; expectedHarvestDate: number | null;
  status: PlotStatus; createdAt: number; updatedAt: number;
}

export interface FarmInput {
  id: string; profileId: string; tenantId: string;
  plotId: string; inputType: InputType; quantityGrams: number;
  costKobo: number; inputDate: number; createdAt: number;
}

export interface FarmHarvest {
  id: string; profileId: string; tenantId: string;
  plotId: string; harvestDate: number; weightGrams: number;
  cropType: string; createdAt: number;
}

export interface FarmSale {
  id: string; profileId: string; tenantId: string;
  buyerPhone: string; cropType: string; weightGrams: number;
  pricePerKgKobo: number; totalKobo: number; saleDate: number; createdAt: number;
}

export interface CreateVegetableGardenInput {
  id?: string; workspaceId: string; tenantId: string;
  farmName: string; stateAgricReg?: string; fmardExtensionCode?: string; plotCount?: number;
}

export interface CreatePlotInput {
  id?: string; profileId: string; tenantId: string;
  plotName: string; areaSqm: number; cropType: string;
  plantingDate?: number; expectedHarvestDate?: number;
}

export interface CreateInputInput {
  id?: string; profileId: string; tenantId: string;
  plotId: string; inputType: InputType; quantityGrams: number;
  costKobo: number; inputDate: number;
}

export interface CreateHarvestInput {
  id?: string; profileId: string; tenantId: string;
  plotId: string; harvestDate: number; weightGrams: number; cropType: string;
}

export interface CreateSaleInput {
  id?: string; profileId: string; tenantId: string;
  buyerPhone: string; cropType: string; weightGrams: number;
  pricePerKgKobo: number; totalKobo: number; saleDate: number;
}
