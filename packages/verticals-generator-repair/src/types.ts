/**
 * @webwaka/verticals-generator-repair — Domain types (M10)
 * FSM: seeded → claimed → cac_verified → active → suspended
 * AI: L1-L2 — INVENTORY_REORDER_ALERT, SALES_FORECAST; no customer_ref_id (P13)
 * P9: all monetary in kobo integers
 * P13: customer_ref_id opaque
 * T3: tenant_id always present
 */

export type GeneratorRepairFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active' | 'suspended';
export type RepairJobStatus = 'logged' | 'diagnosed' | 'in_repair' | 'completed' | 'warranty_claim';
export type EquipmentType = 'generator' | 'ac' | 'freezer' | 'pump' | 'hvac';

const FSM_TRANSITIONS: Record<GeneratorRepairFSMState, GeneratorRepairFSMState[]> = {
  seeded: ['claimed'], claimed: ['cac_verified'], cac_verified: ['active'], active: ['suspended'], suspended: ['active'],
};

export function isValidGeneratorRepairTransition(from: GeneratorRepairFSMState, to: GeneratorRepairFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}
export interface GuardResult { allowed: boolean; reason?: string; }
export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2) return { allowed: false, reason: 'Generator repair AI capped at L2' };
  return { allowed: true };
}

export interface GeneratorRepairProfile {
  id: string; workspaceId: string; tenantId: string; businessName: string; cacRc: string | null;
  sonCert: string | null; corenAwareness: string | null; serviceType: string;
  status: GeneratorRepairFSMState; createdAt: number; updatedAt: number;
}
export interface CreateGeneratorRepairInput {
  id?: string; workspaceId: string; tenantId: string; businessName: string; serviceType?: string;
  cacRc?: string; sonCert?: string; corenAwareness?: string;
}
export interface RepairJob {
  id: string; profileId: string; tenantId: string; customerRefId: string; equipmentType: EquipmentType;
  brand: string | null; serialNumber: string | null; faultCategory: string | null; partsUsed: string | null;
  labourCostKobo: number; partsCostKobo: number; totalCostKobo: number; jobDate: number;
  completedDate: number | null; warrantyDays: number; status: RepairJobStatus; createdAt: number; updatedAt: number;
}
export interface RepairPart {
  id: string; profileId: string; tenantId: string; partName: string; brandCompatible: string | null;
  quantityInStock: number; unitCostKobo: number; reorderLevel: number; createdAt: number; updatedAt: number;
}
