/**
 * @webwaka/verticals-bookshop — Domain types
 * M9 Commerce P2 — Task V-COMM-EXT-A4
 *
 * FSM: seeded → claimed → cac_verified → active → suspended
 * Platform Invariants: P9 (kobo integers), T3 (tenant_id always present)
 */

export type BookshopFSMState =
  | 'seeded'
  | 'claimed'
  | 'cac_verified'
  | 'active'
  | 'suspended';

export type BookCategory = 'textbook' | 'novel' | 'religious' | 'stationery';

export type DeliveryMethod = 'pickup' | 'delivery';

export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface BookshopProfile {
  id: string;
  workspaceId: string;
  tenantId: string;     // T3
  shopName: string;
  cacNumber: string | null;
  state: string;
  lga: string;
  status: BookshopFSMState;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBookshopInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  shopName: string;
  state: string;
  lga: string;
  cacNumber?: string | undefined;
}

export interface UpdateBookshopInput {
  shopName?: string | undefined;
  cacNumber?: string | null | undefined;
  state?: string | undefined;
  lga?: string | undefined;
  status?: BookshopFSMState | undefined;
}

export interface BookshopCatalogueItem {
  id: string;
  workspaceId: string;
  tenantId: string;           // T3
  isbn: string | null;
  title: string;
  author: string | null;
  publisher: string | null;
  category: BookCategory;
  unitPriceKobo: number;      // P9
  quantityInStock: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCatalogueItemInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  title: string;
  category: BookCategory;
  unitPriceKobo: number;
  isbn?: string | undefined;
  author?: string | undefined;
  publisher?: string | undefined;
  quantityInStock?: number | undefined;
}

export interface BookshopOrder {
  id: string;
  workspaceId: string;
  tenantId: string;           // T3
  customerPhone: string;      // P13 — never sent to AI
  orderItems: string;         // JSON array
  totalKobo: number;          // P9
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  status: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateBookshopOrderInput {
  id?: string | undefined;
  workspaceId: string;
  tenantId: string;
  customerPhone: string;
  orderItems: string;
  totalKobo: number;
  deliveryMethod?: DeliveryMethod | undefined;
}

// ---------------------------------------------------------------------------
// FSM guard functions (pure — no I/O)
// ---------------------------------------------------------------------------

export type FSMGuardResult = { allowed: true } | { allowed: false; reason: string };

export function guardSeedToClaimed(opts: { kycTier: number }): FSMGuardResult {
  if (opts.kycTier < 1) {
    return { allowed: false, reason: 'KYC Tier 1 required to claim bookshop profile' };
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

export const VALID_BOOKSHOP_TRANSITIONS: Array<[BookshopFSMState, BookshopFSMState]> = [
  ['seeded',       'claimed'],
  ['claimed',      'cac_verified'],
  ['cac_verified', 'active'],
  ['active',       'suspended'],
  ['suspended',    'active'],
  ['claimed',      'suspended'],
];

export function isValidBookshopTransition(
  from: BookshopFSMState,
  to: BookshopFSMState,
): boolean {
  return VALID_BOOKSHOP_TRANSITIONS.some(([f, t]) => f === from && t === to);
}
