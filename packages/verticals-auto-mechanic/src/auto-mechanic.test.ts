/**
 * packages/verticals-auto-mechanic — AutoMechanicRepository tests
 * M9 acceptance: ≥15 tests covering FSM, CRUD, P9, P13, T3, AI gates.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AutoMechanicRepository } from './auto-mechanic.js';
import {
  guardSeedToClaimed,
  guardClaimedToCacVerified,
  guardCacVerifiedToActive,
  isValidAutoMechanicTransition,
} from './types.js';

// ---------------------------------------------------------------------------
// Minimal in-memory D1 mock
// ---------------------------------------------------------------------------
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
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim()).filter((s: string) => !s.startsWith('updated_at'));
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = clause.split('=')[0]!.trim();
                (store[idx] as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r => {
          if (vals.length >= 2) return r['id'] === vals[0] && r['tenant_id'] === vals[1];
          return r['id'] === vals[0];
        });
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        const results = store.filter(r => {
          if (vals.length >= 2) return r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1];
          return true;
        });
        return { results } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof AutoMechanicRepository>[0];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('AutoMechanicRepository', () => {
  let repo: AutoMechanicRepository;
  beforeEach(() => { repo = new AutoMechanicRepository(makeDb() as never); });

  it('T001 — creates a profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', workshopName: "Victor's Garage", state: 'Lagos', lga: 'Ikeja' });
    expect(p.status).toBe('seeded');
    expect(p.tenantId).toBe('tn1');
    expect(p.workshopName).toBe("Victor's Garage");
  });

  it('T002 — findProfileById returns null for wrong tenant (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', workshopName: 'G1', state: 'Lagos', lga: 'Ikeja' });
    const fetched = await repo.findProfileById(p.id, 'tn-other');
    expect(fetched).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — FSM guard claimed→cac_verified requires CAC number', () => {
    expect(guardClaimedToCacVerified({ cacNumber: null }).allowed).toBe(false);
    expect(guardClaimedToCacVerified({ cacNumber: 'RC123456' }).allowed).toBe(true);
  });

  it('T005 — FSM guard cac_verified→active requires VIO registration', () => {
    expect(guardCacVerifiedToActive({ vioRegistration: null }).allowed).toBe(false);
    expect(guardCacVerifiedToActive({ vioRegistration: 'VIO/LG/001' }).allowed).toBe(true);
  });

  it('T006 — isValidAutoMechanicTransition validates FSM edges', () => {
    expect(isValidAutoMechanicTransition('seeded', 'claimed')).toBe(true);
    expect(isValidAutoMechanicTransition('claimed', 'cac_verified')).toBe(true);
    expect(isValidAutoMechanicTransition('cac_verified', 'active')).toBe(true);
    expect(isValidAutoMechanicTransition('seeded', 'active')).toBe(false);
    expect(isValidAutoMechanicTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — invalid FSM transitions are rejected (T4)', () => {
    expect(isValidAutoMechanicTransition('seeded', 'suspended')).toBe(false);
    expect(isValidAutoMechanicTransition('active', 'cac_verified')).toBe(false);
  });

  it('T008 — transitionProfile updates FSM status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', workshopName: 'G1', state: 'Lagos', lga: 'Ikeja' });
    const updated = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(updated?.status).toBe('claimed');
  });

  it('T009 — creates job card with integer kobo (P9)', async () => {
    const card = await repo.createJobCard({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'LG-123-AA', customerPhone: '08000000001', complaint: 'Engine knock', labourCostKobo: 50000, partsCostKobo: 20000 });
    expect(card.labourCostKobo).toBe(50000);
    expect(card.partsCostKobo).toBe(20000);
    expect(card.status).toBe('open');
  });

  it('T010 — rejects fractional kobo for labour cost (P9)', async () => {
    await expect(repo.createJobCard({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'LG-999-AA', customerPhone: '0800000000', complaint: 'Oil leak', labourCostKobo: 500.5 })).rejects.toThrow('[P9]');
  });

  it('T011 — rejects fractional kobo for parts cost (P9)', async () => {
    await expect(repo.createJobCard({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'LG-888-AA', customerPhone: '0800000000', complaint: 'Brake', labourCostKobo: 5000, partsCostKobo: 99.9 })).rejects.toThrow('[P9]');
  });

  it('T012 — job card status progression open→in_progress', async () => {
    const card = await repo.createJobCard({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'LG-555-AA', customerPhone: '0800000002', complaint: 'Tyres', labourCostKobo: 10000 });
    const updated = await repo.updateJobCardStatus(card.id, 'tn1', 'in_progress');
    expect(updated?.status).toBe('in_progress');
  });

  it('T013 — creates part with integer unit_cost_kobo (P9)', async () => {
    const part = await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Brake pad', quantityInStock: 10, unitCostKobo: 8000 });
    expect(part.unitCostKobo).toBe(8000);
    expect(part.quantityInStock).toBe(10);
  });

  it('T014 — rejects fractional unit_cost_kobo for parts (P9)', async () => {
    await expect(repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Filter', quantityInStock: 5, unitCostKobo: 1200.5 })).rejects.toThrow('[P9]');
  });

  it('T015 — listLowStockParts returns parts at/below reorder level', async () => {
    await repo.createPart({ id: 'p1', workspaceId: 'ws1', tenantId: 'tn1', partName: 'Oil filter', quantityInStock: 2, unitCostKobo: 3000, reorderLevel: 5 });
    const low = await repo.listLowStockParts('ws1', 'tn1');
    expect(low.length).toBeGreaterThan(0);
  });

  it('T016 — cross-tenant job card is isolated (T3)', async () => {
    const card = await repo.createJobCard({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'LG-001-AA', customerPhone: '0800000003', complaint: 'Fan belt', labourCostKobo: 5000 });
    const fetched = await repo.findJobCardById(card.id, 'tn-other');
    expect(fetched).toBeNull();
  });

  it('T017 — createProfile with optional cacNumber and vioRegistration', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', workshopName: 'Alpha Garage', state: 'Kano', lga: 'Nassarawa', cacNumber: 'RC-999', vioRegistration: 'VIO/KN/007' });
    expect(p.cacNumber).toBe('RC-999');
    expect(p.vioRegistration).toBe('VIO/KN/007');
  });

  it('T018 — findProfilesByWorkspace returns multiple profiles for same workspace', async () => {
    await repo.createProfile({ workspaceId: 'ws-multi', tenantId: 'tn1', workshopName: 'Shop A', state: 'Lagos', lga: 'Ikeja' });
    await repo.createProfile({ workspaceId: 'ws-multi', tenantId: 'tn1', workshopName: 'Shop B', state: 'Lagos', lga: 'Ikeja' });
    const list = await repo.findProfilesByWorkspace('ws-multi', 'tn1');
    expect(list.length).toBeGreaterThanOrEqual(2);
  });

  it('T019 — findProfilesByWorkspace returns empty for different tenant (T3)', async () => {
    await repo.createProfile({ workspaceId: 'ws-t3', tenantId: 'tn-a', workshopName: 'Tenant A Shop', state: 'Oyo', lga: 'Ibadan' });
    const list = await repo.findProfilesByWorkspace('ws-t3', 'tn-b');
    expect(list.length).toBe(0);
  });

  it('T020 — updateProfile changes workshopName', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', workshopName: 'Old Name', state: 'Lagos', lga: 'Ikeja' });
    const updated = await repo.updateProfile(p.id, 'tn1', { workshopName: 'New Name' });
    expect(updated?.workshopName).toBe('New Name');
  });

  it('T021 — suspended profile can return to active (FSM cycle)', () => {
    expect(isValidAutoMechanicTransition('active', 'suspended')).toBe(true);
    expect(isValidAutoMechanicTransition('suspended', 'active')).toBe(true);
  });

  it('T022 — listJobCards filters by status', async () => {
    await repo.createJobCard({ workspaceId: 'ws-filter', tenantId: 'tn1', vehiclePlate: 'AB-001-CD', customerPhone: '0800000010', complaint: 'Clutch', labourCostKobo: 15000 });
    const openCards = await repo.listJobCards('ws-filter', 'tn1', 'open');
    expect(openCards.every(c => c.status === 'open')).toBe(true);
  });

  it('T023 — listJobCards without filter returns all cards for workspace', async () => {
    await repo.createJobCard({ workspaceId: 'ws-all', tenantId: 'tn1', vehiclePlate: 'KN-100-AA', customerPhone: '0800000020', complaint: 'AC', labourCostKobo: 25000 });
    const all = await repo.listJobCards('ws-all', 'tn1');
    expect(all.length).toBeGreaterThan(0);
  });

  it('T024 — job card status transitions open→completed', async () => {
    const card = await repo.createJobCard({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'RV-200-AA', customerPhone: '0800000030', complaint: 'Steering', labourCostKobo: 30000 });
    const completed = await repo.updateJobCardStatus(card.id, 'tn1', 'completed');
    expect(completed?.status).toBe('completed');
  });

  it('T025 — job card status transitions completed→invoiced', async () => {
    const card = await repo.createJobCard({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'RV-300-AA', customerPhone: '0800000031', complaint: 'Radiator', labourCostKobo: 20000 });
    await repo.updateJobCardStatus(card.id, 'tn1', 'completed');
    const invoiced = await repo.updateJobCardStatus(card.id, 'tn1', 'invoiced');
    expect(invoiced?.status).toBe('invoiced');
  });

  it('T026 — listParts returns all parts for workspace', async () => {
    await repo.createPart({ workspaceId: 'ws-parts', tenantId: 'tn1', partName: 'Spark plug', quantityInStock: 50, unitCostKobo: 1500 });
    await repo.createPart({ workspaceId: 'ws-parts', tenantId: 'tn1', partName: 'Fuel filter', quantityInStock: 20, unitCostKobo: 3500 });
    const parts = await repo.listParts('ws-parts', 'tn1');
    expect(parts.length).toBeGreaterThanOrEqual(2);
  });

  it('T027 — parts cross-tenant isolation (T3)', async () => {
    await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn-parts', partName: 'Air filter', quantityInStock: 10, unitCostKobo: 2000 });
    const parts = await repo.listParts('ws1', 'tn-other-parts');
    expect(parts.length).toBe(0);
  });

  it('T028 — createPart stores partNumber when provided', async () => {
    const part = await repo.createPart({ workspaceId: 'ws1', tenantId: 'tn1', partName: 'Oil pump', partNumber: 'OP-9920', quantityInStock: 3, unitCostKobo: 45000 });
    expect(part.partNumber).toBe('OP-9920');
  });

  it('T029 — job card P9: zero labour cost is valid', async () => {
    const card = await repo.createJobCard({ workspaceId: 'ws1', tenantId: 'tn1', vehiclePlate: 'LA-000-AA', customerPhone: '0800000099', complaint: 'Warranty check', labourCostKobo: 0 });
    expect(card.labourCostKobo).toBe(0);
  });

  it('T030 — registerAutoMechanicVertical returns correct metadata', async () => {
    const { registerAutoMechanicVertical } = await import('./index.js');
    const meta = registerAutoMechanicVertical();
    expect(meta.slug).toBe('auto-mechanic');
    expect(meta.primary_pillars).toContain('ops');
    expect(typeof meta.ai_autonomy_level).toBe('number');
  });
});
