export type GymFSMState = 'seeded' | 'claimed' | 'active';

export interface GymProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: GymFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateGymInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateGymInput {
  displayName?: string | undefined;
  status?: GymFSMState | undefined;
}

export const VALID_GYM_TRANSITIONS: Array<[GymFSMState, GymFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'active'],
];

export function isValidGymTransition(
  from: GymFSMState,
  to: GymFSMState,
): boolean {
  return VALID_GYM_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
