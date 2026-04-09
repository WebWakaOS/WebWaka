import type { WomensAssocProfile, CreateWomensAssocInput, UpdateWomensAssocInput, WomensAssocFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; organization_id: string; workspace_id: string; tenant_id: string; assoc_name: string; lga: string; state: string; member_count: number; status: string; created_at: number; }
function rowTo(r: Row): WomensAssocProfile { return { id: r.id, organizationId: r.organization_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, assocName: r.assoc_name, lga: r.lga, state: r.state, memberCount: r.member_count, status: r.status as WomensAssocFSMState, createdAt: r.created_at }; }
const COLS = 'id, organization_id, workspace_id, tenant_id, assoc_name, lga, state, member_count, status, created_at';
export class WomensAssocRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateWomensAssocInput): Promise<WomensAssocProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO womens_assoc_profiles (id, organization_id, workspace_id, tenant_id, assoc_name, lga, state, member_count, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch())`).bind(id, input.organizationId, input.workspaceId, input.tenantId, input.assocName, input.lga, input.state, input.memberCount ?? 0).run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[womens-assoc] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<WomensAssocProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM womens_assoc_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async update(id: string, tenantId: string, input: UpdateWomensAssocInput): Promise<WomensAssocProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.assocName !== undefined) { sets.push('assoc_name = ?'); b.push(input.assocName); }
    if (input.lga !== undefined) { sets.push('lga = ?'); b.push(input.lga); }
    if (input.state !== undefined) { sets.push('state = ?'); b.push(input.state); }
    if (input.memberCount !== undefined) { sets.push('member_count = ?'); b.push(input.memberCount); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE womens_assoc_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: WomensAssocFSMState): Promise<WomensAssocProfile | null> { return this.update(id, tenantId, { status: to }); }
}
