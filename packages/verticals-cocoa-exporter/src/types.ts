/**
 * @webwaka/verticals-cocoa-exporter — types + FSM guards (M12)
 * FSM: seeded → claimed → nepc_verified → active → suspended
 * ADL-010: AI at L2 maximum — commodity price alerts are informational only
 * P13: farmer phone never in AI; aggregate procurement stats only
 * P9: all kobo values must be integers; weights as integer kg
 * T3: all queries scoped to tenant_id
 * KYC: Tier 3 MANDATORY — export FX transactions; CBN forex requirements
 */

export type CocoaExporterFSMState =
  | 'seeded'
  | 'claimed'
  | 'nepc_verified'
  | 'active'
  | 'suspended';

export type CocoaGrade = 'grade1' | 'grade2' | 'grade3';
export type ExportStatus = 'prepared' | 'shipped' | 'repatriated';

const FSM_TRANSITIONS: Record<CocoaExporterFSMState, CocoaExporterFSMState[]> = {
  seeded:       ['claimed'],
  claimed:      ['nepc_verified'],
  nepc_verified: ['active'],
  active:       ['suspended'],
  suspended:    ['active'],
};

export function isValidCocoaExporterTransition(
  from: CocoaExporterFSMState,
  to: CocoaExporterFSMState,
): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToNepcVerified(input: {
  nepcExporterLicence: string | null | undefined;
  kycTier: number;
}): GuardResult {
  if (!input.nepcExporterLicence) return { allowed: false, reason: 'NEPC exporter licence required' };
  if (input.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 mandatory for cocoa export operations' };
  return { allowed: true };
}

export function guardKycTier3Mandatory(input: { kycTier: number }): GuardResult {
  if (input.kycTier < 3) return { allowed: false, reason: 'KYC Tier 3 mandatory — export FX transactions require CBN compliance' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel: string | number | undefined }): GuardResult {
  if (input.autonomyLevel === 'L3_HITL' || input.autonomyLevel === 3) {
    return { allowed: false, reason: 'ADL-010: cocoa exporter AI capped at L2 — no automated trade execution' };
  }
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) {
    return { allowed: false, reason: 'ADL-010: agricultural AI capped at L2 advisory' };
  }
  return { allowed: true };
}

export function guardP13FarmerData(input: { payloadKeys: string[] }): GuardResult {
  const banned = ['farmer_phone', 'farmer_name', 'farmer_address', 'individual_farmer'];
  const violations = input.payloadKeys.filter(k => banned.some(b => k.toLowerCase().includes(b)));
  if (violations.length > 0) return { allowed: false, reason: `P13 violation: farmer details in AI payload: ${violations.join(', ')}` };
  return { allowed: true };
}

export function guardIntegerWeight(kg: number): GuardResult {
  if (!Number.isInteger(kg) || kg < 0) return { allowed: false, reason: 'Weight must be a non-negative integer kg' };
  return { allowed: true };
}

export function guardFractionalKobo(amount: number): GuardResult {
  if (!Number.isInteger(amount) || amount < 0) return { allowed: false, reason: 'P9: kobo must be a non-negative integer' };
  return { allowed: true };
}

export interface CocoaExporterProfile {
  id: string; workspaceId: string; tenantId: string;
  companyName: string; nepcExporterLicence: string | null; nxpNumber: string | null;
  crinRegistered: boolean; cbnForexDealer: boolean; cacRc: string | null;
  status: CocoaExporterFSMState; createdAt: number; updatedAt: number;
}

export interface CocoaProcurement {
  id: string; profileId: string; tenantId: string;
  farmerPhone: string; quantityKg: number; grade: CocoaGrade;
  pricePerKgKobo: number; intakeDate: number; createdAt: number;
}

export interface CocoaExport {
  id: string; profileId: string; tenantId: string;
  buyerCountry: string; quantityKg: number; qualityCertRef: string | null;
  nepcLicenceRef: string | null; cbnFxForm: string | null;
  fobValueKobo: number; shippingDate: number | null;
  fxRepatriatedKobo: number; repatriationDate: number | null;
  status: ExportStatus; createdAt: number; updatedAt: number;
}

export interface CreateCocoaExporterInput {
  id?: string; workspaceId: string; tenantId: string;
  companyName: string; nepcExporterLicence?: string; nxpNumber?: string;
  crinRegistered?: boolean; cbnForexDealer?: boolean; cacRc?: string;
}

export interface CreateProcurementInput {
  id?: string; profileId: string; tenantId: string;
  farmerPhone: string; quantityKg: number; grade?: CocoaGrade;
  pricePerKgKobo: number; intakeDate: number;
}

export interface CreateExportInput {
  id?: string; profileId: string; tenantId: string;
  buyerCountry: string; quantityKg: number; qualityCertRef?: string;
  nepcLicenceRef?: string; cbnFxForm?: string;
  fobValueKobo: number; shippingDate?: number;
}
