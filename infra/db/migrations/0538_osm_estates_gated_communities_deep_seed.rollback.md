# Rollback: Migration 0538 — Estates & Gated Communities Deep Extraction

## What this migration does
Seeds 402 residential estate and gated community entities extracted from OpenStreetMap Nigeria via Overpass API (2026-05-02).
Tags: place=neighbourhood, place=suburb (name~Estate/GRA/Gardens), landuse=residential (named), residential=gated_community.
Org ID prefix: `org_s17_estate_{hash16}`

## Rollback SQL
```sql
DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s17_estate_20260502';
DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s17_estate_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s17_estate_20260502';
DELETE FROM search_entries WHERE id LIKE 'se_s17_estate_%';
DELETE FROM profiles WHERE subject_id LIKE 'org_s17_estate_%';
DELETE FROM organizations WHERE id LIKE 'org_s17_estate_%';
DELETE FROM seed_raw_artifacts WHERE id = 'seed_artifact_s17_estate_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s17_estate_20260502';
DELETE FROM seed_sources WHERE id = 'seed_source_osm_estate_ng_s17_20260502';
```

## Notes
- All inserts are INSERT OR IGNORE — idempotent, safe to re-run
- Generic neighbourhood names (< 3 chars, "Residential", "Area", "Community") excluded before generation
