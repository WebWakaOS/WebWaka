/**
 * packages/verticals-okada-keke — Domain types (scaffold)
 * (M8c — Platform Invariants T3)
 *
 * FSM: seeded → claimed → frsc_verified → active
 * Okada / keke cooperative modeled as an Organization entity.
 */

export type OkadaKekeFSMState = 'seeded' | 'claimed' | 'frsc_verified' | 'active';

export type OperatorType = 'okada' | 'keke' | 'both';

export interface OkadaKekeProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  operatorType: OperatorType;
  frscRef: string | null;
  riderCount: number;
  status: OkadaKekeFSMState;
  createdAt: number;
}

export interface CreateOkadaKekeInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  operatorType: OperatorType;
  riderCount?: number;
}

export interface UpdateOkadaKekeInput {
  operatorType?: OperatorType;
  frscRef?: string | null;
  riderCount?: number;
  status?: OkadaKekeFSMState;
}

export const VALID_OKADA_TRANSITIONS: Array<[OkadaKekeFSMState, OkadaKekeFSMState]> = [
  ['seeded',       'claimed'],
  ['claimed',      'frsc_verified'],
  ['frsc_verified','active'],
];

export function isValidOkadaTransition(from: OkadaKekeFSMState, to: OkadaKekeFSMState): boolean {
  return VALID_OKADA_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
