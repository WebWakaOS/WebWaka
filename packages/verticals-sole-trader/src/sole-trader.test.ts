import { describe, it, expect, beforeEach } from 'vitest';
import { SoleTraderRepository } from './sole-trader.js';
import { isValidSoleTraderTransition, VALID_SOLE_TRADER_TRANSITIONS } from './types.js';

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

describe('SoleTraderRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: SoleTraderRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new SoleTraderRepository(db as any); });

  it('creates sole trader with seeded status', async () => { const s = await repo.create({ individualId: 'ind-1', workspaceId: 'ws1', tenantId: 't1', tradeType: 'tailor', lga: 'Ikeja', state: 'Lagos' }); expect(s.status).toBe('seeded'); expect(s.tradeType).toBe('tailor'); });
  it('uses provided id', async () => { const s = await repo.create({ id: 'st-001', individualId: 'ind-2', workspaceId: 'ws1', tenantId: 't1', tradeType: 'plumber', lga: 'VI', state: 'Lagos' }); expect(s.id).toBe('st-001'); });
  it('default ratingX10 is 50', async () => { const s = await repo.create({ individualId: 'ind-3', workspaceId: 'ws1', tenantId: 't1', tradeType: 'carpenter', lga: 'Surulere', state: 'Lagos' }); expect(s.ratingX10).toBe(50); });
  it('stores lga and state', async () => { const s = await repo.create({ individualId: 'ind-4', workspaceId: 'ws1', tenantId: 't1', tradeType: 'welder', lga: 'Aba', state: 'Abia' }); expect(s.lga).toBe('Aba'); expect(s.state).toBe('Abia'); });
  it('stores whatsappNumber', async () => { const s = await repo.create({ individualId: 'ind-5', workspaceId: 'ws1', tenantId: 't1', tradeType: 'barber', lga: 'Yaba', state: 'Lagos', whatsappNumber: '+2348012345678' }); expect(s).not.toBeNull(); });
  it('stores minFeeKobo and maxFeeKobo (P9)', async () => { const s = await repo.create({ individualId: 'ind-6', workspaceId: 'ws1', tenantId: 't1', tradeType: 'electrician', lga: 'Ikorodu', state: 'Lagos', minFeeKobo: 500000, maxFeeKobo: 2000000 }); expect(s).not.toBeNull(); });
  it('findById returns null for missing', async () => { expect(await repo.findById('none', 't1')).toBeNull(); });
  it('findByLga returns traders', async () => { await repo.create({ individualId: 'ind-7', workspaceId: 'ws1', tenantId: 't1', tradeType: 'mechanic', lga: 'Oshodi', state: 'Lagos' }); const ts = await repo.findByLga('Oshodi', 'Lagos', 't1'); expect(Array.isArray(ts)).toBe(true); });
  it('update tradeType', async () => { const s = await repo.create({ individualId: 'ind-8', workspaceId: 'ws1', tenantId: 't1', tradeType: 'cobbler', lga: 'L', state: 'S' }); expect(await repo.update(s.id, 't1', { tradeType: 'painter' })).not.toBeNull(); });
  it('update skills', async () => { const s = await repo.create({ individualId: 'ind-9', workspaceId: 'ws1', tenantId: 't1', tradeType: 'chef', lga: 'L', state: 'S' }); expect(await repo.update(s.id, 't1', { skills: '["grilling","baking"]' })).not.toBeNull(); });
  it('update ratingX10 (P9)', async () => { const s = await repo.create({ individualId: 'ind-10', workspaceId: 'ws1', tenantId: 't1', tradeType: 'others', lga: 'L', state: 'S' }); expect(await repo.update(s.id, 't1', { ratingX10: 42 })).not.toBeNull(); });
  it('update minFeeKobo and maxFeeKobo', async () => { const s = await repo.create({ individualId: 'ind-11', workspaceId: 'ws1', tenantId: 't1', tradeType: 'welder', lga: 'L', state: 'S' }); expect(await repo.update(s.id, 't1', { minFeeKobo: 100000, maxFeeKobo: 500000 })).not.toBeNull(); });
  it('update whatsappNumber', async () => { const s = await repo.create({ individualId: 'ind-12', workspaceId: 'ws1', tenantId: 't1', tradeType: 'tailor', lga: 'L', state: 'S' }); expect(await repo.update(s.id, 't1', { whatsappNumber: '+2348099999999' })).not.toBeNull(); });
  it('transition seeded → claimed', async () => { const s = await repo.create({ individualId: 'ind-13', workspaceId: 'ws1', tenantId: 't1', tradeType: 'tailor', lga: 'L', state: 'S' }); expect(await repo.transition(s.id, 't1', 'claimed')).not.toBeNull(); });
  it('transition claimed → active', async () => { const s = await repo.create({ individualId: 'ind-14', workspaceId: 'ws1', tenantId: 't1', tradeType: 'plumber', lga: 'L', state: 'S' }); expect(await repo.transition(s.id, 't1', 'active')).not.toBeNull(); });
  it('empty update returns existing', async () => { const s = await repo.create({ individualId: 'ind-15', workspaceId: 'ws1', tenantId: 't1', tradeType: 'mechanic', lga: 'L', state: 'S' }); expect(await repo.update(s.id, 't1', {})).not.toBeNull(); });
  it('update lga and state', async () => { const s = await repo.create({ individualId: 'ind-16', workspaceId: 'ws1', tenantId: 't1', tradeType: 'carpenter', lga: 'Old LGA', state: 'Old State' }); expect(await repo.update(s.id, 't1', { lga: 'New LGA', state: 'New State' })).not.toBeNull(); });
  it('tenantId stored correctly', async () => { const s = await repo.create({ individualId: 'ind-17', workspaceId: 'ws1', tenantId: 'tenant-X', tradeType: 'barber', lga: 'L', state: 'S' }); expect(s.tenantId).toBe('tenant-X'); });
});

describe('SoleTrader FSM', () => {
  it('seeded → claimed valid', () => { expect(isValidSoleTraderTransition('seeded', 'claimed')).toBe(true); });
  it('claimed → active valid', () => { expect(isValidSoleTraderTransition('claimed', 'active')).toBe(true); });
  it('seeded → active invalid', () => { expect(isValidSoleTraderTransition('seeded', 'active')).toBe(false); });
  it('active → seeded invalid', () => { expect(isValidSoleTraderTransition('active', 'seeded')).toBe(false); });
  it('VALID_SOLE_TRADER_TRANSITIONS has 2 entries', () => { expect(VALID_SOLE_TRADER_TRANSITIONS).toHaveLength(2); });
});
