import { describe, it, expect, beforeEach } from 'vitest';
import { PilotFlagService } from '../pilot-flag-service.js';
import type { PilotFeatureFlag } from '../types.js';

// ---------------------------------------------------------------------------
// In-memory stub
// ---------------------------------------------------------------------------

type Row = Record<string, unknown>;

class StubDB {
  public flags: Row[] = [];

  prepare(sql: string) {
    const flags = this.flags;
    const sqlUpper = sql.trim().toUpperCase();

    return {
      bind: (...args: unknown[]) => ({
        run: async () => {
          if (sqlUpper.startsWith('INSERT INTO PILOT_FEATURE_FLAGS')) {
            const tenantId = args[1] as string;
            const flagName = args[2] as string;
            const existing = flags.findIndex(
              (r) => r.tenant_id === tenantId && r.flag_name === flagName,
            );
            const row: Row = {
              id: args[0],
              tenant_id: tenantId,
              flag_name: flagName,
              enabled: args[3],
              expires_at: args[4],
              reason: args[5],
              granted_by: args[6],
              created_at: args[7],
            };
            if (existing >= 0) {
              flags[existing] = { ...flags[existing], ...row };
            } else {
              flags.push(row);
            }
          } else if (sqlUpper.startsWith('UPDATE PILOT_FEATURE_FLAGS')) {
            const tenantId = args[1] as string;
            const flagName = args[2] as string;
            for (const r of flags) {
              if (r.tenant_id === tenantId && r.flag_name === flagName) {
                r.enabled = 0;
              }
            }
          } else if (sqlUpper.startsWith('DELETE FROM PILOT_FEATURE_FLAGS')) {
            const now = args[0] as string;
            for (let i = flags.length - 1; i >= 0; i--) {
              const exp = flags[i].expires_at as string | null;
              if (exp && exp <= now) flags.splice(i, 1);
            }
          }
          return { meta: { changes: 1 } };
        },
        first: async <T>() => {
          const tenantId = args[0] as string;
          const flagName = args[1] as string;
          const now = args[2] as string;
          const found = flags.find(
            (r) =>
              r.tenant_id === tenantId &&
              r.flag_name === flagName &&
              (r.expires_at == null || (r.expires_at as string) > now),
          );
          return (found ?? null) as T | null;
        },
        all: async <T>() => {
          const val = args[0] as string;
          const now = args[1] as string | undefined;
          const results = flags.filter((r) => {
            const matchTenant = !now && r.tenant_id === val;
            const matchFlag =
              now && r.flag_name === val && r.enabled === 1 &&
              (r.expires_at == null || (r.expires_at as string) > now);
            return matchTenant || matchFlag;
          });
          return { results: results as T[] };
        },
      }),
    };
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PilotFlagService', () => {
  let svc: PilotFlagService;
  let stub: StubDB;

  beforeEach(() => {
    stub = new StubDB();
    svc = new PilotFlagService(stub as never);
  });

  it('grants a flag and reports it as enabled', async () => {
    await svc.grant({ tenant_id: 'tenant_a', flag_name: 'ai_chat_beta', reason: 'cohort_1' });
    const enabled = await svc.isEnabled('tenant_a', 'ai_chat_beta');
    expect(enabled).toBe(true);
  });

  it('revokes a flag and reports it as disabled', async () => {
    await svc.grant({ tenant_id: 'tenant_b', flag_name: 'new_pos_receipt' });
    await svc.revoke('tenant_b', 'new_pos_receipt');
    // After revoke, enabled = 0
    const flag = stub.flags.find(
      (f) => f.tenant_id === 'tenant_b' && f.flag_name === 'new_pos_receipt',
    );
    expect(flag?.enabled).toBe(0);
  });

  it('returns false for a flag that was never granted', async () => {
    const enabled = await svc.isEnabled('tenant_c', 'superagent_proactive');
    expect(enabled).toBe(false);
  });

  it('grants a disabled flag when enabled=false is passed', async () => {
    await svc.grant({ tenant_id: 'tenant_d', flag_name: 'beta_wallet', enabled: false });
    const flag = stub.flags.find(
      (f) => f.tenant_id === 'tenant_d' && f.flag_name === 'beta_wallet',
    );
    expect(flag?.enabled).toBe(0);
  });

  it('upserts an existing flag without creating duplicates', async () => {
    await svc.grant({ tenant_id: 'tenant_e', flag_name: 'ai_chat_beta' });
    await svc.grant({ tenant_id: 'tenant_e', flag_name: 'ai_chat_beta', reason: 'updated' });
    const matching = stub.flags.filter(
      (f) => f.tenant_id === 'tenant_e' && f.flag_name === 'ai_chat_beta',
    );
    expect(matching).toHaveLength(1);
    expect(matching[0].reason).toBe('updated');
  });

  it('stores reason and granted_by metadata', async () => {
    await svc.grant({
      tenant_id: 'tenant_f',
      flag_name: 'ai_chat_beta',
      reason: 'Pilot cohort 1 — restaurant vertical',
      granted_by: 'admin_user_001',
    });
    const flag = stub.flags.find(
      (f) => f.tenant_id === 'tenant_f' && f.flag_name === 'ai_chat_beta',
    ) as PilotFeatureFlag | undefined;
    expect(flag?.reason).toBe('Pilot cohort 1 — restaurant vertical');
    expect(flag?.granted_by).toBe('admin_user_001');
  });

  it('pruneExpired removes no rows when nothing has expired', async () => {
    await svc.grant({
      tenant_id: 'tenant_g',
      flag_name: 'some_flag',
      expires_at: '2099-12-31T23:59:59.000Z',
    });
    const removed = await svc.pruneExpired();
    expect(removed).toBe(0);
    expect(stub.flags).toHaveLength(1);
  });
});
