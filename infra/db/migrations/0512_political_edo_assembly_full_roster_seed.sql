-- ============================================================
-- Migration 0512: Edo State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Edo State House of Assembly Members
-- Members seeded: 24/24
-- Party breakdown: APC:21, PDP:3
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_edo_assembly_20260502',
  'NigerianLeaders – Complete List of Edo State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/edo-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_edo_roster_20260502', 'S05 Batch – Edo State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_edo_roster_20260502',
  'seed_run_s05_political_edo_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0512_political_edo_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_edo_state_assembly_10th_2023_2027',
  'Edo State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_edo',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 24 seats) ──────────────────────────────────────

-- 01. Idaiye Yekini Oisayemoje -- Akoko Edo I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_61c21e55f26c5bf1', 'Idaiye Yekini Oisayemoje',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_61c21e55f26c5bf1', 'ind_61c21e55f26c5bf1', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idaiye Yekini Oisayemoje', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_61c21e55f26c5bf1', 'prof_61c21e55f26c5bf1',
  'Member, Edo State House of Assembly (AKOKO EDO I)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_61c21e55f26c5bf1', 'ind_61c21e55f26c5bf1', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_61c21e55f26c5bf1', 'ind_61c21e55f26c5bf1', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_61c21e55f26c5bf1', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|akoko edo i|2023',
  'insert', 'ind_61c21e55f26c5bf1',
  'Unique: Edo Akoko Edo I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_61c21e55f26c5bf1', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_61c21e55f26c5bf1', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_61c21e55f26c5bf1', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_akoko_edo_i',
  'ind_61c21e55f26c5bf1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_61c21e55f26c5bf1', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Akoko Edo I', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_61c21e55f26c5bf1', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_61c21e55f26c5bf1',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_61c21e55f26c5bf1', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_61c21e55f26c5bf1',
  'political_assignment', '{"constituency_inec": "AKOKO EDO I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_61c21e55f26c5bf1', 'prof_61c21e55f26c5bf1',
  'Idaiye Yekini Oisayemoje',
  'idaiye yekini oisayemoje edo state assembly akoko edo i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Edobor Victor, Sabor -- Esan Central (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0ea6d6c35e5b2719', 'Edobor Victor, Sabor',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0ea6d6c35e5b2719', 'ind_0ea6d6c35e5b2719', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Edobor Victor, Sabor', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0ea6d6c35e5b2719', 'prof_0ea6d6c35e5b2719',
  'Member, Edo State House of Assembly (ESAN CENTRAL)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0ea6d6c35e5b2719', 'ind_0ea6d6c35e5b2719', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0ea6d6c35e5b2719', 'ind_0ea6d6c35e5b2719', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0ea6d6c35e5b2719', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|esan central|2023',
  'insert', 'ind_0ea6d6c35e5b2719',
  'Unique: Edo Esan Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0ea6d6c35e5b2719', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_0ea6d6c35e5b2719', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0ea6d6c35e5b2719', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_esan_central',
  'ind_0ea6d6c35e5b2719', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0ea6d6c35e5b2719', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Esan Central', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0ea6d6c35e5b2719', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_0ea6d6c35e5b2719',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0ea6d6c35e5b2719', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_0ea6d6c35e5b2719',
  'political_assignment', '{"constituency_inec": "ESAN CENTRAL", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0ea6d6c35e5b2719', 'prof_0ea6d6c35e5b2719',
  'Edobor Victor, Sabor',
  'edobor victor, sabor edo state assembly esan central apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Ibhamawu Jonathan, Aigbokhan -- Esan West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fadc10eaf7516a50', 'Ibhamawu Jonathan, Aigbokhan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fadc10eaf7516a50', 'ind_fadc10eaf7516a50', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibhamawu Jonathan, Aigbokhan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fadc10eaf7516a50', 'prof_fadc10eaf7516a50',
  'Member, Edo State House of Assembly (ESAN WEST)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fadc10eaf7516a50', 'ind_fadc10eaf7516a50', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fadc10eaf7516a50', 'ind_fadc10eaf7516a50', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fadc10eaf7516a50', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|esan west|2023',
  'insert', 'ind_fadc10eaf7516a50',
  'Unique: Edo Esan West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fadc10eaf7516a50', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_fadc10eaf7516a50', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fadc10eaf7516a50', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_esan_west',
  'ind_fadc10eaf7516a50', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fadc10eaf7516a50', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Esan West', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fadc10eaf7516a50', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_fadc10eaf7516a50',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fadc10eaf7516a50', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_fadc10eaf7516a50',
  'political_assignment', '{"constituency_inec": "ESAN WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fadc10eaf7516a50', 'prof_fadc10eaf7516a50',
  'Ibhamawu Jonathan, Aigbokhan',
  'ibhamawu jonathan, aigbokhan edo state assembly esan west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Addeh Emankhu, Isibor -- Esan North East I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4384d3b37e8925b9', 'Addeh Emankhu, Isibor',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4384d3b37e8925b9', 'ind_4384d3b37e8925b9', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Addeh Emankhu, Isibor', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4384d3b37e8925b9', 'prof_4384d3b37e8925b9',
  'Member, Edo State House of Assembly (ESAN NORTH EAST I)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4384d3b37e8925b9', 'ind_4384d3b37e8925b9', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4384d3b37e8925b9', 'ind_4384d3b37e8925b9', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4384d3b37e8925b9', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|esan north east i|2023',
  'insert', 'ind_4384d3b37e8925b9',
  'Unique: Edo Esan North East I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4384d3b37e8925b9', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4384d3b37e8925b9', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4384d3b37e8925b9', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_esan_north_east_i',
  'ind_4384d3b37e8925b9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4384d3b37e8925b9', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Esan North East I', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4384d3b37e8925b9', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4384d3b37e8925b9',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4384d3b37e8925b9', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4384d3b37e8925b9',
  'political_assignment', '{"constituency_inec": "ESAN NORTH EAST I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4384d3b37e8925b9', 'prof_4384d3b37e8925b9',
  'Addeh Emankhu, Isibor',
  'addeh emankhu, isibor edo state assembly esan north east i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Ojezele Osezua Sunday -- Essan South East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b676b58d8226fb59', 'Ojezele Osezua Sunday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b676b58d8226fb59', 'ind_b676b58d8226fb59', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ojezele Osezua Sunday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b676b58d8226fb59', 'prof_b676b58d8226fb59',
  'Member, Edo State House of Assembly (ESSAN SOUTH EAST)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b676b58d8226fb59', 'ind_b676b58d8226fb59', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b676b58d8226fb59', 'ind_b676b58d8226fb59', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b676b58d8226fb59', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|essan south east|2023',
  'insert', 'ind_b676b58d8226fb59',
  'Unique: Edo Essan South East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b676b58d8226fb59', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b676b58d8226fb59', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b676b58d8226fb59', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_essan_south_east',
  'ind_b676b58d8226fb59', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b676b58d8226fb59', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Essan South East', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b676b58d8226fb59', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b676b58d8226fb59',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b676b58d8226fb59', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b676b58d8226fb59',
  'political_assignment', '{"constituency_inec": "ESSAN SOUTH EAST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b676b58d8226fb59', 'prof_b676b58d8226fb59',
  'Ojezele Osezua Sunday',
  'ojezele osezua sunday edo state assembly essan south east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Oshmah Ahmed -- Etsako Central (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_eda8e4caca3a805c', 'Oshmah Ahmed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_eda8e4caca3a805c', 'ind_eda8e4caca3a805c', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oshmah Ahmed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_eda8e4caca3a805c', 'prof_eda8e4caca3a805c',
  'Member, Edo State House of Assembly (ETSAKO CENTRAL)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_eda8e4caca3a805c', 'ind_eda8e4caca3a805c', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_eda8e4caca3a805c', 'ind_eda8e4caca3a805c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_eda8e4caca3a805c', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|etsako central|2023',
  'insert', 'ind_eda8e4caca3a805c',
  'Unique: Edo Etsako Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_eda8e4caca3a805c', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_eda8e4caca3a805c', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_eda8e4caca3a805c', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_etsako_central',
  'ind_eda8e4caca3a805c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_eda8e4caca3a805c', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Etsako Central', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_eda8e4caca3a805c', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_eda8e4caca3a805c',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_eda8e4caca3a805c', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_eda8e4caca3a805c',
  'political_assignment', '{"constituency_inec": "ETSAKO CENTRAL", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_eda8e4caca3a805c', 'prof_eda8e4caca3a805c',
  'Oshmah Ahmed',
  'oshmah ahmed edo state assembly etsako central apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Ugabi Kingsley, Ogheneklogie -- Etsako East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b66c3647042d59e2', 'Ugabi Kingsley, Ogheneklogie',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b66c3647042d59e2', 'ind_b66c3647042d59e2', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ugabi Kingsley, Ogheneklogie', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b66c3647042d59e2', 'prof_b66c3647042d59e2',
  'Member, Edo State House of Assembly (ETSAKO EAST)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b66c3647042d59e2', 'ind_b66c3647042d59e2', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b66c3647042d59e2', 'ind_b66c3647042d59e2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b66c3647042d59e2', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|etsako east|2023',
  'insert', 'ind_b66c3647042d59e2',
  'Unique: Edo Etsako East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b66c3647042d59e2', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b66c3647042d59e2', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b66c3647042d59e2', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_etsako_east',
  'ind_b66c3647042d59e2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b66c3647042d59e2', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Etsako East', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b66c3647042d59e2', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b66c3647042d59e2',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b66c3647042d59e2', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b66c3647042d59e2',
  'political_assignment', '{"constituency_inec": "ETSAKO EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b66c3647042d59e2', 'prof_b66c3647042d59e2',
  'Ugabi Kingsley, Ogheneklogie',
  'ugabi kingsley, ogheneklogie edo state assembly etsako east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Lecky Hussein, Mustapha -- Etsako West I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ac17214ed20d67b8', 'Lecky Hussein, Mustapha',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ac17214ed20d67b8', 'ind_ac17214ed20d67b8', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lecky Hussein, Mustapha', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ac17214ed20d67b8', 'prof_ac17214ed20d67b8',
  'Member, Edo State House of Assembly (ETSAKO WEST I)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ac17214ed20d67b8', 'ind_ac17214ed20d67b8', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ac17214ed20d67b8', 'ind_ac17214ed20d67b8', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ac17214ed20d67b8', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|etsako west i|2023',
  'insert', 'ind_ac17214ed20d67b8',
  'Unique: Edo Etsako West I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ac17214ed20d67b8', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_ac17214ed20d67b8', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ac17214ed20d67b8', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_etsako_west_i',
  'ind_ac17214ed20d67b8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ac17214ed20d67b8', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Etsako West I', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ac17214ed20d67b8', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_ac17214ed20d67b8',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ac17214ed20d67b8', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_ac17214ed20d67b8',
  'political_assignment', '{"constituency_inec": "ETSAKO WEST I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ac17214ed20d67b8', 'prof_ac17214ed20d67b8',
  'Lecky Hussein, Mustapha',
  'lecky hussein, mustapha edo state assembly etsako west i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Omoregbe Promise, Osaretin -- Egor (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ae2b1a68017c97c5', 'Omoregbe Promise, Osaretin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ae2b1a68017c97c5', 'ind_ae2b1a68017c97c5', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omoregbe Promise, Osaretin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ae2b1a68017c97c5', 'prof_ae2b1a68017c97c5',
  'Member, Edo State House of Assembly (EGOR)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ae2b1a68017c97c5', 'ind_ae2b1a68017c97c5', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ae2b1a68017c97c5', 'ind_ae2b1a68017c97c5', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ae2b1a68017c97c5', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|egor|2023',
  'insert', 'ind_ae2b1a68017c97c5',
  'Unique: Edo Egor seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ae2b1a68017c97c5', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_ae2b1a68017c97c5', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ae2b1a68017c97c5', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_egor',
  'ind_ae2b1a68017c97c5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ae2b1a68017c97c5', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Egor', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ae2b1a68017c97c5', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_ae2b1a68017c97c5',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ae2b1a68017c97c5', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_ae2b1a68017c97c5',
  'political_assignment', '{"constituency_inec": "EGOR", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ae2b1a68017c97c5', 'prof_ae2b1a68017c97c5',
  'Omoregbe Promise, Osaretin',
  'omoregbe promise, osaretin edo state assembly egor apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Iyamu Alexander, Endurance - Johnson -- Ikpoba-Okha (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e48114e1bab352f2', 'Iyamu Alexander, Endurance - Johnson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e48114e1bab352f2', 'ind_e48114e1bab352f2', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Iyamu Alexander, Endurance - Johnson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e48114e1bab352f2', 'prof_e48114e1bab352f2',
  'Member, Edo State House of Assembly (IKPOBA-OKHA)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e48114e1bab352f2', 'ind_e48114e1bab352f2', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e48114e1bab352f2', 'ind_e48114e1bab352f2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e48114e1bab352f2', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|ikpoba-okha|2023',
  'insert', 'ind_e48114e1bab352f2',
  'Unique: Edo Ikpoba-Okha seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e48114e1bab352f2', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_e48114e1bab352f2', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e48114e1bab352f2', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_ikpoba-okha',
  'ind_e48114e1bab352f2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e48114e1bab352f2', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Ikpoba-Okha', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e48114e1bab352f2', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_e48114e1bab352f2',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e48114e1bab352f2', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_e48114e1bab352f2',
  'political_assignment', '{"constituency_inec": "IKPOBA-OKHA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e48114e1bab352f2', 'prof_e48114e1bab352f2',
  'Iyamu Alexander, Endurance - Johnson',
  'iyamu alexander, endurance - johnson edo state assembly ikpoba-okha apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Umoye Kukei, Ambrose -- Igueben (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_664de59bfabb262f', 'Umoye Kukei, Ambrose',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_664de59bfabb262f', 'ind_664de59bfabb262f', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umoye Kukei, Ambrose', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_664de59bfabb262f', 'prof_664de59bfabb262f',
  'Member, Edo State House of Assembly (IGUEBEN)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_664de59bfabb262f', 'ind_664de59bfabb262f', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_664de59bfabb262f', 'ind_664de59bfabb262f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_664de59bfabb262f', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|igueben|2023',
  'insert', 'ind_664de59bfabb262f',
  'Unique: Edo Igueben seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_664de59bfabb262f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_664de59bfabb262f', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_664de59bfabb262f', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_igueben',
  'ind_664de59bfabb262f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_664de59bfabb262f', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Igueben', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_664de59bfabb262f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_664de59bfabb262f',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_664de59bfabb262f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_664de59bfabb262f',
  'political_assignment', '{"constituency_inec": "IGUEBEN", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_664de59bfabb262f', 'prof_664de59bfabb262f',
  'Umoye Kukei, Ambrose',
  'umoye kukei, ambrose edo state assembly igueben apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Usuomon Edoghogho, Raphael -- Oredo East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f5d46a07bc5e66b0', 'Usuomon Edoghogho, Raphael',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f5d46a07bc5e66b0', 'ind_f5d46a07bc5e66b0', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usuomon Edoghogho, Raphael', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f5d46a07bc5e66b0', 'prof_f5d46a07bc5e66b0',
  'Member, Edo State House of Assembly (OREDO EAST)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f5d46a07bc5e66b0', 'ind_f5d46a07bc5e66b0', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f5d46a07bc5e66b0', 'ind_f5d46a07bc5e66b0', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f5d46a07bc5e66b0', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|oredo east|2023',
  'insert', 'ind_f5d46a07bc5e66b0',
  'Unique: Edo Oredo East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f5d46a07bc5e66b0', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_f5d46a07bc5e66b0', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f5d46a07bc5e66b0', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_oredo_east',
  'ind_f5d46a07bc5e66b0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f5d46a07bc5e66b0', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Oredo East', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f5d46a07bc5e66b0', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_f5d46a07bc5e66b0',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f5d46a07bc5e66b0', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_f5d46a07bc5e66b0',
  'political_assignment', '{"constituency_inec": "OREDO EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f5d46a07bc5e66b0', 'prof_f5d46a07bc5e66b0',
  'Usuomon Edoghogho, Raphael',
  'usuomon edoghogho, raphael edo state assembly oredo east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Iduseri Gabriel -- Oredo West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4df674cfc6671e86', 'Iduseri Gabriel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4df674cfc6671e86', 'ind_4df674cfc6671e86', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Iduseri Gabriel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4df674cfc6671e86', 'prof_4df674cfc6671e86',
  'Member, Edo State House of Assembly (OREDO WEST)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4df674cfc6671e86', 'ind_4df674cfc6671e86', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4df674cfc6671e86', 'ind_4df674cfc6671e86', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4df674cfc6671e86', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|oredo west|2023',
  'insert', 'ind_4df674cfc6671e86',
  'Unique: Edo Oredo West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4df674cfc6671e86', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4df674cfc6671e86', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4df674cfc6671e86', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_oredo_west',
  'ind_4df674cfc6671e86', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4df674cfc6671e86', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Oredo West', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4df674cfc6671e86', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4df674cfc6671e86',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4df674cfc6671e86', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4df674cfc6671e86',
  'political_assignment', '{"constituency_inec": "OREDO WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4df674cfc6671e86', 'prof_4df674cfc6671e86',
  'Iduseri Gabriel',
  'iduseri gabriel edo state assembly oredo west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Okunbor Nosayaba -- Orhionmwon I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4438ad8e80972180', 'Okunbor Nosayaba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4438ad8e80972180', 'ind_4438ad8e80972180', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okunbor Nosayaba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4438ad8e80972180', 'prof_4438ad8e80972180',
  'Member, Edo State House of Assembly (ORHIONMWON I)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4438ad8e80972180', 'ind_4438ad8e80972180', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4438ad8e80972180', 'ind_4438ad8e80972180', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4438ad8e80972180', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|orhionmwon i|2023',
  'insert', 'ind_4438ad8e80972180',
  'Unique: Edo Orhionmwon I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4438ad8e80972180', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4438ad8e80972180', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4438ad8e80972180', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_orhionmwon_i',
  'ind_4438ad8e80972180', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4438ad8e80972180', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Orhionmwon I', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4438ad8e80972180', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4438ad8e80972180',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4438ad8e80972180', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4438ad8e80972180',
  'political_assignment', '{"constituency_inec": "ORHIONMWON I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4438ad8e80972180', 'prof_4438ad8e80972180',
  'Okunbor Nosayaba',
  'okunbor nosayaba edo state assembly orhionmwon i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Ugiagbe Dumez Onaiwu -- Ovia North East I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9439b0e8ffc1c26d', 'Ugiagbe Dumez Onaiwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9439b0e8ffc1c26d', 'ind_9439b0e8ffc1c26d', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ugiagbe Dumez Onaiwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9439b0e8ffc1c26d', 'prof_9439b0e8ffc1c26d',
  'Member, Edo State House of Assembly (OVIA NORTH EAST I)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9439b0e8ffc1c26d', 'ind_9439b0e8ffc1c26d', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9439b0e8ffc1c26d', 'ind_9439b0e8ffc1c26d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9439b0e8ffc1c26d', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|ovia north east i|2023',
  'insert', 'ind_9439b0e8ffc1c26d',
  'Unique: Edo Ovia North East I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9439b0e8ffc1c26d', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_9439b0e8ffc1c26d', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9439b0e8ffc1c26d', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_ovia_north_east_i',
  'ind_9439b0e8ffc1c26d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9439b0e8ffc1c26d', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Ovia North East I', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9439b0e8ffc1c26d', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_9439b0e8ffc1c26d',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9439b0e8ffc1c26d', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_9439b0e8ffc1c26d',
  'political_assignment', '{"constituency_inec": "OVIA NORTH EAST I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9439b0e8ffc1c26d', 'prof_9439b0e8ffc1c26d',
  'Ugiagbe Dumez Onaiwu',
  'ugiagbe dumez onaiwu edo state assembly ovia north east i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Agheho Sunday -- Ovia South West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5dee89475ee72738', 'Agheho Sunday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5dee89475ee72738', 'ind_5dee89475ee72738', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Agheho Sunday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5dee89475ee72738', 'prof_5dee89475ee72738',
  'Member, Edo State House of Assembly (OVIA SOUTH WEST)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5dee89475ee72738', 'ind_5dee89475ee72738', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5dee89475ee72738', 'ind_5dee89475ee72738', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5dee89475ee72738', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|ovia south west|2023',
  'insert', 'ind_5dee89475ee72738',
  'Unique: Edo Ovia South West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5dee89475ee72738', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_5dee89475ee72738', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5dee89475ee72738', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_ovia_south_west',
  'ind_5dee89475ee72738', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5dee89475ee72738', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Ovia South West', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5dee89475ee72738', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_5dee89475ee72738',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5dee89475ee72738', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_5dee89475ee72738',
  'political_assignment', '{"constituency_inec": "OVIA SOUTH WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5dee89475ee72738', 'prof_5dee89475ee72738',
  'Agheho Sunday',
  'agheho sunday edo state assembly ovia south west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Okaka Eric, Allison -- Owan East (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e543d53d587dd07f', 'Okaka Eric, Allison',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e543d53d587dd07f', 'ind_e543d53d587dd07f', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okaka Eric, Allison', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e543d53d587dd07f', 'prof_e543d53d587dd07f',
  'Member, Edo State House of Assembly (OWAN EAST)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e543d53d587dd07f', 'ind_e543d53d587dd07f', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e543d53d587dd07f', 'ind_e543d53d587dd07f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e543d53d587dd07f', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|owan east|2023',
  'insert', 'ind_e543d53d587dd07f',
  'Unique: Edo Owan East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e543d53d587dd07f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_e543d53d587dd07f', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e543d53d587dd07f', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_owan_east',
  'ind_e543d53d587dd07f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e543d53d587dd07f', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Owan East', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e543d53d587dd07f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_e543d53d587dd07f',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e543d53d587dd07f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_e543d53d587dd07f',
  'political_assignment', '{"constituency_inec": "OWAN EAST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e543d53d587dd07f', 'prof_e543d53d587dd07f',
  'Okaka Eric, Allison',
  'okaka eric, allison edo state assembly owan east apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Ohio-Eziomo Michael, Imorhin -- Owan West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f8208d4084ca88a4', 'Ohio-Eziomo Michael, Imorhin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f8208d4084ca88a4', 'ind_f8208d4084ca88a4', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ohio-Eziomo Michael, Imorhin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f8208d4084ca88a4', 'prof_f8208d4084ca88a4',
  'Member, Edo State House of Assembly (OWAN WEST)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f8208d4084ca88a4', 'ind_f8208d4084ca88a4', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f8208d4084ca88a4', 'ind_f8208d4084ca88a4', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f8208d4084ca88a4', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|owan west|2023',
  'insert', 'ind_f8208d4084ca88a4',
  'Unique: Edo Owan West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f8208d4084ca88a4', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_f8208d4084ca88a4', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f8208d4084ca88a4', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_owan_west',
  'ind_f8208d4084ca88a4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f8208d4084ca88a4', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Owan West', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f8208d4084ca88a4', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_f8208d4084ca88a4',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f8208d4084ca88a4', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_f8208d4084ca88a4',
  'political_assignment', '{"constituency_inec": "OWAN WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f8208d4084ca88a4', 'prof_f8208d4084ca88a4',
  'Ohio-Eziomo Michael, Imorhin',
  'ohio-eziomo michael, imorhin edo state assembly owan west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Imafidon Augustin, Rotimi -- Uhunmwode (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d541b18d58610c3e', 'Imafidon Augustin, Rotimi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d541b18d58610c3e', 'ind_d541b18d58610c3e', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Imafidon Augustin, Rotimi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d541b18d58610c3e', 'prof_d541b18d58610c3e',
  'Member, Edo State House of Assembly (UHUNMWODE)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d541b18d58610c3e', 'ind_d541b18d58610c3e', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d541b18d58610c3e', 'ind_d541b18d58610c3e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d541b18d58610c3e', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|uhunmwode|2023',
  'insert', 'ind_d541b18d58610c3e',
  'Unique: Edo Uhunmwode seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d541b18d58610c3e', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_d541b18d58610c3e', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d541b18d58610c3e', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_uhunmwode',
  'ind_d541b18d58610c3e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d541b18d58610c3e', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Uhunmwode', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d541b18d58610c3e', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_d541b18d58610c3e',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d541b18d58610c3e', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_d541b18d58610c3e',
  'political_assignment', '{"constituency_inec": "UHUNMWODE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d541b18d58610c3e', 'prof_d541b18d58610c3e',
  'Imafidon Augustin, Rotimi',
  'imafidon augustin, rotimi edo state assembly uhunmwode apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Agbaje Emmanuel, Omoladun -- Akoko Edo II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cd4c03f19f63ba2d', 'Agbaje Emmanuel, Omoladun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cd4c03f19f63ba2d', 'ind_cd4c03f19f63ba2d', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Agbaje Emmanuel, Omoladun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cd4c03f19f63ba2d', 'prof_cd4c03f19f63ba2d',
  'Member, Edo State House of Assembly (AKOKO EDO II)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cd4c03f19f63ba2d', 'ind_cd4c03f19f63ba2d', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cd4c03f19f63ba2d', 'ind_cd4c03f19f63ba2d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cd4c03f19f63ba2d', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|akoko edo ii|2023',
  'insert', 'ind_cd4c03f19f63ba2d',
  'Unique: Edo Akoko Edo II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cd4c03f19f63ba2d', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_cd4c03f19f63ba2d', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cd4c03f19f63ba2d', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_akoko_edo_ii',
  'ind_cd4c03f19f63ba2d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cd4c03f19f63ba2d', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Akoko Edo II', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cd4c03f19f63ba2d', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_cd4c03f19f63ba2d',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cd4c03f19f63ba2d', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_cd4c03f19f63ba2d',
  'political_assignment', '{"constituency_inec": "AKOKO EDO II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cd4c03f19f63ba2d', 'prof_cd4c03f19f63ba2d',
  'Agbaje Emmanuel, Omoladun',
  'agbaje emmanuel, omoladun edo state assembly akoko edo ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Okojie Kenny, Kentimu -- Esan North East II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_93668b4fd26f487f', 'Okojie Kenny, Kentimu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_93668b4fd26f487f', 'ind_93668b4fd26f487f', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okojie Kenny, Kentimu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_93668b4fd26f487f', 'prof_93668b4fd26f487f',
  'Member, Edo State House of Assembly (ESAN NORTH EAST II)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_93668b4fd26f487f', 'ind_93668b4fd26f487f', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_93668b4fd26f487f', 'ind_93668b4fd26f487f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_93668b4fd26f487f', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|esan north east ii|2023',
  'insert', 'ind_93668b4fd26f487f',
  'Unique: Edo Esan North East II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_93668b4fd26f487f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_93668b4fd26f487f', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_93668b4fd26f487f', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_esan_north_east_ii',
  'ind_93668b4fd26f487f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_93668b4fd26f487f', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Esan North East II', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_93668b4fd26f487f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_93668b4fd26f487f',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_93668b4fd26f487f', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_93668b4fd26f487f',
  'political_assignment', '{"constituency_inec": "ESAN NORTH EAST II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_93668b4fd26f487f', 'prof_93668b4fd26f487f',
  'Okojie Kenny, Kentimu',
  'okojie kenny, kentimu edo state assembly esan north east ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Akokhia Abdulganiyu -- Etsako West II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9c5e00a9fdcb0067', 'Akokhia Abdulganiyu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9c5e00a9fdcb0067', 'ind_9c5e00a9fdcb0067', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akokhia Abdulganiyu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9c5e00a9fdcb0067', 'prof_9c5e00a9fdcb0067',
  'Member, Edo State House of Assembly (ETSAKO WEST II)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9c5e00a9fdcb0067', 'ind_9c5e00a9fdcb0067', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9c5e00a9fdcb0067', 'ind_9c5e00a9fdcb0067', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9c5e00a9fdcb0067', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|etsako west ii|2023',
  'insert', 'ind_9c5e00a9fdcb0067',
  'Unique: Edo Etsako West II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9c5e00a9fdcb0067', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_9c5e00a9fdcb0067', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9c5e00a9fdcb0067', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_etsako_west_ii',
  'ind_9c5e00a9fdcb0067', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9c5e00a9fdcb0067', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Etsako West II', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9c5e00a9fdcb0067', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_9c5e00a9fdcb0067',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9c5e00a9fdcb0067', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_9c5e00a9fdcb0067',
  'political_assignment', '{"constituency_inec": "ETSAKO WEST II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9c5e00a9fdcb0067', 'prof_9c5e00a9fdcb0067',
  'Akokhia Abdulganiyu',
  'akokhia abdulganiyu edo state assembly etsako west ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Ogbeiwi Ikponmwosa, Eti-Osa -- Orhionmwon II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b9b94558c67a159c', 'Ogbeiwi Ikponmwosa, Eti-Osa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b9b94558c67a159c', 'ind_b9b94558c67a159c', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogbeiwi Ikponmwosa, Eti-Osa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b9b94558c67a159c', 'prof_b9b94558c67a159c',
  'Member, Edo State House of Assembly (ORHIONMWON II)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b9b94558c67a159c', 'ind_b9b94558c67a159c', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b9b94558c67a159c', 'ind_b9b94558c67a159c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b9b94558c67a159c', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|orhionmwon ii|2023',
  'insert', 'ind_b9b94558c67a159c',
  'Unique: Edo Orhionmwon II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b9b94558c67a159c', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b9b94558c67a159c', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b9b94558c67a159c', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_orhionmwon_ii',
  'ind_b9b94558c67a159c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b9b94558c67a159c', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Orhionmwon II', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b9b94558c67a159c', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b9b94558c67a159c',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b9b94558c67a159c', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_b9b94558c67a159c',
  'political_assignment', '{"constituency_inec": "ORHIONMWON II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b9b94558c67a159c', 'prof_b9b94558c67a159c',
  'Ogbeiwi Ikponmwosa, Eti-Osa',
  'ogbeiwi ikponmwosa, eti-osa edo state assembly orhionmwon ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Uwadiae Vincent, Osas -- Ovia North East II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4feaa19d7984bec6', 'Uwadiae Vincent, Osas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4feaa19d7984bec6', 'ind_4feaa19d7984bec6', 'individual', 'place_state_edo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Uwadiae Vincent, Osas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4feaa19d7984bec6', 'prof_4feaa19d7984bec6',
  'Member, Edo State House of Assembly (OVIA NORTH EAST II)',
  'place_state_edo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4feaa19d7984bec6', 'ind_4feaa19d7984bec6', 'term_ng_edo_state_assembly_10th_2023_2027',
  'place_state_edo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4feaa19d7984bec6', 'ind_4feaa19d7984bec6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4feaa19d7984bec6', 'seed_run_s05_political_edo_roster_20260502', 'individual',
  'ng_state_assembly_member|edo|ovia north east ii|2023',
  'insert', 'ind_4feaa19d7984bec6',
  'Unique: Edo Ovia North East II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4feaa19d7984bec6', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4feaa19d7984bec6', 'seed_source_nigerianleaders_edo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4feaa19d7984bec6', 'seed_run_s05_political_edo_roster_20260502', 'seed_source_nigerianleaders_edo_assembly_20260502',
  'nl_edo_assembly_2023_ovia_north_east_ii',
  'ind_4feaa19d7984bec6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4feaa19d7984bec6', 'seed_run_s05_political_edo_roster_20260502',
  'Edo Ovia North East II', 'place_state_edo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4feaa19d7984bec6', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4feaa19d7984bec6',
  'seed_source_nigerianleaders_edo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4feaa19d7984bec6', 'seed_run_s05_political_edo_roster_20260502', 'individual', 'ind_4feaa19d7984bec6',
  'political_assignment', '{"constituency_inec": "OVIA NORTH EAST II", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/edo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4feaa19d7984bec6', 'prof_4feaa19d7984bec6',
  'Uwadiae Vincent, Osas',
  'uwadiae vincent, osas edo state assembly ovia north east ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_edo',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
