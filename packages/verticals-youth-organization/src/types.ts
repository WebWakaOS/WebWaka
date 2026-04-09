/**
 * packages/verticals-youth-organization — Domain types (scaffold)
 * (M8d — Platform Invariants T3)
 *
 * FSM: seeded → claimed → active → suspended
 * Youth Organization modeled as an Organization entity.
 */

export type YouthOrgFSMState = 'seeded' | 'claimed' | 'active' | 'suspended';

export interface YouthOrgProfile {
  id: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  orgName: string;
  registrationRef: string | null;
  memberCount: number;
  status: YouthOrgFSMState;
  createdAt: number;
}

export interface CreateYouthOrgInput {
  id?: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  orgName: string;
  memberCount?: number;
}

export interface UpdateYouthOrgInput {
  orgName?: string;
  registrationRef?: string | null;
  memberCount?: number;
  status?: YouthOrgFSMState;
}

export const VALID_YOUTH_ORG_TRANSITIONS: Array<[YouthOrgFSMState, YouthOrgFSMState]> = [
  ['seeded',   'claimed'],
  ['claimed',  'active'],
  ['active',   'suspended'],
  ['suspended','active'],
];

export function isValidYouthOrgTransition(from: YouthOrgFSMState, to: YouthOrgFSMState): boolean {
  return VALID_YOUTH_ORG_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
