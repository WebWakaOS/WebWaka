/**
 * Cooperative Society D1 repository.
 * (M8d — Platform Invariants T3, P9)
 * Migration: 0053_cooperative.sql → cooperative_members, contributions, loans
 * P9: All amounts in integer kobo. Interest rate in basis points.
 */

import type {
  CoopMember, CoopContribution, CoopLoan,
  CreateMemberInput, UpdateMemberInput,
  CreateContributionInput, CreateLoanInput, UpdateLoanInput,
  MemberStatus, ContributionStatus, LoanStatus,
} from './types.js';

interface D1Like {
  prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; };
}

interface MemberRow { id: string; workspace_id: string; tenant_id: string; user_id: string; member_number: string; shares_count: number; status: string; joined_at: number; }
interface ContribRow { id: string; workspace_id: string; tenant_id: string; member_id: string; amount_kobo: number; cycle_month: string; paystack_ref: string | null; status: string; created_at: number; }
interface LoanRow { id: string; workspace_id: string; tenant_id: string; member_id: string; amount_kobo: number; interest_rate: number; duration_months: number; guarantor_id: string | null; status: string; approved_at: number | null; created_at: number; }

function rowToMember(r: MemberRow): CoopMember { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, userId: r.user_id, memberNumber: r.member_number, sharesCount: r.shares_count, status: r.status as MemberStatus, joinedAt: r.joined_at }; }
function rowToContrib(r: ContribRow): CoopContribution { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, memberId: r.member_id, amountKobo: r.amount_kobo, cycleMonth: r.cycle_month, paystackRef: r.paystack_ref, status: r.status as ContributionStatus, createdAt: r.created_at }; }
function rowToLoan(r: LoanRow): CoopLoan { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, memberId: r.member_id, amountKobo: r.amount_kobo, interestRate: r.interest_rate, durationMonths: r.duration_months, guarantorId: r.guarantor_id, status: r.status as LoanStatus, approvedAt: r.approved_at, createdAt: r.created_at }; }

const M_COLS = 'id, workspace_id, tenant_id, user_id, member_number, shares_count, status, joined_at';
const C_COLS = 'id, workspace_id, tenant_id, member_id, amount_kobo, cycle_month, paystack_ref, status, created_at';
const L_COLS = 'id, workspace_id, tenant_id, member_id, amount_kobo, interest_rate, duration_months, guarantor_id, status, approved_at, created_at';

export class CooperativeRepository {
  constructor(private readonly db: D1Like) {}

  // ---- Members ----

