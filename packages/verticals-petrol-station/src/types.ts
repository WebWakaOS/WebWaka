/**
 * @webwaka/verticals-petrol-station — Domain types
 * M11 Commerce P3 — Task V-COMM-EXT-C9
 *
 * FSM: seeded → claimed → nuprc_verified → active → suspended
 * KYC: Tier 3 for bulk fleet credit >₦2M/month
 * Platform Invariants: P9 (kobo/litre integers), T3 (tenant_id always present)
 */

export type PetrolStationFSMState =
  | 'seeded'
  | 'claimed'
  | 'nuprc_verified'
  | 'active'
  | 'suspended';

export type FuelType = 'pms' | 'ago' | 'lpg' | 'cng';

export interface PetrolStationProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  stationName: string;
  nuprcLicence: string | null;
  dpmsId: string | null;
  address: string | null;
  state: string | null;
  status: PetrolStationFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePetrolStationInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  stationName: string;
  nuprcLicence?: string | undefined;
  dpmsId?: string | undefined;
  address?: string | undefined;
  state?: string | undefined;
}

export interface UpdatePetrolStationInput {
  stationName?: string | undefined;
  nuprcLicence?: string | null | undefined;
  dpmsId?: string | null | undefined;
  address?: string | null | undefined;
  state?: string | null | undefined;
  status?: PetrolStationFSMState | undefined;
}

export interface FuelNozzle {
  id: string;
  workspaceId: string;
  tenantId: string;
  fuelType: FuelType;
  pumpId: string;
  openingReadingLitres: number;
  closingReadingLitres: number;
  pricePerLitreKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFuelNozzleInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  fuelType: FuelType;
  pumpId: string;
  openingReadingLitres: number;
  closingReadingLitres?: number | undefined;
  pricePerLitreKobo: number;
}

export interface FleetCreditAccount {
  id: string;
  workspaceId: string;
  tenantId: string;
  fleetName: string;
  fleetPhone: string;
  creditLimitKobo: number;
  balanceOwingKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFleetCreditInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  fleetName: string;
  fleetPhone: string;
  creditLimitKobo: number;
  balanceOwingKobo?: number | undefined;
}

export const VALID_PETROL_STATION_TRANSITIONS: Record<PetrolStationFSMState, PetrolStationFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['nuprc_verified', 'suspended'],
  nuprc_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidPetrolStationTransition(from: PetrolStationFSMState, to: PetrolStationFSMState): boolean {
  return VALID_PETROL_STATION_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim petrol station profile' };
  return { allowed: true };
}

export function guardClaimedToNuprcVerified(ctx: { nuprcLicence: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.nuprcLicence) return { allowed: false, reason: 'NUPRC licence required for nuprc_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for nuprc_verified transition' };
  return { allowed: true };
}
