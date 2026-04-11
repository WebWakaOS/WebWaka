import type {
  HairSalonProfile, CreateHairSalonInput, UpdateHairSalonInput,
  HairSalonFSMState, HairSalonService, CreateHairSalonServiceInput,
  HairSalonDailyLog, CreateHairSalonDailyLogInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, salon_name, type, lg_permit_number, state, lga, status, created_at, updated_at';
const SERVICE_COLS = 'id, workspace_id, tenant_id, service_name, price_kobo, created_at, updated_at';
const LOG_COLS = 'id, workspace_id, tenant_id, log_date, customers_served, revenue_kobo, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): HairSalonProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, salonName: r['salon_name'] as string, type: r['type'] as HairSalonProfile['type'], lgPermitNumber: r['lg_permit_number'] as string | null, state: r['state'] as string | null, lga: r['lga'] as string | null, status: r['status'] as HairSalonFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToService(r: Record<string, unknown>): HairSalonService {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, serviceName: r['service_name'] as string, priceKobo: r['price_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToLog(r: Record<string, unknown>): HairSalonDailyLog {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, logDate: r['log_date'] as number, customersServed: r['customers_served'] as number, revenueKobo: r['revenue_kobo'] as number, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class HairSalonRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateHairSalonInput): Promise<HairSalonProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO hair_salon_profiles (id, workspace_id, tenant_id, salon_name, type, lg_permit_number, state, lga, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.salonName, input.type, input.lgPermitNumber ?? null, input.state ?? null, input.lga ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[hair-salon] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<HairSalonProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM hair_salon_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<HairSalonProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM hair_salon_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateHairSalonInput): Promise<HairSalonProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.salonName !== undefined) { sets.push('salon_name = ?'); vals.push(input.salonName); }
    if (input.type !== undefined) { sets.push('type = ?'); vals.push(input.type); }
    if (input.lgPermitNumber !== undefined) { sets.push('lg_permit_number = ?'); vals.push(input.lgPermitNumber); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE hair_salon_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: HairSalonFSMState): Promise<HairSalonProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createService(input: CreateHairSalonServiceInput): Promise<HairSalonService> {
    if (!Number.isInteger(input.priceKobo) || input.priceKobo <= 0) throw new Error('[hair-salon] priceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO hair_salon_services (id, workspace_id, tenant_id, service_name, price_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.serviceName, input.priceKobo).run();
    const s = await this.findServiceById(id, input.tenantId);
    if (!s) throw new Error('[hair-salon] service create failed');
    return s;
  }

  async findServiceById(id: string, tenantId: string): Promise<HairSalonService | null> {
    const row = await this.db.prepare(`SELECT ${SERVICE_COLS} FROM hair_salon_services WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToService(row) : null;
  }

  async listServices(workspaceId: string, tenantId: string): Promise<HairSalonService[]> {
    const { results } = await this.db.prepare(`SELECT ${SERVICE_COLS} FROM hair_salon_services WHERE workspace_id = ? AND tenant_id = ? ORDER BY service_name ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToService);
  }

  async createDailyLog(input: CreateHairSalonDailyLogInput): Promise<HairSalonDailyLog> {
    if (!Number.isInteger(input.revenueKobo) || input.revenueKobo < 0) throw new Error('[hair-salon] revenueKobo must be non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO hair_salon_daily_log (id, workspace_id, tenant_id, log_date, customers_served, revenue_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.logDate, input.customersServed ?? 0, input.revenueKobo).run();
    const l = await this.findDailyLogById(id, input.tenantId);
    if (!l) throw new Error('[hair-salon] daily log create failed');
    return l;
  }

  async findDailyLogById(id: string, tenantId: string): Promise<HairSalonDailyLog | null> {
    const row = await this.db.prepare(`SELECT ${LOG_COLS} FROM hair_salon_daily_log WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToLog(row) : null;
  }

  async listDailyLogs(workspaceId: string, tenantId: string): Promise<HairSalonDailyLog[]> {
    const { results } = await this.db.prepare(`SELECT ${LOG_COLS} FROM hair_salon_daily_log WHERE workspace_id = ? AND tenant_id = ? ORDER BY log_date DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToLog);
  }
}
