/**
 * packages/verticals-professional — Domain types
 * (M8e — Platform Invariants T3, P9)
 *
 * FSM: seeded → claimed → license_verified → active
 * Professional (lawyer, doctor, accountant, etc.) as an Individual entity.
 * P9: consultation_fee in integer kobo.
 */

export type ProfessionalFSMState = 'seeded' | 'claimed' | 'license_verified' | 'active';

export type Profession =
  | 'lawyer' | 'doctor' | 'accountant' | 'engineer' | 'architect'
  | 'pharmacist' | 'nurse' | 'surveyor' | 'optician' | 'dentist' | 'others';

export interface ProfessionalProfile {
  id: string;
  individualId: string;
  workspaceId: string;
  tenantId: string;
  profession: Profession;
  licenseBody: string | null;
  licenseNumber: string | null;
  licenseExpires: number | null;
  yearsExperience: number;
  consultationFeeKobo: number | null;
  status: ProfessionalFSMState;
  createdAt: number;
}

export interface CreateProfessionalInput {
  id?: string;
  individualId: string;
  workspaceId: string;
  tenantId: string;
  profession: Profession;
  yearsExperience?: number;
  consultationFeeKobo?: number;
}

export interface UpdateProfessionalInput {
  profession?: Profession;
  licenseBody?: string | null;
  licenseNumber?: string | null;
  licenseExpires?: number | null;
  yearsExperience?: number;
  consultationFeeKobo?: number | null;
  status?: ProfessionalFSMState;
}

export const VALID_PROFESSIONAL_TRANSITIONS: Array<[ProfessionalFSMState, ProfessionalFSMState]> = [
  ['seeded',          'claimed'],
  ['claimed',         'license_verified'],
  ['license_verified','active'],
];

export function isValidProfessionalTransition(from: ProfessionalFSMState, to: ProfessionalFSMState): boolean {
  return VALID_PROFESSIONAL_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
