/**
 * @webwaka/verticals-professional-association — Repository
 * M12 — T3, P9, P13 compliant
 * CPD credits as integer hours; disciplinary case details NEVER reach AI (P13)
 */
import type {
  ProfessionalAssocProfile, CreateProfessionalAssocInput, UpdateProfessionalAssocInput, ProfessionalAssocFSMState, AssocType,
  ProfessionalAssocMember, CreateProfessionalMemberInput, UpdateProfessionalMemberInput, MemberStatus,
  ProfessionalAssocCpd, CreateCpdInput,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; assoc_name: string; assoc_type: string; regulatory_body: string | null; status: string; created_at: number; updated_at: number; }
interface MemberRow { id: string; profile_id: string; tenant_id: string; member_number: string | null; member_name: string; specialisation: string | null; annual_dues_kobo: number; cert_valid_until: number | null; cpd_credits_required: number; cpd_credits_earned: number; status: string; created_at: number; updated_at: number; }
interface CpdRow { id: string; member_id: string; profile_id: string; tenant_id: string; training_name: string; provider: string | null; credits_earned: number; completion_date: number | null; created_at: number; updated_at: number; }

const PC = 'id, workspace_id, tenant_id, assoc_name, assoc_type, regulatory_body, status, created_at, updated_at';
const MC = 'id, profile_id, tenant_id, member_number, member_name, specialisation, annual_dues_kobo, cert_valid_until, cpd_credits_required, cpd_credits_earned, status, created_at, updated_at';
const CC = 'id, member_id, profile_id, tenant_id, training_name, provider, credits_earned, completion_date, created_at, updated_at';

function rP(r: ProfileRow): ProfessionalAssocProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, assocName: r.assoc_name, assocType: r.assoc_type as AssocType, regulatoryBody: r.regulatory_body, status: r.status as ProfessionalAssocFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rM(r: MemberRow): ProfessionalAssocMember { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, memberNumber: r.member_number, memberName: r.member_name, specialisation: r.specialisation, annualDuesKobo: r.annual_dues_kobo, certValidUntil: r.cert_valid_until, cpdCreditsRequired: r.cpd_credits_required, cpdCreditsEarned: r.cpd_credits_earned, status: r.status as MemberStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rC(r: CpdRow): ProfessionalAssocCpd { return { id: r.id, memberId: r.member_id, profileId: r.profile_id, tenantId: r.tenant_id, trainingName: r.training_name, provider: r.provider, creditsEarned: r.credits_earned, completionDate: r.completion_date, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class ProfessionalAssocRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateProfessionalAssocInput): Promise<ProfessionalAssocProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO professional_assoc_profiles (id, workspace_id, tenant_id, assoc_name, assoc_type, regulatory_body, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.assocName, input.assocType ?? 'other', input.regulatoryBody ?? null).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[professional-association] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<ProfessionalAssocProfile | null> {
    const row = await this.db.prepare(`SELECT ${PC} FROM professional_assoc_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rP(row) : null;
  }

  async update(id: string, tenantId: string, input: UpdateProfessionalAssocInput): Promise<ProfessionalAssocProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.assocName !== undefined) { sets.push('assoc_name = ?'); b.push(input.assocName); }
    if (input.assocType !== undefined) { sets.push('assoc_type = ?'); b.push(input.assocType); }
    if ('regulatoryBody' in input) { sets.push('regulatory_body = ?'); b.push(input.regulatoryBody ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE professional_assoc_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: ProfessionalAssocFSMState): Promise<ProfessionalAssocProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createMember(input: CreateProfessionalMemberInput): Promise<ProfessionalAssocMember> {
    if (!Number.isInteger(input.annualDuesKobo) || input.annualDuesKobo < 0) throw new Error('[professional-association] annualDuesKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO professional_assoc_members (id, profile_id, tenant_id, member_number, member_name, specialisation, annual_dues_kobo, cert_valid_until, cpd_credits_required, cpd_credits_earned, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'active', unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.memberNumber ?? null, input.memberName, input.specialisation ?? null, input.annualDuesKobo, input.certValidUntil ?? null, input.cpdCreditsRequired ?? 0).run();
    const row = await this.db.prepare(`SELECT ${MC} FROM professional_assoc_members WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<MemberRow>();
    if (!row) throw new Error('[professional-association] createMember failed');
    return rM(row);
  }

  async findMembersByProfile(profileId: string, tenantId: string): Promise<ProfessionalAssocMember[]> {
    const { results } = await this.db.prepare(`SELECT ${MC} FROM professional_assoc_members WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<MemberRow>();
    return (results ?? []).map(rM);
  }

  async updateMember(id: string, tenantId: string, input: UpdateProfessionalMemberInput): Promise<ProfessionalAssocMember | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.annualDuesKobo !== undefined) { sets.push('annual_dues_kobo = ?'); b.push(input.annualDuesKobo); }
    if ('certValidUntil' in input) { sets.push('cert_valid_until = ?'); b.push(input.certValidUntil ?? null); }
    if (input.cpdCreditsRequired !== undefined) { sets.push('cpd_credits_required = ?'); b.push(input.cpdCreditsRequired); }
    if (input.cpdCreditsEarned !== undefined) { sets.push('cpd_credits_earned = ?'); b.push(input.cpdCreditsEarned); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE professional_assoc_members SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    const row = await this.db.prepare(`SELECT ${MC} FROM professional_assoc_members WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<MemberRow>();
    return row ? rM(row) : null;
  }

  async createCpd(input: CreateCpdInput): Promise<ProfessionalAssocCpd> {
    if (!Number.isInteger(input.creditsEarned) || input.creditsEarned < 0) throw new Error('[professional-association] creditsEarned must be a non-negative integer');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO professional_assoc_cpd (id, member_id, profile_id, tenant_id, training_name, provider, credits_earned, completion_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.memberId, input.profileId, input.tenantId, input.trainingName, input.provider ?? null, input.creditsEarned, input.completionDate ?? null).run();
    const row = await this.db.prepare(`SELECT ${CC} FROM professional_assoc_cpd WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<CpdRow>();
    if (!row) throw new Error('[professional-association] createCpd failed');
    return rC(row);
  }

  async findCpdByMember(memberId: string, tenantId: string): Promise<ProfessionalAssocCpd[]> {
    const { results } = await this.db.prepare(`SELECT ${CC} FROM professional_assoc_cpd WHERE member_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(memberId, tenantId).all<CpdRow>();
    return (results ?? []).map(rC);
  }
}
