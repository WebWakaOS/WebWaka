/**
 * @webwaka/verticals-abattoir — types + FSM guards (M12)
 * FSM: seeded → claimed → nafdac_verified → active → suspended
 * ADL-010: AI at L2 maximum — yield forecasts advisory only
 * P13: no buyer personal details in AI — aggregate head counts only
 * P9: all kobo values must be integers; weights as integer kg; head counts as integers
 * T3: all queries scoped to tenant_id
 * KYC: Tier 2 for meat sales; Tier 3 for bulk export
 */

export type AbattoirFSMState =
  | 'seeded'
  | 'claimed'
  | 'nafdac_verified'
  | 'active'
  | 'suspended';

export type AnimalType = 'cattle' | 'sheep' | 'goat' | 'pig' | 'poultry';

const FSM_TRANSITIONS: Record<AbattoirFSMState, AbattoirFSMState[]> = {
  seeded:          ['claimed'],
  claimed:         ['nafdac_verified'],
  nafdac_verified: ['active'],
  active:          ['suspended'],
  suspended:       ['active'],
};

export function isValidAbattoirTransition(
  from: AbattoirFSMState,
  to: AbattoirFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNafdacVerified(input: {
  nafdacRegistration: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.nafdacRegistration) return { allowed: false, reason: 'NAFDAC registration number required' };
  if (input.kycTier < 2) return { allowed: false, reason: 'KYC Tier 2 required for NAFDAC verification' };
  return { allowed: true };
}

export function guardKycForExport(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 required for bulk meat export operations' };
  return { allowed: true };
}

export function guardIntegerWeight(kg: number): GuardResult {
  if (!Number.isInteger(kg) || kg < 0) return { allowed: false, reason: 'Weight must be a non-negative integer kg' };
  return { allowed: true };
}

export function guardIntegerHeadCount(count: number): GuardResult {
  if (!Number.isInteger(count) || count < 0) return { allowed: false, reason: 'Head count must be a non-negative integer' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: abattoir AI capped at L2 — no automated slaughter scheduling' };
  }
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface AbattoirProfile {
  id: string; workspaceId: string; tenantId: string;
  abattoirName: string; nafdacRegistration: string | null; nvriApproval: string | null;
  stateAnimalHealthCert: string | null; cacRc: string | null; capacityHeadPerDay: number;
  status: AbattoirFSMState; createdAt: number; updatedAt: number;
}

export interface AbattoirSlaughterLog {
  id: string; profileId: string; tenantId: string;
  slaughterDate: number; animalType: AnimalType;
  headCount: number; vetInspected: boolean; meatYieldKg: number; createdAt: number;
}

export interface AbattoirSale {
  id: string; profileId: string; tenantId: string;
  buyerPhone: string; animalType: AnimalType;
  quantityKg: number; pricePerKgKobo: number; totalKobo: number;
  saleDate: number; createdAt: number;
}

export interface CreateAbattoirInput {
  id?: string; workspaceId: string; tenantId: string;
  abattoirName: string; nafdacRegistration?: string; nvriApproval?: string;
  stateAnimalHealthCert?: string; cacRc?: string; capacityHeadPerDay?: number;
}

export interface CreateSlaughterLogInput {
  id?: string; profileId: string; tenantId: string;
  slaughterDate: number; animalType: AnimalType;
  headCount: number; vetInspected?: boolean; meatYieldKg: number;
}

export interface CreateSaleInput {
  id?: string; profileId: string; tenantId: string;
  buyerPhone: string; animalType: AnimalType;
  quantityKg: number; pricePerKgKobo: number; totalKobo: number; saleDate: number;
}
