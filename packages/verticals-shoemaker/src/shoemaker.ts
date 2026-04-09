import type {
  ShoemakerProfile, CreateShoemakerInput, UpdateShoemakerInput,
  ShoemakerFSMState, ShoemakerJob, CreateShoemakerJobInput,
  ShoemakerJobStatus, ShoemakerCatalogueItem, CreateShoemakerCatalogueItemInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, shop_name, speciality, state, lga, status, created_at, updated_at';
const JOB_COLS = 'id, workspace_id, tenant_id, customer_phone, job_type, shoe_size, material, price_kobo, deposit_kobo, balance_kobo, due_date, status, created_at, updated_at';
const CAT_COLS = 'id, workspace_id, tenant_id, item_name, price_kobo, shoe_size, stock_count, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): ShoemakerProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, shopName: r['shop_name'] as string, speciality: r['speciality'] as string | null, state: r['state'] as string | null, lga: r['lga'] as string | null, status: r['status'] as ShoemakerFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToJob(r: Record<string, unknown>): ShoemakerJob {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, customerPhone: r['customer_phone'] as string, jobType: r['job_type'] as ShoemakerJob['jobType'], shoeSize: r['shoe_size'] as number, material: r['material'] as string | null, priceKobo: r['price_kobo'] as number, depositKobo: r['deposit_kobo'] as number, balanceKobo: r['balance_kobo'] as number, dueDate: r['due_date'] as number | null, status: r['status'] as ShoemakerJobStatus, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToItem(r: Record<string, unknown>): ShoemakerCatalogueItem {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, itemName: r['item_name'] as string, priceKobo: r['price_kobo'] as number, shoeSize: r['shoe_size'] as number | null, stockCount: r['stock_count'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class ShoemakerRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateShoemakerInput): Promise<ShoemakerProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO shoemaker_profiles (id, workspace_id, tenant_id, shop_name, speciality, state, lga, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.shopName, input.speciality ?? null, input.state ?? null, input.lga ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[shoemaker] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<ShoemakerProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM shoemaker_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<ShoemakerProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM shoemaker_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateShoemakerInput): Promise<ShoemakerProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.shopName !== undefined) { sets.push('shop_name = ?'); vals.push(input.shopName); }
    if (input.speciality !== undefined) { sets.push('speciality = ?'); vals.push(input.speciality); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE shoemaker_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: ShoemakerFSMState): Promise<ShoemakerProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createJob(input: CreateShoemakerJobInput): Promise<ShoemakerJob> {
    if (!Number.isInteger(input.shoeSize) || input.shoeSize <= 0) throw new Error('[shoemaker] shoeSize must be positive integer (P9)');
    if (!Number.isInteger(input.priceKobo) || input.priceKobo <= 0) throw new Error('[shoemaker] priceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    const deposit = input.depositKobo ?? 0;
    const balance = input.balanceKobo ?? input.priceKobo - deposit;
    await this.db.prepare(`INSERT INTO shoemaker_jobs (id, workspace_id, tenant_id, customer_phone, job_type, shoe_size, material, price_kobo, deposit_kobo, balance_kobo, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'intake', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.customerPhone, input.jobType, input.shoeSize, input.material ?? null, input.priceKobo, deposit, balance, input.dueDate ?? null).run();
    const j = await this.findJobById(id, input.tenantId);
    if (!j) throw new Error('[shoemaker] job create failed');
    return j;
  }

  async findJobById(id: string, tenantId: string): Promise<ShoemakerJob | null> {
    const row = await this.db.prepare(`SELECT ${JOB_COLS} FROM shoemaker_jobs WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToJob(row) : null;
  }

  async listJobs(workspaceId: string, tenantId: string): Promise<ShoemakerJob[]> {
    const { results } = await this.db.prepare(`SELECT ${JOB_COLS} FROM shoemaker_jobs WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToJob);
  }

  async updateJobStatus(id: string, tenantId: string, status: ShoemakerJobStatus): Promise<ShoemakerJob | null> {
    await this.db.prepare(`UPDATE shoemaker_jobs SET status = ?, updated_at = unixepoch() WHERE id = ? AND tenant_id = ?`).bind(status, id, tenantId).run();
    return this.findJobById(id, tenantId);
  }

  async createCatalogueItem(input: CreateShoemakerCatalogueItemInput): Promise<ShoemakerCatalogueItem> {
    if (!Number.isInteger(input.priceKobo) || input.priceKobo <= 0) throw new Error('[shoemaker] priceKobo must be positive integer (P9)');
    if (input.shoeSize !== undefined && (!Number.isInteger(input.shoeSize) || input.shoeSize <= 0)) throw new Error('[shoemaker] shoeSize must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO shoemaker_catalogue (id, workspace_id, tenant_id, item_name, price_kobo, shoe_size, stock_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.itemName, input.priceKobo, input.shoeSize ?? null, input.stockCount ?? 0).run();
    const item = await this.findCatalogueItemById(id, input.tenantId);
    if (!item) throw new Error('[shoemaker] catalogue item create failed');
    return item;
  }

  async findCatalogueItemById(id: string, tenantId: string): Promise<ShoemakerCatalogueItem | null> {
    const row = await this.db.prepare(`SELECT ${CAT_COLS} FROM shoemaker_catalogue WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToItem(row) : null;
  }

  async listCatalogueItems(workspaceId: string, tenantId: string): Promise<ShoemakerCatalogueItem[]> {
    const { results } = await this.db.prepare(`SELECT ${CAT_COLS} FROM shoemaker_catalogue WHERE workspace_id = ? AND tenant_id = ? ORDER BY item_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToItem);
  }
}
