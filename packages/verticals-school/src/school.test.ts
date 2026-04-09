import { describe, it, expect, beforeEach } from 'vitest';
import { SchoolRepository } from './school.js';
import { isValidSchoolTransition, VALID_SCHOOL_TRANSITIONS } from './types.js';
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
describe('SchoolRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: SchoolRepository;
  beforeEach(() => { db = makeDb(); repo = new SchoolRepository(db as any); });
  it('creates school with seeded status', async () => { const s = await repo.create({ organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', schoolName: 'King\'s Academy', schoolType: 'secondary' }); expect(s.status).toBe('seeded'); expect(s.schoolName).toBe('King\'s Academy'); });
  it('uses provided id', async () => { const s = await repo.create({ id: 'sc-001', organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', schoolName: 'Grace Primary', schoolType: 'primary' }); expect(s.id).toBe('sc-001'); });
  it('stores schoolType', async () => { const s = await repo.create({ organizationId: 'org2', workspaceId: 'ws1', tenantId: 't1', schoolName: 'Lagos Tech', schoolType: 'vocational' }); expect(s.schoolType).toBe('vocational'); });
  it('stores cacRegNumber', async () => { const s = await repo.create({ organizationId: 'org3', workspaceId: 'ws1', tenantId: 't1', schoolName: 'Faith School', schoolType: 'tertiary', cacRegNumber: 'RC-SCH-001' }); expect(s).not.toBeNull(); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('findByType returns schools', async () => { const ss = await repo.findByType('secondary', 't1'); expect(Array.isArray(ss)).toBe(true); });
  it('update schoolName', async () => { const s = await repo.create({ organizationId: 'org4', workspaceId: 'ws1', tenantId: 't1', schoolName: 'Old', schoolType: 'primary' }); expect(await repo.update(s.id, 't1', { schoolName: 'New' })).not.toBeNull(); });
  it('update schoolType', async () => { const s = await repo.create({ organizationId: 'org5', workspaceId: 'ws1', tenantId: 't1', schoolName: 'Multi', schoolType: 'primary' }); expect(await repo.update(s.id, 't1', { schoolType: 'secondary' })).not.toBeNull(); });
  it('update cacRegNumber', async () => { const s = await repo.create({ organizationId: 'org6', workspaceId: 'ws1', tenantId: 't1', schoolName: 'School X', schoolType: 'nursery' }); expect(await repo.update(s.id, 't1', { cacRegNumber: 'RC-001' })).not.toBeNull(); });
  it('update stateRegRef', async () => { const s = await repo.create({ organizationId: 'org7', workspaceId: 'ws1', tenantId: 't1', schoolName: 'School Y', schoolType: 'tutoring' }); expect(await repo.update(s.id, 't1', { stateRegRef: 'STATE-001' })).not.toBeNull(); });
  it('update studentCount', async () => { const s = await repo.create({ organizationId: 'org8', workspaceId: 'ws1', tenantId: 't1', schoolName: 'Big School', schoolType: 'secondary' }); expect(await repo.update(s.id, 't1', { studentCount: 1200 })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const s = await repo.create({ organizationId: 'org9', workspaceId: 'ws1', tenantId: 't1', schoolName: 'S1', schoolType: 'primary' }); expect(await repo.transition(s.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → reg_verified', async () => { const s = await repo.create({ organizationId: 'org10', workspaceId: 'ws1', tenantId: 't1', schoolName: 'S2', schoolType: 'primary' }); expect(await repo.transition(s.id, 't1', 'reg_verified')).not.toBeNull(); });
  it('transition reg_verified → active', async () => { const s = await repo.create({ organizationId: 'org11', workspaceId: 'ws1', tenantId: 't1', schoolName: 'S3', schoolType: 'secondary' }); expect(await repo.transition(s.id, 't1', 'active')).not.toBeNull(); });
  it('empty update returns existing', async () => { const s = await repo.create({ organizationId: 'org12', workspaceId: 'ws1', tenantId: 't1', schoolName: 'Empty', schoolType: 'others' }); expect(await repo.update(s.id, 't1', {})).not.toBeNull(); });
  it('tenantId stored correctly', async () => { const s = await repo.create({ organizationId: 'org13', workspaceId: 'ws1', tenantId: 'tenant-S', schoolName: 'Test', schoolType: 'nursery' }); expect(s.tenantId).toBe('tenant-S'); });
});
describe('School FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidSchoolTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → reg_verified valid', () => { expect(isValidSchoolTransition('claimed', 'reg_verified')).toBe(true); });
  it('reg_verified → active valid', () => { expect(isValidSchoolTransition('reg_verified', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidSchoolTransition('seeded', 'active')).toBe(false); });
  it('VALID_SCHOOL_TRANSITIONS has 3 entries', () => { expect(VALID_SCHOOL_TRANSITIONS).toHaveLength(3); });
});
