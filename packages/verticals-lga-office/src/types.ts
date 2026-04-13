export type LgaOfficeFSMState = 'seeded' | 'claimed' | 'active';

export interface LgaOfficeProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: LgaOfficeFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateLgaOfficeInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateLgaOfficeInput {
  displayName?: string | undefined;
  status?: LgaOfficeFSMState | undefined;
}

export const VALID_LGA_OFFICE_TRANSITIONS: Array<[LgaOfficeFSMState, LgaOfficeFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'active'],
];

export function isValidLgaOfficeTransition(
  from: LgaOfficeFSMState,
  to: LgaOfficeFSMState,
): boolean {
  return VALID_LGA_OFFICE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
