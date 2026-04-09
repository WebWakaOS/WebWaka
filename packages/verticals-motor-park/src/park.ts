/**
 * Motor Park D1 repository.
 * (M8c — Platform Invariants T3)
 * Migration: 0051_transport.sql → motor_park_profiles
 */

import type { MotorParkProfile, CreateParkInput, UpdateParkInput, ParkFSMState } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface ParkRow {
  id: string; workspace_id: string; tenant_id: string; place_id: string | null;
  park_name: string; lga: string; state: string;
  frsc_operator_ref: string | null; nurtw_ref: string | null;
  capacity: number | null; status: string; created_at: number;
}

function rowToPark(r: ParkRow): MotorParkProfile {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    placeId: r.place_id, parkName: r.park_name, lga: r.lga, state: r.state,
    frscOperatorRef: r.frsc_operator_ref, nurtwRef: r.nurtw_ref,
    capacity: r.capacity, status: r.status as ParkFSMState, createdAt: r.created_at,
  };
}

const COLS = 'id, workspace_id, tenant_id, place_id, park_name, lga, state, frsc_operator_ref, nurtw_ref, capacity, status, created_at';

export class MotorParkRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateParkInput): Promise<MotorParkProfile> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO motor_park_profiles
         (id, workspace_id, tenant_id, place_id, park_name, lga, state,
          frsc_operator_ref, nurtw_ref, capacity, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, 'seeded', unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId,
      input.placeId ?? null, input.parkName, input.lga, input.state,
      input.capacity ?? null).run();
    const park = await this.findById(id, input.tenantId);
    if (!park) throw new Error('[motor-park] create failed');
    return park;
  }

  async findById(id: string, tenantId: string): Promise<MotorParkProfile | null> {
    const row = await this.db.prepare(
      `SELECT ${COLS} FROM motor_park_profiles WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<ParkRow>();
    return row ? rowToPark(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<MotorParkProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM motor_park_profiles WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<ParkRow>();
    return (results ?? []).map(rowToPark);
  }

  async findByState(state: string, tenantId: string): Promise<MotorParkProfile[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM motor_park_profiles WHERE state = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(state, tenantId).all<ParkRow>();
    return (results ?? []).map(rowToPark);
  }

  async update(id: string, tenantId: string, input: UpdateParkInput): Promise<MotorParkProfile | null> {
    const sets: string[] = [];
    const bindings: unknown[] = [];
    if (input.parkName !== undefined)    { sets.push('park_name = ?');          bindings.push(input.parkName); }
    if (input.lga !== undefined)         { sets.push('lga = ?');                bindings.push(input.lga); }
    if (input.state !== undefined)       { sets.push('state = ?');              bindings.push(input.state); }
    if ('placeId' in input)              { sets.push('place_id = ?');           bindings.push(input.placeId ?? null); }
    if ('frscOperatorRef' in input)      { sets.push('frsc_operator_ref = ?');  bindings.push(input.frscOperatorRef ?? null); }
    if ('nurtwRef' in input)             { sets.push('nurtw_ref = ?');          bindings.push(input.nurtwRef ?? null); }
    if ('capacity' in input)             { sets.push('capacity = ?');           bindings.push(input.capacity ?? null); }
    if (input.status !== undefined)      { sets.push('status = ?');             bindings.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    bindings.push(id, tenantId);
    await this.db.prepare(
      `UPDATE motor_park_profiles SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...bindings).run();
    return this.findById(id, tenantId);
  }

  async transition(id: string, tenantId: string, toStatus: ParkFSMState): Promise<MotorParkProfile | null> {
    return this.update(id, tenantId, { status: toStatus });
  }
}
