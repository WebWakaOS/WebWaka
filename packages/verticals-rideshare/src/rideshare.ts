/**
 * Rideshare driver D1 repository.
 * (M8c — Platform Invariants T3, P9)
 * Migration: 0051_transport.sql → rideshare_profiles
 * P9: ratingX10 stored as integer (47 = 4.7 stars).
 */

import type { RideshareProfile, CreateRideshareInput, UpdateRideshareInput, RideshareFSMState } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface RideshareRow {
  id: string; individual_id: string; workspace_id: string; tenant_id: string;
  frsc_license: string | null; frsc_expires: number | null;
  vehicle_type: string | null; plate_number: string | null;
  seat_count: number; rating_x10: number; status: string; created_at: number;
}

function rowToRideshare(r: RideshareRow): RideshareProfile {
  return {
    id: r.id, individualId: r.individual_id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    frscLicense: r.frsc_license, frscExpires: r.frsc_expires,
    vehicleType: r.vehicle_type, plateNumber: r.plate_number,
    seatCount: r.seat_count, ratingX10: r.rating_x10,
    status: r.status as RideshareFSMState, createdAt: r.created_at,
  };
}

const COLS = 'id, individual_id, workspace_id, tenant_id, frsc_license, frsc_expires, vehicle_type, plate_number, seat_count, rating_x10, status, created_at';

export class RideshareRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateRideshareInput): Promise<RideshareProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO rideshare_profiles
         (id, individual_id, workspace_id, tenant_id, frsc_license, frsc_expires,
          vehicle_type, plate_number, seat_count, rating_x10, status, created_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, 50, 'seeded', unixepoch())`,
    ).bind(id, input.individualId, input.workspaceId, input.tenantId,
      input.vehicleType ?? null, input.plateNumber ?? null,
      input.seatCount ?? 4).run();
    const profile = await this.findById(id, input.tenantId);
    if (!profile) throw new Error('[rideshare] create failed');
    return profile;
  }

  async findById(id: string, tenantId: string): Promise<RideshareProfile | null> {
    const row = await this.db.prepare(
      `SELECT ${COLS} FROM rideshare_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<RideshareRow>();
    return row ? rowToRideshare(row) : null;
  }

  async findByIndividual(individualId: string, tenantId: string): Promise<RideshareProfile | null> {
    const row = await this.db.prepare(
      `SELECT ${COLS} FROM rideshare_profiles WHERE individual_id = ? AND tenant_id = ?`,
    ).bind(individualId, tenantId).first<RideshareRow>();
    return row ? rowToRideshare(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<RideshareProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM rideshare_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY rating_x10 DESC`,
    ).bind(workspaceId, tenantId).all<RideshareRow>();
    return (results ?? []).map(rowToRideshare);
  }

  async update(id: string, tenantId: string, input: UpdateRideshareInput): Promise<RideshareProfile | null> {
    const sets: string[] = [];
    const bindings: unknown[] = [];
    if ('frscLicense' in input)    { sets.push('frsc_license = ?');  bindings.push(input.frscLicense ?? null); }
    if ('frscExpires' in input)    { sets.push('frsc_expires = ?');  bindings.push(input.frscExpires ?? null); }
    if ('vehicleType' in input)    { sets.push('vehicle_type = ?');  bindings.push(input.vehicleType ?? null); }
    if ('plateNumber' in input)    { sets.push('plate_number = ?');  bindings.push(input.plateNumber ?? null); }
    if (input.seatCount !== undefined) { sets.push('seat_count = ?'); bindings.push(input.seatCount); }
    if (input.ratingX10 !== undefined) { sets.push('rating_x10 = ?');bindings.push(input.ratingX10); }
    if (input.status !== undefined)    { sets.push('status = ?');    bindings.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    bindings.push(id, tenantId);
    await this.db.prepare(
      `UPDATE rideshare_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...bindings).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, toStatus: RideshareFSMState): Promise<RideshareProfile | null> {
    return this.update(id, tenantId, { status: toStatus });
  }
}
