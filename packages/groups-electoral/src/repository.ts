/**
 * @webwaka/groups-electoral — Electoral D1 repository layer.
 *
 * Phase 0: GOTV functions extracted from @webwaka/support-groups repository.
 * Now reference political_gotv_records table (renamed in migration 0432/0433).
 *
 * Platform Invariants:
 *   T3  — all queries include tenant_id predicate
 *   P13 — voter_ref returned in GotvRecord (for coordinator auth use only);
 *          stripping is enforced at the API route layer, NOT here.
 *          This layer returns the full record — the route strips voter_ref before
 *          any list response or AI context.
 */

import type {
  GroupElectoralExtension,
  UpsertElectoralExtensionInput,
  GotvRecord,
  GotvStats,
  RecordGotvInput,
} from './types.js';

export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<{ success: boolean }>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

function generateId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function now(): number {
  return Math.floor(Date.now() / 1000);
}

// ---------------------------------------------------------------------------
// Electoral Extension — DB table: group_electoral_extensions
// ---------------------------------------------------------------------------

export async function upsertElectoralExtension(
  db: D1Like,
  input: UpsertElectoralExtensionInput,
): Promise<GroupElectoralExtension> {
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_electoral_extensions
         (group_id, workspace_id, tenant_id, politician_id, campaign_office_id,
          election_cycle_id, target_state_code, target_lga_code, target_ward_code,
          inec_registered, inec_reg_number, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT (group_id, tenant_id) DO UPDATE SET
         politician_id = excluded.politician_id,
         campaign_office_id = excluded.campaign_office_id,
         election_cycle_id = excluded.election_cycle_id,
         target_state_code = excluded.target_state_code,
         target_lga_code = excluded.target_lga_code,
         target_ward_code = excluded.target_ward_code,
         inec_registered = excluded.inec_registered,
         inec_reg_number = excluded.inec_reg_number,
         updated_at = excluded.updated_at`,
    )
    .bind(
      input.groupId, input.workspaceId, input.tenantId,
      input.politicianId ?? null, input.campaignOfficeId ?? null,
      input.electionCycleId ?? null,
      input.targetStateCode ?? null, input.targetLgaCode ?? null, input.targetWardCode ?? null,
      input.inecRegistered ? 1 : 0, input.inecRegNumber ?? null,
      ts, ts,
    )
    .run();

  return (await getElectoralExtension(db, input.groupId, input.tenantId))!;
}

export async function getElectoralExtension(
  db: D1Like,
  groupId: string,
  tenantId: string,
): Promise<GroupElectoralExtension | null> {
  const row = await db
    .prepare(
      `SELECT * FROM group_electoral_extensions
       WHERE group_id = ? AND tenant_id = ? LIMIT 1`,
    )
    .bind(groupId, tenantId)
    .first<{
      group_id: string; workspace_id: string; tenant_id: string;
      politician_id: string | null; campaign_office_id: string | null;
      election_cycle_id: string | null;
      target_state_code: string | null; target_lga_code: string | null; target_ward_code: string | null;
      inec_registered: number; inec_reg_number: string | null;
      created_at: number; updated_at: number;
    }>();

  if (!row) return null;
  return {
    groupId: row.group_id, workspaceId: row.workspace_id, tenantId: row.tenant_id,
    politicianId: row.politician_id, campaignOfficeId: row.campaign_office_id,
    electionCycleId: row.election_cycle_id,
    targetStateCode: row.target_state_code, targetLgaCode: row.target_lga_code,
    targetWardCode: row.target_ward_code,
    inecRegistered: row.inec_registered === 1, inecRegNumber: row.inec_reg_number,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// GOTV — DB table: political_gotv_records
//
// P13 enforcement:
//   - voter_ref IS returned here (coordinator-only auth use).
//   - Route layer MUST strip voter_ref from all list responses and AI context.
//   - This function returns the full GotvRecord for auth-protected coordinator endpoints only.
// ---------------------------------------------------------------------------

export async function recordGotvMobilization(
  db: D1Like,
  input: RecordGotvInput,
): Promise<GotvRecord> {
  const id = generateId('gotv');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO political_gotv_records
         (id, group_id, workspace_id, tenant_id, voter_ref, polling_unit_code,
          state_code, lga_code, ward_code, coordinator_member_id, accredited, voted, mobilized_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,0,0,?)`,
    )
    .bind(
      id, input.groupId, input.workspaceId, input.tenantId,
      input.voterRef, input.pollingUnitCode,
      input.stateCode ?? null, input.lgaCode ?? null, input.wardCode ?? null,
      input.coordinatorMemberId, ts,
    )
    .run();

  return {
    id, groupId: input.groupId, workspaceId: input.workspaceId, tenantId: input.tenantId,
    voterRef: input.voterRef, pollingUnitCode: input.pollingUnitCode,
    stateCode: input.stateCode ?? null, lgaCode: input.lgaCode ?? null, wardCode: input.wardCode ?? null,
    coordinatorMemberId: input.coordinatorMemberId,
    accredited: false, voted: false,
    mobilizedAt: ts, voteConfirmedAt: null,
  };
}

export async function confirmVote(
  db: D1Like,
  gotvId: string,
  tenantId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE political_gotv_records
       SET voted = 1, vote_confirmed_at = ?
       WHERE id = ? AND tenant_id = ?`,
    )
    .bind(now(), gotvId, tenantId)
    .run();
}

export async function getGotvStats(
  db: D1Like,
  groupId: string,
  tenantId: string,
  pollingUnitCode?: string,
): Promise<GotvStats> {
  const where = [`group_id = ?`, `tenant_id = ?`];
  const vals: unknown[] = [groupId, tenantId];
  if (pollingUnitCode) { where.push(`polling_unit_code = ?`); vals.push(pollingUnitCode); }

  const row = await db
    .prepare(
      `SELECT COUNT(*) as total, SUM(accredited) as accredited, SUM(voted) as voted
       FROM political_gotv_records WHERE ${where.join(' AND ')}`,
    )
    .bind(...vals)
    .first<{ total: number; accredited: number | null; voted: number | null }>();

  return { total: row?.total ?? 0, accredited: row?.accredited ?? 0, voted: row?.voted ?? 0 };
}
