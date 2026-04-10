/**
 * @webwaka/verticals-agro-input — types + FSM guards (M10)
 * FSM: seeded → claimed → nasc_verified → active → suspended
 * ADL-010: AI at L2 maximum — advisory only, no auto-procurement/sales
 * P13: farmer aggregate counts only in AI — no individual farmer details
 * P9: all kobo values must be integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for farmer credit; Tier 3 for ABP subsidy disbursement
 */

export type AgroInputFSMState =
  | 'seeded'
  | 'claimed'
  | 'nasc_verified'
  | 'active'
  | 'suspended';

export type ProductCategory = 'seed' | 'fertilizer' | 'herbicide' | 'pesticide' | 'equipment';
export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

const FSM_TRANSITIONS: Record<AgroInputFSMState, AgroInputFSMState[]> = {
  seeded:       ['claimed'],
  claimed:      ['nasc_verified'],
  nasc_verified: ['active'],
  active:       ['suspended'],
  suspended:    ['active'],
};

export function isValidAgroInputTransition(
  from: AgroInputFSMState,
  to: AgroInputFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNascVerified(input: {
  nascDealerNumber: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.nascDealerNumber) return { allowed: false, reason: 'NASC dealer number required' };
  if (input.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required for NASC verification' };
  return { allowed: true };
}

export function guardKycForAbp(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for ABP subsidy disbursement' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: agricultural AI capped at L2 — no automated purchase/sale actions' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'ADL-010: agricultural AI capped at L2 advisory' };
  }
  return { allowed: true };
}

export function guardP13FarmerData(input: { payloadKeys: string[] }): GuardResult {
  const banned = ['farmer_name', 'farmer_phone', 'farmer_address', 'individual_farmer'];
  const violations = input.payloadKeys.filter(k => banned.some(b => k.toLowerCase().includes(b)));
  if (violations.length > 0) return { allowed: false, reason: `P13 violation: farmer PII in AI payload: ${violations.join(', ')}` };
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface AgroInputProfile {
  id: string; workspaceId: string; tenantId: string;
  companyName: string; nascDealerNumber: string | null; fepsanMembership: string | null;
  nafdacAgrochemicalReg: string | null; fmardAbpParticipant: boolean; cacRc: string | null;
  status: AgroInputFSMState; createdAt: number; updatedAt: number;
}

export interface AgroInputCatalogueItem {
  id: string; profileId: string; tenantId: string;
  productName: string; category: ProductCategory;
  nascOrNafdacCertNumber: string | null; unit: string;
  pricePerUnitKobo: number; quantityInStock: number; createdAt: number; updatedAt: number;
}

export interface AgroInputOrder {
  id: string; profileId: string; tenantId: string;
  farmerPhone: string; farmerName: string | null;
  items: string; totalKobo: number; abpSubsidyKobo: number; balanceKobo: number;
  status: OrderStatus; createdAt: number; updatedAt: number;
}

export interface AgroFarmerCredit {
  id: string; profileId: string; tenantId: string;
  farmerPhone: string; creditLimitKobo: number;
  balanceOwingKobo: number; abpWalletBalanceKobo: number; createdAt: number; updatedAt: number;
}

export interface CreateAgroInputInput {
  id?: string; workspaceId: string; tenantId: string;
  companyName: string; nascDealerNumber?: string; fepsanMembership?: string;
  nafdacAgrochemicalReg?: string; fmardAbpParticipant?: boolean; cacRc?: string;
}

export interface CreateCatalogueItemInput {
  id?: string; profileId: string; tenantId: string;
  productName: string; category?: ProductCategory;
  nascOrNafdacCertNumber?: string; unit?: string;
  pricePerUnitKobo: number; quantityInStock?: number;
}

export interface CreateOrderInput {
  id?: string; profileId: string; tenantId: string;
  farmerPhone: string; farmerName?: string;
  items?: string; totalKobo: number; abpSubsidyKobo?: number;
}

export interface CreateFarmerCreditInput {
  id?: string; profileId: string; tenantId: string;
  farmerPhone: string; creditLimitKobo: number; abpWalletBalanceKobo?: number;
}
