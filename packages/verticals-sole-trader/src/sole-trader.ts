import type { SoleTraderProfile, CreateSoleTraderInput, UpdateSoleTraderInput, SoleTraderFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; individual_id: string; workspace_id: string; tenant_id: string; trade_type: string; skills: string; lga: string; state: string; whatsapp_number: string | null; min_fee_kobo: number | null; max_fee_kobo: number | null; rating_x10: number; status: string; created_at: number; }
function rowTo(r: Row): SoleTraderProfile { return { id: r.id, individualId: r.individual_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, tradeType: r.trade_type as SoleTraderProfile['tradeType'], skills: r.skills, lga: r.lga, state: r.state, whatsappNumber: r.whatsapp_number, minFeeKobo: r.min_fee_kobo, maxFeeKobo: r.max_fee_kobo, ratingX10: r.rating_x10, status: r.status as SoleTraderFSMState, createdAt: r.created_at }; }
const COLS = 'id, individual_id, workspace_id, tenant_id, trade_type, skills, lga, state, whatsapp_number, min_fee_kobo, max_fee_kobo, rating_x10, status, created_at';
export class SoleTraderRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateSoleTraderInput): Promise<SoleTraderProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO sole_trader_profiles (id, individual_id, workspace_id, tenant_id, trade_type, skills, lga, state, whatsapp_number, min_fee_kobo, max_fee_kobo, rating_x10, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 50, 'seeded', unixepoch())`).bind(id, input.individualId, input.workspaceId, input.tenantId, input.tradeType, input.skills ?? '[]', input.lga, input.state, input.whatsappNumber ?? null, input.minFeeKobo ?? null, input.maxFeeKobo ?? null).run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[sole-trader] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<SoleTraderProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM sole_trader_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async findByLga(lga: string, state: string, tenantId: string): Promise<SoleTraderProfile[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM sole_trader_profiles WHERE lga = ? AND state = ? AND tenant_id = ? ORDER BY rating_x10 DESC`).bind(lga, state, tenantId).all<Row>(); return (results ?? []).map(rowTo); }
  async update(id: string, tenantId: string, input: UpdateSoleTraderInput): Promise<SoleTraderProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.tradeType !== undefined) { sets.push('trade_type = ?'); b.push(input.tradeType); }
    if (input.skills !== undefined) { sets.push('skills = ?'); b.push(input.skills); }
    if (input.lga !== undefined) { sets.push('lga = ?'); b.push(input.lga); }
    if (input.state !== undefined) { sets.push('state = ?'); b.push(input.state); }
    if ('whatsappNumber' in input) { sets.push('whatsapp_number = ?'); b.push(input.whatsappNumber ?? null); }
    if ('minFeeKobo' in input) { sets.push('min_fee_kobo = ?'); b.push(input.minFeeKobo ?? null); }
    if ('maxFeeKobo' in input) { sets.push('max_fee_kobo = ?'); b.push(input.maxFeeKobo ?? null); }
    if (input.ratingX10 !== undefined) { sets.push('rating_x10 = ?'); b.push(input.ratingX10); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE sole_trader_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: SoleTraderFSMState): Promise<SoleTraderProfile | null> { return this.update(id, tenantId, { status: to }); }
}
