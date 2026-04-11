import type { FurnitureMakerProfile, CreateFurnitureMakerInput, FurnitureMakerFSMState, FurnitureOrder, FurnitureProductionStage, FurnitureMaterialInventory } from './types.js';
interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }
function toProfile(r: Record<string, unknown>): FurnitureMakerProfile { return { id: r['id'] as string, workspaceId: r['workspace_id'] as string, tenantId: r['tenant_id'] as string, businessName: r['business_name'] as string, cacRc: r['cac_rc'] as string|null, sonCert: r['son_cert'] as string|null, workshopType: r['workshop_type'] as string, state: r['state'] as string|null, lga: r['lga'] as string|null, status: r['status'] as FurnitureMakerFSMState, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
function toOrder(r: Record<string, unknown>): FurnitureOrder { return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, clientRefId: r['client_ref_id'] as string, itemType: r['item_type'] as string, quantity: r['quantity'] as number, unitPriceKobo: r['unit_price_kobo'] as number, totalKobo: r['total_kobo'] as number, depositKobo: r['deposit_kobo'] as number, deliveryDate: r['delivery_date'] as number|null, status: r['status'] as FurnitureOrder['status'], createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number }; }
export class FurnitureMakerRepository {
  constructor(private readonly db: D1Like) {}
  async createProfile(input: CreateFurnitureMakerInput): Promise<FurnitureMakerProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO furniture_maker_profiles (id,workspace_id,tenant_id,business_name,cac_rc,son_cert,workshop_type,state,lga,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'seeded',unixepoch(),unixepoch())`).bind(id,input.workspaceId,input.tenantId,input.businessName,input.cacRc??null,input.sonCert??null,input.workshopType??'all',input.state??null,input.lga??null).run();
    const p = await this.findProfileById(id, input.tenantId); if (!p) throw new Error('[furniture-maker] create failed'); return p;
  }
  async findProfileById(id: string, tenantId: string): Promise<FurnitureMakerProfile|null> { const r = await this.db.prepare('SELECT * FROM furniture_maker_profiles WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async findProfileByWorkspace(workspaceId: string, tenantId: string): Promise<FurnitureMakerProfile|null> { const r = await this.db.prepare('SELECT * FROM furniture_maker_profiles WHERE workspace_id=? AND tenant_id=?').bind(workspaceId,tenantId).first<Record<string,unknown>>(); return r ? toProfile(r) : null; }
  async transitionStatus(id: string, tenantId: string, to: FurnitureMakerFSMState, fields?: { cacRc?: string }): Promise<FurnitureMakerProfile> {
    const extra = fields?.cacRc ? `, cac_rc='${fields.cacRc}'` : '';
    await this.db.prepare(`UPDATE furniture_maker_profiles SET status=?${extra}, updated_at=unixepoch() WHERE id=? AND tenant_id=?`).bind(to,id,tenantId).run();
    const p = await this.findProfileById(id, tenantId); if (!p) throw new Error('[furniture-maker] not found'); return p;
  }
  async createOrder(profileId: string, tenantId: string, input: { clientRefId: string; itemType: string; quantity: number; unitPriceKobo: number; totalKobo: number; depositKobo?: number; deliveryDate?: number }): Promise<FurnitureOrder> {
    if (!Number.isInteger(input.totalKobo) || !Number.isInteger(input.unitPriceKobo)) throw new Error('Kobo values must be integers (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO furniture_orders (id,profile_id,tenant_id,client_ref_id,item_type,quantity,unit_price_kobo,total_kobo,deposit_kobo,delivery_date,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,\'intake\',unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.clientRefId,input.itemType,input.quantity,input.unitPriceKobo,input.totalKobo,input.depositKobo??0,input.deliveryDate??null).run();
    const r = await this.db.prepare('SELECT * FROM furniture_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[furniture-maker] order create failed'); return toOrder(r);
  }
  async listOrders(profileId: string, tenantId: string): Promise<FurnitureOrder[]> { const { results } = await this.db.prepare('SELECT * FROM furniture_orders WHERE profile_id=? AND tenant_id=? ORDER BY created_at DESC').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(toOrder); }
  async updateOrderStatus(id: string, tenantId: string, status: string): Promise<FurnitureOrder> {
    await this.db.prepare('UPDATE furniture_orders SET status=?, updated_at=unixepoch() WHERE id=? AND tenant_id=?').bind(status,id,tenantId).run();
    const r = await this.db.prepare('SELECT * FROM furniture_orders WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[furniture-maker] order not found'); return toOrder(r);
  }
  async addProductionStage(orderId: string, tenantId: string, input: { stage: string; startedAt?: number; notes?: string }): Promise<FurnitureProductionStage> {
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO furniture_production_stages (id,order_id,tenant_id,stage,started_at,completed_at,notes,created_at) VALUES (?,?,?,?,?,NULL,?,unixepoch())').bind(id,orderId,tenantId,input.stage,input.startedAt??null,input.notes??null).run();
    const r = await this.db.prepare('SELECT * FROM furniture_production_stages WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[furniture-maker] stage create failed');
    return { id: r['id'] as string, orderId: r['order_id'] as string, tenantId: r['tenant_id'] as string, stage: r['stage'] as string, startedAt: r['started_at'] as number|null, completedAt: r['completed_at'] as number|null, notes: r['notes'] as string|null, createdAt: r['created_at'] as number };
  }
  async addMaterialInventory(profileId: string, tenantId: string, input: { materialName: string; unit?: string; quantityInStock: number; unitCostKobo: number; reorderLevel?: number; supplier?: string }): Promise<FurnitureMaterialInventory> {
    if (!Number.isInteger(input.unitCostKobo)) throw new Error('unit_cost_kobo must be integer (P9)');
    const id = crypto.randomUUID();
    await this.db.prepare('INSERT INTO furniture_material_inventory (id,profile_id,tenant_id,material_name,unit,quantity_in_stock,unit_cost_kobo,reorder_level,supplier,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,unixepoch(),unixepoch())').bind(id,profileId,tenantId,input.materialName,input.unit??'piece',input.quantityInStock,input.unitCostKobo,input.reorderLevel??5,input.supplier??null).run();
    const r = await this.db.prepare('SELECT * FROM furniture_material_inventory WHERE id=? AND tenant_id=?').bind(id,tenantId).first<Record<string,unknown>>(); if (!r) throw new Error('[furniture-maker] material create failed');
    return { id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, materialName: r['material_name'] as string, unit: r['unit'] as string, quantityInStock: r['quantity_in_stock'] as number, unitCostKobo: r['unit_cost_kobo'] as number, reorderLevel: r['reorder_level'] as number, supplier: r['supplier'] as string|null, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number };
  }
  async listMaterialInventory(profileId: string, tenantId: string): Promise<FurnitureMaterialInventory[]> { const { results } = await this.db.prepare('SELECT * FROM furniture_material_inventory WHERE profile_id=? AND tenant_id=?').bind(profileId,tenantId).all<Record<string,unknown>>(); return results.map(r => ({ id: r['id'] as string, profileId: r['profile_id'] as string, tenantId: r['tenant_id'] as string, materialName: r['material_name'] as string, unit: r['unit'] as string, quantityInStock: r['quantity_in_stock'] as number, unitCostKobo: r['unit_cost_kobo'] as number, reorderLevel: r['reorder_level'] as number, supplier: r['supplier'] as string|null, createdAt: r['created_at'] as number, updatedAt: r['updated_at'] as number })); }
}
export function guardSeedToClaimed(_p: FurnitureMakerProfile): { allowed: boolean; reason?: string } { return { allowed: true }; }
