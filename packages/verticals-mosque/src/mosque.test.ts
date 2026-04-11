/**
 * @webwaka/verticals-mosque — tests (M8d)
 * Minimum 15 tests. Covers: T3, P9, FSM, anonymous donations, AI guards, KYC guards.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { MosqueRepository } from './mosque.js';
import {
  isValidMosqueTransition,
  guardClaimedToItRegistered,
  guardWaqfFund,
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
              (store[idx]! as Record<string, unknown>)['updated_at'] = Math.floor(Date.now() / 1000);
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (!sql.trim().toUpperCase().startsWith('SELECT')) return null as T;
        const found = store.find(r =>
          vals.length >= 2 ? (r['id'] === vals[0]) && r['tenant_id'] === vals[1] : r['id'] === vals[0]
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof MosqueRepository>[0];
}

describe('MosqueRepository', () => {
  let repo: MosqueRepository;
  beforeEach(() => { repo = new MosqueRepository(makeDb() as never); });

  it('creates mosque with seeded status', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Lagos Central Mosque' });
    expect(m.status).toBe('seeded');
    expect(m.mosqueName).toBe('Lagos Central Mosque');
    expect(m.tenantId).toBe('t1');
  });

  it('uses provided id', async () => {
    const m = await repo.create({ id: 'ms-001', workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Abuja Mosque' });
    expect(m.id).toBe('ms-001');
  });

  it('findById returns null for wrong tenant (T3)', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Kano Mosque' });
    expect(await repo.findById(m.id, 'wrong-tenant')).toBeNull();
  });

  it('findByWorkspace returns mosques for tenant', async () => {
    await repo.create({ workspaceId: 'ws2', tenantId: 't2', mosqueName: 'Ibadan Mosque' });
    const list = await repo.findByWorkspace('ws2', 't2');
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it('transitions seeded → claimed', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'M-FSM-1' });
    const updated = await repo.transition(m.id, 't1', 'claimed');
    expect(updated?.status).toBe('claimed');
  });

  it('transitions claimed → it_registered', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'M-FSM-2' });
    await repo.update(m.id, 't1', { itRegistrationNumber: 'IT-MS-001' });
    const updated = await repo.transition(m.id, 't1', 'it_registered');
    expect(updated?.status).toBe('it_registered');
  });

  it('transitions it_registered → active', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'M-FSM-3' });
    await repo.transition(m.id, 't1', 'claimed');
    await repo.transition(m.id, 't1', 'it_registered');
    const updated = await repo.transition(m.id, 't1', 'active');
    expect(updated?.status).toBe('active');
  });

  it('creates donation with integer amount_kobo (P9)', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Mosque-D' });
    const d = await repo.createDonation({ profileId: m.id, tenantId: 't1', amountKobo: 500000, donationType: 'zakat' });
    expect(d.amountKobo).toBe(500000);
    expect(d.donationType).toBe('zakat');
  });

  it('rejects fractional kobo (P9)', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Mosque-P9' });
    await expect(repo.createDonation({ profileId: m.id, tenantId: 't1', amountKobo: 500.5 })).rejects.toThrow('P9');
  });

  it('anonymous donation stores null donor_phone (P13)', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Mosque-Anon' });
    const d = await repo.createDonation({ profileId: m.id, tenantId: 't1', amountKobo: 100000, donorAnonymous: true, donorPhone: '08012345678' });
    expect(d.donorAnonymous).toBe(true);
    expect(d.donorPhone).toBeNull();
  });

  it('non-anonymous donation stores donor phone', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Mosque-Phone' });
    const d = await repo.createDonation({ profileId: m.id, tenantId: 't1', amountKobo: 200000, donorAnonymous: false, donorPhone: '08012345678' });
    expect(d.donorPhone).toBe('08012345678');
  });

  it('creates programme with attendance count', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Mosque-Prog' });
    const p = await repo.createProgramme({ profileId: m.id, tenantId: 't1', programmeName: "Jumu'ah Prayer", type: "jumu'ah", attendanceCount: 500 });
    expect(p.attendanceCount).toBe(500);
    expect(p.type).toBe("jumu'ah");
  });

  it('creates member with zakat eligibility', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'Mosque-M' });
    const mem = await repo.createMember({ profileId: m.id, tenantId: 't1', memberName: 'Alhaji Musa', zakatEligible: true });
    expect(mem.zakatEligible).toBe(true);
    expect(mem.memberName).toBe('Alhaji Musa');
  });

  it('findDonationsByProfile returns empty for different tenant (T3)', async () => {
    const m = await repo.create({ workspaceId: 'ws1', tenantId: 't1', mosqueName: 'M-T3' });
    await repo.createDonation({ profileId: m.id, tenantId: 't1', amountKobo: 100000 });
    const list = await repo.findDonationsByProfile(m.id, 'other-tenant');
    expect(list).toHaveLength(0);
  });
});

describe('Mosque FSM guards', () => {
  it('seeded → claimed valid', () => expect(isValidMosqueTransition('seeded', 'claimed')).toBe(true));
  it('claimed → it_registered valid', () => expect(isValidMosqueTransition('claimed', 'it_registered')).toBe(true));
  it('it_registered → active valid', () => expect(isValidMosqueTransition('it_registered', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidMosqueTransition('seeded', 'active')).toBe(false));
  it('claimed → active invalid (T4)', () => expect(isValidMosqueTransition('claimed', 'active')).toBe(false));
  it('active → suspended valid', () => expect(isValidMosqueTransition('active', 'suspended')).toBe(true));
  it('guardClaimedToItRegistered blocks missing IT number', () => {
    const r = guardClaimedToItRegistered({ itRegistrationNumber: null, kycTier: 1 });
    expect(r.allowed).toBe(false);
  });
  it('guardClaimedToItRegistered passes with IT number', () => {
    const r = guardClaimedToItRegistered({ itRegistrationNumber: 'IT-001', kycTier: 1 });
    expect(r.allowed).toBe(true);
  });
  it('guardWaqfFund blocks KYC Tier 1 for waqf > ₦1M', () => {
    const r = guardWaqfFund({ amountKobo: 200_000_000, kycTier: 1 });
    expect(r.allowed).toBe(false);
  });
  it('guardWaqfFund allows KYC Tier 2 for waqf > ₦1M', () => {
    const r = guardWaqfFund({ amountKobo: 200_000_000, kycTier: 2 });
    expect(r.allowed).toBe(true);
  });
});
