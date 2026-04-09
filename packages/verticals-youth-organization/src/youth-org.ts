/**
 * @webwaka/verticals-youth-organization — Repository
 * M8d — T3, P9, P13 compliant
 */
import type {
  YouthOrgProfile, CreateYouthOrgInput, UpdateYouthOrgInput, YouthOrgFSMState, YouthOrgType,
  YouthOrgMember, CreateYouthMemberInput,
  YouthOrgEvent, CreateEventInput,
  YouthOrgScholarship, CreateScholarshipInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; org_name: string; type: string; cac_reg_number: string | null; nysc_coordination: string | null; state: string | null; lga: string | null; status: string; created_at: number; updated_at: number; }
interface MemberRow { id: string; profile_id: string; tenant_id: string; member_phone: string | null; member_name: string; membership_year: number | null; annual_dues_kobo: number; dues_paid: number; created_at: number; updated_at: number; }
interface EventRow { id: string; profile_id: string; tenant_id: string; event_name: string; event_date: number | null; venue: string | null; description: string | null; attendance_count: number; created_at: number; updated_at: number; }
interface ScholarRow { id: string; profile_id: string; tenant_id: string; donor_phone: string | null; donor_name: string | null; donated_amount_kobo: number; recipient_name: string | null; award_amount_kobo: number; academic_year: string | null; created_at: number; updated_at: number; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, org_name, type, cac_reg_number, nysc_coordination, state, lga, status, created_at, updated_at';
const MEMBER_COLS = 'id, profile_id, tenant_id, member_phone, member_name, membership_year, annual_dues_kobo, dues_paid, created_at, updated_at';
const EVENT_COLS = 'id, profile_id, tenant_id, event_name, event_date, venue, description, attendance_count, created_at, updated_at';
const SCHOLAR_COLS = 'id, profile_id, tenant_id, donor_phone, donor_name, donated_amount_kobo, recipient_name, award_amount_kobo, academic_year, created_at, updated_at';

function rowToProfile(r: ProfileRow): YouthOrgProfile {
  return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, orgName: r.org_name, type: r.type as YouthOrgType, cacRegNumber: r.cac_reg_number, nyscCoordination: r.nysc_coordination, state: r.state, lga: r.lga, status: r.status as YouthOrgFSMState, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToMember(r: MemberRow): YouthOrgMember {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, memberPhone: r.member_phone, memberName: r.member_name, membershipYear: r.membership_year, annualDuesKobo: r.annual_dues_kobo, duesPaid: r.dues_paid === 1, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToEvent(r: EventRow): YouthOrgEvent {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, eventName: r.event_name, eventDate: r.event_date, venue: r.venue, description: r.description, attendanceCount: r.attendance_count, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToScholar(r: ScholarRow): YouthOrgScholarship {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, donorPhone: r.donor_phone, donorName: r.donor_name, donatedAmountKobo: r.donated_amount_kobo, recipientName: r.recipient_name, awardAmountKobo: r.award_amount_kobo, academicYear: r.academic_year, createdAt: r.created_at, updatedAt: r.updated_at };
}

export class YouthOrgRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateYouthOrgInput): Promise<YouthOrgProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO youth_org_profiles (id, workspace_id, tenant_id, org_name, type, cac_reg_number, nysc_coordination, state, lga, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.orgName, input.type ?? 'community_youth', input.state ?? null, input.lga ?? null).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[youth-org] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<YouthOrgProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM youth_org_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rowToProfile(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<YouthOrgProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM youth_org_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<ProfileRow>();
    return (results ?? []).map(rowToProfile);
  }

  async update(id: string, tenantId: string, input: UpdateYouthOrgInput): Promise<YouthOrgProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.orgName !== undefined) { sets.push('org_name = ?'); b.push(input.orgName); }
    if (input.type !== undefined) { sets.push('type = ?'); b.push(input.type); }
    if ('cacRegNumber' in input) { sets.push('cac_reg_number = ?'); b.push(input.cacRegNumber ?? null); }
    if ('nyscCoordination' in input) { sets.push('nysc_coordination = ?'); b.push(input.nyscCoordination ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE youth_org_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: YouthOrgFSMState): Promise<YouthOrgProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createMember(input: CreateYouthMemberInput): Promise<YouthOrgMember> {
    if (!Number.isInteger(input.annualDuesKobo) || input.annualDuesKobo < 0) throw new Error('[youth-org] annualDuesKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO youth_org_members (id, profile_id, tenant_id, member_phone, member_name, membership_year, annual_dues_kobo, dues_paid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.memberPhone ?? null, input.memberName, input.membershipYear ?? null, input.annualDuesKobo, input.duesPaid ? 1 : 0).run();
    const row = await this.db.prepare(`SELECT ${MEMBER_COLS} FROM youth_org_members WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<MemberRow>();
    if (!row) throw new Error('[youth-org] createMember failed');
    return rowToMember(row);
  }

  async findMembersByProfile(profileId: string, tenantId: string): Promise<YouthOrgMember[]> {
    const { results } = await this.db.prepare(`SELECT ${MEMBER_COLS} FROM youth_org_members WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<MemberRow>();
    return (results ?? []).map(rowToMember);
  }

  async createEvent(input: CreateEventInput): Promise<YouthOrgEvent> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO youth_org_events (id, profile_id, tenant_id, event_name, event_date, venue, description, attendance_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.eventName, input.eventDate ?? null, input.venue ?? null, input.description ?? null, input.attendanceCount ?? 0).run();
    const row = await this.db.prepare(`SELECT ${EVENT_COLS} FROM youth_org_events WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<EventRow>();
    if (!row) throw new Error('[youth-org] createEvent failed');
    return rowToEvent(row);
  }

  async createScholarship(input: CreateScholarshipInput): Promise<YouthOrgScholarship> {
    if (!Number.isInteger(input.donatedAmountKobo) || input.donatedAmountKobo < 0) throw new Error('[youth-org] donatedAmountKobo must be a non-negative integer (P9)');
    if (!Number.isInteger(input.awardAmountKobo) || input.awardAmountKobo < 0) throw new Error('[youth-org] awardAmountKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO youth_org_scholarships (id, profile_id, tenant_id, donor_phone, donor_name, donated_amount_kobo, recipient_name, award_amount_kobo, academic_year, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.donorPhone ?? null, input.donorName ?? null, input.donatedAmountKobo, input.recipientName ?? null, input.awardAmountKobo, input.academicYear ?? null).run();
    const row = await this.db.prepare(`SELECT ${SCHOLAR_COLS} FROM youth_org_scholarships WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<ScholarRow>();
    if (!row) throw new Error('[youth-org] createScholarship failed');
    return rowToScholar(row);
  }

  async findScholarshipsByProfile(profileId: string, tenantId: string): Promise<YouthOrgScholarship[]> {
    const { results } = await this.db.prepare(`SELECT ${SCHOLAR_COLS} FROM youth_org_scholarships WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<ScholarRow>();
    return (results ?? []).map(rowToScholar);
  }
}
