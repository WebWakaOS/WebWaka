/**
 * @webwaka/verticals-campaign-office — Repository
 * M8b — T3, P9, P13 compliant
 * L3 HITL mandatory; INEC spending caps enforced; donor PII excluded from AI
 */
import type {
  CampaignOfficeProfile, CreateCampaignOfficeInput, UpdateCampaignOfficeInput, CampaignOfficeFSMState, OfficeSought,
  CampaignBudget, CreateBudgetInput, BudgetCategory,
  CampaignDonor, CreateDonorInput,
  CampaignVolunteer, CreateVolunteerInput,
  CampaignEvent, CreateCampaignEventInput, CampaignEventType,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; candidate_name: string; party: string | null; office_sought: string; inec_filing_ref: string | null; status: string; created_at: number; updated_at: number; }
interface BudgetRow { id: string; profile_id: string; tenant_id: string; category: string; budget_kobo: number; spent_kobo: number; created_at: number; updated_at: number; }
interface DonorRow { id: string; profile_id: string; tenant_id: string; donor_name: string; donor_phone: string | null; amount_kobo: number; donation_date: number | null; inec_disclosure_required: number; created_at: number; updated_at: number; }
interface VolRow { id: string; profile_id: string; tenant_id: string; volunteer_phone: string | null; volunteer_name: string; lga: string | null; ward: string | null; role: string | null; created_at: number; updated_at: number; }
interface EvRow { id: string; profile_id: string; tenant_id: string; event_type: string; location: string | null; lga: string | null; event_date: number | null; estimated_attendance: number; created_at: number; updated_at: number; }

const PC = 'id, workspace_id, tenant_id, candidate_name, party, office_sought, inec_filing_ref, status, created_at, updated_at';
const BC = 'id, profile_id, tenant_id, category, budget_kobo, spent_kobo, created_at, updated_at';
const DC = 'id, profile_id, tenant_id, donor_name, donor_phone, amount_kobo, donation_date, inec_disclosure_required, created_at, updated_at';
const VC = 'id, profile_id, tenant_id, volunteer_phone, volunteer_name, lga, ward, role, created_at, updated_at';
const EC = 'id, profile_id, tenant_id, event_type, location, lga, event_date, estimated_attendance, created_at, updated_at';

function rP(r: ProfileRow): CampaignOfficeProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, candidateName: r.candidate_name, party: r.party, officeSought: r.office_sought as OfficeSought, inecFilingRef: r.inec_filing_ref, status: r.status as CampaignOfficeFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rB(r: BudgetRow): CampaignBudget { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, category: r.category as BudgetCategory, budgetKobo: r.budget_kobo, spentKobo: r.spent_kobo, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rD(r: DonorRow): CampaignDonor { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, donorName: r.donor_name, donorPhone: r.donor_phone, amountKobo: r.amount_kobo, donationDate: r.donation_date, inecDisclosureRequired: r.inec_disclosure_required === 1, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rV(r: VolRow): CampaignVolunteer { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, volunteerPhone: r.volunteer_phone, volunteerName: r.volunteer_name, lga: r.lga, ward: r.ward, role: r.role, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rE(r: EvRow): CampaignEvent { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, eventType: r.event_type as CampaignEventType, location: r.location, lga: r.lga, eventDate: r.event_date, estimatedAttendance: r.estimated_attendance, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class CampaignOfficeRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateCampaignOfficeInput): Promise<CampaignOfficeProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO campaign_office_profiles (id, workspace_id, tenant_id, candidate_name, party, office_sought, inec_filing_ref, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NULL, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.candidateName, input.party ?? null, input.officeSought).run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[campaign-office] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<CampaignOfficeProfile | null> {
    const row = await this.db.prepare(`SELECT ${PC} FROM campaign_office_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rP(row) : null;
  }

  async update(id: string, tenantId: string, input: UpdateCampaignOfficeInput): Promise<CampaignOfficeProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.candidateName !== undefined) { sets.push('candidate_name = ?'); b.push(input.candidateName); }
    if ('party' in input) { sets.push('party = ?'); b.push(input.party ?? null); }
    if ('inecFilingRef' in input) { sets.push('inec_filing_ref = ?'); b.push(input.inecFilingRef ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE campaign_office_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: CampaignOfficeFSMState): Promise<CampaignOfficeProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createBudget(input: CreateBudgetInput): Promise<CampaignBudget> {
    if (!Number.isInteger(input.budgetKobo) || input.budgetKobo < 0) throw new Error('[campaign-office] budgetKobo must be a non-negative integer (P9)');
    const spentKobo = input.spentKobo ?? 0;
    if (!Number.isInteger(spentKobo) || spentKobo < 0) throw new Error('[campaign-office] spentKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO campaign_budget (id, profile_id, tenant_id, category, budget_kobo, spent_kobo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.category, input.budgetKobo, spentKobo).run();
    const row = await this.db.prepare(`SELECT ${BC} FROM campaign_budget WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<BudgetRow>();
    if (!row) throw new Error('[campaign-office] createBudget failed');
    return rB(row);
  }

  async findBudgetByProfile(profileId: string, tenantId: string): Promise<CampaignBudget[]> {
    const { results } = await this.db.prepare(`SELECT ${BC} FROM campaign_budget WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<BudgetRow>();
    return (results ?? []).map(rB);
  }

  async createDonor(input: CreateDonorInput): Promise<CampaignDonor> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) throw new Error('[campaign-office] amountKobo must be a positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO campaign_donors (id, profile_id, tenant_id, donor_name, donor_phone, amount_kobo, donation_date, inec_disclosure_required, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.donorName, input.donorPhone ?? null, input.amountKobo, input.donationDate ?? null, input.inecDisclosureRequired ? 1 : 0).run();
    const row = await this.db.prepare(`SELECT ${DC} FROM campaign_donors WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<DonorRow>();
    if (!row) throw new Error('[campaign-office] createDonor failed');
    return rD(row);
  }

  async findDonorsByProfile(profileId: string, tenantId: string): Promise<CampaignDonor[]> {
    const { results } = await this.db.prepare(`SELECT ${DC} FROM campaign_donors WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<DonorRow>();
    return (results ?? []).map(rD);
  }

  async createVolunteer(input: CreateVolunteerInput): Promise<CampaignVolunteer> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO campaign_volunteers (id, profile_id, tenant_id, volunteer_phone, volunteer_name, lga, ward, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.volunteerPhone ?? null, input.volunteerName, input.lga ?? null, input.ward ?? null, input.role ?? null).run();
    const row = await this.db.prepare(`SELECT ${VC} FROM campaign_volunteers WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<VolRow>();
    if (!row) throw new Error('[campaign-office] createVolunteer failed');
    return rV(row);
  }

  async createEvent(input: CreateCampaignEventInput): Promise<CampaignEvent> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO campaign_events (id, profile_id, tenant_id, event_type, location, lga, event_date, estimated_attendance, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.eventType ?? 'rally', input.location ?? null, input.lga ?? null, input.eventDate ?? null, input.estimatedAttendance ?? 0).run();
    const row = await this.db.prepare(`SELECT ${EC} FROM campaign_events WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<EvRow>();
    if (!row) throw new Error('[campaign-office] createEvent failed');
    return rE(row);
  }
}
