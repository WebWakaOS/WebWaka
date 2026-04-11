/**
 * @webwaka/verticals-pharmacy-chain — Domain types (M9)
 * FSM: seeded → claimed → pcn_verified → nafdac_verified → active → suspended
 * AI: L2 — INVENTORY_REORDER_ALERT, EXPIRY_ALERT; no patient/prescriber refs (P13)
 * P9: all monetary in kobo integers
 * P13: patient_ref_id, prescriber_ref_id, client_ref_id opaque — NEVER to AI
 * T3: tenant_id always present
 * KYC: Tier 2 for dispensing; Tier 3 for wholesale above ₦10M
 */

export type PharmacyChainFSMState = 'seeded' | 'claimed' | 'pcn_verified' | 'nafdac_verified' | 'active' | 'suspended';
export type PharmacyCategory = 'retail' | 'wholesale' | 'both';

const FSM_TRANSITIONS: Record<PharmacyChainFSMState, PharmacyChainFSMState[]> = {
  seeded: ['claimed'], claimed: ['pcn_verified'], pcn_verified: ['nafdac_verified'],
  nafdac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidPharmacyChainTransition(from: PharmacyChainFSMState, to: PharmacyChainFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardClaimedToPcnVerified(input: { pcnLicence: string | null }): GuardResult {
  if (!input.pcnLicence?.trim()) return { allowed: false, reason: 'PCN licence required to verify pharmacy' };
  return { allowed: true };
}
export function guardPcnToNafdacVerified(input: { nafdacLicence: string | null }): GuardResult {
  if (!input.nafdacLicence?.trim()) return { allowed: false, reason: 'NAFDAC licence required' };
  return { allowed: true };
}
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Pharmacy AI capped at L2' };
  return { allowed: true };
}

export interface PharmacyChainProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; pcnLicence: string | null;
  nafdacLicence: string | null; cacRc: string | null; category: PharmacyCategory;
  status: PharmacyChainFSMState; createdAt: number; updatedAt: number;
}
export interface CreatePharmacyChainInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; category?: PharmacyCategory;
  pcnLicence?: string; nafdacLicence?: string; cacRc?: string;
}
export interface DrugInventoryItem {
  id: string; profileId: string; tenantId: string; drugName: string; nafdacReg: string | null;
  quantityInStock: number; reorderLevel: number; unitPriceKobo: number; wholesalePriceKobo: number;
  expiryDate: number | null; prescriptionRequired: boolean; createdAt: number; updatedAt: number;
}
export interface PrescriptionDispensing {
  id: string; profileId: string; tenantId: string; patientRefId: string; prescriberRefId: string | null;
  drugId: string; quantity: number; totalKobo: number; dispensedDate: number; status: string; createdAt: number;
}
export interface DrugSale {
  id: string; profileId: string; tenantId: string; drugId: string; clientRefId: string | null;
  quantity: number; unitPriceKobo: number; totalKobo: number; saleDate: number;
  isPrescription: boolean; isWholesale: boolean; createdAt: number;
}
