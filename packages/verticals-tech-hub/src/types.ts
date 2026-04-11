/**
 * packages/verticals-tech-hub — Domain types (scaffold)
 * (M8e — Platform Invariants T3)
 *
 * FSM: seeded → claimed → active
 * Tech Hub modeled as a Place entity.
 */

export type TechHubFSMState = 'seeded' | 'claimed' | 'active';

export interface TechHubProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  hubName: string;
  lga: string;
  state: string;
  deskCount: number;
  focusAreas: string;   // JSON array
  status: TechHubFSMState;
  createdAt: number;
}

export interface CreateTechHubInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  hubName: string;
  lga: string;
  state: string;
  deskCount?: number;
  focusAreas?: string;
}

export interface UpdateTechHubInput {
  hubName?: string;
  lga?: string;
  state?: string;
  deskCount?: number;
  focusAreas?: string;
  status?: TechHubFSMState;
}

export const VALID_TECH_HUB_TRANSITIONS: Array<[TechHubFSMState, TechHubFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed','active'],
];

export function isValidTechHubTransition(from: TechHubFSMState, to: TechHubFSMState): boolean {
  return VALID_TECH_HUB_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
