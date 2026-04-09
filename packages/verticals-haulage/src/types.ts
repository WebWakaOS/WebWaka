/**
 * packages/verticals-haulage — Domain types (scaffold)
 * (M8c — Platform Invariants T3)
 *
 * FSM: seeded → claimed → frsc_verified → active
 * Haulage / logistics operator modeled as an Organization entity.
 */

export type HaulageFSMState = 'seeded' | 'claimed' | 'frsc_verified' | 'active';

export interface HaulageProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  cacRegNumber: string | null;
  frscFleetRef: string | null;
  serviceTypes: string;  // JSON array
  status: HaulageFSMState;
  createdAt: number;
}

export interface CreateHaulageInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  cacRegNumber?: string;
  serviceTypes?: string;
}

export interface UpdateHaulageInput {
  cacRegNumber?: string | null;
  frscFleetRef?: string | null;
  serviceTypes?: string;
  status?: HaulageFSMState;
}

export const VALID_HAULAGE_TRANSITIONS: Array<[HaulageFSMState, HaulageFSMState]> = [
  ['seeded',       'claimed'],
  ['claimed',      'frsc_verified'],
  ['frsc_verified','active'],
];

export function isValidHaulageTransition(from: HaulageFSMState, to: HaulageFSMState): boolean {
  return VALID_HAULAGE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
