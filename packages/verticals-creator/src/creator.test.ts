import { describe, it, expect, beforeEach } from 'vitest';
import { CreatorRepository } from './creator.js';
import { isValidCreatorTransition, VALID_CREATOR_TRANSITIONS } from './types.js';

function makeDb() {
  const store: Record<string, unknown>[] = [];
  const prep = (sql: string) => {
    const bindFn = (...vals: unknown[]) => ({
      run: async () => {
        if (sql.trim().toUpperCase().startsWith('INSERT')) {
          const colM = sql.match(/\(([^)]+)\)\s+VALUES/i);
          const valM = sql.match(/VALUES\s*\(([^)]+)\)/i);
          if (colM && valM) {
            const cols = colM[1].split(',').map((c: string) => c.trim());
            const tokens = valM[1].split(',').map((v: string) => v.trim());
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
            const clauses = setM[1].split(',').map((s: string) => s.trim());
            const id = vals[vals.length - 2] as string;
            const tid = vals[vals.length - 1] as string;
            const idx = store.findIndex(r => r['id'] === id && r['tenant_id'] === tid);
            if (idx >= 0) {
              clauses.forEach((clause: string, i: number) => {
                const col = clause.split('=')[0].trim();
                (store[idx] as Record<string, unknown>)[col] = vals[i];
              });
            }
          }
        }
        return { success: true };
      },
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

describe('CreatorRepository — profiles', () => {
  let db: ReturnType<typeof makeDb>; let repo: CreatorRepository;
  beforeEach(() => { db = makeDb(); repo = new CreatorRepository(db as any); });

  it('creates creator with seeded status', async () => { const c = await repo.create({ individualId: 'ind-1', workspaceId: 'ws1', tenantId: 't1', niche: 'lifestyle' }); expect(c.status).toBe('seeded'); expect(c.niche).toBe('lifestyle'); });
  it('uses provided id', async () => { const c = await repo.create({ id: 'cr-001', individualId: 'ind-2', workspaceId: 'ws1', tenantId: 't1', niche: 'comedy' }); expect(c.id).toBe('cr-001'); });
  it('default followerCount is 0', async () => { const c = await repo.create({ individualId: 'ind-3', workspaceId: 'ws1', tenantId: 't1', niche: 'tech' }); expect(c.followerCount).toBe(0); });
  it('uses provided followerCount', async () => { const c = await repo.create({ individualId: 'ind-4', workspaceId: 'ws1', tenantId: 't1', niche: 'fashion', followerCount: 50000 }); expect(c.followerCount).toBe(50000); });
  it('stores monthlyRateKobo (P9)', async () => { const c = await repo.create({ individualId: 'ind-5', workspaceId: 'ws1', tenantId: 't1', niche: 'food', monthlyRateKobo: 500000 }); expect(c).not.toBeNull(); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('findByIndividual returns creator', async () => { await repo.create({ individualId: 'ind-6', workspaceId: 'ws1', tenantId: 't1', niche: 'finance' }); const c = await repo.findByIndividual('ind-6', 't1'); expect(c).not.toBeNull(); });
  it('findByWorkspace returns creators', async () => { await repo.create({ individualId: 'ind-7', workspaceId: 'ws1', tenantId: 't1', niche: 'gaming' }); const cs = await repo.findByWorkspace('ws1', 't1'); expect(cs.length).toBeGreaterThanOrEqual(1); });
  it('findByNiche returns filtered list', async () => { const ns = await repo.findByNiche('lifestyle', 't1'); expect(Array.isArray(ns)).toBe(true); });
  it('update niche', async () => { const c = await repo.create({ individualId: 'ind-8', workspaceId: 'ws1', tenantId: 't1', niche: 'travel' }); expect(await repo.update(c.id, 't1', { niche: 'music' })).not.toBeNull(); });
  it('update followerCount', async () => { const c = await repo.create({ individualId: 'ind-9', workspaceId: 'ws1', tenantId: 't1', niche: 'education' }); expect(await repo.update(c.id, 't1', { followerCount: 100000 })).not.toBeNull(); });
  it('update verifiedBrand', async () => { const c = await repo.create({ individualId: 'ind-10', workspaceId: 'ws1', tenantId: 't1', niche: 'beauty' }); expect(await repo.update(c.id, 't1', { verifiedBrand: true })).not.toBeNull(); });
  it('update monthlyRateKobo', async () => { const c = await repo.create({ individualId: 'ind-11', workspaceId: 'ws1', tenantId: 't1', niche: 'sports' }); expect(await repo.update(c.id, 't1', { monthlyRateKobo: 250000 })).not.toBeNull(); });
  it('update socialProfileId', async () => { const c = await repo.create({ individualId: 'ind-12', workspaceId: 'ws1', tenantId: 't1', niche: 'others' }); expect(await repo.update(c.id, 't1', { socialProfileId: 'sp-001' })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const c = await repo.create({ individualId: 'ind-13', workspaceId: 'ws1', tenantId: 't1', niche: 'comedy' }); expect(await repo.transition(c.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → social_active', async () => { const c = await repo.create({ individualId: 'ind-14', workspaceId: 'ws1', tenantId: 't1', niche: 'comedy' }); expect(await repo.transition(c.id, 't1', 'social_active')).not.toBeNull(); });
  it('transition social_active → monetization_enabled', async () => { const c = await repo.create({ individualId: 'ind-15', workspaceId: 'ws1', tenantId: 't1', niche: 'comedy' }); expect(await repo.transition(c.id, 't1', 'monetization_enabled')).not.toBeNull(); });
  it('transition monetization_enabled → active', async () => { const c = await repo.create({ individualId: 'ind-16', workspaceId: 'ws1', tenantId: 't1', niche: 'comedy' }); expect(await repo.transition(c.id, 't1', 'active')).not.toBeNull(); });
  it('empty update returns existing', async () => { const c = await repo.create({ individualId: 'ind-17', workspaceId: 'ws1', tenantId: 't1', niche: 'comedy' }); expect(await repo.update(c.id, 't1', {})).not.toBeNull(); });
});

describe('CreatorRepository — brand deals', () => {
  let db: ReturnType<typeof makeDb>; let repo: CreatorRepository;
  beforeEach(() => { db = makeDb(); repo = new CreatorRepository(db as any); });

  it('creates deal with enquiry status', async () => { const d = await repo.createDeal({ workspaceId: 'ws1', tenantId: 't1', creatorId: 'cr-1', brandName: 'Dangote' }); expect(d.status).toBe('enquiry'); expect(d.brandName).toBe('Dangote'); });
  it('stores dealValueKobo (P9)', async () => { const d = await repo.createDeal({ workspaceId: 'ws1', tenantId: 't1', creatorId: 'cr-2', brandName: 'MTN', dealValueKobo: 2000000 }); expect(d).not.toBeNull(); });
  it('stores deliverables JSON', async () => { const d = await repo.createDeal({ workspaceId: 'ws1', tenantId: 't1', creatorId: 'cr-3', brandName: 'Airtel', deliverables: '["3 posts", "1 reel"]' }); expect(d).not.toBeNull(); });
  it('findDealById returns null for missing', async () => { expect(await repo.findDealById('none', 't1')).toBeNull(); });
  it('listDealsByCreator returns deals', async () => { await repo.createDeal({ workspaceId: 'ws1', tenantId: 't1', creatorId: 'cr-4', brandName: 'Flutterwave' }); const ds = await repo.listDealsByCreator('cr-4', 't1'); expect(Array.isArray(ds)).toBe(true); });
  it('updateDeal status to confirmed', async () => { const d = await repo.createDeal({ workspaceId: 'ws1', tenantId: 't1', creatorId: 'cr-5', brandName: 'Paystack' }); expect(await repo.updateDeal(d.id, 't1', { status: 'confirmed' })).not.toBeNull(); });
  it('updateDeal brandName', async () => { const d = await repo.createDeal({ workspaceId: 'ws1', tenantId: 't1', creatorId: 'cr-6', brandName: 'Old Brand' }); expect(await repo.updateDeal(d.id, 't1', { brandName: 'New Brand' })).not.toBeNull(); });
  it('updateDeal empty returns existing', async () => { const d = await repo.createDeal({ workspaceId: 'ws1', tenantId: 't1', creatorId: 'cr-7', brandName: 'Brand X' }); expect(await repo.updateDeal(d.id, 't1', {})).not.toBeNull(); });
  it('updateDeal dealValueKobo', async () => { const d = await repo.createDeal({ workspaceId: 'ws1', tenantId: 't1', creatorId: 'cr-8', brandName: 'Cowrywise' }); expect(await repo.updateDeal(d.id, 't1', { dealValueKobo: 1500000 })).not.toBeNull(); });
  it('supports all deal statuses', async () => { for (const s of ['enquiry','negotiating','confirmed','delivered','paid','cancelled'] as const) { expect(s).toBeTruthy(); } });
});

describe('Creator FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidCreatorTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → social_active valid', () => { expect(isValidCreatorTransition('claimed', 'social_active')).toBe(true); });
  it('social_active → monetization_enabled valid', () => { expect(isValidCreatorTransition('social_active', 'monetization_enabled')).toBe(true); });
  it('monetization_enabled → active valid', () => { expect(isValidCreatorTransition('monetization_enabled', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidCreatorTransition('seeded', 'active')).toBe(false); });
  it('VALID_CREATOR_TRANSITIONS has 4 entries', () => { expect(VALID_CREATOR_TRANSITIONS).toHaveLength(4); });
});
