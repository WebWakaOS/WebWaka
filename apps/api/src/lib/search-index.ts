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

/**
 * BUG-SRCH-01 fix: generate a DETERMINISTIC search entry ID from the entity
 * type and entity ID so that repeated calls to indexIndividual / indexOrganization /
 * indexOffering always resolve to the same primary-key value.
 *
 * Previous behaviour: generateSearchId() returned a random UUID on every call.
 * Because `INSERT OR REPLACE` resolves conflicts via the PRIMARY KEY, a new
 * random PK never conflicts with the existing row, so every re-index call
 * INSERTED a duplicate row rather than replacing the existing one.
 *
 * With a deterministic ID, the second call correctly triggers the REPLACE path
 * and keeps exactly one search entry per entity.
 */
function searchEntryId(entityType: string, entityId: string): string {
  // Use a stable prefix + a slug derived from entity type and ID.
  // IDs are already short UUIDs; this stays well within D1 key limits.
  return `srch_${entityType}_${entityId}`;
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
  const id = searchEntryId('individual', individual.id);

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
  const id = searchEntryId('organization', org.id);

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

// ---------------------------------------------------------------------------
// Offering indexing — Cross-Pillar Data Flow (P4-C HIGH-009)
// ---------------------------------------------------------------------------

interface Offering {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  tenantId: TenantId;
  workspaceId: string;
  isPublished: boolean;
}

/**
 * Index (or re-index) an offering in search_entries.
 * Non-entity offerings are stored with entity_type = 'offering' so they can be
 * searched separately from org/individual profiles.
 *
 * Failures are intentionally non-fatal — callers should wrap in try/catch.
 */
export async function indexOffering(
  db: D1Like,
  offering: Offering,
): Promise<void> {
  if (!offering.isPublished) {
    // Unpublished offerings are removed from the index
    await removeOfferingFromIndex(db, offering.id);
    return;
  }

  const keywords = normaliseKeywords(
    [offering.name, offering.description ?? '', offering.category ?? ''].join(' '),
  );
  const id = searchEntryId('offering', offering.id);

  await db
    .prepare(
      `INSERT OR REPLACE INTO search_entries
         (id, entity_type, entity_id, tenant_id, display_name, keywords, place_id, ancestry_path, visibility, created_at, updated_at)
       VALUES (?, 'offering', ?, ?, ?, ?, NULL, '[]', 'public', unixepoch(), unixepoch())`,
    )
    .bind(id, offering.id, offering.tenantId, offering.name, keywords)
    .run();
}

/**
 * Remove an offering from the search index (on delete or unpublish).
 * Non-fatal — callers should wrap in try/catch.
 */
export async function removeOfferingFromIndex(db: D1Like, offeringId: string): Promise<void> {
  await db
    .prepare(`DELETE FROM search_entries WHERE entity_id = ? AND entity_type = 'offering'`)
    .bind(offeringId)
    .run();
}
