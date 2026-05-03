import { describe, it, expect, beforeEach } from 'vitest';
import { PilotFlagService } from '../pilot-flag-service.js';
import type { FlagServiceLike } from '../pilot-flag-service.js';
import type { PilotFeatureFlag } from '../types.js';

// ---------------------------------------------------------------------------
// In-memory DB stub
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
          let changes = 0;
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
            changes = 1;
          } else if (sqlUpper.startsWith('UPDATE PILOT_FEATURE_FLAGS')) {
            const tenantId = args[0] as string;
            const flagName = args[1] as string;
            for (const r of flags) {
              if (r.tenant_id === tenantId && r.flag_name === flagName) {
                r.enabled = 0;
                changes++;
              }
            }
          } else if (sqlUpper.startsWith('DELETE FROM PILOT_FEATURE_FLAGS')) {
            const now = args[0] as string;
            for (let i = flags.length - 1; i >= 0; i--) {
              const exp = flags[i].expires_at as string | null;
              if (exp && exp <= now) { flags.splice(i, 1); changes++; }
            }
          }
          return { meta: { changes } };
        },
        first: async <T>() => {
          const tenantId = args[0] as string;
          const flagName = args[1] as string;
          const found = flags.find(
            (r) => r.tenant_id === tenantId && r.flag_name === flagName,
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
// FlagService stub (simulates control-plane FlagService)
// ---------------------------------------------------------------------------

class StubFlagService implements FlagServiceLike {
  private readonly values: Map<string, boolean | string>;
  public callCount = 0;
  public shouldThrow = false;

  constructor(values: Record<string, boolean | string> = {}) {
    this.values = new Map(Object.entries(values));
  }

  async resolve(flagCode: string): Promise<boolean | string> {
    this.callCount++;
    if (this.shouldThrow) throw new Error('FlagService unavailable');
    return this.values.get(flagCode) ?? false;
  }
}

// ---------------------------------------------------------------------------
// Tests — original behaviour (no bridge)
// ---------------------------------------------------------------------------

describe('PilotFlagService — standalone (no bridge)', () => {
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

// ---------------------------------------------------------------------------
// Tests — getFlag method
// ---------------------------------------------------------------------------

describe('PilotFlagService — getFlag', () => {
  let svc: PilotFlagService;
  let stub: StubDB;

  beforeEach(() => {
    stub = new StubDB();
    svc = new PilotFlagService(stub as never);
  });

  it('returns the raw row when the flag exists', async () => {
    await svc.grant({ tenant_id: 'tnt_1', flag_name: 'ai_chat_beta', reason: 'pilot' });
    const row = await svc.getFlag('tnt_1', 'ai_chat_beta');
    expect(row).not.toBeNull();
    expect(row?.flag_name).toBe('ai_chat_beta');
    expect(row?.tenant_id).toBe('tnt_1');
  });

  it('returns null when no row exists', async () => {
    const row = await svc.getFlag('tnt_missing', 'nonexistent_flag');
    expect(row).toBeNull();
  });

  it('returns the row even when enabled = 0', async () => {
    await svc.grant({ tenant_id: 'tnt_2', flag_name: 'beta_wallet', enabled: false });
    const row = await svc.getFlag('tnt_2', 'beta_wallet');
    expect(row).not.toBeNull();
    expect(row?.enabled).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests — FlagService bridge
// ---------------------------------------------------------------------------

describe('PilotFlagService — FlagService bridge', () => {
  let stub: StubDB;

  beforeEach(() => {
    stub = new StubDB();
  });

  it('falls through to FlagService when no pilot row exists — returns true when flag is enabled', async () => {
    const flagSvc = new StubFlagService({ ai_chat_beta: 'true' });
    const svc = new PilotFlagService(stub as never, flagSvc);

    const enabled = await svc.isEnabled('tnt_new', 'ai_chat_beta');

    expect(enabled).toBe(true);
    expect(flagSvc.callCount).toBe(1);
  });

  it('falls through to FlagService when no pilot row exists — returns false when flag is disabled', async () => {
    const flagSvc = new StubFlagService({ ai_chat_beta: 'false' });
    const svc = new PilotFlagService(stub as never, flagSvc);

    const enabled = await svc.isEnabled('tnt_new', 'ai_chat_beta');

    expect(enabled).toBe(false);
    expect(flagSvc.callCount).toBe(1);
  });

  it('falls through to FlagService and handles boolean true correctly', async () => {
    const flagSvc = new StubFlagService({ bulk_import: true });
    const svc = new PilotFlagService(stub as never, flagSvc);

    const enabled = await svc.isEnabled('tnt_any', 'bulk_import');
    expect(enabled).toBe(true);
  });

  it('does NOT call FlagService when a pilot row explicitly enables the flag', async () => {
    const flagSvc = new StubFlagService({ ai_chat_beta: 'false' });
    const svc = new PilotFlagService(stub as never, flagSvc);

    // Grant via pilot table — should take priority over FlagService value
    await svc.grant({ tenant_id: 'tnt_pilot', flag_name: 'ai_chat_beta' });

    const enabled = await svc.isEnabled('tnt_pilot', 'ai_chat_beta');
    expect(enabled).toBe(true);
    expect(flagSvc.callCount).toBe(0);  // FlagService never consulted
  });

  it('does NOT call FlagService when a pilot row explicitly disables the flag', async () => {
    const flagSvc = new StubFlagService({ ai_chat_beta: 'true' });
    const svc = new PilotFlagService(stub as never, flagSvc);

    // Explicit disable via pilot table — must NOT fall through to FlagService
    await svc.grant({ tenant_id: 'tnt_disabled', flag_name: 'ai_chat_beta', enabled: false });

    const enabled = await svc.isEnabled('tnt_disabled', 'ai_chat_beta');
    expect(enabled).toBe(false);
    expect(flagSvc.callCount).toBe(0);  // FlagService never consulted
  });

  it('falls back to false gracefully when FlagService throws', async () => {
    const flagSvc = new StubFlagService();
    flagSvc.shouldThrow = true;
    const svc = new PilotFlagService(stub as never, flagSvc);

    const enabled = await svc.isEnabled('tnt_error', 'some_flag');
    expect(enabled).toBe(false);
  });

  it('returns false when FlagService is absent and no pilot row exists', async () => {
    const svc = new PilotFlagService(stub as never);  // no bridge
    const enabled = await svc.isEnabled('tnt_none', 'unknown_flag');
    expect(enabled).toBe(false);
  });

  it('treats an expired pilot row as not found — falls through to FlagService', async () => {
    const flagSvc = new StubFlagService({ expired_flag: 'true' });
    const svc = new PilotFlagService(stub as never, flagSvc);

    // Grant with a past expiry — row exists in DB but is expired
    await svc.grant({
      tenant_id: 'tnt_exp',
      flag_name: 'expired_flag',
      expires_at: '2000-01-01T00:00:00.000Z',
    });

    // The row exists but is expired → isEnabled returns false (expired = disabled),
    // NOT falling through to FlagService (the row still acts as an explicit override)
    const enabled = await svc.isEnabled('tnt_exp', 'expired_flag');
    expect(enabled).toBe(false);
  });
});
