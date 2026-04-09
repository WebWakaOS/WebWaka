/**
 * @webwaka/verticals-auto-mechanic — Domain types
 * M9 Commerce P2 — Task V-COMM-EXT-A1
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:      KYC Tier 1
 *   cac_verified → active: VIO registration required
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type AutoMechanicFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type JobCardStatus =
  | 'open'
  | 'in_progress'
  | 'completed'
  | 'invoiced';

export interface AutoMechanicProfile {
  id: string;
  workspaceId: string;
  tenantId: string;            // T3 — always present
  workshopName: string;
  cacNumber: string | null;
  vioRegistration: string | null;
  state: string;
  lga: string;
  status: AutoMechanicFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateAutoMechanicInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  workshopName: string;
  state: string;
  lga: string;
  cacNumber?: string | undefined;
  vioRegistration?: string | undefined;
}

export interface UpdateAutoMechanicInput {
  workshopName?: string | undefined;
  cacNumber?: string | null | undefined;
  vioRegistration?: string | null | undefined;
  state?: string | undefined;
  lga?: string | undefined;
  status?: AutoMechanicFSMState | undefined;
}

export interface JobCard {
  id: string;
  workspaceId: string;
  tenantId: string;           // T3
  vehiclePlate: string;
  customerPhone: string;      // P13 — never sent to AI
  complaint: string;
  diagnosis: string | null;
  mechanicId: string | null;
  labourCostKobo: number;     // P9 — integer kobo
  partsCostKobo: number;      // P9 — integer kobo
  status: JobCardStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateJobCardInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  vehiclePlate: string;
  customerPhone: string;
  complaint: string;
  labourCostKobo: number;
  partsCostKobo?: number | undefined;
}

export interface MechanicPart {
  id: string;
  workspaceId: string;
  tenantId: string;           // T3
  partName: string;
  partNumber: string | null;
  quantityInStock: number;
  unitCostKobo: number;       // P9 — integer kobo
  reorderLevel: number;
  supplier: string | null;
  createdAt: number;
}

export interface CreateMechanicPartInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  partName: string;
  partNumber?: string | undefined;
  quantityInStock: number;
  unitCostKobo: number;
  reorderLevel?: number | undefined;
  supplier?: string | undefined;
}

// ---------------------------------------------------------------------------
// FSM guard functions (pure — no I/O)
// ---------------------------------------------------------------------------

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim auto mechanic profile' };
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

export function guardCacVerifiedToActive(opts: {
  vioRegistration: string | null;
}): FSMGuardResult {
  if (!opts.vioRegistration) {
    return { allowed: false, reason: 'VIO registration number required to go active' };
  }
  return { allowed: true };
}

export const VALID_AUTO_MECHANIC_TRANSITIONS: Array<[AutoMechanicFSMState, AutoMechanicFSMState]> = [
  ['seeded',       'claimed'],
  ['claimed',      'cac_verified'],
  ['cac_verified', 'active'],
  ['active',       'suspended'],
  ['suspended',    'active'],
  ['claimed',      'suspended'],
];

export function isValidAutoMechanicTransition(
  from: AutoMechanicFSMState,
  to: AutoMechanicFSMState,
): boolean {
  return VALID_AUTO_MECHANIC_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
