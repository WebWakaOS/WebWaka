import type {
  ArtisanalMiningProfile, CreateArtisanalMiningInput, UpdateArtisanalMiningInput,
  ArtisanalMiningFSMState, MiningProductionLog, CreateProductionLogInput,
  MiningPermit, CreateMiningPermitInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, company_name, mmsd_permit, mineral_type, state, lga, status, created_at, updated_at';
const LOG_COLS = 'id, workspace_id, tenant_id, mineral_type, weight_grams, quality_grade, sale_price_kobo, offtaker_name, sale_date, created_at, updated_at';
const PERMIT_COLS = 'id, workspace_id, tenant_id, permit_number, permit_type, valid_from, valid_until, state, created_at, updated_at';

function rowToProfile(r: Record<string, unknown>): ArtisanalMiningProfile {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, companyName: r['company_name'] as string, mmsdPermit: r['mmsd_permit'] as string | null, mineralType: r['mineral_type'] as string | null, state: r['state'] as string | null, lga: r['lga'] as string | null, status: r['status'] as ArtisanalMiningFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToLog(r: Record<string, unknown>): MiningProductionLog {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, mineralType: r['mineral_type'] as string, weightGrams: r['weight_grams'] as number, qualityGrade: r['quality_grade'] as string | null, salePriceKobo: r['sale_price_kobo'] as number, offtakerName: r['offtaker_name'] as string | null, saleDate: r['sale_date'] as number | null, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

function rowToPermit(r: Record<string, unknown>): MiningPermit {
  return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, permitNumber: r['permit_number'] as string, permitType: r['permit_type'] as string | null, validFrom: r['valid_from'] as number | null, validUntil: r['valid_until'] as number | null, state: r['state'] as string | null, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
}

export class ArtisanalMiningRepository {
  constructor(private readonly db: D1Like) {}

  async createProfile(input: CreateArtisanalMiningInput): Promise<ArtisanalMiningProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO artisanal_mining_profiles (id, workspace_id, tenant_id, company_name, mmsd_permit, mineral_type, state, lga, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.companyName, input.mmsdPermit ?? null, input.mineralType ?? null, input.state ?? null, input.lga ?? null).run();
    const p = await this.findProfileById(id, input.tenantId);
    if (!p) throw new Error('[artisanal-mining] profile create failed');
    return p;
  }

  async findProfileById(id: string, tenantId: string): Promise<ArtisanalMiningProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM artisanal_mining_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<ArtisanalMiningProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM artisanal_mining_profiles WHERE workspace_id = ? AND tenant_id = ? LIMIT 1`).bind(workspaceId, tenantId).first<Record<string, unknown>>();
    return row ? rowToProfile(row) : null;
  }

  async updateProfile(id: string, tenantId: string, input: UpdateArtisanalMiningInput): Promise<ArtisanalMiningProfile | null> {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if (input.companyName !== undefined) { sets.push('company_name = ?'); vals.push(input.companyName); }
    if (input.mmsdPermit !== undefined) { sets.push('mmsd_permit = ?'); vals.push(input.mmsdPermit); }
    if (input.mineralType !== undefined) { sets.push('mineral_type = ?'); vals.push(input.mineralType); }
    if (input.state !== undefined) { sets.push('state = ?'); vals.push(input.state); }
    if (input.lga !== undefined) { sets.push('lga = ?'); vals.push(input.lga); }
    if (input.status !== undefined) { sets.push('status = ?'); vals.push(input.status); }
    if (sets.length === 0) return this.findProfileById(id, tenantId);
    sets.push('updated_at = unixepoch()');
    await this.db.prepare(`UPDATE artisanal_mining_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...vals, id, tenantId).run();
    return this.findProfileById(id, tenantId);
  }

  async transitionStatus(id: string, tenantId: string, to: ArtisanalMiningFSMState): Promise<ArtisanalMiningProfile | null> {
    return this.updateProfile(id, tenantId, { status: to });
  }

  async createProductionLog(input: CreateProductionLogInput): Promise<MiningProductionLog> {
    if (!Number.isInteger(input.weightGrams) || input.weightGrams <= 0) throw new Error('[artisanal-mining] weightGrams must be positive integer (P9)');
    if (!Number.isInteger(input.salePriceKobo) || input.salePriceKobo <= 0) throw new Error('[artisanal-mining] salePriceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO mining_production_log (id, workspace_id, tenant_id, mineral_type, weight_grams, quality_grade, sale_price_kobo, offtaker_name, sale_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.mineralType, input.weightGrams, input.qualityGrade ?? null, input.salePriceKobo, input.offtakerName ?? null, input.saleDate ?? null).run();
    const l = await this.findLogById(id, input.tenantId);
    if (!l) throw new Error('[artisanal-mining] production log create failed');
    return l;
  }

  async findLogById(id: string, tenantId: string): Promise<MiningProductionLog | null> {
    const row = await this.db.prepare(`SELECT ${LOG_COLS} FROM mining_production_log WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToLog(row) : null;
  }

  async listProductionLogs(workspaceId: string, tenantId: string): Promise<MiningProductionLog[]> {
    const { results } = await this.db.prepare(`SELECT ${LOG_COLS} FROM mining_production_log WHERE workspace_id = ? AND tenant_id = ? ORDER BY sale_date DESC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToLog);
  }

  async createPermit(input: CreateMiningPermitInput): Promise<MiningPermit> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO mining_permits (id, workspace_id, tenant_id, permit_number, permit_type, valid_from, valid_until, state, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.permitNumber, input.permitType ?? null, input.validFrom ?? null, input.validUntil ?? null, input.state ?? null).run();
    const p = await this.findPermitById(id, input.tenantId);
    if (!p) throw new Error('[artisanal-mining] permit create failed');
    return p;
  }

  async findPermitById(id: string, tenantId: string): Promise<MiningPermit | null> {
    const row = await this.db.prepare(`SELECT ${PERMIT_COLS} FROM mining_permits WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Record<string, unknown>>();
    return row ? rowToPermit(row) : null;
  }

  async listPermits(workspaceId: string, tenantId: string): Promise<MiningPermit[]> {
    const { results } = await this.db.prepare(`SELECT ${PERMIT_COLS} FROM mining_permits WHERE workspace_id = ? AND tenant_id = ? ORDER BY valid_until ASC`).bind(workspaceId, tenantId).all<Record<string, unknown>>();
    return (results ?? []).map(rowToPermit);
  }
}
