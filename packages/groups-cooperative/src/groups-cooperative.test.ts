/**
 * @webwaka/groups-cooperative — Repository unit tests (Phase 2, T005)
 * 8 tests: upsertCooperativeExtension, getCooperativeExtension, updateFundBalance, P9 guards.
 */

import { describe, it, expect } from 'vitest';
import {
  upsertCooperativeExtension,
  getCooperativeExtension,
  updateFundBalance,
} from './repository.js';

// ── In-memory mock DB ──────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function makeMockDb() {
  const extensions: Row[] = [];

  return {
    prepare(sql: string) {
      const lsql = sql.trim().toLowerCase();

      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (lsql.startsWith('insert into group_cooperative_extensions')) {
                const idx = extensions.findIndex(
                  (r) => r.group_id === args[0] && r.tenant_id === args[1],
                );
                const row: Row = {
                  group_id: args[0], tenant_id: args[1], workspace_id: args[2],
                  coop_type: args[3], cac_reg_number: args[4],
                  savings_goal_kobo: args[5], loan_fund_kobo: args[6],
                  shares_per_member_kobo: args[7], dividend_rate_bps: args[8],
                  state_code: args[9], lga_code: args[10],
                  created_at: args[11], updated_at: args[12],
                };
                if (idx >= 0) extensions[idx] = { ...extensions[idx], ...row };
                else extensions.push(row);
              } else if (lsql.startsWith('update group_cooperative_extensions')) {
                const [updatedAt, ...rest] = args as unknown[];
                const groupId = rest[rest.length - 2] as string;
                const tenantId = rest[rest.length - 1] as string;
                const idx = extensions.findIndex(
                  (r) => r.group_id === groupId && r.tenant_id === tenantId,
                );
                if (idx >= 0) {
                  if (lsql.includes('savings_goal_kobo')) {
                    extensions[idx]!.savings_goal_kobo = rest[0];
                  }
                  if (lsql.includes('loan_fund_kobo')) {
                    const loanIdx = rest.findIndex((_, i, arr) => {
                      return lsql.indexOf('loan_fund_kobo') !== -1;
                    });
                    extensions[idx]!.loan_fund_kobo = rest[lsql.includes('savings_goal_kobo') ? 1 : 0];
                  }
                  extensions[idx]!.updated_at = updatedAt;
                }
              }
              return { success: true };
            },
            async first<T>(): Promise<T | null> {
              if (lsql.includes('from group_cooperative_extensions')) {
                const [groupId, tenantId] = args as [string, string];
                return (extensions.find((r) => r.group_id === groupId && r.tenant_id === tenantId) ?? null) as T | null;
              }
              return null as T | null;
            },
          };
        },
        async first<T>(): Promise<T | null> { return null as T | null; },
      };
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

const TENANT = 'ten_coop';
const WS = 'ws_coop';
const GROUP = 'grp_coop';

describe('@webwaka/groups-cooperative — Repository', () => {

  describe('upsertCooperativeExtension', () => {
    it('CO01 — creates cooperative extension with savings type', async () => {
      const db = makeMockDb();
      const ext = await upsertCooperativeExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        coopType: 'savings', savingsGoalKobo: 10_000_000, loanFundKobo: 2_000_000,
        sharesPerMemberKobo: 500_000, dividendRateBps: 200, stateCode: 'OY',
      });
      expect(ext.coopType).toBe('savings');
      expect(ext.savingsGoalKobo).toBe(10_000_000);
      expect(ext.loanFundKobo).toBe(2_000_000);
      expect(ext.dividendRateBps).toBe(200);
    });

    it('CO02 — defaults coopType to savings when omitted', async () => {
      const db = makeMockDb();
      const ext = await upsertCooperativeExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
      });
      expect(ext.coopType).toBe('savings');
      expect(ext.savingsGoalKobo).toBe(0);
    });

    it('CO03 — rejects float savingsGoalKobo (P9)', async () => {
      const db = makeMockDb();
      await expect(upsertCooperativeExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        savingsGoalKobo: 500.5,
      })).rejects.toThrow('P9_VIOLATION');
    });

    it('CO04 — rejects negative loanFundKobo (P9)', async () => {
      const db = makeMockDb();
      await expect(upsertCooperativeExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        loanFundKobo: -1,
      })).rejects.toThrow('P9_VIOLATION');
    });
  });

  describe('getCooperativeExtension', () => {
    it('CO05 — returns null when no extension exists', async () => {
      const db = makeMockDb();
      const result = await getCooperativeExtension(db as any, 'grp_none', TENANT);
      expect(result).toBeNull();
    });

    it('CO06 — tenant isolation (T3): same group, different tenant returns null', async () => {
      const db = makeMockDb();
      await upsertCooperativeExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS, coopType: 'credit',
      });
      const result = await getCooperativeExtension(db as any, GROUP, 'ten_other');
      expect(result).toBeNull();
    });
  });

  describe('updateFundBalance', () => {
    it('CO07 — rejects float savingsGoalKobo in update (P9)', async () => {
      const db = makeMockDb();
      await upsertCooperativeExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS, coopType: 'multipurpose',
      });
      await expect(updateFundBalance(db as any, {
        groupId: GROUP, tenantId: TENANT, savingsGoalKobo: 12345.67,
      })).rejects.toThrow('P9_VIOLATION');
    });

    it('CO08 — rejects negative loanFundKobo in update (P9)', async () => {
      const db = makeMockDb();
      await upsertCooperativeExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS, coopType: 'multipurpose',
      });
      await expect(updateFundBalance(db as any, {
        groupId: GROUP, tenantId: TENANT, loanFundKobo: -500,
      })).rejects.toThrow('P9_VIOLATION');
    });
  });

});
