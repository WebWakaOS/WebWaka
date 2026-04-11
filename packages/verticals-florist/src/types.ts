/**
 * @webwaka/verticals-florist — Domain types
 * M9 Commerce P2 — Task V-COMM-EXT-A8
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present), P13 (no client PII to AI)
 */

export type FloristFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type FloristSpeciality = 'wedding' | 'funeral' | 'corporate' | 'retail';

export type FlowerOccasion = 'wedding' | 'funeral' | 'birthday' | 'corporate' | 'retail';

export type FloristOrderStatus =
  | 'enquiry'
  | 'confirmed'
  | 'preparing'
  | 'delivered'
  | 'settled';

export interface FloristProfile {
  id: string;
  workspaceId: string;
  tenantId: string;         // T3
  businessName: string;
  cacNumber: string | null;
  speciality: FloristSpeciality;
  status: FloristFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFloristInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  businessName: string;
  speciality?: FloristSpeciality | undefined;
  cacNumber?: string | undefined;
}

export interface UpdateFloristInput {
  businessName?: string | undefined;
  cacNumber?: string | null | undefined;
  speciality?: FloristSpeciality | undefined;
  status?: FloristFSMState | undefined;
}

export interface FloristArrangement {
  id: string;
  workspaceId: string;
  tenantId: string;       // T3
  name: string;
  description: string | null;
  occasion: FlowerOccasion;
  priceKobo: number;      // P9
  imageUrl: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFloristArrangementInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  name: string;
  occasion: FlowerOccasion;
  priceKobo: number;
  description?: string | undefined;
  imageUrl?: string | undefined;
}

export interface FloristOrder {
  id: string;
  workspaceId: string;
  tenantId: string;           // T3
  clientPhone: string;        // P13 — never sent to AI
  arrangementId: string | null;
  eventDate: number;          // unix timestamp
  deliveryAddress: string | null; // P13 — never sent to AI
  depositKobo: number;        // P9
  balanceKobo: number;        // P9
  status: FloristOrderStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFloristOrderInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  clientPhone: string;
  eventDate: number;
  depositKobo?: number | undefined;
  balanceKobo?: number | undefined;
  arrangementId?: string | undefined;
  deliveryAddress?: string | undefined;
}

export interface FloristStock {
  id: string;
  workspaceId: string;
  tenantId: string;        // T3
  flowerName: string;
  quantityInStock: number;
  unitCostKobo: number;    // P9
  expiryDate: number | null; // unix timestamp — null = non-perishable
  supplierName: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFloristStockInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  flowerName: string;
  quantityInStock: number;
  unitCostKobo: number;
  expiryDate?: number | undefined;
  supplierName?: string | undefined;
}

// ---------------------------------------------------------------------------
// FSM guard functions (pure — no I/O)
// ---------------------------------------------------------------------------

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim florist profile' };
  }
  return { allowed: true };
}

export function guardClaimedToCacVerified(opts: {
  cacNumber: string | null;
}): FSMGuardResult {
  if (!opts.cacNumber) {
    return { allowed: false, reason: 'CAC registration number required for verification' };
  }
  return { allowed: true };
}

export const VALID_FLORIST_TRANSITIONS: Array<[FloristFSMState, FloristFSMState]> = [
  ['seeded',       'claimed'],
  ['claimed',      'cac_verified'],
  ['cac_verified', 'active'],
  ['active',       'suspended'],
  ['suspended',    'active'],
  ['claimed',      'suspended'],
];

export function isValidFloristTransition(
  from: FloristFSMState,
  to: FloristFSMState,
): boolean {
  return VALID_FLORIST_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
