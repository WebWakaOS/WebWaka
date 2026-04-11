import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
interface Row { id: string; workspace_id: string; tenant_id: string; name: string; description: string | null; price_kobo: number; category: string; available: number; photo_url: string | null; created_at: number; }
function rowTo(r: Row): MenuItem { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, name: r.name, description: r.description, priceKobo: r.price_kobo, category: r.category as MenuItem['category'], available: r.available === 1, photoUrl: r.photo_url, createdAt: r.created_at }; }
const COLS = 'id, workspace_id, tenant_id, name, description, price_kobo, category, available, photo_url, created_at';
export class MenuRepository {
  constructor(private readonly db: D1Like) {}
  async createItem(input: CreateMenuItemInput): Promise<MenuItem> {
    if (!Number.isInteger(input.priceKobo) || input.priceKobo <= 0) throw new Error('[restaurant] priceKobo must be positive integer (P9)');
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO restaurant_menus (id, workspace_id, tenant_id, name, description, price_kobo, category, available, photo_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.name, input.description ?? null, input.priceKobo, input.category ?? 'main', input.photoUrl ?? null).run();
    const item = await this.findItemById(id, input.tenantId); if (!item) throw new Error('[restaurant] item create failed'); return item;
  }
  async findItemById(id: string, tenantId: string): Promise<MenuItem | null> { const row = await this.db.prepare(`SELECT ${COLS} FROM restaurant_menus WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<Row>(); return row ? rowTo(row) : null; }
  async listMenu(workspaceId: string, tenantId: string, availableOnly = true): Promise<MenuItem[]> {
    const sql = availableOnly
      ? `SELECT ${COLS} FROM restaurant_menus WHERE workspace_id = ? AND tenant_id = ? AND available = 1 ORDER BY category, name`
      : `SELECT ${COLS} FROM restaurant_menus WHERE workspace_id = ? AND tenant_id = ? ORDER BY category, name`;
    const { results } = await this.db.prepare(sql).bind(workspaceId, tenantId).all<Row>();
    return (results ?? []).map(rowTo);
  }
  async listByCategory(workspaceId: string, tenantId: string, category: string): Promise<MenuItem[]> { const { results } = await this.db.prepare(`SELECT ${COLS} FROM restaurant_menus WHERE workspace_id = ? AND tenant_id = ? AND category = ? AND available = 1 ORDER BY name`).bind(workspaceId, tenantId, category).all<Row>(); return (results ?? []).map(rowTo); }
  async updateItem(id: string, tenantId: string, input: UpdateMenuItemInput): Promise<MenuItem | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if (input.name !== undefined) { sets.push('name = ?'); b.push(input.name); }
    if ('description' in input) { sets.push('description = ?'); b.push(input.description ?? null); }
    if (input.priceKobo !== undefined) { sets.push('price_kobo = ?'); b.push(input.priceKobo); }
    if (input.category !== undefined) { sets.push('category = ?'); b.push(input.category); }
    if (input.available !== undefined) { sets.push('available = ?'); b.push(input.available ? 1 : 0); }
    if ('photoUrl' in input) { sets.push('photo_url = ?'); b.push(input.photoUrl ?? null); }
    if (sets.length === 0) return this.findItemById(id, tenantId);
    b.push(id, tenantId); await this.db.prepare(`UPDATE restaurant_menus SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run(); return this.findItemById(id, tenantId);
  }
  async toggleAvailability(id: string, tenantId: string): Promise<MenuItem | null> {
    const item = await this.findItemById(id, tenantId); if (!item) return null;
    return this.updateItem(id, tenantId, { available: !item.available });
  }
}
