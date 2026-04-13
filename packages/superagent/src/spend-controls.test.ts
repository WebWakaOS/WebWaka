import { describe, it, expect, vi } from 'vitest';
import { SpendControls } from './spend-controls.js';

function makeMockDB(overrides: Record<string, { first?: unknown; results?: unknown[]; run?: { success: boolean; meta?: { changes?: number } } }> = {}) {
  return {
    prepare: vi.fn().mockImplementation((sql: string) => {
      const match = Object.entries(overrides).find(([k]) => sql.includes(k));
      const val = match?.[1] ?? { first: null, results: [], run: { success: true } };
      return {
        bind: vi.fn().mockReturnValue({
          run: vi.fn().mockResolvedValue(val.run ?? { success: true }),
          first: vi.fn().mockResolvedValue(val.first ?? null),
          all: vi.fn().mockResolvedValue({ results: val.results ?? [] }),
        }),
      };
    }),
  };
}

describe('SpendControls', () => {
  describe('setBudget', () => {
    it('creates a new budget', async () => {
      const db = makeMockDB();
      const ctrl = new SpendControls({ db: db as never });

      const budget = await ctrl.setBudget({
        tenantId: 't1',
        scope: 'user',
        scopeId: 'u1',
        monthlyLimitWakaCu: 500,
      });

      expect(budget.tenantId).toBe('t1');
      expect(budget.scope).toBe('user');
      expect(budget.monthlyLimitWakaCu).toBe(500);
      expect(budget.currentMonthSpentWakaCu).toBe(0);
    });

    it('throws on non-integer limit', async () => {
      const db = makeMockDB();
      const ctrl = new SpendControls({ db: db as never });

      await expect(
        ctrl.setBudget({ tenantId: 't1', scope: 'user', scopeId: 'u1', monthlyLimitWakaCu: 1.5 }),
      ).rejects.toThrow('non-negative integer');
    });

    it('throws on negative limit', async () => {
      const db = makeMockDB();
      const ctrl = new SpendControls({ db: db as never });

      await expect(
        ctrl.setBudget({ tenantId: 't1', scope: 'team', scopeId: 'team1', monthlyLimitWakaCu: -10 }),
      ).rejects.toThrow('non-negative integer');
    });

    it('allows zero limit (disables budget)', async () => {
      const db = makeMockDB();
      const ctrl = new SpendControls({ db: db as never });

      const budget = await ctrl.setBudget({
        tenantId: 't1',
        scope: 'workspace',
        scopeId: 'ws1',
        monthlyLimitWakaCu: 0,
      });

      expect(budget.monthlyLimitWakaCu).toBe(0);
    });

    it('updates existing active budget', async () => {
      const db = makeMockDB({
        'SELECT id FROM ai_spend_budgets': { first: { id: 'existing-id' } },
        'SELECT id, tenant_id': {
          first: {
            id: 'existing-id', tenant_id: 't1', scope: 'user', scope_id: 'u1',
            monthly_limit_wc: 1000, current_month_spent_wc: 50,
            reset_at: '2026-05-01', is_active: 1,
            created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-11T00:00:00Z',
          },
        },
      });
      const ctrl = new SpendControls({ db: db as never });

      const budget = await ctrl.setBudget({
        tenantId: 't1',
        scope: 'user',
        scopeId: 'u1',
        monthlyLimitWakaCu: 1000,
      });

      expect(budget.id).toBe('existing-id');
    });
  });

  describe('checkBudget', () => {
    it('allows when no budget exists', async () => {
      const db = makeMockDB();
      const ctrl = new SpendControls({ db: db as never });

      const result = await ctrl.checkBudget('t1', 'u1');
      expect(result.allowed).toBe(true);
    });

    it('blocks when user budget exceeded', async () => {
      const db = makeMockDB({
        'SELECT id, monthly_limit_wc': {
          first: { id: 'b1', monthly_limit_wc: 100, current_month_spent_wc: 100 },
        },
      });
      const ctrl = new SpendControls({ db: db as never });

      const result = await ctrl.checkBudget('t1', 'u1');
      expect(result.allowed).toBe(false);
      expect(result.budgetScope).toBe('user');
      expect(result.remaining).toBe(0);
    });

    it('blocks when team budget exceeded', async () => {
      const callCount = { n: 0 };
      const db = {
        prepare: vi.fn().mockImplementation(() => ({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockImplementation(() => {
              callCount.n++;
              if (callCount.n === 1) return Promise.resolve(null);
              return Promise.resolve({ id: 'b2', monthly_limit_wc: 200, current_month_spent_wc: 200 });
            }),
          }),
        })),
      };
      const ctrl = new SpendControls({ db: db as never });

      const result = await ctrl.checkBudget('t1', 'u1', 'team1');
      expect(result.allowed).toBe(false);
      expect(result.budgetScope).toBe('team');
    });
  });

  describe('recordSpend', () => {
    it('updates spend for all scopes', async () => {
      const db = makeMockDB();
      const ctrl = new SpendControls({ db: db as never });

      await ctrl.recordSpend('t1', 'u1', 10, 'team1', 'proj1');
      expect(db.prepare).toHaveBeenCalledTimes(3);
    });

    it('ignores non-positive amounts', async () => {
      const db = makeMockDB();
      const ctrl = new SpendControls({ db: db as never });

      await ctrl.recordSpend('t1', 'u1', 0);
      expect(db.prepare).not.toHaveBeenCalled();
    });

    it('ignores non-integer amounts', async () => {
      const db = makeMockDB();
      const ctrl = new SpendControls({ db: db as never });

      await ctrl.recordSpend('t1', 'u1', 1.5);
      expect(db.prepare).not.toHaveBeenCalled();
    });
  });

  describe('deleteBudget', () => {
    it('deactivates a budget', async () => {
      const db = makeMockDB({
        'UPDATE ai_spend_budgets': { run: { success: true, meta: { changes: 1 } } },
      });
      const ctrl = new SpendControls({ db: db as never });

      const deleted = await ctrl.deleteBudget('b1', 't1');
      expect(deleted).toBe(true);
    });

    it('returns false if not found', async () => {
      const db = makeMockDB({
        'UPDATE ai_spend_budgets': { run: { success: true, meta: { changes: 0 } } },
      });
      const ctrl = new SpendControls({ db: db as never });

      const deleted = await ctrl.deleteBudget('missing', 't1');
      expect(deleted).toBe(false);
    });
  });

  describe('checkBudget — workspace scope', () => {
    it('checks workspace budget when workspaceId provided', async () => {
      const callCount = { n: 0 };
      const db = {
        prepare: vi.fn().mockImplementation(() => ({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockImplementation(() => {
              callCount.n++;
              if (callCount.n === 1) return Promise.resolve(null);
              return Promise.resolve({ id: 'bw', monthly_limit_wc: 1000, current_month_spent_wc: 1000 });
            }),
          }),
        })),
      };
      const ctrl = new SpendControls({ db: db as never });

      const result = await ctrl.checkBudget('t1', 'u1', undefined, undefined, 'ws1');
      expect(result.allowed).toBe(false);
      expect(result.budgetScope).toBe('workspace');
    });

    it('records spend against workspace scope', async () => {
      const db = makeMockDB({
        'UPDATE ai_spend_budgets': { run: { success: true } },
      });
      const ctrl = new SpendControls({ db: db as never });

      await ctrl.recordSpend('t1', 'u1', 100, undefined, undefined, 'ws1');
      const calls = (db.prepare as ReturnType<typeof vi.fn>).mock.calls;
      const scopes = calls.map((c: string[]) => c[0] ?? '').filter((s: string) => s.includes('UPDATE'));
      expect(scopes.length).toBe(2);
    });

    it('allows when workspace budget has remaining', async () => {
      const callCount = { n: 0 };
      const db = {
        prepare: vi.fn().mockImplementation(() => ({
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockImplementation(() => {
              callCount.n++;
              if (callCount.n === 1) return Promise.resolve(null);
              return Promise.resolve({ id: 'bw', monthly_limit_wc: 1000, current_month_spent_wc: 500 });
            }),
          }),
        })),
      };
      const ctrl = new SpendControls({ db: db as never });

      const result = await ctrl.checkBudget('t1', 'u1', undefined, undefined, 'ws1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('listBudgets — active filter', () => {
    it('only returns active budgets', async () => {
      const db = makeMockDB({
        'SELECT id, tenant_id': {
          results: [{
            id: 'b1', tenant_id: 't1', scope: 'user', scope_id: 'u1',
            monthly_limit_wc: 500, current_month_spent_wc: 100,
            reset_at: '2026-05-01', is_active: 1,
            created_at: '2026-04-01', updated_at: '2026-04-11',
          }],
        },
      });
      const ctrl = new SpendControls({ db: db as never });
      const budgets = await ctrl.listBudgets('t1');
      const sql = (db.prepare as ReturnType<typeof vi.fn>).mock.calls[0]![0] as string;
      expect(sql).toContain('is_active = 1');
      expect(budgets).toHaveLength(1);
    });
  });

  describe('resetMonthlyBudgets', () => {
    it('resets expired budgets', async () => {
      const db = makeMockDB({
        'UPDATE ai_spend_budgets': { run: { success: true, meta: { changes: 5 } } },
      });
      const ctrl = new SpendControls({ db: db as never });

      const count = await ctrl.resetMonthlyBudgets();
      expect(count).toBe(5);
    });
  });
});
