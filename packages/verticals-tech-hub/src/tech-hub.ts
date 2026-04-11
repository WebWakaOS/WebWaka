import type { TechHubProfile, CreateTechHubInput, UpdateTechHubInput, TechHubFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; workspace_id: string; tenant_id: string; hub_name: string; lga: string; state: string; desk_count: number; focus_areas: string; status: string; created_at: number; }
function rowTo(r: Row): TechHubProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, hubName: r.hub_name, lga: r.lga, state: r.state, deskCount: r.desk_count, focusAreas: r.focus_areas, status: r.status as TechHubFSMState, createdAt: r.created_at }; }
const COLS = 'id, workspace_id, tenant_id, hub_name, lga, state, desk_count, focus_areas, status, created_at';
export class TechHubRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateTechHubInput): Promise<TechHubProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO tech_hub_profiles (id, workspace_id, tenant_id, hub_name, lga, state, desk_count, focus_areas, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.hubName, input.lga, input.state, input.deskCount ?? 0, input.focusAreas ?? 'general').run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[tech-hub] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<TechHubProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM tech_hub_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async findByState(state: string, tenantId: string): Promise<TechHubProfile[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM tech_hub_profiles WHERE state = ? AND tenant_id = ? ORDER BY desk_count DESC`).bind(state, tenantId).all<Row>(); return (results ?? []).map(rowTo); }
  async update(id: string, tenantId: string, input: UpdateTechHubInput): Promise<TechHubProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.hubName !== undefined) { sets.push('hub_name = ?'); b.push(input.hubName); }
    if (input.lga !== undefined) { sets.push('lga = ?'); b.push(input.lga); }
    if (input.state !== undefined) { sets.push('state = ?'); b.push(input.state); }
    if (input.deskCount !== undefined) { sets.push('desk_count = ?'); b.push(input.deskCount); }
    if (input.focusAreas !== undefined) { sets.push('focus_areas = ?'); b.push(input.focusAreas); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE tech_hub_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: TechHubFSMState): Promise<TechHubProfile | null> { return this.update(id, tenantId, { status: to }); }
}
