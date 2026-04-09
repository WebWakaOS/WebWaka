/**
 * @webwaka/verticals-electronics-repair — Domain types
 * M9 Commerce P2 — Task V-COMM-EXT-A7
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present), P13 (no IMEI/phone to AI)
 */

export type ElectronicsRepairFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type LocationCluster = 'computer_village' | 'onitsha' | 'aba' | 'other';

export type RepairJobStatus =
  | 'intake'
  | 'diagnosing'
  | 'awaiting_parts'
  | 'repairing'
  | 'completed'
  | 'collected';

export interface ElectronicsRepairProfile {
  id: string;
  workspaceId: string;
  tenantId: string;             // T3
  shopName: string;
  cacNumber: string | null;
  sonRegistration: string | null;
  locationCluster: LocationCluster;
  state: string;
  status: ElectronicsRepairFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateElectronicsRepairInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  state: string;
  locationCluster?: LocationCluster | undefined;
  cacNumber?: string | undefined;
  sonRegistration?: string | undefined;
}

export interface UpdateElectronicsRepairInput {
  shopName?: string | undefined;
  cacNumber?: string | null | undefined;
  sonRegistration?: string | null | undefined;
  locationCluster?: LocationCluster | undefined;
  state?: string | undefined;
  status?: ElectronicsRepairFSMState | undefined;
}

export interface RepairJob {
  id: string;
  workspaceId: string;
  tenantId: string;          // T3
  deviceType: string;
  brand: string;
  model: string | null;
  imei: string | null;       // P13 — last 4 digits only; never sent to AI
  faultDescription: string;
  customerPhone: string;     // P13 — never sent to AI
  diagnosis: string | null;
  labourCostKobo: number;    // P9
  partsCostKobo: number;     // P9
  warrantyDays: number;
  status: RepairJobStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRepairJobInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  deviceType: string;
  brand: string;
  faultDescription: string;
  customerPhone: string;
  model?: string | undefined;
  imei?: string | undefined;
  labourCostKobo?: number | undefined;
  partsCostKobo?: number | undefined;
  warrantyDays?: number | undefined;
}

export interface RepairPart {
  id: string;
  workspaceId: string;
  tenantId: string;          // T3
  partName: string;
  compatibleModels: string;  // JSON array
  quantity: number;
  unitCostKobo: number;      // P9
  supplier: string | null;
  createdAt: number;
}

export interface CreateRepairPartInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  partName: string;
  quantity: number;
  unitCostKobo: number;
  compatibleModels?: string | undefined;
  supplier?: string | undefined;
}

// ---------------------------------------------------------------------------
// FSM guard functions (pure — no I/O)
// ---------------------------------------------------------------------------

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim electronics repair profile' };
  }
  return { allowed: true };
}

export function guardClaimedToCacVerified(opts: {
  cacNumber: string | null;
}): FSMGuardResult {
  if (!opts.cacNumber) {
    return { allowed: false, reason: 'CAC registration number required for verification' };
  }
  return { allowed: true };
}

export const VALID_ELECTRONICS_REPAIR_TRANSITIONS: Array<[ElectronicsRepairFSMState, ElectronicsRepairFSMState]> = [
  ['seeded',       'claimed'],
  ['claimed',      'cac_verified'],
  ['cac_verified', 'active'],
  ['active',       'suspended'],
  ['suspended',    'active'],
  ['claimed',      'suspended'],
];

export function isValidElectronicsRepairTransition(
  from: ElectronicsRepairFSMState,
  to: ElectronicsRepairFSMState,
): boolean {
  return VALID_ELECTRONICS_REPAIR_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
