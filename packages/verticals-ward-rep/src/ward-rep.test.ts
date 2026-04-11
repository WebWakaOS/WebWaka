/**
 * @webwaka/verticals-ward-rep — tests (M12)
 * Minimum 15 tests. Covers: T3, P9, 3-state FSM, polling units, HITL guard.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { WardRepRepository } from './ward-rep.js';
import {
  isValidWardRepTransition,
  guardAiHitl,
  guardProjectFund,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof WardRepRepository>[0];
}

describe('WardRepRepository', () => {
  let repo: WardRepRepository;
  beforeEach(() => { repo = new WardRepRepository(makeDb() as never); });

  it('creates ward rep profile with seeded status', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'Hon. Tunde Bakare', wardName: 'Ward 5' });
    expect(w.status).toBe('seeded');
    expect(w.councillorName).toBe('Hon. Tunde Bakare');
    expect(w.wardName).toBe('Ward 5');
  });

  it('uses provided id', async () => {
    const w = await repo.create({ id: 'wr-001', workspaceId: 'ws1', tenantId: 't1', councillorName: 'X', wardName: 'Ward A' });
    expect(w.id).toBe('wr-001');
  });

  it('findById null for wrong tenant (T3)', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'Y', wardName: 'Ward B' });
    expect(await repo.findById(w.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed (3-state FSM)', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'FSM1', wardName: 'W1' });
    const u = await repo.transition(w.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → active (3-state FSM)', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'FSM2', wardName: 'W2' });
    await repo.transition(w.id, 't1', 'claimed');
    const u = await repo.transition(w.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('creates polling unit with integer registered voters', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'PU Hon', wardName: 'Ward X' });
    const pu = await repo.createPollingUnit({ profileId: w.id, tenantId: 't1', unitNumber: 'PU-001', registeredVoters: 1250 });
    expect(pu.registeredVoters).toBe(1250);
    expect(pu.unitNumber).toBe('PU-001');
  });

  it('rejects fractional registered voters', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'Frac Hon', wardName: 'W3' });
    await expect(repo.createPollingUnit({ profileId: w.id, tenantId: 't1', unitNumber: 'PU-002', registeredVoters: 100.5 })).rejects.toThrow('integer');
  });

  it('creates ward project with integer kobo (P9)', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'Proj Hon', wardName: 'W4' });
    const p = await repo.createProject({ profileId: w.id, tenantId: 't1', projectName: 'Street Light', amountKobo: 2_000_000_000 });
    expect(p.amountKobo).toBe(2_000_000_000);
    expect(p.status).toBe('planned');
  });

  it('rejects fractional project kobo (P9)', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'P9 Hon', wardName: 'W5' });
    await expect(repo.createProject({ profileId: w.id, tenantId: 't1', projectName: 'Test', amountKobo: 100.5 })).rejects.toThrow('P9');
  });

  it('creates service request with received status', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'SR Hon', wardName: 'W6' });
    const sr = await repo.createServiceRequest({ profileId: w.id, tenantId: 't1', requestType: 'pothole_repair', description: 'Large pothole on Main St', ward: 'Ward 6' });
    expect(sr.status).toBe('received');
    expect(sr.requestType).toBe('pothole_repair');
  });

  it('findByWorkspace tenant-scoped (T3)', async () => {
    await repo.create({ workspaceId: 'ws99', tenantId: 't99', councillorName: 'T3 Hon', wardName: 'W99' });
    const list = await repo.findByWorkspace('ws99', 'wrong-tenant');
    expect(list).toHaveLength(0);
  });

  it('updates councillor name', async () => {
    const w = await repo.create({ workspaceId: 'ws1', tenantId: 't1', councillorName: 'Old Name', wardName: 'W7' });
    const u = await repo.update(w.id, 't1', { councillorName: 'New Name' });
    expect(u?.councillorName).toBe('New Name');
  });
});

describe('WardRep FSM + HITL guards', () => {
  it('seeded → claimed valid', () => expect(isValidWardRepTransition('seeded', 'claimed')).toBe(true));
  it('claimed → active valid', () => expect(isValidWardRepTransition('claimed', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidWardRepTransition('seeded', 'active')).toBe(false));
  it('active → claimed invalid (T4)', () => expect(isValidWardRepTransition('active', 'claimed')).toBe(false));
  it('guardAiHitl blocks L1 AI calls (L3 mandatory)', () => {
    expect(guardAiHitl({ autonomyLevel: 'L1' }).allowed).toBe(false);
  });
  it('guardAiHitl allows L3_HITL', () => {
    expect(guardAiHitl({ autonomyLevel: 'L3_HITL' }).allowed).toBe(true);
  });
  it('guardProjectFund blocks KYC Tier 0', () => {
    expect(guardProjectFund({ amountKobo: 100000, kycTier: 0 }).allowed).toBe(false);
  });
  it('guardProjectFund allows KYC Tier 1 for small amounts', () => {
    expect(guardProjectFund({ amountKobo: 500_000_000, kycTier: 1 }).allowed).toBe(true);
  });
  it('guardProjectFund blocks KYC Tier 1 above ₦10M', () => {
    expect(guardProjectFund({ amountKobo: 1_100_000_000, kycTier: 1 }).allowed).toBe(false);
  });
});
