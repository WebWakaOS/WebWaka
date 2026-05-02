-- ============================================================
-- Migration 0521: Kogi State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Kogi State House of Assembly Members
-- Members seeded: 25/25
-- Party breakdown: ADC:12, APC:7, AA:5, PDP:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_kogi_assembly_20260502',
  'NigerianLeaders – Complete List of Kogi State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/kogi-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_kogi_roster_20260502', 'S05 Batch – Kogi State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_kogi_roster_20260502',
  'seed_run_s05_political_kogi_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0521_political_kogi_assembly_full_roster_seed.sql',
  NULL, 25,
  '25/25 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_kogi_state_assembly_10th_2023_2027',
  'Kogi State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_kogi',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (25 of 25 seats) ──────────────────────────────────────

-- 01. Suleiman Siyaka Onimisi -- Adavi (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_008bdc400f0e6459', 'Suleiman Siyaka Onimisi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_008bdc400f0e6459', 'ind_008bdc400f0e6459', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Siyaka Onimisi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_008bdc400f0e6459', 'prof_008bdc400f0e6459',
  'Member, Kogi State House of Assembly (ADAVI)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_008bdc400f0e6459', 'ind_008bdc400f0e6459', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_008bdc400f0e6459', 'ind_008bdc400f0e6459', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_008bdc400f0e6459', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|adavi|2023',
  'insert', 'ind_008bdc400f0e6459',
  'Unique: Kogi Adavi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_008bdc400f0e6459', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_008bdc400f0e6459', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_008bdc400f0e6459', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_adavi',
  'ind_008bdc400f0e6459', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_008bdc400f0e6459', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Adavi', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_008bdc400f0e6459', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_008bdc400f0e6459',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_008bdc400f0e6459', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_008bdc400f0e6459',
  'political_assignment', '{"constituency_inec": "ADAVI", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_008bdc400f0e6459', 'prof_008bdc400f0e6459',
  'Suleiman Siyaka Onimisi',
  'suleiman siyaka onimisi kogi state assembly adavi aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Ogejah Ndanusa Kabiru -- Ajaokuta (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ac6d026e5ff96870', 'Ogejah Ndanusa Kabiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ac6d026e5ff96870', 'ind_ac6d026e5ff96870', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogejah Ndanusa Kabiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ac6d026e5ff96870', 'prof_ac6d026e5ff96870',
  'Member, Kogi State House of Assembly (AJAOKUTA)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ac6d026e5ff96870', 'ind_ac6d026e5ff96870', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ac6d026e5ff96870', 'ind_ac6d026e5ff96870', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ac6d026e5ff96870', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|ajaokuta|2023',
  'insert', 'ind_ac6d026e5ff96870',
  'Unique: Kogi Ajaokuta seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ac6d026e5ff96870', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_ac6d026e5ff96870', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ac6d026e5ff96870', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_ajaokuta',
  'ind_ac6d026e5ff96870', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ac6d026e5ff96870', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Ajaokuta', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ac6d026e5ff96870', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_ac6d026e5ff96870',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ac6d026e5ff96870', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_ac6d026e5ff96870',
  'political_assignment', '{"constituency_inec": "AJAOKUTA", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ac6d026e5ff96870', 'prof_ac6d026e5ff96870',
  'Ogejah Ndanusa Kabiru',
  'ogejah ndanusa kabiru kogi state assembly ajaokuta adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Akpa John Idoko -- Ankpa I (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d4d3b152eb03a5fc', 'Akpa John Idoko',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d4d3b152eb03a5fc', 'ind_d4d3b152eb03a5fc', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akpa John Idoko', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d4d3b152eb03a5fc', 'prof_d4d3b152eb03a5fc',
  'Member, Kogi State House of Assembly (ANKPA I)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d4d3b152eb03a5fc', 'ind_d4d3b152eb03a5fc', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d4d3b152eb03a5fc', 'ind_d4d3b152eb03a5fc', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d4d3b152eb03a5fc', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|ankpa i|2023',
  'insert', 'ind_d4d3b152eb03a5fc',
  'Unique: Kogi Ankpa I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d4d3b152eb03a5fc', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_d4d3b152eb03a5fc', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d4d3b152eb03a5fc', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_ankpa_i',
  'ind_d4d3b152eb03a5fc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d4d3b152eb03a5fc', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Ankpa I', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d4d3b152eb03a5fc', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_d4d3b152eb03a5fc',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d4d3b152eb03a5fc', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_d4d3b152eb03a5fc',
  'political_assignment', '{"constituency_inec": "ANKPA I", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d4d3b152eb03a5fc', 'prof_d4d3b152eb03a5fc',
  'Akpa John Idoko',
  'akpa john idoko kogi state assembly ankpa i adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Mohammed Abdulmutalib -- Bassa (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5964104051e265f2', 'Mohammed Abdulmutalib',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5964104051e265f2', 'ind_5964104051e265f2', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Abdulmutalib', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5964104051e265f2', 'prof_5964104051e265f2',
  'Member, Kogi State House of Assembly (BASSA)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5964104051e265f2', 'ind_5964104051e265f2', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5964104051e265f2', 'ind_5964104051e265f2', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5964104051e265f2', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|bassa|2023',
  'insert', 'ind_5964104051e265f2',
  'Unique: Kogi Bassa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5964104051e265f2', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_5964104051e265f2', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5964104051e265f2', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_bassa',
  'ind_5964104051e265f2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5964104051e265f2', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Bassa', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5964104051e265f2', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_5964104051e265f2',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5964104051e265f2', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_5964104051e265f2',
  'political_assignment', '{"constituency_inec": "BASSA", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5964104051e265f2', 'prof_5964104051e265f2',
  'Mohammed Abdulmutalib',
  'mohammed abdulmutalib kogi state assembly bassa aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Paul Monday -- Dekina/Biraidu (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_efbf3250e6197108', 'Paul Monday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_efbf3250e6197108', 'ind_efbf3250e6197108', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Paul Monday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_efbf3250e6197108', 'prof_efbf3250e6197108',
  'Member, Kogi State House of Assembly (DEKINA/BIRAIDU)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_efbf3250e6197108', 'ind_efbf3250e6197108', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_efbf3250e6197108', 'ind_efbf3250e6197108', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_efbf3250e6197108', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|dekina/biraidu|2023',
  'insert', 'ind_efbf3250e6197108',
  'Unique: Kogi Dekina/Biraidu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_efbf3250e6197108', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_efbf3250e6197108', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_efbf3250e6197108', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_dekina/biraidu',
  'ind_efbf3250e6197108', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_efbf3250e6197108', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Dekina/Biraidu', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_efbf3250e6197108', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_efbf3250e6197108',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_efbf3250e6197108', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_efbf3250e6197108',
  'political_assignment', '{"constituency_inec": "DEKINA/BIRAIDU", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_efbf3250e6197108', 'prof_efbf3250e6197108',
  'Paul Monday',
  'paul monday kogi state assembly dekina/biraidu adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Paul Enema -- Okura (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_70129549bd925796', 'Paul Enema',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_70129549bd925796', 'ind_70129549bd925796', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Paul Enema', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_70129549bd925796', 'prof_70129549bd925796',
  'Member, Kogi State House of Assembly (OKURA)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_70129549bd925796', 'ind_70129549bd925796', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_70129549bd925796', 'ind_70129549bd925796', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_70129549bd925796', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|okura|2023',
  'insert', 'ind_70129549bd925796',
  'Unique: Kogi Okura seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_70129549bd925796', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_70129549bd925796', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_70129549bd925796', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_okura',
  'ind_70129549bd925796', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_70129549bd925796', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Okura', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_70129549bd925796', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_70129549bd925796',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_70129549bd925796', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_70129549bd925796',
  'political_assignment', '{"constituency_inec": "OKURA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_70129549bd925796', 'prof_70129549bd925796',
  'Paul Enema',
  'paul enema kogi state assembly okura apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Comfort Ojoma Nwuchiola -- Ibaji (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5cedc470dbafe8d3', 'Comfort Ojoma Nwuchiola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5cedc470dbafe8d3', 'ind_5cedc470dbafe8d3', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Comfort Ojoma Nwuchiola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5cedc470dbafe8d3', 'prof_5cedc470dbafe8d3',
  'Member, Kogi State House of Assembly (IBAJI)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5cedc470dbafe8d3', 'ind_5cedc470dbafe8d3', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5cedc470dbafe8d3', 'ind_5cedc470dbafe8d3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5cedc470dbafe8d3', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|ibaji|2023',
  'insert', 'ind_5cedc470dbafe8d3',
  'Unique: Kogi Ibaji seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5cedc470dbafe8d3', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_5cedc470dbafe8d3', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5cedc470dbafe8d3', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_ibaji',
  'ind_5cedc470dbafe8d3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5cedc470dbafe8d3', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Ibaji', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5cedc470dbafe8d3', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_5cedc470dbafe8d3',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5cedc470dbafe8d3', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_5cedc470dbafe8d3',
  'political_assignment', '{"constituency_inec": "IBAJI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5cedc470dbafe8d3', 'prof_5cedc470dbafe8d3',
  'Comfort Ojoma Nwuchiola',
  'comfort ojoma nwuchiola kogi state assembly ibaji apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Egbunu Alex Friday -- Idah (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c2ac0a5afb393177', 'Egbunu Alex Friday',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c2ac0a5afb393177', 'ind_c2ac0a5afb393177', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Egbunu Alex Friday', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c2ac0a5afb393177', 'prof_c2ac0a5afb393177',
  'Member, Kogi State House of Assembly (IDAH)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c2ac0a5afb393177', 'ind_c2ac0a5afb393177', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c2ac0a5afb393177', 'ind_c2ac0a5afb393177', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c2ac0a5afb393177', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|idah|2023',
  'insert', 'ind_c2ac0a5afb393177',
  'Unique: Kogi Idah seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c2ac0a5afb393177', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c2ac0a5afb393177', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c2ac0a5afb393177', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_idah',
  'ind_c2ac0a5afb393177', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c2ac0a5afb393177', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Idah', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c2ac0a5afb393177', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c2ac0a5afb393177',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c2ac0a5afb393177', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c2ac0a5afb393177',
  'political_assignment', '{"constituency_inec": "IDAH", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c2ac0a5afb393177', 'prof_c2ac0a5afb393177',
  'Egbunu Alex Friday',
  'egbunu alex friday kogi state assembly idah aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Abubakar Musa -- Igalamela-Odolu (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0625fdc08bb53ce7', 'Abubakar Musa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0625fdc08bb53ce7', 'ind_0625fdc08bb53ce7', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Musa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0625fdc08bb53ce7', 'prof_0625fdc08bb53ce7',
  'Member, Kogi State House of Assembly (IGALAMELA-ODOLU)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0625fdc08bb53ce7', 'ind_0625fdc08bb53ce7', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0625fdc08bb53ce7', 'ind_0625fdc08bb53ce7', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0625fdc08bb53ce7', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|igalamela-odolu|2023',
  'insert', 'ind_0625fdc08bb53ce7',
  'Unique: Kogi Igalamela-Odolu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0625fdc08bb53ce7', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_0625fdc08bb53ce7', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0625fdc08bb53ce7', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_igalamela-odolu',
  'ind_0625fdc08bb53ce7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0625fdc08bb53ce7', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Igalamela-Odolu', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0625fdc08bb53ce7', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_0625fdc08bb53ce7',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0625fdc08bb53ce7', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_0625fdc08bb53ce7',
  'political_assignment', '{"constituency_inec": "IGALAMELA-ODOLU", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0625fdc08bb53ce7', 'prof_0625fdc08bb53ce7',
  'Abubakar Musa',
  'abubakar musa kogi state assembly igalamela-odolu aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Ishaya Omotayo Adeleye -- Ijumu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bc0f1fe59b776d83', 'Ishaya Omotayo Adeleye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bc0f1fe59b776d83', 'ind_bc0f1fe59b776d83', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ishaya Omotayo Adeleye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bc0f1fe59b776d83', 'prof_bc0f1fe59b776d83',
  'Member, Kogi State House of Assembly (IJUMU)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bc0f1fe59b776d83', 'ind_bc0f1fe59b776d83', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bc0f1fe59b776d83', 'ind_bc0f1fe59b776d83', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bc0f1fe59b776d83', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|ijumu|2023',
  'insert', 'ind_bc0f1fe59b776d83',
  'Unique: Kogi Ijumu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bc0f1fe59b776d83', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_bc0f1fe59b776d83', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bc0f1fe59b776d83', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_ijumu',
  'ind_bc0f1fe59b776d83', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bc0f1fe59b776d83', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Ijumu', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bc0f1fe59b776d83', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_bc0f1fe59b776d83',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bc0f1fe59b776d83', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_bc0f1fe59b776d83',
  'political_assignment', '{"constituency_inec": "IJUMU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bc0f1fe59b776d83', 'prof_bc0f1fe59b776d83',
  'Ishaya Omotayo Adeleye',
  'ishaya omotayo adeleye kogi state assembly ijumu apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Bello Oluwaseyi Victor -- Kabba/Bunu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c38101c4a87ee6e6', 'Bello Oluwaseyi Victor',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c38101c4a87ee6e6', 'ind_c38101c4a87ee6e6', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bello Oluwaseyi Victor', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c38101c4a87ee6e6', 'prof_c38101c4a87ee6e6',
  'Member, Kogi State House of Assembly (KABBA/BUNU)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c38101c4a87ee6e6', 'ind_c38101c4a87ee6e6', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c38101c4a87ee6e6', 'ind_c38101c4a87ee6e6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c38101c4a87ee6e6', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|kabba/bunu|2023',
  'insert', 'ind_c38101c4a87ee6e6',
  'Unique: Kogi Kabba/Bunu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c38101c4a87ee6e6', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c38101c4a87ee6e6', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c38101c4a87ee6e6', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_kabba/bunu',
  'ind_c38101c4a87ee6e6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c38101c4a87ee6e6', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Kabba/Bunu', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c38101c4a87ee6e6', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c38101c4a87ee6e6',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c38101c4a87ee6e6', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c38101c4a87ee6e6',
  'political_assignment', '{"constituency_inec": "KABBA/BUNU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c38101c4a87ee6e6', 'prof_c38101c4a87ee6e6',
  'Bello Oluwaseyi Victor',
  'bello oluwaseyi victor kogi state assembly kabba/bunu apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Abubakar Yahaya Hussani -- Kogi Kk (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2b564127b777f494', 'Abubakar Yahaya Hussani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2b564127b777f494', 'ind_2b564127b777f494', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Yahaya Hussani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2b564127b777f494', 'prof_2b564127b777f494',
  'Member, Kogi State House of Assembly (KOGI KK)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2b564127b777f494', 'ind_2b564127b777f494', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2b564127b777f494', 'ind_2b564127b777f494', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2b564127b777f494', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|kogi kk|2023',
  'insert', 'ind_2b564127b777f494',
  'Unique: Kogi Kogi Kk seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2b564127b777f494', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_2b564127b777f494', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2b564127b777f494', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_kogi_kk',
  'ind_2b564127b777f494', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2b564127b777f494', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Kogi Kk', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2b564127b777f494', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_2b564127b777f494',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2b564127b777f494', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_2b564127b777f494',
  'political_assignment', '{"constituency_inec": "KOGI KK", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2b564127b777f494', 'prof_2b564127b777f494',
  'Abubakar Yahaya Hussani',
  'abubakar yahaya hussani kogi state assembly kogi kk adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Mahmud Ibrahim Babanhajiya -- Lokoja I (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_855b441e3467499c', 'Mahmud Ibrahim Babanhajiya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_855b441e3467499c', 'ind_855b441e3467499c', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mahmud Ibrahim Babanhajiya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_855b441e3467499c', 'prof_855b441e3467499c',
  'Member, Kogi State House of Assembly (LOKOJA I)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_855b441e3467499c', 'ind_855b441e3467499c', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_855b441e3467499c', 'ind_855b441e3467499c', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_855b441e3467499c', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|lokoja i|2023',
  'insert', 'ind_855b441e3467499c',
  'Unique: Kogi Lokoja I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_855b441e3467499c', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_855b441e3467499c', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_855b441e3467499c', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_lokoja_i',
  'ind_855b441e3467499c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_855b441e3467499c', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Lokoja I', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_855b441e3467499c', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_855b441e3467499c',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_855b441e3467499c', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_855b441e3467499c',
  'political_assignment', '{"constituency_inec": "LOKOJA I", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_855b441e3467499c', 'prof_855b441e3467499c',
  'Mahmud Ibrahim Babanhajiya',
  'mahmud ibrahim babanhajiya kogi state assembly lokoja i adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Jacob Sam Olawumi -- Mopamuro (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_86c38f708ed441f8', 'Jacob Sam Olawumi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_86c38f708ed441f8', 'ind_86c38f708ed441f8', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jacob Sam Olawumi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_86c38f708ed441f8', 'prof_86c38f708ed441f8',
  'Member, Kogi State House of Assembly (MOPAMURO)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_86c38f708ed441f8', 'ind_86c38f708ed441f8', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_86c38f708ed441f8', 'ind_86c38f708ed441f8', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_86c38f708ed441f8', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|mopamuro|2023',
  'insert', 'ind_86c38f708ed441f8',
  'Unique: Kogi Mopamuro seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_86c38f708ed441f8', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_86c38f708ed441f8', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_86c38f708ed441f8', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_mopamuro',
  'ind_86c38f708ed441f8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_86c38f708ed441f8', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Mopamuro', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_86c38f708ed441f8', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_86c38f708ed441f8',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_86c38f708ed441f8', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_86c38f708ed441f8',
  'political_assignment', '{"constituency_inec": "MOPAMURO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_86c38f708ed441f8', 'prof_86c38f708ed441f8',
  'Jacob Sam Olawumi',
  'jacob sam olawumi kogi state assembly mopamuro apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Amodu Seidu Shehu -- Ofu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c5fbaddf111596cb', 'Amodu Seidu Shehu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c5fbaddf111596cb', 'ind_c5fbaddf111596cb', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Amodu Seidu Shehu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c5fbaddf111596cb', 'prof_c5fbaddf111596cb',
  'Member, Kogi State House of Assembly (OFU)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c5fbaddf111596cb', 'ind_c5fbaddf111596cb', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c5fbaddf111596cb', 'ind_c5fbaddf111596cb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c5fbaddf111596cb', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|ofu|2023',
  'insert', 'ind_c5fbaddf111596cb',
  'Unique: Kogi Ofu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c5fbaddf111596cb', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c5fbaddf111596cb', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c5fbaddf111596cb', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_ofu',
  'ind_c5fbaddf111596cb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c5fbaddf111596cb', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Ofu', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c5fbaddf111596cb', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c5fbaddf111596cb',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c5fbaddf111596cb', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c5fbaddf111596cb',
  'political_assignment', '{"constituency_inec": "OFU", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c5fbaddf111596cb', 'prof_c5fbaddf111596cb',
  'Amodu Seidu Shehu',
  'amodu seidu shehu kogi state assembly ofu apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Ogunmola Bode Gemini -- Ogori/Magongo (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c5d90b44ec6d5476', 'Ogunmola Bode Gemini',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c5d90b44ec6d5476', 'ind_c5d90b44ec6d5476', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogunmola Bode Gemini', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c5d90b44ec6d5476', 'prof_c5d90b44ec6d5476',
  'Member, Kogi State House of Assembly (OGORI/MAGONGO)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c5d90b44ec6d5476', 'ind_c5d90b44ec6d5476', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c5d90b44ec6d5476', 'ind_c5d90b44ec6d5476', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c5d90b44ec6d5476', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|ogori/magongo|2023',
  'insert', 'ind_c5d90b44ec6d5476',
  'Unique: Kogi Ogori/Magongo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c5d90b44ec6d5476', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c5d90b44ec6d5476', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c5d90b44ec6d5476', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_ogori/magongo',
  'ind_c5d90b44ec6d5476', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c5d90b44ec6d5476', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Ogori/Magongo', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c5d90b44ec6d5476', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c5d90b44ec6d5476',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c5d90b44ec6d5476', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_c5d90b44ec6d5476',
  'political_assignment', '{"constituency_inec": "OGORI/MAGONGO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c5d90b44ec6d5476', 'prof_c5d90b44ec6d5476',
  'Ogunmola Bode Gemini',
  'ogunmola bode gemini kogi state assembly ogori/magongo pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Ismaila Onoruoiza Dauda -- Okehi (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6fccaf08d5873b56', 'Ismaila Onoruoiza Dauda',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6fccaf08d5873b56', 'ind_6fccaf08d5873b56', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ismaila Onoruoiza Dauda', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6fccaf08d5873b56', 'prof_6fccaf08d5873b56',
  'Member, Kogi State House of Assembly (OKEHI)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6fccaf08d5873b56', 'ind_6fccaf08d5873b56', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6fccaf08d5873b56', 'ind_6fccaf08d5873b56', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6fccaf08d5873b56', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|okehi|2023',
  'insert', 'ind_6fccaf08d5873b56',
  'Unique: Kogi Okehi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6fccaf08d5873b56', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_6fccaf08d5873b56', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6fccaf08d5873b56', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_okehi',
  'ind_6fccaf08d5873b56', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6fccaf08d5873b56', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Okehi', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6fccaf08d5873b56', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_6fccaf08d5873b56',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6fccaf08d5873b56', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_6fccaf08d5873b56',
  'political_assignment', '{"constituency_inec": "OKEHI", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6fccaf08d5873b56', 'prof_6fccaf08d5873b56',
  'Ismaila Onoruoiza Dauda',
  'ismaila onoruoiza dauda kogi state assembly okehi adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Umar Abubakar Nakib -- Okene Town (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2a28a2305606fb7e', 'Umar Abubakar Nakib',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2a28a2305606fb7e', 'ind_2a28a2305606fb7e', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umar Abubakar Nakib', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2a28a2305606fb7e', 'prof_2a28a2305606fb7e',
  'Member, Kogi State House of Assembly (OKENE TOWN)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2a28a2305606fb7e', 'ind_2a28a2305606fb7e', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2a28a2305606fb7e', 'ind_2a28a2305606fb7e', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2a28a2305606fb7e', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|okene town|2023',
  'insert', 'ind_2a28a2305606fb7e',
  'Unique: Kogi Okene Town seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2a28a2305606fb7e', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_2a28a2305606fb7e', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2a28a2305606fb7e', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_okene_town',
  'ind_2a28a2305606fb7e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2a28a2305606fb7e', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Okene Town', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2a28a2305606fb7e', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_2a28a2305606fb7e',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2a28a2305606fb7e', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_2a28a2305606fb7e',
  'political_assignment', '{"constituency_inec": "OKENE TOWN", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2a28a2305606fb7e', 'prof_2a28a2305606fb7e',
  'Umar Abubakar Nakib',
  'umar abubakar nakib kogi state assembly okene town adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Yusuf Okatahi Muhammed -- Okene Ii South (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_36acb6378d2e8656', 'Yusuf Okatahi Muhammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_36acb6378d2e8656', 'ind_36acb6378d2e8656', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Okatahi Muhammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_36acb6378d2e8656', 'prof_36acb6378d2e8656',
  'Member, Kogi State House of Assembly (OKENE II SOUTH)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_36acb6378d2e8656', 'ind_36acb6378d2e8656', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_36acb6378d2e8656', 'ind_36acb6378d2e8656', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_36acb6378d2e8656', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|okene ii south|2023',
  'insert', 'ind_36acb6378d2e8656',
  'Unique: Kogi Okene Ii South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_36acb6378d2e8656', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_36acb6378d2e8656', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_36acb6378d2e8656', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_okene_ii_south',
  'ind_36acb6378d2e8656', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_36acb6378d2e8656', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Okene Ii South', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_36acb6378d2e8656', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_36acb6378d2e8656',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_36acb6378d2e8656', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_36acb6378d2e8656',
  'political_assignment', '{"constituency_inec": "OKENE II SOUTH", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_36acb6378d2e8656', 'prof_36acb6378d2e8656',
  'Yusuf Okatahi Muhammed',
  'yusuf okatahi muhammed kogi state assembly okene ii south adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Ujah Alewo Anthony -- Olamaboro I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3a1a464db07dc4f3', 'Ujah Alewo Anthony',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3a1a464db07dc4f3', 'ind_3a1a464db07dc4f3', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ujah Alewo Anthony', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3a1a464db07dc4f3', 'prof_3a1a464db07dc4f3',
  'Member, Kogi State House of Assembly (OLAMABORO I)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3a1a464db07dc4f3', 'ind_3a1a464db07dc4f3', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3a1a464db07dc4f3', 'ind_3a1a464db07dc4f3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3a1a464db07dc4f3', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|olamaboro i|2023',
  'insert', 'ind_3a1a464db07dc4f3',
  'Unique: Kogi Olamaboro I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3a1a464db07dc4f3', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_3a1a464db07dc4f3', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3a1a464db07dc4f3', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_olamaboro_i',
  'ind_3a1a464db07dc4f3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3a1a464db07dc4f3', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Olamaboro I', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3a1a464db07dc4f3', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_3a1a464db07dc4f3',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3a1a464db07dc4f3', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_3a1a464db07dc4f3',
  'political_assignment', '{"constituency_inec": "OLAMABORO I", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3a1a464db07dc4f3', 'prof_3a1a464db07dc4f3',
  'Ujah Alewo Anthony',
  'ujah alewo anthony kogi state assembly olamaboro i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Kadiri Sunday Awaga -- Omala (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a12dccc06931d97c', 'Kadiri Sunday Awaga',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a12dccc06931d97c', 'ind_a12dccc06931d97c', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kadiri Sunday Awaga', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a12dccc06931d97c', 'prof_a12dccc06931d97c',
  'Member, Kogi State House of Assembly (OMALA)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a12dccc06931d97c', 'ind_a12dccc06931d97c', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a12dccc06931d97c', 'ind_a12dccc06931d97c', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a12dccc06931d97c', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|omala|2023',
  'insert', 'ind_a12dccc06931d97c',
  'Unique: Kogi Omala seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a12dccc06931d97c', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_a12dccc06931d97c', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a12dccc06931d97c', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_omala',
  'ind_a12dccc06931d97c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a12dccc06931d97c', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Omala', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a12dccc06931d97c', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_a12dccc06931d97c',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a12dccc06931d97c', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_a12dccc06931d97c',
  'political_assignment', '{"constituency_inec": "OMALA", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a12dccc06931d97c', 'prof_a12dccc06931d97c',
  'Kadiri Sunday Awaga',
  'kadiri sunday awaga kogi state assembly omala adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Odofin Adesoji David -- Yagba East (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f3663aeedba7fe60', 'Odofin Adesoji David',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f3663aeedba7fe60', 'ind_f3663aeedba7fe60', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Odofin Adesoji David', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f3663aeedba7fe60', 'prof_f3663aeedba7fe60',
  'Member, Kogi State House of Assembly (YAGBA EAST)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f3663aeedba7fe60', 'ind_f3663aeedba7fe60', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f3663aeedba7fe60', 'ind_f3663aeedba7fe60', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f3663aeedba7fe60', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|yagba east|2023',
  'insert', 'ind_f3663aeedba7fe60',
  'Unique: Kogi Yagba East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f3663aeedba7fe60', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_f3663aeedba7fe60', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f3663aeedba7fe60', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_yagba_east',
  'ind_f3663aeedba7fe60', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f3663aeedba7fe60', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Yagba East', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f3663aeedba7fe60', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_f3663aeedba7fe60',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f3663aeedba7fe60', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_f3663aeedba7fe60',
  'political_assignment', '{"constituency_inec": "YAGBA EAST", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f3663aeedba7fe60', 'prof_f3663aeedba7fe60',
  'Odofin Adesoji David',
  'odofin adesoji david kogi state assembly yagba east adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Idowu Ibukujnle -- Yagba West (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_68d9505032bb3373', 'Idowu Ibukujnle',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_68d9505032bb3373', 'ind_68d9505032bb3373', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idowu Ibukujnle', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_68d9505032bb3373', 'prof_68d9505032bb3373',
  'Member, Kogi State House of Assembly (YAGBA WEST)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_68d9505032bb3373', 'ind_68d9505032bb3373', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_68d9505032bb3373', 'ind_68d9505032bb3373', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_68d9505032bb3373', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|yagba west|2023',
  'insert', 'ind_68d9505032bb3373',
  'Unique: Kogi Yagba West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_68d9505032bb3373', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_68d9505032bb3373', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_68d9505032bb3373', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_yagba_west',
  'ind_68d9505032bb3373', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_68d9505032bb3373', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Yagba West', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_68d9505032bb3373', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_68d9505032bb3373',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_68d9505032bb3373', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_68d9505032bb3373',
  'political_assignment', '{"constituency_inec": "YAGBA WEST", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_68d9505032bb3373', 'prof_68d9505032bb3373',
  'Idowu Ibukujnle',
  'idowu ibukujnle kogi state assembly yagba west adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Otijele Blessing Enejoh -- Ankpa II (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d09828b6a7df26cc', 'Otijele Blessing Enejoh',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d09828b6a7df26cc', 'ind_d09828b6a7df26cc', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Otijele Blessing Enejoh', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d09828b6a7df26cc', 'prof_d09828b6a7df26cc',
  'Member, Kogi State House of Assembly (ANKPA II)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d09828b6a7df26cc', 'ind_d09828b6a7df26cc', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d09828b6a7df26cc', 'ind_d09828b6a7df26cc', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d09828b6a7df26cc', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|ankpa ii|2023',
  'insert', 'ind_d09828b6a7df26cc',
  'Unique: Kogi Ankpa II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d09828b6a7df26cc', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_d09828b6a7df26cc', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d09828b6a7df26cc', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_ankpa_ii',
  'ind_d09828b6a7df26cc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d09828b6a7df26cc', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Ankpa II', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d09828b6a7df26cc', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_d09828b6a7df26cc',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d09828b6a7df26cc', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_d09828b6a7df26cc',
  'political_assignment', '{"constituency_inec": "ANKPA II", "party_abbrev": "AA", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d09828b6a7df26cc', 'prof_d09828b6a7df26cc',
  'Otijele Blessing Enejoh',
  'otijele blessing enejoh kogi state assembly ankpa ii aa politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Abdulkadir Muhammed Jiya -- Lokoja II (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ec580780fd66fb93', 'Abdulkadir Muhammed Jiya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ec580780fd66fb93', 'ind_ec580780fd66fb93', 'individual', 'place_state_kogi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdulkadir Muhammed Jiya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ec580780fd66fb93', 'prof_ec580780fd66fb93',
  'Member, Kogi State House of Assembly (LOKOJA II)',
  'place_state_kogi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ec580780fd66fb93', 'ind_ec580780fd66fb93', 'term_ng_kogi_state_assembly_10th_2023_2027',
  'place_state_kogi', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ec580780fd66fb93', 'ind_ec580780fd66fb93', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ec580780fd66fb93', 'seed_run_s05_political_kogi_roster_20260502', 'individual',
  'ng_state_assembly_member|kogi|lokoja ii|2023',
  'insert', 'ind_ec580780fd66fb93',
  'Unique: Kogi Lokoja II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ec580780fd66fb93', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_ec580780fd66fb93', 'seed_source_nigerianleaders_kogi_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ec580780fd66fb93', 'seed_run_s05_political_kogi_roster_20260502', 'seed_source_nigerianleaders_kogi_assembly_20260502',
  'nl_kogi_assembly_2023_lokoja_ii',
  'ind_ec580780fd66fb93', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ec580780fd66fb93', 'seed_run_s05_political_kogi_roster_20260502',
  'Kogi Lokoja II', 'place_state_kogi', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ec580780fd66fb93', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_ec580780fd66fb93',
  'seed_source_nigerianleaders_kogi_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ec580780fd66fb93', 'seed_run_s05_political_kogi_roster_20260502', 'individual', 'ind_ec580780fd66fb93',
  'political_assignment', '{"constituency_inec": "LOKOJA II", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/kogi-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ec580780fd66fb93', 'prof_ec580780fd66fb93',
  'Abdulkadir Muhammed Jiya',
  'abdulkadir muhammed jiya kogi state assembly lokoja ii adc politician legislator state house',
  'place_nigeria_001/place_zone_north_central/place_state_kogi',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
