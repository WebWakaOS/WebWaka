import type { MarketStall, CreateStallInput, UpdateStallInput, StallStatus } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; workspace_id: string; tenant_id: string; stall_number: string; trader_name: string; goods_type: string; phone: string | null; status: string; created_at: number; }
function rowTo(r: Row): MarketStall { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, stallNumber: r.stall_number, traderName: r.trader_name, goodsType: r.goods_type as MarketStall['goodsType'], phone: r.phone, status: r.status as StallStatus, createdAt: r.created_at }; }
const COLS = 'id, workspace_id, tenant_id, stall_number, trader_name, goods_type, phone, status, created_at';
export class MarketRepository {
  constructor(private readonly db: D1Like) {}
  async createStall(input: CreateStallInput): Promise<MarketStall> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO market_stalls (id, workspace_id, tenant_id, stall_number, trader_name, goods_type, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.stallNumber, input.traderName, input.goodsType, input.phone ?? null).run();
    const s = await this.findStallById(id, input.tenantId); if (!s) throw new Error('[market] stall create failed'); return s;
  }
  async findStallById(id: string, tenantId: string): Promise<MarketStall | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM market_stalls WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async findByWorkspace(workspaceId: string, tenantId: string): Promise<MarketStall[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM market_stalls WHERE workspace_id = ? AND tenant_id = ? ORDER BY stall_number ASC`).bind(workspaceId, tenantId).all<Row>(); return (results ?? []).map(rowTo); }
  async findByGoodsType(goodsType: string, tenantId: string): Promise<MarketStall[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM market_stalls WHERE goods_type = ? AND tenant_id = ? AND status = 'active'`).bind(goodsType, tenantId).all<Row>(); return (results ?? []).map(rowTo); }
  async countByWorkspace(workspaceId: string, tenantId: string): Promise<number> { const row = await this.db.prepare(`SELECT COUNT(*) AS cnt FROM market_stalls WHERE workspace_id = ? AND tenant_id = ? AND status = 'active'`).bind(workspaceId, tenantId).first<{ cnt: number }>(); return row?.cnt ?? 0; }
  async updateStall(id: string, tenantId: string, input: UpdateStallInput): Promise<MarketStall | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.stallNumber !== undefined) { sets.push('stall_number = ?'); b.push(input.stallNumber); }
    if (input.traderName !== undefined) { sets.push('trader_name = ?'); b.push(input.traderName); }
    if (input.goodsType !== undefined) { sets.push('goods_type = ?'); b.push(input.goodsType); }
    if ('phone' in input) { sets.push('phone = ?'); b.push(input.phone ?? null); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findStallById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE market_stalls SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findStallById(id, tenantId);
  }
}
