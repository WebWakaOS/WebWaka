/**
 * @webwaka/verticals-used-car-dealer — Domain types
 * M11 Commerce P3 — Task V-COMM-EXT-C14
 *
 * FSM: seeded → claimed → frsc_verified → active → suspended
 * KYC: Tier 3 for financing integration
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 * P13: VIN numbers never passed to AI layer
 */

export type UsedCarDealerFSMState =
  | 'seeded'
  | 'claimed'
  | 'frsc_verified'
  | 'active'
  | 'suspended';

export type CarListingStatus = 'available' | 'reserved' | 'sold';
export type InspectionStatus = 'pending' | 'passed' | 'failed';

export interface UsedCarDealerProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  dealershipName: string;
  cacRc: string | null;
  frscDealerLicence: string | null;
  mssnMembership: string | null;
  status: UsedCarDealerFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateUsedCarDealerInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  dealershipName: string;
  cacRc?: string | undefined;
  frscDealerLicence?: string | undefined;
  mssnMembership?: string | undefined;
}

export interface UpdateUsedCarDealerInput {
  dealershipName?: string | undefined;
  cacRc?: string | null | undefined;
  frscDealerLicence?: string | null | undefined;
  mssnMembership?: string | null | undefined;
  status?: UsedCarDealerFSMState | undefined;
}

export interface CarListing {
  id: string;
  workspaceId: string;
  tenantId: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  mileageKm: number;
  askingPriceKobo: number;
  colourExterior: string | null;
  inspectionStatus: InspectionStatus;
  status: CarListingStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCarListingInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  make: string;
  model: string;
  year: number;
  vin?: string | undefined;
  mileageKm: number;
  askingPriceKobo: number;
  colourExterior?: string | undefined;
}

export interface TestDriveBooking {
  id: string;
  workspaceId: string;
  tenantId: string;
  listingId: string;
  clientPhone: string;
  scheduledAt: number;
  completed: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTestDriveBookingInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  listingId: string;
  clientPhone: string;
  scheduledAt: number;
}

export const VALID_USED_CAR_TRANSITIONS: Record<UsedCarDealerFSMState, UsedCarDealerFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['frsc_verified', 'suspended'],
  frsc_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidUsedCarDealerTransition(from: UsedCarDealerFSMState, to: UsedCarDealerFSMState): boolean {
  return VALID_USED_CAR_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim used car dealer profile' };
  return { allowed: true };
}

export function guardClaimedToFrscVerified(ctx: { frscDealerLicence: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.frscDealerLicence) return { allowed: false, reason: 'FRSC dealer licence required for frsc_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for frsc_verified transition' };
  return { allowed: true };
}
