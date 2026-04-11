/**
 * @webwaka/verticals-catering — Domain types
 * M9 Commerce P2 — Task V-COMM-EXT-A5
 *
 * FSM: seeded → claimed → nafdac_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:         KYC Tier 1
 *   nafdac_verified → active: NAFDAC cert required
 *   Events above ₦500,000 total: KYC Tier 2
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type CateringFSMState =
  | 'seeded'
  | 'claimed'
  | 'nafdac_verified'
  | 'active'
  | 'suspended';

export type CateringSpeciality = 'Nigerian' | 'continental' | 'confectionery' | 'all';

export type CateringEventStatus =
  | 'quoted'
  | 'confirmed'
  | 'prepping'
  | 'delivered'
  | 'settled';

export type StaffRole = 'cook' | 'server' | 'driver';

export interface CateringProfile {
  id: string;
  workspaceId: string;
  tenantId: string;           // T3
  businessName: string;
  nafdacCert: string | null;
  cacNumber: string | null;
  speciality: CateringSpeciality;
  status: CateringFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCateringInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  businessName: string;
  speciality?: CateringSpeciality | undefined;
  nafdacCert?: string | undefined;
  cacNumber?: string | undefined;
}

export interface UpdateCateringInput {
  businessName?: string | undefined;
  nafdacCert?: string | null | undefined;
  cacNumber?: string | null | undefined;
  speciality?: CateringSpeciality | undefined;
  status?: CateringFSMState | undefined;
}

export interface CateringEvent {
  id: string;
  workspaceId: string;
  tenantId: string;            // T3
  clientPhone: string;         // P13 — never sent to AI
  eventType: string;
  eventDate: number;           // unix timestamp
  guestCount: number;
  pricePerHeadKobo: number;    // P9
  totalKobo: number;           // P9
  depositKobo: number;         // P9
  balanceKobo: number;         // P9
  status: CateringEventStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCateringEventInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  eventType: string;
  eventDate: number;
  guestCount: number;
  pricePerHeadKobo: number;
  depositKobo?: number | undefined;
}

export interface CateringMenu {
  id: string;
  workspaceId: string;
  tenantId: string;          // T3
  menuName: string;
  description: string | null;
  costPerHeadKobo: number;   // P9
  createdAt: number;
}

export interface CreateCateringMenuInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  menuName: string;
  costPerHeadKobo: number;
  description?: string | undefined;
}

export interface CateringStaff {
  id: string;
  workspaceId: string;
  tenantId: string;            // T3
  staffName: string;
  role: StaffRole;
  nafdacCardNumber: string | null;
  createdAt: number;
}

export interface CreateCateringStaffInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  staffName: string;
  role: StaffRole;
  nafdacCardNumber?: string | undefined;
}

// ---------------------------------------------------------------------------
// FSM guard functions (pure — no I/O)
// ---------------------------------------------------------------------------

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim catering profile' };
  }
  return { allowed: true };
}

export function guardClaimedToNafdacVerified(opts: {
  nafdacCert: string | null;
}): FSMGuardResult {
  if (!opts.nafdacCert) {
    return { allowed: false, reason: 'NAFDAC food handler certificate required for verification' };
  }
  return { allowed: true };
}

export const VALID_CATERING_TRANSITIONS: Array<[CateringFSMState, CateringFSMState]> = [
  ['seeded',          'claimed'],
  ['claimed',         'nafdac_verified'],
  ['nafdac_verified', 'active'],
  ['active',          'suspended'],
  ['suspended',       'active'],
  ['claimed',         'suspended'],
];

export function isValidCateringTransition(
  from: CateringFSMState,
  to: CateringFSMState,
): boolean {
  return VALID_CATERING_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
