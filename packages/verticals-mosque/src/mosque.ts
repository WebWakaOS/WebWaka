import type { MosqueProfile, CreateMosqueInput, UpdateMosqueInput, MosqueFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface MosqueRow { id: string; organization_id: string; workspace_id: string; tenant_id: string; mosque_name: string; it_number: string | null; total_members: number; status: string; created_at: number; }
function rowTo(r: MosqueRow): MosqueProfile { return { id: r.id, organizationId: r.organization_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, mosqueName: r.mosque_name, itNumber: r.it_number, totalMembers: r.total_members, status: r.status as MosqueFSMState, createdAt: r.created_at }; }
const COLS = 'id, organization_id, workspace_id, tenant_id, mosque_name, it_number, total_members, status, created_at';
export class MosqueRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateMosqueInput): Promise<MosqueProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO mosque_profiles (id, organization_id, workspace_id, tenant_id, mosque_name, it_number, total_members, status, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?, 'seeded', unixepoch())`).bind(id, input.organizationId, input.workspaceId, input.tenantId, input.mosqueName, input.totalMembers ?? 0).run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[mosque] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<MosqueProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM mosque_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<MosqueRow>(); return row ? rowTo(row) : null; }
  async findByWorkspace(workspaceId: string, tenantId: string): Promise<MosqueProfile[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM mosque_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<MosqueRow>(); return (results ?? []).map(rowTo); }
  async update(id: string, tenantId: string, input: UpdateMosqueInput): Promise<MosqueProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.mosqueName !== undefined) { sets.push('mosque_name = ?'); b.push(input.mosqueName); }
    if ('itNumber' in input) { sets.push('it_number = ?'); b.push(input.itNumber ?? null); }
    if (input.totalMembers !== undefined) { sets.push('total_members = ?'); b.push(input.totalMembers); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE mosque_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: MosqueFSMState): Promise<MosqueProfile | null> { return this.update(id, tenantId, { status: to }); }
}
