import type {
  SparePartsProfile, CreateSparePartsInput, UpdateSparePartsInput,
  SparePartsFSMState, SparePart, CreateSparePartInput, PartCategory,
  MechanicCreditAccount, CreateMechanicCreditInput,
  SparePartsOrder, CreateSparePartsOrderInput, OrderStatus,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, shop_name, cac_rc, son_dealer_number, market_location, status, created_at, updated_at';
const PART_COLS = 'id, workspace_id, tenant_id, part_name, part_number, category, compatible_makes, unit_price_kobo, quantity_in_stock, created_at, updated_at';
const CREDIT_COLS = 'id, workspace_id, tenant_id, mechanic_phone, mechanic_name, credit_limit_kobo, balance_owing_kobo, created_at, updated_at';
const ORDER_COLS = 'id, workspace_id, tenant_id, client_phone, items, total_kobo, credit_account_id, status, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): SparePartsProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, shopName: r['shop_name'] as string, cacRc: r['cac_rc'] as string | null, sonDealerNumber: r['son_dealer_number'] as string | null, marketLocation: r['market_location'] as string | null, status: r['status'] as SparePartsFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToPart(r: Record<string, unknown>): SparePart {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, partName: r['part_name'] as string, partNumber: r['part_number'] as string | null, category: r['category'] as PartCategory, compatibleMakes: r['compatible_makes'] as string, unitPriceKobo: r['unit_price_kobo'] as number, quantityInStock: r['quantity_in_stock'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToCredit(r: Record<string, unknown>): MechanicCreditAccount {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, mechanicPhone: r['mechanic_phone'] as string, mechanicName: r['mechanic_name'] as string, creditLimitKobo: r['credit_limit_kobo'] as number, balanceOwingKobo: r['balance_owing_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToOrder(r: Record<string, unknown>): SparePartsOrder {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, clientPhone: r['client_phone'] as string, items: r['items'] as string, totalKobo: r['total_kobo'] as number, creditAccountId: r['credit_account_id'] as string | null, status: r['status'] as OrderStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class SparePartsRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateSparePartsInput): Promise<SparePartsProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO spare_parts_profiles (id, workspace_id, tenant_id, shop_name, cac_rc, son_dealer_number, market_location, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.shopName, input.cacRc ?? null, input.sonDealerNumber ?? null, input.marketLocation ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[spare-parts] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<SparePartsProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM spare_parts_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<SparePartsProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM spare_parts_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateSparePartsInput): Promise<SparePartsProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.shopName !== undefined) { sets.push('shop_name = ?'); vals.push(input.shopName); }
    if (input.cacRc !== undefined) { sets.push('cac_rc = ?'); vals.push(input.cacRc); }
    if (input.sonDealerNumber !== undefined) { sets.push('son_dealer_number = ?'); vals.push(input.sonDealerNumber); }
    if (input.marketLocation !== undefined) { sets.push('market_location = ?'); vals.push(input.marketLocation); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE spare_parts_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: SparePartsFSMState): Promise<SparePartsProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createPart(input: CreateSparePartInput): Promise<SparePart> {
    if (!Number.isInteger(input.unitPriceKobo) || input.unitPriceKobo <= 0) throw new Error('[spare-parts] unitPriceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO spare_parts_catalogue (id, workspace_id, tenant_id, part_name, part_number, category, compatible_makes, unit_price_kobo, quantity_in_stock, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.partName, input.partNumber ?? null, input.category, input.compatibleMakes ?? '[]', input.unitPriceKobo, input.quantityInStock ?? 0).run();
    const p = await this.findPartById(id, input.tenantId);
    if (!p) throw new Error('[spare-parts] part create failed');
    return p;
  }

  async findPartById(id: string, tenantId: string): Promise<SparePart | null> {
    const row = await this.db.prepare(`SELECT ${PART_COLS} FROM spare_parts_catalogue WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToPart(row) : null;
  }

  async listParts(workspaceId: string, tenantId: string): Promise<SparePart[]> {
    const { results } = await this.db.prepare(`SELECT ${PART_COLS} FROM spare_parts_catalogue WHERE workspace_id = ? AND tenant_id = ? ORDER BY part_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToPart);
  }

  async createMechanicCredit(input: CreateMechanicCreditInput): Promise<MechanicCreditAccount> {
    if (!Number.isInteger(input.creditLimitKobo) || input.creditLimitKobo <= 0) throw new Error('[spare-parts] creditLimitKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO mechanic_credit_accounts (id, workspace_id, tenant_id, mechanic_phone, mechanic_name, credit_limit_kobo, balance_owing_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.mechanicPhone, input.mechanicName, input.creditLimitKobo, input.balanceOwingKobo ?? 0).run();
    const c = await this.findMechanicCreditById(id, input.tenantId);
    if (!c) throw new Error('[spare-parts] mechanic credit create failed');
    return c;
  }

  async findMechanicCreditById(id: string, tenantId: string): Promise<MechanicCreditAccount | null> {
    const row = await this.db.prepare(`SELECT ${CREDIT_COLS} FROM mechanic_credit_accounts WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToCredit(row) : null;
  }

  async listMechanicCredits(workspaceId: string, tenantId: string): Promise<MechanicCreditAccount[]> {
    const { results } = await this.db.prepare(`SELECT ${CREDIT_COLS} FROM mechanic_credit_accounts WHERE workspace_id = ? AND tenant_id = ? ORDER BY mechanic_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToCredit);
  }

  async createOrder(input: CreateSparePartsOrderInput): Promise<SparePartsOrder> {
    if (!Number.isInteger(input.totalKobo) || input.totalKobo <= 0) throw new Error('[spare-parts] totalKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO spare_parts_orders (id, workspace_id, tenant_id, client_phone, items, total_kobo, credit_account_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'placed', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.clientPhone, input.items ?? '[]', input.totalKobo, input.creditAccountId ?? null).run();
    const o = await this.findOrderById(id, input.tenantId);
    if (!o) throw new Error('[spare-parts] order create failed');
    return o;
  }

  async findOrderById(id: string, tenantId: string): Promise<SparePartsOrder | null> {
    const row = await this.db.prepare(`SELECT ${ORDER_COLS} FROM spare_parts_orders WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToOrder(row) : null;
  }

  async listOrders(workspaceId: string, tenantId: string): Promise<SparePartsOrder[]> {
    const { results } = await this.db.prepare(`SELECT ${ORDER_COLS} FROM spare_parts_orders WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToOrder);
  }

  async updateOrderStatus(id: string, tenantId: string, status: OrderStatus): Promise<SparePartsOrder | null> {
    await this.db.prepare(`UPDATE spare_parts_orders SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findOrderById(id, tenantId);
  }
}
