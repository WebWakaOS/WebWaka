# Rollback: Migration 0541 — Petrol & Fuel Stations Deep Extraction

## What this migration does
Seeds 50 fuel station entities extracted from OpenStreetMap Nigeria via Overpass API (2026-05-02).
These are new OSM IDs not present in migration 0488 (1,128 stations) or 0338 (2,256 IDs).
Tags: amenity=fuel, amenity=fuel_station, amenity=filling_station.
Brands include: NNPC, Total, Mobil, Oando, MRS, Conoil, Nipco, independents.
Org ID prefix: `org_s19_fuel_{hash16}`

## Rollback SQL
```sql
DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s19_fuel_20260502';
DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s19_fuel_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s19_fuel_20260502';
DELETE FROM search_entries WHERE id LIKE 'se_s19_fuel_%';
DELETE FROM profiles WHERE subject_id LIKE 'org_s19_fuel_%';
DELETE FROM organizations WHERE id LIKE 'org_s19_fuel_%';
DELETE FROM seed_raw_artifacts WHERE id = 'seed_artifact_s19_fuel_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s19_fuel_20260502';
DELETE FROM seed_sources WHERE id = 'seed_source_osm_fuel_ng_s19_20260502';
```

## Notes
- Deduplicated against 1,128 OSM IDs from 0488 and 2,256 from 0338
- 479 unnamed stations and 25 generic-named stations excluded
- 871 stations with OSM IDs already in 0488 excluded
- All inserts are INSERT OR IGNORE — idempotent, safe to re-run
