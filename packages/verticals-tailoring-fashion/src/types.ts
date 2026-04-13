export type TailoringFashionFSMState = 'seeded' | 'claimed' | 'active';

export interface TailoringFashionProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: TailoringFashionFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTailoringFashionInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateTailoringFashionInput {
  displayName?: string | undefined;
  status?: TailoringFashionFSMState | undefined;
}

export const VALID_TAILORING_FASHION_TRANSITIONS: Array<[TailoringFashionFSMState, TailoringFashionFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'active'],
];

export function isValidTailoringFashionTransition(
  from: TailoringFashionFSMState,
  to: TailoringFashionFSMState,
): boolean {
  return VALID_TAILORING_FASHION_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
