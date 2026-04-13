/**
 * packages/verticals-catering — CateringRepository tests
 * M9 acceptance: ≥15 tests.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CateringRepository } from './catering.js';
import {
  guardSeedToClaimed,
  guardClaimedToNafdacVerified,
  isValidCateringTransition,
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
        const found = store.find(r => vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]);
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        return { results: store.filter(r => vals.length >= 2 ? (r['workspace_id'] === vals[0] || r['id'] === vals[0]) && r['tenant_id'] === vals[1] : true) } as { results: T[] };
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof CateringRepository>[0];
}

describe('CateringRepository', () => {
  let repo: CateringRepository;
  beforeEach(() => { repo = new CateringRepository(makeDb() as never); });

  it('T001 — creates profile with status seeded', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'Mama Titi Catering' });
    expect(p.status).toBe('seeded');
    expect(p.businessName).toBe('Mama Titi Catering');
  });

  it('T002 — cross-tenant profile hidden (T3)', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'C1' });
    expect(await repo.findProfileById(p.id, 'tn-other')).toBeNull();
  });

  it('T003 — FSM guard seeded→claimed requires KYC Tier 1', () => {
    expect(guardSeedToClaimed({ kycTier: 0 }).allowed).toBe(false);
    expect(guardSeedToClaimed({ kycTier: 1 }).allowed).toBe(true);
  });

  it('T004 — FSM guard claimed→nafdac_verified requires cert', () => {
    expect(guardClaimedToNafdacVerified({ nafdacCert: null }).allowed).toBe(false);
    expect(guardClaimedToNafdacVerified({ nafdacCert: 'NAFDAC/C/001' }).allowed).toBe(true);
  });

  it('T005 — valid FSM transitions', () => {
    expect(isValidCateringTransition('seeded', 'claimed')).toBe(true);
    expect(isValidCateringTransition('claimed', 'nafdac_verified')).toBe(true);
    expect(isValidCateringTransition('nafdac_verified', 'active')).toBe(true);
  });

  it('T006 — invalid FSM transitions rejected (T4)', () => {
    expect(isValidCateringTransition('seeded', 'active')).toBe(false);
    expect(isValidCateringTransition('nafdac_verified', 'claimed')).toBe(false);
  });

  it('T007 — transitionProfile updates status', async () => {
    const p = await repo.createProfile({ workspaceId: 'ws1', tenantId: 'tn1', businessName: 'C2' });
    const u = await repo.transitionProfile(p.id, 'tn1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('T008 — creates event with integer kobo amounts (P9)', async () => {
    const e = await repo.createEvent({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000001', eventType: 'wedding', eventDate: Date.now(), guestCount: 200, pricePerHeadKobo: 500000, depositKobo: 20000000 });
    expect(e.pricePerHeadKobo).toBe(500000);
    expect(e.totalKobo).toBe(100000000);
    expect(e.depositKobo).toBe(20000000);
    expect(e.balanceKobo).toBe(80000000);
  });

  it('T009 — rejects fractional price_per_head_kobo (P9)', async () => {
    await expect(repo.createEvent({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '0800000000', eventType: 'burial', eventDate: Date.now(), guestCount: 100, pricePerHeadKobo: 250000.5 })).rejects.toThrow('[P9]');
  });

  it('T010 — event status progression quoted→confirmed', async () => {
    const e = await repo.createEvent({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000002', eventType: 'corporate', eventDate: Date.now(), guestCount: 50, pricePerHeadKobo: 300000 });
    const u = await repo.advanceEventStatus(e.id, 'tn1', 'confirmed');
    expect(u?.status).toBe('confirmed');
  });

  it('T011 — creates menu with integer cost_per_head_kobo (P9)', async () => {
    const m = await repo.createMenu({ workspaceId: 'ws1', tenantId: 'tn1', menuName: 'Jollof Rice Set', costPerHeadKobo: 350000 });
    expect(m.costPerHeadKobo).toBe(350000);
  });

  it('T012 — rejects fractional cost_per_head_kobo for menu (P9)', async () => {
    await expect(repo.createMenu({ workspaceId: 'ws1', tenantId: 'tn1', menuName: 'Eba Set', costPerHeadKobo: 200000.5 })).rejects.toThrow('[P9]');
  });

  it('T013 — creates staff record', async () => {
    const s = await repo.createStaff({ workspaceId: 'ws1', tenantId: 'tn1', staffName: 'Bola Adeniyi', role: 'cook' });
    expect(s.role).toBe('cook');
    expect(s.staffName).toBe('Bola Adeniyi');
  });

  it('T014 — cross-tenant event hidden (T3)', async () => {
    const e = await repo.createEvent({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000003', eventType: 'birthday', eventDate: Date.now(), guestCount: 30, pricePerHeadKobo: 200000 });
    expect(await repo.findEventById(e.id, 'tn-other')).toBeNull();
  });

  it('T015 — cross-tenant staff hidden (T3)', async () => {
    const s = await repo.createStaff({ workspaceId: 'ws1', tenantId: 'tn1', staffName: 'Ada Okafor', role: 'server' });
    expect(await repo.findStaffById(s.id, 'tn-other')).toBeNull();
  });

  it('T016 — event default status is quoted', async () => {
    const e = await repo.createEvent({ workspaceId: 'ws1', tenantId: 'tn1', clientPhone: '08000000004', eventType: 'wedding', eventDate: Date.now(), guestCount: 10, pricePerHeadKobo: 100000 });
    expect(e.status).toBe('quoted');
  });
});
