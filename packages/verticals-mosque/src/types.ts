/**
 * packages/verticals-mosque — Domain types (scaffold)
 * (M8d — Platform Invariants T3)
 *
 * FSM: seeded → claimed → it_verified → active
 * Mosque / Islamic Centre modeled as an Organization entity.
 */

export type MosqueFSMState = 'seeded' | 'claimed' | 'it_verified' | 'active';

export interface MosqueProfile {
  id: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  mosqueName: string;
  itNumber: string | null;
  totalMembers: number;
  status: MosqueFSMState;
  createdAt: number;
}

export interface CreateMosqueInput {
  id?: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  mosqueName: string;
  totalMembers?: number;
}

export interface UpdateMosqueInput {
  mosqueName?: string;
  itNumber?: string | null;
  totalMembers?: number;
  status?: MosqueFSMState;
}

export const VALID_MOSQUE_TRANSITIONS: Array<[MosqueFSMState, MosqueFSMState]> = [
  ['seeded',     'claimed'],
  ['claimed',    'it_verified'],
  ['it_verified','active'],
];

export function isValidMosqueTransition(from: MosqueFSMState, to: MosqueFSMState): boolean {
  return VALID_MOSQUE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
