export type TutoringFSMState = 'seeded' | 'claimed' | 'active';

export interface TutoringProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: TutoringFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTutoringInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateTutoringInput {
  displayName?: string | undefined;
  status?: TutoringFSMState | undefined;
}

export const VALID_TUTORING_TRANSITIONS: Array<[TutoringFSMState, TutoringFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'active'],
];

export function isValidTutoringTransition(
  from: TutoringFSMState,
  to: TutoringFSMState,
): boolean {
  return VALID_TUTORING_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
