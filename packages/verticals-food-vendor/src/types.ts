/**
 * @webwaka/verticals-food-vendor — Domain types
 * M9 Commerce P2 — Task V-COMM-EXT-A9
 *
 * FSM: seeded → claimed → active  (3-state informal pattern — no mandatory regulatory verification)
 * KYC: Tier 1 sufficient (informal sector)
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present), P12 (AI blocked on USSD)
 */

export type FoodVendorFSMState = 'seeded' | 'claimed' | 'active';

export type FoodType =
  | 'mama_put'
  | 'buka'
  | 'suya'
  | 'shawarma'
  | 'bole'
  | 'other';

export interface FoodVendorProfile {
  id: string;
  workspaceId: string;
  tenantId: string;               // T3
  vendorName: string;
  foodType: FoodType;
  locationDescription: string | null;
  lga: string;
  state: string;
  lgPermitNumber: string | null;  // optional — not a blocking FSM gate
  status: FoodVendorFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFoodVendorInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  vendorName: string;
  foodType: FoodType;
  lga: string;
  state: string;
  locationDescription?: string | undefined;
  lgPermitNumber?: string | undefined;
}

export interface UpdateFoodVendorInput {
  vendorName?: string | undefined;
  foodType?: FoodType | undefined;
  locationDescription?: string | null | undefined;
  lga?: string | undefined;
  state?: string | undefined;
  lgPermitNumber?: string | null | undefined;
  status?: FoodVendorFSMState | undefined;
}

export interface FoodVendorMenuItem {
  id: string;
  workspaceId: string;
  tenantId: string;   // T3
  itemName: string;
  priceKobo: number;  // P9
  available: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateMenuItemInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  itemName: string;
  priceKobo: number;
  available?: boolean | undefined;
}

export interface FoodVendorSale {
  id: string;
  workspaceId: string;
  tenantId: string;       // T3
  saleDate: number;       // unix date (start of day)
  totalKobo: number;      // P9 — day's total revenue
  itemsSoldCount: number;
  createdAt: number;
}

export interface CreateFoodVendorSaleInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  saleDate: number;
  totalKobo: number;
  itemsSoldCount?: number | undefined;
}

// ---------------------------------------------------------------------------
// FSM guard functions (pure — no I/O)
// ---------------------------------------------------------------------------

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim food vendor profile' };
  }
  return { allowed: true };
}

export const VALID_FOOD_VENDOR_TRANSITIONS: Array<[FoodVendorFSMState, FoodVendorFSMState]> = [
  ['seeded',  'claimed'],
  ['claimed', 'active'],
];

export function isValidFoodVendorTransition(
  from: FoodVendorFSMState,
  to: FoodVendorFSMState,
): boolean {
  return VALID_FOOD_VENDOR_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
