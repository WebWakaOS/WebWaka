/**
 * @webwaka/verticals-mosque — Repository
 * M8d — T3, P9, P13 compliant
 */
import type {
  MosqueProfile, CreateMosqueInput, UpdateMosqueInput, MosqueFSMState,
  MosqueDonation, CreateDonationInput,
  MosqueProgramme, CreateProgrammeInput,
  MosqueMember, CreateMemberInput,
  DonationType, ProgrammeType,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; mosque_name: string; nscia_affiliation_number: string | null; it_registration_number: string | null; state: string | null; lga: string | null; congregation_size: number; status: string; created_at: number; updated_at: number; }
interface DonationRow { id: string; profile_id: string; tenant_id: string; donor_anonymous: number; donor_phone: string | null; donation_type: string; amount_kobo: number; donation_date: number | null; created_at: number; updated_at: number; }
interface ProgrammeRow { id: string; profile_id: string; tenant_id: string; programme_name: string; type: string; scheduled_date: number | null; attendance_count: number; created_at: number; updated_at: number; }
interface MemberRow { id: string; profile_id: string; tenant_id: string; member_phone: string | null; member_name: string; zakat_eligible: number; joined_date: number | null; created_at: number; updated_at: number; }

const PROFILE_COLS = 'id, workspace_id, tenant_id, mosque_name, nscia_affiliation_number, it_registration_number, state, lga, congregation_size, status, created_at, updated_at';
const DONATION_COLS = 'id, profile_id, tenant_id, donor_anonymous, donor_phone, donation_type, amount_kobo, donation_date, created_at, updated_at';
const PROG_COLS = 'id, profile_id, tenant_id, programme_name, type, scheduled_date, attendance_count, created_at, updated_at';
const MEMBER_COLS = 'id, profile_id, tenant_id, member_phone, member_name, zakat_eligible, joined_date, created_at, updated_at';

function rowToProfile(r: ProfileRow): MosqueProfile {
  return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, mosqueName: r.mosque_name, nsciaAffiliationNumber: r.nscia_affiliation_number, itRegistrationNumber: r.it_registration_number, state: r.state, lga: r.lga, congregationSize: r.congregation_size, status: r.status as MosqueFSMState, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToDonation(r: DonationRow): MosqueDonation {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, donorAnonymous: r.donor_anonymous === 1, donorPhone: r.donor_phone, donationType: r.donation_type as DonationType, amountKobo: r.amount_kobo, donationDate: r.donation_date, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToProgramme(r: ProgrammeRow): MosqueProgramme {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, programmeName: r.programme_name, type: r.type as ProgrammeType, scheduledDate: r.scheduled_date, attendanceCount: r.attendance_count, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToMember(r: MemberRow): MosqueMember {
  return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, memberPhone: r.member_phone, memberName: r.member_name, zakatEligible: r.zakat_eligible === 1, joinedDate: r.joined_date, createdAt: r.created_at, updatedAt: r.updated_at };
}

export class MosqueRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateMosqueInput): Promise<MosqueProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO mosque_profiles (id, workspace_id, tenant_id, mosque_name, nscia_affiliation_number, it_registration_number, state, lga, congregation_size, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, ?, ?, 0, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.mosqueName, input.nsciaAffiliationNumber ?? null, input.state ?? null, input.lga ?? null).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[mosque] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<MosqueProfile | null> {
    const row = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM mosque_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rowToProfile(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<MosqueProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${PROFILE_COLS} FROM mosque_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<ProfileRow>();
    return (results ?? []).map(rowToProfile);
  }

  async update(id: string, tenantId: string, input: UpdateMosqueInput): Promise<MosqueProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.mosqueName !== undefined) { sets.push('mosque_name = ?'); b.push(input.mosqueName); }
    if ('nsciaAffiliationNumber' in input) { sets.push('nscia_affiliation_number = ?'); b.push(input.nsciaAffiliationNumber ?? null); }
    if ('itRegistrationNumber' in input) { sets.push('it_registration_number = ?'); b.push(input.itRegistrationNumber ?? null); }
    if ('state' in input) { sets.push('state = ?'); b.push(input.state ?? null); }
    if ('lga' in input) { sets.push('lga = ?'); b.push(input.lga ?? null); }
    if (input.congregationSize !== undefined) { sets.push('congregation_size = ?'); b.push(input.congregationSize); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE mosque_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: MosqueFSMState): Promise<MosqueProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createDonation(input: CreateDonationInput): Promise<MosqueDonation> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo < 0) throw new Error('[mosque] amountKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    const anon = input.donorAnonymous ?? false;
    const phone = anon ? null : (input.donorPhone ?? null);
    await this.db.prepare(`INSERT INTO mosque_donations (id, profile_id, tenant_id, donor_anonymous, donor_phone, donation_type, amount_kobo, donation_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, anon ? 1 : 0, phone, input.donationType ?? 'general', input.amountKobo, input.donationDate ?? null).run();
    const row = await this.db.prepare(`SELECT ${DONATION_COLS} FROM mosque_donations WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<DonationRow>();
    if (!row) throw new Error('[mosque] createDonation failed');
    return rowToDonation(row);
  }

  async findDonationsByProfile(profileId: string, tenantId: string): Promise<MosqueDonation[]> {
    const { results } = await this.db.prepare(`SELECT ${DONATION_COLS} FROM mosque_donations WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<DonationRow>();
    return (results ?? []).map(rowToDonation);
  }

  async createProgramme(input: CreateProgrammeInput): Promise<MosqueProgramme> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO mosque_programmes (id, profile_id, tenant_id, programme_name, type, scheduled_date, attendance_count, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.programmeName, input.type ?? 'lecture', input.scheduledDate ?? null, input.attendanceCount ?? 0).run();
    const row = await this.db.prepare(`SELECT ${PROG_COLS} FROM mosque_programmes WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<ProgrammeRow>();
    if (!row) throw new Error('[mosque] createProgramme failed');
    return rowToProgramme(row);
  }

  async findProgrammesByProfile(profileId: string, tenantId: string): Promise<MosqueProgramme[]> {
    const { results } = await this.db.prepare(`SELECT ${PROG_COLS} FROM mosque_programmes WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<ProgrammeRow>();
    return (results ?? []).map(rowToProgramme);
  }

  async createMember(input: CreateMemberInput): Promise<MosqueMember> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO mosque_members (id, profile_id, tenant_id, member_phone, member_name, zakat_eligible, joined_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.memberPhone ?? null, input.memberName, input.zakatEligible ? 1 : 0, input.joinedDate ?? null).run();
    const row = await this.db.prepare(`SELECT ${MEMBER_COLS} FROM mosque_members WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<MemberRow>();
    if (!row) throw new Error('[mosque] createMember failed');
    return rowToMember(row);
  }

  async findMembersByProfile(profileId: string, tenantId: string): Promise<MosqueMember[]> {
    const { results } = await this.db.prepare(`SELECT ${MEMBER_COLS} FROM mosque_members WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<MemberRow>();
    return (results ?? []).map(rowToMember);
  }
}
