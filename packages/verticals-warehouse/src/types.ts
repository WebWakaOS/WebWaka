/**
 * @webwaka/verticals-warehouse — Domain types + FSM guards (M10)
 *
 * FSM: seeded → claimed → cac_verified → son_certified → active → suspended
 * KYC gates:
 *   seeded → claimed:          KYC Tier 1
 *   claimed → cac_verified:    CAC registration required
 *   cac_verified → son_certified: SON/NAFDAC cert required
 * Platform Invariants:
 *   P9  — all kobo amounts are non-negative integers; capacity/quantity in integer kg
 *   T3  — tenant_id on all queries
 *   P13 — client phone numbers never sent to AI
 * ADL-010: AI capped at L2 (inventory optimisation informational only)
 */

export type WarehouseFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'son_certified'
  | 'active'
  | 'suspended';

export type SlotStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type ContractStatus = 'active' | 'completed' | 'terminated';
export type MovementType = 'inbound' | 'outbound';

export interface WarehouseProfile {
  id: string;
  workspaceId: string;
  tenantId: string;             // T3
  warehouseName: string;
  cacNumber: string | null;
  sonCert: string | null;
  nafdacCert: string | null;
  totalCapacityKg: number;     // integer kg
  state: string;
  lga: string;
  status: WarehouseFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWarehouseInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  warehouseName: string;
  state: string;
  lga: string;
  totalCapacityKg?: number | undefined;
  cacNumber?: string | undefined;
  sonCert?: string | undefined;
  nafdacCert?: string | undefined;
}

export interface UpdateWarehouseInput {
  warehouseName?: string | undefined;
  cacNumber?: string | null | undefined;
  sonCert?: string | null | undefined;
  nafdacCert?: string | null | undefined;
  totalCapacityKg?: number | undefined;
  state?: string | undefined;
  lga?: string | undefined;
  status?: WarehouseFSMState | undefined;
}

export interface WarehouseSlot {
  id: string;
  warehouseId: string;
  tenantId: string;            // T3
  slotCode: string;
  capacityKg: number;          // integer kg
  currentOccupancyKg: number;  // integer kg
  status: SlotStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSlotInput {
  id?: string | undefined;
  warehouseId: string;
  tenantId: string;
  slotCode: string;
  capacityKg: number;
}

export interface WarehouseContract {
  id: string;
  warehouseId: string;
  slotId: string;
  tenantId: string;            // T3
  clientPhone: string;         // P13 — never sent to AI
  commodityType: string;
  quantityKg: number;          // integer kg
  dailyRateKobo: number;       // P9 integer kobo
  startDate: number;
  endDate: number | null;
  totalBilledKobo: number;     // P9 integer kobo
  status: ContractStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateContractInput {
  id?: string | undefined;
  warehouseId: string;
  slotId: string;
  tenantId: string;
  clientPhone: string;
  commodityType: string;
  quantityKg: number;
  dailyRateKobo: number;
  startDate: number;
}

export interface StockMovement {
  id: string;
  contractId: string;
  tenantId: string;
  movementType: MovementType;
  quantityKg: number;         // integer kg
  movementDate: number;
  notes: string | null;
  createdAt: number;
}

export interface CreateMovementInput {
  id?: string | undefined;
  contractId: string;
  tenantId: string;
  movementType: MovementType;
  quantityKg: number;
  movementDate: number;
  notes?: string | undefined;
}

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim warehouse profile' };
  }
  return { allowed: true };
}

export function guardClaimedToCacVerified(opts: { cacNumber: string | null }): FSMGuardResult {
  if (!opts.cacNumber) {
    return { allowed: false, reason: 'CAC registration number required for warehouse verification' };
  }
  return { allowed: true };
}

export function guardCacVerifiedToSonCertified(opts: {
  sonCert: string | null;
  nafdacCert: string | null;
}): FSMGuardResult {
  if (!opts.sonCert && !opts.nafdacCert) {
    return { allowed: false, reason: 'SON or NAFDAC certification required for warehouse operations' };
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

export function guardSlotCapacity(opts: { slotCapacityKg: number; requestedKg: number }): FSMGuardResult {
  if (opts.requestedKg > opts.slotCapacityKg) {
    return { allowed: false, reason: `Requested ${opts.requestedKg}kg exceeds slot capacity of ${opts.slotCapacityKg}kg` };
  }
  return { allowed: true };
}

export function guardL2AiCap(opts: { autonomyLevel: string | number | undefined }): FSMGuardResult {
  if (opts.autonomyLevel === 'L3_HITL' || opts.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: warehouse AI capped at L2 — inventory optimisation is informational only' };
  }
  return { allowed: true };
}

export const VALID_WAREHOUSE_TRANSITIONS: Array<[WarehouseFSMState, WarehouseFSMState]> = [
  ['seeded',       'claimed'],
  ['claimed',      'cac_verified'],
  ['cac_verified', 'son_certified'],
  ['son_certified','active'],
  ['active',       'suspended'],
  ['suspended',    'active'],
  ['claimed',      'suspended'],
];

export function isValidWarehouseTransition(from: WarehouseFSMState, to: WarehouseFSMState): boolean {
  return VALID_WAREHOUSE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
