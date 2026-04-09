/**
 * Okada/Keke co-op D1 repository (scaffold).
 * (M8c — T3)
 */
import type { OkadaKekeProfile, CreateOkadaKekeInput, UpdateOkadaKekeInput, OkadaKekeFSMState } from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface OkRow { id: string; workspace_id: string; tenant_id: string; operator_type: string; frsc_ref: string | null; rider_count: number; status: string; created_at: number; }
function rowTo(r: OkRow): OkadaKekeProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, operatorType: r.operator_type as OkadaKekeProfile['operatorType'], frscRef: r.frsc_ref, riderCount: r.rider_count, status: r.status as OkadaKekeFSMState, createdAt: r.created_at }; }

const COLS = 'id, workspace_id, tenant_id, operator_type, frsc_ref, rider_count, status, created_at';

export class OkadaKekeRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateOkadaKekeInput): Promise<OkadaKekeProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO okada_keke_profiles (id, workspace_id, tenant_id, operator_type, frsc_ref, rider_count, status, created_at) VALUES (?, ?, ?, ?, NULL, ?, 'seeded', unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.operatorType, input.riderCount ?? 0).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[okada-keke] create failed');
    return p;
  }
  async findById(id: string, tenantId: string): Promise<OkadaKekeProfile | null> {
    const row = await this.db.prepare(`SELECT ${COLS} FROM okada_keke_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<OkRow>();
    return row ? rowTo(row) : null;
  }
  async update(id: string, tenantId: string, input: UpdateOkadaKekeInput): Promise<OkadaKekeProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.operatorType !== undefined) { sets.push('operator_type = ?'); b.push(input.operatorType); }
    if ('frscRef' in input) { sets.push('frsc_ref = ?'); b.push(input.frscRef ?? null); }
    if (input.riderCount !== undefined) { sets.push('rider_count = ?'); b.push(input.riderCount); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE okada_keke_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }
  async findByWorkspace(workspaceId: string, tenantId: string): Promise<OkadaKekeProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${COLS} FROM okada_keke_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<OkRow>();
    return (results ?? []).map(rowTo);
  }
  async transition(id: string, tenantId: string, toStatus: OkadaKekeFSMState): Promise<OkadaKekeProfile | null> { return this.update(id, tenantId, { status: toStatus }); }
}
