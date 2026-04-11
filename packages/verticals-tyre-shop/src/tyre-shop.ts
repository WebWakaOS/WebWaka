import type {
  TyreShopProfile, CreateTyreShopInput, UpdateTyreShopInput,
  TyreShopFSMState, TyreCatalogueItem, CreateTyreCatalogueItemInput,
  TyreJob, CreateTyreJobInput, TyreJobStatus,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, shop_name, state, lga, status, created_at, updated_at';
const CAT_COLS = 'id, workspace_id, tenant_id, brand, size, unit_price_kobo, quantity_in_stock, created_at, updated_at';
const JOB_COLS = 'id, workspace_id, tenant_id, vehicle_plate, job_type, tyre_size, price_kobo, status, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): TyreShopProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, shopName: r['shop_name'] as string, state: r['state'] as string | null, lga: r['lga'] as string | null, status: r['status'] as TyreShopFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToItem(r: Record<string, unknown>): TyreCatalogueItem {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, brand: r['brand'] as string, size: r['size'] as string, unitPriceKobo: r['unit_price_kobo'] as number, quantityInStock: r['quantity_in_stock'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToJob(r: Record<string, unknown>): TyreJob {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, vehiclePlate: r['vehicle_plate'] as string, jobType: r['job_type'] as TyreJob['jobType'], tyreSize: r['tyre_size'] as string | null, priceKobo: r['price_kobo'] as number, status: r['status'] as TyreJobStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class TyreShopRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateTyreShopInput): Promise<TyreShopProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO tyre_shop_profiles (id, workspace_id, tenant_id, shop_name, state, lga, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.shopName, input.state ?? null, input.lga ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[tyre-shop] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<TyreShopProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM tyre_shop_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<TyreShopProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM tyre_shop_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateTyreShopInput): Promise<TyreShopProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.shopName !== undefined) { sets.push('shop_name = ?'); vals.push(input.shopName); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE tyre_shop_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: TyreShopFSMState): Promise<TyreShopProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createCatalogueItem(input: CreateTyreCatalogueItemInput): Promise<TyreCatalogueItem> {
    if (!Number.isInteger(input.unitPriceKobo) || input.unitPriceKobo <= 0) throw new Error('[tyre-shop] unitPriceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO tyre_catalogue (id, workspace_id, tenant_id, brand, size, unit_price_kobo, quantity_in_stock, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.brand, input.size, input.unitPriceKobo, input.quantityInStock ?? 0).run();
    const item = await this.findCatalogueItemById(id, input.tenantId);
    if (!item) throw new Error('[tyre-shop] catalogue item create failed');
    return item;
  }

  async findCatalogueItemById(id: string, tenantId: string): Promise<TyreCatalogueItem | null> {
    const row = await this.db.prepare(`SELECT ${CAT_COLS} FROM tyre_catalogue WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToItem(row) : null;
  }

  async listCatalogueItems(workspaceId: string, tenantId: string): Promise<TyreCatalogueItem[]> {
    const { results } = await this.db.prepare(`SELECT ${CAT_COLS} FROM tyre_catalogue WHERE workspace_id = ? AND tenant_id = ? ORDER BY brand ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToItem);
  }

  async createJob(input: CreateTyreJobInput): Promise<TyreJob> {
    if (!Number.isInteger(input.priceKobo) || input.priceKobo <= 0) throw new Error('[tyre-shop] priceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO tyre_jobs (id, workspace_id, tenant_id, vehicle_plate, job_type, tyre_size, price_kobo, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'intake', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.vehiclePlate, input.jobType, input.tyreSize ?? null, input.priceKobo).run();
    const j = await this.findJobById(id, input.tenantId);
    if (!j) throw new Error('[tyre-shop] job create failed');
    return j;
  }

  async findJobById(id: string, tenantId: string): Promise<TyreJob | null> {
    const row = await this.db.prepare(`SELECT ${JOB_COLS} FROM tyre_jobs WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToJob(row) : null;
  }

  async listJobs(workspaceId: string, tenantId: string): Promise<TyreJob[]> {
    const { results } = await this.db.prepare(`SELECT ${JOB_COLS} FROM tyre_jobs WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToJob);
  }

  async updateJobStatus(id: string, tenantId: string, status: TyreJobStatus): Promise<TyreJob | null> {
    await this.db.prepare(`UPDATE tyre_jobs SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findJobById(id, tenantId);
  }
}
