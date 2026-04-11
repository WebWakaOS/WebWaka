/**
 * @webwaka/verticals-food-processing — types + FSM guards (M12)
 * FSM: seeded → claimed → nafdac_verified → active → suspended
 * ADL-010: AI at L2 maximum — demand planning advisory only
 * P13: no supplier details in AI — aggregate batch stats only
 * P9: all kobo values must be integers; weights/quantities as integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for factory operations; Tier 3 for wholesale above ₦10M
 */

export type FoodProcessingFSMState =
  | 'seeded'
  | 'claimed'
  | 'nafdac_verified'
  | 'active'
  | 'suspended';

const FSM_TRANSITIONS: Record<FoodProcessingFSMState, FoodProcessingFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['nafdac_verified'],
  nafdac_verified: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidFoodProcessingTransition(
  from: FoodProcessingFSMState,
  to: FoodProcessingFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNafdacVerified(input: {
  nafdacManufacturingPermit: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.nafdacManufacturingPermit) return { allowed: false, reason: 'NAFDAC manufacturing permit required' };
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for NAFDAC verification' };
  return { allowed: true };
}

export function guardKycForWholesale(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for wholesale distribution above ₦10M' };
  return { allowed: true };
}

export function guardIntegerWeight(val: number): GuardResult {
  if (!Number.isInteger(val) || val < 0) return { allowed: false, reason: 'Weight/quantity must be a non-negative integer' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: food processing AI capped at L2 — no automated production orders' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface FoodProcessingProfile {
  id: string; workspaceId: string; tenantId: string;
  factoryName: string; nafdacManufacturingPermit: string | null; sonProductCert: string | null;
  cacRc: string | null;
  status: FoodProcessingFSMState; createdAt: number; updatedAt: number;
}

export interface FpProductionBatch {
  id: string; profileId: string; tenantId: string;
  productName: string; nafdacProductNumber: string | null; batchNumber: string;
  productionDate: number; quantityUnits: number; unitSizeGrams: number;
  totalCostKobo: number; expiryDate: number | null; createdAt: number;
}

export interface FpRawMaterial {
  id: string; profileId: string; tenantId: string;
  materialName: string; quantityKg: number; costPerKgKobo: number;
  supplier: string | null; intakeDate: number; createdAt: number;
}

export interface FpFinishedGood {
  id: string; profileId: string; tenantId: string;
  productName: string; nafdacProductNumber: string | null;
  unitsInStock: number; unitSalePriceKobo: number; createdAt: number; updatedAt: number;
}

export interface CreateFoodProcessingInput {
  id?: string; workspaceId: string; tenantId: string;
  factoryName: string; nafdacManufacturingPermit?: string; sonProductCert?: string; cacRc?: string;
}

export interface CreateBatchInput {
  id?: string; profileId: string; tenantId: string;
  productName: string; nafdacProductNumber?: string; batchNumber: string;
  productionDate: number; quantityUnits: number; unitSizeGrams: number;
  totalCostKobo: number; expiryDate?: number;
}

export interface CreateRawMaterialInput {
  id?: string; profileId: string; tenantId: string;
  materialName: string; quantityKg: number; costPerKgKobo: number;
  supplier?: string; intakeDate: number;
}

export interface CreateFinishedGoodInput {
  id?: string; profileId: string; tenantId: string;
  productName: string; nafdacProductNumber?: string;
  unitsInStock?: number; unitSalePriceKobo: number;
}
