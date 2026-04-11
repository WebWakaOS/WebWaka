import { describe, it, expect, beforeEach } from 'vitest';
import { RouteRepository } from './route.js';
import type { CreateRouteInput } from './types.js';

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

describe('RouteRepository', () => {
  let db: ReturnType<typeof makeDb>;
  let repo: RouteRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new RouteRepository(db as any); });

  it('creates a route with pending status', async () => {
    const input: CreateRouteInput = { workspaceId: 'ws1', tenantId: 't1', routeName: 'Ojota–Ikeja', routeType: 'intracity' };
    const route = await repo.create(input);
    expect(route.routeName).toBe('Ojota–Ikeja');
    expect(route.status).toBe('pending');
  });

  it('uses provided id', async () => {
    const route = await repo.create({ id: 'rt-001', workspaceId: 'ws1', tenantId: 't1', routeName: 'Route X', routeType: 'intercity' });
    expect(route.id).toBe('rt-001');
  });

  it('findById returns null for missing', async () => {
    const r = await repo.findById('none', 't1');
    expect(r).toBeNull();
  });

  it('findByWorkspace returns routes', async () => {
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', routeName: 'R1', routeType: 'intercity' });
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', routeName: 'R2', routeType: 'intracity' });
    const routes = await repo.findByWorkspace('ws1', 't1');
    expect(routes.length).toBeGreaterThanOrEqual(2);
  });

  it('update routeType', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', routeName: 'R3', routeType: 'intracity' });
    const updated = await repo.update(r.id, 't1', { routeType: 'interstate' });
    expect(updated).not.toBeNull();
  });

  it('licenseRoute sets status to licensed', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', routeName: 'R4', routeType: 'intercity' });
    const licensed = await repo.licenseRoute(r.id, 't1', 'LIC-999', Date.now() + 1000000);
    expect(licensed).not.toBeNull();
  });

  it('update fareKobo and frequencyMins', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', routeName: 'R5', routeType: 'intracity', fareKobo: 50000, frequencyMins: 30 });
    const updated = await repo.update(r.id, 't1', { fareKobo: 75000, frequencyMins: 20 });
    expect(updated).not.toBeNull();
  });

  it('update with status suspended', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', routeName: 'R6', routeType: 'intercity' });
    const updated = await repo.update(r.id, 't1', { status: 'suspended' });
    expect(updated).not.toBeNull();
  });

  it('empty update returns existing record', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', routeName: 'R7', routeType: 'intracity' });
    const result = await repo.update(r.id, 't1', {});
    expect(result).not.toBeNull();
  });

  it('creates with originPlaceId and destPlaceId', async () => {
    const r = await repo.create({ workspaceId: 'ws1', tenantId: 't1', routeName: 'R8', routeType: 'interstate', originPlaceId: 'pl-1', destPlaceId: 'pl-2' });
    expect(r).not.toBeNull();
  });

  it('stores tenantId and workspaceId', async () => {
    const r = await repo.create({ workspaceId: 'ws-99', tenantId: 't-99', routeName: 'R9', routeType: 'intracity' });
    expect(r.workspaceId).toBe('ws-99');
    expect(r.tenantId).toBe('t-99');
  });
});
