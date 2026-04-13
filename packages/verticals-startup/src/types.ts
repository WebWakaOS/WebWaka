export type StartupFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'active';

export interface StartupProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: StartupFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateStartupInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateStartupInput {
  displayName?: string | undefined;
  status?: StartupFSMState | undefined;
}

export const VALID_STARTUP_TRANSITIONS: Array<[StartupFSMState, StartupFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'cac_verified'],
  ['cac_verified', 'active'],
];

export function isValidStartupTransition(
  from: StartupFSMState,
  to: StartupFSMState,
): boolean {
  return VALID_STARTUP_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
