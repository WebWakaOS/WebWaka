/**
 * @webwaka/verticals-car-wash — Domain types
 * M12 Commerce P3 — Task V-COMM-EXT-C4
 *
 * FSM: seeded → claimed → active (3-state informal)
 * KYC: Tier 1 sufficient
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type CarWashFSMState = 'seeded' | 'claimed' | 'active';
export type WashType = 'basic' | 'full' | 'detailing';

export interface CarWashProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  businessName: string;
  lgPermitNumber: string | null;
  state: string | null;
  lga: string | null;
  status: CarWashFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCarWashInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  businessName: string;
  lgPermitNumber?: string | undefined;
  state?: string | undefined;
  lga?: string | undefined;
}

export interface UpdateCarWashInput {
  businessName?: string | undefined;
  lgPermitNumber?: string | null | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  status?: CarWashFSMState | undefined;
}

export interface CarWashVisit {
  id: string;
  workspaceId: string;
  tenantId: string;
  vehiclePlate: string;
  washType: WashType;
  priceKobo: number;
  visitDate: number;
  loyaltyCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCarWashVisitInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  vehiclePlate: string;
  washType: WashType;
  priceKobo: number;
  visitDate?: number | undefined;
  loyaltyCount?: number | undefined;
}

export const VALID_CAR_WASH_TRANSITIONS: Record<CarWashFSMState, CarWashFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['active'],
  active: [],
};

export function isValidCarWashTransition(from: CarWashFSMState, to: CarWashFSMState): boolean {
  return VALID_CAR_WASH_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim car wash profile' };
  return { allowed: true };
}

export function guardClaimedToActive(_ctx: Record<string, never>): { allowed: boolean; reason?: string } {
  return { allowed: true };
}
