-- ============================================================
-- Migration 0534: Adamawa State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: Wikipedia – 2023 Adamawa State House of Assembly Election (Constituency Results)
-- Members seeded: 25/25
-- Party breakdown: APC:10, PDP:15
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_wikipedia_adamawa_assembly_20260502',
  'Wikipedia – 2023 Adamawa State House of Assembly Election (Constituency Results)',
  'wiki_scraped',
  'https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election',
  'editorial_verified',
  'Wikipedia data cross-referenced with INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_adamawa_roster_20260502', 'S05 Batch – Adamawa State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_adamawa_roster_20260502',
  'seed_run_s05_political_adamawa_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0534_political_adamawa_assembly_full_roster_seed.sql',
  NULL, 25,
  '25/25 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_adamawa_state_assembly_10th_2023_2027',
  'Adamawa State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_adamawa',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (25 of 25 seats) ──────────────────────────────────────

-- 01. Kate Raymond Mamuno -- DEMSA (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1f6fbec3eab170d8', 'Kate Raymond Mamuno',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1f6fbec3eab170d8', 'ind_1f6fbec3eab170d8', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kate Raymond Mamuno', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1f6fbec3eab170d8', 'prof_1f6fbec3eab170d8',
  'Member, Adamawa State House of Assembly (DEMSA)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1f6fbec3eab170d8', 'ind_1f6fbec3eab170d8', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1f6fbec3eab170d8', 'ind_1f6fbec3eab170d8', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1f6fbec3eab170d8', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|demsa|2023',
  'insert', 'ind_1f6fbec3eab170d8',
  'Unique: Adamawa DEMSA seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1f6fbec3eab170d8', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1f6fbec3eab170d8', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1f6fbec3eab170d8', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_demsa',
  'ind_1f6fbec3eab170d8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1f6fbec3eab170d8', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa DEMSA', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1f6fbec3eab170d8', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1f6fbec3eab170d8',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1f6fbec3eab170d8', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1f6fbec3eab170d8',
  'political_assignment', '{"constituency_inec": "DEMSA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1f6fbec3eab170d8', 'prof_1f6fbec3eab170d8',
  'Kate Raymond Mamuno',
  'kate raymond mamuno adamawa state assembly demsa pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Saidu Yahya Nuhu -- FURORE I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a37857fc8afca0fe', 'Saidu Yahya Nuhu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a37857fc8afca0fe', 'ind_a37857fc8afca0fe', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Saidu Yahya Nuhu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a37857fc8afca0fe', 'prof_a37857fc8afca0fe',
  'Member, Adamawa State House of Assembly (FURORE I)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a37857fc8afca0fe', 'ind_a37857fc8afca0fe', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a37857fc8afca0fe', 'ind_a37857fc8afca0fe', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a37857fc8afca0fe', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|furore i|2023',
  'insert', 'ind_a37857fc8afca0fe',
  'Unique: Adamawa FURORE I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a37857fc8afca0fe', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_a37857fc8afca0fe', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a37857fc8afca0fe', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_furore_i',
  'ind_a37857fc8afca0fe', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a37857fc8afca0fe', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa FURORE I', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a37857fc8afca0fe', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_a37857fc8afca0fe',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a37857fc8afca0fe', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_a37857fc8afca0fe',
  'political_assignment', '{"constituency_inec": "FURORE I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a37857fc8afca0fe', 'prof_a37857fc8afca0fe',
  'Saidu Yahya Nuhu',
  'saidu yahya nuhu adamawa state assembly furore i pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Abdulmalik Jauro Musa -- GANYE (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8b24f85737d8e382', 'Abdulmalik Jauro Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8b24f85737d8e382', 'ind_8b24f85737d8e382', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdulmalik Jauro Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8b24f85737d8e382', 'prof_8b24f85737d8e382',
  'Member, Adamawa State House of Assembly (GANYE)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8b24f85737d8e382', 'ind_8b24f85737d8e382', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8b24f85737d8e382', 'ind_8b24f85737d8e382', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8b24f85737d8e382', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|ganye|2023',
  'insert', 'ind_8b24f85737d8e382',
  'Unique: Adamawa GANYE seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8b24f85737d8e382', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_8b24f85737d8e382', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8b24f85737d8e382', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_ganye',
  'ind_8b24f85737d8e382', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8b24f85737d8e382', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa GANYE', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8b24f85737d8e382', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_8b24f85737d8e382',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8b24f85737d8e382', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_8b24f85737d8e382',
  'political_assignment', '{"constituency_inec": "GANYE", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8b24f85737d8e382', 'prof_8b24f85737d8e382',
  'Abdulmalik Jauro Musa',
  'abdulmalik jauro musa adamawa state assembly ganye apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Muhammad Mutawalli -- GIREI (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_61aaaca9fdc85ea6', 'Muhammad Mutawalli',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_61aaaca9fdc85ea6', 'ind_61aaaca9fdc85ea6', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Mutawalli', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_61aaaca9fdc85ea6', 'prof_61aaaca9fdc85ea6',
  'Member, Adamawa State House of Assembly (GIREI)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_61aaaca9fdc85ea6', 'ind_61aaaca9fdc85ea6', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_61aaaca9fdc85ea6', 'ind_61aaaca9fdc85ea6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_61aaaca9fdc85ea6', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|girei|2023',
  'insert', 'ind_61aaaca9fdc85ea6',
  'Unique: Adamawa GIREI seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_61aaaca9fdc85ea6', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_61aaaca9fdc85ea6', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_61aaaca9fdc85ea6', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_girei',
  'ind_61aaaca9fdc85ea6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_61aaaca9fdc85ea6', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa GIREI', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_61aaaca9fdc85ea6', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_61aaaca9fdc85ea6',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_61aaaca9fdc85ea6', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_61aaaca9fdc85ea6',
  'political_assignment', '{"constituency_inec": "GIREI", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_61aaaca9fdc85ea6', 'prof_61aaaca9fdc85ea6',
  'Muhammad Mutawalli',
  'muhammad mutawalli adamawa state assembly girei apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Japhet Kefas -- GOMBI (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_63d95bcc02c82840', 'Japhet Kefas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_63d95bcc02c82840', 'ind_63d95bcc02c82840', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Japhet Kefas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_63d95bcc02c82840', 'prof_63d95bcc02c82840',
  'Member, Adamawa State House of Assembly (GOMBI)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_63d95bcc02c82840', 'ind_63d95bcc02c82840', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_63d95bcc02c82840', 'ind_63d95bcc02c82840', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_63d95bcc02c82840', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|gombi|2023',
  'insert', 'ind_63d95bcc02c82840',
  'Unique: Adamawa GOMBI seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_63d95bcc02c82840', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_63d95bcc02c82840', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_63d95bcc02c82840', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_gombi',
  'ind_63d95bcc02c82840', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_63d95bcc02c82840', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa GOMBI', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_63d95bcc02c82840', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_63d95bcc02c82840',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_63d95bcc02c82840', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_63d95bcc02c82840',
  'political_assignment', '{"constituency_inec": "GOMBI", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_63d95bcc02c82840', 'prof_63d95bcc02c82840',
  'Japhet Kefas',
  'japhet kefas adamawa state assembly gombi pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Adwawa Donglock -- GUYUK (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_aba26db85a145793', 'Adwawa Donglock',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_aba26db85a145793', 'ind_aba26db85a145793', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adwawa Donglock', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_aba26db85a145793', 'prof_aba26db85a145793',
  'Member, Adamawa State House of Assembly (GUYUK)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_aba26db85a145793', 'ind_aba26db85a145793', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_aba26db85a145793', 'ind_aba26db85a145793', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_aba26db85a145793', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|guyuk|2023',
  'insert', 'ind_aba26db85a145793',
  'Unique: Adamawa GUYUK seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_aba26db85a145793', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_aba26db85a145793', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_aba26db85a145793', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_guyuk',
  'ind_aba26db85a145793', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_aba26db85a145793', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa GUYUK', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_aba26db85a145793', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_aba26db85a145793',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_aba26db85a145793', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_aba26db85a145793',
  'political_assignment', '{"constituency_inec": "GUYUK", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_aba26db85a145793', 'prof_aba26db85a145793',
  'Adwawa Donglock',
  'adwawa donglock adamawa state assembly guyuk pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Wesley Bathiya -- HONG II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_94ebb5eb1e5d8263', 'Wesley Bathiya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_94ebb5eb1e5d8263', 'ind_94ebb5eb1e5d8263', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Wesley Bathiya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_94ebb5eb1e5d8263', 'prof_94ebb5eb1e5d8263',
  'Member, Adamawa State House of Assembly (HONG II)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_94ebb5eb1e5d8263', 'ind_94ebb5eb1e5d8263', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_94ebb5eb1e5d8263', 'ind_94ebb5eb1e5d8263', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_94ebb5eb1e5d8263', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|hong ii|2023',
  'insert', 'ind_94ebb5eb1e5d8263',
  'Unique: Adamawa HONG II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_94ebb5eb1e5d8263', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_94ebb5eb1e5d8263', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_94ebb5eb1e5d8263', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_hong_ii',
  'ind_94ebb5eb1e5d8263', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_94ebb5eb1e5d8263', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa HONG II', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_94ebb5eb1e5d8263', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_94ebb5eb1e5d8263',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_94ebb5eb1e5d8263', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_94ebb5eb1e5d8263',
  'political_assignment', '{"constituency_inec": "HONG II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_94ebb5eb1e5d8263', 'prof_94ebb5eb1e5d8263',
  'Wesley Bathiya',
  'wesley bathiya adamawa state assembly hong ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Mohammed Buba Jijiwa -- JADA II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_08d4302000524499', 'Mohammed Buba Jijiwa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_08d4302000524499', 'ind_08d4302000524499', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Buba Jijiwa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_08d4302000524499', 'prof_08d4302000524499',
  'Member, Adamawa State House of Assembly (JADA II)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_08d4302000524499', 'ind_08d4302000524499', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_08d4302000524499', 'ind_08d4302000524499', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_08d4302000524499', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|jada ii|2023',
  'insert', 'ind_08d4302000524499',
  'Unique: Adamawa JADA II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_08d4302000524499', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_08d4302000524499', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_08d4302000524499', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_jada_ii',
  'ind_08d4302000524499', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_08d4302000524499', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa JADA II', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_08d4302000524499', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_08d4302000524499',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_08d4302000524499', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_08d4302000524499',
  'political_assignment', '{"constituency_inec": "JADA II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_08d4302000524499', 'prof_08d4302000524499',
  'Mohammed Buba Jijiwa',
  'mohammed buba jijiwa adamawa state assembly jada ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Myandasa Bauna -- LAMURDE (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b51cef15c6cc3ea9', 'Myandasa Bauna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b51cef15c6cc3ea9', 'ind_b51cef15c6cc3ea9', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Myandasa Bauna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b51cef15c6cc3ea9', 'prof_b51cef15c6cc3ea9',
  'Member, Adamawa State House of Assembly (LAMURDE)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b51cef15c6cc3ea9', 'ind_b51cef15c6cc3ea9', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b51cef15c6cc3ea9', 'ind_b51cef15c6cc3ea9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b51cef15c6cc3ea9', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|lamurde|2023',
  'insert', 'ind_b51cef15c6cc3ea9',
  'Unique: Adamawa LAMURDE seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b51cef15c6cc3ea9', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_b51cef15c6cc3ea9', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b51cef15c6cc3ea9', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_lamurde',
  'ind_b51cef15c6cc3ea9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b51cef15c6cc3ea9', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa LAMURDE', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b51cef15c6cc3ea9', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_b51cef15c6cc3ea9',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b51cef15c6cc3ea9', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_b51cef15c6cc3ea9',
  'political_assignment', '{"constituency_inec": "LAMURDE", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b51cef15c6cc3ea9', 'prof_b51cef15c6cc3ea9',
  'Myandasa Bauna',
  'myandasa bauna adamawa state assembly lamurde pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Abdullahi Ahmadu -- JADA I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_62809f57b46d0683', 'Abdullahi Ahmadu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_62809f57b46d0683', 'ind_62809f57b46d0683', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Ahmadu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_62809f57b46d0683', 'prof_62809f57b46d0683',
  'Member, Adamawa State House of Assembly (JADA I)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_62809f57b46d0683', 'ind_62809f57b46d0683', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_62809f57b46d0683', 'ind_62809f57b46d0683', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_62809f57b46d0683', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|jada i|2023',
  'insert', 'ind_62809f57b46d0683',
  'Unique: Adamawa JADA I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_62809f57b46d0683', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_62809f57b46d0683', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_62809f57b46d0683', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_jada_i',
  'ind_62809f57b46d0683', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_62809f57b46d0683', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa JADA I', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_62809f57b46d0683', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_62809f57b46d0683',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_62809f57b46d0683', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_62809f57b46d0683',
  'political_assignment', '{"constituency_inec": "JADA I", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_62809f57b46d0683', 'prof_62809f57b46d0683',
  'Abdullahi Ahmadu',
  'abdullahi ahmadu adamawa state assembly jada i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Haruna Jilantikiri -- MADAGALI (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fdb3b4e3000c4bbc', 'Haruna Jilantikiri',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fdb3b4e3000c4bbc', 'ind_fdb3b4e3000c4bbc', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Haruna Jilantikiri', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fdb3b4e3000c4bbc', 'prof_fdb3b4e3000c4bbc',
  'Member, Adamawa State House of Assembly (MADAGALI)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fdb3b4e3000c4bbc', 'ind_fdb3b4e3000c4bbc', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fdb3b4e3000c4bbc', 'ind_fdb3b4e3000c4bbc', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fdb3b4e3000c4bbc', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|madagali|2023',
  'insert', 'ind_fdb3b4e3000c4bbc',
  'Unique: Adamawa MADAGALI seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fdb3b4e3000c4bbc', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_fdb3b4e3000c4bbc', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fdb3b4e3000c4bbc', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_madagali',
  'ind_fdb3b4e3000c4bbc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fdb3b4e3000c4bbc', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa MADAGALI', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fdb3b4e3000c4bbc', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_fdb3b4e3000c4bbc',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fdb3b4e3000c4bbc', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_fdb3b4e3000c4bbc',
  'political_assignment', '{"constituency_inec": "MADAGALI", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fdb3b4e3000c4bbc', 'prof_fdb3b4e3000c4bbc',
  'Haruna Jilantikiri',
  'haruna jilantikiri adamawa state assembly madagali pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Isa Yahaya -- MAIHA (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1c6d75029ce79349', 'Isa Yahaya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1c6d75029ce79349', 'ind_1c6d75029ce79349', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Isa Yahaya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1c6d75029ce79349', 'prof_1c6d75029ce79349',
  'Member, Adamawa State House of Assembly (MAIHA)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1c6d75029ce79349', 'ind_1c6d75029ce79349', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1c6d75029ce79349', 'ind_1c6d75029ce79349', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1c6d75029ce79349', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|maiha|2023',
  'insert', 'ind_1c6d75029ce79349',
  'Unique: Adamawa MAIHA seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1c6d75029ce79349', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1c6d75029ce79349', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1c6d75029ce79349', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_maiha',
  'ind_1c6d75029ce79349', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1c6d75029ce79349', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa MAIHA', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1c6d75029ce79349', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1c6d75029ce79349',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1c6d75029ce79349', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1c6d75029ce79349',
  'political_assignment', '{"constituency_inec": "MAIHA", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1c6d75029ce79349', 'prof_1c6d75029ce79349',
  'Isa Yahaya',
  'isa yahaya adamawa state assembly maiha apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Ibrahim Musa -- MAYO-BELWA II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ba72aa1d8a4e9281', 'Ibrahim Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ba72aa1d8a4e9281', 'ind_ba72aa1d8a4e9281', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ba72aa1d8a4e9281', 'prof_ba72aa1d8a4e9281',
  'Member, Adamawa State House of Assembly (MAYO-BELWA II)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ba72aa1d8a4e9281', 'ind_ba72aa1d8a4e9281', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ba72aa1d8a4e9281', 'ind_ba72aa1d8a4e9281', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ba72aa1d8a4e9281', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|mayo belwa ii|2023',
  'insert', 'ind_ba72aa1d8a4e9281',
  'Unique: Adamawa MAYO-BELWA II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ba72aa1d8a4e9281', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_ba72aa1d8a4e9281', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ba72aa1d8a4e9281', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_mayo_belwa_ii',
  'ind_ba72aa1d8a4e9281', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ba72aa1d8a4e9281', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa MAYO-BELWA II', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ba72aa1d8a4e9281', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_ba72aa1d8a4e9281',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ba72aa1d8a4e9281', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_ba72aa1d8a4e9281',
  'political_assignment', '{"constituency_inec": "MAYO-BELWA II", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ba72aa1d8a4e9281', 'prof_ba72aa1d8a4e9281',
  'Ibrahim Musa',
  'ibrahim musa adamawa state assembly mayo belwa ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Luka Danbaba -- MICHIKA (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_64ce7b268a98b35e', 'Luka Danbaba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_64ce7b268a98b35e', 'ind_64ce7b268a98b35e', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Luka Danbaba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_64ce7b268a98b35e', 'prof_64ce7b268a98b35e',
  'Member, Adamawa State House of Assembly (MICHIKA)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_64ce7b268a98b35e', 'ind_64ce7b268a98b35e', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_64ce7b268a98b35e', 'ind_64ce7b268a98b35e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_64ce7b268a98b35e', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|michika|2023',
  'insert', 'ind_64ce7b268a98b35e',
  'Unique: Adamawa MICHIKA seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_64ce7b268a98b35e', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_64ce7b268a98b35e', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_64ce7b268a98b35e', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_michika',
  'ind_64ce7b268a98b35e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_64ce7b268a98b35e', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa MICHIKA', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_64ce7b268a98b35e', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_64ce7b268a98b35e',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_64ce7b268a98b35e', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_64ce7b268a98b35e',
  'political_assignment', '{"constituency_inec": "MICHIKA", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_64ce7b268a98b35e', 'prof_64ce7b268a98b35e',
  'Luka Danbaba',
  'luka danbaba adamawa state assembly michika apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Ishaka Yusuf -- MUBI NORTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_60c2b3d30a5e1fba', 'Ishaka Yusuf',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_60c2b3d30a5e1fba', 'ind_60c2b3d30a5e1fba', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ishaka Yusuf', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_60c2b3d30a5e1fba', 'prof_60c2b3d30a5e1fba',
  'Member, Adamawa State House of Assembly (MUBI NORTH)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_60c2b3d30a5e1fba', 'ind_60c2b3d30a5e1fba', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_60c2b3d30a5e1fba', 'ind_60c2b3d30a5e1fba', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_60c2b3d30a5e1fba', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|mubi north|2023',
  'insert', 'ind_60c2b3d30a5e1fba',
  'Unique: Adamawa MUBI NORTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_60c2b3d30a5e1fba', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_60c2b3d30a5e1fba', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_60c2b3d30a5e1fba', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_mubi_north',
  'ind_60c2b3d30a5e1fba', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_60c2b3d30a5e1fba', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa MUBI NORTH', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_60c2b3d30a5e1fba', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_60c2b3d30a5e1fba',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_60c2b3d30a5e1fba', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_60c2b3d30a5e1fba',
  'political_assignment', '{"constituency_inec": "MUBI NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_60c2b3d30a5e1fba', 'prof_60c2b3d30a5e1fba',
  'Ishaka Yusuf',
  'ishaka yusuf adamawa state assembly mubi north pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Musa Umar Bororo -- MUBI SOUTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1e7f54684db9273b', 'Musa Umar Bororo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1e7f54684db9273b', 'ind_1e7f54684db9273b', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Umar Bororo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1e7f54684db9273b', 'prof_1e7f54684db9273b',
  'Member, Adamawa State House of Assembly (MUBI SOUTH)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1e7f54684db9273b', 'ind_1e7f54684db9273b', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1e7f54684db9273b', 'ind_1e7f54684db9273b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1e7f54684db9273b', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|mubi south|2023',
  'insert', 'ind_1e7f54684db9273b',
  'Unique: Adamawa MUBI SOUTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1e7f54684db9273b', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1e7f54684db9273b', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1e7f54684db9273b', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_mubi_south',
  'ind_1e7f54684db9273b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1e7f54684db9273b', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa MUBI SOUTH', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1e7f54684db9273b', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1e7f54684db9273b',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1e7f54684db9273b', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1e7f54684db9273b',
  'political_assignment', '{"constituency_inec": "MUBI SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1e7f54684db9273b', 'prof_1e7f54684db9273b',
  'Musa Umar Bororo',
  'musa umar bororo adamawa state assembly mubi south pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Umar Nashon Gubi -- MAYO-BELWA I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b28f4ac1cb5f0ca3', 'Umar Nashon Gubi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b28f4ac1cb5f0ca3', 'ind_b28f4ac1cb5f0ca3', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umar Nashon Gubi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b28f4ac1cb5f0ca3', 'prof_b28f4ac1cb5f0ca3',
  'Member, Adamawa State House of Assembly (MAYO-BELWA I)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b28f4ac1cb5f0ca3', 'ind_b28f4ac1cb5f0ca3', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b28f4ac1cb5f0ca3', 'ind_b28f4ac1cb5f0ca3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b28f4ac1cb5f0ca3', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|mayo belwa i|2023',
  'insert', 'ind_b28f4ac1cb5f0ca3',
  'Unique: Adamawa MAYO-BELWA I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b28f4ac1cb5f0ca3', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_b28f4ac1cb5f0ca3', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b28f4ac1cb5f0ca3', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_mayo_belwa_i',
  'ind_b28f4ac1cb5f0ca3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b28f4ac1cb5f0ca3', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa MAYO-BELWA I', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b28f4ac1cb5f0ca3', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_b28f4ac1cb5f0ca3',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b28f4ac1cb5f0ca3', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_b28f4ac1cb5f0ca3',
  'political_assignment', '{"constituency_inec": "MAYO-BELWA I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b28f4ac1cb5f0ca3', 'prof_b28f4ac1cb5f0ca3',
  'Umar Nashon Gubi',
  'umar nashon gubi adamawa state assembly mayo belwa i pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Pwamakeno Mackondo -- NUMAN (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_dd664333aee581bc', 'Pwamakeno Mackondo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_dd664333aee581bc', 'ind_dd664333aee581bc', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Pwamakeno Mackondo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_dd664333aee581bc', 'prof_dd664333aee581bc',
  'Member, Adamawa State House of Assembly (NUMAN)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_dd664333aee581bc', 'ind_dd664333aee581bc', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_dd664333aee581bc', 'ind_dd664333aee581bc', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_dd664333aee581bc', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|numan|2023',
  'insert', 'ind_dd664333aee581bc',
  'Unique: Adamawa NUMAN seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_dd664333aee581bc', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_dd664333aee581bc', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_dd664333aee581bc', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_numan',
  'ind_dd664333aee581bc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_dd664333aee581bc', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa NUMAN', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_dd664333aee581bc', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_dd664333aee581bc',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_dd664333aee581bc', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_dd664333aee581bc',
  'political_assignment', '{"constituency_inec": "NUMAN", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_dd664333aee581bc', 'prof_dd664333aee581bc',
  'Pwamakeno Mackondo',
  'pwamakeno mackondo adamawa state assembly numan pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Abubakar Isa -- SHELLENG (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d1ea61bef92e2e27', 'Abubakar Isa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d1ea61bef92e2e27', 'ind_d1ea61bef92e2e27', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Isa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d1ea61bef92e2e27', 'prof_d1ea61bef92e2e27',
  'Member, Adamawa State House of Assembly (SHELLENG)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d1ea61bef92e2e27', 'ind_d1ea61bef92e2e27', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d1ea61bef92e2e27', 'ind_d1ea61bef92e2e27', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d1ea61bef92e2e27', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|shelleng|2023',
  'insert', 'ind_d1ea61bef92e2e27',
  'Unique: Adamawa SHELLENG seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d1ea61bef92e2e27', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_d1ea61bef92e2e27', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d1ea61bef92e2e27', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_shelleng',
  'ind_d1ea61bef92e2e27', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d1ea61bef92e2e27', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa SHELLENG', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d1ea61bef92e2e27', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_d1ea61bef92e2e27',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d1ea61bef92e2e27', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_d1ea61bef92e2e27',
  'political_assignment', '{"constituency_inec": "SHELLENG", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d1ea61bef92e2e27', 'prof_d1ea61bef92e2e27',
  'Abubakar Isa',
  'abubakar isa adamawa state assembly shelleng apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Emmanuel Kefas -- SONG (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1d6968f2e5d5d894', 'Emmanuel Kefas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1d6968f2e5d5d894', 'ind_1d6968f2e5d5d894', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emmanuel Kefas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1d6968f2e5d5d894', 'prof_1d6968f2e5d5d894',
  'Member, Adamawa State House of Assembly (SONG)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1d6968f2e5d5d894', 'ind_1d6968f2e5d5d894', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1d6968f2e5d5d894', 'ind_1d6968f2e5d5d894', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1d6968f2e5d5d894', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|song|2023',
  'insert', 'ind_1d6968f2e5d5d894',
  'Unique: Adamawa SONG seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1d6968f2e5d5d894', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1d6968f2e5d5d894', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1d6968f2e5d5d894', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_song',
  'ind_1d6968f2e5d5d894', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1d6968f2e5d5d894', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa SONG', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1d6968f2e5d5d894', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1d6968f2e5d5d894',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1d6968f2e5d5d894', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_1d6968f2e5d5d894',
  'political_assignment', '{"constituency_inec": "SONG", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1d6968f2e5d5d894', 'prof_1d6968f2e5d5d894',
  'Emmanuel Kefas',
  'emmanuel kefas adamawa state assembly song pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Abdullahi Umar Nyako -- TOUNGO (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2200b5668349310e', 'Abdullahi Umar Nyako',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2200b5668349310e', 'ind_2200b5668349310e', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Umar Nyako', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2200b5668349310e', 'prof_2200b5668349310e',
  'Member, Adamawa State House of Assembly (TOUNGO)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2200b5668349310e', 'ind_2200b5668349310e', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2200b5668349310e', 'ind_2200b5668349310e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2200b5668349310e', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|toungo|2023',
  'insert', 'ind_2200b5668349310e',
  'Unique: Adamawa TOUNGO seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2200b5668349310e', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_2200b5668349310e', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2200b5668349310e', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_toungo',
  'ind_2200b5668349310e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2200b5668349310e', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa TOUNGO', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2200b5668349310e', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_2200b5668349310e',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2200b5668349310e', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_2200b5668349310e',
  'political_assignment', '{"constituency_inec": "TOUNGO", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2200b5668349310e', 'prof_2200b5668349310e',
  'Abdullahi Umar Nyako',
  'abdullahi umar nyako adamawa state assembly toungo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Hyellapaburi John Adum -- HONG I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d5d9c380bdccff2a', 'Hyellapaburi John Adum',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d5d9c380bdccff2a', 'ind_d5d9c380bdccff2a', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hyellapaburi John Adum', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d5d9c380bdccff2a', 'prof_d5d9c380bdccff2a',
  'Member, Adamawa State House of Assembly (HONG I)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d5d9c380bdccff2a', 'ind_d5d9c380bdccff2a', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d5d9c380bdccff2a', 'ind_d5d9c380bdccff2a', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d5d9c380bdccff2a', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|hong i|2023',
  'insert', 'ind_d5d9c380bdccff2a',
  'Unique: Adamawa HONG I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d5d9c380bdccff2a', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_d5d9c380bdccff2a', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d5d9c380bdccff2a', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_hong_i',
  'ind_d5d9c380bdccff2a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d5d9c380bdccff2a', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa HONG I', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d5d9c380bdccff2a', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_d5d9c380bdccff2a',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d5d9c380bdccff2a', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_d5d9c380bdccff2a',
  'political_assignment', '{"constituency_inec": "HONG I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d5d9c380bdccff2a', 'prof_d5d9c380bdccff2a',
  'Hyellapaburi John Adum',
  'hyellapaburi john adum adamawa state assembly hong i pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Abdullahi Umar Yapak -- FUFORE II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_33b2ef25f851b8ea', 'Abdullahi Umar Yapak',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_33b2ef25f851b8ea', 'ind_33b2ef25f851b8ea', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Umar Yapak', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_33b2ef25f851b8ea', 'prof_33b2ef25f851b8ea',
  'Member, Adamawa State House of Assembly (FUFORE II)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_33b2ef25f851b8ea', 'ind_33b2ef25f851b8ea', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_33b2ef25f851b8ea', 'ind_33b2ef25f851b8ea', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_33b2ef25f851b8ea', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|fufore ii|2023',
  'insert', 'ind_33b2ef25f851b8ea',
  'Unique: Adamawa FUFORE II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_33b2ef25f851b8ea', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_33b2ef25f851b8ea', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_33b2ef25f851b8ea', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_fufore_ii',
  'ind_33b2ef25f851b8ea', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_33b2ef25f851b8ea', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa FUFORE II', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_33b2ef25f851b8ea', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_33b2ef25f851b8ea',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_33b2ef25f851b8ea', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_33b2ef25f851b8ea',
  'political_assignment', '{"constituency_inec": "FUFORE II", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_33b2ef25f851b8ea', 'prof_33b2ef25f851b8ea',
  'Abdullahi Umar Yapak',
  'abdullahi umar yapak adamawa state assembly fufore ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Hamidu Sajo -- YOLA NORTH (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_30f03a688467f64c', 'Hamidu Sajo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_30f03a688467f64c', 'ind_30f03a688467f64c', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hamidu Sajo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_30f03a688467f64c', 'prof_30f03a688467f64c',
  'Member, Adamawa State House of Assembly (YOLA NORTH)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_30f03a688467f64c', 'ind_30f03a688467f64c', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_30f03a688467f64c', 'ind_30f03a688467f64c', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_30f03a688467f64c', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|yola north|2023',
  'insert', 'ind_30f03a688467f64c',
  'Unique: Adamawa YOLA NORTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_30f03a688467f64c', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_30f03a688467f64c', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_30f03a688467f64c', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_yola_north',
  'ind_30f03a688467f64c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_30f03a688467f64c', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa YOLA NORTH', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_30f03a688467f64c', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_30f03a688467f64c',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_30f03a688467f64c', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_30f03a688467f64c',
  'political_assignment', '{"constituency_inec": "YOLA NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_30f03a688467f64c', 'prof_30f03a688467f64c',
  'Hamidu Sajo',
  'hamidu sajo adamawa state assembly yola north pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Kabiru Mijinyawa -- YOLA SOUTH (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6851a37f7e8ae1b2', 'Kabiru Mijinyawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6851a37f7e8ae1b2', 'ind_6851a37f7e8ae1b2', 'individual', 'place_state_adamawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kabiru Mijinyawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6851a37f7e8ae1b2', 'prof_6851a37f7e8ae1b2',
  'Member, Adamawa State House of Assembly (YOLA SOUTH)',
  'place_state_adamawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6851a37f7e8ae1b2', 'ind_6851a37f7e8ae1b2', 'term_ng_adamawa_state_assembly_10th_2023_2027',
  'place_state_adamawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6851a37f7e8ae1b2', 'ind_6851a37f7e8ae1b2', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6851a37f7e8ae1b2', 'seed_run_s05_political_adamawa_roster_20260502', 'individual',
  'ng_state_assembly_member|adamawa|yola south|2023',
  'insert', 'ind_6851a37f7e8ae1b2',
  'Unique: Adamawa YOLA SOUTH seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6851a37f7e8ae1b2', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_6851a37f7e8ae1b2', 'seed_source_wikipedia_adamawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6851a37f7e8ae1b2', 'seed_run_s05_political_adamawa_roster_20260502', 'seed_source_wikipedia_adamawa_assembly_20260502',
  'adamawa_assembly_2023_yola_south',
  'ind_6851a37f7e8ae1b2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6851a37f7e8ae1b2', 'seed_run_s05_political_adamawa_roster_20260502',
  'Adamawa YOLA SOUTH', 'place_state_adamawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6851a37f7e8ae1b2', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_6851a37f7e8ae1b2',
  'seed_source_wikipedia_adamawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6851a37f7e8ae1b2', 'seed_run_s05_political_adamawa_roster_20260502', 'individual', 'ind_6851a37f7e8ae1b2',
  'political_assignment', '{"constituency_inec": "YOLA SOUTH", "party_abbrev": "APC", "position": "Member", "source_url": "https://en.wikipedia.org/wiki/2023_Adamawa_State_House_of_Assembly_election"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6851a37f7e8ae1b2', 'prof_6851a37f7e8ae1b2',
  'Kabiru Mijinyawa',
  'kabiru mijinyawa adamawa state assembly yola south apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_adamawa',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
