/**
 * @webwaka/groups-faith — Faith extension repository
 *
 * Platform Invariants:
 *   T3 — tenant_id predicate on every query
 */

import type { GroupFaithExtension, UpsertFaithExtensionInput } from './types.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
    };
    first<T>(): Promise<T | null>;
  };
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

interface FaithExtRow {
  group_id: string; tenant_id: string; workspace_id: string;
  faith_tradition: string; denomination: string | null;
  tithe_bridge_enabled: number; service_day: string | null;
  congregation_size: number | null; state_code: string | null; lga_code: string | null;
  created_at: number; updated_at: number;
}

function mapExtension(r: FaithExtRow): GroupFaithExtension {
  return {
    groupId: r.group_id, tenantId: r.tenant_id, workspaceId: r.workspace_id,
    faithTradition: r.faith_tradition as GroupFaithExtension['faithTradition'],
    denomination: r.denomination, titheBridgeEnabled: r.tithe_bridge_enabled === 1,
    serviceDay: r.service_day as GroupFaithExtension['serviceDay'],
    congregationSize: r.congregation_size, stateCode: r.state_code, lgaCode: r.lga_code,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export async function upsertFaithExtension(
  db: D1Like,
  input: UpsertFaithExtensionInput,
): Promise<GroupFaithExtension> {
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_faith_extensions
         (group_id, tenant_id, workspace_id, faith_tradition, denomination,
          tithe_bridge_enabled, service_day, congregation_size, state_code, lga_code, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT (group_id, tenant_id) DO UPDATE SET
         faith_tradition = excluded.faith_tradition,
         denomination = excluded.denomination,
         tithe_bridge_enabled = excluded.tithe_bridge_enabled,
         service_day = excluded.service_day,
         congregation_size = excluded.congregation_size,
         state_code = excluded.state_code,
         lga_code = excluded.lga_code,
         updated_at = excluded.updated_at`,
    )
    .bind(
      input.groupId, input.tenantId, input.workspaceId, input.faithTradition,
      input.denomination ?? null, input.titheBridgeEnabled ? 1 : 0,
      input.serviceDay ?? null, input.congregationSize ?? null,
      input.stateCode ?? null, input.lgaCode ?? null, ts, ts,
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM group_faith_extensions WHERE group_id = ? AND tenant_id = ?')
    .bind(input.groupId, input.tenantId)
    .first<FaithExtRow>();
  if (!row) throw new Error('faith extension upsert failed');
  return mapExtension(row);
}

export async function getFaithExtension(
  db: D1Like,
  groupId: string,
  tenantId: string,
): Promise<GroupFaithExtension | null> {
  const row = await db
    .prepare('SELECT * FROM group_faith_extensions WHERE group_id = ? AND tenant_id = ?')
    .bind(groupId, tenantId)
    .first<FaithExtRow>();
  return row ? mapExtension(row) : null;
}
