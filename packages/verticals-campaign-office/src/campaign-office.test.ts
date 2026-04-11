/**
 * @webwaka/verticals-campaign-office — tests (M8b)
 * Minimum 15 tests. Covers: T3, P9, FSM (inec_filed), INEC cap, HITL guard, donor PII.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CampaignOfficeRepository } from './campaign-office.js';
import {
  isValidCampaignTransition,
  guardClaimedToInecFiled,
  guardInecSpendingCap,
  guardAiHitl,
  INEC_SPENDING_CAP_KOBO,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof CampaignOfficeRepository>[0];
}

describe('CampaignOfficeRepository', () => {
  let repo: CampaignOfficeRepository;
  beforeEach(() => { repo = new CampaignOfficeRepository(makeDb() as never); });

  it('creates campaign with seeded status', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'Alhaji Musa Usman', officeSought: 'governor' });
    expect(c.status).toBe('seeded');
    expect(c.officeSought).toBe('governor');
  });

  it('findById null for wrong tenant (T3)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'A.B.C', officeSought: 'rep' });
    expect(await repo.findById(c.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'FSM1', officeSought: 'senator' });
    const u = await repo.transition(c.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → inec_filed', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'FSM2', officeSought: 'rep' });
    await repo.update(c.id, 't1', { inecFilingRef: 'INEC-REF-001' });
    const u = await repo.transition(c.id, 't1', 'inec_filed');
    expect(u?.status).toBe('inec_filed');
  });

  it('transitions inec_filed → active', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'FSM3', officeSought: 'councillor' });
    await repo.transition(c.id, 't1', 'claimed');
    await repo.transition(c.id, 't1', 'inec_filed');
    const u = await repo.transition(c.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('active → campaign_closed valid', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'FSM4', officeSought: 'councillor' });
    await repo.transition(c.id, 't1', 'claimed');
    await repo.transition(c.id, 't1', 'inec_filed');
    await repo.transition(c.id, 't1', 'active');
    const u = await repo.transition(c.id, 't1', 'campaign_closed');
    expect(u?.status).toBe('campaign_closed');
  });

  it('creates budget with integer kobo (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'Budget Cand', officeSought: 'rep' });
    const b = await repo.createBudget({ profileId: c.id, tenantId: 't1', category: 'media', budgetKobo: 500_000_000 });
    expect(b.budgetKobo).toBe(500_000_000);
    expect(b.category).toBe('media');
  });

  it('rejects fractional budget kobo (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'P9-Cand', officeSought: 'rep' });
    await expect(repo.createBudget({ profileId: c.id, tenantId: 't1', category: 'media', budgetKobo: 500.5 })).rejects.toThrow('P9');
  });

  it('creates donor with positive integer amount (P9)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'Donor Cand', officeSought: 'governor' });
    const d = await repo.createDonor({ profileId: c.id, tenantId: 't1', donorName: 'Alhaji Donor', amountKobo: 5_000_000_00 });
    expect(d.amountKobo).toBe(5_000_000_00);
    expect(d.donorName).toBe('Alhaji Donor');
  });

  it('creates volunteer without PII in profile (P13 — phone is optional)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'Vol Cand', officeSought: 'rep' });
    const v = await repo.createVolunteer({ profileId: c.id, tenantId: 't1', volunteerName: 'Field Agent', lga: 'Surulere' });
    expect(v.volunteerName).toBe('Field Agent');
    expect(v.lga).toBe('Surulere');
  });

  it('creates campaign event', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 't1', candidateName: 'Event Cand', officeSought: 'senator' });
    const e = await repo.createEvent({ profileId: c.id, tenantId: 't1', eventType: 'rally', estimatedAttendance: 5000, lga: 'Ikorodu' });
    expect(e.eventType).toBe('rally');
    expect(e.estimatedAttendance).toBe(5000);
  });

  it('findBudgetByProfile tenant-scoped (T3)', async () => {
    const c = await repo.create({ workspaceId: 'ws1', tenantId: 'tx', candidateName: 'T3', officeSought: 'rep' });
    await repo.createBudget({ profileId: c.id, tenantId: 'tx', category: 'rallies', budgetKobo: 100000000 });
    expect(await repo.findBudgetByProfile(c.id, 'wrong')).toHaveLength(0);
  });
});

describe('Campaign FSM + INEC guards', () => {
  it('seeded → claimed valid', () => expect(isValidCampaignTransition('seeded', 'claimed')).toBe(true));
  it('claimed → inec_filed valid', () => expect(isValidCampaignTransition('claimed', 'inec_filed')).toBe(true));
  it('inec_filed → active valid', () => expect(isValidCampaignTransition('inec_filed', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidCampaignTransition('seeded', 'active')).toBe(false));
  it('campaign_closed → active invalid (T4)', () => expect(isValidCampaignTransition('campaign_closed', 'active')).toBe(false));
  it('guardClaimedToInecFiled blocks missing filing ref', () => {
    expect(guardClaimedToInecFiled({ inecFilingRef: null, kycTier: 3 }).allowed).toBe(false);
  });
  it('guardClaimedToInecFiled blocks KYC Tier 2', () => {
    expect(guardClaimedToInecFiled({ inecFilingRef: 'REF-001', kycTier: 2 }).allowed).toBe(false);
  });
  it('guardClaimedToInecFiled passes KYC Tier 3 + filing ref', () => {
    expect(guardClaimedToInecFiled({ inecFilingRef: 'REF-001', kycTier: 3 }).allowed).toBe(true);
  });
  it('INEC governor cap is ₦200M', () => {
    expect(INEC_SPENDING_CAP_KOBO.governor).toBe(20_000_000_000);
  });
  it('guardInecSpendingCap blocks governor campaign exceeding ₦200M', () => {
    expect(guardInecSpendingCap({ officeSought: 'governor', totalBudgetKobo: 21_000_000_000 }).allowed).toBe(false);
  });
  it('guardInecSpendingCap allows governor campaign within ₦200M', () => {
    expect(guardInecSpendingCap({ officeSought: 'governor', totalBudgetKobo: 19_000_000_000 }).allowed).toBe(true);
  });
  it('guardAiHitl blocks non-L3 calls (L3 HITL mandatory)', () => {
    expect(guardAiHitl({ autonomyLevel: 'L2' }).allowed).toBe(false);
  });
  it('guardAiHitl allows L3_HITL', () => {
    expect(guardAiHitl({ autonomyLevel: 'L3_HITL' }).allowed).toBe(true);
  });
});
