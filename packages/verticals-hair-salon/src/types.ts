/**
 * @webwaka/verticals-hair-salon — Domain types
 * M10 Commerce P3 — Task V-COMM-EXT-C8
 * Barbing/braiding salons (informal, distinct from Set A beauty-salon)
 *
 * FSM: seeded → claimed → active (3-state informal)
 * KYC: Tier 1 sufficient
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type HairSalonFSMState = 'seeded' | 'claimed' | 'active';
export type SalonType = 'barbing' | 'braiding' | 'mixed';

export interface HairSalonProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  salonName: string;
  type: SalonType;
  lgPermitNumber: string | null;
  state: string | null;
  lga: string | null;
  status: HairSalonFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateHairSalonInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  salonName: string;
  type: SalonType;
  lgPermitNumber?: string | undefined;
  state?: string | undefined;
  lga?: string | undefined;
}

export interface UpdateHairSalonInput {
  salonName?: string | undefined;
  type?: SalonType | undefined;
  lgPermitNumber?: string | null | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  status?: HairSalonFSMState | undefined;
}

export interface HairSalonService {
  id: string;
  workspaceId: string;
  tenantId: string;
  serviceName: string;
  priceKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateHairSalonServiceInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  serviceName: string;
  priceKobo: number;
}

export interface HairSalonDailyLog {
  id: string;
  workspaceId: string;
  tenantId: string;
  logDate: number;
  customersServed: number;
  revenueKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateHairSalonDailyLogInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  logDate: number;
  customersServed?: number | undefined;
  revenueKobo: number;
}

export const VALID_HAIR_SALON_TRANSITIONS: Record<HairSalonFSMState, HairSalonFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['active'],
  active: [],
};

export function isValidHairSalonTransition(from: HairSalonFSMState, to: HairSalonFSMState): boolean {
  return VALID_HAIR_SALON_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim hair salon profile' };
  return { allowed: true };
}

export function guardClaimedToActive(_ctx: Record<string, never>): { allowed: boolean; reason?: string } {
  return { allowed: true };
}
