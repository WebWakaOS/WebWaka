import { describe, it, expect, beforeEach } from 'vitest';
import { TransitRepository } from './transit.js';
import { isValidTransitTransition, VALID_TRANSIT_TRANSITIONS } from './types.js';

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

describe('TransitRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: TransitRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new TransitRepository(db as any); });

  it('creates transit operator with seeded status', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Lagos BRT' });
    expect(t.operatorName).toBe('Lagos BRT'); expect(t.status).toBe('seeded');
  });

  it('uses provided id', async () => {
    const t = await repo.create({ id: 'tr-001', workspaceId: 'ws1', tenantId: 't1', operatorName: 'BRT Abuja' });
    expect(t.id).toBe('tr-001');
  });

  it('uses provided cacRegNumber', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Abuja Metro', cacRegNumber: 'RC12345' });
    expect(t).not.toBeNull();
  });

  it('uses provided fleetSize', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Trans-Ikeja', fleetSize: 50 });
    expect(t.fleetSize).toBe(50);
  });

  it('findById returns null for missing', async () => {
    const t = await repo.findById('none', 't1'); expect(t).toBeNull();
  });

  it('findByWorkspace returns all operators', async () => {
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Op A' });
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Op B' });
    const ops = await repo.findByWorkspace('ws1', 't1');
    expect(ops.length).toBeGreaterThanOrEqual(2);
  });

  it('update operatorName', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Old Name' });
    const updated = await repo.update(t.id, 't1', { operatorName: 'New Name' });
    expect(updated).not.toBeNull();
  });

  it('update cacRegNumber', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Metro X' });
    const updated = await repo.update(t.id, 't1', { cacRegNumber: 'RC-99999' });
    expect(updated).not.toBeNull();
  });

  it('update frscFleetRef', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Metro Y' });
    const updated = await repo.update(t.id, 't1', { frscFleetRef: 'FRSC-FLEET-001' });
    expect(updated).not.toBeNull();
  });

  it('update fleetSize', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Metro Z', fleetSize: 20 });
    const updated = await repo.update(t.id, 't1', { fleetSize: 40 });
    expect(updated).not.toBeNull();
  });

  it('update with empty input returns existing', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Metro Empty' });
    const result = await repo.update(t.id, 't1', {});
    expect(result).not.toBeNull();
  });

  it('transition seeded → claimed', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Metro T' });
    const r = await repo.transition(t.id, 't1', 'claimed');
    expect(r).not.toBeNull();
  });

  it('transition claimed → frsc_verified', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Metro T2' });
    await repo.transition(t.id, 't1', 'claimed');
    const r = await repo.transition(t.id, 't1', 'frsc_verified');
    expect(r).not.toBeNull();
  });

  it('transition frsc_verified → route_licensed', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Metro T3' });
    const r = await repo.transition(t.id, 't1', 'route_licensed');
    expect(r).not.toBeNull();
  });

  it('transition route_licensed → active', async () => {
    const t = await repo.create({ workspaceId: 'ws1', tenantId: 't1', operatorName: 'Metro T4' });
    const r = await repo.transition(t.id, 't1', 'active');
    expect(r).not.toBeNull();
  });

  it('stores workspaceId and tenantId', async () => {
    const t = await repo.create({ workspaceId: 'ws-abc', tenantId: 't-abc', operatorName: 'Metro Store' });
    expect(t.workspaceId).toBe('ws-abc'); expect(t.tenantId).toBe('t-abc');
  });
});

describe('Transit FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidTransitTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → frsc_verified valid', () => { expect(isValidTransitTransition('claimed', 'frsc_verified')).toBe(true); });
  it('frsc_verified → route_licensed valid', () => { expect(isValidTransitTransition('frsc_verified', 'route_licensed')).toBe(true); });
  it('route_licensed → active valid', () => { expect(isValidTransitTransition('route_licensed', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidTransitTransition('seeded', 'active')).toBe(false); });
  it('active → seeded invalid', () => { expect(isValidTransitTransition('active', 'seeded')).toBe(false); });
  it('VALID_TRANSIT_TRANSITIONS has 4 entries', () => { expect(VALID_TRANSIT_TRANSITIONS).toHaveLength(4); });
});
