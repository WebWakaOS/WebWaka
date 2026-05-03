-- ============================================================
-- Migration 0507: Benue State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Benue State House of Assembly Members
-- Members seeded: 30/30
-- Party breakdown: Unknown:14, PDP:10, APC:3, LP:1, AA:1, ZLP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_benue_assembly_20260502',
  'NigerianLeaders – Complete List of Benue State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/benue-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_benue_roster_20260502', 'S05 Batch – Benue State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_benue_roster_20260502',
  'seed_run_s05_political_benue_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0507_political_benue_assembly_full_roster_seed.sql',
  NULL, 30,
  '30/30 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_benue_state_assembly_10th_2023_2027',
  'Benue State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_benue',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (30 of 30 seats) ──────────────────────────────────────

-- 01. Lami Danladi -- Ado
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f761c7377ce55975', 'Lami Danladi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f761c7377ce55975', 'ind_f761c7377ce55975', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lami Danladi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f761c7377ce55975', 'prof_f761c7377ce55975',
  'Member, Benue State House of Assembly (ADO)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f761c7377ce55975', 'ind_f761c7377ce55975', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f761c7377ce55975', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|ado|2023',
  'insert', 'ind_f761c7377ce55975',
  'Unique: Benue Ado seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f761c7377ce55975', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f761c7377ce55975', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f761c7377ce55975', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_ado',
  'ind_f761c7377ce55975', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f761c7377ce55975', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Ado', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f761c7377ce55975', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f761c7377ce55975',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f761c7377ce55975', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f761c7377ce55975',
  'political_assignment', '{"constituency_inec": "ADO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f761c7377ce55975', 'prof_f761c7377ce55975',
  'Lami Danladi',
  'lami danladi benue state assembly ado  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Edoh Godwin Abu -- Agbatu (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5641f7a58f011f1b', 'Edoh Godwin Abu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5641f7a58f011f1b', 'ind_5641f7a58f011f1b', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Edoh Godwin Abu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5641f7a58f011f1b', 'prof_5641f7a58f011f1b',
  'Member, Benue State House of Assembly (AGBATU)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5641f7a58f011f1b', 'ind_5641f7a58f011f1b', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5641f7a58f011f1b', 'ind_5641f7a58f011f1b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5641f7a58f011f1b', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|agbatu|2023',
  'insert', 'ind_5641f7a58f011f1b',
  'Unique: Benue Agbatu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5641f7a58f011f1b', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_5641f7a58f011f1b', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5641f7a58f011f1b', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_agbatu',
  'ind_5641f7a58f011f1b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5641f7a58f011f1b', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Agbatu', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5641f7a58f011f1b', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_5641f7a58f011f1b',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5641f7a58f011f1b', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_5641f7a58f011f1b',
  'political_assignment', '{"constituency_inec": "AGBATU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5641f7a58f011f1b', 'prof_5641f7a58f011f1b',
  'Edoh Godwin Abu',
  'edoh godwin abu benue state assembly agbatu pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Umoru Abu James -- Apa (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a1a578f345718d2e', 'Umoru Abu James',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a1a578f345718d2e', 'ind_a1a578f345718d2e', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umoru Abu James', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a1a578f345718d2e', 'prof_a1a578f345718d2e',
  'Member, Benue State House of Assembly (APA)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a1a578f345718d2e', 'ind_a1a578f345718d2e', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a1a578f345718d2e', 'ind_a1a578f345718d2e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a1a578f345718d2e', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|apa|2023',
  'insert', 'ind_a1a578f345718d2e',
  'Unique: Benue Apa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a1a578f345718d2e', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_a1a578f345718d2e', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a1a578f345718d2e', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_apa',
  'ind_a1a578f345718d2e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a1a578f345718d2e', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Apa', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a1a578f345718d2e', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_a1a578f345718d2e',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a1a578f345718d2e', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_a1a578f345718d2e',
  'political_assignment', '{"constituency_inec": "APA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a1a578f345718d2e', 'prof_a1a578f345718d2e',
  'Umoru Abu James',
  'umoru abu james benue state assembly apa pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Abraham Jabi -- Buruku
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_57a8b8eda5ab1dab', 'Abraham Jabi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_57a8b8eda5ab1dab', 'ind_57a8b8eda5ab1dab', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abraham Jabi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_57a8b8eda5ab1dab', 'prof_57a8b8eda5ab1dab',
  'Member, Benue State House of Assembly (BURUKU)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_57a8b8eda5ab1dab', 'ind_57a8b8eda5ab1dab', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_57a8b8eda5ab1dab', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|buruku|2023',
  'insert', 'ind_57a8b8eda5ab1dab',
  'Unique: Benue Buruku seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_57a8b8eda5ab1dab', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_57a8b8eda5ab1dab', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_57a8b8eda5ab1dab', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_buruku',
  'ind_57a8b8eda5ab1dab', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_57a8b8eda5ab1dab', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Buruku', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_57a8b8eda5ab1dab', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_57a8b8eda5ab1dab',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_57a8b8eda5ab1dab', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_57a8b8eda5ab1dab',
  'political_assignment', '{"constituency_inec": "BURUKU", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_57a8b8eda5ab1dab', 'prof_57a8b8eda5ab1dab',
  'Abraham Jabi',
  'abraham jabi benue state assembly buruku  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Beckie Orpin -- Gboko I East
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_93df79a898077b1a', 'Beckie Orpin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_93df79a898077b1a', 'ind_93df79a898077b1a', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Beckie Orpin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_93df79a898077b1a', 'prof_93df79a898077b1a',
  'Member, Benue State House of Assembly (GBOKO I EAST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_93df79a898077b1a', 'ind_93df79a898077b1a', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_93df79a898077b1a', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|gboko i east|2023',
  'insert', 'ind_93df79a898077b1a',
  'Unique: Benue Gboko I East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_93df79a898077b1a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_93df79a898077b1a', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_93df79a898077b1a', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_gboko_i_east',
  'ind_93df79a898077b1a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_93df79a898077b1a', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Gboko I East', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_93df79a898077b1a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_93df79a898077b1a',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_93df79a898077b1a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_93df79a898077b1a',
  'political_assignment', '{"constituency_inec": "GBOKO I EAST", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_93df79a898077b1a', 'prof_93df79a898077b1a',
  'Beckie Orpin',
  'beckie orpin benue state assembly gboko i east  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Aondona Dajoh -- Gboko West
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f4e1328f37d31da7', 'Aondona Dajoh',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f4e1328f37d31da7', 'ind_f4e1328f37d31da7', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aondona Dajoh', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f4e1328f37d31da7', 'prof_f4e1328f37d31da7',
  'Member, Benue State House of Assembly (GBOKO WEST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f4e1328f37d31da7', 'ind_f4e1328f37d31da7', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f4e1328f37d31da7', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|gboko west|2023',
  'insert', 'ind_f4e1328f37d31da7',
  'Unique: Benue Gboko West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f4e1328f37d31da7', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f4e1328f37d31da7', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f4e1328f37d31da7', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_gboko_west',
  'ind_f4e1328f37d31da7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f4e1328f37d31da7', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Gboko West', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f4e1328f37d31da7', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f4e1328f37d31da7',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f4e1328f37d31da7', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f4e1328f37d31da7',
  'political_assignment', '{"constituency_inec": "GBOKO WEST", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f4e1328f37d31da7', 'prof_f4e1328f37d31da7',
  'Aondona Dajoh',
  'aondona dajoh benue state assembly gboko west  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Ortese Yanmar -- Guma
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f5ed6a06c04946dc', 'Ortese Yanmar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f5ed6a06c04946dc', 'ind_f5ed6a06c04946dc', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ortese Yanmar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f5ed6a06c04946dc', 'prof_f5ed6a06c04946dc',
  'Member, Benue State House of Assembly (GUMA)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f5ed6a06c04946dc', 'ind_f5ed6a06c04946dc', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f5ed6a06c04946dc', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|guma|2023',
  'insert', 'ind_f5ed6a06c04946dc',
  'Unique: Benue Guma seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f5ed6a06c04946dc', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f5ed6a06c04946dc', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f5ed6a06c04946dc', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_guma',
  'ind_f5ed6a06c04946dc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f5ed6a06c04946dc', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Guma', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f5ed6a06c04946dc', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f5ed6a06c04946dc',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f5ed6a06c04946dc', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f5ed6a06c04946dc',
  'political_assignment', '{"constituency_inec": "GUMA", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f5ed6a06c04946dc', 'prof_f5ed6a06c04946dc',
  'Ortese Yanmar',
  'ortese yanmar benue state assembly guma  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Elias Audu -- Gwer East
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_da5f5f26d7003de5', 'Elias Audu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_da5f5f26d7003de5', 'ind_da5f5f26d7003de5', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Elias Audu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_da5f5f26d7003de5', 'prof_da5f5f26d7003de5',
  'Member, Benue State House of Assembly (GWER EAST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_da5f5f26d7003de5', 'ind_da5f5f26d7003de5', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_da5f5f26d7003de5', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|gwer east|2023',
  'insert', 'ind_da5f5f26d7003de5',
  'Unique: Benue Gwer East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_da5f5f26d7003de5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_da5f5f26d7003de5', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_da5f5f26d7003de5', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_gwer_east',
  'ind_da5f5f26d7003de5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_da5f5f26d7003de5', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Gwer East', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_da5f5f26d7003de5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_da5f5f26d7003de5',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_da5f5f26d7003de5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_da5f5f26d7003de5',
  'political_assignment', '{"constituency_inec": "GWER EAST", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_da5f5f26d7003de5', 'prof_da5f5f26d7003de5',
  'Elias Audu',
  'elias audu benue state assembly gwer east  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Gyila Solomon Terlumun -- Gwer West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e058409a62001277', 'Gyila Solomon Terlumun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e058409a62001277', 'ind_e058409a62001277', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gyila Solomon Terlumun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e058409a62001277', 'prof_e058409a62001277',
  'Member, Benue State House of Assembly (GWER WEST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e058409a62001277', 'ind_e058409a62001277', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e058409a62001277', 'ind_e058409a62001277', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e058409a62001277', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|gwer west|2023',
  'insert', 'ind_e058409a62001277',
  'Unique: Benue Gwer West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e058409a62001277', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_e058409a62001277', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e058409a62001277', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_gwer_west',
  'ind_e058409a62001277', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e058409a62001277', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Gwer West', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e058409a62001277', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_e058409a62001277',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e058409a62001277', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_e058409a62001277',
  'political_assignment', '{"constituency_inec": "GWER WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e058409a62001277', 'prof_e058409a62001277',
  'Gyila Solomon Terlumun',
  'gyila solomon terlumun benue state assembly gwer west pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Agbidyeh Jonathan -- Katsina Ala East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6700ab5a746d2699', 'Agbidyeh Jonathan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6700ab5a746d2699', 'ind_6700ab5a746d2699', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Agbidyeh Jonathan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6700ab5a746d2699', 'prof_6700ab5a746d2699',
  'Member, Benue State House of Assembly (KATSINA ALA EAST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6700ab5a746d2699', 'ind_6700ab5a746d2699', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6700ab5a746d2699', 'ind_6700ab5a746d2699', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6700ab5a746d2699', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|katsina ala east|2023',
  'insert', 'ind_6700ab5a746d2699',
  'Unique: Benue Katsina Ala East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6700ab5a746d2699', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6700ab5a746d2699', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6700ab5a746d2699', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_katsina_ala_east',
  'ind_6700ab5a746d2699', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6700ab5a746d2699', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Katsina Ala East', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6700ab5a746d2699', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6700ab5a746d2699',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6700ab5a746d2699', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6700ab5a746d2699',
  'political_assignment', '{"constituency_inec": "KATSINA ALA EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6700ab5a746d2699', 'prof_6700ab5a746d2699',
  'Agbidyeh Jonathan',
  'agbidyeh jonathan benue state assembly katsina ala east apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Ipusu Peter, Bemdoo -- Katsina-Ala West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2db36374224b181a', 'Ipusu Peter, Bemdoo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2db36374224b181a', 'ind_2db36374224b181a', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ipusu Peter, Bemdoo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2db36374224b181a', 'prof_2db36374224b181a',
  'Member, Benue State House of Assembly (KATSINA-ALA WEST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2db36374224b181a', 'ind_2db36374224b181a', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2db36374224b181a', 'ind_2db36374224b181a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2db36374224b181a', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|katsina-ala west|2023',
  'insert', 'ind_2db36374224b181a',
  'Unique: Benue Katsina-Ala West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2db36374224b181a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_2db36374224b181a', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2db36374224b181a', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_katsina-ala_west',
  'ind_2db36374224b181a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2db36374224b181a', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Katsina-Ala West', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2db36374224b181a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_2db36374224b181a',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2db36374224b181a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_2db36374224b181a',
  'political_assignment', '{"constituency_inec": "KATSINA-ALA WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2db36374224b181a', 'prof_2db36374224b181a',
  'Ipusu Peter, Bemdoo',
  'ipusu peter, bemdoo benue state assembly katsina-ala west apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Dyako Cephas -- Konshisha I Gaav (LP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b9e5fbc3ee21dcdf', 'Dyako Cephas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b9e5fbc3ee21dcdf', 'ind_b9e5fbc3ee21dcdf', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dyako Cephas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b9e5fbc3ee21dcdf', 'prof_b9e5fbc3ee21dcdf',
  'Member, Benue State House of Assembly (KONSHISHA I GAAV)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b9e5fbc3ee21dcdf', 'ind_b9e5fbc3ee21dcdf', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b9e5fbc3ee21dcdf', 'ind_b9e5fbc3ee21dcdf', 'org_political_party_lp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b9e5fbc3ee21dcdf', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|konshisha i gaav|2023',
  'insert', 'ind_b9e5fbc3ee21dcdf',
  'Unique: Benue Konshisha I Gaav seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b9e5fbc3ee21dcdf', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_b9e5fbc3ee21dcdf', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b9e5fbc3ee21dcdf', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_konshisha_i_gaav',
  'ind_b9e5fbc3ee21dcdf', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b9e5fbc3ee21dcdf', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Konshisha I Gaav', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b9e5fbc3ee21dcdf', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_b9e5fbc3ee21dcdf',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b9e5fbc3ee21dcdf', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_b9e5fbc3ee21dcdf',
  'political_assignment', '{"constituency_inec": "KONSHISHA I GAAV", "party_abbrev": "LP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b9e5fbc3ee21dcdf', 'prof_b9e5fbc3ee21dcdf',
  'Dyako Cephas',
  'dyako cephas benue state assembly konshisha i gaav lp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Anyor Mato -- Kwande East
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_59a2b3900405c571', 'Anyor Mato',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_59a2b3900405c571', 'ind_59a2b3900405c571', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Anyor Mato', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_59a2b3900405c571', 'prof_59a2b3900405c571',
  'Member, Benue State House of Assembly (KWANDE EAST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_59a2b3900405c571', 'ind_59a2b3900405c571', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_59a2b3900405c571', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|kwande east|2023',
  'insert', 'ind_59a2b3900405c571',
  'Unique: Benue Kwande East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_59a2b3900405c571', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_59a2b3900405c571', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_59a2b3900405c571', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_kwande_east',
  'ind_59a2b3900405c571', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_59a2b3900405c571', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Kwande East', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_59a2b3900405c571', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_59a2b3900405c571',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_59a2b3900405c571', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_59a2b3900405c571',
  'political_assignment', '{"constituency_inec": "KWANDE EAST", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_59a2b3900405c571', 'prof_59a2b3900405c571',
  'Anyor Mato',
  'anyor mato benue state assembly kwande east  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Sugh Abanyi -- Kwande West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3d9a06de8e08cde3', 'Sugh Abanyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3d9a06de8e08cde3', 'ind_3d9a06de8e08cde3', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sugh Abanyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3d9a06de8e08cde3', 'prof_3d9a06de8e08cde3',
  'Member, Benue State House of Assembly (KWANDE WEST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3d9a06de8e08cde3', 'ind_3d9a06de8e08cde3', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3d9a06de8e08cde3', 'ind_3d9a06de8e08cde3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3d9a06de8e08cde3', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|kwande west|2023',
  'insert', 'ind_3d9a06de8e08cde3',
  'Unique: Benue Kwande West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3d9a06de8e08cde3', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_3d9a06de8e08cde3', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3d9a06de8e08cde3', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_kwande_west',
  'ind_3d9a06de8e08cde3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3d9a06de8e08cde3', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Kwande West', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3d9a06de8e08cde3', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_3d9a06de8e08cde3',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3d9a06de8e08cde3', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_3d9a06de8e08cde3',
  'political_assignment', '{"constituency_inec": "KWANDE WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3d9a06de8e08cde3', 'prof_3d9a06de8e08cde3',
  'Sugh Abanyi',
  'sugh abanyi benue state assembly kwande west pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Jiji Samuel Shimapever -- Logo (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f08db5502f98e396', 'Jiji Samuel Shimapever',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f08db5502f98e396', 'ind_f08db5502f98e396', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jiji Samuel Shimapever', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f08db5502f98e396', 'prof_f08db5502f98e396',
  'Member, Benue State House of Assembly (LOGO)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f08db5502f98e396', 'ind_f08db5502f98e396', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f08db5502f98e396', 'ind_f08db5502f98e396', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f08db5502f98e396', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|logo|2023',
  'insert', 'ind_f08db5502f98e396',
  'Unique: Benue Logo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f08db5502f98e396', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f08db5502f98e396', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f08db5502f98e396', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_logo',
  'ind_f08db5502f98e396', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f08db5502f98e396', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Logo', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f08db5502f98e396', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f08db5502f98e396',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f08db5502f98e396', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_f08db5502f98e396',
  'political_assignment', '{"constituency_inec": "LOGO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f08db5502f98e396', 'prof_f08db5502f98e396',
  'Jiji Samuel Shimapever',
  'jiji samuel shimapever benue state assembly logo pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Akuma Onah -- Makurdi I North (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3195e5e2f6862aa5', 'Akuma Onah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3195e5e2f6862aa5', 'ind_3195e5e2f6862aa5', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akuma Onah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3195e5e2f6862aa5', 'prof_3195e5e2f6862aa5',
  'Member, Benue State House of Assembly (MAKURDI I NORTH)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3195e5e2f6862aa5', 'ind_3195e5e2f6862aa5', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3195e5e2f6862aa5', 'ind_3195e5e2f6862aa5', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3195e5e2f6862aa5', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|makurdi i north|2023',
  'insert', 'ind_3195e5e2f6862aa5',
  'Unique: Benue Makurdi I North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3195e5e2f6862aa5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_3195e5e2f6862aa5', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3195e5e2f6862aa5', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_makurdi_i_north',
  'ind_3195e5e2f6862aa5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3195e5e2f6862aa5', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Makurdi I North', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3195e5e2f6862aa5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_3195e5e2f6862aa5',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3195e5e2f6862aa5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_3195e5e2f6862aa5',
  'political_assignment', '{"constituency_inec": "MAKURDI I NORTH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3195e5e2f6862aa5', 'prof_3195e5e2f6862aa5',
  'Akuma Onah',
  'akuma onah benue state assembly makurdi i north aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Mr. Douglas Akya -- Makurdi South
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a024a5af419e425c', 'Mr. Douglas Akya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a024a5af419e425c', 'ind_a024a5af419e425c', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mr. Douglas Akya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a024a5af419e425c', 'prof_a024a5af419e425c',
  'Member, Benue State House of Assembly (MAKURDI SOUTH)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a024a5af419e425c', 'ind_a024a5af419e425c', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a024a5af419e425c', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|makurdi south|2023',
  'insert', 'ind_a024a5af419e425c',
  'Unique: Benue Makurdi South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a024a5af419e425c', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_a024a5af419e425c', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a024a5af419e425c', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_makurdi_south',
  'ind_a024a5af419e425c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a024a5af419e425c', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Makurdi South', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a024a5af419e425c', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_a024a5af419e425c',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a024a5af419e425c', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_a024a5af419e425c',
  'political_assignment', '{"constituency_inec": "MAKURDI SOUTH", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a024a5af419e425c', 'prof_a024a5af419e425c',
  'Mr. Douglas Akya',
  'mr. douglas akya benue state assembly makurdi south  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Egbodo Moses -- Obi (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c269cef46453522c', 'Egbodo Moses',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c269cef46453522c', 'ind_c269cef46453522c', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Egbodo Moses', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c269cef46453522c', 'prof_c269cef46453522c',
  'Member, Benue State House of Assembly (OBI)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c269cef46453522c', 'ind_c269cef46453522c', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c269cef46453522c', 'ind_c269cef46453522c', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c269cef46453522c', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|obi|2023',
  'insert', 'ind_c269cef46453522c',
  'Unique: Benue Obi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c269cef46453522c', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c269cef46453522c', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c269cef46453522c', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_obi',
  'ind_c269cef46453522c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c269cef46453522c', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Obi', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c269cef46453522c', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c269cef46453522c',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c269cef46453522c', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c269cef46453522c',
  'political_assignment', '{"constituency_inec": "OBI", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c269cef46453522c', 'prof_c269cef46453522c',
  'Egbodo Moses',
  'egbodo moses benue state assembly obi pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Samuel Agada -- Ogbadibo
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c9df33f520baf320', 'Samuel Agada',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c9df33f520baf320', 'ind_c9df33f520baf320', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Samuel Agada', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c9df33f520baf320', 'prof_c9df33f520baf320',
  'Member, Benue State House of Assembly (OGBADIBO)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c9df33f520baf320', 'ind_c9df33f520baf320', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c9df33f520baf320', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|ogbadibo|2023',
  'insert', 'ind_c9df33f520baf320',
  'Unique: Benue Ogbadibo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c9df33f520baf320', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c9df33f520baf320', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c9df33f520baf320', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_ogbadibo',
  'ind_c9df33f520baf320', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c9df33f520baf320', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Ogbadibo', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c9df33f520baf320', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c9df33f520baf320',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c9df33f520baf320', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c9df33f520baf320',
  'political_assignment', '{"constituency_inec": "OGBADIBO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c9df33f520baf320', 'prof_c9df33f520baf320',
  'Samuel Agada',
  'samuel agada benue state assembly ogbadibo  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Ochekliye Agbo Isaac -- Ohimini (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_29612b33c3eadf52', 'Ochekliye Agbo Isaac',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_29612b33c3eadf52', 'ind_29612b33c3eadf52', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ochekliye Agbo Isaac', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_29612b33c3eadf52', 'prof_29612b33c3eadf52',
  'Member, Benue State House of Assembly (OHIMINI)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_29612b33c3eadf52', 'ind_29612b33c3eadf52', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_29612b33c3eadf52', 'ind_29612b33c3eadf52', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_29612b33c3eadf52', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|ohimini|2023',
  'insert', 'ind_29612b33c3eadf52',
  'Unique: Benue Ohimini seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_29612b33c3eadf52', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_29612b33c3eadf52', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_29612b33c3eadf52', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_ohimini',
  'ind_29612b33c3eadf52', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_29612b33c3eadf52', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Ohimini', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_29612b33c3eadf52', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_29612b33c3eadf52',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_29612b33c3eadf52', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_29612b33c3eadf52',
  'political_assignment', '{"constituency_inec": "OHIMINI", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_29612b33c3eadf52', 'prof_29612b33c3eadf52',
  'Ochekliye Agbo Isaac',
  'ochekliye agbo isaac benue state assembly ohimini pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Onah Blessed -- Oju I
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c8911508f9b13887', 'Onah Blessed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c8911508f9b13887', 'ind_c8911508f9b13887', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onah Blessed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c8911508f9b13887', 'prof_c8911508f9b13887',
  'Member, Benue State House of Assembly (OJU I)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c8911508f9b13887', 'ind_c8911508f9b13887', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c8911508f9b13887', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|oju i|2023',
  'insert', 'ind_c8911508f9b13887',
  'Unique: Benue Oju I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c8911508f9b13887', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c8911508f9b13887', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c8911508f9b13887', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_oju_i',
  'ind_c8911508f9b13887', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c8911508f9b13887', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Oju I', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c8911508f9b13887', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c8911508f9b13887',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c8911508f9b13887', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_c8911508f9b13887',
  'political_assignment', '{"constituency_inec": "OJU I", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c8911508f9b13887', 'prof_c8911508f9b13887',
  'Onah Blessed',
  'onah blessed benue state assembly oju i  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Agom Atta Anthony -- Okpokwu (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d1a4f35579f4c596', 'Agom Atta Anthony',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d1a4f35579f4c596', 'ind_d1a4f35579f4c596', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Agom Atta Anthony', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d1a4f35579f4c596', 'prof_d1a4f35579f4c596',
  'Member, Benue State House of Assembly (OKPOKWU)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d1a4f35579f4c596', 'ind_d1a4f35579f4c596', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d1a4f35579f4c596', 'ind_d1a4f35579f4c596', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d1a4f35579f4c596', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|okpokwu|2023',
  'insert', 'ind_d1a4f35579f4c596',
  'Unique: Benue Okpokwu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d1a4f35579f4c596', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_d1a4f35579f4c596', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d1a4f35579f4c596', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_okpokwu',
  'ind_d1a4f35579f4c596', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d1a4f35579f4c596', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Okpokwu', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d1a4f35579f4c596', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_d1a4f35579f4c596',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d1a4f35579f4c596', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_d1a4f35579f4c596',
  'political_assignment', '{"constituency_inec": "OKPOKWU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d1a4f35579f4c596', 'prof_d1a4f35579f4c596',
  'Agom Atta Anthony',
  'agom atta anthony benue state assembly okpokwu pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Odeh Johnson Baba -- Otukpo (ZLP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_642ea155840a263b', 'Odeh Johnson Baba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_642ea155840a263b', 'ind_642ea155840a263b', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Odeh Johnson Baba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_642ea155840a263b', 'prof_642ea155840a263b',
  'Member, Benue State House of Assembly (OTUKPO)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_642ea155840a263b', 'ind_642ea155840a263b', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_642ea155840a263b', 'ind_642ea155840a263b', 'org_political_party_zlp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_642ea155840a263b', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|otukpo|2023',
  'insert', 'ind_642ea155840a263b',
  'Unique: Benue Otukpo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_642ea155840a263b', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_642ea155840a263b', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_642ea155840a263b', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_otukpo',
  'ind_642ea155840a263b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_642ea155840a263b', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Otukpo', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_642ea155840a263b', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_642ea155840a263b',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_642ea155840a263b', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_642ea155840a263b',
  'political_assignment', '{"constituency_inec": "OTUKPO", "party_abbrev": "ZLP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_642ea155840a263b', 'prof_642ea155840a263b',
  'Odeh Johnson Baba',
  'odeh johnson baba benue state assembly otukpo zlp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Audu Michael -- Otukpo North East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9034c56a729eea75', 'Audu Michael',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9034c56a729eea75', 'ind_9034c56a729eea75', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Audu Michael', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9034c56a729eea75', 'prof_9034c56a729eea75',
  'Member, Benue State House of Assembly (OTUKPO NORTH EAST)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9034c56a729eea75', 'ind_9034c56a729eea75', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9034c56a729eea75', 'ind_9034c56a729eea75', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9034c56a729eea75', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|otukpo north east|2023',
  'insert', 'ind_9034c56a729eea75',
  'Unique: Benue Otukpo North East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9034c56a729eea75', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_9034c56a729eea75', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9034c56a729eea75', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_otukpo_north_east',
  'ind_9034c56a729eea75', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9034c56a729eea75', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Otukpo North East', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9034c56a729eea75', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_9034c56a729eea75',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9034c56a729eea75', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_9034c56a729eea75',
  'political_assignment', '{"constituency_inec": "OTUKPO NORTH EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9034c56a729eea75', 'prof_9034c56a729eea75',
  'Audu Michael',
  'audu michael benue state assembly otukpo north east pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Manger Mcclinton Manger -- Tarka (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6ab0888a24bd798f', 'Manger Mcclinton Manger',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6ab0888a24bd798f', 'ind_6ab0888a24bd798f', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Manger Mcclinton Manger', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6ab0888a24bd798f', 'prof_6ab0888a24bd798f',
  'Member, Benue State House of Assembly (TARKA)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6ab0888a24bd798f', 'ind_6ab0888a24bd798f', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6ab0888a24bd798f', 'ind_6ab0888a24bd798f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6ab0888a24bd798f', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|tarka|2023',
  'insert', 'ind_6ab0888a24bd798f',
  'Unique: Benue Tarka seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6ab0888a24bd798f', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6ab0888a24bd798f', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6ab0888a24bd798f', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_tarka',
  'ind_6ab0888a24bd798f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6ab0888a24bd798f', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Tarka', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6ab0888a24bd798f', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6ab0888a24bd798f',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6ab0888a24bd798f', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6ab0888a24bd798f',
  'political_assignment', '{"constituency_inec": "TARKA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6ab0888a24bd798f', 'prof_6ab0888a24bd798f',
  'Manger Mcclinton Manger',
  'manger mcclinton manger benue state assembly tarka apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Ezra Nyiyongo -- Ukum I Ngenev
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_44ee6ef6aa492571', 'Ezra Nyiyongo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_44ee6ef6aa492571', 'ind_44ee6ef6aa492571', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ezra Nyiyongo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_44ee6ef6aa492571', 'prof_44ee6ef6aa492571',
  'Member, Benue State House of Assembly (UKUM I NGENEV)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_44ee6ef6aa492571', 'ind_44ee6ef6aa492571', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_44ee6ef6aa492571', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|ukum i ngenev|2023',
  'insert', 'ind_44ee6ef6aa492571',
  'Unique: Benue Ukum I Ngenev seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_44ee6ef6aa492571', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_44ee6ef6aa492571', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_44ee6ef6aa492571', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_ukum_i_ngenev',
  'ind_44ee6ef6aa492571', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_44ee6ef6aa492571', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Ukum I Ngenev', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_44ee6ef6aa492571', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_44ee6ef6aa492571',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_44ee6ef6aa492571', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_44ee6ef6aa492571',
  'political_assignment', '{"constituency_inec": "UKUM I NGENEV", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_44ee6ef6aa492571', 'prof_44ee6ef6aa492571',
  'Ezra Nyiyongo',
  'ezra nyiyongo benue state assembly ukum i ngenev  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Cyril Ikong -- Oju II
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ab90c8b6f235e8f5', 'Cyril Ikong',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ab90c8b6f235e8f5', 'ind_ab90c8b6f235e8f5', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Cyril Ikong', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ab90c8b6f235e8f5', 'prof_ab90c8b6f235e8f5',
  'Member, Benue State House of Assembly (OJU II)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ab90c8b6f235e8f5', 'ind_ab90c8b6f235e8f5', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ab90c8b6f235e8f5', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|oju ii|2023',
  'insert', 'ind_ab90c8b6f235e8f5',
  'Unique: Benue Oju II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ab90c8b6f235e8f5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_ab90c8b6f235e8f5', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ab90c8b6f235e8f5', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_oju_ii',
  'ind_ab90c8b6f235e8f5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ab90c8b6f235e8f5', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Oju II', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ab90c8b6f235e8f5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_ab90c8b6f235e8f5',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ab90c8b6f235e8f5', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_ab90c8b6f235e8f5',
  'political_assignment', '{"constituency_inec": "OJU II", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ab90c8b6f235e8f5', 'prof_ab90c8b6f235e8f5',
  'Cyril Ikong',
  'cyril ikong benue state assembly oju ii  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 28. Adeiyongo Terkimbi -- Vandeikya II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4c28bc4e9da607a1', 'Adeiyongo Terkimbi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4c28bc4e9da607a1', 'ind_4c28bc4e9da607a1', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adeiyongo Terkimbi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4c28bc4e9da607a1', 'prof_4c28bc4e9da607a1',
  'Member, Benue State House of Assembly (VANDEIKYA II)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4c28bc4e9da607a1', 'ind_4c28bc4e9da607a1', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4c28bc4e9da607a1', 'ind_4c28bc4e9da607a1', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4c28bc4e9da607a1', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|vandeikya ii|2023',
  'insert', 'ind_4c28bc4e9da607a1',
  'Unique: Benue Vandeikya II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4c28bc4e9da607a1', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_4c28bc4e9da607a1', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4c28bc4e9da607a1', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_vandeikya_ii',
  'ind_4c28bc4e9da607a1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4c28bc4e9da607a1', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Vandeikya II', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4c28bc4e9da607a1', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_4c28bc4e9da607a1',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4c28bc4e9da607a1', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_4c28bc4e9da607a1',
  'political_assignment', '{"constituency_inec": "VANDEIKYA II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4c28bc4e9da607a1', 'prof_4c28bc4e9da607a1',
  'Adeiyongo Terkimbi',
  'adeiyongo terkimbi benue state assembly vandeikya ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 29. Simon Gabo -- Ushongo-Mata
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_689e5364580b378a', 'Simon Gabo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_689e5364580b378a', 'ind_689e5364580b378a', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Simon Gabo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_689e5364580b378a', 'prof_689e5364580b378a',
  'Member, Benue State House of Assembly (USHONGO-MATA)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_689e5364580b378a', 'ind_689e5364580b378a', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_689e5364580b378a', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|ushongo-mata|2023',
  'insert', 'ind_689e5364580b378a',
  'Unique: Benue Ushongo-Mata seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_689e5364580b378a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_689e5364580b378a', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_689e5364580b378a', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_ushongo-mata',
  'ind_689e5364580b378a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_689e5364580b378a', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Ushongo-Mata', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_689e5364580b378a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_689e5364580b378a',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_689e5364580b378a', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_689e5364580b378a',
  'political_assignment', '{"constituency_inec": "USHONGO-MATA", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_689e5364580b378a', 'prof_689e5364580b378a',
  'Simon Gabo',
  'simon gabo benue state assembly ushongo-mata  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

