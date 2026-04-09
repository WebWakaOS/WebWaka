import type { ProfessionalProfile, CreateProfessionalInput, UpdateProfessionalInput, ProfessionalFSMState } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; individual_id: string; workspace_id: string; tenant_id: string; profession: string; license_body: string | null; license_number: string | null; license_expires: number | null; years_experience: number; consultation_fee_kobo: number | null; status: string; created_at: number; }
function rowTo(r: Row): ProfessionalProfile { return { id: r.id, individualId: r.individual_id, workspaceId: r.workspace_id, tenantId: r.tenant_id, profession: r.profession as ProfessionalProfile['profession'], licenseBody: r.license_body, licenseNumber: r.license_number, licenseExpires: r.license_expires, yearsExperience: r.years_experience, consultationFeeKobo: r.consultation_fee_kobo, status: r.status as ProfessionalFSMState, createdAt: r.created_at }; }
const COLS = 'id, individual_id, workspace_id, tenant_id, profession, license_body, license_number, license_expires, years_experience, consultation_fee_kobo, status, created_at';
export class ProfessionalRepository {
  constructor(private readonly db: D1Like) {}
  async create(input: CreateProfessionalInput): Promise<ProfessionalProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO professional_profiles (id, individual_id, workspace_id, tenant_id, profession, license_body, license_number, license_expires, years_experience, consultation_fee_kobo, status, created_at) VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?, 'seeded', unixepoch())`).bind(id, input.individualId, input.workspaceId, input.tenantId, input.profession, input.yearsExperience ?? 0, input.consultationFeeKobo ?? null).run();
    const p = await this.findById(id, input.tenantId); if (!p) throw new Error('[professional] create failed'); return p;
  }
  async findById(id: string, tenantId: string): Promise<ProfessionalProfile | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM professional_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async findByProfession(profession: string, tenantId: string, limit = 50): Promise<ProfessionalProfile[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM professional_profiles WHERE profession = ? AND tenant_id = ? AND status = 'active' ORDER BY years_experience DESC LIMIT ?`).bind(profession, tenantId, limit).all<Row>(); return (results ?? []).map(rowTo); }
  async update(id: string, tenantId: string, input: UpdateProfessionalInput): Promise<ProfessionalProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.profession !== undefined) { sets.push('profession = ?'); b.push(input.profession); }
    if ('licenseBody' in input) { sets.push('license_body = ?'); b.push(input.licenseBody ?? null); }
    if ('licenseNumber' in input) { sets.push('license_number = ?'); b.push(input.licenseNumber ?? null); }
    if ('licenseExpires' in input) { sets.push('license_expires = ?'); b.push(input.licenseExpires ?? null); }
    if (input.yearsExperience !== undefined) { sets.push('years_experience = ?'); b.push(input.yearsExperience); }
    if ('consultationFeeKobo' in input) { sets.push('consultation_fee_kobo = ?'); b.push(input.consultationFeeKobo ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE professional_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findById(id, tenantId);
  }
  async transition(id: string, tenantId: string, to: ProfessionalFSMState): Promise<ProfessionalProfile | null> { return this.update(id, tenantId, { status: to }); }
}
