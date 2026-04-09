/**
 * @webwaka/verticals-sports-club — Repository
 * M12 — T3, P9, P13 compliant
 * Age and jersey as integers; match scores as integers; monetary in kobo
 */
import type {
  SportsClubProfile, CreateSportsClubInput, UpdateSportsClubInput, SportsClubFSMState, SportType,
  SportsClubPlayer, CreatePlayerInput,
  SportsClubMatch, CreateMatchInput, MatchStatus,
  SportsClubExpense, CreateExpenseInput, ExpenseType,
} from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface ProfileRow { id: string; workspace_id: string; tenant_id: string; club_name: string; sport_type: string; nsf_affiliation: string | null; state_sports_council_reg: string | null; status: string; created_at: number; updated_at: number; }
interface PlayerRow { id: string; profile_id: string; tenant_id: string; player_name: string; position: string | null; age_years: number | null; jersey_number: number | null; monthly_dues_kobo: number; dues_status: string; created_at: number; updated_at: number; }
interface MatchRow { id: string; profile_id: string; tenant_id: string; opponent: string; venue: string | null; match_date: number | null; result_home: number | null; result_away: number | null; status: string; created_at: number; updated_at: number; }
interface ExpRow { id: string; profile_id: string; tenant_id: string; expense_type: string; description: string | null; amount_kobo: number; expense_date: number | null; created_at: number; updated_at: number; }

const PC = 'id, workspace_id, tenant_id, club_name, sport_type, nsf_affiliation, state_sports_council_reg, status, created_at, updated_at';
const PLC = 'id, profile_id, tenant_id, player_name, position, age_years, jersey_number, monthly_dues_kobo, dues_status, created_at, updated_at';
const MAC = 'id, profile_id, tenant_id, opponent, venue, match_date, result_home, result_away, status, created_at, updated_at';
const EC = 'id, profile_id, tenant_id, expense_type, description, amount_kobo, expense_date, created_at, updated_at';

function rP(r: ProfileRow): SportsClubProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, clubName: r.club_name, sportType: r.sport_type as SportType, nsfAffiliation: r.nsf_affiliation, stateSportsCouncilReg: r.state_sports_council_reg, status: r.status as SportsClubFSMState, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rPl(r: PlayerRow): SportsClubPlayer { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, playerName: r.player_name, position: r.position, ageYears: r.age_years, jerseyNumber: r.jersey_number, monthlyDuesKobo: r.monthly_dues_kobo, duesStatus: r.dues_status, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rM(r: MatchRow): SportsClubMatch { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, opponent: r.opponent, venue: r.venue, matchDate: r.match_date, resultHome: r.result_home, resultAway: r.result_away, status: r.status as MatchStatus, createdAt: r.created_at, updatedAt: r.updated_at }; }
function rE(r: ExpRow): SportsClubExpense { return { id: r.id, profileId: r.profile_id, tenantId: r.tenant_id, expenseType: r.expense_type as ExpenseType, description: r.description, amountKobo: r.amount_kobo, expenseDate: r.expense_date, createdAt: r.created_at, updatedAt: r.updated_at }; }

export class SportsClubRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateSportsClubInput): Promise<SportsClubProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO sports_club_profiles (id, workspace_id, tenant_id, club_name, sport_type, nsf_affiliation, state_sports_council_reg, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, NULL, 'seeded', unixepoch(), unixepoch())`)
      .bind(id, input.workspaceId, input.tenantId, input.clubName, input.sportType ?? 'football').run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[sports-club] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<SportsClubProfile | null> {
    const row = await this.db.prepare(`SELECT ${PC} FROM sports_club_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ProfileRow>();
    return row ? rP(row) : null;
  }

  async update(id: string, tenantId: string, input: UpdateSportsClubInput): Promise<SportsClubProfile | null> {
    const sets: string[] = ['updated_at = unixepoch()']; const b: unknown[] = [];
    if (input.clubName !== undefined) { sets.push('club_name = ?'); b.push(input.clubName); }
    if (input.sportType !== undefined) { sets.push('sport_type = ?'); b.push(input.sportType); }
    if ('nsfAffiliation' in input) { sets.push('nsf_affiliation = ?'); b.push(input.nsfAffiliation ?? null); }
    if ('stateSportsCouncilReg' in input) { sets.push('state_sports_council_reg = ?'); b.push(input.stateSportsCouncilReg ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE sports_club_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, to: SportsClubFSMState): Promise<SportsClubProfile | null> {
    return this.update(id, tenantId, { status: to });
  }

  async createPlayer(input: CreatePlayerInput): Promise<SportsClubPlayer> {
    if (!Number.isInteger(input.monthlyDuesKobo) || input.monthlyDuesKobo < 0) throw new Error('[sports-club] monthlyDuesKobo must be a non-negative integer (P9)');
    if (input.ageYears !== undefined && !Number.isInteger(input.ageYears)) throw new Error('[sports-club] ageYears must be an integer');
    if (input.jerseyNumber !== undefined && !Number.isInteger(input.jerseyNumber)) throw new Error('[sports-club] jerseyNumber must be an integer');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO sports_club_players (id, profile_id, tenant_id, player_name, position, age_years, jersey_number, monthly_dues_kobo, dues_status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'current', unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.playerName, input.position ?? null, input.ageYears ?? null, input.jerseyNumber ?? null, input.monthlyDuesKobo).run();
    const row = await this.db.prepare(`SELECT ${PLC} FROM sports_club_players WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<PlayerRow>();
    if (!row) throw new Error('[sports-club] createPlayer failed');
    return rPl(row);
  }

  async findPlayersByProfile(profileId: string, tenantId: string): Promise<SportsClubPlayer[]> {
    const { results } = await this.db.prepare(`SELECT ${PLC} FROM sports_club_players WHERE profile_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(profileId, tenantId).all<PlayerRow>();
    return (results ?? []).map(rPl);
  }

  async createMatch(input: CreateMatchInput): Promise<SportsClubMatch> {
    if (input.resultHome !== undefined && !Number.isInteger(input.resultHome)) throw new Error('[sports-club] resultHome must be an integer');
    if (input.resultAway !== undefined && !Number.isInteger(input.resultAway)) throw new Error('[sports-club] resultAway must be an integer');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO sports_club_matches (id, profile_id, tenant_id, opponent, venue, match_date, result_home, result_away, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.opponent, input.venue ?? null, input.matchDate ?? null, input.resultHome ?? null, input.resultAway ?? null, input.status ?? 'scheduled').run();
    const row = await this.db.prepare(`SELECT ${MAC} FROM sports_club_matches WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<MatchRow>();
    if (!row) throw new Error('[sports-club] createMatch failed');
    return rM(row);
  }

  async createExpense(input: CreateExpenseInput): Promise<SportsClubExpense> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo < 0) throw new Error('[sports-club] amountKobo must be a non-negative integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO sports_club_expenses (id, profile_id, tenant_id, expense_type, description, amount_kobo, expense_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`)
      .bind(id, input.profileId, input.tenantId, input.expenseType ?? 'equipment', input.description ?? null, input.amountKobo, input.expenseDate ?? null).run();
    const row = await this.db.prepare(`SELECT ${EC} FROM sports_club_expenses WHERE id = ? AND tenant_id = ?`).bind(id, input.tenantId).first<ExpRow>();
    if (!row) throw new Error('[sports-club] createExpense failed');
    return rE(row);
  }
}
