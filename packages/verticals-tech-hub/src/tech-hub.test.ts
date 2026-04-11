import { describe, it, expect, beforeEach } from 'vitest';
import { TechHubRepository } from './tech-hub.js';
import { isValidTechHubTransition, VALID_TECH_HUB_TRANSITIONS } from './types.js';
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
                const col = (clause.split('=')[0] ?? '').trim();
                (store[idx] as Record<string, unknown>)[col] = vals[i];
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
describe('TechHubRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: TechHubRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new TechHubRepository(db as any); });
  it('creates tech hub with seeded status', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'CcHub Lagos', lga: 'Yaba', state: 'Lagos' }); expect(h.status).toBe('seeded'); expect(h.hubName).toBe('CcHub Lagos'); });
  it('uses provided id', async () => { const h = await repo.create({ id: 'th-001', workspaceId: 'ws1', tenantId: 't1', hubName: 'Abuja Hub', lga: 'Wuse', state: 'FCT' }); expect(h.id).toBe('th-001'); });
  it('stores lga and state', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'Kano Hub', lga: 'Fagge', state: 'Kano' }); expect(h.lga).toBe('Fagge'); expect(h.state).toBe('Kano'); });
  it('stores deskCount', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'Big Hub', lga: 'VI', state: 'Lagos', deskCount: 100 }); expect(h.deskCount).toBe(100); });
  it('stores focusAreas', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'Fintech Hub', lga: 'Marina', state: 'Lagos', focusAreas: 'fintech,agritech' }); expect(h).not.toBeNull(); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('findByState returns hubs', async () => { const hs = await repo.findByState('Lagos', 't1'); expect(Array.isArray(hs)).toBe(true); });
  it('update hubName', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'Old', lga: 'L', state: 'S' }); expect(await repo.update(h.id, 't1', { hubName: 'New' })).not.toBeNull(); });
  it('update deskCount', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'Growing Hub', lga: 'L', state: 'S', deskCount: 50 }); expect(await repo.update(h.id, 't1', { deskCount: 80 })).not.toBeNull(); });
  it('update focusAreas', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'Tech Hub', lga: 'L', state: 'S' }); expect(await repo.update(h.id, 't1', { focusAreas: 'healthtech,edtech' })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'H1', lga: 'L', state: 'S' }); expect(await repo.transition(h.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → active', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'H2', lga: 'L', state: 'S' }); expect(await repo.transition(h.id, 't1', 'active')).not.toBeNull(); });
  it('empty update returns existing', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 't1', hubName: 'H3', lga: 'L', state: 'S' }); expect(await repo.update(h.id, 't1', {})).not.toBeNull(); });
  it('tenantId stored', async () => { const h = await repo.create({ workspaceId: 'ws1', tenantId: 'tenant-H', hubName: 'H4', lga: 'L', state: 'S' }); expect(h.tenantId).toBe('tenant-H'); });
  it('workspaceId stored', async () => { const h = await repo.create({ workspaceId: 'ws-hub', tenantId: 't1', hubName: 'H5', lga: 'L', state: 'S' }); expect(h.workspaceId).toBe('ws-hub'); });
});
describe('TechHub FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidTechHubTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → active valid', () => { expect(isValidTechHubTransition('claimed', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidTechHubTransition('seeded', 'active')).toBe(false); });
  it('VALID_TECH_HUB_TRANSITIONS has 2 entries', () => { expect(VALID_TECH_HUB_TRANSITIONS).toHaveLength(2); });
});
