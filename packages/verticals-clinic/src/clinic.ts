import type { ClinicProfile, CreateClinicInput, UpdateClinicInput, ClinicFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; organization_id: string; workspace_id: string; tenant_id: string; facility_name: string; facility_type: string; mdcn_ref: string | null; cac_reg_number: string | null; bed_count: number; status: string; created_at: number; }
function rowTo(r: Row): ClinicProfile { return { id: r.id, organizationId: r.organization_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, facilityName: r.facility_name, facilityType: r.facility_type as ClinicProfile['facilityType'], mdcnRef: r.mdcn_ref, cacRegNumber: r.cac_reg_number, bedCount: r.bed_count, status: r.status as ClinicFSMState, createdAt: r.created_at }; }
const COLS = 'id, organization_id, workspace_id, tenant_id, facility_name, facility_type, mdcn_ref, cac_reg_number, bed_count, status, created_at';
export class ClinicRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateClinicInput): Promise<ClinicProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO clinic_profiles (id, organization_id, workspace_id, tenant_id, facility_name, facility_type, mdcn_ref, cac_reg_number, bed_count, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, 'seeded', unixepoch())`).bind(id, input.organizationId, input.workspaceId, input.tenantId, input.facilityName, input.facilityType, input.cacRegNumber ?? null, input.bedCount ?? 0).run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[clinic] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<ClinicProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM clinic_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async findByType(facilityType: string, tenantId: string): Promise<ClinicProfile[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM clinic_profiles WHERE facility_type = ? AND tenant_id = ? AND status = 'active'`).bind(facilityType, tenantId).all<Row>(); return (results ?? []).map(rowTo); }
  async update(id: string, tenantId: string, input: UpdateClinicInput): Promise<ClinicProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.facilityName !== undefined) { sets.push('facility_name = ?'); b.push(input.facilityName); }
    if (input.facilityType !== undefined) { sets.push('facility_type = ?'); b.push(input.facilityType); }
    if ('mdcnRef' in input) { sets.push('mdcn_ref = ?'); b.push(input.mdcnRef ?? null); }
    if ('cacRegNumber' in input) { sets.push('cac_reg_number = ?'); b.push(input.cacRegNumber ?? null); }
    if (input.bedCount !== undefined) { sets.push('bed_count = ?'); b.push(input.bedCount); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE clinic_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: ClinicFSMState): Promise<ClinicProfile | null> { return this.update(id, tenantId, { status: to }); }
}
