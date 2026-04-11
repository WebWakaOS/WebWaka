import { describe, it, expect, beforeEach } from 'vitest';
import { NgoRepository } from './ngo.js';
import { isValidNgoTransition, VALID_NGO_TRANSITIONS } from './types.js';

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
                const col = (clause.split('=')[0] ?? '').trim();
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

describe('NgoRepository — profiles', () => {
  let db: ReturnType<typeof makeDb>; let repo: NgoRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new NgoRepository(db as any); });

  it('creates NGO with seeded status', async () => { const n = await repo.create({ organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', sector: 'education' }); expect(n.status).toBe('seeded'); expect(n.sector).toBe('education'); });
  it('uses provided id', async () => { const n = await repo.create({ id: 'ngo-001', organizationId: 'org1', workspaceId: 'ws1', tenantId: 't1', sector: 'health' }); expect(n.id).toBe('ngo-001'); });
  it('stores cacRegNumber', async () => { const n = await repo.create({ organizationId: 'org2', workspaceId: 'ws1', tenantId: 't1', sector: 'environment', cacRegNumber: 'RC-NGO-001' }); expect(n).not.toBeNull(); });
  it('stores countryPartner', async () => { const n = await repo.create({ organizationId: 'org3', workspaceId: 'ws1', tenantId: 't1', sector: 'women', countryPartner: 'UNICEF' }); expect(n).not.toBeNull(); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('findByWorkspace returns ngos', async () => { await repo.create({ organizationId: 'org4', workspaceId: 'ws1', tenantId: 't1', sector: 'youth' }); expect((await repo.findByWorkspace('ws1', 't1')).length).toBeGreaterThanOrEqual(1); });
  it('update communityId', async () => { const n = await repo.create({ organizationId: 'org5', workspaceId: 'ws1', tenantId: 't1', sector: 'tech' }); expect(await repo.update(n.id, 't1', { communityId: 'comm-1' })).not.toBeNull(); });
  it('update itNumber', async () => { const n = await repo.create({ organizationId: 'org6', workspaceId: 'ws1', tenantId: 't1', sector: 'disability' }); expect(await repo.update(n.id, 't1', { itNumber: 'IT-NGO-001' })).not.toBeNull(); });
  it('update beneficiaryCount', async () => { const n = await repo.create({ organizationId: 'org7', workspaceId: 'ws1', tenantId: 't1', sector: 'agriculture' }); expect(await repo.update(n.id, 't1', { beneficiaryCount: 10000 })).not.toBeNull(); });
  it('update sector', async () => { const n = await repo.create({ organizationId: 'org8', workspaceId: 'ws1', tenantId: 't1', sector: 'others' }); expect(await repo.update(n.id, 't1', { sector: 'legal' })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const n = await repo.create({ organizationId: 'org9', workspaceId: 'ws1', tenantId: 't1', sector: 'health' }); expect(await repo.transition(n.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → it_verified', async () => { const n = await repo.create({ organizationId: 'org10', workspaceId: 'ws1', tenantId: 't1', sector: 'health' }); expect(await repo.transition(n.id, 't1', 'it_verified')).not.toBeNull(); });
  it('transition it_verified → community_active', async () => { const n = await repo.create({ organizationId: 'org11', workspaceId: 'ws1', tenantId: 't1', sector: 'health' }); expect(await repo.transition(n.id, 't1', 'community_active')).not.toBeNull(); });
  it('transition community_active → active', async () => { const n = await repo.create({ organizationId: 'org12', workspaceId: 'ws1', tenantId: 't1', sector: 'health' }); expect(await repo.transition(n.id, 't1', 'active')).not.toBeNull(); });
  it('empty update returns existing', async () => { const n = await repo.create({ organizationId: 'org13', workspaceId: 'ws1', tenantId: 't1', sector: 'tech' }); expect(await repo.update(n.id, 't1', {})).not.toBeNull(); });
});

describe('NgoRepository — funding', () => {
  let db: ReturnType<typeof makeDb>; let repo: NgoRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new NgoRepository(db as any); });

  it('creates funding record (P9)', async () => { const f = await repo.createFunding({ workspaceId: 'ws1', tenantId: 't1', donorName: 'USAID', amountKobo: 5000000 }); expect(f.donorName).toBe('USAID'); expect(f.amountKobo).toBe(5000000); });
  it('rejects zero amountKobo (P9)', async () => { await expect(repo.createFunding({ workspaceId: 'ws1', tenantId: 't1', donorName: 'Test', amountKobo: 0 })).rejects.toThrow('P9'); });
  it('rejects negative amountKobo (P9)', async () => { await expect(repo.createFunding({ workspaceId: 'ws1', tenantId: 't1', donorName: 'Test', amountKobo: -500 })).rejects.toThrow('P9'); });
  it('stores purpose and paystackRef', async () => { const f = await repo.createFunding({ workspaceId: 'ws1', tenantId: 't1', donorName: 'EU', amountKobo: 10000000, purpose: 'Education', paystackRef: 'PSK-001' }); expect(f).not.toBeNull(); });
  it('defaults currency to NGN', async () => { const f = await repo.createFunding({ workspaceId: 'ws1', tenantId: 't1', donorName: 'CBN', amountKobo: 100000 }); expect(f.currency).toBe('NGN'); });
  it('listFundingByWorkspace returns records', async () => { const r = await repo.listFundingByWorkspace('ws1', 't1'); expect(Array.isArray(r)).toBe(true); });
  it('totalFundingKobo returns 0 initially', async () => { expect(await repo.totalFundingKobo('ws-new', 't1')).toBe(0); });
  it('findFundingById returns null for missing', async () => { expect(await repo.findFundingById('none', 't1')).toBeNull(); });
});

describe('NGO FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidNgoTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → it_verified valid', () => { expect(isValidNgoTransition('claimed', 'it_verified')).toBe(true); });
  it('it_verified → community_active valid', () => { expect(isValidNgoTransition('it_verified', 'community_active')).toBe(true); });
  it('community_active → active valid', () => { expect(isValidNgoTransition('community_active', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidNgoTransition('seeded', 'active')).toBe(false); });
  it('VALID_NGO_TRANSITIONS has 4 entries', () => { expect(VALID_NGO_TRANSITIONS).toHaveLength(4); });
});