  async createMember(input: CreateMemberInput): Promise<CoopMember> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO cooperative_members (id, workspace_id, tenant_id, user_id, member_number, shares_count, status, joined_at) VALUES (?, ?, ?, ?, ?, ?, 'active', unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.userId, input.memberNumber, input.sharesCount ?? 0).run();
    const m = await this.findMemberById(id, input.tenantId);
    if (!m) throw new Error('[cooperative] member create failed');
    return m;
  }

  async findMemberById(id: string, tenantId: string): Promise<CoopMember | null> {
    const row = await this.db.prepare(`SELECT ${M_COLS} FROM cooperative_members WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<MemberRow>();
    return row ? rowToMember(row) : null;
  }

  async findMemberByNumber(memberNumber: string, tenantId: string): Promise<CoopMember | null> {
    const row = await this.db.prepare(`SELECT ${M_COLS} FROM cooperative_members WHERE member_number = ? AND tenant_id = ?`).bind(memberNumber, tenantId).first<MemberRow>();
    return row ? rowToMember(row) : null;
  }

  async listMembers(workspaceId: string, tenantId: string, limit = 50): Promise<CoopMember[]> {
    const { results } = await this.db.prepare(`SELECT ${M_COLS} FROM cooperative_members WHERE workspace_id = ? AND tenant_id = ? AND status = 'active' ORDER BY joined_at DESC LIMIT ?`).bind(workspaceId, tenantId, limit).all<MemberRow>();
    return (results ?? []).map(rowToMember);
  }

  async updateMember(id: string, tenantId: string, input: UpdateMemberInput): Promise<CoopMember | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.sharesCount !== undefined) { sets.push('shares_count = ?'); b.push(input.sharesCount); }
    if (input.status !== undefined)      { sets.push('status = ?');       b.push(input.status); }
    if (sets.length === 0) return this.findMemberById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE cooperative_members SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findMemberById(id, tenantId);
  }

  // ---- Contributions ----

  async createContribution(input: CreateContributionInput): Promise<CoopContribution> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) throw new Error('[cooperative] amountKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO cooperative_contributions (id, workspace_id, tenant_id, member_id, amount_kobo, cycle_month, paystack_ref, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.memberId, input.amountKobo, input.cycleMonth, input.paystackRef ?? null).run();
    const c = await this.findContributionById(id, input.tenantId);
    if (!c) throw new Error('[cooperative] contribution create failed');
    return c;
  }

  async findContributionById(id: string, tenantId: string): Promise<CoopContribution | null> {
    const row = await this.db.prepare(`SELECT ${C_COLS} FROM cooperative_contributions WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<ContribRow>();
    return row ? rowToContrib(row) : null;
  }

  async listContributionsByMember(memberId: string, tenantId: string): Promise<CoopContribution[]> {
    const { results } = await this.db.prepare(`SELECT ${C_COLS} FROM cooperative_contributions WHERE member_id = ? AND tenant_id = ? ORDER BY cycle_month DESC`).bind(memberId, tenantId).all<ContribRow>();
    return (results ?? []).map(rowToContrib);
  }

  async markContributionPaid(id: string, tenantId: string, paystackRef?: string): Promise<CoopContribution | null> {
    const sets = ['status = ?']; const b: unknown[] = ['paid'];
    if (paystackRef) { sets.push('paystack_ref = ?'); b.push(paystackRef); }
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE cooperative_contributions SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ? AND status = 'pending'`).bind(...b).run();
    return this.findContributionById(id, tenantId);
  }

  async totalContributionsKobo(workspaceId: string, tenantId: string): Promise<number> {
    const row = await this.db.prepare(`SELECT COALESCE(SUM(amount_kobo), 0) AS total FROM cooperative_contributions WHERE workspace_id = ? AND tenant_id = ? AND status = 'paid'`).bind(workspaceId, tenantId).first<{ total: number }>();
    return row?.total ?? 0;
  }

  // ---- Loans ----

  async createLoan(input: CreateLoanInput): Promise<CoopLoan> {
    if (!Number.isInteger(input.amountKobo) || input.amountKobo <= 0) throw new Error('[cooperative] amountKobo must be positive integer (P9)');
    if (input.interestRate < 0) throw new Error('[cooperative] interestRate must be non-negative basis points');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO cooperative_loans (id, workspace_id, tenant_id, member_id, amount_kobo, interest_rate, duration_months, guarantor_id, status, approved_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.memberId, input.amountKobo, input.interestRate, input.durationMonths, input.guarantorId ?? null).run();
    const loan = await this.findLoanById(id, input.tenantId);
    if (!loan) throw new Error('[cooperative] loan create failed');
    return loan;
  }

  async findLoanById(id: string, tenantId: string): Promise<CoopLoan | null> {
    const row = await this.db.prepare(`SELECT ${L_COLS} FROM cooperative_loans WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<LoanRow>();
    return row ? rowToLoan(row) : null;
  }

  async listLoansByMember(memberId: string, tenantId: string): Promise<CoopLoan[]> {
    const { results } = await this.db.prepare(`SELECT ${L_COLS} FROM cooperative_loans WHERE member_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(memberId, tenantId).all<LoanRow>();
    return (results ?? []).map(rowToLoan);
  }

  async approveLoan(id: string, tenantId: string): Promise<CoopLoan | null> {
    await this.db.prepare(`UPDATE cooperative_loans SET status = 'approved', approved_at = unixepoch() WHERE id = ? AND tenant_id = ? AND status = 'pending'`).bind(id, tenantId).run();
    return this.findLoanById(id, tenantId);
  }

  async updateLoan(id: string, tenantId: string, input: UpdateLoanInput): Promise<CoopLoan | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.status !== undefined)    { sets.push('status = ?');     b.push(input.status); }
    if ('approvedAt' in input)         { sets.push('approved_at = ?');b.push(input.approvedAt ?? null); }
    if (sets.length === 0) return this.findLoanById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE cooperative_loans SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findLoanById(id, tenantId);
  }
}
