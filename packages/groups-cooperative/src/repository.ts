/**
 * @webwaka/groups-cooperative — Cooperative extension repository
 *
 * Platform Invariants:
 *   T3 — tenant_id predicate on every query
 *   P9 — kobo fields asserted integer before writes
 */

import type {
  GroupCooperativeExtension,
  UpsertCooperativeExtensionInput,
  UpdateFundBalanceInput,
} from './types.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
    };
    first<T>(): Promise<T | null>;
  };
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

function assertIntegerKobo(amount: number, field: string): void {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error(`P9_VIOLATION: ${field} must be a non-negative integer kobo (got ${amount})`);
  }
}

interface CoopExtRow {
  group_id: string; tenant_id: string; workspace_id: string;
  coop_type: string; cac_reg_number: string | null;
  savings_goal_kobo: number; loan_fund_kobo: number;
  shares_per_member_kobo: number; dividend_rate_bps: number;
  state_code: string | null; lga_code: string | null;
  created_at: number; updated_at: number;
}

function mapExtension(r: CoopExtRow): GroupCooperativeExtension {
  return {
    groupId: r.group_id, tenantId: r.tenant_id, workspaceId: r.workspace_id,
    coopType: r.coop_type as GroupCooperativeExtension['coopType'],
    cacRegNumber: r.cac_reg_number, savingsGoalKobo: r.savings_goal_kobo,
    loanFundKobo: r.loan_fund_kobo, sharesPerMemberKobo: r.shares_per_member_kobo,
    dividendRateBps: r.dividend_rate_bps, stateCode: r.state_code, lgaCode: r.lga_code,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function upsertCooperativeExtension(
  db: D1Like,
  input: UpsertCooperativeExtensionInput,
): Promise<GroupCooperativeExtension> {
  const savingsGoal = input.savingsGoalKobo ?? 0;
  const loanFund = input.loanFundKobo ?? 0;
  const shareVal = input.sharesPerMemberKobo ?? 0;
  assertIntegerKobo(savingsGoal, 'savingsGoalKobo');
  assertIntegerKobo(loanFund, 'loanFundKobo');
  assertIntegerKobo(shareVal, 'sharesPerMemberKobo');
  const ts = now();

  await db
    .prepare(
      `INSERT INTO group_cooperative_extensions
         (group_id, tenant_id, workspace_id, coop_type, cac_reg_number,
          savings_goal_kobo, loan_fund_kobo, shares_per_member_kobo, dividend_rate_bps,
          state_code, lga_code, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT (group_id, tenant_id) DO UPDATE SET
         coop_type = excluded.coop_type,
         cac_reg_number = excluded.cac_reg_number,
         savings_goal_kobo = excluded.savings_goal_kobo,
         loan_fund_kobo = excluded.loan_fund_kobo,
         shares_per_member_kobo = excluded.shares_per_member_kobo,
         dividend_rate_bps = excluded.dividend_rate_bps,
         state_code = excluded.state_code,
         lga_code = excluded.lga_code,
         updated_at = excluded.updated_at`,
    )
    .bind(
      input.groupId, input.tenantId, input.workspaceId,
      input.coopType ?? 'savings', input.cacRegNumber ?? null,
      savingsGoal, loanFund, shareVal, input.dividendRateBps ?? 0,
      input.stateCode ?? null, input.lgaCode ?? null, ts, ts,
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM group_cooperative_extensions WHERE group_id = ? AND tenant_id = ?')
    .bind(input.groupId, input.tenantId)
    .first<CoopExtRow>();
  if (!row) throw new Error('cooperative extension upsert failed');
  return mapExtension(row);
}

export async function getCooperativeExtension(
  db: D1Like,
  groupId: string,
  tenantId: string,
): Promise<GroupCooperativeExtension | null> {
  const row = await db
    .prepare('SELECT * FROM group_cooperative_extensions WHERE group_id = ? AND tenant_id = ?')
    .bind(groupId, tenantId)
    .first<CoopExtRow>();
  return row ? mapExtension(row) : null;
}

export async function updateFundBalance(
  db: D1Like,
  input: UpdateFundBalanceInput,
): Promise<GroupCooperativeExtension> {
  if (input.savingsGoalKobo !== undefined) assertIntegerKobo(input.savingsGoalKobo, 'savingsGoalKobo');
  if (input.loanFundKobo !== undefined) assertIntegerKobo(input.loanFundKobo, 'loanFundKobo');

  const parts: string[] = ['updated_at = ?'];
  const vals: unknown[] = [now()];
  if (input.savingsGoalKobo !== undefined) { parts.push('savings_goal_kobo = ?'); vals.push(input.savingsGoalKobo); }
  if (input.loanFundKobo !== undefined) { parts.push('loan_fund_kobo = ?'); vals.push(input.loanFundKobo); }
  vals.push(input.groupId, input.tenantId);

  await db
    .prepare(`UPDATE group_cooperative_extensions SET ${parts.join(', ')} WHERE group_id = ? AND tenant_id = ?`)
    .bind(...vals)
    .run();

  const row = await db
    .prepare('SELECT * FROM group_cooperative_extensions WHERE group_id = ? AND tenant_id = ?')
    .bind(input.groupId, input.tenantId)
    .first<CoopExtRow>();
  if (!row) throw new Error('cooperative extension update failed');
  return mapExtension(row);
}
