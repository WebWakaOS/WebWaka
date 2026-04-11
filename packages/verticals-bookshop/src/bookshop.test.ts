/**
 * packages/verticals-bookshop — BookshopRepository tests
 * M9 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BookshopRepository } from './bookshop.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  isValidBookshopTransition,
} from './types.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      run: async () => {
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
            if (row['status'] === undefined) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.startsWith('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = clause.split('=')[0]!.trim();
                (store[idx] as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r => vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]);
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        return { results: store.filter(r => {
          if (vals.length >= 2 && (r['workspace_id'] !== vals[0] || r['tenant_id'] !== vals[1])) return false;
          if (vals.length >= 3 && r['category'] !== vals[2]) return false;
          return true;
        }) } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof BookshopRepository>[0];
}

describe('BookshopRepository', () => {
  let repo: BookshopRepository;
  beforeEach(() => { repo = new BookshopRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'Lagos Books', state: 'Lagos', lga: 'VI' });
    expect(p.status).toBe('seeded');
    expect(p.shopName).toBe('Lagos Books');
  });

  it('T002 — cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'B1', state: 'Lagos', lga: 'VI' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — FSM guard claimed→cac_verified requires CAC number', () => {
    expect(guardClaimedToCacVerified({ cacNumber: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacNumber: 'RC654321' }).allowed).toBe(true);
  });

  it('T005 — valid FSM transitions', () => {
    expect(isValidBookshopTransition('seeded', 'claimed')).toBe(true);
    expect(isValidBookshopTransition('claimed', 'cac_verified')).toBe(true);
    expect(isValidBookshopTransition('cac_verified', 'active')).toBe(true);
  });

  it('T006 — invalid FSM transitions rejected (T4)', () => {
    expect(isValidBookshopTransition('seeded', 'active')).toBe(false);
    expect(isValidBookshopTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — transitionProfile updates status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', shopName: 'B2', state: 'Abuja', lga: 'Garki' });
    const u = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('T008 — creates catalogue item with integer unit_price_kobo (P9)', async () => {
    const item = await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', title: 'Things Fall Apart', category: 'novel', unitPriceKobo: 200000, author: 'Chinua Achebe' });
    expect(item.unitPriceKobo).toBe(200000);
    expect(item.title).toBe('Things Fall Apart');
  });

  it('T009 — rejects fractional unit_price_kobo for catalogue item (P9)', async () => {
    await expect(repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', title: 'Test Book', category: 'textbook', unitPriceKobo: 1500.5 })).rejects.toThrow('[P9]');
  });

  it('T010 — cross-tenant catalogue item hidden (T3)', async () => {
    const item = await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', title: 'Purple Hibiscus', category: 'novel', unitPriceKobo: 180000 });
    expect(await repo.findCatalogueItemById(item.id, 'tn-other')).toBeNull();
  });

  it('T011 — creates order with integer total_kobo (P9)', async () => {
    const o = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '08000000001', orderItems: '[]', totalKobo: 400000 });
    expect(o.totalKobo).toBe(400000);
    expect(o.status).toBe('pending');
  });

  it('T012 — rejects fractional total_kobo for order (P9)', async () => {
    await expect(repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '0800000000', orderItems: '[]', totalKobo: 999.50 })).rejects.toThrow('[P9]');
  });

  it('T013 — cross-tenant order hidden (T3)', async () => {
    const o = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '08000000002', orderItems: '[]', totalKobo: 100000 });
    expect(await repo.findOrderById(o.id, 'tn-other')).toBeNull();
  });

  it('T014 — catalogue filters by category', async () => {
    await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', title: 'WAEC Textbook', category: 'textbook', unitPriceKobo: 150000 });
    await repo.createCatalogueItem({ workspaceId: 'ws1', tenantId: 'tn1', title: 'Novel X', category: 'novel', unitPriceKobo: 120000 });
    const textbooks = await repo.listCatalogue('ws1', 'tn1', 'textbook');
    expect(textbooks.every(i => i.category === 'textbook')).toBe(true);
  });

  it('T015 — order default delivery_method is pickup', async () => {
    const o = await repo.createOrder({ workspaceId: 'ws1', tenantId: 'tn1', customerPhone: '08000000003', orderItems: '[]', totalKobo: 50000 });
    expect(o.deliveryMethod).toBe('pickup');
  });

  it('T016 — suspended→active is a valid FSM transition', () => {
    expect(isValidBookshopTransition('suspended', 'active')).toBe(true);
  });
});
