import type { YouthOrgProfile, CreateYouthOrgInput, UpdateYouthOrgInput, YouthOrgFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; organization_id: string; workspace_id: string; tenant_id: string; org_name: string; registration_ref: string | null; member_count: number; status: string; created_at: number; }
function rowTo(r: Row): YouthOrgProfile { return { id: r.id, organizationId: r.organization_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, orgName: r.org_name, registrationRef: r.registration_ref, memberCount: r.member_count, status: r.status as YouthOrgFSMState, createdAt: r.created_at }; }
const COLS = 'id, organization_id, workspace_id, tenant_id, org_name, registration_ref, member_count, status, created_at';
export class YouthOrgRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateYouthOrgInput): Promise<YouthOrgProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO youth_org_profiles (id, organization_id, workspace_id, tenant_id, org_name, registration_ref, member_count, status, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?, 'seeded', unixepoch())`).bind(id, input.organizationId, input.workspaceId, input.tenantId, input.orgName, input.memberCount ?? 0).run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[youth-org] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<YouthOrgProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM youth_org_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async update(id: string, tenantId: string, input: UpdateYouthOrgInput): Promise<YouthOrgProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.orgName !== undefined) { sets.push('org_name = ?'); b.push(input.orgName); }
    if ('registrationRef' in input) { sets.push('registration_ref = ?'); b.push(input.registrationRef ?? null); }
    if (input.memberCount !== undefined) { sets.push('member_count = ?'); b.push(input.memberCount); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE youth_org_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: YouthOrgFSMState): Promise<YouthOrgProfile | null> { return this.update(id, tenantId, { status: to }); }
}
