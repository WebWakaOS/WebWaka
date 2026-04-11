/**
 * packages/verticals-motor-park — Domain types
 * (M8c — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → frsc_verified → route_licensed → active
 * Motor park is modeled as a Place entity with FRSC + NURTW registration.
 */

export type ParkFSMState =
  | 'seeded'
  | 'claimed'
  | 'frsc_verified'
  | 'route_licensed'
  | 'active';

export type RouteStatus = 'pending' | 'licensed' | 'suspended' | 'expired';
export type RouteType   = 'intercity' | 'intracity' | 'interstate' | 'international';
export type VehicleType = 'bus' | 'minibus' | 'taxi' | 'truck' | 'keke' | 'okada' | 'ferry' | 'van';
export type VehicleStatus = 'active' | 'inactive' | 'suspended';

export interface MotorParkProfile {
  id: string;
  workspaceId: string;
  tenantId: string;
  placeId: string | null;
  parkName: string;
  lga: string;
  state: string;
  frscOperatorRef: string | null;
  nurtwRef: string | null;
  capacity: number | null;
  status: ParkFSMState;
  createdAt: number;
}

export interface TransportRoute {
  id: string;
  workspaceId: string;
  tenantId: string;
  routeName: string;
  originPlaceId: string | null;
  destPlaceId: string | null;
  routeType: RouteType;
  licenseRef: string | null;
  licenseExpires: number | null;
  fareKobo: number | null;
  frequencyMins: number | null;
  status: RouteStatus;
  createdAt: number;
}

export interface TransportVehicle {
  id: string;
  workspaceId: string;
  tenantId: string;
  routeId: string | null;
  plateNumber: string;
  vehicleType: VehicleType;
  capacity: number | null;
  frscLicense: string | null;
  frscExpires: number | null;
  status: VehicleStatus;
  createdAt: number;
}

export interface CreateParkInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  parkName: string;
  lga: string;
  state: string;
  placeId?: string;
  capacity?: number;
}

export interface UpdateParkInput {
  parkName?: string;
  lga?: string;
  state?: string;
  placeId?: string | null;
  frscOperatorRef?: string | null;
  nurtwRef?: string | null;
  capacity?: number | null;
  status?: ParkFSMState;
}

export interface CreateRouteInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  routeName: string;
  routeType: RouteType;
  originPlaceId?: string;
  destPlaceId?: string;
  fareKobo?: number;
  frequencyMins?: number;
}

export interface UpdateRouteInput {
  routeName?: string;
  routeType?: RouteType;
  licenseRef?: string | null;
  licenseExpires?: number | null;
  fareKobo?: number | null;
  frequencyMins?: number | null;
  status?: RouteStatus;
}

export interface CreateVehicleInput {
  id?: string;
  workspaceId: string;
  tenantId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  routeId?: string;
  capacity?: number;
  frscLicense?: string;
  frscExpires?: number;
}

export interface UpdateVehicleInput {
  plateNumber?: string;
  vehicleType?: VehicleType;
  routeId?: string | null;
  capacity?: number | null;
  frscLicense?: string | null;
  frscExpires?: number | null;
  status?: VehicleStatus;
}

export const VALID_PARK_TRANSITIONS: Array<[ParkFSMState, ParkFSMState]> = [
  ['seeded',        'claimed'],
  ['claimed',       'frsc_verified'],
  ['frsc_verified', 'route_licensed'],
  ['route_licensed','active'],
];

export function isValidParkTransition(from: ParkFSMState, to: ParkFSMState): boolean {
  return VALID_PARK_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
