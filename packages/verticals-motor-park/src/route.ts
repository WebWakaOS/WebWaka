/**
 * Transport route repository.
 * (M8c — T3 isolation)
 * Migration: 0051_transport.sql → transport_routes
 */

import type { TransportRoute, CreateRouteInput, UpdateRouteInput, RouteStatus } from './types.js';

interface D1Like {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
  };
}

interface RouteRow {
  id: string; workspace_id: string; tenant_id: string;
  route_name: string; origin_place_id: string | null; dest_place_id: string | null;
  route_type: string; license_ref: string | null; license_expires: number | null;
  fare_kobo: number | null; frequency_mins: number | null; status: string; created_at: number;
}

function rowToRoute(r: RouteRow): TransportRoute {
  return {
    id: r.id, workspaceId: r.workspace_id, tenantId: r.tenant_id,
    routeName: r.route_name, originPlaceId: r.origin_place_id, destPlaceId: r.dest_place_id,
    routeType: r.route_type as TransportRoute['routeType'],
    licenseRef: r.license_ref, licenseExpires: r.license_expires,
    fareKobo: r.fare_kobo, frequencyMins: r.frequency_mins,
    status: r.status as RouteStatus, createdAt: r.created_at,
  };
}

const COLS = 'id, workspace_id, tenant_id, route_name, origin_place_id, dest_place_id, route_type, license_ref, license_expires, fare_kobo, frequency_mins, status, created_at';

export class RouteRepository {
  constructor(private readonly db: D1Like) {}

  async create(input: CreateRouteInput): Promise<TransportRoute> {
    const id = input.id ?? crypto.randomUUID();
    await this.db.prepare(
      `INSERT INTO transport_routes
         (id, workspace_id, tenant_id, route_name, origin_place_id, dest_place_id,
          route_type, license_ref, license_expires, fare_kobo, frequency_mins, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, 'pending', unixepoch())`,
    ).bind(id, input.workspaceId, input.tenantId, input.routeName,
      input.originPlaceId ?? null, input.destPlaceId ?? null, input.routeType,
      input.fareKobo ?? null, input.frequencyMins ?? null).run();
    const route = await this.findById(id, input.tenantId);
    if (!route) throw new Error('[route] create failed');
    return route;
  }

  async findById(id: string, tenantId: string): Promise<TransportRoute | null> {
    const row = await this.db.prepare(
      `SELECT ${COLS} FROM transport_routes WHERE id = ? AND tenant_id = ?`,
    ).bind(id, tenantId).first<RouteRow>();
    return row ? rowToRoute(row) : null;
  }

  async findByWorkspace(workspaceId: string, tenantId: string): Promise<TransportRoute[]> {
    const { results } = await this.db.prepare(
      `SELECT ${COLS} FROM transport_routes WHERE workspace_id = ? AND tenant_id = ? ORDER BY created_at DESC`,
    ).bind(workspaceId, tenantId).all<RouteRow>();
    return (results ?? []).map(rowToRoute);
  }

  async update(id: string, tenantId: string, input: UpdateRouteInput): Promise<TransportRoute | null> {
    const sets: string[] = [];
    const bindings: unknown[] = [];
    if (input.routeName !== undefined)       { sets.push('route_name = ?');     bindings.push(input.routeName); }
    if (input.routeType !== undefined)       { sets.push('route_type = ?');     bindings.push(input.routeType); }
    if ('licenseRef' in input)               { sets.push('license_ref = ?');    bindings.push(input.licenseRef ?? null); }
    if ('licenseExpires' in input)           { sets.push('license_expires = ?');bindings.push(input.licenseExpires ?? null); }
    if ('fareKobo' in input)                 { sets.push('fare_kobo = ?');      bindings.push(input.fareKobo ?? null); }
    if ('frequencyMins' in input)            { sets.push('frequency_mins = ?'); bindings.push(input.frequencyMins ?? null); }
    if (input.status !== undefined)          { sets.push('status = ?');         bindings.push(input.status); }
    if (sets.length === 0) return this.findById(id, tenantId);
    bindings.push(id, tenantId);
    await this.db.prepare(
      `UPDATE transport_routes SET ${sets.join(', ')} WHERE id = ? AND tenant_id = ?`,
    ).bind(...bindings).run();
    return this.findById(id, tenantId);
  }

  async licenseRoute(id: string, tenantId: string, licenseRef: string, licenseExpires: number): Promise<TransportRoute | null> {
    return this.update(id, tenantId, { licenseRef, licenseExpires, status: 'licensed' });
  }
}