-- 30. Williams Ortyom -- Agasha
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6a267b9bd0bffece', 'Williams Ortyom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6a267b9bd0bffece', 'ind_6a267b9bd0bffece', 'individual', 'place_state_benue',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Williams Ortyom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6a267b9bd0bffece', 'prof_6a267b9bd0bffece',
  'Member, Benue State House of Assembly (AGASHA)',
  'place_state_benue', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6a267b9bd0bffece', 'ind_6a267b9bd0bffece', 'term_ng_benue_state_assembly_10th_2023_2027',
  'place_state_benue', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6a267b9bd0bffece', 'seed_run_s05_political_benue_roster_20260502', 'individual',
  'ng_state_assembly_member|benue|agasha|2023',
  'insert', 'ind_6a267b9bd0bffece',
  'Unique: Benue Agasha seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6a267b9bd0bffece', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6a267b9bd0bffece', 'seed_source_nigerianleaders_benue_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6a267b9bd0bffece', 'seed_run_s05_political_benue_roster_20260502', 'seed_source_nigerianleaders_benue_assembly_20260502',
  'nl_benue_assembly_2023_agasha',
  'ind_6a267b9bd0bffece', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6a267b9bd0bffece', 'seed_run_s05_political_benue_roster_20260502',
  'Benue Agasha', 'place_state_benue', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6a267b9bd0bffece', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6a267b9bd0bffece',
  'seed_source_nigerianleaders_benue_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6a267b9bd0bffece', 'seed_run_s05_political_benue_roster_20260502', 'individual', 'ind_6a267b9bd0bffece',
  'political_assignment', '{"constituency_inec": "AGASHA", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/benue-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6a267b9bd0bffece', 'prof_6a267b9bd0bffece',
  'Williams Ortyom',
  'williams ortyom benue state assembly agasha  politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_benue',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
