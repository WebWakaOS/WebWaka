/**
 * @webwaka/verticals-supermarket — SupermarketRepository (M9)
 * P9: all kobo values integer; loyalty points integer
 * T3: tenant_id on every query
 * P13: customer_ref_id opaque
 */

import type {
  SupermarketProfile, CreateSupermarketInput, SupermarketFSMState,
  SupermarketProduct, CreateProductInput, ProductCategory,
  SupermarketOrder, CreateOrderInput, OrderLineItem, LoyaltyAccount,
} from './types.js';

interface D1Like {
  prepare(s: string): {
    bind(...v: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

function toProfile(r: Record<string, unknown>): SupermarketProfile {
  return {
    id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string,
    storeName: r['store_name'] as string, cacRc: r['cac_rc'] as string | null,
    nafdacClearance: Boolean(r['nafdac_clearance']), sonCapRef: r['son_cap_ref'] as string | null,
    storeType: (r['store_type'] ?? 'supermarket') as SupermarketProfile['storeType'],
    status: r['status'] as SupermarketFSMState,
    createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number,
  };
}

function toProduct(r: Record<string, unknown>): SupermarketProduct {
  return {
    id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string,
    name: r['name'] as string, sku: r['sku'] as string | null, barcode: r['barcode'] as string | null,
    category: (r['category'] ?? 'groceries') as ProductCategory,
    unitPriceKobo: r['unit_price_kobo'] as number, costPriceKobo: (r['cost_price_kobo'] ?? 0) as number,
    stockQuantity: (r['stock_quantity'] ?? 0) as number, reorderLevel: (r['reorder_level'] ?? 10) as number,
    unit: (r['unit'] ?? 'piece') as string, nafdacReg: r['nafdac_reg'] as string | null,
    requiresAge: Boolean(r['requires_age']), available: (r['available'] as number) !== 0,
    createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number,
  };
}

function toOrder(r: Record<string, unknown>): SupermarketOrder {
  return {
    id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string,
    customerRefId: r['customer_ref_id'] as string | null,
    items: JSON.parse(r['items'] as string) as OrderLineItem[],
    subtotalKobo: r['subtotal_kobo'] as number, discountKobo: (r['discount_kobo'] ?? 0) as number,
    totalKobo: r['total_kobo'] as number, loyaltyPointsEarned: (r['loyalty_points_earned'] ?? 0) as number,
    status: (r['status'] ?? 'pending') as SupermarketOrder['status'],
    paymentMethod: (r['payment_method'] ?? 'cash') as SupermarketOrder['paymentMethod'],
    payStackRef: r['paystack_ref'] as string | null, deliveryAddressId: r['delivery_address_id'] as string | null,
    createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number,
  };
}

export class SupermarketRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateSupermarketInput): Promise<SupermarketProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO supermarket_profiles (id,workspace_id,tenant_id,store_name,cac_rc,nafdac_clearance,son_cap_ref,store_type,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`
    ).bind(id, input.workspaceId, input.tenantId, input.storeName, input.cacRc ?? null,
      input.nafdacClearance ? 1 : 0, input.sonCapRef ?? null, input.storeType ?? 'supermarket').run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[supermarket] create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<SupermarketProfile | null> {
    const r = await this.db.prepare('SELECT * FROM supermarket_profiles WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    return r ? toProfile(r) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<SupermarketProfile | null> {
    const r = await this.db.prepare('SELECT * FROM supermarket_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return r ? toProfile(r) : null;
  }

  async transitionStatus(id: string, tenantId: string, to: SupermarketFSMState, fields?: { cacRc?: string; nafdacClearance?: boolean }): Promise<SupermarketProfile> {
    let extra = '';
    if (fields?.cacRc) extra += `, cac_rc='${fields.cacRc}'`;
    if (fields?.nafdacClearance !== undefined) extra += `, nafdac_clearance=${fields.nafdacClearance ? 1 : 0}`;
    await this.db.prepare(`UPDATE supermarket_profiles SET status=?${extra}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to, id, tenantId).run();
    const p = await this.findProfileById(id, tenantId);
    if (!p) throw new Error('[supermarket] not found');
    return p;
  }

