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

export async function removeFromIndex(db: D1Like, entityId: string, tenantId: TenantId): Promise<void> {
  // T3: scope by tenant_id so a cross-tenant entity_id collision (however unlikely
  // with UUID-based IDs) cannot delete another tenant's search entry.
  await db
    .prepare(`DELETE FROM search_entries WHERE entity_id = ? AND tenant_id = ?`)
    .bind(entityId, tenantId)
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
    await removeOfferingFromIndex(db, offering.id, offering.tenantId);
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
export async function removeOfferingFromIndex(db: D1Like, offeringId: string, tenantId: TenantId): Promise<void> {
  // T3: scope by tenant_id for defence-in-depth.
  await db
    .prepare(`DELETE FROM search_entries WHERE entity_id = ? AND entity_type = 'offering' AND tenant_id = ?`)
    .bind(offeringId, tenantId)
    .run();
}

// ---------------------------------------------------------------------------
// WakaPage indexing — Phase 1 (ADR-0041, Discovery integration)
// ---------------------------------------------------------------------------

interface WakaPageEntry {
  pageId: string;
  entityId: string;
  entityType: 'individual' | 'organization';
  displayName: string;
  slug: string;
  tenantId: TenantId;
  placeId?: string | null;
  publishedAt: number;
}

/**
 * Index (or re-index) a published WakaPage in search_entries.
 *
 * Uses INSERT OR REPLACE with a deterministic search entry ID derived from
 * the profile entity — this merges the WakaPage facet columns into the
 * existing profile search entry (or creates one if not yet indexed).
 *
 * Called from POST /wakapages/:id/publish.
 * Non-fatal — callers must wrap in try/catch.
 */
export async function indexWakaPage(db: D1Like, entry: WakaPageEntry): Promise<void> {
  const ancestryPath = await getAncestryPath(db, entry.placeId);
  const keywords = normaliseKeywords(entry.displayName);
  const id = searchEntryId(entry.entityType, entry.entityId);

  await db
    .prepare(
      `INSERT OR REPLACE INTO search_entries
         (id, entity_type, entity_id, tenant_id, display_name, keywords,
          place_id, ancestry_path, visibility,
          wakapage_page_id, wakapage_slug, wakapage_published_at,
          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'public', ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      entry.entityType,
      entry.entityId,
      entry.tenantId,
      entry.displayName,
      keywords,
      entry.placeId ?? null,
      JSON.stringify(ancestryPath),
      entry.pageId,
      entry.slug,
      entry.publishedAt,
    )
    .run();
}

/**
 * Remove WakaPage facets from search_entries when a page is unpublished.
 * Nulls the WakaPage-specific columns but keeps the base search entry intact.
 * Non-fatal — callers must wrap in try/catch.
 */
export async function removeWakaPageFromIndex(
  db: D1Like,
  pageId: string,
  tenantId: TenantId,
): Promise<void> {
  await db
    .prepare(
      `UPDATE search_entries
       SET wakapage_page_id = NULL,
           wakapage_slug = NULL,
           wakapage_published_at = NULL,
           updated_at = unixepoch()
       WHERE wakapage_page_id = ? AND tenant_id = ?`,
    )
    .bind(pageId, tenantId)
    .run();
}

// ---------------------------------------------------------------------------
// Support Group indexing — Migration 0390 / 0393
// ---------------------------------------------------------------------------

interface SupportGroupEntry {
  id: string;
  name: string;
  tenantId: TenantId;
  workspaceId: string;
  stateCode?: string | null;
  lgaCode?: string | null;
  wardCode?: string | null;
  groupType?: string | null;
  visibility?: string;
}

/**
 * Index (or re-index) a support group in search_entries.
 *
 * Uses INSERT OR REPLACE with a deterministic search entry ID.
 * Private/invite_only groups are NOT indexed (removed if they exist).
 * Non-fatal — callers must wrap in try/catch.
 *
 * Migration 0393 adds state_code, lga_code, ward_code, group_type columns
 * to search_entries for geo and type-filtered discovery.
 */
export async function indexSupportGroup(
  db: D1Like,
  entry: SupportGroupEntry,
): Promise<void> {
  if (entry.visibility && entry.visibility !== 'public') {
    await removeFromIndex(db, entry.id, entry.tenantId);
    return;
  }

  const keywords = normaliseKeywords(entry.name);
  const id = searchEntryId('support_group', entry.id);

  await db
    .prepare(
      `INSERT OR REPLACE INTO search_entries
         (id, entity_type, entity_id, tenant_id, display_name, keywords,
          place_id, ancestry_path, visibility,
          state_code, lga_code, ward_code, group_type,
          created_at, updated_at)
       VALUES (?, 'support_group', ?, ?, ?, ?, NULL, '[]', 'public',
               ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      entry.id,
      entry.tenantId,
      entry.name,
      keywords,
      entry.stateCode ?? null,
      entry.lgaCode   ?? null,
      entry.wardCode  ?? null,
      entry.groupType ?? null,
    )
    .run();
}

/**
 * Remove a support group from the search index.
 * Called on archive or visibility change to private.
 * Non-fatal — callers must wrap in try/catch.
 */
export async function removeSupportGroupFromIndex(
  db: D1Like,
  groupId: string,
  tenantId: TenantId,
): Promise<void> {
  await db
    .prepare(
      `DELETE FROM search_entries WHERE entity_id = ? AND entity_type = 'support_group' AND tenant_id = ?`,
    )
    .bind(groupId, tenantId)
    .run();
}

// ---------------------------------------------------------------------------
// Fundraising Campaign indexing — Migration 0391 / 0393
// ---------------------------------------------------------------------------

interface FundraisingCampaignEntry {
  id: string;
  title: string;
  tenantId: TenantId;
  workspaceId: string;
  slug: string;
  campaignType?: string | null;
  visibility?: string;
  supportGroupId?: string | null;
}

/**
 * Index (or re-index) a fundraising campaign in search_entries.
 *
 * Uses INSERT OR REPLACE with a deterministic search entry ID.
 * Private/unlisted campaigns are NOT indexed (removed if they exist).
 * Non-fatal — callers must wrap in try/catch.
 *
 * Migration 0393 adds campaign_type column to search_entries for type-filtered
 * discovery queries (e.g. GET /discovery?type=fundraising_campaign&campaign_type=election).
 */
export async function indexFundraisingCampaign(
  db: D1Like,
  entry: FundraisingCampaignEntry,
): Promise<void> {
  if (entry.visibility && entry.visibility !== 'public') {
    await db
      .prepare(
        `DELETE FROM search_entries WHERE entity_id = ? AND entity_type = 'fundraising_campaign' AND tenant_id = ?`,
      )
      .bind(entry.id, entry.tenantId)
      .run();
    return;
  }

  const keywords = normaliseKeywords(entry.title + ' ' + (entry.slug ?? ''));
  const id = searchEntryId('fundraising_campaign', entry.id);

  await db
    .prepare(
      `INSERT OR REPLACE INTO search_entries
         (id, entity_type, entity_id, tenant_id, display_name, keywords,
          place_id, ancestry_path, visibility,
          campaign_type,
          created_at, updated_at)
       VALUES (?, 'fundraising_campaign', ?, ?, ?, ?, NULL, '[]', 'public',
               ?, unixepoch(), unixepoch())`,
    )
    .bind(
      id,
      entry.id,
      entry.tenantId,
      entry.title,
      keywords,
      entry.campaignType ?? null,
    )
    .run();
}

/**
 * Remove a fundraising campaign from the search index.
 * Called when a campaign is cancelled, set to private/unlisted, or deleted.
 * Non-fatal — callers must wrap in try/catch.
 */
export async function removeFundraisingCampaignFromIndex(
  db: D1Like,
  campaignId: string,
  tenantId: TenantId,
): Promise<void> {
  await db
    .prepare(
      `DELETE FROM search_entries WHERE entity_id = ? AND entity_type = 'fundraising_campaign' AND tenant_id = ?`,
    )
    .bind(campaignId, tenantId)
    .run();
}
