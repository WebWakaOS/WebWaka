export type FashionBrandFSMState = 'seeded' | 'claimed' | 'active';

export interface FashionBrandProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  displayName: string;
  status: FashionBrandFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFashionBrandInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  displayName: string;
}

export interface UpdateFashionBrandInput {
  displayName?: string | undefined;
  status?: FashionBrandFSMState | undefined;
}

export const VALID_FASHION_BRAND_TRANSITIONS: Array<[FashionBrandFSMState, FashionBrandFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed', 'active'],
];

export function isValidFashionBrandTransition(
  from: FashionBrandFSMState,
  to: FashionBrandFSMState,
): boolean {
  return VALID_FASHION_BRAND_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
