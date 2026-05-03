-- ============================================================
-- Migration 0526: Osun State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Osun State House of Assembly Members
-- Members seeded: 24/26
-- Party breakdown: APC:10, PDP:5, A:3, ADP:3, AAC:2, AA:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_osun_assembly_20260502',
  'NigerianLeaders – Complete List of Osun State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/osun-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_osun_roster_20260502', 'S05 Batch – Osun State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_osun_roster_20260502',
  'seed_run_s05_political_osun_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0526_political_osun_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/26 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_osun_state_assembly_10th_2023_2027',
  'Osun State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_osun',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 26 seats) ──────────────────────────────────────

-- 01. Popoola Simeon Olufemi -- Boripe/Boluwa-Duro (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a7af8b18b05219ab', 'Popoola Simeon Olufemi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a7af8b18b05219ab', 'ind_a7af8b18b05219ab', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Popoola Simeon Olufemi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a7af8b18b05219ab', 'prof_a7af8b18b05219ab',
  'Member, Osun State House of Assembly (BORIPE/BOLUWA-DURO)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a7af8b18b05219ab', 'ind_a7af8b18b05219ab', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a7af8b18b05219ab', 'ind_a7af8b18b05219ab', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a7af8b18b05219ab', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|boripe/boluwa-duro|2023',
  'insert', 'ind_a7af8b18b05219ab',
  'Unique: Osun Boripe/Boluwa-Duro seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a7af8b18b05219ab', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_a7af8b18b05219ab', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a7af8b18b05219ab', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_boripe/boluwa-duro',
  'ind_a7af8b18b05219ab', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a7af8b18b05219ab', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Boripe/Boluwa-Duro', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a7af8b18b05219ab', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_a7af8b18b05219ab',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a7af8b18b05219ab', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_a7af8b18b05219ab',
  'political_assignment', '{"constituency_inec": "BORIPE/BOLUWA-DURO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a7af8b18b05219ab', 'prof_a7af8b18b05219ab',
  'Popoola Simeon Olufemi',
  'popoola simeon olufemi osun state assembly boripe/boluwa-duro apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Jimoh Mulikat Abiola -- Ifelodun (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b86481d13eeb4a18', 'Jimoh Mulikat Abiola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b86481d13eeb4a18', 'ind_b86481d13eeb4a18', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jimoh Mulikat Abiola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b86481d13eeb4a18', 'prof_b86481d13eeb4a18',
  'Member, Osun State House of Assembly (IFELODUN)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b86481d13eeb4a18', 'ind_b86481d13eeb4a18', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b86481d13eeb4a18', 'ind_b86481d13eeb4a18', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b86481d13eeb4a18', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ifelodun|2023',
  'insert', 'ind_b86481d13eeb4a18',
  'Unique: Osun Ifelodun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b86481d13eeb4a18', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_b86481d13eeb4a18', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b86481d13eeb4a18', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ifelodun',
  'ind_b86481d13eeb4a18', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b86481d13eeb4a18', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ifelodun', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b86481d13eeb4a18', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_b86481d13eeb4a18',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b86481d13eeb4a18', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_b86481d13eeb4a18',
  'political_assignment', '{"constituency_inec": "IFELODUN", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b86481d13eeb4a18', 'prof_b86481d13eeb4a18',
  'Jimoh Mulikat Abiola',
  'jimoh mulikat abiola osun state assembly ifelodun apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Abolarin Kasope Ajibade -- Ifedayo (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b203b371483e01cc', 'Abolarin Kasope Ajibade',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b203b371483e01cc', 'ind_b203b371483e01cc', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abolarin Kasope Ajibade', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b203b371483e01cc', 'prof_b203b371483e01cc',
  'Member, Osun State House of Assembly (IFEDAYO)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b203b371483e01cc', 'ind_b203b371483e01cc', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b203b371483e01cc', 'ind_b203b371483e01cc', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b203b371483e01cc', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ifedayo|2023',
  'insert', 'ind_b203b371483e01cc',
  'Unique: Osun Ifedayo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b203b371483e01cc', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_b203b371483e01cc', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b203b371483e01cc', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ifedayo',
  'ind_b203b371483e01cc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b203b371483e01cc', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ifedayo', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b203b371483e01cc', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_b203b371483e01cc',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b203b371483e01cc', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_b203b371483e01cc',
  'political_assignment', '{"constituency_inec": "IFEDAYO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b203b371483e01cc', 'prof_b203b371483e01cc',
  'Abolarin Kasope Ajibade',
  'abolarin kasope ajibade osun state assembly ifedayo pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Adebisi Lateef Adelani -- Ila (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_604599437f10e4fe', 'Adebisi Lateef Adelani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_604599437f10e4fe', 'ind_604599437f10e4fe', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adebisi Lateef Adelani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_604599437f10e4fe', 'prof_604599437f10e4fe',
  'Member, Osun State House of Assembly (ILA)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_604599437f10e4fe', 'ind_604599437f10e4fe', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_604599437f10e4fe', 'ind_604599437f10e4fe', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_604599437f10e4fe', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ila|2023',
  'insert', 'ind_604599437f10e4fe',
  'Unique: Osun Ila seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_604599437f10e4fe', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_604599437f10e4fe', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_604599437f10e4fe', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ila',
  'ind_604599437f10e4fe', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_604599437f10e4fe', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ila', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_604599437f10e4fe', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_604599437f10e4fe',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_604599437f10e4fe', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_604599437f10e4fe',
  'political_assignment', '{"constituency_inec": "ILA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_604599437f10e4fe', 'prof_604599437f10e4fe',
  'Adebisi Lateef Adelani',
  'adebisi lateef adelani osun state assembly ila apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Adejumo Jimoh Oyelayo -- Odo-Otin (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_345916f48a6abc67', 'Adejumo Jimoh Oyelayo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_345916f48a6abc67', 'ind_345916f48a6abc67', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adejumo Jimoh Oyelayo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_345916f48a6abc67', 'prof_345916f48a6abc67',
  'Member, Osun State House of Assembly (ODO-OTIN)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_345916f48a6abc67', 'ind_345916f48a6abc67', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_345916f48a6abc67', 'ind_345916f48a6abc67', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_345916f48a6abc67', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|odo-otin|2023',
  'insert', 'ind_345916f48a6abc67',
  'Unique: Osun Odo-Otin seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_345916f48a6abc67', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_345916f48a6abc67', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_345916f48a6abc67', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_odo-otin',
  'ind_345916f48a6abc67', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_345916f48a6abc67', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Odo-Otin', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_345916f48a6abc67', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_345916f48a6abc67',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_345916f48a6abc67', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_345916f48a6abc67',
  'political_assignment', '{"constituency_inec": "ODO-OTIN", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_345916f48a6abc67', 'prof_345916f48a6abc67',
  'Adejumo Jimoh Oyelayo',
  'adejumo jimoh oyelayo osun state assembly odo-otin a politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Akande Kunle Akande -- Osogbo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ee857bb898dd1c57', 'Akande Kunle Akande',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ee857bb898dd1c57', 'ind_ee857bb898dd1c57', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akande Kunle Akande', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ee857bb898dd1c57', 'prof_ee857bb898dd1c57',
  'Member, Osun State House of Assembly (OSOGBO)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ee857bb898dd1c57', 'ind_ee857bb898dd1c57', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ee857bb898dd1c57', 'ind_ee857bb898dd1c57', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ee857bb898dd1c57', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|osogbo|2023',
  'insert', 'ind_ee857bb898dd1c57',
  'Unique: Osun Osogbo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ee857bb898dd1c57', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_ee857bb898dd1c57', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ee857bb898dd1c57', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_osogbo',
  'ind_ee857bb898dd1c57', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ee857bb898dd1c57', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Osogbo', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ee857bb898dd1c57', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_ee857bb898dd1c57',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ee857bb898dd1c57', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_ee857bb898dd1c57',
  'political_assignment', '{"constituency_inec": "OSOGBO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ee857bb898dd1c57', 'prof_ee857bb898dd1c57',
  'Akande Kunle Akande',
  'akande kunle akande osun state assembly osogbo apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Adigun Adeola Regina -- Atakunmosa East And West (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_49aeb4eddd6db13d', 'Adigun Adeola Regina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_49aeb4eddd6db13d', 'ind_49aeb4eddd6db13d', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adigun Adeola Regina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_49aeb4eddd6db13d', 'prof_49aeb4eddd6db13d',
  'Member, Osun State House of Assembly (ATAKUNMOSA EAST AND WEST)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_49aeb4eddd6db13d', 'ind_49aeb4eddd6db13d', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_49aeb4eddd6db13d', 'ind_49aeb4eddd6db13d', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_49aeb4eddd6db13d', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|atakunmosa east and west|2023',
  'insert', 'ind_49aeb4eddd6db13d',
  'Unique: Osun Atakunmosa East And West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_49aeb4eddd6db13d', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_49aeb4eddd6db13d', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_49aeb4eddd6db13d', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_atakunmosa_east_and_west',
  'ind_49aeb4eddd6db13d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_49aeb4eddd6db13d', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Atakunmosa East And West', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_49aeb4eddd6db13d', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_49aeb4eddd6db13d',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_49aeb4eddd6db13d', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_49aeb4eddd6db13d',
  'political_assignment', '{"constituency_inec": "ATAKUNMOSA EAST AND WEST", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_49aeb4eddd6db13d', 'prof_49aeb4eddd6db13d',
  'Adigun Adeola Regina',
  'adigun adeola regina osun state assembly atakunmosa east and west aa politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Komolafe Babatunde Festus -- Ife Central (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_08098cd9e1e19eb5', 'Komolafe Babatunde Festus',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_08098cd9e1e19eb5', 'ind_08098cd9e1e19eb5', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Komolafe Babatunde Festus', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_08098cd9e1e19eb5', 'prof_08098cd9e1e19eb5',
  'Member, Osun State House of Assembly (IFE CENTRAL)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_08098cd9e1e19eb5', 'ind_08098cd9e1e19eb5', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_08098cd9e1e19eb5', 'ind_08098cd9e1e19eb5', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_08098cd9e1e19eb5', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ife central|2023',
  'insert', 'ind_08098cd9e1e19eb5',
  'Unique: Osun Ife Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_08098cd9e1e19eb5', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_08098cd9e1e19eb5', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_08098cd9e1e19eb5', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ife_central',
  'ind_08098cd9e1e19eb5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_08098cd9e1e19eb5', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ife Central', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_08098cd9e1e19eb5', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_08098cd9e1e19eb5',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_08098cd9e1e19eb5', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_08098cd9e1e19eb5',
  'political_assignment', '{"constituency_inec": "IFE CENTRAL", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_08098cd9e1e19eb5', 'prof_08098cd9e1e19eb5',
  'Komolafe Babatunde Festus',
  'komolafe babatunde festus osun state assembly ife central apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Adeyeye Olajide Martins -- Ife East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_530f7a85579e8f9a', 'Adeyeye Olajide Martins',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_530f7a85579e8f9a', 'ind_530f7a85579e8f9a', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adeyeye Olajide Martins', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_530f7a85579e8f9a', 'prof_530f7a85579e8f9a',
  'Member, Osun State House of Assembly (IFE EAST)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_530f7a85579e8f9a', 'ind_530f7a85579e8f9a', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_530f7a85579e8f9a', 'ind_530f7a85579e8f9a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_530f7a85579e8f9a', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ife east|2023',
  'insert', 'ind_530f7a85579e8f9a',
  'Unique: Osun Ife East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_530f7a85579e8f9a', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_530f7a85579e8f9a', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_530f7a85579e8f9a', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ife_east',
  'ind_530f7a85579e8f9a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_530f7a85579e8f9a', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ife East', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_530f7a85579e8f9a', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_530f7a85579e8f9a',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_530f7a85579e8f9a', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_530f7a85579e8f9a',
  'political_assignment', '{"constituency_inec": "IFE EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_530f7a85579e8f9a', 'prof_530f7a85579e8f9a',
  'Adeyeye Olajide Martins',
  'adeyeye olajide martins osun state assembly ife east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Olojede Isaac Ayotunde -- Ife North (AAC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a0f0b3d4fcbe5ce4', 'Olojede Isaac Ayotunde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a0f0b3d4fcbe5ce4', 'ind_a0f0b3d4fcbe5ce4', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olojede Isaac Ayotunde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a0f0b3d4fcbe5ce4', 'prof_a0f0b3d4fcbe5ce4',
  'Member, Osun State House of Assembly (IFE NORTH)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a0f0b3d4fcbe5ce4', 'ind_a0f0b3d4fcbe5ce4', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a0f0b3d4fcbe5ce4', 'ind_a0f0b3d4fcbe5ce4', 'org_political_party_aac', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a0f0b3d4fcbe5ce4', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ife north|2023',
  'insert', 'ind_a0f0b3d4fcbe5ce4',
  'Unique: Osun Ife North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a0f0b3d4fcbe5ce4', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_a0f0b3d4fcbe5ce4', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a0f0b3d4fcbe5ce4', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ife_north',
  'ind_a0f0b3d4fcbe5ce4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a0f0b3d4fcbe5ce4', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ife North', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a0f0b3d4fcbe5ce4', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_a0f0b3d4fcbe5ce4',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a0f0b3d4fcbe5ce4', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_a0f0b3d4fcbe5ce4',
  'political_assignment', '{"constituency_inec": "IFE NORTH", "party_abbrev": "AAC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a0f0b3d4fcbe5ce4', 'prof_a0f0b3d4fcbe5ce4',
  'Olojede Isaac Ayotunde',
  'olojede isaac ayotunde osun state assembly ife north aac politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Oyewumi Adisa Najeem -- Ife South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_17f60ebc7bbce986', 'Oyewumi Adisa Najeem',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_17f60ebc7bbce986', 'ind_17f60ebc7bbce986', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oyewumi Adisa Najeem', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_17f60ebc7bbce986', 'prof_17f60ebc7bbce986',
  'Member, Osun State House of Assembly (IFE SOUTH)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_17f60ebc7bbce986', 'ind_17f60ebc7bbce986', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_17f60ebc7bbce986', 'ind_17f60ebc7bbce986', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_17f60ebc7bbce986', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ife south|2023',
  'insert', 'ind_17f60ebc7bbce986',
  'Unique: Osun Ife South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_17f60ebc7bbce986', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_17f60ebc7bbce986', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_17f60ebc7bbce986', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ife_south',
  'ind_17f60ebc7bbce986', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_17f60ebc7bbce986', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ife South', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_17f60ebc7bbce986', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_17f60ebc7bbce986',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_17f60ebc7bbce986', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_17f60ebc7bbce986',
  'political_assignment', '{"constituency_inec": "IFE SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_17f60ebc7bbce986', 'prof_17f60ebc7bbce986',
  'Oyewumi Adisa Najeem',
  'oyewumi adisa najeem osun state assembly ife south apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Olodo Adebayo Taiwo -- Ilesa East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_22c6395639e1757f', 'Olodo Adebayo Taiwo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_22c6395639e1757f', 'ind_22c6395639e1757f', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olodo Adebayo Taiwo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_22c6395639e1757f', 'prof_22c6395639e1757f',
  'Member, Osun State House of Assembly (ILESA EAST)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_22c6395639e1757f', 'ind_22c6395639e1757f', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_22c6395639e1757f', 'ind_22c6395639e1757f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_22c6395639e1757f', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ilesa east|2023',
  'insert', 'ind_22c6395639e1757f',
  'Unique: Osun Ilesa East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_22c6395639e1757f', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_22c6395639e1757f', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_22c6395639e1757f', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ilesa_east',
  'ind_22c6395639e1757f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_22c6395639e1757f', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ilesa East', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_22c6395639e1757f', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_22c6395639e1757f',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_22c6395639e1757f', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_22c6395639e1757f',
  'political_assignment', '{"constituency_inec": "ILESA EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_22c6395639e1757f', 'prof_22c6395639e1757f',
  'Olodo Adebayo Taiwo',
  'olodo adebayo taiwo osun state assembly ilesa east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Akerele Olawale Oladipupo -- Ilesa West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bb657450e25c5291', 'Akerele Olawale Oladipupo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bb657450e25c5291', 'ind_bb657450e25c5291', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akerele Olawale Oladipupo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bb657450e25c5291', 'prof_bb657450e25c5291',
  'Member, Osun State House of Assembly (ILESA WEST)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bb657450e25c5291', 'ind_bb657450e25c5291', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bb657450e25c5291', 'ind_bb657450e25c5291', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bb657450e25c5291', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ilesa west|2023',
  'insert', 'ind_bb657450e25c5291',
  'Unique: Osun Ilesa West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bb657450e25c5291', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_bb657450e25c5291', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bb657450e25c5291', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ilesa_west',
  'ind_bb657450e25c5291', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bb657450e25c5291', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ilesa West', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bb657450e25c5291', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_bb657450e25c5291',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bb657450e25c5291', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_bb657450e25c5291',
  'political_assignment', '{"constituency_inec": "ILESA WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bb657450e25c5291', 'prof_bb657450e25c5291',
  'Akerele Olawale Oladipupo',
  'akerele olawale oladipupo osun state assembly ilesa west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Adeyemi Adewumi -- Obokun (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f719d954876a7f65', 'Adeyemi Adewumi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f719d954876a7f65', 'ind_f719d954876a7f65', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adeyemi Adewumi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f719d954876a7f65', 'prof_f719d954876a7f65',
  'Member, Osun State House of Assembly (OBOKUN)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f719d954876a7f65', 'ind_f719d954876a7f65', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f719d954876a7f65', 'ind_f719d954876a7f65', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f719d954876a7f65', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|obokun|2023',
  'insert', 'ind_f719d954876a7f65',
  'Unique: Osun Obokun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f719d954876a7f65', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_f719d954876a7f65', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f719d954876a7f65', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_obokun',
  'ind_f719d954876a7f65', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f719d954876a7f65', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Obokun', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f719d954876a7f65', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_f719d954876a7f65',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f719d954876a7f65', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_f719d954876a7f65',
  'political_assignment', '{"constituency_inec": "OBOKUN", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f719d954876a7f65', 'prof_f719d954876a7f65',
  'Adeyemi Adewumi',
  'adeyemi adewumi osun state assembly obokun pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Ojo Babatunde Olumide Desmond -- Oriade (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_aa0015ef89f14eff', 'Ojo Babatunde Olumide Desmond',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_aa0015ef89f14eff', 'ind_aa0015ef89f14eff', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ojo Babatunde Olumide Desmond', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_aa0015ef89f14eff', 'prof_aa0015ef89f14eff',
  'Member, Osun State House of Assembly (ORIADE)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_aa0015ef89f14eff', 'ind_aa0015ef89f14eff', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_aa0015ef89f14eff', 'ind_aa0015ef89f14eff', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_aa0015ef89f14eff', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|oriade|2023',
  'insert', 'ind_aa0015ef89f14eff',
  'Unique: Osun Oriade seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_aa0015ef89f14eff', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_aa0015ef89f14eff', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_aa0015ef89f14eff', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_oriade',
  'ind_aa0015ef89f14eff', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_aa0015ef89f14eff', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Oriade', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_aa0015ef89f14eff', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_aa0015ef89f14eff',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_aa0015ef89f14eff', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_aa0015ef89f14eff',
  'political_assignment', '{"constituency_inec": "ORIADE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_aa0015ef89f14eff', 'prof_aa0015ef89f14eff',
  'Ojo Babatunde Olumide Desmond',
  'ojo babatunde olumide desmond osun state assembly oriade apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Akintayo Yaqub -- Ayedade (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4605edcb3b7c3f20', 'Akintayo Yaqub',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4605edcb3b7c3f20', 'ind_4605edcb3b7c3f20', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akintayo Yaqub', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4605edcb3b7c3f20', 'prof_4605edcb3b7c3f20',
  'Member, Osun State House of Assembly (AYEDADE)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4605edcb3b7c3f20', 'ind_4605edcb3b7c3f20', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4605edcb3b7c3f20', 'ind_4605edcb3b7c3f20', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4605edcb3b7c3f20', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ayedade|2023',
  'insert', 'ind_4605edcb3b7c3f20',
  'Unique: Osun Ayedade seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4605edcb3b7c3f20', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_4605edcb3b7c3f20', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4605edcb3b7c3f20', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ayedade',
  'ind_4605edcb3b7c3f20', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4605edcb3b7c3f20', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ayedade', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4605edcb3b7c3f20', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_4605edcb3b7c3f20',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4605edcb3b7c3f20', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_4605edcb3b7c3f20',
  'political_assignment', '{"constituency_inec": "AYEDADE", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4605edcb3b7c3f20', 'prof_4605edcb3b7c3f20',
  'Akintayo Yaqub',
  'akintayo yaqub osun state assembly ayedade a politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Oyekanmi Felix Remi -- Ayedire (ADP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_12ddac7dbf584998', 'Oyekanmi Felix Remi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_12ddac7dbf584998', 'ind_12ddac7dbf584998', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oyekanmi Felix Remi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_12ddac7dbf584998', 'prof_12ddac7dbf584998',
  'Member, Osun State House of Assembly (AYEDIRE)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_12ddac7dbf584998', 'ind_12ddac7dbf584998', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_12ddac7dbf584998', 'ind_12ddac7dbf584998', 'org_political_party_adp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_12ddac7dbf584998', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ayedire|2023',
  'insert', 'ind_12ddac7dbf584998',
  'Unique: Osun Ayedire seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_12ddac7dbf584998', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_12ddac7dbf584998', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_12ddac7dbf584998', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ayedire',
  'ind_12ddac7dbf584998', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_12ddac7dbf584998', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ayedire', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_12ddac7dbf584998', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_12ddac7dbf584998',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_12ddac7dbf584998', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_12ddac7dbf584998',
  'political_assignment', '{"constituency_inec": "AYEDIRE", "party_abbrev": "ADP", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_12ddac7dbf584998', 'prof_12ddac7dbf584998',
  'Oyekanmi Felix Remi',
  'oyekanmi felix remi osun state assembly ayedire adp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Adewunmi Babajide Kofoworola -- Ede North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_47b437dcf57a173c', 'Adewunmi Babajide Kofoworola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_47b437dcf57a173c', 'ind_47b437dcf57a173c', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adewunmi Babajide Kofoworola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_47b437dcf57a173c', 'prof_47b437dcf57a173c',
  'Member, Osun State House of Assembly (EDE NORTH)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_47b437dcf57a173c', 'ind_47b437dcf57a173c', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_47b437dcf57a173c', 'ind_47b437dcf57a173c', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_47b437dcf57a173c', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ede north|2023',
  'insert', 'ind_47b437dcf57a173c',
  'Unique: Osun Ede North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_47b437dcf57a173c', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_47b437dcf57a173c', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_47b437dcf57a173c', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ede_north',
  'ind_47b437dcf57a173c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_47b437dcf57a173c', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ede North', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_47b437dcf57a173c', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_47b437dcf57a173c',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_47b437dcf57a173c', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_47b437dcf57a173c',
  'political_assignment', '{"constituency_inec": "EDE NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_47b437dcf57a173c', 'prof_47b437dcf57a173c',
  'Adewunmi Babajide Kofoworola',
  'adewunmi babajide kofoworola osun state assembly ede north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Olayiwola Taofeek Olalekan -- Ede South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cbaf128da37bcd18', 'Olayiwola Taofeek Olalekan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cbaf128da37bcd18', 'ind_cbaf128da37bcd18', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olayiwola Taofeek Olalekan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cbaf128da37bcd18', 'prof_cbaf128da37bcd18',
  'Member, Osun State House of Assembly (EDE SOUTH)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cbaf128da37bcd18', 'ind_cbaf128da37bcd18', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cbaf128da37bcd18', 'ind_cbaf128da37bcd18', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cbaf128da37bcd18', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ede south|2023',
  'insert', 'ind_cbaf128da37bcd18',
  'Unique: Osun Ede South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cbaf128da37bcd18', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_cbaf128da37bcd18', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cbaf128da37bcd18', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ede_south',
  'ind_cbaf128da37bcd18', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cbaf128da37bcd18', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ede South', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cbaf128da37bcd18', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_cbaf128da37bcd18',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cbaf128da37bcd18', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_cbaf128da37bcd18',
  'political_assignment', '{"constituency_inec": "EDE SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cbaf128da37bcd18', 'prof_cbaf128da37bcd18',
  'Olayiwola Taofeek Olalekan',
  'olayiwola taofeek olalekan osun state assembly ede south pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Ibirogba John Babatunde -- Egbedore (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_05f2f0616fc1e72b', 'Ibirogba John Babatunde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_05f2f0616fc1e72b', 'ind_05f2f0616fc1e72b', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibirogba John Babatunde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_05f2f0616fc1e72b', 'prof_05f2f0616fc1e72b',
  'Member, Osun State House of Assembly (EGBEDORE)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_05f2f0616fc1e72b', 'ind_05f2f0616fc1e72b', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_05f2f0616fc1e72b', 'ind_05f2f0616fc1e72b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_05f2f0616fc1e72b', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|egbedore|2023',
  'insert', 'ind_05f2f0616fc1e72b',
  'Unique: Osun Egbedore seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_05f2f0616fc1e72b', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_05f2f0616fc1e72b', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_05f2f0616fc1e72b', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_egbedore',
  'ind_05f2f0616fc1e72b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_05f2f0616fc1e72b', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Egbedore', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_05f2f0616fc1e72b', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_05f2f0616fc1e72b',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_05f2f0616fc1e72b', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_05f2f0616fc1e72b',
  'political_assignment', '{"constituency_inec": "EGBEDORE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_05f2f0616fc1e72b', 'prof_05f2f0616fc1e72b',
  'Ibirogba John Babatunde',
  'ibirogba john babatunde osun state assembly egbedore apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Oyekanmi Felix Remi -- Irewole/Isokan (ADP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c1f7a129173a1f24', 'Oyekanmi Felix Remi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c1f7a129173a1f24', 'ind_c1f7a129173a1f24', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oyekanmi Felix Remi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c1f7a129173a1f24', 'prof_c1f7a129173a1f24',
  'Member, Osun State House of Assembly (IREWOLE/ISOKAN)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c1f7a129173a1f24', 'ind_c1f7a129173a1f24', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c1f7a129173a1f24', 'ind_c1f7a129173a1f24', 'org_political_party_adp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c1f7a129173a1f24', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|irewole/isokan|2023',
  'insert', 'ind_c1f7a129173a1f24',
  'Unique: Osun Irewole/Isokan seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c1f7a129173a1f24', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_c1f7a129173a1f24', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c1f7a129173a1f24', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_irewole/isokan',
  'ind_c1f7a129173a1f24', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c1f7a129173a1f24', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Irewole/Isokan', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c1f7a129173a1f24', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_c1f7a129173a1f24',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c1f7a129173a1f24', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_c1f7a129173a1f24',
  'political_assignment', '{"constituency_inec": "IREWOLE/ISOKAN", "party_abbrev": "ADP", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c1f7a129173a1f24', 'prof_c1f7a129173a1f24',
  'Oyekanmi Felix Remi',
  'oyekanmi felix remi osun state assembly irewole/isokan adp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Ojo Abosede Omolola -- Iwo (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ca72ade1a592c2f9', 'Ojo Abosede Omolola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ca72ade1a592c2f9', 'ind_ca72ade1a592c2f9', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ojo Abosede Omolola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ca72ade1a592c2f9', 'prof_ca72ade1a592c2f9',
  'Member, Osun State House of Assembly (IWO)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ca72ade1a592c2f9', 'ind_ca72ade1a592c2f9', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ca72ade1a592c2f9', 'ind_ca72ade1a592c2f9', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ca72ade1a592c2f9', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|iwo|2023',
  'insert', 'ind_ca72ade1a592c2f9',
  'Unique: Osun Iwo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ca72ade1a592c2f9', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_ca72ade1a592c2f9', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ca72ade1a592c2f9', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_iwo',
  'ind_ca72ade1a592c2f9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ca72ade1a592c2f9', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Iwo', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ca72ade1a592c2f9', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_ca72ade1a592c2f9',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ca72ade1a592c2f9', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_ca72ade1a592c2f9',
  'political_assignment', '{"constituency_inec": "IWO", "party_abbrev": "A", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ca72ade1a592c2f9', 'prof_ca72ade1a592c2f9',
  'Ojo Abosede Omolola',
  'ojo abosede omolola osun state assembly iwo a politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Jamiu Sikirulai Raji -- Ola-Oluwa (ADP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c3900cdeaf355477', 'Jamiu Sikirulai Raji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c3900cdeaf355477', 'ind_c3900cdeaf355477', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jamiu Sikirulai Raji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c3900cdeaf355477', 'prof_c3900cdeaf355477',
  'Member, Osun State House of Assembly (OLA-OLUWA)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c3900cdeaf355477', 'ind_c3900cdeaf355477', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c3900cdeaf355477', 'ind_c3900cdeaf355477', 'org_political_party_adp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c3900cdeaf355477', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ola-oluwa|2023',
  'insert', 'ind_c3900cdeaf355477',
  'Unique: Osun Ola-Oluwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c3900cdeaf355477', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_c3900cdeaf355477', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c3900cdeaf355477', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ola-oluwa',
  'ind_c3900cdeaf355477', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c3900cdeaf355477', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ola-Oluwa', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c3900cdeaf355477', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_c3900cdeaf355477',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c3900cdeaf355477', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_c3900cdeaf355477',
  'political_assignment', '{"constituency_inec": "OLA-OLUWA", "party_abbrev": "ADP", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c3900cdeaf355477', 'prof_c3900cdeaf355477',
  'Jamiu Sikirulai Raji',
  'jamiu sikirulai raji osun state assembly ola-oluwa adp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Abolayo Mujeeb Akinola -- Ejigbo (AAC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4d75f91a0b489c12', 'Abolayo Mujeeb Akinola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4d75f91a0b489c12', 'ind_4d75f91a0b489c12', 'individual', 'place_state_osun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abolayo Mujeeb Akinola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4d75f91a0b489c12', 'prof_4d75f91a0b489c12',
  'Member, Osun State House of Assembly (EJIGBO)',
  'place_state_osun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4d75f91a0b489c12', 'ind_4d75f91a0b489c12', 'term_ng_osun_state_assembly_10th_2023_2027',
  'place_state_osun', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4d75f91a0b489c12', 'ind_4d75f91a0b489c12', 'org_political_party_aac', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4d75f91a0b489c12', 'seed_run_s05_political_osun_roster_20260502', 'individual',
  'ng_state_assembly_member|osun|ejigbo|2023',
  'insert', 'ind_4d75f91a0b489c12',
  'Unique: Osun Ejigbo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4d75f91a0b489c12', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_4d75f91a0b489c12', 'seed_source_nigerianleaders_osun_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4d75f91a0b489c12', 'seed_run_s05_political_osun_roster_20260502', 'seed_source_nigerianleaders_osun_assembly_20260502',
  'nl_osun_assembly_2023_ejigbo',
  'ind_4d75f91a0b489c12', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4d75f91a0b489c12', 'seed_run_s05_political_osun_roster_20260502',
  'Osun Ejigbo', 'place_state_osun', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4d75f91a0b489c12', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_4d75f91a0b489c12',
  'seed_source_nigerianleaders_osun_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4d75f91a0b489c12', 'seed_run_s05_political_osun_roster_20260502', 'individual', 'ind_4d75f91a0b489c12',
  'political_assignment', '{"constituency_inec": "EJIGBO", "party_abbrev": "AAC", "position": "Member", "source_url": "https://nigerianleaders.com/osun-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4d75f91a0b489c12', 'prof_4d75f91a0b489c12',
  'Abolayo Mujeeb Akinola',
  'abolayo mujeeb akinola osun state assembly ejigbo aac politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_osun',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
