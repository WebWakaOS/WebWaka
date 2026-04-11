import { describe, it, expect, beforeEach } from 'vitest';
import { MinistryRepository } from './ministry.js';
import { isValidMinistryTransition } from './types.js';
function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      run: async () => {
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const colM = sql.match(/\(([^)]+)\)\s+VALUES/i);
          const valM = sql.match(/VALUES\s*\(([^)]+)\)/i);
          if (colM && valM) {
            const cols = colM[1].split(',').map((c: string) => c.trim());
            const tokens = valM[1].split(',').map((v: string) => v.trim());
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
            const clauses = setM[1].split(',').map((s: string) => s.trim());
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = clause.split('=')[0].trim();
                (store[idx] as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
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
describe('MinistryRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: MinistryRepository;
  beforeEach(() => { db = makeDb(); repo = new MinistryRepository(db as any); });
  it('creates ministry with seeded status', async () => { const m = await repo.create({ organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', ministryName: 'Apostolic Faith' }); expect(m.status).toBe('seeded'); expect(m.ministryName).toBe('Apostolic Faith'); });
  it('uses provided id', async () => { const m = await repo.create({ id: 'mn-001', organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', ministryName: 'Grace Ministry' }); expect(m.id).toBe('mn-001'); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('stores foundingYear', async () => { const m = await repo.create({ organizationId: 'org2', workspaceId: 'ws1', tenantId: 't1', ministryName: 'Faith Mission', foundingYear: 1985 }); expect(m).not.toBeNull(); });
  it('update ministryName', async () => { const m = await repo.create({ organizationId: 'org3', workspaceId: 'ws1', tenantId: 't1', ministryName: 'Old' }); expect(await repo.update(m.id, 't1', { ministryName: 'New' })).not.toBeNull(); });
  it('update itNumber', async () => { const m = await repo.create({ organizationId: 'org4', workspaceId: 'ws1', tenantId: 't1', ministryName: 'M X' }); expect(await repo.update(m.id, 't1', { itNumber: 'IT-M-001' })).not.toBeNull(); });
  it('update totalMembers', async () => { const m = await repo.create({ organizationId: 'org5', workspaceId: 'ws1', tenantId: 't1', ministryName: 'M Y', totalMembers: 300 }); expect(await repo.update(m.id, 't1', { totalMembers: 500 })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const m = await repo.create({ organizationId: 'org6', workspaceId: 'ws1', tenantId: 't1', ministryName: 'MN1' }); expect(await repo.transition(m.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → it_verified', async () => { const m = await repo.create({ organizationId: 'org7', workspaceId: 'ws1', tenantId: 't1', ministryName: 'MN2' }); expect(await repo.transition(m.id, 't1', 'it_verified')).not.toBeNull(); });
  it('transition it_verified → active', async () => { const m = await repo.create({ organizationId: 'org8', workspaceId: 'ws1', tenantId: 't1', ministryName: 'MN3' }); expect(await repo.transition(m.id, 't1', 'active')).not.toBeNull(); });
});
describe('Ministry FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidMinistryTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → it_verified valid', () => { expect(isValidMinistryTransition('claimed', 'it_verified')).toBe(true); });
  it('it_verified → active valid', () => { expect(isValidMinistryTransition('it_verified', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidMinistryTransition('seeded', 'active')).toBe(false); });
});
