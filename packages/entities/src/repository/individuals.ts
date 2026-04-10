/**
 * D1-backed CRUD for the individuals table.
 * Platform Invariant T3: every query includes a tenant_id predicate. No exceptions.
 *
 * Schema (actual D1):
 *   id, tenant_id, first_name, last_name, middle_name, display_name,
 *   verification_state, created_at, updated_at,
 *   nin_hash, bvn_hash, nin_verified, bvn_verified, phone, email, data_residency
 *
 * No entity_type, no place_id, no metadata columns.
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
  name: string;          // stored as display_name
  firstName?: string;
  lastName?: string;
  placeId?: string;      // kept for API compat; not stored (no column in schema)
  metadata?: Record<string, unknown>;
}

interface IndividualRow {
  id: string;
  name: string;          // aliased from display_name
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

function rowToIndividual(row: IndividualRow): Individual {
  return {
    id: row.id as IndividualId,
    type: EntityType.Individual,
    tenantId: row.tenant_id as TenantId,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Individual;
}

const SELECT_COLS = `id, display_name AS name, tenant_id,
                     datetime(created_at,'unixepoch') AS created_at,
                     datetime(updated_at,'unixepoch') AS updated_at`;

export async function createIndividual(
  db: D1Like,
  tenantId: TenantId,
  input: CreateIndividualInput,
): Promise<Individual> {
  const id = generateIndividualId();
  const now = new Date().toISOString();
  const displayName = input.name;
  const firstName = input.firstName ?? displayName.split(' ')[0] ?? displayName;
  const lastName  = input.lastName  ?? (displayName.split(' ').slice(1).join(' ') || firstName);

  await db
    .prepare(
      `INSERT INTO individuals (id, first_name, last_name, display_name, tenant_id)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, firstName, lastName, displayName, tenantId)
    .run();

  return {
    id,
    type: EntityType.Individual,
    tenantId,
    name: displayName,
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
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
    .prepare(`SELECT ${SELECT_COLS} FROM individuals WHERE id = ? AND tenant_id = ?`)
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
  let sql = `SELECT ${SELECT_COLS} FROM individuals WHERE tenant_id = ?`;
  const bindings: unknown[] = [tenantId];

  if (opts.cursor) {
    sql += ' AND id > ?';
    bindings.push(decodeCursor(opts.cursor));
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

  if (patch.name !== undefined)      { updates.push('display_name = ?'); bindings.push(patch.name); }
  if (patch.firstName !== undefined) { updates.push('first_name = ?');   bindings.push(patch.firstName); }
  if (patch.lastName !== undefined)  { updates.push('last_name = ?');    bindings.push(patch.lastName); }
  updates.push('updated_at = unixepoch()');

  if (updates.length === 1) return existing;

  bindings.push(id, tenantId);
  await db
    .prepare(`UPDATE individuals SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`)
    .bind(...bindings)
    .run();

  return getIndividualById(db, tenantId, id);
}

