-- ============================================================
-- Migration 0524: Niger State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Niger State House of Assembly Members
-- Members seeded: 25/29
-- Party breakdown: APC:10, AA:8, PDP:4, A:2, SDP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_niger_assembly_20260502',
  'NigerianLeaders – Complete List of Niger State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/niger-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_niger_roster_20260502', 'S05 Batch – Niger State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_niger_roster_20260502',
  'seed_run_s05_political_niger_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0524_political_niger_assembly_full_roster_seed.sql',
  NULL, 25,
  '25/29 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_niger_state_assembly_10th_2023_2027',
  'Niger State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_niger',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (25 of 29 seats) ──────────────────────────────────────

-- 01. Abdullah Yahaya -- Agaie (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3d3f1aaf71ac0819', 'Abdullah Yahaya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3d3f1aaf71ac0819', 'ind_3d3f1aaf71ac0819', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullah Yahaya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3d3f1aaf71ac0819', 'prof_3d3f1aaf71ac0819',
  'Member, Niger State House of Assembly (AGAIE)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3d3f1aaf71ac0819', 'ind_3d3f1aaf71ac0819', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3d3f1aaf71ac0819', 'ind_3d3f1aaf71ac0819', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3d3f1aaf71ac0819', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|agaie|2023',
  'insert', 'ind_3d3f1aaf71ac0819',
  'Unique: Niger Agaie seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3d3f1aaf71ac0819', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_3d3f1aaf71ac0819', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3d3f1aaf71ac0819', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_agaie',
  'ind_3d3f1aaf71ac0819', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3d3f1aaf71ac0819', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Agaie', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3d3f1aaf71ac0819', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_3d3f1aaf71ac0819',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3d3f1aaf71ac0819', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_3d3f1aaf71ac0819',
  'political_assignment', '{"constituency_inec": "AGAIE", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3d3f1aaf71ac0819', 'prof_3d3f1aaf71ac0819',
  'Abdullah Yahaya',
  'abdullah yahaya niger state assembly agaie pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Mohammed Garba -- Agwara (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5713b9a0614690c8', 'Mohammed Garba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5713b9a0614690c8', 'ind_5713b9a0614690c8', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Garba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5713b9a0614690c8', 'prof_5713b9a0614690c8',
  'Member, Niger State House of Assembly (AGWARA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5713b9a0614690c8', 'ind_5713b9a0614690c8', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5713b9a0614690c8', 'ind_5713b9a0614690c8', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5713b9a0614690c8', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|agwara|2023',
  'insert', 'ind_5713b9a0614690c8',
  'Unique: Niger Agwara seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5713b9a0614690c8', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5713b9a0614690c8', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5713b9a0614690c8', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_agwara',
  'ind_5713b9a0614690c8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5713b9a0614690c8', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Agwara', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5713b9a0614690c8', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5713b9a0614690c8',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5713b9a0614690c8', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5713b9a0614690c8',
  'political_assignment', '{"constituency_inec": "AGWARA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5713b9a0614690c8', 'prof_5713b9a0614690c8',
  'Mohammed Garba',
  'mohammed garba niger state assembly agwara apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Suleiman Muhammad Wanchiko -- Bida I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c39ef9041f1a685e', 'Suleiman Muhammad Wanchiko',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c39ef9041f1a685e', 'ind_c39ef9041f1a685e', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Muhammad Wanchiko', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c39ef9041f1a685e', 'prof_c39ef9041f1a685e',
  'Member, Niger State House of Assembly (BIDA I)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c39ef9041f1a685e', 'ind_c39ef9041f1a685e', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c39ef9041f1a685e', 'ind_c39ef9041f1a685e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c39ef9041f1a685e', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|bida i|2023',
  'insert', 'ind_c39ef9041f1a685e',
  'Unique: Niger Bida I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c39ef9041f1a685e', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_c39ef9041f1a685e', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c39ef9041f1a685e', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_bida_i',
  'ind_c39ef9041f1a685e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c39ef9041f1a685e', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Bida I', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c39ef9041f1a685e', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_c39ef9041f1a685e',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c39ef9041f1a685e', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_c39ef9041f1a685e',
  'political_assignment', '{"constituency_inec": "BIDA I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c39ef9041f1a685e', 'prof_c39ef9041f1a685e',
  'Suleiman Muhammad Wanchiko',
  'suleiman muhammad wanchiko niger state assembly bida i pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Gambo Abdulrahman Bala -- Borgu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2b0b7c71fe52c2a3', 'Gambo Abdulrahman Bala',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2b0b7c71fe52c2a3', 'ind_2b0b7c71fe52c2a3', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gambo Abdulrahman Bala', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2b0b7c71fe52c2a3', 'prof_2b0b7c71fe52c2a3',
  'Member, Niger State House of Assembly (BORGU)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2b0b7c71fe52c2a3', 'ind_2b0b7c71fe52c2a3', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2b0b7c71fe52c2a3', 'ind_2b0b7c71fe52c2a3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2b0b7c71fe52c2a3', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|borgu|2023',
  'insert', 'ind_2b0b7c71fe52c2a3',
  'Unique: Niger Borgu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2b0b7c71fe52c2a3', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_2b0b7c71fe52c2a3', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2b0b7c71fe52c2a3', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_borgu',
  'ind_2b0b7c71fe52c2a3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2b0b7c71fe52c2a3', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Borgu', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2b0b7c71fe52c2a3', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_2b0b7c71fe52c2a3',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2b0b7c71fe52c2a3', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_2b0b7c71fe52c2a3',
  'political_assignment', '{"constituency_inec": "BORGU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2b0b7c71fe52c2a3', 'prof_2b0b7c71fe52c2a3',
  'Gambo Abdulrahman Bala',
  'gambo abdulrahman bala niger state assembly borgu apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Idris Mubarak -- Bosso (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_700793e3164086e1', 'Idris Mubarak',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_700793e3164086e1', 'ind_700793e3164086e1', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idris Mubarak', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_700793e3164086e1', 'prof_700793e3164086e1',
  'Member, Niger State House of Assembly (BOSSO)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_700793e3164086e1', 'ind_700793e3164086e1', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_700793e3164086e1', 'ind_700793e3164086e1', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_700793e3164086e1', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|bosso|2023',
  'insert', 'ind_700793e3164086e1',
  'Unique: Niger Bosso seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_700793e3164086e1', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_700793e3164086e1', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_700793e3164086e1', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_bosso',
  'ind_700793e3164086e1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_700793e3164086e1', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Bosso', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_700793e3164086e1', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_700793e3164086e1',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_700793e3164086e1', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_700793e3164086e1',
  'political_assignment', '{"constituency_inec": "BOSSO", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_700793e3164086e1', 'prof_700793e3164086e1',
  'Idris Mubarak',
  'idris mubarak niger state assembly bosso a politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Abubakar Mohammed -- Chanchanga (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_29e12695980436d6', 'Abubakar Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_29e12695980436d6', 'ind_29e12695980436d6', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_29e12695980436d6', 'prof_29e12695980436d6',
  'Member, Niger State House of Assembly (CHANCHANGA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_29e12695980436d6', 'ind_29e12695980436d6', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_29e12695980436d6', 'ind_29e12695980436d6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_29e12695980436d6', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|chanchanga|2023',
  'insert', 'ind_29e12695980436d6',
  'Unique: Niger Chanchanga seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_29e12695980436d6', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_29e12695980436d6', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_29e12695980436d6', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_chanchanga',
  'ind_29e12695980436d6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_29e12695980436d6', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Chanchanga', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_29e12695980436d6', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_29e12695980436d6',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_29e12695980436d6', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_29e12695980436d6',
  'political_assignment', '{"constituency_inec": "CHANCHANGA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_29e12695980436d6', 'prof_29e12695980436d6',
  'Abubakar Mohammed',
  'abubakar mohammed niger state assembly chanchanga apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Suleiman Hassan M -- Edatti (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5cc863705700a37a', 'Suleiman Hassan M',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5cc863705700a37a', 'ind_5cc863705700a37a', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Hassan M', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5cc863705700a37a', 'prof_5cc863705700a37a',
  'Member, Niger State House of Assembly (EDATTI)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5cc863705700a37a', 'ind_5cc863705700a37a', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5cc863705700a37a', 'ind_5cc863705700a37a', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5cc863705700a37a', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|edatti|2023',
  'insert', 'ind_5cc863705700a37a',
  'Unique: Niger Edatti seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5cc863705700a37a', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5cc863705700a37a', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5cc863705700a37a', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_edatti',
  'ind_5cc863705700a37a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5cc863705700a37a', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Edatti', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5cc863705700a37a', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5cc863705700a37a',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5cc863705700a37a', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5cc863705700a37a',
  'political_assignment', '{"constituency_inec": "EDATTI", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5cc863705700a37a', 'prof_5cc863705700a37a',
  'Suleiman Hassan M',
  'suleiman hassan m niger state assembly edatti aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Usman Abdullahi Malagi -- Gbako (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_74b01bafac109b89', 'Usman Abdullahi Malagi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_74b01bafac109b89', 'ind_74b01bafac109b89', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Abdullahi Malagi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_74b01bafac109b89', 'prof_74b01bafac109b89',
  'Member, Niger State House of Assembly (GBAKO)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_74b01bafac109b89', 'ind_74b01bafac109b89', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_74b01bafac109b89', 'ind_74b01bafac109b89', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_74b01bafac109b89', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|gbako|2023',
  'insert', 'ind_74b01bafac109b89',
  'Unique: Niger Gbako seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_74b01bafac109b89', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_74b01bafac109b89', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_74b01bafac109b89', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_gbako',
  'ind_74b01bafac109b89', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_74b01bafac109b89', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Gbako', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_74b01bafac109b89', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_74b01bafac109b89',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_74b01bafac109b89', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_74b01bafac109b89',
  'political_assignment', '{"constituency_inec": "GBAKO", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_74b01bafac109b89', 'prof_74b01bafac109b89',
  'Usman Abdullahi Malagi',
  'usman abdullahi malagi niger state assembly gbako a politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Ishaya Jonah -- Gurara (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e16e439c7bc02e91', 'Ishaya Jonah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e16e439c7bc02e91', 'ind_e16e439c7bc02e91', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ishaya Jonah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e16e439c7bc02e91', 'prof_e16e439c7bc02e91',
  'Member, Niger State House of Assembly (GURARA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e16e439c7bc02e91', 'ind_e16e439c7bc02e91', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e16e439c7bc02e91', 'ind_e16e439c7bc02e91', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e16e439c7bc02e91', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|gurara|2023',
  'insert', 'ind_e16e439c7bc02e91',
  'Unique: Niger Gurara seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e16e439c7bc02e91', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_e16e439c7bc02e91', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e16e439c7bc02e91', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_gurara',
  'ind_e16e439c7bc02e91', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e16e439c7bc02e91', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Gurara', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e16e439c7bc02e91', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_e16e439c7bc02e91',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e16e439c7bc02e91', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_e16e439c7bc02e91',
  'political_assignment', '{"constituency_inec": "GURARA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e16e439c7bc02e91', 'prof_e16e439c7bc02e91',
  'Ishaya Jonah',
  'ishaya jonah niger state assembly gurara apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Yakubu Abdulmalik Bala -- Katcha (SDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7ddc3281721e9396', 'Yakubu Abdulmalik Bala',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7ddc3281721e9396', 'ind_7ddc3281721e9396', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yakubu Abdulmalik Bala', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7ddc3281721e9396', 'prof_7ddc3281721e9396',
  'Member, Niger State House of Assembly (KATCHA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7ddc3281721e9396', 'ind_7ddc3281721e9396', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7ddc3281721e9396', 'ind_7ddc3281721e9396', 'org_political_party_sdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7ddc3281721e9396', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|katcha|2023',
  'insert', 'ind_7ddc3281721e9396',
  'Unique: Niger Katcha seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7ddc3281721e9396', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_7ddc3281721e9396', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7ddc3281721e9396', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_katcha',
  'ind_7ddc3281721e9396', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7ddc3281721e9396', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Katcha', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7ddc3281721e9396', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_7ddc3281721e9396',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7ddc3281721e9396', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_7ddc3281721e9396',
  'political_assignment', '{"constituency_inec": "KATCHA", "party_abbrev": "SDP", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7ddc3281721e9396', 'prof_7ddc3281721e9396',
  'Yakubu Abdulmalik Bala',
  'yakubu abdulmalik bala niger state assembly katcha sdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Umar Sani -- Kontagora I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1afda1770c1cb7bb', 'Umar Sani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1afda1770c1cb7bb', 'ind_1afda1770c1cb7bb', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umar Sani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1afda1770c1cb7bb', 'prof_1afda1770c1cb7bb',
  'Member, Niger State House of Assembly (KONTAGORA I)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1afda1770c1cb7bb', 'ind_1afda1770c1cb7bb', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1afda1770c1cb7bb', 'ind_1afda1770c1cb7bb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1afda1770c1cb7bb', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|kontagora i|2023',
  'insert', 'ind_1afda1770c1cb7bb',
  'Unique: Niger Kontagora I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1afda1770c1cb7bb', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_1afda1770c1cb7bb', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1afda1770c1cb7bb', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_kontagora_i',
  'ind_1afda1770c1cb7bb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1afda1770c1cb7bb', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Kontagora I', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1afda1770c1cb7bb', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_1afda1770c1cb7bb',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1afda1770c1cb7bb', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_1afda1770c1cb7bb',
  'political_assignment', '{"constituency_inec": "KONTAGORA I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1afda1770c1cb7bb', 'prof_1afda1770c1cb7bb',
  'Umar Sani',
  'umar sani niger state assembly kontagora i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Musa Idris Vatsa -- Lapai (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a2cc6048ba509c0b', 'Musa Idris Vatsa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a2cc6048ba509c0b', 'ind_a2cc6048ba509c0b', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Idris Vatsa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a2cc6048ba509c0b', 'prof_a2cc6048ba509c0b',
  'Member, Niger State House of Assembly (LAPAI)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a2cc6048ba509c0b', 'ind_a2cc6048ba509c0b', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a2cc6048ba509c0b', 'ind_a2cc6048ba509c0b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a2cc6048ba509c0b', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|lapai|2023',
  'insert', 'ind_a2cc6048ba509c0b',
  'Unique: Niger Lapai seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a2cc6048ba509c0b', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_a2cc6048ba509c0b', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a2cc6048ba509c0b', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_lapai',
  'ind_a2cc6048ba509c0b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a2cc6048ba509c0b', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Lapai', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a2cc6048ba509c0b', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_a2cc6048ba509c0b',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a2cc6048ba509c0b', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_a2cc6048ba509c0b',
  'political_assignment', '{"constituency_inec": "LAPAI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a2cc6048ba509c0b', 'prof_a2cc6048ba509c0b',
  'Musa Idris Vatsa',
  'musa idris vatsa niger state assembly lapai apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Yusuf Baba Dabban -- Lavun (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5d3bdf701c381752', 'Yusuf Baba Dabban',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5d3bdf701c381752', 'ind_5d3bdf701c381752', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Baba Dabban', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5d3bdf701c381752', 'prof_5d3bdf701c381752',
  'Member, Niger State House of Assembly (LAVUN)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5d3bdf701c381752', 'ind_5d3bdf701c381752', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5d3bdf701c381752', 'ind_5d3bdf701c381752', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5d3bdf701c381752', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|lavun|2023',
  'insert', 'ind_5d3bdf701c381752',
  'Unique: Niger Lavun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5d3bdf701c381752', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5d3bdf701c381752', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5d3bdf701c381752', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_lavun',
  'ind_5d3bdf701c381752', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5d3bdf701c381752', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Lavun', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5d3bdf701c381752', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5d3bdf701c381752',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5d3bdf701c381752', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_5d3bdf701c381752',
  'political_assignment', '{"constituency_inec": "LAVUN", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5d3bdf701c381752', 'prof_5d3bdf701c381752',
  'Yusuf Baba Dabban',
  'yusuf baba dabban niger state assembly lavun pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Ajinomoh Benjamin -- Magama (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_15b7626bdedd6a90', 'Ajinomoh Benjamin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_15b7626bdedd6a90', 'ind_15b7626bdedd6a90', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ajinomoh Benjamin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_15b7626bdedd6a90', 'prof_15b7626bdedd6a90',
  'Member, Niger State House of Assembly (MAGAMA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_15b7626bdedd6a90', 'ind_15b7626bdedd6a90', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_15b7626bdedd6a90', 'ind_15b7626bdedd6a90', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_15b7626bdedd6a90', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|magama|2023',
  'insert', 'ind_15b7626bdedd6a90',
  'Unique: Niger Magama seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_15b7626bdedd6a90', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_15b7626bdedd6a90', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_15b7626bdedd6a90', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_magama',
  'ind_15b7626bdedd6a90', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_15b7626bdedd6a90', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Magama', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_15b7626bdedd6a90', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_15b7626bdedd6a90',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_15b7626bdedd6a90', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_15b7626bdedd6a90',
  'political_assignment', '{"constituency_inec": "MAGAMA", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_15b7626bdedd6a90', 'prof_15b7626bdedd6a90',
  'Ajinomoh Benjamin',
  'ajinomoh benjamin niger state assembly magama aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Mohammed Kabiru Isah -- Mashegu (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ce092c2aa7924e95', 'Mohammed Kabiru Isah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ce092c2aa7924e95', 'ind_ce092c2aa7924e95', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Kabiru Isah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ce092c2aa7924e95', 'prof_ce092c2aa7924e95',
  'Member, Niger State House of Assembly (MASHEGU)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ce092c2aa7924e95', 'ind_ce092c2aa7924e95', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ce092c2aa7924e95', 'ind_ce092c2aa7924e95', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ce092c2aa7924e95', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|mashegu|2023',
  'insert', 'ind_ce092c2aa7924e95',
  'Unique: Niger Mashegu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ce092c2aa7924e95', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_ce092c2aa7924e95', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ce092c2aa7924e95', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_mashegu',
  'ind_ce092c2aa7924e95', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ce092c2aa7924e95', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Mashegu', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ce092c2aa7924e95', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_ce092c2aa7924e95',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ce092c2aa7924e95', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_ce092c2aa7924e95',
  'political_assignment', '{"constituency_inec": "MASHEGU", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ce092c2aa7924e95', 'prof_ce092c2aa7924e95',
  'Mohammed Kabiru Isah',
  'mohammed kabiru isah niger state assembly mashegu aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Inuwa Umar -- Mokwa (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6c9e9d6580edb286', 'Inuwa Umar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6c9e9d6580edb286', 'ind_6c9e9d6580edb286', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Inuwa Umar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6c9e9d6580edb286', 'prof_6c9e9d6580edb286',
  'Member, Niger State House of Assembly (MOKWA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6c9e9d6580edb286', 'ind_6c9e9d6580edb286', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6c9e9d6580edb286', 'ind_6c9e9d6580edb286', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6c9e9d6580edb286', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|mokwa|2023',
  'insert', 'ind_6c9e9d6580edb286',
  'Unique: Niger Mokwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6c9e9d6580edb286', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_6c9e9d6580edb286', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6c9e9d6580edb286', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_mokwa',
  'ind_6c9e9d6580edb286', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6c9e9d6580edb286', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Mokwa', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6c9e9d6580edb286', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_6c9e9d6580edb286',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6c9e9d6580edb286', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_6c9e9d6580edb286',
  'political_assignment', '{"constituency_inec": "MOKWA", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6c9e9d6580edb286', 'prof_6c9e9d6580edb286',
  'Inuwa Umar',
  'inuwa umar niger state assembly mokwa aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Joseph Haruna Sduza -- Munya (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f76477bf349405e5', 'Joseph Haruna Sduza',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f76477bf349405e5', 'ind_f76477bf349405e5', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Joseph Haruna Sduza', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f76477bf349405e5', 'prof_f76477bf349405e5',
  'Member, Niger State House of Assembly (MUNYA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f76477bf349405e5', 'ind_f76477bf349405e5', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f76477bf349405e5', 'ind_f76477bf349405e5', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f76477bf349405e5', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|munya|2023',
  'insert', 'ind_f76477bf349405e5',
  'Unique: Niger Munya seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f76477bf349405e5', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_f76477bf349405e5', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f76477bf349405e5', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_munya',
  'ind_f76477bf349405e5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f76477bf349405e5', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Munya', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f76477bf349405e5', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_f76477bf349405e5',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f76477bf349405e5', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_f76477bf349405e5',
  'political_assignment', '{"constituency_inec": "MUNYA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f76477bf349405e5', 'prof_f76477bf349405e5',
  'Joseph Haruna Sduza',
  'joseph haruna sduza niger state assembly munya pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Sanusi Yusuf -- Paikoro (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7f6dde5cbbb6257e', 'Sanusi Yusuf',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7f6dde5cbbb6257e', 'ind_7f6dde5cbbb6257e', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sanusi Yusuf', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7f6dde5cbbb6257e', 'prof_7f6dde5cbbb6257e',
  'Member, Niger State House of Assembly (PAIKORO)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7f6dde5cbbb6257e', 'ind_7f6dde5cbbb6257e', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7f6dde5cbbb6257e', 'ind_7f6dde5cbbb6257e', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7f6dde5cbbb6257e', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|paikoro|2023',
  'insert', 'ind_7f6dde5cbbb6257e',
  'Unique: Niger Paikoro seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7f6dde5cbbb6257e', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_7f6dde5cbbb6257e', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7f6dde5cbbb6257e', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_paikoro',
  'ind_7f6dde5cbbb6257e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7f6dde5cbbb6257e', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Paikoro', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7f6dde5cbbb6257e', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_7f6dde5cbbb6257e',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7f6dde5cbbb6257e', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_7f6dde5cbbb6257e',
  'political_assignment', '{"constituency_inec": "PAIKORO", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7f6dde5cbbb6257e', 'prof_7f6dde5cbbb6257e',
  'Sanusi Yusuf',
  'sanusi yusuf niger state assembly paikoro aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Salawu Ibrahim Muda -- Rafi (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a9d50354fcf223e6', 'Salawu Ibrahim Muda',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a9d50354fcf223e6', 'ind_a9d50354fcf223e6', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Salawu Ibrahim Muda', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a9d50354fcf223e6', 'prof_a9d50354fcf223e6',
  'Member, Niger State House of Assembly (RAFI)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a9d50354fcf223e6', 'ind_a9d50354fcf223e6', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a9d50354fcf223e6', 'ind_a9d50354fcf223e6', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a9d50354fcf223e6', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|rafi|2023',
  'insert', 'ind_a9d50354fcf223e6',
  'Unique: Niger Rafi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a9d50354fcf223e6', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_a9d50354fcf223e6', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a9d50354fcf223e6', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_rafi',
  'ind_a9d50354fcf223e6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a9d50354fcf223e6', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Rafi', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a9d50354fcf223e6', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_a9d50354fcf223e6',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a9d50354fcf223e6', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_a9d50354fcf223e6',
  'political_assignment', '{"constituency_inec": "RAFI", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a9d50354fcf223e6', 'prof_a9d50354fcf223e6',
  'Salawu Ibrahim Muda',
  'salawu ibrahim muda niger state assembly rafi aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Gambo Ibrahim -- Rijau (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ef255d46ba2d841f', 'Gambo Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ef255d46ba2d841f', 'ind_ef255d46ba2d841f', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gambo Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ef255d46ba2d841f', 'prof_ef255d46ba2d841f',
  'Member, Niger State House of Assembly (RIJAU)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ef255d46ba2d841f', 'ind_ef255d46ba2d841f', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ef255d46ba2d841f', 'ind_ef255d46ba2d841f', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ef255d46ba2d841f', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|rijau|2023',
  'insert', 'ind_ef255d46ba2d841f',
  'Unique: Niger Rijau seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ef255d46ba2d841f', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_ef255d46ba2d841f', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ef255d46ba2d841f', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_rijau',
  'ind_ef255d46ba2d841f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ef255d46ba2d841f', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Rijau', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ef255d46ba2d841f', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_ef255d46ba2d841f',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ef255d46ba2d841f', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_ef255d46ba2d841f',
  'political_assignment', '{"constituency_inec": "RIJAU", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ef255d46ba2d841f', 'prof_ef255d46ba2d841f',
  'Gambo Ibrahim',
  'gambo ibrahim niger state assembly rijau aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Ismail Ahmad Ibrahim -- Shiroro (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0fa8d4b6686fe5ad', 'Ismail Ahmad Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0fa8d4b6686fe5ad', 'ind_0fa8d4b6686fe5ad', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ismail Ahmad Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0fa8d4b6686fe5ad', 'prof_0fa8d4b6686fe5ad',
  'Member, Niger State House of Assembly (SHIRORO)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0fa8d4b6686fe5ad', 'ind_0fa8d4b6686fe5ad', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0fa8d4b6686fe5ad', 'ind_0fa8d4b6686fe5ad', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0fa8d4b6686fe5ad', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|shiroro|2023',
  'insert', 'ind_0fa8d4b6686fe5ad',
  'Unique: Niger Shiroro seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0fa8d4b6686fe5ad', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_0fa8d4b6686fe5ad', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0fa8d4b6686fe5ad', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_shiroro',
  'ind_0fa8d4b6686fe5ad', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0fa8d4b6686fe5ad', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Shiroro', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0fa8d4b6686fe5ad', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_0fa8d4b6686fe5ad',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0fa8d4b6686fe5ad', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_0fa8d4b6686fe5ad',
  'political_assignment', '{"constituency_inec": "SHIRORO", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0fa8d4b6686fe5ad', 'prof_0fa8d4b6686fe5ad',
  'Ismail Ahmad Ibrahim',
  'ismail ahmad ibrahim niger state assembly shiroro aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Shuaibu Abdullahi Ahmed -- Suleja (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_99d674eb15ce45bf', 'Shuaibu Abdullahi Ahmed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_99d674eb15ce45bf', 'ind_99d674eb15ce45bf', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Shuaibu Abdullahi Ahmed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_99d674eb15ce45bf', 'prof_99d674eb15ce45bf',
  'Member, Niger State House of Assembly (SULEJA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_99d674eb15ce45bf', 'ind_99d674eb15ce45bf', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_99d674eb15ce45bf', 'ind_99d674eb15ce45bf', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_99d674eb15ce45bf', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|suleja|2023',
  'insert', 'ind_99d674eb15ce45bf',
  'Unique: Niger Suleja seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_99d674eb15ce45bf', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_99d674eb15ce45bf', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_99d674eb15ce45bf', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_suleja',
  'ind_99d674eb15ce45bf', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_99d674eb15ce45bf', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Suleja', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_99d674eb15ce45bf', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_99d674eb15ce45bf',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_99d674eb15ce45bf', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_99d674eb15ce45bf',
  'political_assignment', '{"constituency_inec": "SULEJA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_99d674eb15ce45bf', 'prof_99d674eb15ce45bf',
  'Shuaibu Abdullahi Ahmed',
  'shuaibu abdullahi ahmed niger state assembly suleja apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Idris Muhammed Sani -- Tapa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b37d5046c10cb764', 'Idris Muhammed Sani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b37d5046c10cb764', 'ind_b37d5046c10cb764', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idris Muhammed Sani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b37d5046c10cb764', 'prof_b37d5046c10cb764',
  'Member, Niger State House of Assembly (TAPA)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b37d5046c10cb764', 'ind_b37d5046c10cb764', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b37d5046c10cb764', 'ind_b37d5046c10cb764', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b37d5046c10cb764', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|tapa|2023',
  'insert', 'ind_b37d5046c10cb764',
  'Unique: Niger Tapa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b37d5046c10cb764', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_b37d5046c10cb764', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b37d5046c10cb764', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_tapa',
  'ind_b37d5046c10cb764', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b37d5046c10cb764', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Tapa', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b37d5046c10cb764', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_b37d5046c10cb764',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b37d5046c10cb764', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_b37d5046c10cb764',
  'political_assignment', '{"constituency_inec": "TAPA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b37d5046c10cb764', 'prof_b37d5046c10cb764',
  'Idris Muhammed Sani',
  'idris muhammed sani niger state assembly tapa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Sheshi Aliyu Wushishi -- Wushishi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_60a56c02f96b799a', 'Sheshi Aliyu Wushishi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_60a56c02f96b799a', 'ind_60a56c02f96b799a', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sheshi Aliyu Wushishi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_60a56c02f96b799a', 'prof_60a56c02f96b799a',
  'Member, Niger State House of Assembly (WUSHISHI)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_60a56c02f96b799a', 'ind_60a56c02f96b799a', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_60a56c02f96b799a', 'ind_60a56c02f96b799a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_60a56c02f96b799a', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|wushishi|2023',
  'insert', 'ind_60a56c02f96b799a',
  'Unique: Niger Wushishi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_60a56c02f96b799a', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_60a56c02f96b799a', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_60a56c02f96b799a', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_wushishi',
  'ind_60a56c02f96b799a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_60a56c02f96b799a', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Wushishi', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_60a56c02f96b799a', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_60a56c02f96b799a',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_60a56c02f96b799a', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_60a56c02f96b799a',
  'political_assignment', '{"constituency_inec": "WUSHISHI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_60a56c02f96b799a', 'prof_60a56c02f96b799a',
  'Sheshi Aliyu Wushishi',
  'sheshi aliyu wushishi niger state assembly wushishi apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Isah Abdullahi -- Kotangora II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_92ddce6130c9a29d', 'Isah Abdullahi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_92ddce6130c9a29d', 'ind_92ddce6130c9a29d', 'individual', 'place_state_niger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Isah Abdullahi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_92ddce6130c9a29d', 'prof_92ddce6130c9a29d',
  'Member, Niger State House of Assembly (KOTANGORA II)',
  'place_state_niger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_92ddce6130c9a29d', 'ind_92ddce6130c9a29d', 'term_ng_niger_state_assembly_10th_2023_2027',
  'place_state_niger', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_92ddce6130c9a29d', 'ind_92ddce6130c9a29d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_92ddce6130c9a29d', 'seed_run_s05_political_niger_roster_20260502', 'individual',
  'ng_state_assembly_member|niger|kotangora ii|2023',
  'insert', 'ind_92ddce6130c9a29d',
  'Unique: Niger Kotangora II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_92ddce6130c9a29d', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_92ddce6130c9a29d', 'seed_source_nigerianleaders_niger_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_92ddce6130c9a29d', 'seed_run_s05_political_niger_roster_20260502', 'seed_source_nigerianleaders_niger_assembly_20260502',
  'nl_niger_assembly_2023_kotangora_ii',
  'ind_92ddce6130c9a29d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_92ddce6130c9a29d', 'seed_run_s05_political_niger_roster_20260502',
  'Niger Kotangora II', 'place_state_niger', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_92ddce6130c9a29d', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_92ddce6130c9a29d',
  'seed_source_nigerianleaders_niger_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_92ddce6130c9a29d', 'seed_run_s05_political_niger_roster_20260502', 'individual', 'ind_92ddce6130c9a29d',
  'political_assignment', '{"constituency_inec": "KOTANGORA II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/niger-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_92ddce6130c9a29d', 'prof_92ddce6130c9a29d',
  'Isah Abdullahi',
  'isah abdullahi niger state assembly kotangora ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_niger',
  'political',
  unixepoch(), unixepoch()
);

