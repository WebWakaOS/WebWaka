/**
 * Haulage D1 repository (scaffold).
 * (M8c — T3) Migration: 0051_transport.sql → haulage_profiles
 */
import type { HaulageProfile, CreateHaulageInput, UpdateHaulageInput, HaulageFSMState } from './types.js';

interface D1Like { prepare(s: string): { bind(...v: unknown[]): { run(): Promise<{ success: boolean }>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }>; }; }; }

interface HaulageRow { id: string; workspace_id: string; tenant_id: string; cac_reg_number: string | null; frsc_fleet_ref: string | null; service_types: string; status: string; created_at: number; }

function rowTo(r: HaulageRow): HaulageProfile { return { id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, cacRegNumber: r.cac_reg_number, frscFleetRef: r.frsc_fleet_ref, serviceTypes: r.service_types, status: r.status as HaulageFSMState, createdAt: r.created_at }; }

const COLS = 'id, workspace_id, tenant_id, cac_reg_number, frsc_fleet_ref, service_types, status, created_at';

export class HaulageRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateHaulageInput): Promise<HaulageProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(`INSERT INTO haulage_profiles (id, workspace_id, tenant_id, cac_reg_number, frsc_fleet_ref, service_types, status, created_at) VALUES (?, ?, ?, ?, NULL, ?, 'seeded', unixepoch())`).bind(id, input.workspaceId, input.tenantId, input.cacRegNumber ?? null, input.serviceTypes ?? 'general').run();
    const p = await this.findById(id, input.tenantId);
    if (!p) throw new Error('[haulage] create failed');
    return p;
  }

  async findById(id: string, tenantId: string): Promise<HaulageProfile | null> {
    const row = await this.db.prepare(`SELECT ${COLS} FROM haulage_profiles WHERE id = ? AND tenant_id = ?`).bind(id, tenantId).first<HaulageRow>();
    return row ? rowTo(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<HaulageProfile[]> {
    const { results } = await this.db.prepare(`SELECT ${COLS} FROM haulage_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`).bind(workspaceId, tenantId).all<HaulageRow>();
    return (results ?? []).map(rowTo);
  }

  async update(id: string, tenantId: string, input: UpdateHaulageInput): Promise<HaulageProfile | null> {
    const sets: string[] = []; const b: unknown[] = [];
    if ('cacRegNumber' in input) { sets.push('cac_reg_number = ?'); b.push(input.cacRegNumber ?? null); }
    if ('frscFleetRef' in input) { sets.push('frsc_fleet_ref = ?'); b.push(input.frscFleetRef ?? null); }
    if (input.serviceTypes !== undefined) { sets.push('service_types = ?'); b.push(input.serviceTypes); }
    if (input.status !== undefined) { sets.push('status = ?'); b.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    b.push(id, tenantId);
    await this.db.prepare(`UPDATE haulage_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`).bind(...b).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, toStatus: HaulageFSMState): Promise<HaulageProfile | null> { return this.update(id, tenantId, { status: toStatus }); }
}
