/**
 * @webwaka/verticals-savings-group — SavingsGroupRepository tests (M9 scaffolded)
 * Acceptance: ≥10 tests covering FSM, P9, T3, members, contributions, payout cycles.
 * Nigerian Ajo / Esusu / Cooperative savings patterns.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SavingsGroupRepository } from './savings-group.js';
import {
  isValidSavingsGroupTransition,
  guardClaimedToCacRegistered,
  guardContributionAmountIsInteger,
  guardL2AiCap,
} from './types.js';

function makeDb() {
  const stores: Record<string, Record<string, unknown>[]> = {};
  const getStore = (sql: string): Record<string, unknown>[] => {
    const m = sql.match(/(?:INSERT INTO|UPDATE|SELECT\s.+?\sFROM|DELETE FROM)\s+(\w+)/i);
    const name = m?.[1] ?? 'default';
    if (!stores[name]) stores[name] = [];
    const store = stores[name];
    if (!store) throw new Error(`Store not found: ${name}`);
    return store;
  };

  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      run: async () => {
        const store = getStore(sql);
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const colM = sql.match(/\(([^)]+)\)\s+VALUES/i);
          const valM = sql.match(/VALUES\s*\(([^)]+)\)/i);
          if (colM && valM) {
            const cols = colM[1]!.split(',').map((c: string) => c.trim());
            const tokens = valM[1]!.split(',').map((v: string) => v.trim());
            const row: Record<string, unknown> = {};
            let bi = 0;
            cols.forEach((col: string, i: number) => {
              const tok = tokens[i] ?? '?';
              if (tok === '?') { row[col] = vals[bi++]; }
              else if (tok.toUpperCase() === 'NULL') { row[col] = null; }
              else if (tok.toLowerCase() === 'unixepoch()') { row[col] = Math.floor(Date.now() / 1000); }
              else if (tok.startsWith("'") && tok.endsWith("'")) { row[col] = tok.slice(1, -1); }
              else if (!Number.isNaN(Number(tok))) { row[col] = Number(tok); }
              else { row[col] = vals[bi++]; }
            });
            if (!row['status']) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            if (!row['updated_at']) row['updated_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.toLowerCase().startsWith('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              let bi = 0;
              clauses.forEach((clause: string) => {
                const eqIdx = clause.indexOf('=');
                const col = clause.slice(0, eqIdx).trim();
                const rhs = clause.slice(eqIdx + 1).trim();
                if (rhs === '?') {
                  (store[idx] as Record<string, unknown>)[col] = vals[bi++];
                } else if (rhs.startsWith("'") && rhs.endsWith("'")) {
                  (store[idx] as Record<string, unknown>)[col] = rhs.slice(1, -1);
                } else if (rhs.toLowerCase() !== 'unixepoch()' && !Number.isNaN(Number(rhs)) && rhs !== '') {
                  (store[idx] as Record<string, unknown>)[col] = Number(rhs);
                }
              });
              (store[idx] as Record<string, unknown>)['updated_at'] = Math.floor(Date.now() / 1000);
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        const store = getStore(sql);
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        // workspace_id lookup (findGroupByWorkspace etc.)
        if (sql.toLowerCase().includes('workspace_id=?') && !sql.toLowerCase().includes(' id=?')) {
          const found = store.find(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1]);
          return (found ?? null) as T;
        }
        if (vals.length >= 2) {
          const found = store.find(r => r['id'] === vals[0] && r['tenant_id'] === vals[1]);
          return (found ?? null) as T;
        }
        return (store[0] ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        const store = getStore(sql);
        const filtered = store.filter(r => {
          if (vals.length >= 2) {
            return (r['group_id'] === vals[0] || r['workspace_id'] === vals[0]) && r['tenant_id'] === vals[1];
          }
          return true;
        });
        return { results: filtered } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof SavingsGroupRepository>[0];
}

describe('SavingsGroupRepository — Core Invariants', () => {
  let repo: SavingsGroupRepository;
  beforeEach(() => { repo = new SavingsGroupRepository(makeDb() as never); });

  it('T001 — creates group with status seeded', async () => {
    const g = await repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'Victoria Island Ajo', contributionAmountKobo: 1000000 });
    expect(g.status).toBe('seeded');
    expect(g.groupName).toBe('Victoria Island Ajo');
  });

  it('T002 — contributionAmountKobo must be positive integer (P9)', async () => {
    await expect(repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'Bad Group', contributionAmountKobo: 1000.50 })).rejects.toThrow(/P9/);
    await expect(repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'Zero Group', contributionAmountKobo: 0 })).rejects.toThrow(/P9/);
  });

  it('T003 — tenant isolation: cross-tenant group hidden (T3)', async () => {
    const g = await repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'Isolated Group', contributionAmountKobo: 500000 });
    expect(await repo.findGroupById(g.id, 'tn-other')).toBeNull();
  });

  it('T004 — valid FSM transitions (ajo path)', () => {
    expect(isValidSavingsGroupTransition('seeded', 'claimed')).toBe(true);
    expect(isValidSavingsGroupTransition('claimed', 'cac_registered')).toBe(true);
    expect(isValidSavingsGroupTransition('cac_registered', 'active')).toBe(true);
    expect(isValidSavingsGroupTransition('active', 'suspended')).toBe(true);
    expect(isValidSavingsGroupTransition('suspended', 'active')).toBe(true);
  });

  it('T005 — invalid FSM: seeded→active (skips CAC)', () => {
    expect(isValidSavingsGroupTransition('seeded', 'active')).toBe(false);
  });

  it('T006 — guard CAC registered requires RC number', () => {
    expect(guardClaimedToCacRegistered({ cacRc: null }).allowed).toBe(false);
    expect(guardClaimedToCacRegistered({ cacRc: 'RC999888' }).allowed).toBe(true);
  });

  it('T007 — contribution amount guard rejects non-integer (P9)', () => {
    expect(guardContributionAmountIsInteger({ amountKobo: 1000.5 }).allowed).toBe(false);
    expect(guardContributionAmountIsInteger({ amountKobo: 1000000 }).allowed).toBe(true);
    expect(guardContributionAmountIsInteger({ amountKobo: 0 }).allowed).toBe(false);
  });

  it('T008 — AI L2 cap guard', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('T009 — adds member with opaque member_ref_id (P13)', async () => {
    const g = await repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'Test Group', contributionAmountKobo: 500000 });
    const member = await repo.addMember(g.id, 'tn1', { memberRefId: 'member-ref-opaque-123', role: 'member', payoutPosition: 1 });
    expect(member.memberRefId).toBe('member-ref-opaque-123');
    expect(member.role).toBe('member');
    expect(member.status).toBe('active');
  });

  it('T010 — records contribution with integer amountKobo (P9)', async () => {
    const g = await repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'Contrib Group', contributionAmountKobo: 1000000 });
    const contribution = await repo.recordContribution(g.id, 'tn1', {
      memberRefId: 'member-ref-001', amountKobo: 1000000,
      contributionDate: Math.floor(Date.now() / 1000), cycleNumber: 1,
    });
    expect(contribution.amountKobo).toBe(1000000);
    expect(Number.isInteger(contribution.amountKobo)).toBe(true);
    expect(contribution.verified).toBe(false);
  });

  it('T011 — rejects float amountKobo on contribution (P9)', async () => {
    const g = await repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'Float Group', contributionAmountKobo: 500000 });
    await expect(repo.recordContribution(g.id, 'tn1', {
      memberRefId: 'member-ref-002', amountKobo: 500000.50,
      contributionDate: Math.floor(Date.now() / 1000), cycleNumber: 1,
    })).rejects.toThrow(/P9/);
  });

  it('T012 — creates payout cycle with integer totalAmountKobo (P9)', async () => {
    const g = await repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'Payout Group', contributionAmountKobo: 1000000 });
    const payout = await repo.createPayoutCycle(g.id, 'tn1', {
      cycleNumber: 1, recipientRefId: 'recipient-ref-opaque', totalAmountKobo: 10000000,
      payoutDate: Math.floor(Date.now() / 1000) + 86400,
    });
    expect(payout.totalAmountKobo).toBe(10000000);
    expect(Number.isInteger(payout.totalAmountKobo)).toBe(true);
    expect(payout.status).toBe('pending');
  });

  it('T013 — listContributions returns tenant-scoped list', async () => {
    const g = await repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'List Group', contributionAmountKobo: 200000 });
    await repo.recordContribution(g.id, 'tn1', {
      memberRefId: 'member-ref-003', amountKobo: 200000,
      contributionDate: Math.floor(Date.now() / 1000), cycleNumber: 1,
    });
    const list = await repo.listContributions(g.id, 'tn1');
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it('T014 — all group types supported', async () => {
    for (const type of ['ajo', 'esusu', 'cooperative', 'thrift'] as const) {
      const g = await repo.createGroup({ workspaceId: `ws-${type}`, tenantId: 'tn1', groupName: `${type} Group`, groupType: type, contributionAmountKobo: 500000 });
      expect(g.groupType).toBe(type);
    }
  });

  it('T015 — transitionStatus updates group FSM', async () => {
    const g = await repo.createGroup({ workspaceId: 'ws1', tenantId: 'tn1', groupName: 'FSM Group', contributionAmountKobo: 1000000 });
    const updated = await repo.transitionStatus(g.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
