/**
 * Offline-sync entity registry — Phase 1
 *
 * Declares which entity types are syncable, and what table + columns
 * are used for delta queries (incremental sync).
 *
 * Phase 0 entities: individual, organization, agent_transaction, etc.
 * Phase 1 additions: group, case (T004).
 *
 * P6:  All offline writes must be queued → synced deterministically.
 * P11: Server-wins conflict resolution for all entities.
 */

export interface SyncEntityConfig {
  /** Entity name used in SyncQueueItem.entityType and sync/delta endpoint */
  entityName: string;
  /** D1 table to query for delta */
  tableName: string;
  /** Primary key column name */
  idColumn: string;
  /** Timestamp column for delta queries (must index this column) */
  timestampColumn: string;
  /** Whether offline write operations (create/update/delete) are supported */
  offlineWriteEnabled: boolean;
  /** Human-readable label for UI */
  label: string;
}

/**
 * Registered syncable entities.
 * Order matters: entities are synced in registration order (FIFO, P11).
 * Core entities sync before domain entities to minimise FK constraint issues.
 */
export const SYNC_ENTITY_REGISTRY: readonly SyncEntityConfig[] = [
  // ── Core entities (Phase 0) ─────────────────────────────────────────────
  {
    entityName:           'individual',
    tableName:            'individuals',
    idColumn:             'id',
    timestampColumn:      'updated_at',
    offlineWriteEnabled:  true,
    label:                'Individual contact',
  },
  {
    entityName:           'organization',
    tableName:            'organizations',
    idColumn:             'id',
    timestampColumn:      'updated_at',
    offlineWriteEnabled:  true,
    label:                'Organisation',
  },
  {
    entityName:           'agent_transaction',
    tableName:            'agent_transactions',
    idColumn:             'id',
    timestampColumn:      'updated_at',
    offlineWriteEnabled:  true,
    label:                'Agent transaction',
  },
  {
    entityName:           'contact_channel',
    tableName:            'contact_channels',
    idColumn:             'id',
    timestampColumn:      'updated_at',
    offlineWriteEnabled:  true,
    label:                'Contact channel',
  },
  {
    entityName:           'offering',
    tableName:            'offerings',
    idColumn:             'id',
    timestampColumn:      'updated_at',
    offlineWriteEnabled:  true,
    label:                'Offering / product listing',
  },
  {
    entityName:           'pos_product',
    tableName:            'pos_products',
    idColumn:             'id',
    timestampColumn:      'updated_at',
    offlineWriteEnabled:  true,
    label:                'POS product',
  },
  {
    entityName:           'pos_sale',
    tableName:            'pos_sales',
    idColumn:             'id',
    timestampColumn:      'created_at', // pos_sales is append-only — no updated_at
    offlineWriteEnabled:  true,
    label:                'POS sale',
  },

  // ── Phase 1 additions (T004) ────────────────────────────────────────────

  {
    entityName:           'group',
    tableName:            'groups',
    idColumn:             'id',
    timestampColumn:      'updated_at',
    offlineWriteEnabled:  false, // Phase 1: read-only offline — group mutations require server
    label:                'Group',
  },
  {
    entityName:           'case',
    tableName:            'cases',
    idColumn:             'id',
    timestampColumn:      'updated_at',
    offlineWriteEnabled:  false, // Phase 1: read-only offline — case mutations require server
    label:                'Case',
  },
] as const;

/** Quick lookup by entityName */
export const SYNC_ENTITY_MAP = Object.fromEntries(
  SYNC_ENTITY_REGISTRY.map((e) => [e.entityName, e])
) as Record<string, SyncEntityConfig>;

/** Names of all registered syncable entities */
export const SYNC_ENTITY_NAMES = SYNC_ENTITY_REGISTRY.map((e) => e.entityName);

/** Entity names for which offline write (queue) is enabled */
export const OFFLINE_WRITE_ENABLED_ENTITIES = SYNC_ENTITY_REGISTRY
  .filter((e) => e.offlineWriteEnabled)
  .map((e) => e.entityName);
