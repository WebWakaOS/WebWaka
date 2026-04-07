/**
 * D1-backed CRUD for the organizations table.
 * T3: every query includes tenant_id.
 */

import type { Organization, TenantId, OrganizationId } from '@webwaka/types';
import { EntityType } from '@webwaka/types';
import { generateOrganizationId } from '../ids.js';
import type { PaginationOptions, PaginatedResult } from '../pagination.js';
import { encodeCursor, decodeCursor } from '../pagination.js';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): { run(): Promise<unknown>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }> };
    run(): Promise<unknown>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

export interface CreateOrganizationInput {
  name: string;
  placeId?: string;
  metadata?: Record<string, unknown>;
}

interface OrgRow {
  id: string;
  name: string;
  tenant_id: string;
  place_id: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

function rowToOrg(row: OrgRow): Organization {
  return {
    id: row.id as OrganizationId,
    type: EntityType.Organization,
    tenantId: row.tenant_id as TenantId,
    name: row.name,
    placeId: row.place_id ?? undefined,
    metadata: row.metadata ? (JSON.parse(row.metadata) as Record<string, unknown>) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Organization;
}

export async function createOrganization(
  db: D1Like,
  tenantId: TenantId,
  input: CreateOrganizationInput,
): Promise<Organization> {
  const id = generateOrganizationId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO organizations (id, name, entity_type, tenant_id, place_id, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      input.name,
      EntityType.Organization,
      tenantId,
      input.placeId ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
    )
    .run();

  return {
    id,
    type: EntityType.Organization,
    tenantId,
    name: input.name,
    placeId: input.placeId,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  } as unknown as Organization;
}

export async function getOrganizationById(
  db: D1Like,
  tenantId: TenantId,
  id: OrganizationId,
): Promise<Organization | null> {
  const row = await db
    .prepare(
      `SELECT id, name, tenant_id, place_id, metadata, datetime(created_at,'unixepoch') AS created_at, datetime(updated_at,'unixepoch') AS updated_at
       FROM organizations WHERE id = ? AND tenant_id = ?`,
    )
    .bind(id, tenantId)
    .first<OrgRow>();

  return row ? rowToOrg(row) : null;
}

export async function listOrganizationsByTenant(
  db: D1Like,
  tenantId: TenantId,
  opts: PaginationOptions = { limit: 20 },
): Promise<PaginatedResult<Organization>> {
  const limit = Math.min(opts.limit, 100);
  let sql = `SELECT id, name, tenant_id, place_id, metadata, datetime(created_at,'unixepoch') AS created_at, datetime(updated_at,'unixepoch') AS updated_at
             FROM organizations WHERE tenant_id = ?`;
  const bindings: unknown[] = [tenantId];

  if (opts.cursor) {
    bindings.push(decodeCursor(opts.cursor));
    sql += ' AND id > ?';
  }

  sql += ` ORDER BY id ASC LIMIT ?`;
  bindings.push(limit + 1);

  const { results } = await db.prepare(sql).bind(...bindings).all<OrgRow>();
  const hasMore = results.length > limit;
  const items = results.slice(0, limit).map(rowToOrg);

  return {
    items,
    nextCursor: hasMore && items.length > 0 ? encodeCursor(items[items.length - 1]!.id as string) : null,
  };
}

export async function updateOrganization(
  db: D1Like,
  tenantId: TenantId,
  id: OrganizationId,
  patch: Partial<CreateOrganizationInput>,
): Promise<Organization | null> {
  const existing = await getOrganizationById(db, tenantId, id);
  if (!existing) return null;

  const updates: string[] = [];
  const bindings: unknown[] = [];

  if (patch.name !== undefined) { updates.push('name = ?'); bindings.push(patch.name); }
  if (patch.placeId !== undefined) { updates.push('place_id = ?'); bindings.push(patch.placeId); }
  if (patch.metadata !== undefined) { updates.push('metadata = ?'); bindings.push(JSON.stringify(patch.metadata)); }
  updates.push('updated_at = unixepoch()');

  if (updates.length === 1) return existing;

  bindings.push(id, tenantId);
  await db
    .prepare(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`)
    .bind(...bindings)
    .run();

  return getOrganizationById(db, tenantId, id);
}
