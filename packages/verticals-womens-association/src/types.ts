/**
 * packages/verticals-womens-association — Domain types (scaffold)
 * (M8d — Platform Invariants T3)
 *
 * FSM: seeded → claimed → active
 * Women's Association modeled as an Organization entity.
 */

export type WomensAssocFSMState = 'seeded' | 'claimed' | 'active';

export interface WomensAssocProfile {
  id: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  assocName: string;
  lga: string;
  state: string;
  memberCount: number;
  status: WomensAssocFSMState;
  createdAt: number;
}

export interface CreateWomensAssocInput {
  id?: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  assocName: string;
  lga: string;
  state: string;
  memberCount?: number;
}

export interface UpdateWomensAssocInput {
  assocName?: string;
  lga?: string;
  state?: string;
  memberCount?: number;
  status?: WomensAssocFSMState;
}

export const VALID_WOMENS_ASSOC_TRANSITIONS: Array<[WomensAssocFSMState, WomensAssocFSMState]> = [
  ['seeded', 'claimed'],
  ['claimed','active'],
];

export function isValidWomensAssocTransition(from: WomensAssocFSMState, to: WomensAssocFSMState): boolean {
  return VALID_WOMENS_ASSOC_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
