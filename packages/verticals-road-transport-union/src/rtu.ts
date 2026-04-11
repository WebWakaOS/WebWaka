/**
 * Road Transport Union D1 repository (scaffold).
 * (M8c — T3)
 */
import type { RtuProfile, CreateRtuInput, UpdateRtuInput, RtuFSMState } from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface RtuRow { id: string; workspace_id: string; tenant_id: string; union_name: string; registration_ref: string | null; member_count: number; status: string; created_at: number; }
function rowTo(r: RtuRow): RtuProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, unionName: r.union_name, registrationRef: r.registration_ref, memberCount: r.member_count, status: r.status as RtuFSMState, createdAt: r.created_at }; }

const COLS = 'id, workspace_id, tenant_id, union_name, registration_ref, member_count, status, created_at';

export class RtuRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateRtuInput): Promise<RtuProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO road_transport_union_profiles (id, workspace_id, tenant_id, union_name, registration_ref, member_count, status, created_at) VALUES (?, ?, ?, ?, NULL, ?, 'seeded', unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.unionName, input.memberCount ?? 0).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[rtu] create failed');
    return p;
  }
  async findById(id: string, tenantId: string): Promise<RtuProfile | null> {
    const row = await this.db.prepare(`SELECT ${COLS} FROM road_transport_union_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<RtuRow>();
    return row ? rowTo(row) : null;
  }
  async update(id: string, tenantId: string, input: UpdateRtuInput): Promise<RtuProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.unionName !== undefined) { sets.push('union_name = ?'); b.push(input.unionName); }
    if ('registrationRef' in input) { sets.push('registration_ref = ?'); b.push(input.registrationRef ?? null); }
    if (input.memberCount !== undefined) { sets.push('member_count = ?'); b.push(input.memberCount); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE road_transport_union_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }
  async findByWorkspace(workspaceId: string, tenantId: string): Promise<RtuProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${COLS} FROM road_transport_union_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<RtuRow>();
    return (results ?? []).map(rowTo);
  }
  async transition(id: string, tenantId: string, toStatus: RtuFSMState): Promise<RtuProfile | null> { return this.update(id, tenantId, { status: toStatus }); }
}
