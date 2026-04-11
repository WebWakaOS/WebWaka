/**
 * packages/verticals-clinic — Domain types
 * (M8e — Platform Invariants T3)
 *
 * FSM: seeded → claimed → mdcn_verified → active
 * Clinic / Healthcare Facility modeled as an Organization entity.
 */

export type ClinicFSMState = 'seeded' | 'claimed' | 'mdcn_verified' | 'active';

export type FacilityType =
  | 'clinic' | 'hospital' | 'pharmacy' | 'laboratory'
  | 'maternity' | 'dental' | 'optical' | 'others';

export interface ClinicProfile {
  id: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  facilityName: string;
  facilityType: FacilityType;
  mdcnRef: string | null;
  cacRegNumber: string | null;
  bedCount: number;
  status: ClinicFSMState;
  createdAt: number;
}

export interface CreateClinicInput {
  id?: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  facilityName: string;
  facilityType: FacilityType;
  cacRegNumber?: string;
  bedCount?: number;
}

export interface UpdateClinicInput {
  facilityName?: string;
  facilityType?: FacilityType;
  mdcnRef?: string | null;
  cacRegNumber?: string | null;
  bedCount?: number;
  status?: ClinicFSMState;
}

export const VALID_CLINIC_TRANSITIONS: Array<[ClinicFSMState, ClinicFSMState]> = [
  ['seeded',      'claimed'],
  ['claimed',     'mdcn_verified'],
  ['mdcn_verified','active'],
];

export function isValidClinicTransition(from: ClinicFSMState, to: ClinicFSMState): boolean {
  return VALID_CLINIC_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
