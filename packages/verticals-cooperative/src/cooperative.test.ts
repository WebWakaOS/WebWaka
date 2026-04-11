import { describe, it, expect, beforeEach } from 'vitest';
import { CooperativeRepository } from './cooperative.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      // eslint-disable-next-line @typescript-eslint/require-await
      run: async () => {
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
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
              else if (tok.toLowerCase() === 'unixepoch()') { row[col] = Math.floor(Date.now() / 1000); }
              else if (tok.startsWith("'") && tok.endsWith("'")) { row[col] = tok.slice(1, -1); }
              else if (!Number.isNaN(Number(tok))) { row[col] = Number(tok); }
              else { row[col] = vals[bi++]; }
            });
            if (row['status'] === undefined) row['status'] = 'seeded';
            if (row['available'] === undefined) row['available'] = 1;
            if (!row['created_at']) row['created_at'] = Math.floor(Date.now() / 1000);
            store.push(row);
          }
        } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
          const setM = sql.match(/SET\s+(.+?)\s+WHERE/i);
          if (setM) {
            const clauses = setM[1]!.split(',').map((s: string) => s.trim());
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = (clause.split('=')[0]! ?? '').trim();
                (store[idx] as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      first: async <T>() => {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          if (sql.toLowerCase().includes('count(*)')) return ({ cnt: store.length }) as unknown as T;
          if (vals.length >= 2) {
            const v0 = vals[0]; const v1 = vals[1];
            const found = store.find(r =>
              (r['id'] === v0 || r['individual_id'] === v0 || r['member_number'] === v0 ||
               r['plate_number'] === v0 || r['route_id'] === v0) &&
              r['tenant_id'] === v1
            );
            return (found ?? null) as T;
          }
          if (vals.length === 1) return (store.find(r => r['id'] === vals[0] || r['individual_id'] === vals[0]) ?? null) as T;
          return (store[0] ?? null) as T;
        }
        return null as T;
      },
      // eslint-disable-next-line @typescript-eslint/require-await
      all: async <T>() => {
        if (sql.trim().toUpperCase().startsWith('SELECT') && vals.length >= 2) {
          const filtered = store.filter(r => {
            const v0 = vals[0];
            const v1 = vals[1];
            const matchTenant = v1 === undefined || r['tenant_id'] === v1;
            const matchFirst = v0 === undefined ||
              r['workspace_id'] === v0 || r['goods_type'] === v0 ||
              r['facility_type'] === v0 || r['school_type'] === v0 ||
              r['profession'] === v0 || r['state'] === v0 ||
              r['lga'] === v0 || r['route_id'] === v0 ||
              r['creator_id'] === v0 || r['member_id'] === v0 ||
              r['available'] === v0;
            return matchFirst && matchTenant;
          });
          return ({ results: filtered }) as unknown as T;
        }
        return ({ results: store }) as unknown as T;
      },
    });
    return { bind: bindFn };
  };
  return { prepare: prep };
}

describe('CooperativeRepository — members', () => {
  let db: ReturnType<typeof makeDb>; let repo: CooperativeRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new CooperativeRepository(db as any); });

  it('creates member with active status', async () => { const m = await repo.createMember({ workspaceId: 'ws1', tenantId: 't1', userId: 'u1', memberNumber: 'MEM-001' }); expect(m.status).toBe('active'); expect(m.memberNumber).toBe('MEM-001'); });
  it('uses provided id for member', async () => { const m = await repo.createMember({ id: 'mb-001', workspaceId: 'ws1', tenantId: 't1', userId: 'u2', memberNumber: 'MEM-002' }); expect(m.id).toBe('mb-001'); });
  it('sets default sharesCount to 0', async () => { const m = await repo.createMember({ workspaceId: 'ws1', tenantId: 't1', userId: 'u3', memberNumber: 'MEM-003' }); expect(m.sharesCount).toBe(0); });
  it('uses provided sharesCount', async () => { const m = await repo.createMember({ workspaceId: 'ws1', tenantId: 't1', userId: 'u4', memberNumber: 'MEM-004', sharesCount: 10 }); expect(m.sharesCount).toBe(10); });
  it('findMemberById returns null for missing', async () => { expect(await repo.findMemberById('none', 't1')).toBeNull(); });
  it('findMemberByNumber returns member', async () => { await repo.createMember({ workspaceId: 'ws1', tenantId: 't1', userId: 'u5', memberNumber: 'MEM-005' }); const m = await repo.findMemberByNumber('MEM-005', 't1'); expect(m).not.toBeNull(); });
  it('listMembers returns active members', async () => { await repo.createMember({ workspaceId: 'ws1', tenantId: 't1', userId: 'u6', memberNumber: 'MEM-006' }); const ms = await repo.listMembers('ws1', 't1'); expect(ms.length).toBeGreaterThanOrEqual(1); });
  it('updateMember sharesCount', async () => { const m = await repo.createMember({ workspaceId: 'ws1', tenantId: 't1', userId: 'u7', memberNumber: 'MEM-007' }); expect(await repo.updateMember(m.id, 't1', { sharesCount: 25 })).not.toBeNull(); });
  it('updateMember status', async () => { const m = await repo.createMember({ workspaceId: 'ws1', tenantId: 't1', userId: 'u8', memberNumber: 'MEM-008' }); expect(await repo.updateMember(m.id, 't1', { status: 'suspended' })).not.toBeNull(); });
  it('updateMember empty returns existing', async () => { const m = await repo.createMember({ workspaceId: 'ws1', tenantId: 't1', userId: 'u9', memberNumber: 'MEM-009' }); expect(await repo.updateMember(m.id, 't1', {})).not.toBeNull(); });
});

