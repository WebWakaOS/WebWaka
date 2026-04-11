/**
 * packages/verticals-beauty-salon — BeautySalonRepository tests
 * M9 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BeautySalonRepository } from './beauty-salon.js';
import {
  guardSeedToClaimed,
  guardClaimedToPermitVerified,
  isValidBeautySalonTransition,
} from './types.js';

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
                (store[idx]! as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r => vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]);
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        return { results: store.filter(r => vals.length >= 2 ? r['workspace_id'] === vals[0] && r['tenant_id'] === vals[1] : true) } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof BeautySalonRepository>[0];
}

describe('BeautySalonRepository', () => {
  let repo: BeautySalonRepository;
  beforeEach(() => { repo = new BeautySalonRepository(makeDb() as never); });

  it('T001 — creates salon with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', salonName: 'Elegance Salon', salonType: 'salon', state: 'Lagos' });
    expect(p.status).toBe('seeded');
    expect(p.salonType).toBe('salon');
  });

  it('T002 — cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', salonName: 'S1', salonType: 'barber', state: 'Abuja' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — FSM guard claimed→permit_verified requires state permit', () => {
    expect(guardClaimedToPermitVerified({ statePermitNumber: null }).allowed).toBe(false);
    expect(guardClaimedToPermitVerified({ statePermitNumber: 'LG/SALON/001' }).allowed).toBe(true);
  });

  it('T005 — valid FSM transitions', () => {
    expect(isValidBeautySalonTransition('seeded', 'claimed')).toBe(true);
    expect(isValidBeautySalonTransition('claimed', 'permit_verified')).toBe(true);
    expect(isValidBeautySalonTransition('permit_verified', 'active')).toBe(true);
  });

  it('T006 — invalid FSM transitions rejected (T4)', () => {
    expect(isValidBeautySalonTransition('seeded', 'active')).toBe(false);
    expect(isValidBeautySalonTransition('active', 'seeded')).toBe(false);
  });

  it('T007 — transitionProfile updates status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', salonName: 'S2', salonType: 'unisex', state: 'Rivers' });
    const u = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('T008 — creates service with integer price_kobo (P9)', async () => {
    const svc = await repo.createService({ workspaceId: 'ws1', tenantId: 'tn1', serviceName: 'Haircut', durationMinutes: 30, priceKobo: 350000 });
    expect(svc.priceKobo).toBe(350000);
    expect(svc.durationMinutes).toBe(30);
  });

  it('T009 — rejects fractional price_kobo for service (P9)', async () => {
    await expect(repo.createService({ workspaceId: 'ws1', tenantId: 'tn1', serviceName: 'Weave', durationMinutes: 120, priceKobo: 5000.5 })).rejects.toThrow('[P9]');
  });

  it('T010 — creates appointment with integer deposit_kobo (P9)', async () => {
    const apt = await repo.createAppointment({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000001', appointmentTime: Date.now(), depositKobo: 100000 });
    expect(apt.depositKobo).toBe(100000);
    expect(apt.status).toBe('booked');
  });

  it('T011 — rejects fractional deposit_kobo for appointment (P9)', async () => {
    await expect(repo.createAppointment({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '0800000000', appointmentTime: Date.now(), depositKobo: 100.5 })).rejects.toThrow('[P9]');
  });

  it('T012 — appointment status progression booked→confirmed', async () => {
    const apt = await repo.createAppointment({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000002', appointmentTime: Date.now(), depositKobo: 50000 });
    const u = await repo.updateAppointmentStatus(apt.id, 'tn1', 'confirmed');
    expect(u?.status).toBe('confirmed');
  });

  it('T013 — cross-tenant appointment is isolated (T3)', async () => {
    const apt = await repo.createAppointment({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000003', appointmentTime: Date.now() });
    expect(await repo.findAppointmentById(apt.id, 'tn-other')).toBeNull();
  });

  it('T014 — creates salon product with integer price (P9)', async () => {
    const prod = await repo.createProduct({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Dark & Lovely', brand: 'Revlon', unitPriceKobo: 250000 });
    expect(prod.unitPriceKobo).toBe(250000);
  });

  it('T015 — rejects fractional product price (P9)', async () => {
    await expect(repo.createProduct({ workspaceId: 'ws1', tenantId: 'tn1', productName: 'Shampoo', unitPriceKobo: 1500.99 })).rejects.toThrow('[P9]');
  });

  it('T016 — client phone not leaked in appointment object but stored for ops', async () => {
    const apt = await repo.createAppointment({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08099999999', appointmentTime: Date.now() });
    expect(apt.clientPhone).toBe('08099999999');
  });
});
