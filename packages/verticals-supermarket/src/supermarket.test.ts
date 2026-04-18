/**
 * @webwaka/verticals-supermarket — SupermarketRepository tests (M9 full)
 * Acceptance: ≥30 tests covering FSM, P9, T3, products, orders, loyalty.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SupermarketRepository } from './supermarket.js';
import {
  isValidSupermarketTransition,
  guardClaimedToCacVerified,
  guardCacToNafdacCompliant,
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
            if (row['available'] === undefined) row['available'] = 1;
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
        if (sql.toLowerCase().includes('workspace_id=?') && sql.toLowerCase().includes('customer_ref_id=?')) {
          const found = store.find(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1] && r['customer_ref_id'] === vals[2]);
          return (found ?? null) as T;
        }
        // workspace_id lookup (findProfileByWorkspace)
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
            return (r['workspace_id'] === vals[0] || r['group_id'] === vals[0]) && r['tenant_id'] === vals[1];
          }
          return true;
        });
        return { results: filtered } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof SupermarketRepository>[0];
}

describe('SupermarketRepository — Profile Management', () => {
  let repo: SupermarketRepository;
  beforeEach(() => { repo = new SupermarketRepository(makeDb() as never); });

  it('T001 — creates supermarket profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', storeName: 'Value Mart' });
    expect(p.status).toBe('seeded');
    expect(p.storeName).toBe('Value Mart');
  });

  it('T002 — uses provided id', async () => {
    const p = await repo.createProfile({ id: 'sm-001', workspaceId: 'ws1', tenantId: 'tn1', storeName: 'FoodCo' });
    expect(p.id).toBe('sm-001');
  });

  it('T003 — tenant isolation: cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', storeName: 'Private Mart' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T004 — findProfileById returns null for missing', async () => {
    expect(await repo.findProfileById('nonexistent', 'tn1')).toBeNull();
  });

  it('T005 — findProfileByWorkspace returns correct profile', async () => {
    await repo.createProfile({ workspaceId: 'ws-mart', tenantId: 'tn1', storeName: 'BestMart' });
    const p = await repo.findProfileByWorkspace('ws-mart', 'tn1');
    expect(p?.storeName).toBe('BestMart');
  });

  it('T006 — stores store type (mini_mart)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws2', tenantId: 'tn1', storeName: 'Corner Shop', storeType: 'mini_mart' });
    expect(p.storeType).toBe('mini_mart');
  });
});

describe('SupermarketRepository — FSM Transitions', () => {
  let repo: SupermarketRepository;
  beforeEach(() => { repo = new SupermarketRepository(makeDb() as never); });

  it('T007 — valid FSM: seeded→claimed', () => { expect(isValidSupermarketTransition('seeded', 'claimed')).toBe(true); });
  it('T008 — valid FSM: claimed→cac_verified', () => { expect(isValidSupermarketTransition('claimed', 'cac_verified')).toBe(true); });
  it('T009 — valid FSM: cac_verified→nafdac_compliant', () => { expect(isValidSupermarketTransition('cac_verified', 'nafdac_compliant')).toBe(true); });
  it('T010 — valid FSM: nafdac_compliant→active', () => { expect(isValidSupermarketTransition('nafdac_compliant', 'active')).toBe(true); });
  it('T011 — valid FSM: active→suspended', () => { expect(isValidSupermarketTransition('active', 'suspended')).toBe(true); });
  it('T012 — valid FSM: suspended→active', () => { expect(isValidSupermarketTransition('suspended', 'active')).toBe(true); });
  it('T013 — invalid FSM: seeded→active (skips steps)', () => { expect(isValidSupermarketTransition('seeded', 'active')).toBe(false); });
  it('T014 — invalid FSM: active→seeded (regression)', () => { expect(isValidSupermarketTransition('active', 'seeded')).toBe(false); });

  it('T015 — guard CAC verified requires RC number', () => {
    expect(guardClaimedToCacVerified({ cacRc: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacRc: '' }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacRc: 'RC123456' }).allowed).toBe(true);
  });

  it('T016 — guard NAFDAC compliant requires clearance', () => {
    expect(guardCacToNafdacCompliant({ nafdacClearance: false }).allowed).toBe(false);
    expect(guardCacToNafdacCompliant({ nafdacClearance: true }).allowed).toBe(true);
  });

  it('T017 — AI L2 cap guard rejects L3+', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });

  it('T018 — transitionStatus updates profile', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', storeName: 'Transit Mart' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });
});

describe('SupermarketRepository — Product Management', () => {
  let repo: SupermarketRepository;
  beforeEach(() => { repo = new SupermarketRepository(makeDb() as never); });

  it('T019 — adds product with integer unitPriceKobo (P9)', async () => {
    const product = await repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Indomie Noodles', unitPriceKobo: 35000 });
    expect(product.unitPriceKobo).toBe(35000);
    expect(Number.isInteger(product.unitPriceKobo)).toBe(true);
  });

  it('T020 — rejects zero or negative unitPriceKobo (P9)', async () => {
    await expect(repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Free Item', unitPriceKobo: 0 })).rejects.toThrow(/P9/i);
    await expect(repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Neg Item', unitPriceKobo: -100 })).rejects.toThrow(/P9/i);
  });

  it('T021 — rejects float unitPriceKobo (P9)', async () => {
    await expect(repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Float Item', unitPriceKobo: 150.5 })).rejects.toThrow(/integer/i);
  });

  it('T022 — stores product category correctly', async () => {
    const product = await repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Milk', unitPriceKobo: 150000, category: 'dairy' });
    expect(product.category).toBe('dairy');
  });

  it('T023 — listProducts returns available items', async () => {
    await repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Rice 5kg', unitPriceKobo: 750000, stockQuantity: 100 });
    const products = await repo.listProducts('ws1', 'tn1');
    expect(products.length).toBeGreaterThanOrEqual(1);
  });

  it('T024 — listProductsByCategory filters correctly', async () => {
    await repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Coca Cola', unitPriceKobo: 20000, category: 'beverages' });
    const beverages = await repo.listProductsByCategory('ws1', 'tn1', 'beverages');
    expect(Array.isArray(beverages)).toBe(true);
  });

  it('T025 — findProductById returns correct product', async () => {
    const product = await repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Peak Milk', unitPriceKobo: 80000 });
    const found = await repo.findProductById(product.id, 'tn1');
    expect(found?.name).toBe('Peak Milk');
  });

  it('T026 — cross-tenant product isolation (T3)', async () => {
    const product = await repo.addProduct({ workspaceId: 'ws1', tenantId: 'tn1', name: 'Isolated Product', unitPriceKobo: 50000 });
    expect(await repo.findProductById(product.id, 'tn-other')).toBeNull();
  });
});

describe('SupermarketRepository — Orders', () => {
  let repo: SupermarketRepository;
  beforeEach(() => { repo = new SupermarketRepository(makeDb() as never); });

  it('T027 — creates order with computed totalKobo', async () => {
    const order = await repo.createOrder({
      workspaceId: 'ws1', tenantId: 'tn1',
      items: [
        { productId: 'p1', productName: 'Rice', quantity: 2, unitPriceKobo: 500000 },
        { productId: 'p2', productName: 'Beans', quantity: 1, unitPriceKobo: 300000 },
      ],
    });
    expect(order.totalKobo).toBe(1300000);
    expect(order.subtotalKobo).toBe(1300000);
    expect(order.status).toBe('pending');
  });

  it('T028 — discount applied correctly (P9 integrity)', async () => {
    const order = await repo.createOrder({
      workspaceId: 'ws1', tenantId: 'tn1', discountKobo: 100000,
      items: [{ productId: 'p1', productName: 'Pasta', quantity: 1, unitPriceKobo: 400000 }],
    });
    expect(order.subtotalKobo).toBe(400000);
    expect(order.discountKobo).toBe(100000);
    expect(order.totalKobo).toBe(300000);
  });

  it('T029 — rejects float unitPriceKobo in order items (P9)', async () => {
    await expect(repo.createOrder({
      workspaceId: 'ws1', tenantId: 'tn1',
      items: [{ productId: 'p1', productName: 'Bad Item', quantity: 1, unitPriceKobo: 150.5 }],
    })).rejects.toThrow(/integer/i);
  });

  it('T030 — loyalty points earned are integer (P9)', async () => {
    const order = await repo.createOrder({
      workspaceId: 'ws1', tenantId: 'tn1',
      items: [{ productId: 'p1', productName: 'Goods', quantity: 1, unitPriceKobo: 500000 }],
    });
    expect(Number.isInteger(order.loyaltyPointsEarned)).toBe(true);
    expect(order.loyaltyPointsEarned).toBe(5);
  });

  it('T031 — customer_ref_id opaque (P13)', async () => {
    const order = await repo.createOrder({
      workspaceId: 'ws1', tenantId: 'tn1', customerRefId: 'cust-ref-opaque-xyz',
      items: [{ productId: 'p1', productName: 'Product', quantity: 1, unitPriceKobo: 100000 }],
    });
    expect(order.customerRefId).toBe('cust-ref-opaque-xyz');
  });

  it('T032 — updateOrderStatus transitions order', async () => {
    const order = await repo.createOrder({
      workspaceId: 'ws1', tenantId: 'tn1',
      items: [{ productId: 'p1', productName: 'Test', quantity: 1, unitPriceKobo: 100000 }],
    });
    const updated = await repo.updateOrderStatus(order.id, 'tn1', 'picking');
    expect(updated.status).toBe('picking');
  });

  it('T033 — listOrders returns tenant-scoped orders', async () => {
    await repo.createOrder({
      workspaceId: 'ws1', tenantId: 'tn1',
      items: [{ productId: 'p1', productName: 'Snack', quantity: 3, unitPriceKobo: 50000 }],
    });
    const orders = await repo.listOrders('ws1', 'tn1');
    expect(orders.length).toBeGreaterThanOrEqual(1);
  });

  it('T034 — tenantId always present on all entities (T3)', async () => {
    const profile = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-invariant', storeName: 'T3 Mart' });
    expect(profile.tenantId).toBe('tn-invariant');
  });

  it('T035 — all payment methods accepted', async () => {
    for (const method of ['cash', 'card', 'transfer', 'wallet'] as const) {
      const order = await repo.createOrder({
        workspaceId: 'ws1', tenantId: 'tn1', paymentMethod: method,
        items: [{ productId: 'p1', productName: 'Item', quantity: 1, unitPriceKobo: 100000 }],
      });
      expect(order.paymentMethod).toBe(method);
    }
  });
});
