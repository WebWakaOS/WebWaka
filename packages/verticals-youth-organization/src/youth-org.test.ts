/**
 * @webwaka/verticals-youth-organization — tests (M8d)
 * Minimum 15 tests. Covers: T3, P9, FSM (cac_verified), scholarship, KYC guards.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { YouthOrgRepository } from './youth-org.js';
import {
  isValidYouthOrgTransition,
  guardClaimedToCacVerified,
  guardScholarshipDisbursement,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof YouthOrgRepository>[0];
}

describe('YouthOrgRepository', () => {
  let repo: YouthOrgRepository;
  beforeEach(() => { repo = new YouthOrgRepository(makeDb() as never); });

  it('creates org with seeded status', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'NANS Lagos Chapter' });
    expect(o.status).toBe('seeded');
    expect(o.orgName).toBe('NANS Lagos Chapter');
  });

  it('uses provided id', async () => {
    const o = await repo.create({ id: 'yo-001', workspaceId: 'ws1', tenantId: 't1', orgName: 'CDA Youth' });
    expect(o.id).toBe('yo-001');
  });

  it('findById returns null for wrong tenant (T3)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'Youth FC' });
    expect(await repo.findById(o.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'UNILAG SU' });
    const u = await repo.transition(o.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → cac_verified after update', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'ABSU' });
    await repo.update(o.id, 't1', { cacRegNumber: 'CAC-YO-001' });
    const u = await repo.transition(o.id, 't1', 'cac_verified');
    expect(u?.status).toBe('cac_verified');
  });

  it('transitions cac_verified → active', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'NUS' });
    await repo.transition(o.id, 't1', 'claimed');
    await repo.transition(o.id, 't1', 'cac_verified');
    const u = await repo.transition(o.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('creates member with integer annual_dues_kobo (P9)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'CDA' });
    const m = await repo.createMember({ profileId: o.id, tenantId: 't1', memberName: 'Emeka Eze', annualDuesKobo: 500000 });
    expect(m.annualDuesKobo).toBe(500000);
  });

  it('rejects fractional kobo for dues (P9)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'Youth P9' });
    await expect(repo.createMember({ profileId: o.id, tenantId: 't1', memberName: 'Test', annualDuesKobo: 500.5 })).rejects.toThrow('P9');
  });

  it('creates event with attendance', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'NANS Imo' });
    const e = await repo.createEvent({ profileId: o.id, tenantId: 't1', eventName: 'AGM 2025', attendanceCount: 200 });
    expect(e.attendanceCount).toBe(200);
  });

  it('creates scholarship with kobo amounts (P9)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'Youth Scholars' });
    const s = await repo.createScholarship({ profileId: o.id, tenantId: 't1', donatedAmountKobo: 2000000, awardAmountKobo: 2000000, recipientName: 'Fatima Bello', academicYear: '2025/2026' });
    expect(s.awardAmountKobo).toBe(2000000);
  });

  it('rejects fractional kobo for scholarship (P9)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', orgName: 'Scholar-P9' });
    await expect(repo.createScholarship({ profileId: o.id, tenantId: 't1', donatedAmountKobo: 100.5, awardAmountKobo: 100000 })).rejects.toThrow('P9');
  });

  it('findScholarshipsByProfile isolates by tenant (T3)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 'tx', orgName: 'T3-Test' });
    await repo.createScholarship({ profileId: o.id, tenantId: 'tx', donatedAmountKobo: 100000, awardAmountKobo: 100000 });
    expect(await repo.findScholarshipsByProfile(o.id, 'wrong')).toHaveLength(0);
  });
});

describe('YouthOrg FSM guards', () => {
  it('seeded → claimed valid', () => expect(isValidYouthOrgTransition('seeded', 'claimed')).toBe(true));
  it('claimed → cac_verified valid', () => expect(isValidYouthOrgTransition('claimed', 'cac_verified')).toBe(true));
  it('cac_verified → active valid', () => expect(isValidYouthOrgTransition('cac_verified', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidYouthOrgTransition('seeded', 'active')).toBe(false));
  it('claimed → active invalid (T4)', () => expect(isValidYouthOrgTransition('claimed', 'active')).toBe(false));
  it('active → suspended valid', () => expect(isValidYouthOrgTransition('active', 'suspended')).toBe(true));
  it('guardClaimedToCacVerified blocks missing CAC number', () => {
    expect(guardClaimedToCacVerified({ cacRegNumber: null, kycTier: 1 }).allowed).toBe(false);
  });
  it('guardClaimedToCacVerified passes with CAC number', () => {
    expect(guardClaimedToCacVerified({ cacRegNumber: 'CAC-001', kycTier: 1 }).allowed).toBe(true);
  });
  it('guardScholarshipDisbursement blocks KYC Tier 1 above ₦500k', () => {
    expect(guardScholarshipDisbursement({ awardAmountKobo: 60_000_000, kycTier: 1 }).allowed).toBe(false);
  });
  it('guardScholarshipDisbursement allows KYC Tier 2 above ₦500k', () => {
    expect(guardScholarshipDisbursement({ awardAmountKobo: 60_000_000, kycTier: 2 }).allowed).toBe(true);
  });
});
