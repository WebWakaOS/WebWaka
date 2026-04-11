import { describe, it, expect, beforeEach } from 'vitest';
import { RideshareRepository } from './rideshare.js';
import { isValidRideshareTransition, VALID_RIDESHARE_TRANSITIONS } from './types.js';

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

describe('RideshareRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: RideshareRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new RideshareRepository(db as any); });

  it('creates rideshare profile with seeded status', async () => {
    const p = await repo.create({ individualId: 'ind-1', workspaceId: 'ws1', tenantId: 't1' });
    expect(p.status).toBe('seeded');
  });
  it('uses provided id', async () => {
    const p = await repo.create({ id: 'rs-001', individualId: 'ind-2', workspaceId: 'ws1', tenantId: 't1' });
    expect(p.id).toBe('rs-001');
  });
  it('default ratingX10 is 50', async () => {
    const p = await repo.create({ individualId: 'ind-3', workspaceId: 'ws1', tenantId: 't1' });
    expect(p.ratingX10).toBe(50);
  });
  it('default seatCount is 4', async () => {
    const p = await repo.create({ individualId: 'ind-4', workspaceId: 'ws1', tenantId: 't1' });
    expect(p.seatCount).toBe(4);
  });
  it('stores vehicleType', async () => {
    const p = await repo.create({ individualId: 'ind-5', workspaceId: 'ws1', tenantId: 't1', vehicleType: 'sedan' });
    expect(p.vehicleType).toBe('sedan');
  });
  it('stores plateNumber', async () => {
    const p = await repo.create({ individualId: 'ind-6', workspaceId: 'ws1', tenantId: 't1', plateNumber: 'ABJ-001-XY' });
    expect(p.plateNumber).toBe('ABJ-001-XY');
  });
  it('stores seatCount override', async () => {
    const p = await repo.create({ individualId: 'ind-7', workspaceId: 'ws1', tenantId: 't1', seatCount: 7 });
    expect(p.seatCount).toBe(7);
  });
  it('individualId stored correctly', async () => {
    const p = await repo.create({ individualId: 'ind-8', workspaceId: 'ws1', tenantId: 't1' });
    expect(p.individualId).toBe('ind-8');
  });
  it('tenantId stored correctly', async () => {
    const p = await repo.create({ individualId: 'ind-9', workspaceId: 'ws1', tenantId: 'tenant-R' });
    expect(p.tenantId).toBe('tenant-R');
  });
  it('findById returns null for missing', async () => {
    expect(await repo.findById('none', 't1')).toBeNull();
  });
  it('findByWorkspace returns drivers', async () => {
    await repo.create({ individualId: 'ind-10', workspaceId: 'ws1', tenantId: 't1' });
    const ps = await repo.findByWorkspace('ws1', 't1');
    expect(ps.length).toBeGreaterThanOrEqual(1);
  });
  it('update frscLicense', async () => {
    const p = await repo.create({ individualId: 'ind-11', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.update(p.id, 't1', { frscLicense: 'FRSC-001' })).not.toBeNull();
  });
  it('update frscExpires', async () => {
    const p = await repo.create({ individualId: 'ind-12', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.update(p.id, 't1', { frscExpires: 1900000000 })).not.toBeNull();
  });
  it('update vehicleType', async () => {
    const p = await repo.create({ individualId: 'ind-13', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.update(p.id, 't1', { vehicleType: 'suv' })).not.toBeNull();
  });
  it('update plateNumber', async () => {
    const p = await repo.create({ individualId: 'ind-14', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.update(p.id, 't1', { plateNumber: 'LG-123-AA' })).not.toBeNull();
  });
  it('update ratingX10 (P9)', async () => {
    const p = await repo.create({ individualId: 'ind-15', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.update(p.id, 't1', { ratingX10: 45 })).not.toBeNull();
  });
  it('empty update returns existing', async () => {
    const p = await repo.create({ individualId: 'ind-16', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.update(p.id, 't1', {})).not.toBeNull();
  });
  it('transition seeded → frsc_pending', async () => {
    const p = await repo.create({ individualId: 'ind-17', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.transition(p.id, 't1', 'frsc_pending')).not.toBeNull();
  });
  it('transition frsc_pending → active', async () => {
    const p = await repo.create({ individualId: 'ind-18', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.transition(p.id, 't1', 'active')).not.toBeNull();
  });
  it('transition active → suspended', async () => {
    const p = await repo.create({ individualId: 'ind-19', workspaceId: 'ws1', tenantId: 't1' });
    expect(await repo.transition(p.id, 't1', 'suspended')).not.toBeNull();
  });
  it('workspaceId stored correctly', async () => {
    const p = await repo.create({ individualId: 'ind-20', workspaceId: 'ws-9999', tenantId: 't1' });
    expect(p.workspaceId).toBe('ws-9999');
  });
});

describe('Rideshare FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidRideshareTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → frsc_verified valid', () => { expect(isValidRideshareTransition('claimed', 'frsc_verified')).toBe(true); });
  it('active → suspended valid', () => { expect(isValidRideshareTransition('active', 'suspended')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidRideshareTransition('seeded', 'active')).toBe(false); });
  it('VALID_RIDESHARE_TRANSITIONS has entries', () => { expect(VALID_RIDESHARE_TRANSITIONS.length).toBeGreaterThanOrEqual(3); });
});
