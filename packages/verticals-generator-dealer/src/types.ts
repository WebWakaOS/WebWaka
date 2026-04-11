/**
 * @webwaka/verticals-generator-dealer — Domain types
 * M11 Commerce P3 — Task V-COMM-EXT-C7
 *
 * FSM: seeded → claimed → son_verified → active → suspended
 * KYC: Tier 2 for unit sales >₦500,000
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 * P13: customer details never passed to AI layer
 */

export type GeneratorDealerFSMState =
  | 'seeded'
  | 'claimed'
  | 'son_verified'
  | 'active'
  | 'suspended';

export type GeneratorUnitStatus = 'in_stock' | 'sold' | 'on_loan';
export type ServiceJobStatus = 'booked' | 'in_service' | 'completed';

export interface GeneratorDealerProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  cacRc: string | null;
  sonDealership: string | null;
  dprFuelLicence: string | null;
  status: GeneratorDealerFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateGeneratorDealerInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  cacRc?: string | undefined;
  sonDealership?: string | undefined;
  dprFuelLicence?: string | undefined;
}

export interface UpdateGeneratorDealerInput {
  companyName?: string | undefined;
  cacRc?: string | null | undefined;
  sonDealership?: string | null | undefined;
  dprFuelLicence?: string | null | undefined;
  status?: GeneratorDealerFSMState | undefined;
}

export interface GeneratorUnit {
  id: string;
  workspaceId: string;
  tenantId: string;
  brand: string;
  kva: number;
  serialNumber: string;
  salePriceKobo: number;
  warrantyMonths: number;
  status: GeneratorUnitStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateGeneratorUnitInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  brand: string;
  kva: number;
  serialNumber: string;
  salePriceKobo: number;
  warrantyMonths?: number | undefined;
}

export interface GeneratorServiceJob {
  id: string;
  workspaceId: string;
  tenantId: string;
  unitSerial: string;
  clientPhone: string;
  faultDescription: string;
  labourKobo: number;
  partsKobo: number;
  totalKobo: number;
  status: ServiceJobStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateGeneratorServiceJobInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  unitSerial: string;
  clientPhone: string;
  faultDescription: string;
  labourKobo: number;
  partsKobo?: number | undefined;
  totalKobo: number;
}

export interface GeneratorSparePart {
  id: string;
  workspaceId: string;
  tenantId: string;
  partName: string;
  compatibleBrands: string;
  quantity: number;
  unitCostKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateGeneratorSparePartInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  partName: string;
  compatibleBrands?: string | undefined;
  quantity?: number | undefined;
  unitCostKobo: number;
}

export const VALID_GENERATOR_DEALER_TRANSITIONS: Record<GeneratorDealerFSMState, GeneratorDealerFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['son_verified', 'suspended'],
  son_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidGeneratorDealerTransition(from: GeneratorDealerFSMState, to: GeneratorDealerFSMState): boolean {
  return VALID_GENERATOR_DEALER_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim generator dealer profile' };
  return { allowed: true };
}

export function guardClaimedToSonVerified(ctx: { sonDealership: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.sonDealership) return { allowed: false, reason: 'SON dealership number required for son_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for son_verified transition' };
  return { allowed: true };
}
