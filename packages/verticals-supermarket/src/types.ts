/**
 * @webwaka/verticals-supermarket — Domain types (M9)
 * FSM: seeded → claimed → cac_verified → nafdac_compliant → active → suspended
 * AI: L2 — INVENTORY_REORDER_ALERT, SALES_FORECAST; no customer PII (P13)
 * P9: all monetary values in kobo integers; loyalty points as integers
 * P13: customer_ref_id opaque — never to AI
 * T3: tenant_id always present
 * KYC: Tier 1 for standard grocery; Tier 2 for alcohol/tobacco; Tier 3 for wholesale above ₦50M
 */

export type SupermarketFSMState = 'seeded' | 'claimed' | 'cac_verified' | 'nafdac_compliant' | 'active' | 'suspended';
export type ProductCategory =
  | 'groceries' | 'beverages' | 'dairy' | 'meat_seafood' | 'bakery'
  | 'frozen' | 'household' | 'personal_care' | 'electronics' | 'clothing'
  | 'baby' | 'health' | 'stationery' | 'hardware' | 'general';

export type OrderStatus = 'pending' | 'picking' | 'packed' | 'dispatched' | 'delivered' | 'cancelled' | 'refunded';

const FSM_TRANSITIONS: Record<SupermarketFSMState, SupermarketFSMState[]> = {
  seeded:           ['claimed'],
  claimed:          ['cac_verified'],
  cac_verified:     ['nafdac_compliant'],
  nafdac_compliant: ['active'],
  active:           ['suspended'],
  suspended:        ['active'],
};

export function isValidSupermarketTransition(from: SupermarketFSMState, to: SupermarketFSMState): boolean {
  return FSM_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface GuardResult { allowed: boolean; reason?: string; }

export function guardClaimedToCacVerified(input: { cacRc: string | null }): GuardResult {
  if (!input.cacRc?.trim()) return { allowed: false, reason: 'CAC RC number required to verify supermarket' };
  return { allowed: true };
}

export function guardCacToNafdacCompliant(input: { nafdacClearance: boolean }): GuardResult {
  if (!input.nafdacClearance) return { allowed: false, reason: 'NAFDAC food handling clearance required' };
  return { allowed: true };
}

export function guardL2AiCap(input: { autonomyLevel?: string | number }): GuardResult {
  if (typeof input.autonomyLevel === 'number' && input.autonomyLevel > 2)
    return { allowed: false, reason: 'Supermarket AI capped at L2' };
  if (input.autonomyLevel === 'L3_HITL') return { allowed: false, reason: 'Supermarket AI capped at L2' };
  return { allowed: true };
}

export interface SupermarketProfile {
  id: string; workspaceId: string; tenantId: string; storeName: string;
  cacRc: string | null; nafdacClearance: boolean; sonCapRef: string | null;
  storeType: 'supermarket' | 'mini_mart' | 'convenience' | 'wholesale';
  status: SupermarketFSMState; createdAt: number; updatedAt: number;
}

export interface CreateSupermarketInput {
  id?: string; workspaceId: string; tenantId: string; storeName: string;
  cacRc?: string; nafdacClearance?: boolean; sonCapRef?: string;
  storeType?: SupermarketProfile['storeType'];
}

export interface SupermarketProduct {
  id: string; workspaceId: string; tenantId: string; name: string; sku: string | null;
  barcode: string | null; category: ProductCategory; unitPriceKobo: number; costPriceKobo: number;
  stockQuantity: number; reorderLevel: number; unit: string;
  nafdacReg: string | null; requiresAge: boolean; available: boolean;
  createdAt: number; updatedAt: number;
}

export interface CreateProductInput {
  workspaceId: string; tenantId: string; name: string; category?: ProductCategory;
  unitPriceKobo: number; costPriceKobo?: number; stockQuantity?: number;
  reorderLevel?: number; unit?: string; sku?: string; barcode?: string;
  nafdacReg?: string; requiresAge?: boolean;
}

export interface OrderLineItem {
  productId: string; productName: string; quantity: number;
  unitPriceKobo: number; lineTotalKobo: number;
}

export interface SupermarketOrder {
  id: string; workspaceId: string; tenantId: string; customerRefId: string | null;
  items: OrderLineItem[]; subtotalKobo: number; discountKobo: number;
  totalKobo: number; loyaltyPointsEarned: number;
  status: OrderStatus; paymentMethod: 'cash' | 'card' | 'transfer' | 'wallet';
  payStackRef: string | null; deliveryAddressId: string | null;
  createdAt: number; updatedAt: number;
}

export interface CreateOrderInput {
  workspaceId: string; tenantId: string; customerRefId?: string;
  items: Array<{ productId: string; productName: string; quantity: number; unitPriceKobo: number }>;
  discountKobo?: number; paymentMethod?: SupermarketOrder['paymentMethod'];
  payStackRef?: string; deliveryAddressId?: string;
}

export interface LoyaltyAccount {
  id: string; workspaceId: string; tenantId: string; customerRefId: string;
  pointsBalance: number; totalPointsEarned: number; totalPointsRedeemed: number;
  tierName: string | null; createdAt: number; updatedAt: number;
}
