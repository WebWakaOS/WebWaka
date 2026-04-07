/**
 * D1-backed CRUD for the individuals table.
 * Platform Invariant T3: every query includes a tenant_id predicate. No exceptions.
 */

import type { Individual, TenantId, IndividualId } from '@webwaka/types';
import { EntityType } from '@webwaka/types';
import { generateIndividualId } from '../ids.js';
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

export interface CreateIndividualInput {
  name: string;
  placeId?: string;
  metadata?: Record<string, unknown>;
}

interface IndividualRow {
  id: string;
  name: string;
  tenant_id: string;
  place_id: string | null;
  metadata: string | null;
  created_at: string;
  updated_at: string;
}

function rowToIndividual(row: IndividualRow): Individual {
  return {
    id: row.id as IndividualId,
    type: EntityType.Individual,
    tenantId: row.tenant_id as TenantId,
    name: row.name,
    placeId: row.place_id ?? undefined,
    metadata: row.metadata ? (JSON.parse(row.metadata) as Record<string, unknown>) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Individual;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export async function createIndividual(
  db: D1Like,
  tenantId: TenantId,
  input: CreateIndividualInput,
): Promise<Individual> {
  const id = generateIndividualId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO individuals (id, name, entity_type, tenant_id, place_id, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      input.name,
      EntityType.Individual,
      tenantId,
      input.placeId ?? null,
      input.metadata ? JSON.stringify(input.metadata) : null,
    )
    .run();

  return {
    id,
    type: EntityType.Individual,
    tenantId,
    name: input.name,
    placeId: input.placeId,
    metadata: input.metadata,
    createdAt: now,
    updatedAt: now,
  } as unknown as Individual;
}

export async function getIndividualById(
  db: D1Like,
  tenantId: TenantId,
  id: IndividualId,
): Promise<Individual | null> {
  const row = await db
    .prepare(
      `SELECT id, name, tenant_id, place_id, metadata, datetime(created_at,'unixepoch') AS created_at, datetime(updated_at,'unixepoch') AS updated_at
       FROM individuals WHERE id = ? AND tenant_id = ?`,
    )
    .bind(id, tenantId)
    .first<IndividualRow>();

  return row ? rowToIndividual(row) : null;
}

export async function listIndividualsByTenant(
  db: D1Like,
  tenantId: TenantId,
  opts: PaginationOptions = { limit: 20 },
): Promise<PaginatedResult<Individual>> {
  const limit = Math.min(opts.limit, 100);
  let sql = `SELECT id, name, tenant_id, place_id, metadata, datetime(created_at,'unixepoch') AS created_at, datetime(updated_at,'unixepoch') AS updated_at
             FROM individuals WHERE tenant_id = ?`;
  const bindings: unknown[] = [tenantId];

  if (opts.cursor) {
    const afterId = decodeCursor(opts.cursor);
    sql += ' AND id > ?';
    bindings.push(afterId);
  }

  sql += ` ORDER BY id ASC LIMIT ?`;
  bindings.push(limit + 1);

  const { results } = await db.prepare(sql).bind(...bindings).all<IndividualRow>();
  const hasMore = results.length > limit;
  const items = results.slice(0, limit).map(rowToIndividual);

  return {
    items,
    nextCursor: hasMore && items.length > 0 ? encodeCursor(items[items.length - 1]!.id as string) : null,
  };
}

export async function updateIndividual(
  db: D1Like,
  tenantId: TenantId,
  id: IndividualId,
  patch: Partial<CreateIndividualInput>,
): Promise<Individual | null> {
  const existing = await getIndividualById(db, tenantId, id);
  if (!existing) return null;

  const updates: string[] = [];
  const bindings: unknown[] = [];

  if (patch.name !== undefined) { updates.push('name = ?'); bindings.push(patch.name); }
  if (patch.placeId !== undefined) { updates.push('place_id = ?'); bindings.push(patch.placeId); }
  if (patch.metadata !== undefined) { updates.push('metadata = ?'); bindings.push(JSON.stringify(patch.metadata)); }
  updates.push('updated_at = unixepoch()');

  if (updates.length === 1) return existing; // only timestamp update

  bindings.push(id, tenantId);
  await db
    .prepare(`UPDATE individuals SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`)
    .bind(...bindings)
    .run();

  return getIndividualById(db, tenantId, id);
}
