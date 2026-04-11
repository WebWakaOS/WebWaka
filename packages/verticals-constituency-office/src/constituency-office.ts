/**
 * @webwaka/verticals-constituency-office — Repository
 * M12 — T3, P9, P13 compliant
 * L3 HITL mandatory; complainant PII excluded from AI; public fund management
 */
import type {
  ConstituencyOfficeProfile, CreateConstituencyOfficeInput, UpdateConstituencyOfficeInput, ConstituencyOfficeFSMState, OfficeType,
  ConstituencyProject, CreateProjectInput, ProjectCategory, ProjectStatus,
  ConstituencyComplaint, CreateComplaintInput, ComplaintStatus,
  ConstituencyOutreach, CreateOutreachInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; legislator_name: string; office_type: string; constituency_name: string | null; inec_seat_number: string | null; status: string; created_at: number; updated_at: number; }
interface ProjRow { id: string; profile_id: string; tenant_id: string; project_name: string; category: string; lga: string | null; allocated_kobo: number; disbursed_kobo: number; contractor: string | null; status: string; created_at: number; updated_at: number; }
interface CompRow { id: string; profile_id: string; tenant_id: string; complaint_ref: string; lga: string | null; ward: string | null; subject: string; description: string | null; status: string; assigned_to: string | null; created_at: number; updated_at: number; }
interface OutRow { id: string; profile_id: string; tenant_id: string; event_date: number | null; lga: string | null; event_type: string | null; attendees_count: number; created_at: number; updated_at: number; }

const PC = 'id, workspace_id, tenant_id, legislator_name, office_type, constituency_name, inec_seat_number, status, created_at, updated_at';
const PRC = 'id, profile_id, tenant_id, project_name, category, lga, allocated_kobo, disbursed_kobo, contractor, status, created_at, updated_at';
const CC = 'id, profile_id, tenant_id, complaint_ref, lga, ward, subject, description, status, assigned_to, created_at, updated_at';
const OC = 'id, profile_id, tenant_id, event_date, lga, event_type, attendees_count, created_at, updated_at';

function rP(r: ProfileRow): ConstituencyOfficeProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, legislatorName: r.legislator_name, officeType: r.office_type as OfficeType, constituencyName: r.constituency_name, inecSeatNumber: r.inec_seat_number, status: r.status as ConstituencyOfficeFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rPr(r: ProjRow): ConstituencyProject { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, projectName: r.project_name, category: r.category as ProjectCategory, lga: r.lga, allocatedKobo: r.allocated_kobo, disbursedKobo: r.disbursed_kobo, contractor: r.contractor, status: r.status as ProjectStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rC(r: CompRow): ConstituencyComplaint { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, complaintRef: r.complaint_ref, lga: r.lga, ward: r.ward, subject: r.subject, description: r.description, status: r.status as ComplaintStatus, assignedTo: r.assigned_to, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rO(r: OutRow): ConstituencyOutreach { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, eventDate: r.event_date, lga: r.lga, eventType: r.event_type, attendeesCount: r.attendees_count, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class ConstituencyOfficeRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateConstituencyOfficeInput): Promise<ConstituencyOfficeProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO constituency_office_profiles (id, workspace_id, tenant_id, legislator_name, office_type, constituency_name, inec_seat_number, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.legislatorName, input.officeType ?? 'rep', input.constituencyName ?? null).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[constituency-office] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<ConstituencyOfficeProfile | null> {
    const row = await this.db.prepare(`SELECT ${PC} FROM constituency_office_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rP(row) : null;
  }

  async update(id: string, tenantId: string, input: UpdateConstituencyOfficeInput): Promise<ConstituencyOfficeProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.legislatorName !== undefined) { sets.push('legislator_name = ?'); b.push(input.legislatorName); }
    if (input.officeType !== undefined) { sets.push('office_type = ?'); b.push(input.officeType); }
    if ('constituencyName' in input) { sets.push('constituency_name = ?'); b.push(input.constituencyName ?? null); }
    if ('inecSeatNumber' in input) { sets.push('inec_seat_number = ?'); b.push(input.inecSeatNumber ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE constituency_office_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: ConstituencyOfficeFSMState): Promise<ConstituencyOfficeProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createProject(input: CreateProjectInput): Promise<ConstituencyProject> {
    if (!Number.isInteger(input.allocatedKobo) || input.allocatedKobo < 0) throw new Error('[constituency-office] allocatedKobo must be a non-negative integer (P9)');
    const disbursedKobo = input.disbursedKobo ?? 0;
    if (!Number.isInteger(disbursedKobo) || disbursedKobo < 0) throw new Error('[constituency-office] disbursedKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO constituency_projects (id, profile_id, tenant_id, project_name, category, lga, allocated_kobo, disbursed_kobo, contractor, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'planned', unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.projectName, input.category ?? 'other', input.lga ?? null, input.allocatedKobo, disbursedKobo, input.contractor ?? null).run();
    const row = await this.db.prepare(`SELECT ${PRC} FROM constituency_projects WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<ProjRow>();
    if (!row) throw new Error('[constituency-office] createProject failed');
    return rPr(row);
  }

  async findProjectsByProfile(profileId: string, tenantId: string): Promise<ConstituencyProject[]> {
    const { results } = await this.db.prepare(`SELECT ${PRC} FROM constituency_projects WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<ProjRow>();
    return (results ?? []).map(rPr);
  }

  async createComplaint(input: CreateComplaintInput): Promise<ConstituencyComplaint> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO constituency_complaints (id, profile_id, tenant_id, complaint_ref, lga, ward, subject, description, status, assigned_to, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'received', NULL, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.complaintRef, input.lga ?? null, input.ward ?? null, input.subject, input.description ?? null).run();
    const row = await this.db.prepare(`SELECT ${CC} FROM constituency_complaints WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<CompRow>();
    if (!row) throw new Error('[constituency-office] createComplaint failed');
    return rC(row);
  }

  async createOutreach(input: CreateOutreachInput): Promise<ConstituencyOutreach> {
    if (input.attendeesCount !== undefined && !Number.isInteger(input.attendeesCount)) throw new Error('[constituency-office] attendeesCount must be an integer');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO constituency_outreach (id, profile_id, tenant_id, event_date, lga, event_type, attendees_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.eventDate ?? null, input.lga ?? null, input.eventType ?? null, input.attendeesCount ?? 0).run();
    const row = await this.db.prepare(`SELECT ${OC} FROM constituency_outreach WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<OutRow>();
    if (!row) throw new Error('[constituency-office] createOutreach failed');
    return rO(row);
  }
}
