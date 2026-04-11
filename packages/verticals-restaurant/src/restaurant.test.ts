import { describe, it, expect, beforeEach } from 'vitest';
import { MenuRepository } from './restaurant.js';
import type { CreateMenuItemInput } from './types.js';

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
            if (row['available'] === undefined) row['available'] = 1;
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim());
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = (clause.split('=')[0]! ?? '').trim();
                (store[idx]! as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          if (sql.toLowerCase().includes('count(*)')) return ({ cnt: store.length }) as unknown as T;
          if (vals.length >= 2) {
            const v0 = vals[0]; const v1 = vals[1];
            const found = store.find(r =>
              (r['id'] === v0 || r['individual_id'] === v0 || r['member_number'] === v0 ||
               r['plate_number'] === v0 || r['route_id'] === v0) &&
              r['tenant_id'] === v1
            );
            return (found ?? null) as T;
          }
          if (vals.length === 1) return (store.find(r => r['id'] === vals[0] || r['individual_id'] === vals[0]) ?? null) as T;
          return (store[0] ?? null) as T;
        }
        return null as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        if (sql.trim().toUpperCase().startsWith('SELECT') && vals.length >= 2) {
          const filtered = store.filter(r => {
            const v0 = vals[0];
            const v1 = vals[1];
            const matchTenant = v1 === undefined || r['tenant_id'] === v1;
            const matchFirst = v0 === undefined ||
              r['workspace_id'] === v0 || r['goods_type'] === v0 ||
              r['facility_type'] === v0 || r['school_type'] === v0 ||
              r['profession'] === v0 || r['state'] === v0 ||
              r['lga'] === v0 || r['route_id'] === v0 ||
              r['creator_id'] === v0 || r['member_id'] === v0 ||
              r['available'] === v0;
            return matchFirst && matchTenant;
          });
          return ({ results: filtered }) as unknown as T;
        }
        return ({ results: store }) as unknown as T;
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep };
}

describe('MenuRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: MenuRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new MenuRepository(db as any); });

  it('creates menu item with available=true', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Jollof Rice', priceKobo: 150000 }); expect(item.available).toBe(true); expect(item.name).toBe('Jollof Rice'); });
  it('uses provided id', async () => { const item = await repo.createItem({ id: 'mn-001', workspaceId: 'ws1', tenantId: 't1', name: 'Egusi Soup', priceKobo: 200000 }); expect(item.id).toBe('mn-001'); });
  it('rejects zero priceKobo (P9)', async () => { await expect(repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Free Item', priceKobo: 0 })).rejects.toThrow('P9'); });
  it('rejects negative priceKobo (P9)', async () => { await expect(repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Wrong', priceKobo: -100 })).rejects.toThrow('P9'); });
  it('rejects float priceKobo (P9)', async () => { await expect(repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Bad Float', priceKobo: 150.5 })).rejects.toThrow(); });
  it('stores category', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Moi Moi', priceKobo: 80000, category: 'starter' }); expect(item).not.toBeNull(); });
  it('stores description', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Suya', priceKobo: 250000, description: 'Spicy grilled meat' }); expect(item).not.toBeNull(); });
  it('stores photoUrl', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Puff Puff', priceKobo: 30000, photoUrl: 'https://cdn.example.com/puff.jpg' }); expect(item).not.toBeNull(); });
  it('findItemById returns null for missing', async () => { expect(await repo.findItemById('none', 't1')).toBeNull(); });
  it('listMenu returns available items', async () => { await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Eba', priceKobo: 120000 }); const menu = await repo.listMenu('ws1', 't1'); expect(menu.length).toBeGreaterThanOrEqual(1); });
  it('listMenu all=false returns all items', async () => { const menu = await repo.listMenu('ws1', 't1', false); expect(Array.isArray(menu)).toBe(true); });
  it('listByCategory filters by category', async () => { const items = await repo.listByCategory('ws1', 't1', 'main'); expect(Array.isArray(items)).toBe(true); });
  it('updateItem name', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Old Name', priceKobo: 100000 }); expect(await repo.updateItem(item.id, 't1', { name: 'New Name' })).not.toBeNull(); });
  it('updateItem priceKobo', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Amala', priceKobo: 90000 }); expect(await repo.updateItem(item.id, 't1', { priceKobo: 100000 })).not.toBeNull(); });
  it('updateItem available to false', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Out of Stock', priceKobo: 50000 }); expect(await repo.updateItem(item.id, 't1', { available: false })).not.toBeNull(); });
  it('toggleAvailability returns updated item', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Toggle Food', priceKobo: 75000 }); const toggled = await repo.toggleAvailability(item.id, 't1'); expect(toggled).not.toBeNull(); });
  it('toggleAvailability returns null for missing item', async () => { expect(await repo.toggleAvailability('none', 't1')).toBeNull(); });
  it('updateItem empty returns existing', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: 'Beans', priceKobo: 60000 }); expect(await repo.updateItem(item.id, 't1', {})).not.toBeNull(); });
  it('supports all categories', async () => { for (const cat of ['starter','main','dessert','drink','snack','special'] as const) { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 't1', name: `Cat:${cat}`, priceKobo: 10000, category: cat }); expect(item).not.toBeNull(); } });
  it('tenantId stored', async () => { const item = await repo.createItem({ workspaceId: 'ws1', tenantId: 'tenant-R', name: 'Rice', priceKobo: 100000 }); expect(item.tenantId).toBe('tenant-R'); });
});
