import type {
  BuildingMaterialsProfile, CreateBuildingMaterialsInput, UpdateBuildingMaterialsInput,
  BuildingMaterialsFSMState, CatalogueItem, CreateCatalogueItemInput,
  MaterialsOrder, CreateMaterialsOrderInput, OrderStatus,
  ContractorCreditAccount, CreateContractorCreditInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, company_name, cac_rc, son_dealer_number, market_cluster, status, created_at, updated_at';
const CAT_COLS = 'id, workspace_id, tenant_id, product_name, category, unit, unit_price_kobo, quantity_in_stock, created_at, updated_at';
const ORDER_COLS = 'id, workspace_id, tenant_id, client_phone, client_name, order_items, total_kobo, credit_account_id, delivery_address, status, created_at, updated_at';
const CREDIT_COLS = 'id, workspace_id, tenant_id, contractor_phone, contractor_name, credit_limit_kobo, balance_owing_kobo, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): BuildingMaterialsProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, cacRc: r['cac_rc'] as string | null, sonDealerNumber: r['son_dealer_number'] as string | null, marketCluster: r['market_cluster'] as string | null, status: r['status'] as BuildingMaterialsFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToCatalogueItem(r: Record<string, unknown>): CatalogueItem {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, productName: r['product_name'] as string, category: r['category'] as CatalogueItem['category'], unit: r['unit'] as string, unitPriceKobo: r['unit_price_kobo'] as number, quantityInStock: r['quantity_in_stock'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToOrder(r: Record<string, unknown>): MaterialsOrder {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, clientPhone: r['client_phone'] as string, clientName: r['client_name'] as string, orderItems: r['order_items'] as string, totalKobo: r['total_kobo'] as number, creditAccountId: r['credit_account_id'] as string | null, deliveryAddress: r['delivery_address'] as string | null, status: r['status'] as OrderStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToCredit(r: Record<string, unknown>): ContractorCreditAccount {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, contractorPhone: r['contractor_phone'] as string, contractorName: r['contractor_name'] as string, creditLimitKobo: r['credit_limit_kobo'] as number, balanceOwingKobo: r['balance_owing_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class BuildingMaterialsRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateBuildingMaterialsInput): Promise<BuildingMaterialsProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO building_materials_profiles (id, workspace_id, tenant_id, company_name, cac_rc, son_dealer_number, market_cluster, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.companyName, input.cacRc ?? null, input.sonDealerNumber ?? null, input.marketCluster ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[building-materials] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<BuildingMaterialsProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM building_materials_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<BuildingMaterialsProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM building_materials_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateBuildingMaterialsInput): Promise<BuildingMaterialsProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.companyName !== undefined) { sets.push('company_name = ?'); vals.push(input.companyName); }
    if (input.cacRc !== undefined) { sets.push('cac_rc = ?'); vals.push(input.cacRc); }
    if (input.sonDealerNumber !== undefined) { sets.push('son_dealer_number = ?'); vals.push(input.sonDealerNumber); }
    if (input.marketCluster !== undefined) { sets.push('market_cluster = ?'); vals.push(input.marketCluster); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE building_materials_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: BuildingMaterialsFSMState): Promise<BuildingMaterialsProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createCatalogueItem(input: CreateCatalogueItemInput): Promise<CatalogueItem> {
    if (!Number.isInteger(input.unitPriceKobo) || input.unitPriceKobo <= 0) throw new Error('[building-materials] unitPriceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO building_materials_catalogue (id, workspace_id, tenant_id, product_name, category, unit, unit_price_kobo, quantity_in_stock, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.productName, input.category, input.unit, input.unitPriceKobo, input.quantityInStock ?? 0).run();
    const item = await this.findCatalogueItemById(id, input.tenantId);
    if (!item) throw new Error('[building-materials] catalogue item create failed');
    return item;
  }

  async findCatalogueItemById(id: string, tenantId: string): Promise<CatalogueItem | null> {
    const row = await this.db.prepare(`SELECT ${CAT_COLS} FROM building_materials_catalogue WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToCatalogueItem(row) : null;
  }

  async listCatalogueItems(workspaceId: string, tenantId: string): Promise<CatalogueItem[]> {
    const { results } = await this.db.prepare(`SELECT ${CAT_COLS} FROM building_materials_catalogue WHERE workspace_id = ? AND tenant_id = ? ORDER BY product_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToCatalogueItem);
  }

  async createOrder(input: CreateMaterialsOrderInput): Promise<MaterialsOrder> {
    if (!Number.isInteger(input.totalKobo) || input.totalKobo <= 0) throw new Error('[building-materials] totalKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO building_materials_orders (id, workspace_id, tenant_id, client_phone, client_name, order_items, total_kobo, credit_account_id, delivery_address, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.clientPhone, input.clientName, input.orderItems ?? '[]', input.totalKobo, input.creditAccountId ?? null, input.deliveryAddress ?? null).run();
    const o = await this.findOrderById(id, input.tenantId);
    if (!o) throw new Error('[building-materials] order create failed');
    return o;
  }

  async findOrderById(id: string, tenantId: string): Promise<MaterialsOrder | null> {
    const row = await this.db.prepare(`SELECT ${ORDER_COLS} FROM building_materials_orders WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToOrder(row) : null;
  }

  async listOrders(workspaceId: string, tenantId: string): Promise<MaterialsOrder[]> {
    const { results } = await this.db.prepare(`SELECT ${ORDER_COLS} FROM building_materials_orders WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToOrder);
  }

  async updateOrderStatus(id: string, tenantId: string, status: OrderStatus): Promise<MaterialsOrder | null> {
    await this.db.prepare(`UPDATE building_materials_orders SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findOrderById(id, tenantId);
  }

  async createCreditAccount(input: CreateContractorCreditInput): Promise<ContractorCreditAccount> {
    if (!Number.isInteger(input.creditLimitKobo) || input.creditLimitKobo <= 0) throw new Error('[building-materials] creditLimitKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO contractor_credit_accounts (id, workspace_id, tenant_id, contractor_phone, contractor_name, credit_limit_kobo, balance_owing_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.contractorPhone, input.contractorName, input.creditLimitKobo, input.balanceOwingKobo ?? 0).run();
    const c = await this.findCreditAccountById(id, input.tenantId);
    if (!c) throw new Error('[building-materials] credit account create failed');
    return c;
  }

  async findCreditAccountById(id: string, tenantId: string): Promise<ContractorCreditAccount | null> {
    const row = await this.db.prepare(`SELECT ${CREDIT_COLS} FROM contractor_credit_accounts WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToCredit(row) : null;
  }

  async listCreditAccounts(workspaceId: string, tenantId: string): Promise<ContractorCreditAccount[]> {
    const { results } = await this.db.prepare(`SELECT ${CREDIT_COLS} FROM contractor_credit_accounts WHERE workspace_id = ? AND tenant_id = ? ORDER BY contractor_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToCredit);
  }
}
