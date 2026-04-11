/**
 * packages/verticals-transit — Domain types
 * (M8c — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → frsc_verified → route_licensed → active
 * Mass transit / city bus operator modeled as an Organization entity.
 */

export type TransitFSMState =
  | 'seeded'
  | 'claimed'
  | 'frsc_verified'
  | 'route_licensed'
  | 'active';

export interface TransitProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  operatorName: string;
  cacRegNumber: string | null;
  frscFleetRef: string | null;
  fleetSize: number;
  status: TransitFSMState;
  createdAt: number;
}

export interface CreateTransitInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  operatorName: string;
  cacRegNumber?: string;
  fleetSize?: number;
}

export interface UpdateTransitInput {
  operatorName?: string;
  cacRegNumber?: string | null;
  frscFleetRef?: string | null;
  fleetSize?: number;
  status?: TransitFSMState;
}

export const VALID_TRANSIT_TRANSITIONS: Array<[TransitFSMState, TransitFSMState]> = [
  ['seeded',        'claimed'],
  ['claimed',       'frsc_verified'],
  ['frsc_verified', 'route_licensed'],
  ['route_licensed','active'],
];

export function isValidTransitTransition(from: TransitFSMState, to: TransitFSMState): boolean {
  return VALID_TRANSIT_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
