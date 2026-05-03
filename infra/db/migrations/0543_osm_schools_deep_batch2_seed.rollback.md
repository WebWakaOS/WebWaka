# Rollback: Migration 0543 — Schools & Educational Institutions Deep Extraction — Batch 2

## What this migration does
Seeds 1,009 school entities extracted from OpenStreetMap Nigeria via Overpass API (2026-05-02).
Org ID prefix: `org_s20_school_{hash16}`

## Rollback SQL
```sql
DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s20_school_batch2_20260502';
DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s20_school_batch2_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s20_school_batch2_20260502';
DELETE FROM search_entries WHERE id LIKE 'se_s20_school_%';
DELETE FROM profiles WHERE subject_id LIKE 'org_s20_school_%';
DELETE FROM organizations WHERE id LIKE 'org_s20_school_%';
DELETE FROM seed_raw_artifacts WHERE id = 'seed_artifact_s20_school_batch2_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s20_school_batch2_20260502';
DELETE FROM seed_sources WHERE id = 'seed_source_osm_school_ng_s20b_20260502';
```
