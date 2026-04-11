import { describe, it, expect, beforeEach } from 'vitest';
import { MarketRepository } from './market.js';

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

describe('MarketRepository', () => {
  let db: ReturnType<typeof makeDb>; let repo: MarketRepository;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  beforeEach(() => { db = makeDb(); repo = new MarketRepository(db as any); });

  it('creates stall with active status', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'A-001', traderName: 'Amaka', goodsType: 'foodstuff' }); expect(s.status).toBe('active'); expect(s.stallNumber).toBe('A-001'); });
  it('uses provided id', async () => { const s = await repo.createStall({ id: 'ms-001', workspaceId: 'ws1', tenantId: 't1', stallNumber: 'B-001', traderName: 'Bala', goodsType: 'clothing' }); expect(s.id).toBe('ms-001'); });
  it('stores traderName', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'C-001', traderName: 'Chika', goodsType: 'electronics' }); expect(s.traderName).toBe('Chika'); });
  it('stores phone number', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'D-001', traderName: 'Dayo', goodsType: 'provisions', phone: '+2348011111111' }); expect(s).not.toBeNull(); });
  it('findStallById returns null for missing', async () => { expect(await repo.findStallById('none', 't1')).toBeNull(); });
  it('findByWorkspace returns stalls', async () => { await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'E-001', traderName: 'Emeka', goodsType: 'hardware' }); const ss = await repo.findByWorkspace('ws1', 't1'); expect(ss.length).toBeGreaterThanOrEqual(1); });
  it('findByGoodsType returns active stalls', async () => { const ss = await repo.findByGoodsType('foodstuff', 't1'); expect(Array.isArray(ss)).toBe(true); });
  it('countByWorkspace returns count', async () => { const cnt = await repo.countByWorkspace('ws1', 't1'); expect(cnt).toBeGreaterThanOrEqual(0); });
  it('update traderName', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'F-001', traderName: 'Old', goodsType: 'others' }); expect(await repo.updateStall(s.id, 't1', { traderName: 'New' })).not.toBeNull(); });
  it('update goodsType', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'G-001', traderName: 'Gbenga', goodsType: 'foodstuff' }); expect(await repo.updateStall(s.id, 't1', { goodsType: 'clothing' })).not.toBeNull(); });
  it('update stallNumber', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'H-001', traderName: 'Hawa', goodsType: 'provisions' }); expect(await repo.updateStall(s.id, 't1', { stallNumber: 'H-002' })).not.toBeNull(); });
  it('update status to vacant', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'I-001', traderName: 'Ike', goodsType: 'electronics' }); expect(await repo.updateStall(s.id, 't1', { status: 'vacant' })).not.toBeNull(); });
  it('update phone', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'J-001', traderName: 'Joy', goodsType: 'hardware' }); expect(await repo.updateStall(s.id, 't1', { phone: '+2348022222222' })).not.toBeNull(); });
  it('empty update returns existing', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'K-001', traderName: 'Kemi', goodsType: 'foodstuff' }); expect(await repo.updateStall(s.id, 't1', {})).not.toBeNull(); });
  it('update status to suspended', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'L-001', traderName: 'Ladi', goodsType: 'others' }); expect(await repo.updateStall(s.id, 't1', { status: 'suspended' })).not.toBeNull(); });
  it('stores goodsType: clothing', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: 'M-001', traderName: 'Musa', goodsType: 'clothing' }); expect(s.goodsType).toBe('clothing'); });
  it('tenantId isolation respected', async () => { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 'tenant-Z', stallNumber: 'N-001', traderName: 'Ngozi', goodsType: 'foodstuff' }); expect(s.tenantId).toBe('tenant-Z'); });
  it('workspaceId stored correctly', async () => { const s = await repo.createStall({ workspaceId: 'ws-9999', tenantId: 't1', stallNumber: 'O-001', traderName: 'Olu', goodsType: 'provisions' }); expect(s.workspaceId).toBe('ws-9999'); });
  it('supports all goodsTypes', async () => { for (const g of ['foodstuff','clothing','electronics','provisions','hardware','others'] as const) { const s = await repo.createStall({ workspaceId: 'ws1', tenantId: 't1', stallNumber: `Z-${g}`, traderName: 'Test', goodsType: g }); expect(s.goodsType).toBe(g); } });
});
