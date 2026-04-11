/**
 * @webwaka/verticals-constituency-office — tests (M12)
 * Minimum 15 tests. Covers: T3, P9, FSM (inec_verified), HITL guard, projects, complaints.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ConstituencyOfficeRepository } from './constituency-office.js';
import {
  isValidConstituencyTransition,
  guardClaimedToInecVerified,
  guardAiHitl,
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
  return { prepare: prep } as unknown as ConstructorParameters<typeof ConstituencyOfficeRepository>[0];
}

describe('ConstituencyOfficeRepository', () => {
  let repo: ConstituencyOfficeRepository;
  beforeEach(() => { repo = new ConstituencyOfficeRepository(makeDb() as never); });

  it('creates office with seeded status', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'Hon. Amaka Obi', officeType: 'rep' });
    expect(o.status).toBe('seeded');
    expect(o.legislatorName).toBe('Hon. Amaka Obi');
  });

  it('findById null for wrong tenant (T3)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'Sen. Aliyu' });
    expect(await repo.findById(o.id, 'wrong')).toBeNull();
  });

  it('transitions seeded → claimed', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'FSM1' });
    const u = await repo.transition(o.id, 't1', 'claimed');
    expect(u?.status).toBe('claimed');
  });

  it('transitions claimed → inec_verified', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'FSM2' });
    await repo.update(o.id, 't1', { inecSeatNumber: 'INEC-SEAT-003' });
    const u = await repo.transition(o.id, 't1', 'inec_verified');
    expect(u?.status).toBe('inec_verified');
  });

  it('transitions inec_verified → active', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'FSM3' });
    await repo.transition(o.id, 't1', 'claimed');
    await repo.transition(o.id, 't1', 'inec_verified');
    const u = await repo.transition(o.id, 't1', 'active');
    expect(u?.status).toBe('active');
  });

  it('creates project with integer allocated kobo (P9)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'Project Hon' });
    const p = await repo.createProject({ profileId: o.id, tenantId: 't1', projectName: 'Borehole Phase 1', allocatedKobo: 10_000_000_000 });
    expect(p.allocatedKobo).toBe(10_000_000_000);
    expect(p.projectName).toBe('Borehole Phase 1');
    expect(p.status).toBe('planned');
  });

  it('rejects fractional project kobo (P9)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'P9-Hon' });
    await expect(repo.createProject({ profileId: o.id, tenantId: 't1', projectName: 'Test', allocatedKobo: 1000.5 })).rejects.toThrow('P9');
  });

  it('creates complaint with received status', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'Complaint Hon' });
    const c = await repo.createComplaint({ profileId: o.id, tenantId: 't1', complaintRef: 'CMP-001', subject: 'Road Damage', lga: 'Ikorodu' });
    expect(c.status).toBe('received');
    expect(c.complaintRef).toBe('CMP-001');
    expect(c.lga).toBe('Ikorodu');
  });

  it('complaint description stored (non-PII operational data)', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'Desc Hon' });
    const c = await repo.createComplaint({ profileId: o.id, tenantId: 't1', complaintRef: 'CMP-002', subject: 'Flooding', description: 'Drainage blocked on Main Street' });
    expect(c.description).toBe('Drainage blocked on Main Street');
  });

  it('creates outreach event with attendees count', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'Outreach Hon' });
    const out = await repo.createOutreach({ profileId: o.id, tenantId: 't1', lga: 'Badagry', eventType: 'townhall', attendeesCount: 300 });
    expect(out.attendeesCount).toBe(300);
    expect(out.lga).toBe('Badagry');
  });

  it('rejects fractional attendees count', async () => {
    const o = await repo.create({ workspaceId: 'ws1', tenantId: 't1', legislatorName: 'Frac-Out' });
    await expect(repo.createOutreach({ profileId: o.id, tenantId: 't1', attendeesCount: 100.5 })).rejects.toThrow('integer');
  });
});

describe('ConstituencyOffice FSM + HITL guards', () => {
  it('seeded → claimed valid', () => expect(isValidConstituencyTransition('seeded', 'claimed')).toBe(true));
  it('claimed → inec_verified valid', () => expect(isValidConstituencyTransition('claimed', 'inec_verified')).toBe(true));
  it('inec_verified → active valid', () => expect(isValidConstituencyTransition('inec_verified', 'active')).toBe(true));
  it('seeded → active invalid (T4)', () => expect(isValidConstituencyTransition('seeded', 'active')).toBe(false));
  it('active → suspended valid', () => expect(isValidConstituencyTransition('active', 'suspended')).toBe(true));
  it('guardClaimedToInecVerified blocks missing seat number', () => {
    expect(guardClaimedToInecVerified({ inecSeatNumber: null, kycTier: 3 }).allowed).toBe(false);
  });
  it('guardClaimedToInecVerified blocks KYC Tier 2', () => {
    expect(guardClaimedToInecVerified({ inecSeatNumber: 'SEAT-001', kycTier: 2 }).allowed).toBe(false);
  });
  it('guardClaimedToInecVerified passes KYC Tier 3 + seat', () => {
    expect(guardClaimedToInecVerified({ inecSeatNumber: 'SEAT-001', kycTier: 3 }).allowed).toBe(true);
  });
  it('guardAiHitl blocks L2 AI calls (L3 mandatory)', () => {
    expect(guardAiHitl({ autonomyLevel: 'L2' }).allowed).toBe(false);
  });
  it('guardAiHitl allows L3_HITL', () => {
    expect(guardAiHitl({ autonomyLevel: 'L3_HITL' }).allowed).toBe(true);
  });
});
