export type PharmacyFSMState = 'seeded' | 'claimed' | 'nafdac_verified' | 'active';

export interface PharmacyProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: PharmacyFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreatePharmacyInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdatePharmacyInput {
  displayName?: string | undefined;
  status?: PharmacyFSMState | undefined;
}

export const VALID_PHARMACY_TRANSITIONS: Array<[PharmacyFSMState, PharmacyFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'nafdac_verified'],
  ['nafdac_verified', 'active'],
];

export function isValidPharmacyTransition(
  from: PharmacyFSMState,
  to: PharmacyFSMState,
): boolean {
  return VALID_PHARMACY_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
