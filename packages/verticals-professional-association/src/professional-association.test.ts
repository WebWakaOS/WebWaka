/**
 * @webwaka/verticals-professional-association — tests (M12)
 * Minimum 15 tests. Covers: T3, P9, FSM (regulatory_verified), CPD, KYC guards.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ProfessionalAssocRepository } from './professional-association.js';
import {
  isValidProfessionalAssocTransition,
  guardClaimedToRegulatoryVerified,
  guardPractisingFund,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof ProfessionalAssocRepository>[0];
}

describe('ProfessionalAssocRepository', () => {
  let repo: ProfessionalAssocRepository;
  beforeEach(() => { repo = new ProfessionalAssocRepository(makeDb() as never); });

  it('creates association with seeded status', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'NBA Lagos Branch', assocType: 'legal' });
    expect(a.status).toBe('seeded');
    expect(a.assocName).toBe('NBA Lagos Branch');
    expect(a.assocType).toBe('legal');
  });

  it('findById null for wrong tenant (T3)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'NMA Abuja' });
    expect(await repo.findById(a.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'ICAN' });
    const u = await repo.transition(a.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → regulatory_verified', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'NBA' });
    await repo.update(a.id, 't1', { regulatoryBody: 'NBA-CBN-001' });
    const u = await repo.transition(a.id, 't1', 'regulatory_verified');
    expect(u?.status).toBe('regulatory_verified');
  });

  it('transitions regulatory_verified → active', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'NMA' });
    await repo.transition(a.id, 't1', 'claimed');
    await repo.transition(a.id, 't1', 'regulatory_verified');
    const u = await repo.transition(a.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('creates member with integer annual dues (P9)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'COREN' });
    const m = await repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'Engr. Babatunde', annualDuesKobo: 1000000 });
    expect(m.annualDuesKobo).toBe(1000000);
    expect(m.memberName).toBe('Engr. Babatunde');
    expect(m.status).toBe('active');
  });

  it('rejects fractional kobo for dues (P9)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'P9-Test' });
    await expect(repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'X', annualDuesKobo: 1000.5 })).rejects.toThrow('P9');
  });

  it('creates CPD entry with integer credits', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'CPD Assoc' });
    const mem = await repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'Dr. Obi', annualDuesKobo: 500000 });
    const cpd = await repo.createCpd({ memberId: mem.id, profileId: a.id, tenantId: 't1', trainingName: 'Legal Aid Training', creditsEarned: 5 });
    expect(cpd.creditsEarned).toBe(5);
    expect(cpd.trainingName).toBe('Legal Aid Training');
  });

  it('rejects fractional CPD credits', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'CPD-Frac' });
    const mem = await repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'Y', annualDuesKobo: 500000 });
    await expect(repo.createCpd({ memberId: mem.id, profileId: a.id, tenantId: 't1', trainingName: 'Training', creditsEarned: 2.5 })).rejects.toThrow('integer');
  });

  it('updates member CPD credits earned', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'Update Assoc' });
    const mem = await repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'Dr. A', annualDuesKobo: 500000 });
    const updated = await repo.updateMember(mem.id, 't1', { cpdCreditsEarned: 10 });
    expect(updated?.cpdCreditsEarned).toBe(10);
  });

  it('updateMember null for wrong tenant (T3)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 't1', assocName: 'T3 Assoc' });
    const mem = await repo.createMember({ profileId: a.id, tenantId: 't1', memberName: 'X', annualDuesKobo: 500000 });
    const updated = await repo.updateMember(mem.id, 'wrong', { cpdCreditsEarned: 99 });
    expect(updated).toBeNull();
  });

  it('findCpdByMember tenant-scoped (T3)', async () => {
    const a = await repo.create({ workspaceId: 'ws1', tenantId: 'tx', assocName: 'T3 CPD' });
    const mem = await repo.createMember({ profileId: a.id, tenantId: 'tx', memberName: 'Z', annualDuesKobo: 500000 });
    await repo.createCpd({ memberId: mem.id, profileId: a.id, tenantId: 'tx', trainingName: 'Training', creditsEarned: 3 });
    expect(await repo.findCpdByMember(mem.id, 'wrong')).toHaveLength(0);
  });
});

describe('ProfessionalAssoc FSM guards', () => {
  it('seeded → claimed valid', () => expect(isValidProfessionalAssocTransition('seeded', 'claimed')).toBe(true));
  it('claimed → regulatory_verified valid', () => expect(isValidProfessionalAssocTransition('claimed', 'regulatory_verified')).toBe(true));
  it('regulatory_verified → active valid', () => expect(isValidProfessionalAssocTransition('regulatory_verified', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidProfessionalAssocTransition('seeded', 'active')).toBe(false));
  it('active → suspended valid', () => expect(isValidProfessionalAssocTransition('active', 'suspended')).toBe(true));
  it('guardClaimedToRegulatoryVerified blocks missing regulatory body', () => {
    expect(guardClaimedToRegulatoryVerified({ regulatoryBody: null, kycTier: 2 }).allowed).toBe(false);
  });
  it('guardClaimedToRegulatoryVerified passes with regulatory body', () => {
    expect(guardClaimedToRegulatoryVerified({ regulatoryBody: 'NBA-001', kycTier: 2 }).allowed).toBe(true);
  });
  it('guardPractisingFund blocks KYC Tier 2 above ₦10M', () => {
    expect(guardPractisingFund({ amountKobo: 2_000_000_000, kycTier: 2 }).allowed).toBe(false);
  });
  it('guardPractisingFund allows KYC Tier 3 above ₦10M', () => {
    expect(guardPractisingFund({ amountKobo: 2_000_000_000, kycTier: 3 }).allowed).toBe(true);
  });
});
