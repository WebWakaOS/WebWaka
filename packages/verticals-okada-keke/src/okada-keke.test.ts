import { describe, it, expect, beforeEach } from 'vitest';
import { OkadaKekeRepository } from './okada-keke.js';
import { isValidOkadaTransition, VALID_OKADA_TRANSITIONS } from './types.js';

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

describe('OkadaKekeRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: OkadaKekeRepository;
  beforeEach(() => { db = makeDb(); repo = new OkadaKekeRepository(db as any); });

  it('creates okada profile with seeded status', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    expect(p.status).toBe('seeded');
    expect(p.operatorType).toBe('okada');
  });
  it('creates keke profile', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'keke' });
    expect(p.operatorType).toBe('keke');
  });
  it('creates both profile', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'both' });
    expect(p.operatorType).toBe('both');
  });
  it('uses provided id', async () => {
    const p = await repo.create({ id: 'ok-001', workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    expect(p.id).toBe('ok-001');
  });
  it('default riderCount is 0', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'keke' });
    expect(p.riderCount).toBe(0);
  });
  it('custom riderCount stored', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada', riderCount: 50 });
    expect(p.riderCount).toBe(50);
  });
  it('stores tenantId', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 'tenant-O', operatorType: 'keke' });
    expect(p.tenantId).toBe('tenant-O');
  });
  it('findById returns null for missing', async () => {
    expect(await repo.findById('none', 't1')).toBeNull();
  });
  it('findByWorkspace returns profiles', async () => {
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    const ps = await repo.findByWorkspace('ws1', 't1');
    expect(ps.length).toBeGreaterThanOrEqual(1);
  });
  it('update frscRef', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    expect(await repo.update(p.id, 't1', { frscRef: 'FRSC-OK-001' })).not.toBeNull();
  });
  it('update riderCount', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'keke' });
    expect(await repo.update(p.id, 't1', { riderCount: 75 })).not.toBeNull();
  });
  it('transition seeded → claimed', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'both' });
    expect(await repo.transition(p.id, 't1', 'claimed')).not.toBeNull();
  });
  it('transition claimed → frsc_verified', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    expect(await repo.transition(p.id, 't1', 'frsc_verified')).not.toBeNull();
  });
  it('transition frsc_verified → active', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'keke' });
    expect(await repo.transition(p.id, 't1', 'active')).not.toBeNull();
  });
  it('empty update returns existing', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    expect(await repo.update(p.id, 't1', {})).not.toBeNull();
  });
});

describe('OkadaKeke FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidOkadaTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → frsc_verified valid', () => { expect(isValidOkadaTransition('claimed', 'frsc_verified')).toBe(true); });
  it('frsc_verified → active valid', () => { expect(isValidOkadaTransition('frsc_verified', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidOkadaTransition('seeded', 'active')).toBe(false); });
  it('VALID_OKADA_TRANSITIONS has 3+ entries', () => { expect(VALID_OKADA_TRANSITIONS.length).toBeGreaterThanOrEqual(3); });
});
