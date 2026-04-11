/**
 * @webwaka/verticals-optician — Domain types (M10)
 * FSM: seeded → claimed → osphon_verified → active → suspended
 * AI: L2 for SCHEDULING_ADVISORY; L3 HITL for any clinical output
 * P9: all monetary in kobo; optical values as integers ×100
 * P13: patient_ref_id opaque; prescription data NEVER to AI
 * T3: tenant_id always present
 * KYC: Tier 2
 */

export type OpticianFSMState = 'seeded' | 'claimed' | 'osphon_verified' | 'active' | 'suspended';
export type ExamType = 'comprehensive' | 'refraction' | 'contact_lens' | 'pediatric';
export type AppointmentStatus = 'scheduled' | 'completed' | 'no_show' | 'cancelled';
export type OpticalOrderStatus = 'ordered' | 'lab' | 'ready' | 'collected';

const FSM_TRANSITIONS: Record<OpticianFSMState, OpticianFSMState[]> = {
  seeded: ['claimed'], claimed: ['osphon_verified'], osphon_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidOpticianTransition(from: OpticianFSMState, to: OpticianFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardClaimedToOsphonVerified(input: { osphonReg: string | null }): GuardResult {
  if (!input.osphonReg?.trim()) return { allowed: false, reason: 'OSPHON registration required' };
  return { allowed: true };
}
export function guardNoPrescriptionDataToAi(input: { includesPrescriptionData?: boolean }): GuardResult {
  if (input.includesPrescriptionData) return { allowed: false, reason: 'Prescription data must not be passed to AI (P13)' };
  return { allowed: true };
}
export function guardL3HitlClinical(input: { isClinicalOutput?: boolean }): GuardResult {
  if (input.isClinicalOutput) return { allowed: false, reason: 'Clinical outputs require L3 HITL human review' };
  return { allowed: true };
}

export interface OpticianProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; osphonReg?: string | null;
  cacRc: string | null; clinicType?: string; status: OpticianFSMState; createdAt: number; updatedAt: number;
  coaLicence: string | null;
  mdcnVerification: string | null;
}
export interface CreateOpticianInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; clinicType?: string;
  osphonReg?: string; cacRc?: string;
  coaLicence?: string;
  mdcnVerification?: string;
}
export interface OpticianAppointment {
  id: string; profileId: string; tenantId: string; patientRefId: string;
  appointmentDate: number; examType: ExamType; feeKobo: number; status: AppointmentStatus;
  createdAt: number; updatedAt: number;
}
export interface OpticianPrescription {
  id: string; appointmentId: string; profileId: string; tenantId: string; patientRefId: string;
  sphereRe: number | null; cylinderRe: number | null; axisRe: number | null;
  sphereLe: number | null; cylinderLe: number | null; axisLe: number | null;
  addPower: number | null; pdMm10: number | null; prescriptionDate: number; createdAt: number;
}
export interface OpticianOrder {
  id: string; profileId: string; tenantId: string; patientRefId: string; prescriptionId: string | null;
  frameType: string | null; lensType: string | null; frameCostKobo: number; lensCostKobo: number;
  totalKobo: number; orderDate: number; readyDate: number | null; status: OpticalOrderStatus;
  createdAt: number; updatedAt: number;
}

export interface VisionTestRecord {
  id: string; profileId: string; tenantId: string; patientRefId: string; testDate: number;
  rightEyeSphX100: number; leftEyeSphX100: number; rightEyeCylX100: number | null; leftEyeCylX100: number | null;
  pdMmX10: number | null; optometristRefId: string | null; requiresReferral: boolean;
  notes: string | null; consultationFeeKobo: number; createdAt: number;
}
export interface EyewearOrder {
  id: string; profileId: string; tenantId: string; patientRefId: string; testId: string | null;
  eyewearType: 'prescription_glasses' | 'sunglasses' | 'contact_lenses' | 'reading_glasses';
  frameBrand: string | null; lensBrand: string | null; totalKobo: number; depositKobo: number;
  orderDate: number; readyDate: number | null; status: 'pending' | 'ready' | 'collected' | 'cancelled';
  createdAt: number; updatedAt: number;
}
