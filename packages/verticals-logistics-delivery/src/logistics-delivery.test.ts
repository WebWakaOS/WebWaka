/**
 * @webwaka/verticals-logistics-delivery — LogisticsDeliveryRepository tests (M9)
 * Acceptance: ≥30 tests covering FSM, P9, T3, orders, fleet management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LogisticsDeliveryRepository } from './logistics-delivery.js';
import {
  isValidLogisticsDeliveryTransition,
  guardL2AiCap,
} from './types.js';

function makeDb() {
  const stores: Record<string, Record<string, unknown>[]> = {};
  const getStore = (sql: string): Record<string, unknown>[] => {
    const m = sql.match(/(?:INSERT INTO|UPDATE|SELECT\s.+?\sFROM|DELETE FROM)\s+(\w+)/i);
    const name = m?.[1] ?? 'default';
    if (!stores[name]) stores[name] = [];
    const store = stores[name];
    if (!store) throw new Error(`Store not found: ${name}`);
    return store;
  };

  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      run: async () => {
        const store = getStore(sql);
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
            if (!row['status']) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            if (!row['updated_at']) row['updated_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.toLowerCase().startsWith('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              let bi = 0;
              clauses.forEach((clause: string) => {
                const eqIdx = clause.indexOf('=');
                const col = clause.slice(0, eqIdx).trim();
                const rhs = clause.slice(eqIdx + 1).trim();
                if (rhs === '?') {
                  (store[idx] as Record<string, unknown>)[col] = vals[bi++];
                } else if (rhs.startsWith("'") && rhs.endsWith("'")) {
                  (store[idx] as Record<string, unknown>)[col] = rhs.slice(1, -1);
                } else if (rhs.toLowerCase() !== 'unixepoch()' && !Number.isNaN(Number(rhs)) && rhs !== '') {
                  (store[idx] as Record<string, unknown>)[col] = Number(rhs);
                }
              });
              (store[idx] as Record<string, unknown>)['updated_at'] = Math.floor(Date.now() / 1000);
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        const store = getStore(sql);
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        // workspace_id lookup (findProfileByWorkspace)
        if (sql.toLowerCase().includes('workspace_id=?') && !sql.toLowerCase().includes(' id=?')) {
          const found = store.find(r => r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1]);
          return (found ?? null) as T;
        }
        if (vals.length >= 2) {
          const found = store.find(r => r['id'] === vals[0] && r['tenant_id'] === vals[1]);
          return (found ?? null) as T;
        }
        if (vals.length === 1) return (store.find(r => r['id'] === vals[0]) ?? null) as T;
        return (store[0] ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        const store = getStore(sql);
        const filtered = store.filter(r => {
          if (vals.length >= 2) {
            return (r['profile_id'] === vals[0] || r['workspace_id'] === vals[0]) && r['tenant_id'] === vals[1];
          }
          return true;
        });
        return { results: filtered } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof LogisticsDeliveryRepository>[0];
}

describe('LogisticsDeliveryRepository — Profile Management', () => {
  let repo: LogisticsDeliveryRepository;
  beforeEach(() => { repo = new LogisticsDeliveryRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'FastMove Logistics' });
    expect(p.status).toBe('seeded');
    expect(p.businessName).toBe('FastMove Logistics');
  });

  it('T002 — uses provided id', async () => {
    const p = await repo.createProfile({ id: 'lg-001', workspaceId: 'ws1', tenantId: 'tn1', businessName: 'SpeedEx' });
    expect(p.id).toBe('lg-001');
  });

  it('T003 — tenant isolation: cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Isolated Logistics' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T004 — findProfileById returns null for missing', async () => {
    expect(await repo.findProfileById('nonexistent', 'tn1')).toBeNull();
  });

  it('T005 — findProfileByWorkspace returns correct profile', async () => {
    await repo.createProfile({ workspaceId: 'ws-abc', tenantId: 'tn1', businessName: 'AbcLog' });
    const p = await repo.findProfileByWorkspace('ws-abc', 'tn1');
    expect(p).not.toBeNull();
    expect(p?.businessName).toBe('AbcLog');
  });

  it('T006 — stores service type correctly', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws2', tenantId: 'tn1', businessName: 'Interstate Moves', serviceType: 'interstate' });
    expect(p.serviceType).toBe('interstate');
  });

  it('T007 — stores FRSC cert and CAC RC', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws3', tenantId: 'tn1', businessName: 'Reg Logistics', frscCert: 'FRSC/2024/001', cacRc: 'RC999' });
    expect(p.frscCert).toBe('FRSC/2024/001');
    expect(p.cacRc).toBe('RC999');
  });
});

describe('LogisticsDeliveryRepository — FSM Transitions', () => {
  let repo: LogisticsDeliveryRepository;
  beforeEach(() => { repo = new LogisticsDeliveryRepository(makeDb() as never); });

  it('T008 — valid FSM: seeded→claimed', () => {
    expect(isValidLogisticsDeliveryTransition('seeded', 'claimed')).toBe(true);
  });

  it('T009 — valid FSM: claimed→frsc_verified', () => {
    expect(isValidLogisticsDeliveryTransition('claimed', 'frsc_verified')).toBe(true);
  });

  it('T010 — valid FSM: frsc_verified→active', () => {
    expect(isValidLogisticsDeliveryTransition('frsc_verified', 'active')).toBe(true);
  });

  it('T011 — valid FSM: active→suspended', () => {
    expect(isValidLogisticsDeliveryTransition('active', 'suspended')).toBe(true);
  });

  it('T012 — valid FSM: suspended→active (reinstatement)', () => {
    expect(isValidLogisticsDeliveryTransition('suspended', 'active')).toBe(true);
  });

  it('T013 — invalid FSM: seeded→active (skips steps)', () => {
    expect(isValidLogisticsDeliveryTransition('seeded', 'active')).toBe(false);
  });

  it('T014 — invalid FSM: active→seeded', () => {
    expect(isValidLogisticsDeliveryTransition('active', 'seeded')).toBe(false);
  });

  it('T015 — transitionStatus updates profile', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Transit Co' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'claimed');
    expect(updated.status).toBe('claimed');
  });

  it('T016 — transitionStatus stores FRSC cert', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'FRSC Verified Co' });
    const updated = await repo.transitionStatus(p.id, 'tn1', 'frsc_verified', { frscCert: 'FRSC/2024/999' });
    expect(updated.frscCert).toBe('FRSC/2024/999');
  });

  it('T017 — AI L2 cap guard blocks L3+', () => {
    expect(guardL2AiCap({ autonomyLevel: 3 }).allowed).toBe(false);
    expect(guardL2AiCap({ autonomyLevel: 2 }).allowed).toBe(true);
  });
});

describe('LogisticsDeliveryRepository — Orders', () => {
  let repo: LogisticsDeliveryRepository;
  beforeEach(() => { repo = new LogisticsDeliveryRepository(makeDb() as never); });

  it('T018 — creates delivery order with integer kobo values (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'P9 Logistics' });
    const order = await repo.createOrder(p.id, 'tn1', {
      senderRefId: 'sender-001', recipientRefId: 'recipient-001',
      pickupAddress: '5 Lagos Island', deliveryAddress: '10 Victoria Island',
      packageType: 'parcel', weightGrams: 500, declaredValueKobo: 500000, deliveryFeeKobo: 50000,
    });
    expect(order.deliveryFeeKobo).toBe(50000);
    expect(order.declaredValueKobo).toBe(500000);
    expect(order.status).toBe('pending');
  });

  it('T019 — rejects float deliveryFeeKobo (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Float Co' });
    await expect(repo.createOrder(p.id, 'tn1', {
      senderRefId: 'sender-002', recipientRefId: 'recipient-002',
      pickupAddress: 'A', deliveryAddress: 'B',
      weightGrams: 100, declaredValueKobo: 100000, deliveryFeeKobo: 50000.50,
    })).rejects.toThrow(/integer/i);
  });

  it('T020 — rejects non-integer weightGrams', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Weight Co' });
    await expect(repo.createOrder(p.id, 'tn1', {
      senderRefId: 's1', recipientRefId: 'r1',
      pickupAddress: 'A', deliveryAddress: 'B',
      weightGrams: 1.5, declaredValueKobo: 100000, deliveryFeeKobo: 5000,
    })).rejects.toThrow(/integer/i);
  });

  it('T021 — listOrders returns tenant-scoped orders', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'List Logistics' });
    await repo.createOrder(p.id, 'tn1', {
      senderRefId: 's1', recipientRefId: 'r1',
      pickupAddress: '1 A', deliveryAddress: '2 B',
      weightGrams: 300, declaredValueKobo: 300000, deliveryFeeKobo: 30000,
    });
    const list = await repo.listOrders(p.id, 'tn1');
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it('T022 — updateOrderStatus transitions order state', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Status Logistics' });
    const order = await repo.createOrder(p.id, 'tn1', {
      senderRefId: 's2', recipientRefId: 'r2',
      pickupAddress: 'X', deliveryAddress: 'Y',
      weightGrams: 200, declaredValueKobo: 200000, deliveryFeeKobo: 20000,
    });
    const updated = await repo.updateOrderStatus(order.id, 'tn1', 'picked_up');
    expect(updated.status).toBe('picked_up');
  });

  it('T023 — sender_ref_id and recipient_ref_id are opaque (P13)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Opaque Logistics' });
    const order = await repo.createOrder(p.id, 'tn1', {
      senderRefId: 'opaque-sender-xyz', recipientRefId: 'opaque-recipient-abc',
      pickupAddress: 'Origin', deliveryAddress: 'Destination',
      weightGrams: 100, declaredValueKobo: 50000, deliveryFeeKobo: 5000,
    });
    expect(order.senderRefId).toBe('opaque-sender-xyz');
    expect(order.recipientRefId).toBe('opaque-recipient-abc');
  });

  it('T024 — order packageType stored correctly', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Pkg Type Co' });
    const order = await repo.createOrder(p.id, 'tn1', {
      senderRefId: 's3', recipientRefId: 'r3',
      pickupAddress: 'A', deliveryAddress: 'B',
      packageType: 'fragile', weightGrams: 150, declaredValueKobo: 1000000, deliveryFeeKobo: 80000,
    });
    expect(order.packageType).toBe('fragile');
  });
});

describe('LogisticsDeliveryRepository — Fleet Management', () => {
  let repo: LogisticsDeliveryRepository;
  beforeEach(() => { repo = new LogisticsDeliveryRepository(makeDb() as never); });

  it('T025 — creates fleet vehicle with integer capacity (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Fleet Logistics' });
    const vehicle = await repo.createFleetVehicle(p.id, 'tn1', {
      vehicleType: 'van', plateNumber: 'ABC-123-LG', capacityKgX100: 100000,
    });
    expect(vehicle.capacityKgX100).toBe(100000);
    expect(vehicle.plateNumber).toBe('ABC-123-LG');
    expect(vehicle.status).toBe('available');
  });

  it('T026 — rejects float capacityKgX100 (P9)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Bad Fleet' });
    await expect(repo.createFleetVehicle(p.id, 'tn1', {
      vehicleType: 'motorcycle', plateNumber: 'XYZ-999', capacityKgX100: 5000.5,
    })).rejects.toThrow(/integer/i);
  });

  it('T027 — listFleet returns vehicles for profile', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Big Fleet Co' });
    await repo.createFleetVehicle(p.id, 'tn1', { vehicleType: 'motorcycle', plateNumber: 'MOT-001', capacityKgX100: 10000 });
    await repo.createFleetVehicle(p.id, 'tn1', { vehicleType: 'truck', plateNumber: 'TRK-001', capacityKgX100: 500000 });
    const fleet = await repo.listFleet(p.id, 'tn1');
    expect(fleet.length).toBeGreaterThanOrEqual(2);
  });

  it('T028 — vehicle stores driverRefId (P13 opaque)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Driver Co' });
    const vehicle = await repo.createFleetVehicle(p.id, 'tn1', {
      vehicleType: 'car', plateNumber: 'CAR-001', capacityKgX100: 40000, driverRefId: 'driver-ref-opaque',
    });
    expect(vehicle.driverRefId).toBe('driver-ref-opaque');
  });

  it('T029 — tenantId always present on all entities (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-invariant', businessName: 'T3 Co' });
    expect(p.tenantId).toBe('tn-invariant');
    const order = await repo.createOrder(p.id, 'tn-invariant', {
      senderRefId: 's', recipientRefId: 'r', pickupAddress: 'A', deliveryAddress: 'B',
      weightGrams: 1000, declaredValueKobo: 100000, deliveryFeeKobo: 10000,
    });
    expect(order.tenantId).toBe('tn-invariant');
  });

  it('T030 — tenant isolation on fleet list (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn-A', businessName: 'TN-A Fleet' });
    await repo.createFleetVehicle(p.id, 'tn-A', { vehicleType: 'van', plateNumber: 'VAN-001', capacityKgX100: 50000 });
    const fleetB = await repo.listFleet(p.id, 'tn-B');
    expect(fleetB.length).toBe(0);
  });

  it('T031 — all service types supported', async () => {
    const types = ['same_day', 'next_day', 'interstate', 'all'] as const;
    for (const t of types) {
      const p = await repo.createProfile({ workspaceId: `ws-${t}`, tenantId: 'tn1', businessName: `${t} Logistics`, serviceType: t });
      expect(p.serviceType).toBe(t);
    }
  });
});
