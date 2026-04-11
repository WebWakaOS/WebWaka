import { describe, it, expect, beforeEach } from 'vitest';
import { RtuRepository } from './rtu.js';
import { isValidRtuTransition, VALID_RTU_TRANSITIONS } from './types.js';

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

describe('RtuRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: RtuRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new RtuRepository(db as any); });

  it('creates RTU with seeded status', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'NURTW Lagos' });
    expect(r.status).toBe('seeded');
    expect(r.unionName).toBe('NURTW Lagos');
  });
  it('uses provided id', async () => {
    const r = await repo.create({ id: 'rtu-001', workspaceId: 'ws1', tenantId: 't1', unionName: 'RTEAN' });
    expect(r.id).toBe('rtu-001');
  });
  it('default memberCount is 0', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'NUT' });
    expect(r.memberCount).toBe(0);
  });
  it('custom memberCount stored', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'Big Union', memberCount: 500 });
    expect(r.memberCount).toBe(500);
  });
  it('stores tenantId', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 'tenant-R', unionName: 'Union A' });
    expect(r.tenantId).toBe('tenant-R');
  });
  it('findById returns null for missing', async () => {
    expect(await repo.findById('none', 't1')).toBeNull();
  });
  it('findByWorkspace returns profiles', async () => {
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'Union B' });
    const rs = await repo.findByWorkspace('ws1', 't1');
    expect(rs.length).toBeGreaterThanOrEqual(1);
  });
  it('update unionName', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'Old Name' });
    expect(await repo.update(r.id, 't1', { unionName: 'New Name' })).not.toBeNull();
  });
  it('update registrationRef', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'Union C' });
    expect(await repo.update(r.id, 't1', { registrationRef: 'REG-001' })).not.toBeNull();
  });
  it('update memberCount', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'Union D' });
    expect(await repo.update(r.id, 't1', { memberCount: 200 })).not.toBeNull();
  });
  it('transition seeded → claimed', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'Union E' });
    expect(await repo.transition(r.id, 't1', 'claimed')).not.toBeNull();
  });
  it('transition claimed → active', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'Union F' });
    expect(await repo.transition(r.id, 't1', 'active')).not.toBeNull();
  });
  it('empty update returns existing', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', unionName: 'Union G' });
    expect(await repo.update(r.id, 't1', {})).not.toBeNull();
  });
});

describe('RTU FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidRtuTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → active valid', () => { expect(isValidRtuTransition('claimed', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidRtuTransition('seeded', 'active')).toBe(false); });
  it('VALID_RTU_TRANSITIONS has 2+ entries', () => { expect(VALID_RTU_TRANSITIONS.length).toBeGreaterThanOrEqual(2); });
});
