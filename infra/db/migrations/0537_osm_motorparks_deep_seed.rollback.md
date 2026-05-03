# Rollback: Migration 0537 — Motor Parks & Transport Terminals Deep Extraction

## What this migration does
Seeds 213 motor park and transport terminal entities extracted from OpenStreetMap Nigeria via Overpass API (2026-05-02).
Tags: amenity=bus_station (nodes+ways+relations), amenity=taxi, public_transport=station, name~"Motor Park|Terminal|Lorry Park".
Org ID prefix: `org_s16_motorpark_{hash16}`

## Rollback SQL
```sql
DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s16_motorpark_20260502';
DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s16_motorpark_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s16_motorpark_20260502';
DELETE FROM search_entries WHERE id LIKE 'se_s16_motorpark_%';
DELETE FROM profiles WHERE subject_id LIKE 'org_s16_motorpark_%';
DELETE FROM organizations WHERE id LIKE 'org_s16_motorpark_%';
DELETE FROM seed_raw_artifacts WHERE id = 'seed_artifact_s16_motorpark_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s16_motorpark_20260502';
DELETE FROM seed_sources WHERE id = 'seed_source_osm_motorpark_ng_s16_20260502';
```

## Notes
- All inserts are INSERT OR IGNORE — idempotent, safe to re-run
- 7 false positives (amusement parks, car parks, Bus Park generic) were excluded before generation
