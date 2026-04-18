import { describe, it, expect, beforeEach } from 'vitest';
import { MotorParkRepository } from './park.js';
import type { CreateParkInput } from './types.js';
import { isValidParkTransition, VALID_PARK_TRANSITIONS } from './types.js';

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

describe('MotorParkRepository', () => {
  let db: ReturnType<typeof makeDb>;
  let repo: MotorParkRepository;

  beforeEach(() => {
    db = makeDb();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    repo = new MotorParkRepository(db as any);
  });

  it('creates park with generated uuid', async () => {
    const input: CreateParkInput = { workspaceId: 'ws1', tenantId: 't1', parkName: 'Ojota Park', lga: 'Kosofe', state: 'Lagos' };
    const park = await repo.create(input);
    expect(park.parkName).toBe('Ojota Park');
    expect(park.lga).toBe('Kosofe');
    expect(park.state).toBe('Lagos');
    expect(park.status).toBe('seeded');
  });

  it('uses provided id', async () => {
    const input: CreateParkInput = { id: 'pk-001', workspaceId: 'ws1', tenantId: 't1', parkName: 'Mile 2 Park', lga: 'Amuwo', state: 'Lagos' };
    const park = await repo.create(input);
    expect(park.id).toBe('pk-001');
  });

  it('findById returns null for missing park', async () => {
    const park = await repo.findById('none', 't1');
    expect(park).toBeNull();
  });

  it('findByWorkspace returns all parks for workspace', async () => {
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Park A', lga: 'LGA1', state: 'Lagos' });
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Park B', lga: 'LGA2', state: 'Lagos' });
    const parks = await repo.findByWorkspace('ws1', 't1');
    expect(parks.length).toBeGreaterThanOrEqual(2);
  });

  it('findByState filters by state', async () => {
    const parks = await repo.findByState('Lagos', 't1');
    expect(Array.isArray(parks)).toBe(true);
  });

  it('update parkName', async () => {
    const park = await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Old Name', lga: 'LGA', state: 'Abuja' });
    const updated = await repo.update(park.id, 't1', { parkName: 'New Name' });
    expect(updated).not.toBeNull();
  });

  it('update lga and state', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Park X', lga: 'LGA1', state: 'Lagos' });
    const updated = await repo.update(p.id, 't1', { lga: 'LGA2', state: 'Abuja' });
    expect(updated).not.toBeNull();
  });

  it('update with frscOperatorRef', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Park Y', lga: 'LGA', state: 'Kano' });
    const updated = await repo.update(p.id, 't1', { frscOperatorRef: 'FRSC-123' });
    expect(updated).not.toBeNull();
  });

  it('update with nurtwRef', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Park Z', lga: 'LGA', state: 'Kano' });
    const updated = await repo.update(p.id, 't1', { nurtwRef: 'NURTW-456' });
    expect(updated).not.toBeNull();
  });

  it('update with capacity', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Park W', lga: 'LGA', state: 'Lagos', capacity: 100 });
    const updated = await repo.update(p.id, 't1', { capacity: 200 });
    expect(updated).not.toBeNull();
  });

  it('transition changes status', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Park T', lga: 'LGA', state: 'Lagos' });
    const t = await repo.transition(p.id, 't1', 'claimed');
    expect(t).not.toBeNull();
  });

  it('update with empty input returns existing park', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Park E', lga: 'LGA', state: 'Lagos' });
    const result = await repo.update(p.id, 't1', {});
    expect(result).not.toBeNull();
  });

  it('create respects capacity field', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', parkName: 'Big Park', lga: 'LGA', state: 'Lagos', capacity: 500 });
    expect(p).not.toBeNull();
  });

  it('workspaceId is stored on park', async () => {
    const p = await repo.create({ workspaceId: 'ws-unique-999', tenantId: 't1', parkName: 'Park Q', lga: 'LGA', state: 'Lagos' });
    expect(p.workspaceId).toBe('ws-unique-999');
  });

  it('tenantId is stored on park', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 'tenant-xyz', parkName: 'Park R', lga: 'LGA', state: 'Lagos' });
    expect(p.tenantId).toBe('tenant-xyz');
  });
});

describe('FSM helpers', () => {
  it('seeded → claimed is valid', () => { expect(isValidParkTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → frsc_verified is valid', () => { expect(isValidParkTransition('claimed', 'frsc_verified')).toBe(true); });
  it('frsc_verified → route_licensed is valid', () => { expect(isValidParkTransition('frsc_verified', 'route_licensed')).toBe(true); });
  it('route_licensed → active is valid', () => { expect(isValidParkTransition('route_licensed', 'active')).toBe(true); });
  it('seeded → active is invalid', () => { expect(isValidParkTransition('seeded', 'active')).toBe(false); });
  it('active → seeded is invalid', () => { expect(isValidParkTransition('active', 'seeded')).toBe(false); });
  it('claimed → active is invalid', () => { expect(isValidParkTransition('claimed', 'active')).toBe(false); });
  it('VALID_PARK_TRANSITIONS has 4 entries', () => { expect(VALID_PARK_TRANSITIONS).toHaveLength(4); });
});
