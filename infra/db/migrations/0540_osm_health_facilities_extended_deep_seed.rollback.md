# Rollback: Migration 0540 — Extended Health Facilities Deep Extraction

## What this migration does
Seeds 628 health facility entities extracted from OpenStreetMap Nigeria via Overpass API (2026-05-02).
Captures healthcare=* tags NOT already in 0499 (hospital/clinic/doctors/dentist/optical_clinic):
- healthcare=maternity, birthing_center, health_post, laboratory, nursing_home, blood_bank,
  physiotherapist, alternative, doctor, nurse, midwife, community_health_worker
- amenity=nursing_home, amenity=maternity, amenity=blood_bank

Org ID prefix: `org_s18_health_{hash16}`
Org types: hospital, clinic, maternity_clinic, nursing_home, diagnostic_lab, blood_bank,
           physiotherapy_clinic, optical_clinic, alternative_medicine, health_facility

## Rollback SQL
```sql
DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s18_health_extra_20260502';
DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s18_health_extra_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s18_health_extra_20260502';
DELETE FROM search_entries WHERE id LIKE 'se_s18_health_%';
DELETE FROM profiles WHERE subject_id LIKE 'org_s18_health_%';
DELETE FROM organizations WHERE id LIKE 'org_s18_health_%';
DELETE FROM seed_raw_artifacts WHERE id = 'seed_artifact_s18_health_extra_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s18_health_extra_20260502';
DELETE FROM seed_sources WHERE id = 'seed_source_osm_health_extra_ng_s18_20260502';
```

## Notes
- Deduplicated against all 5,201 existing OSM IDs from migration 0499
- Generic names (< 3 chars, "clinic", "hospital", "yes") excluded before generation
- All inserts are INSERT OR IGNORE — idempotent, safe to re-run
