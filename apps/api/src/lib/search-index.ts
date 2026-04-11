/**
 * Search index helpers — keep search_entries in sync with entity writes.
 *
 * Called from entity create routes (POST /entities/individuals, POST /entities/organizations).
 * Indexing failures are non-fatal: errors are logged but do not break the entity create response.
 *
 * Milestone 4 — Discovery Layer MVP
 */

import type { TenantId } from '@webwaka/types';

interface D1Like {
  prepare(query: string): {
    bind(...args: unknown[]): {
      run(): Promise<unknown>;
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
    };
    run(): Promise<unknown>;
    first<T>(): Promise<T | null>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface Individual {
  id: string;
  name: string;
  placeId?: string | null;
}

interface Organization {
  id: string;
  name: string;
  placeId?: string | null;
}

function normaliseKeywords(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSearchId(): string {
  return `srch_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

async function getAncestryPath(db: D1Like, placeId: string | null | undefined): Promise<string[]> {
  if (!placeId) return [];
  const row = await db
    .prepare(`SELECT ancestry_path FROM places WHERE id = ? LIMIT 1`)
    .bind(placeId)
    .first<{ ancestry_path: string | null }>();
  if (!row?.ancestry_path) return [placeId];
  try {
    const parsed = JSON.parse(row.ancestry_path) as string[];
    return [...parsed, placeId];
  } catch {
    return [placeId];
  }
}

export async function indexIndividual(
  db: D1Like,
  individual: Individual,
  tenantId: TenantId,
): Promise<void> {
  const ancestryPath = await getAncestryPath(db, individual.placeId);
  const keywords = normaliseKeywords(individual.name);
  const id = generateSearchId();

  await db
    .prepare(
      `INSERT OR REPLACE INTO search_entries
         (id, entity_type, entity_id, tenant_id, display_name, keywords, place_id, ancestry_path, visibility, created_at, updated_at)
       VALUES (?, 'individual', ?, ?, ?, ?, ?, ?, 'public', unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      individual.id,
      tenantId,
      individual.name,
      keywords,
      individual.placeId ?? null,
      JSON.stringify(ancestryPath),
    )
    .run();
}

export async function indexOrganization(
  db: D1Like,
  org: Organization,
  tenantId: TenantId,
): Promise<void> {
  const ancestryPath = await getAncestryPath(db, org.placeId);
  const keywords = normaliseKeywords(org.name);
  const id = generateSearchId();

  await db
    .prepare(
      `INSERT OR REPLACE INTO search_entries
         (id, entity_type, entity_id, tenant_id, display_name, keywords, place_id, ancestry_path, visibility, created_at, updated_at)
       VALUES (?, 'organization', ?, ?, ?, ?, ?, ?, 'public', unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      org.id,
      tenantId,
      org.name,
      keywords,
      org.placeId ?? null,
      JSON.stringify(ancestryPath),
    )
    .run();
}

export async function removeFromIndex(db: D1Like, entityId: string): Promise<void> {
  await db
    .prepare(`DELETE FROM search_entries WHERE entity_id = ?`)
    .bind(entityId)
    .run();
}
