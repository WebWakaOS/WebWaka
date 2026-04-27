import { describe, it, expect, beforeEach } from 'vitest';
import { OkadaKekeRepository } from './okada-keke.js';
import { isValidOkadaKekeTransition } from './types.js';

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
               r['plate_number'] === v0 || r['route_id'] === v0 ||
               r['workspace_id'] === v0) &&
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

describe.skip('OkadaKekeRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: OkadaKekeRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new OkadaKekeRepository(db as any); });

  it('creates okada profile with seeded status', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    expect(p.status).toBe('seeded');
    expect(p.vehicleCategory).toBe('okada');
  });
  it('creates keke profile', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'keke' });
    expect(p.vehicleCategory).toBe('keke');
  });
  it('creates both profile', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'both' });
    expect(p.vehicleCategory).toBe('both');
  });
  it('stores tenantId (T3)', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 'tenant-O', operatorType: 'keke' });
    expect(p.tenantId).toBe('tenant-O');
  });
  it('findProfileById returns null for missing', async () => {
    expect(await repo.findProfileById('none', 't1')).toBeNull();
  });
  it('findProfileByWorkspace returns profile', async () => {
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    const p = await repo.findProfileByWorkspace('ws1', 't1');
    expect(p).not.toBeNull();
  });
  it('transition seeded → claimed', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 't1', businessName: 'Test Coop', vehicleCategory: 'both' });
    const t = await repo.transitionStatus(p.id, 't1', 'claimed');
    expect(t.status).toBe('claimed');
  });
  it('transition claimed → nurtw_registered', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 't1', businessName: 'Test Coop', vehicleCategory: 'okada' });
    await repo.transitionStatus(p.id, 't1', 'claimed');
    const t = await repo.transitionStatus(p.id, 't1', 'nurtw_registered');
    expect(t.status).toBe('nurtw_registered');
  });
  it('transition nurtw_registered → active', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 't1', businessName: 'Test Coop', vehicleCategory: 'keke' });
    await repo.transitionStatus(p.id, 't1', 'claimed');
    await repo.transitionStatus(p.id, 't1', 'nurtw_registered');
    const t = await repo.transitionStatus(p.id, 't1', 'active');
    expect(t.status).toBe('active');
  });
  it('default businessName via create()', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'okada' });
    expect(p.businessName).toBe('Okada/Keke Cooperative');
  });
  it('custom name via create()', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorType: 'keke', name: 'Eko Riders' });
    expect(p.businessName).toBe('Eko Riders');
  });
});

describe('OkadaKeke FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidOkadaKekeTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → nurtw_registered valid', () => { expect(isValidOkadaKekeTransition('claimed', 'nurtw_registered')).toBe(true); });
  it('nurtw_registered → active valid', () => { expect(isValidOkadaKekeTransition('nurtw_registered', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidOkadaKekeTransition('seeded', 'active')).toBe(false); });
});
