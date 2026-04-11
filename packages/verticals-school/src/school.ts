import type { SchoolProfile, CreateSchoolInput, UpdateSchoolInput, SchoolFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; organization_id: string; workspace_id: string; tenant_id: string; school_name: string; school_type: string; cac_reg_number: string | null; state_reg_ref: string | null; student_count: number; status: string; created_at: number; }
function rowTo(r: Row): SchoolProfile { return { id: r.id, organizationId: r.organization_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, schoolName: r.school_name, schoolType: r.school_type as SchoolProfile['schoolType'], cacRegNumber: r.cac_reg_number, stateRegRef: r.state_reg_ref, studentCount: r.student_count, status: r.status as SchoolFSMState, createdAt: r.created_at }; }
const COLS = 'id, organization_id, workspace_id, tenant_id, school_name, school_type, cac_reg_number, state_reg_ref, student_count, status, created_at';
export class SchoolRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateSchoolInput): Promise<SchoolProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO school_profiles (id, organization_id, workspace_id, tenant_id, school_name, school_type, cac_reg_number, state_reg_ref, student_count, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0, 'seeded', unixepoch())`).bind(id, input.organizationId, input.workspaceId, input.tenantId, input.schoolName, input.schoolType, input.cacRegNumber ?? null).run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[school] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<SchoolProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM school_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async findByType(schoolType: string, tenantId: string): Promise<SchoolProfile[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM school_profiles WHERE school_type = ? AND tenant_id = ? ORDER BY student_count DESC`).bind(schoolType, tenantId).all<Row>(); return (results ?? []).map(rowTo); }
  async update(id: string, tenantId: string, input: UpdateSchoolInput): Promise<SchoolProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.schoolName !== undefined) { sets.push('school_name = ?'); b.push(input.schoolName); }
    if (input.schoolType !== undefined) { sets.push('school_type = ?'); b.push(input.schoolType); }
    if ('cacRegNumber' in input) { sets.push('cac_reg_number = ?'); b.push(input.cacRegNumber ?? null); }
    if ('stateRegRef' in input) { sets.push('state_reg_ref = ?'); b.push(input.stateRegRef ?? null); }
    if (input.studentCount !== undefined) { sets.push('student_count = ?'); b.push(input.studentCount); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE school_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: SchoolFSMState): Promise<SchoolProfile | null> { return this.update(id, tenantId, { status: to }); }
}
