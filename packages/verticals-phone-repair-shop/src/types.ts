/**
 * @webwaka/verticals-phone-repair-shop — Domain types
 * M10 Commerce P3 — Task V-COMM-EXT-C10
 *
 * FSM: seeded → claimed → active (3-state informal)
 * KYC: Tier 1 sufficient
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 * P13: IMEI numbers never passed to AI layer
 */

export type PhoneRepairFSMState = 'seeded' | 'claimed' | 'active';
export type RepairJobStatus = 'intake' | 'diagnosing' | 'awaiting_parts' | 'repairing' | 'completed' | 'collected';

export interface PhoneRepairProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  lgPermitNumber: string | null;
  state: string | null;
  lga: string | null;
  status: PhoneRepairFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePhoneRepairInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  lgPermitNumber?: string | undefined;
  state?: string | undefined;
  lga?: string | undefined;
}

export interface UpdatePhoneRepairInput {
  shopName?: string | undefined;
  lgPermitNumber?: string | null | undefined;
  state?: string | null | undefined;
  lga?: string | null | undefined;
  status?: PhoneRepairFSMState | undefined;
}

export interface PhoneRepairJob {
  id: string;
  workspaceId: string;
  tenantId: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  imei: string | null;
  faultDescription: string;
  labourKobo: number;
  partsKobo: number;
  totalKobo: number;
  status: RepairJobStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePhoneRepairJobInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  imei?: string | undefined;
  faultDescription: string;
  labourKobo: number;
  partsKobo?: number | undefined;
  totalKobo: number;
}

export interface PhoneRepairPart {
  id: string;
  workspaceId: string;
  tenantId: string;
  partName: string;
  compatibleModels: string;
  quantity: number;
  unitCostKobo: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePhoneRepairPartInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  partName: string;
  compatibleModels?: string | undefined;
  quantity?: number | undefined;
  unitCostKobo: number;
}

export const VALID_PHONE_REPAIR_TRANSITIONS: Record<PhoneRepairFSMState, PhoneRepairFSMState[]> = {
  seeded: ['claimed'],
  claimed: ['active'],
  active: [],
};

export function isValidPhoneRepairTransition(from: PhoneRepairFSMState, to: PhoneRepairFSMState): boolean {
  return VALID_PHONE_REPAIR_TRANSITIONS[from]?.includes(to) ?? false;
}

export function guardSeedToClaimed(ctx: { kycTier: number }): { allowed: boolean; reason?: string } {
  if (ctx.kycTier < 1) return { allowed: false, reason: 'KYC Tier 1 required to claim phone repair shop profile' };
  return { allowed: true };
}

export function guardClaimedToActive(_ctx: Record<string, never>): { allowed: boolean; reason?: string } {
  return { allowed: true };
}
