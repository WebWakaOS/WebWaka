/**
 * packages/verticals-ministry-mission — Domain types (scaffold)
 * (M8d — Platform Invariants T3)
 *
 * FSM: seeded → claimed → it_verified → active
 * Ministry / Apostolic Mission modeled as an Organization entity.
 */

export type MinistryFSMState = 'seeded' | 'claimed' | 'it_verified' | 'active';

export interface MinistryProfile {
  id: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  ministryName: string;
  itNumber: string | null;
  foundingYear: number | null;
  totalMembers: number;
  status: MinistryFSMState;
  createdAt: number;
}

export interface CreateMinistryInput {
  id?: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  ministryName: string;
  foundingYear?: number;
  totalMembers?: number;
}

export interface UpdateMinistryInput {
  ministryName?: string;
  itNumber?: string | null;
  foundingYear?: number | null;
  totalMembers?: number;
  status?: MinistryFSMState;
}

export const VALID_MINISTRY_TRANSITIONS: Array<[MinistryFSMState, MinistryFSMState]> = [
  ['seeded',     'claimed'],
  ['claimed',    'it_verified'],
  ['it_verified','active'],
];

export function isValidMinistryTransition(from: MinistryFSMState, to: MinistryFSMState): boolean {
  return VALID_MINISTRY_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
