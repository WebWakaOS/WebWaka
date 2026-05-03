# Rollback: Migration 0539 — Car Dealers & Vehicle Sales Deep Extraction

## What this migration does
Seeds 65 car dealer and vehicle sales entities extracted from OpenStreetMap Nigeria via Overpass API (2026-05-02).
Tags: shop=car, shop=car_dealer, shop=vehicle, amenity=car_dealership, shop=motorcycle + brand name matching.
Org ID prefix: `org_s17_cardeal_{hash16}`

## Rollback SQL
```sql
DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s17_cardeal_20260502';
DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s17_cardeal_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s17_cardeal_20260502';
DELETE FROM search_entries WHERE id LIKE 'se_s17_cardeal_%';
DELETE FROM profiles WHERE subject_id LIKE 'org_s17_cardeal_%';
DELETE FROM organizations WHERE id LIKE 'org_s17_cardeal_%';
DELETE FROM seed_raw_artifacts WHERE id = 'seed_artifact_s17_cardeal_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s17_cardeal_20260502';
DELETE FROM seed_sources WHERE id = 'seed_source_osm_cardeal_ng_s17_20260502';
```

## Notes
- All inserts are INSERT OR IGNORE — idempotent, safe to re-run
