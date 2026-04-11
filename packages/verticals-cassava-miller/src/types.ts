/**
 * @webwaka/verticals-cassava-miller — types + FSM guards (M12)
 * FSM: seeded → claimed → nafdac_verified → active → suspended
 * ADL-010: AI at L2 maximum — yield forecasts and price alerts advisory only
 * P13: no buyer details in AI — aggregate batch stats only
 * P9: all kobo values must be integers; all weights as integer kg
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for product sales; Tier 3 for bulk export
 */

export type CassavaMillerFSMState =
  | 'seeded'
  | 'claimed'
  | 'nafdac_verified'
  | 'active'
  | 'suspended';

export type CropType = 'cassava' | 'maize' | 'rice';
export type ProductType = 'garri' | 'cassava_flour' | 'maize_meal' | 'rice';

const FSM_TRANSITIONS: Record<CassavaMillerFSMState, CassavaMillerFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['nafdac_verified'],
  nafdac_verified: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidCassavaMillerTransition(
  from: CassavaMillerFSMState,
  to: CassavaMillerFSMState,
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

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: cassava miller AI capped at L2 — no automated trading' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'ADL-010: agricultural AI capped at L2 advisory' };
  }
  return { allowed: true };
}

export function guardIntegerWeight(kg: number): GuardResult {
  if (!Number.isInteger(kg) || kg < 0) return { allowed: false, reason: 'Weight must be a non-negative integer kg' };
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface CassavaMillerProfile {
  id: string; workspaceId: string; tenantId: string;
  millName: string; nafdacManufacturingPermit: string | null; sonProductCert: string | null;
  cacRc: string | null; processingCapacityKgPerDay: number;
  status: CassavaMillerFSMState; createdAt: number; updatedAt: number;
}

export interface MillerIntakeLog {
  id: string; profileId: string; tenantId: string;
  cropType: CropType; quantityKg: number; supplierPhone: string | null;
  intakeDate: number; costPerKgKobo: number; createdAt: number;
}

export interface MillerProductionBatch {
  id: string; profileId: string; tenantId: string;
  batchDate: number; cropType: CropType; rawInputKg: number;
  productOutputKg: number; productType: ProductType;
  millingCostKobo: number; createdAt: number;
}

export interface MillerSale {
  id: string; profileId: string; tenantId: string;
  buyerPhone: string; productType: ProductType;
  quantityKg: number; pricePerKgKobo: number; totalKobo: number;
  saleDate: number; createdAt: number;
}

export interface CreateCassavaMillerInput {
  id?: string; workspaceId: string; tenantId: string;
  millName: string; nafdacManufacturingPermit?: string; sonProductCert?: string;
  cacRc?: string; processingCapacityKgPerDay?: number;
}

export interface CreateIntakeLogInput {
  id?: string; profileId: string; tenantId: string;
  cropType: CropType; quantityKg: number; supplierPhone?: string;
  intakeDate: number; costPerKgKobo: number;
}

export interface CreateBatchInput {
  id?: string; profileId: string; tenantId: string;
  batchDate: number; cropType: CropType; rawInputKg: number;
  productOutputKg: number; productType: ProductType; millingCostKobo: number;
}

export interface CreateMillerSaleInput {
  id?: string; profileId: string; tenantId: string;
  buyerPhone: string; productType: ProductType;
  quantityKg: number; pricePerKgKobo: number; totalKobo: number; saleDate: number;
}
