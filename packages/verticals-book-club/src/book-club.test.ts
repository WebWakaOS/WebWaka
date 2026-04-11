/**
 * @webwaka/verticals-book-club — tests (M12)
 * Minimum 15 tests. Covers: T3, P9, 3-state FSM, readings, meetings, dues.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { BookClubRepository } from './book-club.js';
import { isValidBookClubTransition } from './types.js';

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
  return { prepare: prep } as unknown as ConstructorParameters<typeof BookClubRepository>[0];
}

describe('BookClubRepository', () => {
  let repo: BookClubRepository;
  beforeEach(() => { repo = new BookClubRepository(makeDb() as never); });

  it('creates club with seeded status', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Ikeja Readers' });
    expect(c.status).toBe('seeded');
    expect(c.clubName).toBe('Ikeja Readers');
  });

  it('uses provided id', async () => {
    const c = await repo.create({ id: 'bc-001', workspaceId: 'ws1', tenantId: 't1', clubName: 'VI Readers' });
    expect(c.id).toBe('bc-001');
  });

  it('findById null for wrong tenant (T3)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Test Club' });
    expect(await repo.findById(c.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'FSM1' });
    const u = await repo.transition(c.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → active (3-state FSM)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'FSM2' });
    await repo.transition(c.id, 't1', 'claimed');
    const u = await repo.transition(c.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('active → active invalid (T4)', () => {
    expect(isValidBookClubTransition('active', 'active' as never)).toBe(false);
  });

  it('creates member with monthly dues (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Dues Club' });
    const m = await repo.createMember({ profileId: c.id, tenantId: 't1', memberName: 'Kolade Adeyemi', monthlyDuesKobo: 200000 });
    expect(m.monthlyDuesKobo).toBe(200000);
    expect(m.memberName).toBe('Kolade Adeyemi');
  });

  it('rejects fractional kobo for dues (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'P9-Club' });
    await expect(repo.createMember({ profileId: c.id, tenantId: 't1', memberName: 'X', monthlyDuesKobo: 200.99 })).rejects.toThrow('P9');
  });

  it('creates reading with purchase cost (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Reading Club' });
    const r = await repo.createReading({ profileId: c.id, tenantId: 't1', bookTitle: 'Things Fall Apart', purchaseCostKobo: 150000 });
    expect(r.bookTitle).toBe('Things Fall Apart');
    expect(r.purchaseCostKobo).toBe(150000);
  });

  it('rejects fractional purchase cost (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'P9-Read' });
    await expect(repo.createReading({ profileId: c.id, tenantId: 't1', bookTitle: 'Test', purchaseCostKobo: 150.5 })).rejects.toThrow('P9');
  });

  it('creates meeting with attendance', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'Meeting Club' });
    const m = await repo.createMeeting({ profileId: c.id, tenantId: 't1', attendanceCount: 12, bookDiscussed: 'Purple Hibiscus' });
    expect(m.attendanceCount).toBe(12);
    expect(m.bookDiscussed).toBe('Purple Hibiscus');
  });

  it('meeting with no book discussed stores null', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'No-Book' });
    const m = await repo.createMeeting({ profileId: c.id, tenantId: 't1' });
    expect(m.bookDiscussed).toBeNull();
  });

  it('stores nln_affiliation when provided', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', clubName: 'NLN Club', nlnAffiliation: 'NLN-LG-001' });
    expect(c.nlnAffiliation).toBe('NLN-LG-001');
  });
});

describe('BookClub FSM guards', () => {
  it('seeded → claimed valid', () => expect(isValidBookClubTransition('seeded', 'claimed')).toBe(true));
  it('claimed → active valid', () => expect(isValidBookClubTransition('claimed', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidBookClubTransition('seeded', 'active')).toBe(false));
  it('active → seeded invalid (T4)', () => expect(isValidBookClubTransition('active', 'seeded')).toBe(false));
});