  async addProduct(input: CreateProductInput): Promise<SupermarketProduct> {
    if (!Number.isInteger(input.unitPriceKobo) || input.unitPriceKobo <= 0)
      throw new Error('[supermarket] unitPriceKobo must be positive integer (P9)');
    if (input.costPriceKobo !== undefined && !Number.isInteger(input.costPriceKobo))
      throw new Error('[supermarket] costPriceKobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO supermarket_products (id,workspace_id,tenant_id,name,sku,barcode,category,unit_price_kobo,cost_price_kobo,stock_quantity,reorder_level,unit,nafdac_reg,requires_age,available,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,unixepoch(),unixepoch())`
    ).bind(id, input.workspaceId, input.tenantId, input.name, input.sku ?? null, input.barcode ?? null,
      input.category ?? 'groceries', input.unitPriceKobo, input.costPriceKobo ?? 0,
      input.stockQuantity ?? 0, input.reorderLevel ?? 10, input.unit ?? 'piece',
      input.nafdacReg ?? null, input.requiresAge ? 1 : 0).run();
    const p = await this.db.prepare('SELECT * FROM supermarket_products WHERE id=? AND tenant_id=?').bind(id, input.tenantId).first<Record<string, unknown>>();
    if (!p) throw new Error('[supermarket] product create failed');
    return toProduct(p);
  }

  async findProductById(id: string, tenantId: string): Promise<SupermarketProduct | null> {
    const r = await this.db.prepare('SELECT * FROM supermarket_products WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    return r ? toProduct(r) : null;
  }

  async listProducts(workspaceId: string, tenantId: string, availableOnly = true): Promise<SupermarketProduct[]> {
    const sql = availableOnly
      ? 'SELECT * FROM supermarket_products WHERE workspace_id=? AND tenant_id=? AND available=1 ORDER BY category, name'
      : 'SELECT * FROM supermarket_products WHERE workspace_id=? AND tenant_id=? ORDER BY category, name';
    const { results } = await this.db.prepare(sql).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(toProduct);
  }

  async listProductsByCategory(workspaceId: string, tenantId: string, category: string): Promise<SupermarketProduct[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM supermarket_products WHERE workspace_id=? AND tenant_id=? AND category=? AND available=1 ORDER BY name'
    ).bind(workspaceId, tenantId, category).all<Record<string, unknown>>();
    return (results ?? []).map(toProduct);
  }

  async updateStock(productId: string, tenantId: string, quantityDelta: number): Promise<SupermarketProduct | null> {
    if (!Number.isInteger(quantityDelta)) throw new Error('[supermarket] quantityDelta must be integer');
    await this.db.prepare(
      'UPDATE supermarket_products SET stock_quantity=stock_quantity+?, updated_at=unixepoch() WHERE id=? AND tenant_id=?'
    ).bind(quantityDelta, productId, tenantId).run();
    return this.findProductById(productId, tenantId);
  }

