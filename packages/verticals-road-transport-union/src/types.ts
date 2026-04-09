/**
 * packages/verticals-road-transport-union — Domain types (scaffold)
 * (M8c — Platform Invariants T3)
 *
 * FSM: seeded → claimed → active → suspended
 * NURTW / road transport union modeled as an Organization entity.
 */

export type RtuFSMState = 'seeded' | 'claimed' | 'active' | 'suspended';

export interface RtuProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  unionName: string;
  registrationRef: string | null;
  memberCount: number;
  status: RtuFSMState;
  createdAt: number;
}

export interface CreateRtuInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  unionName: string;
  memberCount?: number;
}

export interface UpdateRtuInput {
  unionName?: string;
  registrationRef?: string | null;
  memberCount?: number;
  status?: RtuFSMState;
}

export const VALID_RTU_TRANSITIONS: Array<[RtuFSMState, RtuFSMState]> = [
  ['seeded',   'claimed'],
  ['claimed',  'active'],
  ['active',   'suspended'],
  ['suspended','active'],
];

export function isValidRtuTransition(from: RtuFSMState, to: RtuFSMState): boolean {
  return VALID_RTU_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
