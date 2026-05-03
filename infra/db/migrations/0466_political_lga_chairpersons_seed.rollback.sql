-- Rollback: 0466 Lagos LGA Chairpersons Seed
-- Removes all 20 LGA chairperson records inserted by 0466.

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;
BEGIN TRANSACTION;

DELETE FROM seed_enrichment        WHERE seed_run_id = 'seed_run_s05_political_lagos_lga_chairs_20260502';
DELETE FROM seed_entity_sources    WHERE seed_run_id = 'seed_run_s05_political_lagos_lga_chairs_20260502';
DELETE FROM seed_place_resolutions WHERE seed_run_id = 'seed_run_s05_political_lagos_lga_chairs_20260502';
DELETE FROM seed_identity_map      WHERE seed_run_id = 'seed_run_s05_political_lagos_lga_chairs_20260502';
DELETE FROM seed_ingestion_records WHERE seed_run_id = 'seed_run_s05_political_lagos_lga_chairs_20260502';
DELETE FROM seed_dedupe_decisions  WHERE seed_run_id = 'seed_run_s05_political_lagos_lga_chairs_20260502';
DELETE FROM political_assignments  WHERE term_id     = 'term_ng_lagos_lga_chairs_2021_2024';
DELETE FROM party_affiliations     WHERE individual_id IN (SELECT individual_id FROM political_assignments WHERE term_id = 'term_ng_lagos_lga_chairs_2021_2024');
DELETE FROM politician_profiles    WHERE profile_id IN (SELECT id FROM profiles WHERE subject_id IN (SELECT individual_id FROM political_assignments WHERE term_id = 'term_ng_lagos_lga_chairs_2021_2024'));
DELETE FROM search_entries         WHERE profile_id  IN (SELECT id FROM profiles WHERE subject_id IN (SELECT individual_id FROM political_assignments WHERE term_id = 'term_ng_lagos_lga_chairs_2021_2024'));
DELETE FROM profiles               WHERE subject_id  IN (SELECT individual_id FROM political_assignments WHERE term_id = 'term_ng_lagos_lga_chairs_2021_2024');
DELETE FROM individuals            WHERE id IN (SELECT individual_id FROM political_assignments WHERE term_id = 'term_ng_lagos_lga_chairs_2021_2024');
DELETE FROM terms                  WHERE id = 'term_ng_lagos_lga_chairs_2021_2024';
DELETE FROM seed_runs              WHERE id = 'seed_run_s05_political_lagos_lga_chairs_20260502';
DELETE FROM seed_sources           WHERE id = 'seed_source_lasiec_lga_elections_lagos_2021_20260502';

COMMIT;
