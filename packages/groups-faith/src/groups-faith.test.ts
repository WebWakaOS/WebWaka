/**
 * @webwaka/groups-faith — Repository unit tests (Phase 2, T005)
 * 8 tests: upsertFaithExtension, getFaithExtension, tenant isolation, defaults.
 */

import { describe, it, expect } from 'vitest';
import { upsertFaithExtension, getFaithExtension } from './repository.js';

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
              if (lsql.startsWith('insert into group_faith_extensions')) {
                const idx = extensions.findIndex(
                  (r) => r.group_id === args[0] && r.tenant_id === args[1],
                );
                const row: Row = {
                  group_id: args[0], tenant_id: args[1], workspace_id: args[2],
                  faith_tradition: args[3], denomination: args[4], tithe_bridge_enabled: args[5],
                  service_day: args[6], congregation_size: args[7], state_code: args[8],
                  lga_code: args[9], created_at: args[10], updated_at: args[11],
                };
                if (idx >= 0) extensions[idx] = { ...extensions[idx], ...row };
                else extensions.push(row);
              }
              return { success: true };
            },
            async first<T>(): Promise<T | null> {
              if (lsql.includes('from group_faith_extensions')) {
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

const TENANT = 'ten_faith';
const WS = 'ws_faith';
const GROUP = 'grp_faith';

describe('@webwaka/groups-faith — Repository', () => {

  describe('upsertFaithExtension', () => {
    it('FT01 — creates faith extension with Christianity tradition', async () => {
      const db = makeMockDb();
      const ext = await upsertFaithExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        faithTradition: 'christianity', denomination: 'Pentecostal',
        titheBridgeEnabled: true, serviceDay: 'sunday', congregationSize: 500,
        stateCode: 'LA',
      });
      expect(ext.faithTradition).toBe('christianity');
      expect(ext.denomination).toBe('Pentecostal');
      expect(ext.titheBridgeEnabled).toBe(true);
      expect(ext.serviceDay).toBe('sunday');
      expect(ext.congregationSize).toBe(500);
    });

    it('FT02 — creates faith extension with Islam tradition', async () => {
      const db = makeMockDb();
      const ext = await upsertFaithExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        faithTradition: 'islam', denomination: 'Sunni', serviceDay: 'friday',
      });
      expect(ext.faithTradition).toBe('islam');
      expect(ext.serviceDay).toBe('friday');
    });

    it('FT03 — titheBridgeEnabled defaults to false', async () => {
      const db = makeMockDb();
      const ext = await upsertFaithExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS, faithTradition: 'traditional',
      });
      expect(ext.titheBridgeEnabled).toBe(false);
    });

    it('FT04 — upsert overwrites denomination on same group+tenant', async () => {
      const db = makeMockDb();
      await upsertFaithExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        faithTradition: 'christianity', denomination: 'Baptist',
      });
      const updated = await upsertFaithExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        faithTradition: 'christianity', denomination: 'Methodist',
      });
      expect(updated.denomination).toBe('Methodist');
    });
  });

  describe('getFaithExtension', () => {
    it('FT05 — returns null when no extension exists', async () => {
      const db = makeMockDb();
      const result = await getFaithExtension(db as any, 'grp_none', TENANT);
      expect(result).toBeNull();
    });

    it('FT06 — returns correct extension for matching group+tenant', async () => {
      const db = makeMockDb();
      await upsertFaithExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        faithTradition: 'christianity', stateCode: 'KN',
      });
      const ext = await getFaithExtension(db as any, GROUP, TENANT);
      expect(ext).not.toBeNull();
      expect(ext?.stateCode).toBe('KN');
    });

    it('FT07 — tenant isolation (T3): same group, different tenant returns null', async () => {
      const db = makeMockDb();
      await upsertFaithExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS, faithTradition: 'islam',
      });
      const result = await getFaithExtension(db as any, GROUP, 'ten_other');
      expect(result).toBeNull();
    });

    it('FT08 — returns extension with correct workspace_id', async () => {
      const db = makeMockDb();
      await upsertFaithExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        faithTradition: 'other', lgaCode: 'IS',
      });
      const ext = await getFaithExtension(db as any, GROUP, TENANT);
      expect(ext?.workspaceId).toBe(WS);
      expect(ext?.lgaCode).toBe('IS');
    });
  });

});
