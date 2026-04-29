/**
 * @webwaka/groups-civic — Civic extension repository
 *
 * Phase 2: D1 data layer for group_civic_extensions and group_civic_beneficiaries.
 *
 * Platform Invariants:
 *   T3  — tenant_id predicate on every query
 *   P10 — ndpr_consented=true required on addBeneficiary
 *   P13 — no NIN/BVN allowed; enforced by type system (display_name only)
 */

import type {
  GroupCivicExtension,
  BeneficiaryRecord,
  UpsertCivicExtensionInput,
  AddBeneficiaryInput,
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

interface CivicExtRow {
  group_id: string; tenant_id: string; workspace_id: string;
  ngo_reg_number: string | null; ngo_reg_body: string | null;
  beneficiary_tracking: number; focus_area: string | null;
  state_code: string | null; lga_code: string | null;
  created_at: number; updated_at: number;
}

interface BeneficiaryRow {
  id: string; tenant_id: string; group_id: string; workspace_id: string;
  display_name: string; category: string | null; state_code: string | null;
  lga_code: string | null; ward_code: string | null; ndpr_consented: number;
  status: string; enrolled_at: number; exited_at: number | null; notes: string | null;
}

function mapExtension(r: CivicExtRow): GroupCivicExtension {
  return {
    groupId: r.group_id, tenantId: r.tenant_id, workspaceId: r.workspace_id,
    ngoRegNumber: r.ngo_reg_number, ngoRegBody: r.ngo_reg_body,
    beneficiaryTracking: r.beneficiary_tracking === 1, focusArea: r.focus_area,
    stateCode: r.state_code, lgaCode: r.lga_code,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function mapBeneficiary(r: BeneficiaryRow): BeneficiaryRecord {
  return {
    id: r.id, tenantId: r.tenant_id, groupId: r.group_id, workspaceId: r.workspace_id,
    displayName: r.display_name, category: r.category as BeneficiaryRecord['category'],
    stateCode: r.state_code, lgaCode: r.lga_code, wardCode: r.ward_code,
    ndprConsented: r.ndpr_consented === 1, status: r.status as BeneficiaryRecord['status'],
    enrolledAt: r.enrolled_at, exitedAt: r.exited_at, notes: r.notes,
  };
}

export async function upsertCivicExtension(
  db: D1Like,
  input: UpsertCivicExtensionInput,
): Promise<GroupCivicExtension> {
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_civic_extensions
         (group_id, tenant_id, workspace_id, ngo_reg_number, ngo_reg_body,
          beneficiary_tracking, focus_area, state_code, lga_code, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT (group_id, tenant_id) DO UPDATE SET
         ngo_reg_number = excluded.ngo_reg_number,
         ngo_reg_body = excluded.ngo_reg_body,
         beneficiary_tracking = excluded.beneficiary_tracking,
         focus_area = excluded.focus_area,
         state_code = excluded.state_code,
         lga_code = excluded.lga_code,
         updated_at = excluded.updated_at`,
    )
    .bind(
      input.groupId, input.tenantId, input.workspaceId,
      input.ngoRegNumber ?? null, input.ngoRegBody ?? null,
      input.beneficiaryTracking ? 1 : 0, input.focusArea ?? null,
      input.stateCode ?? null, input.lgaCode ?? null, ts, ts,
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM group_civic_extensions WHERE group_id = ? AND tenant_id = ?')
    .bind(input.groupId, input.tenantId)
    .first<CivicExtRow>();
  if (!row) throw new Error('civic extension upsert failed');
  return mapExtension(row);
}

export async function getCivicExtension(
  db: D1Like,
  groupId: string,
  tenantId: string,
): Promise<GroupCivicExtension | null> {
  const row = await db
    .prepare('SELECT * FROM group_civic_extensions WHERE group_id = ? AND tenant_id = ?')
    .bind(groupId, tenantId)
    .first<CivicExtRow>();
  return row ? mapExtension(row) : null;
}

export async function addBeneficiary(
  db: D1Like,
  input: AddBeneficiaryInput,
): Promise<BeneficiaryRecord> {
  if (!input.ndprConsented) {
    throw new Error('P10_VIOLATION: ndprConsented must be true to enroll a beneficiary');
  }
  const id = generateId('bcf');
  const ts = now();
  await db
    .prepare(
      `INSERT INTO group_civic_beneficiaries
         (id, tenant_id, group_id, workspace_id, display_name, category, state_code,
          lga_code, ward_code, ndpr_consented, status, enrolled_at, exited_at, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .bind(
      id, input.tenantId, input.groupId, input.workspaceId, input.displayName,
      input.category ?? null, input.stateCode ?? null, input.lgaCode ?? null,
      input.wardCode ?? null, 1, 'active', ts, null, input.notes ?? null,
    )
    .run();

  const row = await db
    .prepare('SELECT * FROM group_civic_beneficiaries WHERE id = ? AND tenant_id = ?')
    .bind(id, input.tenantId)
    .first<BeneficiaryRow>();
  if (!row) throw new Error('beneficiary creation failed');
  return mapBeneficiary(row);
}

export async function listBeneficiaries(
  db: D1Like,
  tenantId: string,
  groupId: string,
  limit = 100,
): Promise<BeneficiaryRecord[]> {
  const { results } = await db
    .prepare(
      `SELECT * FROM group_civic_beneficiaries
       WHERE tenant_id = ? AND group_id = ? AND status = 'active'
       ORDER BY enrolled_at DESC LIMIT ?`,
    )
    .bind(tenantId, groupId, limit)
    .all<BeneficiaryRow>();
  return results.map(mapBeneficiary);
}

export async function getBeneficiaryCount(
  db: D1Like,
  tenantId: string,
  groupId: string,
): Promise<number> {
  const row = await db
    .prepare(
      `SELECT COUNT(*) as cnt FROM group_civic_beneficiaries
       WHERE tenant_id = ? AND group_id = ? AND status = 'active'`,
    )
    .bind(tenantId, groupId)
    .first<{ cnt: number }>();
  return row?.cnt ?? 0;
}
