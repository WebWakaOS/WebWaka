/**
 * @webwaka/verticals-fish-market — types + FSM guards (M12)
 * FSM: seeded → claimed → nafdac_verified → active → suspended
 * ADL-010: AI at L2 maximum — demand planning advisory only
 * P13: no buyer details in AI — aggregate weight/revenue stats only
 * P9: all kobo values must be integers; weights as integer grams; expiry as integer unix
 * T3: all queries scoped to tenant_id
 * KYC: Tier 1 for retail; Tier 2 for bulk wholesale above ₦200,000/day
 */

export type FishMarketFSMState =
  | 'seeded'
  | 'claimed'
  | 'nafdac_verified'
  | 'active'
  | 'suspended';

export type FishCategory = 'fresh' | 'frozen' | 'smoked' | 'dried';

const FSM_TRANSITIONS: Record<FishMarketFSMState, FishMarketFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['nafdac_verified'],
  nafdac_verified: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidFishMarketTransition(
  from: FishMarketFSMState,
  to: FishMarketFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNafdacVerified(input: {
  nafdacFoodSafetyCert: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.nafdacFoodSafetyCert) return { allowed: false, reason: 'NAFDAC food safety certificate required' };
  if (input.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required for NAFDAC verification' };
  return { allowed: true };
}

export function guardKycForWholesale(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for bulk wholesale above ₦200,000/day' };
  return { allowed: true };
}

export function guardIntegerGrams(grams: number): GuardResult {
  if (!Number.isInteger(grams) || grams < 0) return { allowed: false, reason: 'Weight must be a non-negative integer grams' };
  return { allowed: true };
}

export function guardExpiryAlert(expiryDate: number, nowUnix: number): GuardResult {
  if (expiryDate < nowUnix) return { allowed: false, reason: 'Stock has expired — expiry_date < current time' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: fish market AI capped at L2 — no automated purchasing' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface FishMarketProfile {
  id: string; workspaceId: string; tenantId: string;
  businessName: string; nafdacFoodSafetyCert: string | null; nifidaRegistration: string | null;
  marketLocation: string | null;
  status: FishMarketFSMState; createdAt: number; updatedAt: number;
}

export interface FishStock {
  id: string; profileId: string; tenantId: string;
  fishType: string; category: FishCategory; weightGrams: number;
  costPerKgKobo: number; expiryDate: number; source: string | null;
  createdAt: number; updatedAt: number;
}

export interface FishSale {
  id: string; profileId: string; tenantId: string;
  buyerPhone: string; fishType: string; weightGrams: number;
  pricePerKgKobo: number; totalKobo: number;
  saleDate: number; createdAt: number;
}

export interface FishWastage {
  id: string; profileId: string; tenantId: string;
  wasteDate: number; fishType: string; weightGrams: number;
  reason: string | null; createdAt: number;
}

export interface CreateFishMarketInput {
  id?: string; workspaceId: string; tenantId: string;
  businessName: string; nafdacFoodSafetyCert?: string; nifidaRegistration?: string;
  marketLocation?: string;
}

export interface CreateStockInput {
  id?: string; profileId: string; tenantId: string;
  fishType: string; category?: FishCategory; weightGrams: number;
  costPerKgKobo: number; expiryDate: number; source?: string;
}

export interface CreateSaleInput {
  id?: string; profileId: string; tenantId: string;
  buyerPhone: string; fishType: string; weightGrams: number;
  pricePerKgKobo: number; totalKobo: number; saleDate: number;
}

export interface CreateWastageInput {
  id?: string; profileId: string; tenantId: string;
  wasteDate: number; fishType: string; weightGrams: number; reason?: string;
}
