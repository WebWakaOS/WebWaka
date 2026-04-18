/**
 * @webwaka/verticals-printing-press — Domain types (M11)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L2 — SALES_FORECAST, INVENTORY_REORDER; no client_ref_id (P13)
 * P9: all monetary in kobo integers; quantity as integers
 * P13: client_ref_id opaque
 * T3: tenant_id always present
 */

export type PrintingPressFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type PrintJobType = 'offset' | 'digital' | 'large_format' | 'book' | 'newspaper' | 'advertising';
export type PrintJobStatus = 'quoted' | 'proof_sent' | 'approved' | 'printing' | 'finishing' | 'ready' | 'delivered';

const FSM_TRANSITIONS: Record<PrintingPressFSMState, PrintingPressFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidPrintingPressTransition(from: PrintingPressFSMState, to: PrintingPressFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Printing press AI capped at L2' };
  return { allowed: true };
}

export interface PrintingPressProfile {
  id: string; workspaceId: string; tenantId: string; companyName?: string; apconRef?: string | null;
  nanRef?: string | null; cacRc: string | null; pressType?: string;
  status: PrintingPressFSMState; createdAt: number; updatedAt: number;
  businessName: string;
  ncpnMembership: string | null;
  printType: 'offset' | 'digital' | 'screen' | 'flexographic' | null;
}
export interface CreatePrintingPressInput {
  id?: string; workspaceId: string; tenantId: string; companyName?: string; pressType?: string;
  apconRef?: string; nanRef?: string; cacRc?: string;
  businessName?: string;
  ncpnMembership?: string;
  printType?: string;
}
export interface PrintPressJob {
  id: string; profileId: string; tenantId: string; clientRefId: string; jobType: PrintJobType;
  quantity: number; paperType: string | null; finishing: string | null;
  unitCostKobo: number; totalKobo: number; depositKobo: number; proofApproved: boolean;
  deliveryDate: number | null; status: PrintJobStatus; createdAt: number; updatedAt: number;
}
export interface PressScheduleEntry {
  id: string; profileId: string; tenantId: string; machineName: string;
  jobId: string; scheduledDate: number; estimatedHours: number; createdAt: number;
}
export interface PressMaterial {
  id: string; profileId: string; tenantId: string; paperName: string;
  gsm: number; reamsInStock: number; costPerReamKobo: number; reorderLevel: number;
  createdAt: number; updatedAt: number;
}

export interface PrintingJob {
  id: string; profileId: string; tenantId: string; clientRefId: string;
  jobType: 'business_card' | 'brochure' | 'banner' | 'book' | 'stationery' | 'packaging';
  quantity: number; descriptionSpec: string | null; setupCostKobo: number; printCostKobo: number;
  totalKobo: number; depositKobo: number; jobDate: number; deliveryDate: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'; createdAt: number; updatedAt: number;
}
export interface PrintingInventory {
  id: string; profileId: string; tenantId: string; materialName: string;
  qtyInStock: number; unitCostKobo: number; reorderLevel: number; createdAt: number; updatedAt: number;
  unit?: string;
}
