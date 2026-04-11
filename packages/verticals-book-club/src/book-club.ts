/**
 * @webwaka/verticals-book-club — Repository
 * M12 — T3, P9 compliant; 3-state FSM (simplified informal)
 */
import type {
  BookClubProfile, CreateBookClubInput, UpdateBookClubInput, BookClubFSMState,
  BookClubMember, CreateBookClubMemberInput,
  BookClubReading, CreateReadingInput,
  BookClubMeeting, CreateMeetingInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; club_name: string; cac_or_informal: string | null; nln_affiliation: string | null; state: string | null; status: string; created_at: number; updated_at: number; }
interface MemberRow { id: string; profile_id: string; tenant_id: string; member_phone: string | null; member_name: string; monthly_dues_kobo: number; dues_status: string; created_at: number; updated_at: number; }
interface ReadingRow { id: string; profile_id: string; tenant_id: string; book_title: string; author: string | null; month: number | null; purchase_cost_kobo: number; created_at: number; updated_at: number; }
interface MeetingRow { id: string; profile_id: string; tenant_id: string; meeting_date: number | null; book_discussed: string | null; attendance_count: number; created_at: number; updated_at: number; }

const PC = 'id, workspace_id, tenant_id, club_name, cac_or_informal, nln_affiliation, state, status, created_at, updated_at';
const MC = 'id, profile_id, tenant_id, member_phone, member_name, monthly_dues_kobo, dues_status, created_at, updated_at';
const RRC = 'id, profile_id, tenant_id, book_title, author, month, purchase_cost_kobo, created_at, updated_at';
const MTC = 'id, profile_id, tenant_id, meeting_date, book_discussed, attendance_count, created_at, updated_at';

function rP(r: ProfileRow): BookClubProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, clubName: r.club_name, cacOrInformal: r.cac_or_informal, nlnAffiliation: r.nln_affiliation, state: r.state, status: r.status as BookClubFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rM(r: MemberRow): BookClubMember { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, memberPhone: r.member_phone, memberName: r.member_name, monthlyDuesKobo: r.monthly_dues_kobo, duesStatus: r.dues_status, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rR(r: ReadingRow): BookClubReading { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, bookTitle: r.book_title, author: r.author, month: r.month, purchaseCostKobo: r.purchase_cost_kobo, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rMt(r: MeetingRow): BookClubMeeting { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, meetingDate: r.meeting_date, bookDiscussed: r.book_discussed, attendanceCount: r.attendance_count, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class BookClubRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateBookClubInput): Promise<BookClubProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO book_club_profiles (id, workspace_id, tenant_id, club_name, cac_or_informal, nln_affiliation, state, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.clubName, input.cacOrInformal ?? null, input.nlnAffiliation ?? null, input.state ?? null).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[book-club] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<BookClubProfile | null> {
    const row = await this.db.prepare(`SELECT ${PC} FROM book_club_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rP(row) : null;
  }

  async update(id: string, tenantId: string, input: UpdateBookClubInput): Promise<BookClubProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.clubName !== undefined) { sets.push('club_name = ?'); b.push(input.clubName); }
    if ('cacOrInformal' in input) { sets.push('cac_or_informal = ?'); b.push(input.cacOrInformal ?? null); }
    if ('nlnAffiliation' in input) { sets.push('nln_affiliation = ?'); b.push(input.nlnAffiliation ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE book_club_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: BookClubFSMState): Promise<BookClubProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createMember(input: CreateBookClubMemberInput): Promise<BookClubMember> {
    if (!Number.isInteger(input.monthlyDuesKobo) || input.monthlyDuesKobo < 0) throw new Error('[book-club] monthlyDuesKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO book_club_members (id, profile_id, tenant_id, member_phone, member_name, monthly_dues_kobo, dues_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.memberPhone ?? null, input.memberName, input.monthlyDuesKobo, input.duesStatus ?? 'current').run();
    const row = await this.db.prepare(`SELECT ${MC} FROM book_club_members WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<MemberRow>();
    if (!row) throw new Error('[book-club] createMember failed');
    return rM(row);
  }

  async createReading(input: CreateReadingInput): Promise<BookClubReading> {
    if (!Number.isInteger(input.purchaseCostKobo) || input.purchaseCostKobo < 0) throw new Error('[book-club] purchaseCostKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO book_club_readings (id, profile_id, tenant_id, book_title, author, month, purchase_cost_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.bookTitle, input.author ?? null, input.month ?? null, input.purchaseCostKobo).run();
    const row = await this.db.prepare(`SELECT ${RRC} FROM book_club_readings WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<ReadingRow>();
    if (!row) throw new Error('[book-club] createReading failed');
    return rR(row);
  }

  async findMembersByProfile(profileId: string, tenantId: string): Promise<BookClubMember[]> {
    const { results } = await this.db.prepare(`SELECT ${MC} FROM book_club_members WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<MemberRow>();
    return (results ?? []).map(rM);
  }

  async findReadingsByProfile(profileId: string, tenantId: string): Promise<BookClubReading[]> {
    const { results } = await this.db.prepare(`SELECT ${RRC} FROM book_club_readings WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<ReadingRow>();
    return (results ?? []).map(rR);
  }

  async createMeeting(input: CreateMeetingInput): Promise<BookClubMeeting> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO book_club_meetings (id, profile_id, tenant_id, meeting_date, book_discussed, attendance_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.meetingDate ?? null, input.bookDiscussed ?? null, input.attendanceCount ?? 0).run();
    const row = await this.db.prepare(`SELECT ${MTC} FROM book_club_meetings WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<MeetingRow>();
    if (!row) throw new Error('[book-club] createMeeting failed');
    return rMt(row);
  }
}
