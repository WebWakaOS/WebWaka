/**
 * Enterprise Spend Controls — SA-4.4 / M12
 * WebWaka OS — Per-user, per-team, per-project WakaCU budget management.
 *
 * D1 table: ai_spend_budgets (migration 0204).
 *
 * Budget scopes:
 *   - user:      Per-user monthly cap within a workspace
 *   - team:      Per-team monthly cap (team = workspace group)
 *   - project:   Per-project cap (optional, tied to workspace metadata)
 *   - workspace: Workspace-wide override (supplements wc_wallets.spend_cap_monthly_wc)
 *
 * Platform Invariants:
 *   P9  — All WakaCU amounts are integers
 *   T3  — All queries tenant-scoped
 *   T5  — Enterprise plan required for per-user/team budgets
 */

interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

export type BudgetScope = 'user' | 'team' | 'project' | 'workspace';

export interface SpendBudget {
  id: string;
  tenantId: string;
  scope: BudgetScope;
  scopeId: string;
  monthlyLimitWakaCu: number;
  currentMonthSpentWakaCu: number;
  resetAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SetBudgetInput {
  tenantId: string;
  scope: BudgetScope;
  scopeId: string;
  monthlyLimitWakaCu: number;
}

export interface SpendCheckResult {
  allowed: boolean;
  budgetScope?: BudgetScope;
  budgetScopeId?: string;
  remaining?: number;
  limit?: number;
  spent?: number;
}

export interface SpendControlsDeps {
  db: D1Like;
}

export class SpendControls {
  private readonly db: D1Like;

  constructor(deps: SpendControlsDeps) {
    this.db = deps.db;
  }

