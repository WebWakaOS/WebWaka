/**
 * @webwaka/groups-civic — Repository unit tests (Phase 2, T005)
 * 8 tests: upsertCivicExtension, getCivicExtension, addBeneficiary (P10), listBeneficiaries, getBeneficiaryCount.
 */

import { describe, it, expect } from 'vitest';
import {
  upsertCivicExtension,
  getCivicExtension,
  addBeneficiary,
  listBeneficiaries,
  getBeneficiaryCount,
} from './repository.js';

// ── In-memory mock DB ──────────────────────────────────────────────────────

type Row = Record<string, unknown>;

function makeMockDb() {
  const extensions: Row[] = [];
  const beneficiaries: Row[] = [];

  return {
    prepare(sql: string) {
      const lsql = sql.trim().toLowerCase();

      return {
        bind(...args: unknown[]) {
          return {
            async run() {
              if (lsql.startsWith('insert into group_civic_extensions')) {
                const existing = extensions.findIndex(
                  (r) => r.group_id === args[0] && r.tenant_id === args[1],
                );
                const row: Row = {
                  group_id: args[0], tenant_id: args[1], workspace_id: args[2],
                  ngo_reg_number: args[3], ngo_reg_body: args[4], beneficiary_tracking: args[5],
                  focus_area: args[6], state_code: args[7], lga_code: args[8],
                  created_at: args[9], updated_at: args[10],
                };
                if (existing >= 0) {
                  extensions[existing] = { ...extensions[existing], ...row };
                } else {
                  extensions.push(row);
                }
              } else if (lsql.startsWith('insert into group_civic_beneficiaries')) {
                beneficiaries.push({
                  id: args[0], tenant_id: args[1], group_id: args[2], workspace_id: args[3],
                  display_name: args[4], category: args[5], state_code: args[6],
                  lga_code: args[7], ward_code: args[8], ndpr_consented: args[9],
                  status: args[10], enrolled_at: args[11], exited_at: args[12], notes: args[13],
                });
              }
              return { success: true };
            },
            async first<T>(): Promise<T | null> {
              if (lsql.includes('from group_civic_extensions')) {
                const [groupId, tenantId] = args as [string, string];
                return (extensions.find((r) => r.group_id === groupId && r.tenant_id === tenantId) ?? null) as T | null;
              }
              if (lsql.includes('from group_civic_beneficiaries where id')) {
                const [id, tenantId] = args as [string, string];
                return (beneficiaries.find((r) => r.id === id && r.tenant_id === tenantId) ?? null) as T | null;
              }
              if (lsql.includes('count(*) as cnt')) {
                const [tenantId, groupId] = args as [string, string];
                const cnt = beneficiaries.filter(
                  (r) => r.tenant_id === tenantId && r.group_id === groupId && r.status === 'active',
                ).length;
                return { cnt } as T;
              }
              return null as T | null;
            },
            async all<T>(): Promise<{ results: T[] }> {
              if (lsql.includes('from group_civic_beneficiaries') && lsql.includes('group_id')) {
                const [tenantId, groupId] = args as [string, string];
                const results = beneficiaries.filter(
                  (r) => r.tenant_id === tenantId && r.group_id === groupId && r.status === 'active',
                );
                return { results: results as T[] };
              }
              return { results: [] };
            },
          };
        },
        async first<T>(): Promise<T | null> { return null as T | null; },
        all<T>() { return Promise.resolve({ results: [] as T[] }); },
      };
    },
  };
}

// ── Tests ──────────────────────────────────────────────────────────────────

const TENANT = 'ten_civic';
const WS = 'ws_civic';
const GROUP = 'grp_civic';

describe('@webwaka/groups-civic — Repository', () => {

  describe('upsertCivicExtension', () => {
    it('CV01 — creates civic extension with required fields', async () => {
      const db = makeMockDb();
      const ext = await upsertCivicExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS,
        ngoRegNumber: 'RC12345', ngoRegBody: 'CAC', beneficiaryTracking: true,
        focusArea: 'advocacy', stateCode: 'LA', lgaCode: 'IS',
      });
      expect(ext.groupId).toBe(GROUP);
      expect(ext.tenantId).toBe(TENANT);
      expect(ext.ngoRegNumber).toBe('RC12345');
      expect(ext.beneficiaryTracking).toBe(true);
    });

    it('CV02 — upsert overwrites existing extension', async () => {
      const db = makeMockDb();
      await upsertCivicExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS, focusArea: 'health',
      });
      const updated = await upsertCivicExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS, focusArea: 'education',
      });
      expect(updated.focusArea).toBe('education');
    });
  });

  describe('getCivicExtension', () => {
    it('CV03 — returns null when no extension exists', async () => {
      const db = makeMockDb();
      const result = await getCivicExtension(db as any, 'grp_none', TENANT);
      expect(result).toBeNull();
    });

    it('CV04 — returns extension with correct tenant isolation (T3)', async () => {
      const db = makeMockDb();
      await upsertCivicExtension(db as any, {
        groupId: GROUP, tenantId: TENANT, workspaceId: WS, stateCode: 'KN',
      });
      const other = await getCivicExtension(db as any, GROUP, 'ten_other');
      expect(other).toBeNull();
    });
  });

  describe('addBeneficiary', () => {
    it('CV05 — adds beneficiary with ndprConsented=true', async () => {
      const db = makeMockDb();
      const bene = await addBeneficiary(db as any, {
        tenantId: TENANT, groupId: GROUP, workspaceId: WS,
        displayName: 'Amaka Obi', ndprConsented: true,
        category: 'youth', stateCode: 'AN',
      });
      expect(bene.displayName).toBe('Amaka Obi');
      expect(bene.ndprConsented).toBe(true);
      expect(bene.status).toBe('active');
    });

    it('CV06 — rejects beneficiary without NDPR consent (P10)', async () => {
      const db = makeMockDb();
      await expect(addBeneficiary(db as any, {
        tenantId: TENANT, groupId: GROUP, workspaceId: WS,
        displayName: 'Chidi Eze', ndprConsented: false,
      })).rejects.toThrow('P10_VIOLATION');
    });
  });

  describe('listBeneficiaries + getBeneficiaryCount', () => {
    it('CV07 — listBeneficiaries returns active beneficiaries for group', async () => {
      const db = makeMockDb();
      await addBeneficiary(db as any, {
        tenantId: TENANT, groupId: GROUP, workspaceId: WS,
        displayName: 'Person A', ndprConsented: true,
      });
      await addBeneficiary(db as any, {
        tenantId: TENANT, groupId: GROUP, workspaceId: WS,
        displayName: 'Person B', ndprConsented: true,
      });
      const list = await listBeneficiaries(db as any, TENANT, GROUP);
      expect(list).toHaveLength(2);
    });

    it('CV08 — getBeneficiaryCount matches active beneficiary count', async () => {
      const db = makeMockDb();
      await addBeneficiary(db as any, {
        tenantId: TENANT, groupId: GROUP, workspaceId: WS,
        displayName: 'Counted Person', ndprConsented: true,
      });
      const count = await getBeneficiaryCount(db as any, TENANT, GROUP);
      expect(count).toBe(1);
    });
  });

});
