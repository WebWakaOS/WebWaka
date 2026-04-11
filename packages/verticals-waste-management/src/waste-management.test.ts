/**
 * @webwaka/verticals-waste-management — tests (M11)
 * Minimum 15 tests. Covers: T3, P9, FSM (fmenv_verified), integer kg, KYC guards.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { WasteManagementRepository } from './waste-management.js';
import {
  isValidWasteMgmtTransition,
  guardClaimedToFmenvVerified,
  guardGovtContract,
} from './types.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bind = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      run: async () => {
        const s = sql.trim().toUpperCase();
        if (s.startsWith('INSERT')) {
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
              else if (tok.toLowerCase().includes('unixepoch')) { row[col] = Math.floor(Date.now() / 1000); }
              else if (tok.startsWith("'") && tok.endsWith("'")) { row[col] = tok.slice(1, -1); }
              else if (!Number.isNaN(Number(tok))) { row[col] = Number(tok); }
              else { row[col] = vals[bi++]; }
            });
            if (!row['status']) row['status'] = 'seeded';
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            if (!row['updated_at']) row['updated_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (s.startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/is);
          if (setM) {
            const clauses = setM[1]!.split(',').map((c: string) => c.trim()).filter((c: string) => !c.toLowerCase().includes('updated_at') && !c.toLowerCase().includes('unixepoch'));
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
        const found = store.find(r =>
          vals.length >= 2 ? r['id'] === vals[0] && r['tenant_id'] === vals[1] : r['id'] === vals[0]
        );
        return (found ?? null) as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => ({
        results: store.filter(r =>
          vals.length >= 2 ? (r['profile_id'] === vals[0] || r['workspace_id'] === vals[0]) && r['tenant_id'] === vals[1] : true
        ),
      } as { results: T[] }),
    });
    return { bind };
  };
  return { prepare: prep } as unknown as ConstructorParameters<typeof WasteManagementRepository>[0];
}

describe('WasteManagementRepository', () => {
  let repo: WasteManagementRepository;
  beforeEach(() => { repo = new WasteManagementRepository(makeDb() as never); });

  it('creates profile with seeded status', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'Lagos Clean Ltd' });
    expect(p.status).toBe('seeded');
    expect(p.companyName).toBe('Lagos Clean Ltd');
  });

  it('uses provided id', async () => {
    const p = await repo.create({ id: 'wm-001', workspaceId: 'ws1', tenantId: 't1', companyName: 'Apex Waste' });
    expect(p.id).toBe('wm-001');
  });

  it('findById null for wrong tenant (T3)', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'Green Waste' });
    expect(await repo.findById(p.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'FSM1' });
    const u = await repo.transition(p.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → fmenv_verified', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'FSM2' });
    await repo.update(p.id, 't1', { fmenvCert: 'FMENV-001' });
    const u = await repo.transition(p.id, 't1', 'fmenv_verified');
    expect(u?.status).toBe('fmenv_verified');
  });

  it('transitions fmenv_verified → active', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'FSM3' });
    await repo.transition(p.id, 't1', 'claimed');
    await repo.transition(p.id, 't1', 'fmenv_verified');
    const u = await repo.transition(p.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('creates collection route', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'Route Co' });
    const r = await repo.createRoute({ profileId: p.id, tenantId: 't1', routeName: 'Surulere North' });
    expect(r.routeName).toBe('Surulere North');
    expect(r.tenantId).toBe('t1');
  });

  it('creates subscription with integer monthly fee (P9)', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'Sub Co' });
    const s = await repo.createSubscription({ profileId: p.id, tenantId: 't1', monthlyFeeKobo: 500000 });
    expect(s.monthlyFeeKobo).toBe(500000);
  });

  it('rejects fractional kobo for subscription (P9)', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'P9-Sub' });
    await expect(repo.createSubscription({ profileId: p.id, tenantId: 't1', monthlyFeeKobo: 500.5 })).rejects.toThrow('P9');
  });

  it('creates tonnage log with integer weight kg', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'Ton Co' });
    const t = await repo.createTonnageLog({ profileId: p.id, tenantId: 't1', weightKg: 250, wasteType: 'plastic' });
    expect(t.weightKg).toBe(250);
  });

  it('rejects fractional weight kg', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'Frac-Ton' });
    await expect(repo.createTonnageLog({ profileId: p.id, tenantId: 't1', weightKg: 25.5 })).rejects.toThrow('integer');
  });

  it('creates recycling purchase and computes totalKobo correctly', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'Recycle Co' });
    const r = await repo.createRecyclingPurchase({ profileId: p.id, tenantId: 't1', weightKg: 100, pricePerKgKobo: 5000, materialType: 'plastic' });
    expect(r.totalKobo).toBe(500000);
    expect(r.materialType).toBe('plastic');
  });

  it('rejects fractional pricePerKgKobo (P9)', async () => {
    const p = await repo.create({ workspaceId: 'ws1', tenantId: 't1', companyName: 'Price-P9' });
    await expect(repo.createRecyclingPurchase({ profileId: p.id, tenantId: 't1', weightKg: 100, pricePerKgKobo: 50.5 })).rejects.toThrow('P9');
  });
});

describe('WasteMgmt FSM guards', () => {
  it('seeded → claimed valid', () => expect(isValidWasteMgmtTransition('seeded', 'claimed')).toBe(true));
  it('claimed → fmenv_verified valid', () => expect(isValidWasteMgmtTransition('claimed', 'fmenv_verified')).toBe(true));
  it('fmenv_verified → active valid', () => expect(isValidWasteMgmtTransition('fmenv_verified', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidWasteMgmtTransition('seeded', 'active')).toBe(false));
  it('active → suspended valid', () => expect(isValidWasteMgmtTransition('active', 'suspended')).toBe(true));
  it('guardClaimedToFmenvVerified blocks missing cert', () => {
    expect(guardClaimedToFmenvVerified({ fmenvCert: null, kycTier: 2 }).allowed).toBe(false);
  });
  it('guardClaimedToFmenvVerified passes with cert + KYC 2', () => {
    expect(guardClaimedToFmenvVerified({ fmenvCert: 'FMENV-001', kycTier: 2 }).allowed).toBe(true);
  });
  it('guardGovtContract blocks KYC Tier 2 above ₦5M', () => {
    expect(guardGovtContract({ contractValueKobo: 600_000_000, kycTier: 2 }).allowed).toBe(false);
  });
  it('guardGovtContract allows KYC Tier 3 above ₦5M', () => {
    expect(guardGovtContract({ contractValueKobo: 600_000_000, kycTier: 3 }).allowed).toBe(true);
  });
});
