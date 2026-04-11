/**
 * @webwaka/verticals-womens-association — tests (M8d)
 * Minimum 15 tests. Covers: T3, P9, FSM (cac_verified), welfare, KYC guards.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { WomensAssocRepository } from './womens-assoc.js';
import {
  isValidWomensAssocTransition,
  guardClaimedToCacVerified,
  guardLoanDisbursement,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof WomensAssocRepository>[0];
}

describe('WomensAssocRepository', () => {
  let repo: WomensAssocRepository;
  beforeEach(() => { repo = new WomensAssocRepository(makeDb() as never); });

  it('creates association with seeded status', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'Ilu Women Forum' });
    expect(a.status).toBe('seeded');
    expect(a.assocName).toBe('Ilu Women Forum');
  });

  it('uses provided id', async () => {
    const a = await repo.create({ id: 'wa-001', workspaceId: 'ws1', tenantId: 't1', assocName: 'Abuja Women' });
    expect(a.id).toBe('wa-001');
  });

  it('findById null for wrong tenant (T3)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'Lagos Women' });
    expect(await repo.findById(a.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'Eko Forum' });
    const u = await repo.transition(a.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → cac_verified', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'CDA Women' });
    await repo.update(a.id, 't1', { cacReg: 'CAC-WA-001' });
    const u = await repo.transition(a.id, 't1', 'cac_verified');
    expect(u?.status).toBe('cac_verified');
  });

  it('transitions cac_verified → active', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'NAWOJ' });
    await repo.transition(a.id, 't1', 'claimed');
    await repo.transition(a.id, 't1', 'cac_verified');
    const u = await repo.transition(a.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('creates member with monthly_contribution_kobo (P9)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'Aso-ebi' });
    const m = await repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'Ngozi Okafor', monthlyContributionKobo: 200000 });
    expect(m.monthlyContributionKobo).toBe(200000);
  });

  it('rejects fractional kobo for contribution (P9)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'P9-Test' });
    await expect(repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'Test', monthlyContributionKobo: 200.5 })).rejects.toThrow('P9');
  });

  it('creates welfare loan with positive integer kobo (P9)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'Welfare Assoc' });
    const mem = await repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'Amara', monthlyContributionKobo: 100000 });
    const w = await repo.createWelfare({ profileId: a.id, memberId: mem.id, tenantId: 't1', welfareType: 'loan', amountKobo: 500000 });
    expect(w.amountKobo).toBe(500000);
    expect(w.welfareType).toBe('loan');
  });

  it('rejects zero kobo for welfare (P9)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'Zero-Test' });
    const mem = await repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'A', monthlyContributionKobo: 100000 });
    await expect(repo.createWelfare({ profileId: a.id, memberId: mem.id, tenantId: 't1', welfareType: 'loan', amountKobo: 0 })).rejects.toThrow('P9');
  });

  it('creates meeting record', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'Meeting-Test' });
    const mt = await repo.createMeeting({ profileId: a.id, tenantId: 't1', agenda: 'Monthly review', attendanceCount: 20 });
    expect(mt.attendanceCount).toBe(20);
  });

  it('findWelfareByProfile tenant-scoped (T3)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 'tx', assocName: 'T3' });
    const m = await repo.createMember({ profileId: a.id, tenantId: 'tx', memberName: 'X', monthlyContributionKobo: 100000 });
    await repo.createWelfare({ profileId: a.id, memberId: m.id, tenantId: 'tx', welfareType: 'loan', amountKobo: 100000 });
    expect(await repo.findWelfareByProfile(a.id, 'wrong')).toHaveLength(0);
  });
});

describe('WomensAssoc FSM guards', () => {
  it('seeded → claimed valid', () => expect(isValidWomensAssocTransition('seeded', 'claimed')).toBe(true));
  it('claimed → cac_verified valid', () => expect(isValidWomensAssocTransition('claimed', 'cac_verified')).toBe(true));
  it('cac_verified → active valid', () => expect(isValidWomensAssocTransition('cac_verified', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidWomensAssocTransition('seeded', 'active')).toBe(false));
  it('claimed → active invalid (T4)', () => expect(isValidWomensAssocTransition('claimed', 'active')).toBe(false));
  it('active → suspended valid', () => expect(isValidWomensAssocTransition('active', 'suspended')).toBe(true));
  it('guardClaimedToCacVerified blocks missing CAC', () => {
    expect(guardClaimedToCacVerified({ cacReg: null, kycTier: 1 }).allowed).toBe(false);
  });
  it('guardClaimedToCacVerified passes with CAC', () => {
    expect(guardClaimedToCacVerified({ cacReg: 'CAC-001', kycTier: 1 }).allowed).toBe(true);
  });
  it('guardLoanDisbursement blocks KYC Tier 1 above ₦500k', () => {
    expect(guardLoanDisbursement({ amountKobo: 60_000_000, kycTier: 1 }).allowed).toBe(false);
  });
  it('guardLoanDisbursement allows KYC Tier 2 above ₦500k', () => {
    expect(guardLoanDisbursement({ amountKobo: 60_000_000, kycTier: 2 }).allowed).toBe(true);
  });
});