  async setBudget(input: SetBudgetInput): Promise<SpendBudget> {
    if (!Number.isInteger(input.monthlyLimitWakaCu) || input.monthlyLimitWakaCu < 0) {
      throw new Error(`[spend-controls] monthlyLimitWakaCu must be a non-negative integer. Got: ${input.monthlyLimitWakaCu}`);
    }

    const existing = await this.db
      .prepare(
        `SELECT id FROM ai_spend_budgets
         WHERE tenant_id = ? AND scope = ? AND scope_id = ? AND is_active = 1`,
      )
      .bind(input.tenantId, input.scope, input.scopeId)
      .first<{ id: string }>();

    const resetAt = this.nextMonthReset();

    if (existing) {
      await this.db
        .prepare(
          `UPDATE ai_spend_budgets
           SET monthly_limit_wc = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
           WHERE id = ? AND tenant_id = ?`,
        )
        .bind(input.monthlyLimitWakaCu, existing.id, input.tenantId)
        .run();

      return this.getBudget(existing.id, input.tenantId) as Promise<SpendBudget>;
    }

    const id = crypto.randomUUID();
    await this.db
      .prepare(
        `INSERT INTO ai_spend_budgets
           (id, tenant_id, scope, scope_id, monthly_limit_wc,
            current_month_spent_wc, reset_at, is_active)
         VALUES (?, ?, ?, ?, ?, 0, ?, 1)`,
      )
      .bind(id, input.tenantId, input.scope, input.scopeId, input.monthlyLimitWakaCu, resetAt)
      .run();

    return {
      id,
      tenantId: input.tenantId,
      scope: input.scope,
      scopeId: input.scopeId,
      monthlyLimitWakaCu: input.monthlyLimitWakaCu,
      currentMonthSpentWakaCu: 0,
      resetAt,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async checkBudget(
    tenantId: string,
    userId: string,
    teamId?: string,
    projectId?: string,
    workspaceId?: string,
  ): Promise<SpendCheckResult> {
    const checks: Array<{ scope: BudgetScope; scopeId: string }> = [
      { scope: 'user', scopeId: userId },
    ];
    if (teamId) checks.push({ scope: 'team', scopeId: teamId });
    if (projectId) checks.push({ scope: 'project', scopeId: projectId });
    if (workspaceId) checks.push({ scope: 'workspace', scopeId: workspaceId });

    for (const { scope, scopeId } of checks) {
      const budget = await this.db
        .prepare(
          `SELECT id, monthly_limit_wc, current_month_spent_wc
           FROM ai_spend_budgets
           WHERE tenant_id = ? AND scope = ? AND scope_id = ? AND is_active = 1`,
        )
        .bind(tenantId, scope, scopeId)
        .first<{ id: string; monthly_limit_wc: number; current_month_spent_wc: number }>();

      if (budget && budget.current_month_spent_wc >= budget.monthly_limit_wc) {
        return {
          allowed: false,
          budgetScope: scope,
          budgetScopeId: scopeId,
          remaining: Math.max(0, budget.monthly_limit_wc - budget.current_month_spent_wc),
          limit: budget.monthly_limit_wc,
          spent: budget.current_month_spent_wc,
        };
      }
    }

    return { allowed: true };
  }

  async recordSpend(
    tenantId: string,
    userId: string,
    wakaCuAmount: number,
    teamId?: string,
    projectId?: string,
    workspaceId?: string,
  ): Promise<void> {
    if (!Number.isInteger(wakaCuAmount) || wakaCuAmount <= 0) return;

    const scopes: Array<{ scope: BudgetScope; scopeId: string }> = [
      { scope: 'user', scopeId: userId },
    ];
    if (teamId) scopes.push({ scope: 'team', scopeId: teamId });
    if (projectId) scopes.push({ scope: 'project', scopeId: projectId });
    if (workspaceId) scopes.push({ scope: 'workspace', scopeId: workspaceId });

    for (const { scope, scopeId } of scopes) {
      await this.db
        .prepare(
          `UPDATE ai_spend_budgets
           SET current_month_spent_wc = current_month_spent_wc + ?,
               updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
           WHERE tenant_id = ? AND scope = ? AND scope_id = ? AND is_active = 1`,
        )
        .bind(wakaCuAmount, tenantId, scope, scopeId)
        .run();
    }
  }

  async listBudgets(tenantId: string, scope?: BudgetScope): Promise<SpendBudget[]> {
    let sql = `SELECT id, tenant_id, scope, scope_id, monthly_limit_wc,
                      current_month_spent_wc, reset_at, is_active, created_at, updated_at
               FROM ai_spend_budgets WHERE tenant_id = ? AND is_active = 1`;
    const bindings: unknown[] = [tenantId];
    if (scope) {
      sql += ' AND scope = ?';
      bindings.push(scope);
    }
    sql += ' ORDER BY scope, created_at DESC';

    const { results } = await this.db
      .prepare(sql)
      .bind(...bindings)
      .all<{
        id: string; tenant_id: string; scope: string; scope_id: string;
        monthly_limit_wc: number; current_month_spent_wc: number;
        reset_at: string; is_active: number; created_at: string; updated_at: string;
      }>();

    return results.map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      scope: r.scope as BudgetScope,
      scopeId: r.scope_id,
      monthlyLimitWakaCu: r.monthly_limit_wc,
      currentMonthSpentWakaCu: r.current_month_spent_wc,
      resetAt: r.reset_at,
      isActive: r.is_active === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async deleteBudget(id: string, tenantId: string): Promise<boolean> {
    const result = await this.db
      .prepare(
        `UPDATE ai_spend_budgets SET is_active = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE id = ? AND tenant_id = ?`,
      )
      .bind(id, tenantId)
      .run();
    return (result.meta?.changes ?? 0) > 0;
  }

  async getBudget(id: string, tenantId: string): Promise<SpendBudget | null> {
    const r = await this.db
      .prepare(
        `SELECT id, tenant_id, scope, scope_id, monthly_limit_wc,
                current_month_spent_wc, reset_at, is_active, created_at, updated_at
         FROM ai_spend_budgets WHERE id = ? AND tenant_id = ?`,
      )
      .bind(id, tenantId)
      .first<{
        id: string; tenant_id: string; scope: string; scope_id: string;
        monthly_limit_wc: number; current_month_spent_wc: number;
        reset_at: string; is_active: number; created_at: string; updated_at: string;
      }>();

    if (!r) return null;
    return {
      id: r.id,
      tenantId: r.tenant_id,
      scope: r.scope as BudgetScope,
      scopeId: r.scope_id,
      monthlyLimitWakaCu: r.monthly_limit_wc,
      currentMonthSpentWakaCu: r.current_month_spent_wc,
      resetAt: r.reset_at,
      isActive: r.is_active === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async resetMonthlyBudgets(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const nextReset = this.nextMonthReset();

    const result = await this.db
      .prepare(
        `UPDATE ai_spend_budgets
         SET current_month_spent_wc = 0, reset_at = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
         WHERE is_active = 1 AND reset_at <= ?`,
      )
      .bind(nextReset, today)
      .run();

    return result.meta?.changes ?? 0;
  }

  private nextMonthReset(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0]!;
  }
}
