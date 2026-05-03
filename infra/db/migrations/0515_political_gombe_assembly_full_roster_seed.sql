-- ============================================================
-- Migration 0515: Gombe State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Gombe State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: APC:19, PDP:5
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_gombe_assembly_20260502',
  'NigerianLeaders – Complete List of Gombe State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/gombe-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_gombe_roster_20260502', 'S05 Batch – Gombe State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_gombe_roster_20260502',
  'seed_run_s05_political_gombe_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0515_political_gombe_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_gombe_state_assembly_10th_2023_2027',
  'Gombe State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_gombe',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Abdullahi Abubakar -- Akko West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_12e24b67a5e20e5a', 'Abdullahi Abubakar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_12e24b67a5e20e5a', 'ind_12e24b67a5e20e5a', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Abubakar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_12e24b67a5e20e5a', 'prof_12e24b67a5e20e5a',
  'Member, Gombe State House of Assembly (AKKO WEST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_12e24b67a5e20e5a', 'ind_12e24b67a5e20e5a', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_12e24b67a5e20e5a', 'ind_12e24b67a5e20e5a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_12e24b67a5e20e5a', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|akko west|2023',
  'insert', 'ind_12e24b67a5e20e5a',
  'Unique: Gombe Akko West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_12e24b67a5e20e5a', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_12e24b67a5e20e5a', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_12e24b67a5e20e5a', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_akko_west',
  'ind_12e24b67a5e20e5a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_12e24b67a5e20e5a', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Akko West', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_12e24b67a5e20e5a', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_12e24b67a5e20e5a',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_12e24b67a5e20e5a', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_12e24b67a5e20e5a',
  'political_assignment', '{"constituency_inec": "AKKO WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_12e24b67a5e20e5a', 'prof_12e24b67a5e20e5a',
  'Abdullahi Abubakar',
  'abdullahi abubakar gombe state assembly akko west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Mohammed A. Musa -- Akko North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0c00170c8036d828', 'Mohammed A. Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0c00170c8036d828', 'ind_0c00170c8036d828', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed A. Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0c00170c8036d828', 'prof_0c00170c8036d828',
  'Member, Gombe State House of Assembly (AKKO NORTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0c00170c8036d828', 'ind_0c00170c8036d828', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0c00170c8036d828', 'ind_0c00170c8036d828', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0c00170c8036d828', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|akko north|2023',
  'insert', 'ind_0c00170c8036d828',
  'Unique: Gombe Akko North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0c00170c8036d828', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_0c00170c8036d828', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0c00170c8036d828', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_akko_north',
  'ind_0c00170c8036d828', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0c00170c8036d828', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Akko North', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0c00170c8036d828', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_0c00170c8036d828',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0c00170c8036d828', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_0c00170c8036d828',
  'political_assignment', '{"constituency_inec": "AKKO NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0c00170c8036d828', 'prof_0c00170c8036d828',
  'Mohammed A. Musa',
  'mohammed a. musa gombe state assembly akko north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Muhammad Abubakar Luggerewo -- Akko Central (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c94c67873dee83bb', 'Muhammad Abubakar Luggerewo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c94c67873dee83bb', 'ind_c94c67873dee83bb', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Abubakar Luggerewo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c94c67873dee83bb', 'prof_c94c67873dee83bb',
  'Member, Gombe State House of Assembly (AKKO CENTRAL)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c94c67873dee83bb', 'ind_c94c67873dee83bb', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c94c67873dee83bb', 'ind_c94c67873dee83bb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c94c67873dee83bb', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|akko central|2023',
  'insert', 'ind_c94c67873dee83bb',
  'Unique: Gombe Akko Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c94c67873dee83bb', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_c94c67873dee83bb', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c94c67873dee83bb', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_akko_central',
  'ind_c94c67873dee83bb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c94c67873dee83bb', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Akko Central', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c94c67873dee83bb', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_c94c67873dee83bb',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c94c67873dee83bb', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_c94c67873dee83bb',
  'political_assignment', '{"constituency_inec": "AKKO CENTRAL", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c94c67873dee83bb', 'prof_c94c67873dee83bb',
  'Muhammad Abubakar Luggerewo',
  'muhammad abubakar luggerewo gombe state assembly akko central apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Buba Musa -- Balanga North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a768054e7dcbea03', 'Buba Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a768054e7dcbea03', 'ind_a768054e7dcbea03', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Buba Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a768054e7dcbea03', 'prof_a768054e7dcbea03',
  'Member, Gombe State House of Assembly (BALANGA NORTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a768054e7dcbea03', 'ind_a768054e7dcbea03', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a768054e7dcbea03', 'ind_a768054e7dcbea03', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a768054e7dcbea03', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|balanga north|2023',
  'insert', 'ind_a768054e7dcbea03',
  'Unique: Gombe Balanga North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a768054e7dcbea03', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_a768054e7dcbea03', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a768054e7dcbea03', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_balanga_north',
  'ind_a768054e7dcbea03', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a768054e7dcbea03', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Balanga North', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a768054e7dcbea03', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_a768054e7dcbea03',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a768054e7dcbea03', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_a768054e7dcbea03',
  'political_assignment', '{"constituency_inec": "BALANGA NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a768054e7dcbea03', 'prof_a768054e7dcbea03',
  'Buba Musa',
  'buba musa gombe state assembly balanga north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Maigemi Lamido Isaac -- Balanga South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ff1b42ba4134900c', 'Maigemi Lamido Isaac',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ff1b42ba4134900c', 'ind_ff1b42ba4134900c', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Maigemi Lamido Isaac', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ff1b42ba4134900c', 'prof_ff1b42ba4134900c',
  'Member, Gombe State House of Assembly (BALANGA SOUTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ff1b42ba4134900c', 'ind_ff1b42ba4134900c', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ff1b42ba4134900c', 'ind_ff1b42ba4134900c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ff1b42ba4134900c', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|balanga south|2023',
  'insert', 'ind_ff1b42ba4134900c',
  'Unique: Gombe Balanga South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ff1b42ba4134900c', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_ff1b42ba4134900c', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ff1b42ba4134900c', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_balanga_south',
  'ind_ff1b42ba4134900c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ff1b42ba4134900c', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Balanga South', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ff1b42ba4134900c', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_ff1b42ba4134900c',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ff1b42ba4134900c', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_ff1b42ba4134900c',
  'political_assignment', '{"constituency_inec": "BALANGA SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ff1b42ba4134900c', 'prof_ff1b42ba4134900c',
  'Maigemi Lamido Isaac',
  'maigemi lamido isaac gombe state assembly balanga south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Daniel Yakubu -- Billiri East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a6fbd3bb77362386', 'Daniel Yakubu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a6fbd3bb77362386', 'ind_a6fbd3bb77362386', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Daniel Yakubu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a6fbd3bb77362386', 'prof_a6fbd3bb77362386',
  'Member, Gombe State House of Assembly (BILLIRI EAST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a6fbd3bb77362386', 'ind_a6fbd3bb77362386', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a6fbd3bb77362386', 'ind_a6fbd3bb77362386', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a6fbd3bb77362386', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|billiri east|2023',
  'insert', 'ind_a6fbd3bb77362386',
  'Unique: Gombe Billiri East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a6fbd3bb77362386', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_a6fbd3bb77362386', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a6fbd3bb77362386', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_billiri_east',
  'ind_a6fbd3bb77362386', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a6fbd3bb77362386', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Billiri East', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a6fbd3bb77362386', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_a6fbd3bb77362386',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a6fbd3bb77362386', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_a6fbd3bb77362386',
  'political_assignment', '{"constituency_inec": "BILLIRI EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a6fbd3bb77362386', 'prof_a6fbd3bb77362386',
  'Daniel Yakubu',
  'daniel yakubu gombe state assembly billiri east pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Malon Nimrod Yari -- Billiri West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_46ed186ca63c9611', 'Malon Nimrod Yari',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_46ed186ca63c9611', 'ind_46ed186ca63c9611', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Malon Nimrod Yari', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_46ed186ca63c9611', 'prof_46ed186ca63c9611',
  'Member, Gombe State House of Assembly (BILLIRI WEST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_46ed186ca63c9611', 'ind_46ed186ca63c9611', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_46ed186ca63c9611', 'ind_46ed186ca63c9611', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_46ed186ca63c9611', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|billiri west|2023',
  'insert', 'ind_46ed186ca63c9611',
  'Unique: Gombe Billiri West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_46ed186ca63c9611', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_46ed186ca63c9611', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_46ed186ca63c9611', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_billiri_west',
  'ind_46ed186ca63c9611', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_46ed186ca63c9611', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Billiri West', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_46ed186ca63c9611', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_46ed186ca63c9611',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_46ed186ca63c9611', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_46ed186ca63c9611',
  'political_assignment', '{"constituency_inec": "BILLIRI WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_46ed186ca63c9611', 'prof_46ed186ca63c9611',
  'Malon Nimrod Yari',
  'malon nimrod yari gombe state assembly billiri west pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Abdulkarim Nasiru -- Dukku North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f997d2e0fc018d4f', 'Abdulkarim Nasiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f997d2e0fc018d4f', 'ind_f997d2e0fc018d4f', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdulkarim Nasiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f997d2e0fc018d4f', 'prof_f997d2e0fc018d4f',
  'Member, Gombe State House of Assembly (DUKKU NORTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f997d2e0fc018d4f', 'ind_f997d2e0fc018d4f', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f997d2e0fc018d4f', 'ind_f997d2e0fc018d4f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f997d2e0fc018d4f', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|dukku north|2023',
  'insert', 'ind_f997d2e0fc018d4f',
  'Unique: Gombe Dukku North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f997d2e0fc018d4f', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_f997d2e0fc018d4f', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f997d2e0fc018d4f', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_dukku_north',
  'ind_f997d2e0fc018d4f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f997d2e0fc018d4f', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Dukku North', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f997d2e0fc018d4f', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_f997d2e0fc018d4f',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f997d2e0fc018d4f', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_f997d2e0fc018d4f',
  'political_assignment', '{"constituency_inec": "DUKKU NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f997d2e0fc018d4f', 'prof_f997d2e0fc018d4f',
  'Abdulkarim Nasiru',
  'abdulkarim nasiru gombe state assembly dukku north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Umar Adamu A -- Dukku South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3a8e6f6e33ce39ba', 'Umar Adamu A',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3a8e6f6e33ce39ba', 'ind_3a8e6f6e33ce39ba', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umar Adamu A', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3a8e6f6e33ce39ba', 'prof_3a8e6f6e33ce39ba',
  'Member, Gombe State House of Assembly (DUKKU SOUTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3a8e6f6e33ce39ba', 'ind_3a8e6f6e33ce39ba', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3a8e6f6e33ce39ba', 'ind_3a8e6f6e33ce39ba', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3a8e6f6e33ce39ba', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|dukku south|2023',
  'insert', 'ind_3a8e6f6e33ce39ba',
  'Unique: Gombe Dukku South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3a8e6f6e33ce39ba', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_3a8e6f6e33ce39ba', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3a8e6f6e33ce39ba', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_dukku_south',
  'ind_3a8e6f6e33ce39ba', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3a8e6f6e33ce39ba', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Dukku South', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3a8e6f6e33ce39ba', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_3a8e6f6e33ce39ba',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3a8e6f6e33ce39ba', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_3a8e6f6e33ce39ba',
  'political_assignment', '{"constituency_inec": "DUKKU SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3a8e6f6e33ce39ba', 'prof_3a8e6f6e33ce39ba',
  'Umar Adamu A',
  'umar adamu a gombe state assembly dukku south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Suleiman Mohammed Kabir -- Deba (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6e4ec13499c5cf6a', 'Suleiman Mohammed Kabir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6e4ec13499c5cf6a', 'ind_6e4ec13499c5cf6a', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Mohammed Kabir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6e4ec13499c5cf6a', 'prof_6e4ec13499c5cf6a',
  'Member, Gombe State House of Assembly (DEBA)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6e4ec13499c5cf6a', 'ind_6e4ec13499c5cf6a', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6e4ec13499c5cf6a', 'ind_6e4ec13499c5cf6a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6e4ec13499c5cf6a', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|deba|2023',
  'insert', 'ind_6e4ec13499c5cf6a',
  'Unique: Gombe Deba seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6e4ec13499c5cf6a', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_6e4ec13499c5cf6a', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6e4ec13499c5cf6a', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_deba',
  'ind_6e4ec13499c5cf6a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6e4ec13499c5cf6a', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Deba', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6e4ec13499c5cf6a', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_6e4ec13499c5cf6a',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6e4ec13499c5cf6a', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_6e4ec13499c5cf6a',
  'political_assignment', '{"constituency_inec": "DEBA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6e4ec13499c5cf6a', 'prof_6e4ec13499c5cf6a',
  'Suleiman Mohammed Kabir',
  'suleiman mohammed kabir gombe state assembly deba apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Adamu Sale Pata -- Yamaltu East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2f55cf8693b47d95', 'Adamu Sale Pata',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2f55cf8693b47d95', 'ind_2f55cf8693b47d95', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adamu Sale Pata', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2f55cf8693b47d95', 'prof_2f55cf8693b47d95',
  'Member, Gombe State House of Assembly (YAMALTU EAST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2f55cf8693b47d95', 'ind_2f55cf8693b47d95', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2f55cf8693b47d95', 'ind_2f55cf8693b47d95', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2f55cf8693b47d95', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|yamaltu east|2023',
  'insert', 'ind_2f55cf8693b47d95',
  'Unique: Gombe Yamaltu East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2f55cf8693b47d95', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_2f55cf8693b47d95', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2f55cf8693b47d95', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_yamaltu_east',
  'ind_2f55cf8693b47d95', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2f55cf8693b47d95', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Yamaltu East', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2f55cf8693b47d95', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_2f55cf8693b47d95',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2f55cf8693b47d95', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_2f55cf8693b47d95',
  'political_assignment', '{"constituency_inec": "YAMALTU EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2f55cf8693b47d95', 'prof_2f55cf8693b47d95',
  'Adamu Sale Pata',
  'adamu sale pata gombe state assembly yamaltu east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Manaja Musa Zambuk -- Yamaltu West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_06130c607379c86e', 'Manaja Musa Zambuk',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_06130c607379c86e', 'ind_06130c607379c86e', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Manaja Musa Zambuk', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_06130c607379c86e', 'prof_06130c607379c86e',
  'Member, Gombe State House of Assembly (YAMALTU WEST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_06130c607379c86e', 'ind_06130c607379c86e', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_06130c607379c86e', 'ind_06130c607379c86e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_06130c607379c86e', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|yamaltu west|2023',
  'insert', 'ind_06130c607379c86e',
  'Unique: Gombe Yamaltu West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_06130c607379c86e', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_06130c607379c86e', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_06130c607379c86e', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_yamaltu_west',
  'ind_06130c607379c86e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_06130c607379c86e', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Yamaltu West', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_06130c607379c86e', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_06130c607379c86e',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_06130c607379c86e', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_06130c607379c86e',
  'political_assignment', '{"constituency_inec": "YAMALTU WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_06130c607379c86e', 'prof_06130c607379c86e',
  'Manaja Musa Zambuk',
  'manaja musa zambuk gombe state assembly yamaltu west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Sadam Bello Sale -- Funakaye North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_131d8a91179d632c', 'Sadam Bello Sale',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_131d8a91179d632c', 'ind_131d8a91179d632c', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sadam Bello Sale', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_131d8a91179d632c', 'prof_131d8a91179d632c',
  'Member, Gombe State House of Assembly (FUNAKAYE NORTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_131d8a91179d632c', 'ind_131d8a91179d632c', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_131d8a91179d632c', 'ind_131d8a91179d632c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_131d8a91179d632c', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|funakaye north|2023',
  'insert', 'ind_131d8a91179d632c',
  'Unique: Gombe Funakaye North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_131d8a91179d632c', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_131d8a91179d632c', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_131d8a91179d632c', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_funakaye_north',
  'ind_131d8a91179d632c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_131d8a91179d632c', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Funakaye North', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_131d8a91179d632c', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_131d8a91179d632c',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_131d8a91179d632c', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_131d8a91179d632c',
  'political_assignment', '{"constituency_inec": "FUNAKAYE NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_131d8a91179d632c', 'prof_131d8a91179d632c',
  'Sadam Bello Sale',
  'sadam bello sale gombe state assembly funakaye north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Abubakar Dayi Muhammed -- Funakaye South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_409703d04b944da7', 'Abubakar Dayi Muhammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_409703d04b944da7', 'ind_409703d04b944da7', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Dayi Muhammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_409703d04b944da7', 'prof_409703d04b944da7',
  'Member, Gombe State House of Assembly (FUNAKAYE SOUTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_409703d04b944da7', 'ind_409703d04b944da7', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_409703d04b944da7', 'ind_409703d04b944da7', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_409703d04b944da7', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|funakaye south|2023',
  'insert', 'ind_409703d04b944da7',
  'Unique: Gombe Funakaye South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_409703d04b944da7', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_409703d04b944da7', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_409703d04b944da7', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_funakaye_south',
  'ind_409703d04b944da7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_409703d04b944da7', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Funakaye South', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_409703d04b944da7', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_409703d04b944da7',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_409703d04b944da7', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_409703d04b944da7',
  'political_assignment', '{"constituency_inec": "FUNAKAYE SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_409703d04b944da7', 'prof_409703d04b944da7',
  'Abubakar Dayi Muhammed',
  'abubakar dayi muhammed gombe state assembly funakaye south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Manu Aliyu Baba -- Gombe North (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1ef8aa1fe30a6d5d', 'Manu Aliyu Baba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1ef8aa1fe30a6d5d', 'ind_1ef8aa1fe30a6d5d', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Manu Aliyu Baba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1ef8aa1fe30a6d5d', 'prof_1ef8aa1fe30a6d5d',
  'Member, Gombe State House of Assembly (GOMBE NORTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1ef8aa1fe30a6d5d', 'ind_1ef8aa1fe30a6d5d', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1ef8aa1fe30a6d5d', 'ind_1ef8aa1fe30a6d5d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1ef8aa1fe30a6d5d', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|gombe north|2023',
  'insert', 'ind_1ef8aa1fe30a6d5d',
  'Unique: Gombe Gombe North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1ef8aa1fe30a6d5d', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_1ef8aa1fe30a6d5d', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1ef8aa1fe30a6d5d', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_gombe_north',
  'ind_1ef8aa1fe30a6d5d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1ef8aa1fe30a6d5d', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Gombe North', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1ef8aa1fe30a6d5d', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_1ef8aa1fe30a6d5d',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1ef8aa1fe30a6d5d', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_1ef8aa1fe30a6d5d',
  'political_assignment', '{"constituency_inec": "GOMBE NORTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1ef8aa1fe30a6d5d', 'prof_1ef8aa1fe30a6d5d',
  'Manu Aliyu Baba',
  'manu aliyu baba gombe state assembly gombe north apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Mustapha Usman Hassan -- Gombe South (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_371c6ed43b83a965', 'Mustapha Usman Hassan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_371c6ed43b83a965', 'ind_371c6ed43b83a965', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mustapha Usman Hassan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_371c6ed43b83a965', 'prof_371c6ed43b83a965',
  'Member, Gombe State House of Assembly (GOMBE SOUTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_371c6ed43b83a965', 'ind_371c6ed43b83a965', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_371c6ed43b83a965', 'ind_371c6ed43b83a965', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_371c6ed43b83a965', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|gombe south|2023',
  'insert', 'ind_371c6ed43b83a965',
  'Unique: Gombe Gombe South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_371c6ed43b83a965', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_371c6ed43b83a965', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_371c6ed43b83a965', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_gombe_south',
  'ind_371c6ed43b83a965', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_371c6ed43b83a965', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Gombe South', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_371c6ed43b83a965', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_371c6ed43b83a965',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_371c6ed43b83a965', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_371c6ed43b83a965',
  'political_assignment', '{"constituency_inec": "GOMBE SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_371c6ed43b83a965', 'prof_371c6ed43b83a965',
  'Mustapha Usman Hassan',
  'mustapha usman hassan gombe state assembly gombe south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Ladan Yerima Gaule -- Kaltungo East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d4a0d4654801965b', 'Ladan Yerima Gaule',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d4a0d4654801965b', 'ind_d4a0d4654801965b', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ladan Yerima Gaule', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d4a0d4654801965b', 'prof_d4a0d4654801965b',
  'Member, Gombe State House of Assembly (KALTUNGO EAST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d4a0d4654801965b', 'ind_d4a0d4654801965b', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d4a0d4654801965b', 'ind_d4a0d4654801965b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d4a0d4654801965b', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|kaltungo east|2023',
  'insert', 'ind_d4a0d4654801965b',
  'Unique: Gombe Kaltungo East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d4a0d4654801965b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_d4a0d4654801965b', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d4a0d4654801965b', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_kaltungo_east',
  'ind_d4a0d4654801965b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d4a0d4654801965b', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Kaltungo East', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d4a0d4654801965b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_d4a0d4654801965b',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d4a0d4654801965b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_d4a0d4654801965b',
  'political_assignment', '{"constituency_inec": "KALTUNGO EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d4a0d4654801965b', 'prof_d4a0d4654801965b',
  'Ladan Yerima Gaule',
  'ladan yerima gaule gombe state assembly kaltungo east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Suleiman Iliya -- Kaltungo West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3a3d3ada1d6ac17b', 'Suleiman Iliya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3a3d3ada1d6ac17b', 'ind_3a3d3ada1d6ac17b', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Iliya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3a3d3ada1d6ac17b', 'prof_3a3d3ada1d6ac17b',
  'Member, Gombe State House of Assembly (KALTUNGO WEST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3a3d3ada1d6ac17b', 'ind_3a3d3ada1d6ac17b', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3a3d3ada1d6ac17b', 'ind_3a3d3ada1d6ac17b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3a3d3ada1d6ac17b', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|kaltungo west|2023',
  'insert', 'ind_3a3d3ada1d6ac17b',
  'Unique: Gombe Kaltungo West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3a3d3ada1d6ac17b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_3a3d3ada1d6ac17b', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3a3d3ada1d6ac17b', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_kaltungo_west',
  'ind_3a3d3ada1d6ac17b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3a3d3ada1d6ac17b', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Kaltungo West', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3a3d3ada1d6ac17b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_3a3d3ada1d6ac17b',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3a3d3ada1d6ac17b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_3a3d3ada1d6ac17b',
  'political_assignment', '{"constituency_inec": "KALTUNGO WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3a3d3ada1d6ac17b', 'prof_3a3d3ada1d6ac17b',
  'Suleiman Iliya',
  'suleiman iliya gombe state assembly kaltungo west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Haruna Shuaibu Adamu -- Kwami East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_31bb3a0780934e4b', 'Haruna Shuaibu Adamu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_31bb3a0780934e4b', 'ind_31bb3a0780934e4b', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Haruna Shuaibu Adamu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_31bb3a0780934e4b', 'prof_31bb3a0780934e4b',
  'Member, Gombe State House of Assembly (KWAMI EAST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_31bb3a0780934e4b', 'ind_31bb3a0780934e4b', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_31bb3a0780934e4b', 'ind_31bb3a0780934e4b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_31bb3a0780934e4b', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|kwami east|2023',
  'insert', 'ind_31bb3a0780934e4b',
  'Unique: Gombe Kwami East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_31bb3a0780934e4b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_31bb3a0780934e4b', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_31bb3a0780934e4b', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_kwami_east',
  'ind_31bb3a0780934e4b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_31bb3a0780934e4b', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Kwami East', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_31bb3a0780934e4b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_31bb3a0780934e4b',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_31bb3a0780934e4b', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_31bb3a0780934e4b',
  'political_assignment', '{"constituency_inec": "KWAMI EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_31bb3a0780934e4b', 'prof_31bb3a0780934e4b',
  'Haruna Shuaibu Adamu',
  'haruna shuaibu adamu gombe state assembly kwami east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Siddi Buba -- Kwami West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_df329cffd6b41177', 'Siddi Buba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_df329cffd6b41177', 'ind_df329cffd6b41177', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Siddi Buba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_df329cffd6b41177', 'prof_df329cffd6b41177',
  'Member, Gombe State House of Assembly (KWAMI WEST)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_df329cffd6b41177', 'ind_df329cffd6b41177', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_df329cffd6b41177', 'ind_df329cffd6b41177', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_df329cffd6b41177', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|kwami west|2023',
  'insert', 'ind_df329cffd6b41177',
  'Unique: Gombe Kwami West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_df329cffd6b41177', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_df329cffd6b41177', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_df329cffd6b41177', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_kwami_west',
  'ind_df329cffd6b41177', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_df329cffd6b41177', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Kwami West', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_df329cffd6b41177', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_df329cffd6b41177',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_df329cffd6b41177', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_df329cffd6b41177',
  'political_assignment', '{"constituency_inec": "KWAMI WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_df329cffd6b41177', 'prof_df329cffd6b41177',
  'Siddi Buba',
  'siddi buba gombe state assembly kwami west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Ahmadu Alhaji A. -- Nafada North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f13ce26ac14d5b79', 'Ahmadu Alhaji A.',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f13ce26ac14d5b79', 'ind_f13ce26ac14d5b79', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ahmadu Alhaji A.', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f13ce26ac14d5b79', 'prof_f13ce26ac14d5b79',
  'Member, Gombe State House of Assembly (NAFADA NORTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f13ce26ac14d5b79', 'ind_f13ce26ac14d5b79', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f13ce26ac14d5b79', 'ind_f13ce26ac14d5b79', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f13ce26ac14d5b79', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|nafada north|2023',
  'insert', 'ind_f13ce26ac14d5b79',
  'Unique: Gombe Nafada North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f13ce26ac14d5b79', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_f13ce26ac14d5b79', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f13ce26ac14d5b79', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_nafada_north',
  'ind_f13ce26ac14d5b79', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f13ce26ac14d5b79', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Nafada North', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f13ce26ac14d5b79', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_f13ce26ac14d5b79',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f13ce26ac14d5b79', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_f13ce26ac14d5b79',
  'political_assignment', '{"constituency_inec": "NAFADA NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f13ce26ac14d5b79', 'prof_f13ce26ac14d5b79',
  'Ahmadu Alhaji A.',
  'ahmadu alhaji a. gombe state assembly nafada north pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Adamu Musa Biri -- Nafada South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_546b0d02820e6ec0', 'Adamu Musa Biri',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_546b0d02820e6ec0', 'ind_546b0d02820e6ec0', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adamu Musa Biri', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_546b0d02820e6ec0', 'prof_546b0d02820e6ec0',
  'Member, Gombe State House of Assembly (NAFADA SOUTH)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_546b0d02820e6ec0', 'ind_546b0d02820e6ec0', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_546b0d02820e6ec0', 'ind_546b0d02820e6ec0', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_546b0d02820e6ec0', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|nafada south|2023',
  'insert', 'ind_546b0d02820e6ec0',
  'Unique: Gombe Nafada South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_546b0d02820e6ec0', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_546b0d02820e6ec0', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_546b0d02820e6ec0', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_nafada_south',
  'ind_546b0d02820e6ec0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_546b0d02820e6ec0', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Nafada South', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_546b0d02820e6ec0', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_546b0d02820e6ec0',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_546b0d02820e6ec0', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_546b0d02820e6ec0',
  'political_assignment', '{"constituency_inec": "NAFADA SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_546b0d02820e6ec0', 'prof_546b0d02820e6ec0',
  'Adamu Musa Biri',
  'adamu musa biri gombe state assembly nafada south pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Golkos Gaius Gaji -- Pero/Chonge (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cb7e708871909191', 'Golkos Gaius Gaji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cb7e708871909191', 'ind_cb7e708871909191', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Golkos Gaius Gaji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cb7e708871909191', 'prof_cb7e708871909191',
  'Member, Gombe State House of Assembly (PERO/CHONGE)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cb7e708871909191', 'ind_cb7e708871909191', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cb7e708871909191', 'ind_cb7e708871909191', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cb7e708871909191', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|pero/chonge|2023',
  'insert', 'ind_cb7e708871909191',
  'Unique: Gombe Pero/Chonge seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cb7e708871909191', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_cb7e708871909191', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cb7e708871909191', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_pero/chonge',
  'ind_cb7e708871909191', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cb7e708871909191', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Pero/Chonge', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cb7e708871909191', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_cb7e708871909191',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cb7e708871909191', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_cb7e708871909191',
  'political_assignment', '{"constituency_inec": "PERO/CHONGE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cb7e708871909191', 'prof_cb7e708871909191',
  'Golkos Gaius Gaji',
  'golkos gaius gaji gombe state assembly pero/chonge apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Ayala Zubairu Pilate -- Shongom (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_dd15761471ff57e2', 'Ayala Zubairu Pilate',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_dd15761471ff57e2', 'ind_dd15761471ff57e2', 'individual', 'place_state_gombe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayala Zubairu Pilate', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_dd15761471ff57e2', 'prof_dd15761471ff57e2',
  'Member, Gombe State House of Assembly (SHONGOM)',
  'place_state_gombe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_dd15761471ff57e2', 'ind_dd15761471ff57e2', 'term_ng_gombe_state_assembly_10th_2023_2027',
  'place_state_gombe', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_dd15761471ff57e2', 'ind_dd15761471ff57e2', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_dd15761471ff57e2', 'seed_run_s05_political_gombe_roster_20260502', 'individual',
  'ng_state_assembly_member|gombe|shongom|2023',
  'insert', 'ind_dd15761471ff57e2',
  'Unique: Gombe Shongom seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_dd15761471ff57e2', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_dd15761471ff57e2', 'seed_source_nigerianleaders_gombe_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_dd15761471ff57e2', 'seed_run_s05_political_gombe_roster_20260502', 'seed_source_nigerianleaders_gombe_assembly_20260502',
  'nl_gombe_assembly_2023_shongom',
  'ind_dd15761471ff57e2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_dd15761471ff57e2', 'seed_run_s05_political_gombe_roster_20260502',
  'Gombe Shongom', 'place_state_gombe', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_dd15761471ff57e2', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_dd15761471ff57e2',
  'seed_source_nigerianleaders_gombe_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_dd15761471ff57e2', 'seed_run_s05_political_gombe_roster_20260502', 'individual', 'ind_dd15761471ff57e2',
  'political_assignment', '{"constituency_inec": "SHONGOM", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/gombe-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_dd15761471ff57e2', 'prof_dd15761471ff57e2',
  'Ayala Zubairu Pilate',
  'ayala zubairu pilate gombe state assembly shongom pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_gombe',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
