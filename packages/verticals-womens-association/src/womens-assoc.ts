/**
 * @webwaka/verticals-womens-association — Repository
 * M8d — T3, P9, P13 compliant
 */
import type {
  WomensAssocProfile, CreateWomensAssocInput, UpdateWomensAssocInput, WomensAssocFSMState, WomensAssocType,
  WomensAssocMember, CreateMemberInput,
  WomensAssocWelfare, CreateWelfareInput, WelfareType, WelfareStatus,
  WomensAssocMeeting, CreateMeetingInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; assoc_name: string; type: string; cac_reg: string | null; nwec_affiliation: string | null; state: string | null; lga: string | null; status: string; created_at: number; updated_at: number; }
interface MemberRow { id: string; profile_id: string; tenant_id: string; member_phone: string | null; member_name: string; monthly_contribution_kobo: number; contribution_status: string; joined_date: number | null; created_at: number; updated_at: number; }
interface WelfareRow { id: string; profile_id: string; member_id: string; tenant_id: string; welfare_type: string; amount_kobo: number; repayment_schedule: string | null; status: string; created_at: number; updated_at: number; }
interface MeetingRow { id: string; profile_id: string; tenant_id: string; meeting_date: number | null; agenda: string | null; minutes_text: string | null; attendance_count: number; created_at: number; updated_at: number; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, assoc_name, type, cac_reg, nwec_affiliation, state, lga, status, created_at, updated_at';
const MEMBER_COLS = 'id, profile_id, tenant_id, member_phone, member_name, monthly_contribution_kobo, contribution_status, joined_date, created_at, updated_at';
const WELFARE_COLS = 'id, profile_id, member_id, tenant_id, welfare_type, amount_kobo, repayment_schedule, status, created_at, updated_at';
const MEETING_COLS = 'id, profile_id, tenant_id, meeting_date, agenda, minutes_text, attendance_count, created_at, updated_at';

function rowToProfile(r: ProfileRow): WomensAssocProfile {
  return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, assocName: r.assoc_name, type: r.type as WomensAssocType, cacReg: r.cac_reg, nwecAffiliation: r.nwec_affiliation, state: r.state, lga: r.lga, status: r.status as WomensAssocFSMState, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToMember(r: MemberRow): WomensAssocMember {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, memberPhone: r.member_phone, memberName: r.member_name, monthlyContributionKobo: r.monthly_contribution_kobo, contributionStatus: r.contribution_status, joinedDate: r.joined_date, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToWelfare(r: WelfareRow): WomensAssocWelfare {
  return { id: r.id, profileId: r.profile_id, memberId: r.member_id, tenantId: r.tenant_id, welfareType: r.welfare_type as WelfareType, amountKobo: r.amount_kobo, repaymentSchedule: r.repayment_schedule, status: r.status as WelfareStatus, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToMeeting(r: MeetingRow): WomensAssocMeeting {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, meetingDate: r.meeting_date, agenda: r.agenda, minutesText: r.minutes_text, attendanceCount: r.attendance_count, createdAt: r.created_at, updatedAt: r.updated_at };
}

export class WomensAssocRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateWomensAssocInput): Promise<WomensAssocProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO womens_assoc_profiles (id, workspace_id, tenant_id, assoc_name, type, cac_reg, nwec_affiliation, state, lga, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.assocName, input.type ?? 'community', input.state ?? null, input.lga ?? null).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[womens-assoc] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<WomensAssocProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM womens_assoc_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rowToProfile(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<WomensAssocProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM womens_assoc_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<ProfileRow>();
    return (results ?? []).map(rowToProfile);
  }

  async update(id: string, tenantId: string, input: UpdateWomensAssocInput): Promise<WomensAssocProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.assocName !== undefined) { sets.push('assoc_name = ?'); b.push(input.assocName); }
    if (input.type !== undefined) { sets.push('type = ?'); b.push(input.type); }
    if ('cacReg' in input) { sets.push('cac_reg = ?'); b.push(input.cacReg ?? null); }
    if ('nwecAffiliation' in input) { sets.push('nwec_affiliation = ?'); b.push(input.nwecAffiliation ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE womens_assoc_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: WomensAssocFSMState): Promise<WomensAssocProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createMember(input: CreateMemberInput): Promise<WomensAssocMember> {
    if (!Number.isInteger(input.monthlyContributionKobo) || input.monthlyContributionKobo < 0) throw new Error('[womens-assoc] monthlyContributionKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO womens_assoc_members (id, profile_id, tenant_id, member_phone, member_name, monthly_contribution_kobo, contribution_status, joined_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.memberPhone ?? null, input.memberName, input.monthlyContributionKobo, input.contributionStatus ?? 'current', input.joinedDate ?? null).run();
    const row = await this.db.prepare(`SELECT ${MEMBER_COLS} FROM womens_assoc_members WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<MemberRow>();
    if (!row) throw new Error('[womens-assoc] createMember failed');
    return rowToMember(row);
  }

  async findMembersByProfile(profileId: string, tenantId: string): Promise<WomensAssocMember[]> {
    const { results } = await this.db.prepare(`SELECT ${MEMBER_COLS} FROM womens_assoc_members WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<MemberRow>();
    return (results ?? []).map(rowToMember);
  }

  async createWelfare(input: CreateWelfareInput): Promise<WomensAssocWelfare> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) throw new Error('[womens-assoc] amountKobo must be a positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO womens_assoc_welfare (id, profile_id, member_id, tenant_id, welfare_type, amount_kobo, repayment_schedule, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.memberId, input.tenantId, input.welfareType ?? 'loan', input.amountKobo, input.repaymentSchedule ?? null).run();
    const row = await this.db.prepare(`SELECT ${WELFARE_COLS} FROM womens_assoc_welfare WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<WelfareRow>();
    if (!row) throw new Error('[womens-assoc] createWelfare failed');
    return rowToWelfare(row);
  }

  async findWelfareByProfile(profileId: string, tenantId: string): Promise<WomensAssocWelfare[]> {
    const { results } = await this.db.prepare(`SELECT ${WELFARE_COLS} FROM womens_assoc_welfare WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<WelfareRow>();
    return (results ?? []).map(rowToWelfare);
  }

  async createMeeting(input: CreateMeetingInput): Promise<WomensAssocMeeting> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO womens_assoc_meetings (id, profile_id, tenant_id, meeting_date, agenda, minutes_text, attendance_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.meetingDate ?? null, input.agenda ?? null, input.minutesText ?? null, input.attendanceCount ?? 0).run();
    const row = await this.db.prepare(`SELECT ${MEETING_COLS} FROM womens_assoc_meetings WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<MeetingRow>();
    if (!row) throw new Error('[womens-assoc] createMeeting failed');
    return rowToMeeting(row);
  }
}