describe('CooperativeRepository — contributions', () => {
  let db: ReturnType<typeof makeDb>; let repo: CooperativeRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new CooperativeRepository(db as any); });

  it('creates contribution with pending status (P9)', async () => { const c = await repo.createContribution({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: 500000, cycleMonth: '2025-01' }); expect(c.status).toBe('pending'); expect(c.amountKobo).toBe(500000); });
  it('rejects zero amountKobo (P9)', async () => { await expect(repo.createContribution({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: 0, cycleMonth: '2025-02' })).rejects.toThrow(); });
  it('rejects negative amountKobo (P9)', async () => { await expect(repo.createContribution({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: -100, cycleMonth: '2025-03' })).rejects.toThrow(); });
  it('stores paystackRef', async () => { const c = await repo.createContribution({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb2', amountKobo: 200000, cycleMonth: '2025-04', paystackRef: 'PSK-C-001' }); expect(c).not.toBeNull(); });
  it('findContributionById returns null for missing', async () => { expect(await repo.findContributionById('none', 't1')).toBeNull(); });
  it('listContributionsByMember returns contributions', async () => { await repo.createContribution({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb3', amountKobo: 300000, cycleMonth: '2025-05' }); const cs = await repo.listContributionsByMember('mb3', 't1'); expect(cs.length).toBeGreaterThanOrEqual(1); });
  it('markContributionPaid updates status', async () => { const c = await repo.createContribution({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb4', amountKobo: 400000, cycleMonth: '2025-06' }); expect(await repo.markContributionPaid(c.id, 't1')).not.toBeNull(); });
  it('totalContributionsKobo returns 0 initially', async () => { expect(await repo.totalContributionsKobo('ws-new', 't1')).toBe(0); });
});

describe('CooperativeRepository — loans', () => {
  let db: ReturnType<typeof makeDb>; let repo: CooperativeRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new CooperativeRepository(db as any); });

  it('creates loan with pending status (P9)', async () => { const l = await repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: 2000000, interestRate: 500, durationMonths: 6 }); expect(l.status).toBe('pending'); expect(l.amountKobo).toBe(2000000); expect(l.interestRate).toBe(500); });
  it('rejects zero amountKobo (P9)', async () => { await expect(repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: 0, interestRate: 500, durationMonths: 3 })).rejects.toThrow(); });
  it('rejects negative interestRate', async () => { await expect(repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb1', amountKobo: 100000, interestRate: -1, durationMonths: 3 })).rejects.toThrow(); });
  it('stores guarantorId', async () => { const l = await repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb2', amountKobo: 500000, interestRate: 300, durationMonths: 12, guarantorId: 'mb-g-1' }); expect(l).not.toBeNull(); });
  it('findLoanById returns null for missing', async () => { expect(await repo.findLoanById('none', 't1')).toBeNull(); });
  it('listLoansByMember returns loans', async () => { await repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb3', amountKobo: 1000000, interestRate: 600, durationMonths: 9 }); const ls = await repo.listLoansByMember('mb3', 't1'); expect(ls.length).toBeGreaterThanOrEqual(1); });
  it('approveLoan changes status', async () => { const l = await repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb4', amountKobo: 300000, interestRate: 400, durationMonths: 4 }); expect(await repo.approveLoan(l.id, 't1')).not.toBeNull(); });
  it('updateLoan status to repaid', async () => { const l = await repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb5', amountKobo: 100000, interestRate: 200, durationMonths: 3 }); expect(await repo.updateLoan(l.id, 't1', { status: 'repaid' })).not.toBeNull(); });
  it('updateLoan empty returns existing', async () => { const l = await repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb6', amountKobo: 50000, interestRate: 100, durationMonths: 2 }); expect(await repo.updateLoan(l.id, 't1', {})).not.toBeNull(); });
  it('interest rate 0 is valid (interest-free loan)', async () => { const l = await repo.createLoan({ workspaceId: 'ws1', tenantId: 't1', memberId: 'mb7', amountKobo: 75000, interestRate: 0, durationMonths: 3 }); expect(l.interestRate).toBe(0); });
});
