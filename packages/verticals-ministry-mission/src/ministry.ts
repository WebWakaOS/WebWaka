import type { MinistryProfile, CreateMinistryInput, UpdateMinistryInput, MinistryFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; organization_id: string; workspace_id: string; tenant_id: string; ministry_name: string; it_number: string | null; founding_year: number | null; total_members: number; status: string; created_at: number; }
function rowTo(r: Row): MinistryProfile { return { id: r.id, organizationId: r.organization_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, ministryName: r.ministry_name, itNumber: r.it_number, foundingYear: r.founding_year, totalMembers: r.total_members, status: r.status as MinistryFSMState, createdAt: r.created_at }; }
const COLS = 'id, organization_id, workspace_id, tenant_id, ministry_name, it_number, founding_year, total_members, status, created_at';
export class MinistryRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateMinistryInput): Promise<MinistryProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO ministry_profiles (id, organization_id, workspace_id, tenant_id, ministry_name, it_number, founding_year, total_members, status, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, 'seeded', unixepoch())`).bind(id, input.organizationId, input.workspaceId, input.tenantId, input.ministryName, input.foundingYear ?? null, input.totalMembers ?? 0).run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[ministry] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<MinistryProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM ministry_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async update(id: string, tenantId: string, input: UpdateMinistryInput): Promise<MinistryProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.ministryName !== undefined) { sets.push('ministry_name = ?'); b.push(input.ministryName); }
    if ('itNumber' in input) { sets.push('it_number = ?'); b.push(input.itNumber ?? null); }
    if ('foundingYear' in input) { sets.push('founding_year = ?'); b.push(input.foundingYear ?? null); }
    if (input.totalMembers !== undefined) { sets.push('total_members = ?'); b.push(input.totalMembers); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE ministry_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: MinistryFSMState): Promise<MinistryProfile | null> { return this.update(id, tenantId, { status: to }); }
}
