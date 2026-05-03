# Rollback: Migration 0525 — Ondo State Assembly Roster

## Safe to rollback?
Yes. All inserts use INSERT OR IGNORE. Rollback removes only records inserted by this migration.

## Steps
1. Identify all `ind_*` IDs from this migration:
   `grep -oP "'ind_[a-f0-9]{16}'" infra/db/migrations/0525_political_ondo_assembly_full_roster_seed.sql | sort -u`
2. For each ID, run:
   - `DELETE FROM seed_enrichment WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502';`
   - `DELETE FROM seed_entity_sources WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502';`
   - `DELETE FROM seed_place_resolutions WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502';`
   - `DELETE FROM seed_identity_map WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502';`
   - `DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502';`
   - `DELETE FROM seed_dedupe_decisions WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502';`
   - `DELETE FROM party_affiliations WHERE seed_run_id NOT NULL AND individual_id IN (SELECT id FROM individuals WHERE id LIKE 'ind_%' AND workspace_id = 'workspace_platform_seed_discovery');`
   - `DELETE FROM political_assignments WHERE term_id = 'term_ng_ondo_state_assembly_10th_2023_2027';`
   - `DELETE FROM politician_profiles WHERE profile_id IN (SELECT id FROM profiles WHERE subject_id IN (SELECT id FROM individuals WHERE workspace_id = 'workspace_platform_seed_discovery'));`
   - `DELETE FROM search_entries WHERE ancestry_path LIKE '%/place_state_ondo' AND vertical = 'political';`
   - `DELETE FROM profiles WHERE subject_id IN (SELECT id FROM individuals WHERE workspace_id = 'workspace_platform_seed_discovery' AND id IN (SELECT entity_id FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502'));`
   - `DELETE FROM individuals WHERE id IN (SELECT entity_id FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502');`
   - `DELETE FROM seed_raw_artifacts WHERE seed_run_id = 'seed_run_s05_political_ondo_roster_20260502';`
   - `DELETE FROM seed_runs WHERE id = 'seed_run_s05_political_ondo_roster_20260502';`
   - `DELETE FROM seed_sources WHERE id = 'seed_source_nigerianleaders_ondo_assembly_20260502';`
   - `DELETE FROM terms WHERE id = 'term_ng_ondo_state_assembly_10th_2023_2027';`

## Records affected
- 21 individuals / profiles / politician_profiles / political_assignments
- Party affiliations: 21
- Seed tracking: 126 ingestion/dedup/identity/enrichment rows