  async createOrder(input: CreateOrderInput): Promise<SupermarketOrder> {
    for (const item of input.items) {
      if (!Number.isInteger(item.unitPriceKobo) || item.unitPriceKobo <= 0)
        throw new Error(`[supermarket] unitPriceKobo for "${item.productName}" must be positive integer (P9)`);
    }
    const discountKobo = input.discountKobo ?? 0;
    if (!Number.isInteger(discountKobo)) throw new Error('[supermarket] discountKobo must be integer (P9)');
    const subtotalKobo = input.items.reduce((sum, item) => sum + item.unitPriceKobo * item.quantity, 0);
    const totalKobo = Math.max(0, subtotalKobo - discountKobo);
    const loyaltyPointsEarned = Math.floor(totalKobo / 100000);
    const lineItems: OrderLineItem[] = input.items.map(item => ({
      productId: item.productId, productName: item.productName,
      quantity: item.quantity, unitPriceKobo: item.unitPriceKobo,
      lineTotalKobo: item.unitPriceKobo * item.quantity,
    }));
    const id = crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO supermarket_orders (id,workspace_id,tenant_id,customer_ref_id,items,subtotal_kobo,discount_kobo,total_kobo,loyalty_points_earned,status,payment_method,paystack_ref,delivery_address_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'pending',?,?,?,unixepoch(),unixepoch())`
    ).bind(id, input.workspaceId, input.tenantId, input.customerRefId ?? null, JSON.stringify(lineItems),
      subtotalKobo, discountKobo, totalKobo, loyaltyPointsEarned,
      input.paymentMethod ?? 'cash', input.payStackRef ?? null, input.deliveryAddressId ?? null).run();
    const r = await this.db.prepare('SELECT * FROM supermarket_orders WHERE id=? AND tenant_id=?').bind(id, input.tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[supermarket] order create failed');
    return toOrder(r);
  }

  async listOrders(workspaceId: string, tenantId: string): Promise<SupermarketOrder[]> {
    const { results } = await this.db.prepare(
      'SELECT * FROM supermarket_orders WHERE workspace_id=? AND tenant_id=? ORDER BY created_at DESC'
    ).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(toOrder);
  }

  async updateOrderStatus(id: string, tenantId: string, status: SupermarketOrder['status']): Promise<SupermarketOrder> {
    await this.db.prepare('UPDATE supermarket_orders SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status, id, tenantId).run();
    const r = await this.db.prepare('SELECT * FROM supermarket_orders WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[supermarket] order not found');
    return toOrder(r);
  }

  async upsertLoyaltyAccount(workspaceId: string, tenantId: string, customerRefId: string): Promise<LoyaltyAccount> {
    const existing = await this.db.prepare(
      'SELECT * FROM supermarket_loyalty WHERE workspace_id=? AND tenant_id=? AND customer_ref_id=?'
    ).bind(workspaceId, tenantId, customerRefId).first<Record<string, unknown>>();
    if (existing) {
      return {
        id: existing['id'] as string, workspaceId, tenantId, customerRefId,
        pointsBalance: existing['points_balance'] as number,
        totalPointsEarned: existing['total_points_earned'] as number,
        totalPointsRedeemed: existing['total_points_redeemed'] as number,
        tierName: existing['tier_name'] as string | null,
        createdAt: existing['created_at'] as number, updatedAt: existing['updated_at'] as number,
      };
    }
    const id = crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO supermarket_loyalty (id,workspace_id,tenant_id,customer_ref_id,points_balance,total_points_earned,total_points_redeemed,tier_name,created_at,updated_at) VALUES (?,?,?,?,0,0,0,NULL,unixepoch(),unixepoch())`
    ).bind(id, workspaceId, tenantId, customerRefId).run();
    const r = await this.db.prepare('SELECT * FROM supermarket_loyalty WHERE id=? AND tenant_id=?').bind(id, tenantId).first<Record<string, unknown>>();
    if (!r) throw new Error('[supermarket] loyalty account create failed');
    return { id, workspaceId, tenantId, customerRefId, pointsBalance: 0, totalPointsEarned: 0, totalPointsRedeemed: 0, tierName: null, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
  }

  async addLoyaltyPoints(id: string, tenantId: string, points: number): Promise<void> {
    if (!Number.isInteger(points) || points <= 0) throw new Error('[supermarket] loyalty points must be positive integer (P9)');
    await this.db.prepare(
      'UPDATE supermarket_loyalty SET points_balance=points_balance+?, total_points_earned=total_points_earned+?, updated_at=unixepoch() WHERE id=? AND tenant_id=?'
    ).bind(points, points, id, tenantId).run();
  }

  async redeemLoyaltyPoints(id: string, tenantId: string, points: number): Promise<void> {
    if (!Number.isInteger(points) || points <= 0) throw new Error('[supermarket] redemption points must be positive integer (P9)');
    await this.db.prepare(
      'UPDATE supermarket_loyalty SET points_balance=points_balance-?, total_points_redeemed=total_points_redeemed+?, updated_at=unixepoch() WHERE id=? AND tenant_id=?'
    ).bind(points, points, id, tenantId).run();
  }
}
