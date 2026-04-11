/**
 * @webwaka/verticals-borehole-driller — Domain types
 * M12 Commerce P3 — Task V-COMM-EXT-C2
 *
 * FSM: seeded → claimed → coren_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:           KYC Tier 1
 *   claimed → coren_verified:   COREN number + state water board reg required; KYC Tier 2
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type BoreholeDrillerFSMState =
  | 'seeded'
  | 'claimed'
  | 'coren_verified'
  | 'active'
  | 'suspended';

export type BoreholeProjectStatus = 'survey' | 'drilling' | 'casing' | 'pump_test' | 'handover' | 'completed';
export type RigStatus = 'available' | 'deployed' | 'maintenance';

export interface BoreholeDrillerProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  corenNumber: string | null;
  stateWaterBoardReg: string | null;
  cacRc: string | null;
  rigCount: number;
  status: BoreholeDrillerFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBoreholeDrillerInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  corenNumber?: string | undefined;
  stateWaterBoardReg?: string | undefined;
  cacRc?: string | undefined;
  rigCount?: number | undefined;
}

export interface UpdateBoreholeDrillerInput {
  companyName?: string | undefined;
  corenNumber?: string | null | undefined;
  stateWaterBoardReg?: string | null | undefined;
  cacRc?: string | null | undefined;
  rigCount?: number | undefined;
  status?: BoreholeDrillerFSMState | undefined;
}

export interface BoreholeProject {
  id: string;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  locationAddress: string;
  state: string | null;
  depthMetres: number;
  casingType: string | null;
  totalCostKobo: number;
  depositKobo: number;
  balanceKobo: number;
  waterBoardApprovalNumber: string | null;
  status: BoreholeProjectStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBoreholeProjectInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  locationAddress: string;
  state?: string | undefined;
  depthMetres: number;
  casingType?: string | undefined;
  totalCostKobo: number;
  depositKobo?: number | undefined;
  balanceKobo?: number | undefined;
  waterBoardApprovalNumber?: string | undefined;
}

export interface BoreholeRig {
  id: string;
  workspaceId: string;
  tenantId: string;
  rigName: string;
  rigCapacityMetres: number;
  currentProjectId: string | null;
  status: RigStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBoreholeRigInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  rigName: string;
  rigCapacityMetres: number;
  currentProjectId?: string | undefined;
}

export const VALID_BOREHOLE_DRILLER_TRANSITIONS: Record<BoreholeDrillerFSMState, BoreholeDrillerFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['coren_verified', 'suspended'],
  coren_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidBoreholeDrillerTransition(from: BoreholeDrillerFSMState, to: BoreholeDrillerFSMState): boolean {
  return VALID_BOREHOLE_DRILLER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim borehole driller profile' };
  return { allowed: true };
}

export function guardClaimedToCorenVerified(ctx: { corenNumber: string | null; stateWaterBoardReg: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.corenNumber) return { allowed: false, reason: 'COREN number required for coren_verified transition' };
  if (!ctx.stateWaterBoardReg) return { allowed: false, reason: 'State water board registration required for coren_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for coren_verified transition' };
  return { allowed: true };
}
