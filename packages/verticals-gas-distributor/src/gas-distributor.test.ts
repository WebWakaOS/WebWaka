/**
 * @webwaka/verticals-gas-distributor — GasDistributorRepository tests (M9 scaffolded)
 * Acceptance: ≥10 tests covering FSM, P9, T3, inventory, orders, safety logs.
 * CRITICAL (P9): cylinder sizes in INTEGER GRAMS — never float kg
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GasDistributorRepository } from './gas-distributor.js';
import {
  isValidGasDistributorTransition,
  guardNoCylinderSizeFloat,
  guardL2AiCap,
  VALID_CYLINDER_SIZES_GRAMS,
} from './types.js';

function makeDb() {
  const stores: Record<string, Record<string, unknown>[]> = {};
  const getStore = (sql: string): Record<string, unknown>[] => {
    const m = sql.match(/(?:INSERT INTO|UPDATE|SELECT\s.+?\sFROM|DELETE FROM)\s+(\w+)/i);
    const name = m?.[1] ?? 'default';
    if (!stores[name]) stores[name] = [];
    return stores[name]!;
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
            return (r['profile_id'] === vals[0] || r['workspace_id'] === vals[0]) && r['tenant_id'] === vals[1];
          }
          return true;
        });
        return { results: filtered } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof GasDistributorRepository>[0];
}

describe('GasDistributorRepository — Core Invariants', () => {
  let repo: GasDistributorRepository;
  beforeEach(() => { repo = new GasDistributorRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'LPG Express' });
    expect(p.status).toBe('seeded');
    expect(p.businessName).toBe('LPG Express');
  });

  it('T002 — tenant isolation: cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Isolated Gas' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — valid cylinder sizes are integer grams (CRITICAL P9 invariant)', () => {
    for (const size of VALID_CYLINDER_SIZES_GRAMS) {
      expect(Number.isInteger(size)).toBe(true);
      const guard = guardNoCylinderSizeFloat({ cylinderSizeGrams: size });
      expect(guard.allowed).toBe(true);
    }
  });

  it('T004 — float cylinder size is REJECTED (CRITICAL P9)', () => {
    expect(guardNoCylinderSizeFloat({ cylinderSizeGrams: 12.5 }).allowed).toBe(false);
    expect(guardNoCylinderSizeFloat({ cylinderSizeGrams: 3000 }).allowed).toBe(true);
  });

  it('T005 — valid FSM transitions', () => {
    expect(isValidGasDistributorTransition('seeded', 'claimed')).toBe(true);
    expect(isValidGasDistributorTransition('claimed', 'dpr_verified')).toBe(true);
    expect(isValidGasDistributorTransition('dpr_verified', 'active')).toBe(true);
    expect(isValidGasDistributorTransition('active', 'suspended')).toBe(true);
    expect(isValidGasDistributorTransition('suspended', 'active')).toBe(true);
  });

  it('T006 — invalid FSM: seeded→active (skips DPR step)', () => {
    expect(isValidGasDistributorTransition('seeded', 'active')).toBe(false);
  });

  it('T007 — AI L2 cap guard', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('T008 — adds inventory with integer refill_price_kobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'P9 Gas Co' });
    const inv = await repo.addInventory(p.id, 'tn1', {
      cylinderSizeGrams: 12500, stockCount: 20, refillPriceKobo: 750000, bulkPriceKobo: 650000,
    });
    expect(inv.refillPriceKobo).toBe(750000);
    expect(Number.isInteger(inv.refillPriceKobo)).toBe(true);
  });

  it('T009 — creates gas order with integer total_kobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Order Gas Co' });
    const order = await repo.createOrder(p.id, 'tn1', {
      customerRefId: 'cust-opaque-001', cylinderSizeGrams: 12500, quantity: 2,
      unitPriceKobo: 750000, totalKobo: 1500000, orderDate: Math.floor(Date.now() / 1000),
    });
    expect(order.totalKobo).toBe(1500000);
    expect(order.status).toBe('pending');
  });

  it('T010 — creates safety log for DPR compliance', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Safety Gas Co' });
    const log = await repo.createSafetyLog(p.id, 'tn1', {
      inspectionDate: Math.floor(Date.now() / 1000), cylindersInspected: 50, passed: true, notes: 'All clear',
    });
    expect(log.passed).toBe(true);
    expect(log.cylindersInspected).toBe(50);
  });

  it('T011 — rejects float total_kobo on order (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Float Gas' });
    await expect(repo.createOrder(p.id, 'tn1', {
      customerRefId: 'cust-002', cylinderSizeGrams: 12500, quantity: 1,
      unitPriceKobo: 750000, totalKobo: 750000.50, orderDate: Math.floor(Date.now() / 1000),
    })).rejects.toThrow(/integer/i);
  });

  it('T012 — listOrders returns tenant-scoped list', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'List Gas Co' });
    await repo.createOrder(p.id, 'tn1', {
      customerRefId: 'cust-003', cylinderSizeGrams: 3000, quantity: 5,
      unitPriceKobo: 500000, totalKobo: 2500000, orderDate: Math.floor(Date.now() / 1000),
    });
    const orders = await repo.listOrders(p.id, 'tn1');
    expect(orders.length).toBeGreaterThanOrEqual(1);
  });

  it('T013 — transitionStatus updates profile (DPR verification)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'DPR Gas Co' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});
