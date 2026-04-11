/**
 * @webwaka/verticals-beauty-salon — Domain types
 * M9 Commerce P2 — Task V-COMM-EXT-A3
 *
 * FSM: seeded → claimed → permit_verified → active → suspended
 * KYC gates:
 *   seeded → claimed:          KYC Tier 1
 *   permit_verified → active:  State business permit number required
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type BeautySalonFSMState =
  | 'seeded'
  | 'claimed'
  | 'permit_verified'
  | 'active'
  | 'suspended';

export type SalonType = 'salon' | 'barber' | 'unisex';

export type AppointmentStatus =
  | 'booked'
  | 'confirmed'
  | 'in_service'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export interface BeautySalonProfile {
  id: string;
  workspaceId: string;
  tenantId: string;             // T3
  salonName: string;
  salonType: SalonType;
  nascNumber: string | null;
  statePermitNumber: string | null;
  state: string;
  status: BeautySalonFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBeautySalonInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  salonName: string;
  salonType: SalonType;
  state: string;
  nascNumber?: string | undefined;
  statePermitNumber?: string | undefined;
}

export interface UpdateBeautySalonInput {
  salonName?: string | undefined;
  salonType?: SalonType | undefined;
  nascNumber?: string | null | undefined;
  statePermitNumber?: string | null | undefined;
  state?: string | undefined;
  status?: BeautySalonFSMState | undefined;
}

export interface SalonService {
  id: string;
  workspaceId: string;
  tenantId: string;       // T3
  serviceName: string;
  durationMinutes: number;
  priceKobo: number;      // P9
  staffId: string | null;
  createdAt: number;
}

export interface CreateSalonServiceInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  serviceName: string;
  durationMinutes: number;
  priceKobo: number;
  staffId?: string | undefined;
}

export interface SalonAppointment {
  id: string;
  workspaceId: string;
  tenantId: string;           // T3
  clientPhone: string;        // P13 — never sent to AI
  serviceId: string | null;
  staffId: string | null;
  appointmentTime: number;    // unix timestamp
  depositKobo: number;        // P9
  status: AppointmentStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSalonAppointmentInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  serviceId?: string | undefined;
  staffId?: string | undefined;
  appointmentTime: number;
  depositKobo?: number | undefined;
}

export interface SalonProduct {
  id: string;
  workspaceId: string;
  tenantId: string;       // T3
  productName: string;
  brand: string | null;
  unitPriceKobo: number;  // P9
  quantityInStock: number;
  createdAt: number;
}

export interface CreateSalonProductInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  productName: string;
  brand?: string | undefined;
  unitPriceKobo: number;
  quantityInStock?: number | undefined;
}

// ---------------------------------------------------------------------------
// FSM guard functions (pure — no I/O)
// ---------------------------------------------------------------------------

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim beauty salon profile' };
  }
  return { allowed: true };
}

export function guardClaimedToPermitVerified(opts: {
  statePermitNumber: string | null;
}): FSMGuardResult {
  if (!opts.statePermitNumber) {
    return { allowed: false, reason: 'State business permit number required for verification' };
  }
  return { allowed: true };
}

export const VALID_BEAUTY_SALON_TRANSITIONS: Array<[BeautySalonFSMState, BeautySalonFSMState]> = [
  ['seeded',          'claimed'],
  ['claimed',         'permit_verified'],
  ['permit_verified', 'active'],
  ['active',          'suspended'],
  ['suspended',       'active'],
  ['claimed',         'suspended'],
];

export function isValidBeautySalonTransition(
  from: BeautySalonFSMState,
  to: BeautySalonFSMState,
): boolean {
  return VALID_BEAUTY_SALON_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
