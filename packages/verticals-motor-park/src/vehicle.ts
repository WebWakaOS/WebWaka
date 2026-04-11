/**
 * Transport vehicle registry repository.
 * (M8c — T3 isolation)
 * Migration: 0051_transport.sql → transport_vehicles
 */

import type { TransportVehicle, CreateVehicleInput, UpdateVehicleInput, VehicleStatus } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface VehicleRow {
  id: string; workspace_id: string; tenant_id: string; route_id: string | null;
  plate_number: string; vehicle_type: string; capacity: number | null;
  frsc_license: string | null; frsc_expires: number | null; status: string; created_at: number;
}

function rowToVehicle(r: VehicleRow): TransportVehicle {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id, routeId: r.route_id,
    plateNumber: r.plate_number, vehicleType: r.vehicle_type as TransportVehicle['vehicleType'],
    capacity: r.capacity, frscLicense: r.frsc_license, frscExpires: r.frsc_expires,
    status: r.status as VehicleStatus, createdAt: r.created_at,
  };
}

const COLS = 'id, workspace_id, tenant_id, route_id, plate_number, vehicle_type, capacity, frsc_license, frsc_expires, status, created_at';

export class VehicleRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateVehicleInput): Promise<TransportVehicle> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO transport_vehicles
         (id, workspace_id, tenant_id, route_id, plate_number, vehicle_type,
          capacity, frsc_license, frsc_expires, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId,
      input.routeId ?? null, input.plateNumber, input.vehicleType,
      input.capacity ?? null, input.frscLicense ?? null, input.frscExpires ?? null).run();
    const vehicle = await this.findById(id, input.tenantId);
    if (!vehicle) throw new Error('[vehicle] create failed');
    return vehicle;
  }

  async findById(id: string, tenantId: string): Promise<TransportVehicle | null> {
    const row = await this.db.prepare(
      `SELECT ${COLS} FROM transport_vehicles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<VehicleRow>();
    return row ? rowToVehicle(row) : null;
  }

  async findByRoute(routeId: string, tenantId: string): Promise<TransportVehicle[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM transport_vehicles WHERE route_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(routeId, tenantId).all<VehicleRow>();
    return (results ?? []).map(rowToVehicle);
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<TransportVehicle[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM transport_vehicles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<VehicleRow>();
    return (results ?? []).map(rowToVehicle);
  }

  async update(id: string, tenantId: string, input: UpdateVehicleInput): Promise<TransportVehicle | null> {
    const sets: string[] = [];
    const bindings: unknown[] = [];
    if (input.plateNumber !== undefined) { sets.push('plate_number = ?');  bindings.push(input.plateNumber); }
    if (input.vehicleType !== undefined) { sets.push('vehicle_type = ?');  bindings.push(input.vehicleType); }
    if ('routeId' in input)              { sets.push('route_id = ?');      bindings.push(input.routeId ?? null); }
    if ('capacity' in input)             { sets.push('capacity = ?');      bindings.push(input.capacity ?? null); }
    if ('frscLicense' in input)          { sets.push('frsc_license = ?');  bindings.push(input.frscLicense ?? null); }
    if ('frscExpires' in input)          { sets.push('frsc_expires = ?');  bindings.push(input.frscExpires ?? null); }
    if (input.status !== undefined)      { sets.push('status = ?');        bindings.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    bindings.push(id, tenantId);
    await this.db.prepare(
      `UPDATE transport_vehicles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...bindings).run();
    return this.findById(id, tenantId);
  }
}
