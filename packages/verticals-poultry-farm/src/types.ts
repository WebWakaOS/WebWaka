/**
 * @webwaka/verticals-poultry-farm — Domain types + FSM guards (M10)
 *
 * FSM: seeded → claimed → napri_registered → active → suspended
 * KYC gates:
 *   seeded → claimed:          KYC Tier 1
 *   claimed → napri_registered: NAPRI registration certificate required
 * Platform Invariants:
 *   P9  — all kobo amounts are non-negative integers; eggs and kg are integers
 *   T3  — tenant_id on all queries
 *   P13 — buyer phone numbers never sent to AI
 * ADL-010: AI capped at L2 (demand forecast informational only)
 */

export type PoultryFarmFSMState =
  | 'seeded'
  | 'claimed'
  | 'napri_registered'
  | 'active'
  | 'suspended';

export type FlockType = 'broiler' | 'layer' | 'breeder' | 'turkey' | 'duck';
export type FlockStatus = 'active' | 'depleted' | 'sold';
export type SaleStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface PoultryFarmProfile {
  id: string;
  workspaceId: string;
  tenantId: string;             // T3
  farmName: string;
  napriCert: string | null;
  cacNumber: string | null;
  state: string;
  lga: string;
  status: PoultryFarmFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePoultryFarmInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  farmName: string;
  state: string;
  lga: string;
  napriCert?: string | undefined;
  cacNumber?: string | undefined;
}

export interface UpdatePoultryFarmInput {
  farmName?: string | undefined;
  napriCert?: string | null | undefined;
  cacNumber?: string | null | undefined;
  state?: string | undefined;
  lga?: string | undefined;
  status?: PoultryFarmFSMState | undefined;
}

export interface PoultryFlock {
  id: string;
  farmId: string;
  tenantId: string;           // T3
  flockType: FlockType;
  birdCount: number;          // integer — number of birds
  stockingDate: number;
  expectedDepletionDate: number | null;
  mortalityCount: number;     // integer — total dead birds
  status: FlockStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFlockInput {
  id?: string | undefined;
  farmId: string;
  tenantId: string;
  flockType: FlockType;
  birdCount: number;
  stockingDate: number;
  expectedDepletionDate?: number | undefined;
}

export interface EggProductionLog {
  id: string;
  flockId: string;
  tenantId: string;           // T3
  logDate: number;
  eggsCollected: number;      // integer count
  eggsBreakage: number;       // integer count
  createdAt: number;
}

export interface CreateEggProductionInput {
  id?: string | undefined;
  flockId: string;
  tenantId: string;
  logDate: number;
  eggsCollected: number;
  eggsBreakage?: number | undefined;
}

export interface FeedRecord {
  id: string;
  farmId: string;
  tenantId: string;
  feedType: string;
  quantityKg: number;         // integer kg (P9 pattern)
  costKobo: number;           // P9 integer kobo
  purchaseDate: number;
  createdAt: number;
}

export interface CreateFeedRecordInput {
  id?: string | undefined;
  farmId: string;
  tenantId: string;
  feedType: string;
  quantityKg: number;
  costKobo: number;
  purchaseDate: number;
}

export interface PoultrySale {
  id: string;
  flockId: string;
  tenantId: string;
  buyerPhone: string;         // P13 — never sent to AI
  birdCount: number;          // integer
  pricePerBirdKobo: number;   // P9 integer kobo
  totalAmountKobo: number;    // P9 integer kobo
  status: SaleStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePoultrySaleInput {
  id?: string | undefined;
  flockId: string;
  tenantId: string;
  buyerPhone: string;
  birdCount: number;
  pricePerBirdKobo: number;
}

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim poultry farm profile' };
  }
  return { allowed: true };
}

export function guardClaimedToNapriRegistered(opts: { napriCert: string | null }): FSMGuardResult {
  if (!opts.napriCert) {
    return { allowed: false, reason: 'NAPRI registration certificate required' };
  }
  return { allowed: true };
}

export function guardIntegerBirds(count: number): FSMGuardResult {
  if (!Number.isInteger(count) || count < 0) {
    return { allowed: false, reason: 'Bird count must be a non-negative integer' };
  }
  return { allowed: true };
}

export function guardIntegerEggs(count: number): FSMGuardResult {
  if (!Number.isInteger(count) || count < 0) {
    return { allowed: false, reason: 'Egg count must be a non-negative integer' };
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
    return { allowed: false, reason: 'ADL-010: poultry AI capped at L2 — demand forecast is informational only' };
  }
  return { allowed: true };
}

export const VALID_POULTRY_FARM_TRANSITIONS: Array<[PoultryFarmFSMState, PoultryFarmFSMState]> = [
  ['seeded',          'claimed'],
  ['claimed',         'napri_registered'],
  ['napri_registered','active'],
  ['active',          'suspended'],
  ['suspended',       'active'],
  ['claimed',         'suspended'],
];

export function isValidPoultryFarmTransition(from: PoultryFarmFSMState, to: PoultryFarmFSMState): boolean {
  return VALID_POULTRY_FARM_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
