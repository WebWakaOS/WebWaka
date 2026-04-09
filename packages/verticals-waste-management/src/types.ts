/**
 * @webwaka/verticals-waste-management — Domain types
 * M11 — Platform Invariants T3, P9, P13
 *
 * FSM: seeded → claimed → fmenv_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:           KYC Tier 2 (subscription billing)
 *   fmenv_verified → active:    KYC Tier 3 (govt contracts > ₦5M)
 * P9: monetary in kobo, weight in integer kg (no floats)
 * P13: client addresses never passed to AI layer
 */

export type WasteMgmtFSMState =
  | 'seeded'
  | 'claimed'
  | 'fmenv_verified'
  | 'active'
  | 'suspended';

export type MaterialType = 'plastic' | 'paper' | 'metal' | 'glass' | 'other';

export interface WasteMgmtProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  lawmaOrStatePermit: string | null;
  fmenvCert: string | null;
  cacRc: string | null;
  status: WasteMgmtFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateWasteMgmtInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  companyName: string;
  lawmaOrStatePermit?: string | undefined;
  cacRc?: string | undefined;
}

export interface UpdateWasteMgmtInput {
  companyName?: string | undefined;
  lawmaOrStatePermit?: string | null | undefined;
  fmenvCert?: string | null | undefined;
  cacRc?: string | null | undefined;
  status?: WasteMgmtFSMState | undefined;
}

export interface WasteCollectionRoute {
  id: string;
  profileId: string;
  tenantId: string;
  routeName: string;
  zone: string | null;
  clientCount: number;
  truckId: string | null;
  collectionDay: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRouteInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  routeName: string;
  zone?: string | undefined;
  truckId?: string | undefined;
  collectionDay?: string | undefined;
}

export interface WasteSubscription {
  id: string;
  profileId: string;
  routeId: string | null;
  tenantId: string;
  clientPhone: string | null;
  clientAddress: string | null;
  monthlyFeeKobo: number;
  paymentStatus: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSubscriptionInput {
  id?: string | undefined;
  profileId: string;
  routeId?: string | undefined;
  tenantId: string;
  clientPhone?: string | undefined;
  clientAddress?: string | undefined;
  monthlyFeeKobo: number;
  paymentStatus?: string | undefined;
}

export interface WasteTonnageLog {
  id: string;
  profileId: string;
  routeId: string | null;
  tenantId: string;
  collectionDate: number | null;
  weightKg: number;
  wasteType: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTonnageInput {
  id?: string | undefined;
  profileId: string;
  routeId?: string | undefined;
  tenantId: string;
  collectionDate?: number | undefined;
  weightKg: number;
  wasteType?: string | undefined;
}

export interface RecyclingPurchase {
  id: string;
  profileId: string;
  tenantId: string;
  materialType: MaterialType;
  weightKg: number;
  pricePerKgKobo: number;
  supplierPhone: string | null;
  totalKobo: number;
  collectionDate: number | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRecyclingInput {
  id?: string | undefined;
  profileId: string;
  tenantId: string;
  materialType?: MaterialType | undefined;
  weightKg: number;
  pricePerKgKobo: number;
  supplierPhone?: string | undefined;
  collectionDate?: number | undefined;
}

export const VALID_WASTE_MGMT_TRANSITIONS: Record<WasteMgmtFSMState, WasteMgmtFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['fmenv_verified', 'suspended'],
  fmenv_verified: ['active', 'suspended'],
  active: ['suspended'],
  suspended: ['active'],
};

export function isValidWasteMgmtTransition(from: WasteMgmtFSMState, to: WasteMgmtFSMState): boolean {
  return VALID_WASTE_MGMT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardClaimedToFmenvVerified(ctx: { fmenvCert: string | null; kycTier: number }): { allowed: boolean; reason?: string } {
  if (!ctx.fmenvCert) return { allowed: false, reason: 'FMENV certificate required for fmenv_verified transition' };
  if (ctx.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required' };
  return { allowed: true };
}

export function guardGovtContract(ctx: { contractValueKobo: number; kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.contractValueKobo > 500_000_000 && ctx.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for government contracts above ₦5M' };
  return { allowed: true };
}
