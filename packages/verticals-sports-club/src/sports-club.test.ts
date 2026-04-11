/**
 * @webwaka/verticals-sports-club — tests (M12)
 * Minimum 15 tests. Covers: T3, P9, FSM (nsf_registered), integer scores, KYC guards.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { SportsClubRepository } from './sports-club.js';
import {
  isValidSportsClubTransition,
  guardClaimedToNsfRegistered,
  guardPrizeMoney,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof SportsClubRepository>[0];
}

describe('SportsClubRepository', () => {
  let repo: SportsClubRepository;
  beforeEach(() => { repo = new SportsClubRepository(makeDb() as never); });

  it('creates club with seeded status', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Eko FC', sportType: 'football' });
    expect(c.status).toBe('seeded');
    expect(c.clubName).toBe('Eko FC');
    expect(c.sportType).toBe('football');
  });

  it('findById null for wrong tenant (T3)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Abuja FC' });
    expect(await repo.findById(c.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'FSM1' });
    const u = await repo.transition(c.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → nsf_registered', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'NSF Club' });
    await repo.update(c.id, 't1', { nsfAffiliation: 'NSF-LAG-001' });
    const u = await repo.transition(c.id, 't1', 'nsf_registered');
    expect(u?.status).toBe('nsf_registered');
  });

  it('transitions nsf_registered → active', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Active FC' });
    await repo.transition(c.id, 't1', 'claimed');
    await repo.transition(c.id, 't1', 'nsf_registered');
    const u = await repo.transition(c.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('creates player with integer monthly dues (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Player Club' });
    const p = await repo.createPlayer({ profileId: c.id, tenantId: 't1', playerName: 'Chukwuemeka Obi', monthlyDuesKobo: 100000, jerseyNumber: 10 });
    expect(p.monthlyDuesKobo).toBe(100000);
    expect(p.jerseyNumber).toBe(10);
  });

  it('rejects fractional kobo for player dues (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'P9 Club' });
    await expect(repo.createPlayer({ profileId: c.id, tenantId: 't1', playerName: 'X', monthlyDuesKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('rejects fractional jersey number', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Jersey Club' });
    await expect(repo.createPlayer({ profileId: c.id, tenantId: 't1', playerName: 'Y', monthlyDuesKobo: 100000, jerseyNumber: 10.5 })).rejects.toThrow('integer');
  });

  it('creates match with integer scores', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Match Club' });
    const m = await repo.createMatch({ profileId: c.id, tenantId: 't1', opponent: 'Kano FC', resultHome: 2, resultAway: 1, status: 'played' });
    expect(m.resultHome).toBe(2);
    expect(m.resultAway).toBe(1);
    expect(m.status).toBe('played');
  });

  it('rejects fractional match score', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Score Club' });
    await expect(repo.createMatch({ profileId: c.id, tenantId: 't1', opponent: 'X', resultHome: 1.5 })).rejects.toThrow('integer');
  });

  it('creates expense with integer kobo (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Expense Club' });
    const e = await repo.createExpense({ profileId: c.id, tenantId: 't1', expenseType: 'kit', amountKobo: 250000 });
    expect(e.amountKobo).toBe(250000);
    expect(e.expenseType).toBe('kit');
  });

  it('findPlayersByProfile tenant-scoped (T3)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 'tx', clubName: 'T3 Club' });
    await repo.createPlayer({ profileId: c.id, tenantId: 'tx', playerName: 'P', monthlyDuesKobo: 100000 });
    expect(await repo.findPlayersByProfile(c.id, 'wrong')).toHaveLength(0);
  });
});

describe('SportsClub FSM guards', () => {
  it('seeded → claimed valid', () => expect(isValidSportsClubTransition('seeded', 'claimed')).toBe(true));
  it('claimed → nsf_registered valid', () => expect(isValidSportsClubTransition('claimed', 'nsf_registered')).toBe(true));
  it('nsf_registered → active valid', () => expect(isValidSportsClubTransition('nsf_registered', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidSportsClubTransition('seeded', 'active')).toBe(false));
  it('active → suspended valid', () => expect(isValidSportsClubTransition('active', 'suspended')).toBe(true));
  it('guardClaimedToNsfRegistered blocks missing affiliation', () => {
    expect(guardClaimedToNsfRegistered({ nsfAffiliation: null, kycTier: 1 }).allowed).toBe(false);
  });
  it('guardClaimedToNsfRegistered passes with affiliation', () => {
    expect(guardClaimedToNsfRegistered({ nsfAffiliation: 'NSF-001', kycTier: 1 }).allowed).toBe(true);
  });
  it('guardPrizeMoney blocks KYC Tier 1 above ₦200k', () => {
    expect(guardPrizeMoney({ amountKobo: 30_000_000, kycTier: 1 }).allowed).toBe(false);
  });
  it('guardPrizeMoney allows KYC Tier 2 above ₦200k', () => {
    expect(guardPrizeMoney({ amountKobo: 30_000_000, kycTier: 2 }).allowed).toBe(true);
  });
});
