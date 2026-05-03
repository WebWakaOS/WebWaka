-- Rollback: 0465 Priority State Assemblies Seed (Kano, Rivers, Ogun, Oyo)
-- Removes all individuals, profiles, assignments, and seed metadata inserted by 0465.

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
BEGIN TRANSACTION;

DELETE FROM search_entries        WHERE id LIKE 'se_%'          AND profile_id IN (SELECT id FROM profiles WHERE subject_id IN (SELECT id FROM individuals WHERE id LIKE 'ind_%' AND full_name IN ('Hamisu Ibrahim Chidari','Martin Amaewhule','Oludaisi Elemide','Adebo Ogundoyin')));
DELETE FROM seed_enrichment       WHERE seed_run_id IN ('seed_run_s05_political_kano_assembly_20260502','seed_run_s05_political_rivers_assembly_20260502','seed_run_s05_political_ogun_assembly_20260502','seed_run_s05_political_oyo_assembly_20260502');
DELETE FROM seed_entity_sources   WHERE seed_run_id IN ('seed_run_s05_political_kano_assembly_20260502','seed_run_s05_political_rivers_assembly_20260502','seed_run_s05_political_ogun_assembly_20260502','seed_run_s05_political_oyo_assembly_20260502');
DELETE FROM seed_place_resolutions WHERE seed_run_id IN ('seed_run_s05_political_kano_assembly_20260502','seed_run_s05_political_rivers_assembly_20260502','seed_run_s05_political_ogun_assembly_20260502','seed_run_s05_political_oyo_assembly_20260502');
DELETE FROM seed_identity_map     WHERE seed_run_id IN ('seed_run_s05_political_kano_assembly_20260502','seed_run_s05_political_rivers_assembly_20260502','seed_run_s05_political_ogun_assembly_20260502','seed_run_s05_political_oyo_assembly_20260502');
DELETE FROM seed_ingestion_records WHERE seed_run_id IN ('seed_run_s05_political_kano_assembly_20260502','seed_run_s05_political_rivers_assembly_20260502','seed_run_s05_political_ogun_assembly_20260502','seed_run_s05_political_oyo_assembly_20260502');
DELETE FROM seed_dedupe_decisions  WHERE seed_run_id IN ('seed_run_s05_political_kano_assembly_20260502','seed_run_s05_political_rivers_assembly_20260502','seed_run_s05_political_ogun_assembly_20260502','seed_run_s05_political_oyo_assembly_20260502');
DELETE FROM party_affiliations    WHERE individual_id IN (SELECT id FROM individuals WHERE full_name IN ('Hamisu Ibrahim Chidari','Martin Amaewhule','Oludaisi Elemide','Adebo Ogundoyin') AND tenant_id='tenant_platform_seed');
DELETE FROM political_assignments WHERE term_id IN ('term_ng_kano_state_assembly_10th_2023_2027','term_ng_rivers_state_assembly_10th_2023_2027','term_ng_ogun_state_assembly_10th_2023_2027','term_ng_oyo_state_assembly_10th_2023_2027');
DELETE FROM politician_profiles   WHERE profile_id IN (SELECT id FROM profiles WHERE subject_id IN (SELECT id FROM individuals WHERE full_name IN ('Hamisu Ibrahim Chidari','Martin Amaewhule','Oludaisi Elemide','Adebo Ogundoyin') AND tenant_id='tenant_platform_seed'));
DELETE FROM profiles              WHERE subject_id IN (SELECT id FROM individuals WHERE full_name IN ('Hamisu Ibrahim Chidari','Martin Amaewhule','Oludaisi Elemide','Adebo Ogundoyin') AND tenant_id='tenant_platform_seed');
DELETE FROM individuals           WHERE full_name IN ('Hamisu Ibrahim Chidari','Martin Amaewhule','Oludaisi Elemide','Adebo Ogundoyin') AND tenant_id='tenant_platform_seed';
DELETE FROM terms                 WHERE id IN ('term_ng_kano_state_assembly_10th_2023_2027','term_ng_rivers_state_assembly_10th_2023_2027','term_ng_ogun_state_assembly_10th_2023_2027','term_ng_oyo_state_assembly_10th_2023_2027');
DELETE FROM seed_raw_artifacts    WHERE id LIKE 'seed_artifact_%_assembly_20260502';
DELETE FROM seed_runs             WHERE id IN ('seed_run_s05_political_kano_assembly_20260502','seed_run_s05_political_rivers_assembly_20260502','seed_run_s05_political_ogun_assembly_20260502','seed_run_s05_political_oyo_assembly_20260502');
DELETE FROM seed_sources          WHERE id IN ('seed_source_wikipedia_kano_assembly_2023_20260502','seed_source_wikipedia_rivers_assembly_2023_20260502','seed_source_wikipedia_ogun_assembly_2023_20260502','seed_source_wikipedia_oyo_assembly_2023_20260502');

COMMIT;
