/**
 * @webwaka/verticals-farm — Domain types + FSM guards (M10)
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:      KYC Tier 1
 *   claimed → cac_verified: CAC registration required
 * Platform Invariants:
 *   P9  — all kobo amounts are non-negative integers; quantity_kg is integer
 *   T3  — tenant_id on all queries
 *   P13 — customer/farmer phone numbers never sent to AI
 * ADL-010: AI capped at L2 (harvest forecast informational only)
 */

export type FarmFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type HarvestGrade = 'A' | 'B' | 'C' | 'export';
export type HarvestStatus = 'available' | 'partially_sold' | 'sold_out';
export type SaleStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type WeatherEventType = 'rainfall' | 'drought' | 'flooding' | 'pest' | 'other';

export interface FarmProfile {
  id: string;
  workspaceId: string;
  tenantId: string;            // T3 — always present
  farmName: string;
  cacNumber: string | null;
  state: string;
  lga: string;
  farmSizeHectares: number;   // integer hectares
  primaryCrop: string;
  status: FarmFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFarmInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  farmName: string;
  state: string;
  lga: string;
  farmSizeHectares?: number | undefined;
  primaryCrop?: string | undefined;
  cacNumber?: string | undefined;
}

export interface UpdateFarmInput {
  farmName?: string | undefined;
  cacNumber?: string | null | undefined;
  state?: string | undefined;
  lga?: string | undefined;
  farmSizeHectares?: number | undefined;
  primaryCrop?: string | undefined;
  status?: FarmFSMState | undefined;
}

export interface FarmHarvest {
  id: string;
  farmId: string;
  tenantId: string;            // T3
  cropType: string;
  quantityKg: number;         // integer kg (P9 pattern)
  harvestDate: number;        // unix epoch
  grade: HarvestGrade;
  askingPriceKobo: number;    // P9 — integer kobo per kg
  status: HarvestStatus;
  createdAt: number;
}

export interface CreateHarvestInput {
  id?: string | undefined;
  farmId: string;
  tenantId: string;
  cropType: string;
  quantityKg: number;
  harvestDate: number;
  grade?: HarvestGrade | undefined;
  askingPriceKobo: number;
}

export interface FarmSale {
  id: string;
  harvestId: string;
  tenantId: string;           // T3
  buyerPhone: string;         // P13 — never sent to AI
  quantityKg: number;        // integer kg
  salePriceKobo: number;     // P9 — integer kobo per kg
  totalAmountKobo: number;   // P9 — integer kobo (qty × price)
  status: SaleStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSaleInput {
  id?: string | undefined;
  harvestId: string;
  tenantId: string;
  buyerPhone: string;
  quantityKg: number;
  salePriceKobo: number;
}

export interface WeatherEvent {
  id: string;
  farmId: string;
  tenantId: string;
  eventType: WeatherEventType;
  description: string;
  severity: 1 | 2 | 3;       // 1=minor, 2=moderate, 3=severe
  eventDate: number;
  createdAt: number;
}

export interface CreateWeatherEventInput {
  id?: string | undefined;
  farmId: string;
  tenantId: string;
  eventType: WeatherEventType;
  description: string;
  severity?: 1 | 2 | 3 | undefined;
  eventDate: number;
}

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim farm profile' };
  }
  return { allowed: true };
}

export function guardClaimedToCacVerified(opts: { cacNumber: string | null }): FSMGuardResult {
  if (!opts.cacNumber) {
    return { allowed: false, reason: 'CAC registration number required for farm verification' };
  }
  return { allowed: true };
}

export function guardIntegerKg(kg: number): FSMGuardResult {
  if (!Number.isInteger(kg) || kg < 0) {
    return { allowed: false, reason: 'Quantity must be a non-negative integer kg' };
  }
  return { allowed: true };
}

export function guardIntegerKobo(amount: number): FSMGuardResult {
  if (!Number.isInteger(amount) || amount < 0) {
    return { allowed: false, reason: 'P9: kobo amount must be a non-negative integer' };
  }
  return { allowed: true };
}

export function guardL2AiCap(opts: { autonomyLevel: string | number | undefined }): FSMGuardResult {
  if (opts.autonomyLevel === 'L3_HITL' || opts.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: farm AI capped at L2 — harvest forecast is informational only' };
  }
  return { allowed: true };
}

export const VALID_FARM_TRANSITIONS: Array<[FarmFSMState, FarmFSMState]> = [
  ['seeded',      'claimed'],
  ['claimed',     'cac_verified'],
  ['cac_verified','active'],
  ['active',      'suspended'],
  ['suspended',   'active'],
  ['claimed',     'suspended'],
];

export function isValidFarmTransition(from: FarmFSMState, to: FarmFSMState): boolean {
  return VALID_FARM_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
