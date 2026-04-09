/**
 * packages/verticals-rideshare — Domain types
 * (M8c — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → frsc_verified → active → suspended
 * Rideshare / carpooling driver is modeled as an Individual entity.
 * P9: rating stored as integer ×10 (e.g. 47 = 4.7 stars).
 */

export type RideshareFSMState =
  | 'seeded'
  | 'claimed'
  | 'frsc_verified'
  | 'active'
  | 'suspended';

export interface RideshareProfile {
  id: string;
  individualId: string;
  workspaceId: string;
  tenantId: string;
  frscLicense: string | null;
  frscExpires: number | null;
  vehicleType: string | null;
  plateNumber: string | null;
  seatCount: number;
  ratingX10: number;  // P9: 47 = 4.7 stars
  status: RideshareFSMState;
  createdAt: number;
}

export interface CreateRideshareInput {
  id?: string;
  individualId: string;
  workspaceId: string;
  tenantId: string;
  vehicleType?: string;
  plateNumber?: string;
  seatCount?: number;
}

export interface UpdateRideshareInput {
  frscLicense?: string | null;
  frscExpires?: number | null;
  vehicleType?: string | null;
  plateNumber?: string | null;
  seatCount?: number;
  ratingX10?: number;
  status?: RideshareFSMState;
}

export const VALID_RIDESHARE_TRANSITIONS: Array<[RideshareFSMState, RideshareFSMState]> = [
  ['seeded',       'claimed'],
  ['claimed',      'frsc_verified'],
  ['frsc_verified','active'],
  ['active',       'suspended'],
  ['suspended',    'active'],
];

export function isValidRideshareTransition(from: RideshareFSMState, to: RideshareFSMState): boolean {
  return VALID_RIDESHARE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
