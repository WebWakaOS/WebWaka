# Rollback: 0499_osm_s13_hospitals_medical_seed

## What was seeded
5201 records.

## Tables affected
- `organizations`
- `profiles`
- `search_entries`
- `seed_ingestion_records`
- `seed_entity_sources`
- `seed_enrichment`

## How to rollback
This migration is idempotent (INSERT OR IGNORE). Records seeded are platform reference data.
To fully undo, delete rows where `verification_state = 'seeded'` added by this migration's seed run IDs.

No schema changes were made — this migration is data-only.
