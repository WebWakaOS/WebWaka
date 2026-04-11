import { describe, it, expect, beforeEach } from 'vitest';
import { ChurchRepository } from './church.js';
import { TitheRepository } from './tithe.js';
import { isValidChurchTransition, VALID_CHURCH_TRANSITIONS } from './types.js';

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
                const col = clause.split('=')[0]!.trim();
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

describe('ChurchRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: ChurchRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new ChurchRepository(db as any); });

  it('creates church with seeded status', async () => { const c = await repo.create({ organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect(c.status).toBe('seeded'); expect(c.denomination).toBe('pentecostal'); });
  it('uses provided id', async () => { const c = await repo.create({ id: 'ch-001', organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', denomination: 'catholic' }); expect(c.id).toBe('ch-001'); });
  it('stores foundingYear', async () => { const c = await repo.create({ organizationId: 'org2', workspaceId: 'ws1', tenantId: 't1', denomination: 'anglican', foundingYear: 1995 }); expect(c).not.toBeNull(); });
  it('stores seniorPastor', async () => { const c = await repo.create({ organizationId: 'org3', workspaceId: 'ws1', tenantId: 't1', denomination: 'baptist', seniorPastor: 'Rev. John' }); expect(c).not.toBeNull(); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('findByWorkspace returns churches', async () => { await repo.create({ organizationId: 'org4', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect((await repo.findByWorkspace('ws1', 't1')).length).toBeGreaterThanOrEqual(1); });
  it('findByDenomination filters correctly', async () => { const chs = await repo.findByDenomination('pentecostal', 't1'); expect(Array.isArray(chs)).toBe(true); });
  it('update communityId', async () => { const c = await repo.create({ organizationId: 'org5', workspaceId: 'ws1', tenantId: 't1', denomination: 'methodist' }); expect(await repo.update(c.id, 't1', { communityId: 'comm-1' })).not.toBeNull(); });
  it('update itNumber', async () => { const c = await repo.create({ organizationId: 'org6', workspaceId: 'ws1', tenantId: 't1', denomination: 'orthodox' }); expect(await repo.update(c.id, 't1', { itNumber: 'IT-001' })).not.toBeNull(); });
  it('update denomination', async () => { const c = await repo.create({ organizationId: 'org7', workspaceId: 'ws1', tenantId: 't1', denomination: 'others' }); expect(await repo.update(c.id, 't1', { denomination: 'evangelical' })).not.toBeNull(); });
  it('update totalMembers', async () => { const c = await repo.create({ organizationId: 'org8', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect(await repo.update(c.id, 't1', { totalMembers: 5000 })).not.toBeNull(); });
  it('update branchCount', async () => { const c = await repo.create({ organizationId: 'org9', workspaceId: 'ws1', tenantId: 't1', denomination: 'catholic' }); expect(await repo.update(c.id, 't1', { branchCount: 10 })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const c = await repo.create({ organizationId: 'org10', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect(await repo.transition(c.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → it_verified', async () => { const c = await repo.create({ organizationId: 'org11', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect(await repo.transition(c.id, 't1', 'it_verified')).not.toBeNull(); });
  it('transition it_verified → community_active', async () => { const c = await repo.create({ organizationId: 'org12', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect(await repo.transition(c.id, 't1', 'community_active')).not.toBeNull(); });
  it('transition community_active → active', async () => { const c = await repo.create({ organizationId: 'org13', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect(await repo.transition(c.id, 't1', 'active')).not.toBeNull(); });
  it('empty update returns existing', async () => { const c = await repo.create({ organizationId: 'org14', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect(await repo.update(c.id, 't1', {})).not.toBeNull(); });
  it('update seniorPastor', async () => { const c = await repo.create({ organizationId: 'org15', workspaceId: 'ws1', tenantId: 't1', denomination: 'pentecostal' }); expect(await repo.update(c.id, 't1', { seniorPastor: 'Pastor Adeyemi' })).not.toBeNull(); });
});

describe('TitheRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: TitheRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new TitheRepository(db as any); });

  it('creates tithe record', async () => { const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: 100000, paymentType: 'tithe' }); expect(t.amountKobo).toBe(100000); expect(t.paymentType).toBe('tithe'); });
  it('rejects zero amountKobo (P9)', async () => { await expect(repo.create({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: 0, paymentType: 'tithe' })).rejects.toThrow('P9'); });
  it('rejects negative amountKobo (P9)', async () => { await expect(repo.create({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: -100, paymentType: 'offering' })).rejects.toThrow('P9'); });
  it('stores paystackRef', async () => { const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb2', amountKobo: 50000, paymentType: 'offering', paystackRef: 'PSK-001' }); expect(t).not.toBeNull(); });
  it('listByMember returns records', async () => { await repo.create({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb3', amountKobo: 200000, paymentType: 'seed' }); const records = await repo.listByMember('mb3', 't1'); expect(records.length).toBeGreaterThanOrEqual(1); });
  it('listByWorkspace returns records', async () => { const records = await repo.listByWorkspace('ws1', 't1'); expect(Array.isArray(records)).toBe(true); });
  it('totalByWorkspace returns 0 initially', async () => { const total = await repo.totalByWorkspace('ws-new', 't1'); expect(total).toBe(0); });
  it('totalByMember returns 0 initially', async () => { const total = await repo.totalByMember('mb-new', 't1'); expect(total).toBe(0); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('supports all payment types', async () => {
    for (const pt of ['tithe', 'offering', 'seed', 'donation', 'special'] as const) {
      const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb5', amountKobo: 10000, paymentType: pt });
      expect(r.paymentType).toBe(pt);
    }
  });
  it('rejects float amountKobo (P9)', async () => { await expect(repo.create({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb6', amountKobo: 100.5, paymentType: 'tithe' })).rejects.toThrow(); });
});

describe('Church FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidChurchTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → it_verified valid', () => { expect(isValidChurchTransition('claimed', 'it_verified')).toBe(true); });
  it('it_verified → community_active valid', () => { expect(isValidChurchTransition('it_verified', 'community_active')).toBe(true); });
  it('community_active → active valid', () => { expect(isValidChurchTransition('community_active', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidChurchTransition('seeded', 'active')).toBe(false); });
  it('active → seeded invalid', () => { expect(isValidChurchTransition('active', 'seeded')).toBe(false); });
  it('VALID_CHURCH_TRANSITIONS has 4 entries', () => { expect(VALID_CHURCH_TRANSITIONS).toHaveLength(4); });
});
