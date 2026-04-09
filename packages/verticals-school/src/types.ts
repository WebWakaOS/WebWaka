/**
 * packages/verticals-school — Domain types
 * (M8e — Platform Invariants T3)
 *
 * FSM: seeded → claimed → reg_verified → active
 * School / Educational Institution modeled as an Organization entity.
 */

export type SchoolFSMState = 'seeded' | 'claimed' | 'reg_verified' | 'active';

export type SchoolType =
  | 'nursery' | 'primary' | 'secondary' | 'tertiary'
  | 'vocational' | 'tutoring' | 'others';

export interface SchoolProfile {
  id: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  schoolName: string;
  schoolType: SchoolType;
  cacRegNumber: string | null;
  stateRegRef: string | null;
  studentCount: number;
  status: SchoolFSMState;
  createdAt: number;
}

export interface CreateSchoolInput {
  id?: string;
  organizationId: string;
  workspaceId: string;
  tenantId: string;
  schoolName: string;
  schoolType: SchoolType;
  cacRegNumber?: string;
}

export interface UpdateSchoolInput {
  schoolName?: string;
  schoolType?: SchoolType;
  cacRegNumber?: string | null;
  stateRegRef?: string | null;
  studentCount?: number;
  status?: SchoolFSMState;
}

export const VALID_SCHOOL_TRANSITIONS: Array<[SchoolFSMState, SchoolFSMState]> = [
  ['seeded',      'claimed'],
  ['claimed',     'reg_verified'],
  ['reg_verified','active'],
];

export function isValidSchoolTransition(from: SchoolFSMState, to: SchoolFSMState): boolean {
  return VALID_SCHOOL_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
