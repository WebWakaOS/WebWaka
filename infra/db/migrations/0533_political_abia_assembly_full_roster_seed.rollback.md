# Rollback: 0533 — Abia State Assembly Full Roster

## What this migration does
Seeds all 24 members of the Abia State House of Assembly (10th Assembly, 2023-2027).
Party breakdown: APC:1, APGA:1, LP:8, PDP:13, YPP:1
Source: Wikipedia – Abia State House of Assembly

## Tables affected (12 inserts × 24 members = 288 inserts)
- individuals, profiles, politician_profiles, political_assignments
- party_affiliations, seed_dedupe_decisions, seed_ingestion_records
- seed_identity_map, seed_place_resolutions, seed_entity_sources
- seed_enrichment, search_entries

## Rollback SQL
```sql
-- Delete all 24 members by term
DELETE FROM search_entries WHERE profile_id IN (SELECT id FROM profiles WHERE subject_id IN (SELECT id FROM individuals WHERE id IN (SELECT individual_id FROM political_assignments WHERE term_id = 'term_ng_abia_state_assembly_10th_2023_2027')));
DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502';
DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502';
DELETE FROM seed_place_resolutions WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502';
DELETE FROM seed_identity_map WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502';
DELETE FROM seed_dedupe_decisions WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502';
DELETE FROM party_affiliations WHERE individual_id IN (SELECT individual_id FROM political_assignments WHERE term_id = 'term_ng_abia_state_assembly_10th_2023_2027');
DELETE FROM political_assignments WHERE term_id = 'term_ng_abia_state_assembly_10th_2023_2027';
DELETE FROM politician_profiles WHERE jurisdiction_place_id = 'place_state_abia' AND office_title LIKE 'Member, Abia%';
DELETE FROM profiles WHERE subject_id IN (SELECT id FROM individuals WHERE id IN (SELECT entity_id FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502'));
DELETE FROM individuals WHERE id IN (SELECT entity_id FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502');
DELETE FROM terms WHERE id = 'term_ng_abia_state_assembly_10th_2023_2027';
DELETE FROM seed_raw_artifacts WHERE seed_run_id = 'seed_run_s05_political_abia_roster_20260502';
DELETE FROM seed_runs WHERE id = 'seed_run_s05_political_abia_roster_20260502';
DELETE FROM seed_sources WHERE id = 'seed_source_wikipedia_abia_assembly_20260502';
```
