/**
 * Mass Transit D1 repository.
 * (M8c — Platform Invariants T3)
 * Migration: 0051_transport.sql → transit_profiles
 */

import type { TransitProfile, CreateTransitInput, UpdateTransitInput, TransitFSMState } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface TransitRow {
  id: string; workspace_id: string; tenant_id: string;
  operator_name: string; cac_reg_number: string | null; frsc_fleet_ref: string | null;
  fleet_size: number; status: string; created_at: number;
}

function rowToTransit(r: TransitRow): TransitProfile {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    operatorName: r.operator_name, cacRegNumber: r.cac_reg_number,
    frscFleetRef: r.frsc_fleet_ref, fleetSize: r.fleet_size,
    status: r.status as TransitFSMState, createdAt: r.created_at,
  };
}

const COLS = 'id, workspace_id, tenant_id, operator_name, cac_reg_number, frsc_fleet_ref, fleet_size, status, created_at';

export class TransitRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateTransitInput): Promise<TransitProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO transit_profiles
         (id, workspace_id, tenant_id, operator_name, cac_reg_number,
          frsc_fleet_ref, fleet_size, status, created_at)
       VALUES (?, ?, ?, ?, ?, NULL, ?, 'seeded', unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.operatorName,
      input.cacRegNumber ?? null, input.fleetSize ?? 0).run();
    const transit = await this.findById(id, input.tenantId);
    if (!transit) throw new Error('[transit] create failed');
    return transit;
  }

  async findById(id: string, tenantId: string): Promise<TransitProfile | null> {
    const row = await this.db.prepare(
      `SELECT ${COLS} FROM transit_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<TransitRow>();
    return row ? rowToTransit(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<TransitProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM transit_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<TransitRow>();
    return (results ?? []).map(rowToTransit);
  }

  async update(id: string, tenantId: string, input: UpdateTransitInput): Promise<TransitProfile | null> {
    const sets: string[] = [];
    const bindings: unknown[] = [];
    if (input.operatorName !== undefined) { sets.push('operator_name = ?');  bindings.push(input.operatorName); }
    if ('cacRegNumber' in input)          { sets.push('cac_reg_number = ?'); bindings.push(input.cacRegNumber ?? null); }
    if ('frscFleetRef' in input)          { sets.push('frsc_fleet_ref = ?'); bindings.push(input.frscFleetRef ?? null); }
    if (input.fleetSize !== undefined)    { sets.push('fleet_size = ?');     bindings.push(input.fleetSize); }
    if (input.status !== undefined)       { sets.push('status = ?');         bindings.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    bindings.push(id, tenantId);
    await this.db.prepare(
      `UPDATE transit_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...bindings).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, toStatus: TransitFSMState): Promise<TransitProfile | null> {
    return this.update(id, tenantId, { status: toStatus });
  }
}
