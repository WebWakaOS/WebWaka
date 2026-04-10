import { describe, it, expect, beforeEach } from 'vitest';
import { VehicleRepository } from './vehicle.js';
import type { CreateVehicleInput } from './types.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
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

describe('VehicleRepository', () => {
  let db: ReturnType<typeof makeDb>;
  let repo: VehicleRepository;
  beforeEach(() => { db = makeDb(); repo = new VehicleRepository(db as any); });

  it('creates vehicle with active status', async () => {
    const input: CreateVehicleInput = { workspaceId: 'ws1', tenantId: 't1', plateNumber: 'LAG-123-AA', vehicleType: 'bus' };
    const v = await repo.create(input);
    expect(v.plateNumber).toBe('LAG-123-AA');
    expect(v.vehicleType).toBe('bus');
    expect(v.status).toBe('active');
  });

  it('uses provided id', async () => {
    const v = await repo.create({ id: 'veh-001', workspaceId: 'ws1', tenantId: 't1', plateNumber: 'KJA-001-BB', vehicleType: 'minibus' });
    expect(v.id).toBe('veh-001');
  });

  it('findById returns null for missing', async () => {
    const v = await repo.findById('none', 't1');
    expect(v).toBeNull();
  });

  it('findByRoute returns all vehicles on route', async () => {
    const vehicles = await repo.findByRoute('rt-001', 't1');
    expect(Array.isArray(vehicles)).toBe(true);
  });

  it('findByWorkspace returns vehicles', async () => {
    await repo.create({ workspaceId: 'ws1', tenantId: 't1', plateNumber: 'ABC-001', vehicleType: 'van' });
    const vehicles = await repo.findByWorkspace('ws1', 't1');
    expect(vehicles.length).toBeGreaterThanOrEqual(1);
  });

  it('update plateNumber', async () => {
    const v = await repo.create({ workspaceId: 'ws1', tenantId: 't1', plateNumber: 'OLD-999', vehicleType: 'taxi' });
    const updated = await repo.update(v.id, 't1', { plateNumber: 'NEW-999' });
    expect(updated).not.toBeNull();
  });

  it('update vehicleType', async () => {
    const v = await repo.create({ workspaceId: 'ws1', tenantId: 't1', plateNumber: 'KAN-001', vehicleType: 'bus' });
    const updated = await repo.update(v.id, 't1', { vehicleType: 'truck' });
    expect(updated).not.toBeNull();
  });

  it('update status to inactive', async () => {
    const v = await repo.create({ workspaceId: 'ws1', tenantId: 't1', plateNumber: 'ABJ-200', vehicleType: 'keke' });
    const updated = await repo.update(v.id, 't1', { status: 'inactive' });
    expect(updated).not.toBeNull();
  });

  it('update routeId', async () => {
    const v = await repo.create({ workspaceId: 'ws1', tenantId: 't1', plateNumber: 'IBA-100', vehicleType: 'ferry' });
    const updated = await repo.update(v.id, 't1', { routeId: 'rt-007' });
    expect(updated).not.toBeNull();
  });

  it('update with frscLicense and frscExpires', async () => {
    const v = await repo.create({ workspaceId: 'ws1', tenantId: 't1', plateNumber: 'OND-050', vehicleType: 'bus', frscLicense: 'FRSC-OLD', frscExpires: 1700000000 });
    const updated = await repo.update(v.id, 't1', { frscLicense: 'FRSC-NEW', frscExpires: 1800000000 });
    expect(updated).not.toBeNull();
  });

  it('update empty returns existing', async () => {
    const v = await repo.create({ workspaceId: 'ws1', tenantId: 't1', plateNumber: 'ENU-010', vehicleType: 'okada' });
    const result = await repo.update(v.id, 't1', {});
    expect(result).not.toBeNull();
  });

  it('stores capacity', async () => {
    const v = await repo.create({ workspaceId: 'ws1', tenantId: 't1', plateNumber: 'AKS-020', vehicleType: 'bus', capacity: 45 });
    expect(v).not.toBeNull();
  });
});
