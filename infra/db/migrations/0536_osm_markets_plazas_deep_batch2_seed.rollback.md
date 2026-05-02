# Rollback: Migration 0536 — Markets & Plazas Deep Extraction — Batch 2

## What this migration does
Seeds 283 market/plaza/mall entities extracted from OpenStreetMap Nigeria via Overpass API (2026-05-02).
Org ID prefix: `org_s16_market_{hash16}`

## Rollback SQL
```sql
DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s16_market_batch2_20260502';
DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s16_market_batch2_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s16_market_batch2_20260502';
DELETE FROM search_entries WHERE id LIKE 'se_s16_market_%';
DELETE FROM profiles WHERE subject_id LIKE 'org_s16_market_%';
DELETE FROM organizations WHERE id LIKE 'org_s16_market_%';
DELETE FROM seed_raw_artifacts WHERE id = 'seed_artifact_s16_market_batch2_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s16_market_batch2_20260502';
DELETE FROM seed_sources WHERE id = 'seed_source_osm_market_ng_s16b_20260502';
```

## Notes
- All inserts are INSERT OR IGNORE — idempotent, safe to re-run
