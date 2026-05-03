# Rollback: 0532 — Ogun State Assembly Patch

## What this migration does
Patches 1 of 3 missing Ogun State House of Assembly seats (10th Assembly, 2023-2027).
Adds Ado-Odo/Ota I: Yusuf Sherif Abiodun (APC).
Remaining unresolved: IJEBU NORTH II (ADC, name unavailable), IJEBU EAST (name unavailable).

## Tables affected
- individuals (1 row)
- profiles (1 row)
- politician_profiles (1 row)
- political_assignments (1 row)
- party_affiliations (1 row)
- seed_dedupe_decisions (1 row)
- seed_ingestion_records (1 row)
- seed_identity_map (1 row)
- seed_place_resolutions (1 row)
- seed_entity_sources (1 row)
- seed_enrichment (1 row)
- search_entries (1 row)

## Rollback SQL
```sql
DELETE FROM search_entries WHERE id = 'se_c7f20c95c6b28d2c';
DELETE FROM seed_enrichment WHERE id = 'enr_c7f20c95c6b28d2c';
DELETE FROM seed_entity_sources WHERE id = 'es_c7f20c95c6b28d2c';
DELETE FROM seed_place_resolutions WHERE id = 'pr_c7f20c95c6b28d2c';
DELETE FROM seed_identity_map WHERE id = 'im_c7f20c95c6b28d2c';
DELETE FROM seed_ingestion_records WHERE id = 'ir_c7f20c95c6b28d2c';
DELETE FROM seed_dedupe_decisions WHERE id = 'dd_c7f20c95c6b28d2c';
DELETE FROM party_affiliations WHERE id = 'aff_c7f20c95c6b28d2c';
DELETE FROM political_assignments WHERE id = 'assign_c7f20c95c6b28d2c';
DELETE FROM politician_profiles WHERE id = 'pp_c7f20c95c6b28d2c';
DELETE FROM profiles WHERE id = 'prof_c7f20c95c6b28d2c';
DELETE FROM individuals WHERE id = 'ind_c7f20c95c6b28d2c';
DELETE FROM seed_sources WHERE id = 'seed_source_wikipedia_ogun_assembly_patch_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s05_political_ogun_roster_patch_20260502';
DELETE FROM seed_raw_artifacts WHERE id = 'seed_artifact_ogun_patch_20260502';
```
