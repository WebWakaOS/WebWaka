-- ============================================================
-- Migration 0517: Jigawa State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Jigawa State House of Assembly Members
-- Members seeded: 24/30
-- Party breakdown: APC:22, ADC:2
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================

PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_jigawa_assembly_20260502',
  'NigerianLeaders – Complete List of Jigawa State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/jigawa-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_jigawa_roster_20260502', 'S05 Batch – Jigawa State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_jigawa_roster_20260502',
  'seed_run_s05_political_jigawa_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0517_political_jigawa_assembly_full_roster_seed.sql',
  NULL, 24,
  '24/30 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_jigawa_state_assembly_10th_2023_2027',
  'Jigawa State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_jigawa',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (24 of 30 seats) ──────────────────────────────────────

-- 01. Sani Ishaq -- Auyo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_20e4fceefae2eb67', 'Sani Ishaq',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_20e4fceefae2eb67', 'ind_20e4fceefae2eb67', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sani Ishaq', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_20e4fceefae2eb67', 'prof_20e4fceefae2eb67',
  'Member, Jigawa State House of Assembly (AUYO)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_20e4fceefae2eb67', 'ind_20e4fceefae2eb67', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_20e4fceefae2eb67', 'ind_20e4fceefae2eb67', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_20e4fceefae2eb67', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|auyo|2023',
  'insert', 'ind_20e4fceefae2eb67',
  'Unique: Jigawa Auyo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_20e4fceefae2eb67', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_20e4fceefae2eb67', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_20e4fceefae2eb67', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_auyo',
  'ind_20e4fceefae2eb67', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_20e4fceefae2eb67', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Auyo', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_20e4fceefae2eb67', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_20e4fceefae2eb67',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_20e4fceefae2eb67', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_20e4fceefae2eb67',
  'political_assignment', '{"constituency_inec": "AUYO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_20e4fceefae2eb67', 'prof_20e4fceefae2eb67',
  'Sani Ishaq',
  'sani ishaq jigawa state assembly auyo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Abdulrahman Masud Naruwa -- Babura (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f77f0f696fea1acb', 'Abdulrahman Masud Naruwa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f77f0f696fea1acb', 'ind_f77f0f696fea1acb', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdulrahman Masud Naruwa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f77f0f696fea1acb', 'prof_f77f0f696fea1acb',
  'Member, Jigawa State House of Assembly (BABURA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f77f0f696fea1acb', 'ind_f77f0f696fea1acb', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f77f0f696fea1acb', 'ind_f77f0f696fea1acb', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f77f0f696fea1acb', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|babura|2023',
  'insert', 'ind_f77f0f696fea1acb',
  'Unique: Jigawa Babura seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f77f0f696fea1acb', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f77f0f696fea1acb', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f77f0f696fea1acb', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_babura',
  'ind_f77f0f696fea1acb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f77f0f696fea1acb', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Babura', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f77f0f696fea1acb', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f77f0f696fea1acb',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f77f0f696fea1acb', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f77f0f696fea1acb',
  'political_assignment', '{"constituency_inec": "BABURA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f77f0f696fea1acb', 'prof_f77f0f696fea1acb',
  'Abdulrahman Masud Naruwa',
  'abdulrahman masud naruwa jigawa state assembly babura apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Ibrahim Hashim Kanya -- Bala Hassan Auyo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f693cf762e4eea06', 'Ibrahim Hashim Kanya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f693cf762e4eea06', 'ind_f693cf762e4eea06', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Hashim Kanya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f693cf762e4eea06', 'prof_f693cf762e4eea06',
  'Member, Jigawa State House of Assembly (BALA HASSAN AUYO)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f693cf762e4eea06', 'ind_f693cf762e4eea06', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f693cf762e4eea06', 'ind_f693cf762e4eea06', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f693cf762e4eea06', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|bala hassan auyo|2023',
  'insert', 'ind_f693cf762e4eea06',
  'Unique: Jigawa Bala Hassan Auyo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f693cf762e4eea06', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f693cf762e4eea06', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f693cf762e4eea06', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_bala_hassan_auyo',
  'ind_f693cf762e4eea06', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f693cf762e4eea06', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Bala Hassan Auyo', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f693cf762e4eea06', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f693cf762e4eea06',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f693cf762e4eea06', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f693cf762e4eea06',
  'political_assignment', '{"constituency_inec": "BALA HASSAN AUYO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f693cf762e4eea06', 'prof_f693cf762e4eea06',
  'Ibrahim Hashim Kanya',
  'ibrahim hashim kanya jigawa state assembly bala hassan auyo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Muhammad Yakubu Usman -- Birnin Kudu (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2b5f1543888bb4a2', 'Muhammad Yakubu Usman',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2b5f1543888bb4a2', 'ind_2b5f1543888bb4a2', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Yakubu Usman', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2b5f1543888bb4a2', 'prof_2b5f1543888bb4a2',
  'Member, Jigawa State House of Assembly (BIRNIN KUDU)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2b5f1543888bb4a2', 'ind_2b5f1543888bb4a2', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2b5f1543888bb4a2', 'ind_2b5f1543888bb4a2', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2b5f1543888bb4a2', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|birnin kudu|2023',
  'insert', 'ind_2b5f1543888bb4a2',
  'Unique: Jigawa Birnin Kudu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2b5f1543888bb4a2', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_2b5f1543888bb4a2', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2b5f1543888bb4a2', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_birnin_kudu',
  'ind_2b5f1543888bb4a2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2b5f1543888bb4a2', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Birnin Kudu', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2b5f1543888bb4a2', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_2b5f1543888bb4a2',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2b5f1543888bb4a2', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_2b5f1543888bb4a2',
  'political_assignment', '{"constituency_inec": "BIRNIN KUDU", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2b5f1543888bb4a2', 'prof_2b5f1543888bb4a2',
  'Muhammad Yakubu Usman',
  'muhammad yakubu usman jigawa state assembly birnin kudu adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Keriya Hassan -- Birniwa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_efdf0cfba1bf613d', 'Keriya Hassan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_efdf0cfba1bf613d', 'ind_efdf0cfba1bf613d', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Keriya Hassan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_efdf0cfba1bf613d', 'prof_efdf0cfba1bf613d',
  'Member, Jigawa State House of Assembly (BIRNIWA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_efdf0cfba1bf613d', 'ind_efdf0cfba1bf613d', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_efdf0cfba1bf613d', 'ind_efdf0cfba1bf613d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_efdf0cfba1bf613d', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|birniwa|2023',
  'insert', 'ind_efdf0cfba1bf613d',
  'Unique: Jigawa Birniwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_efdf0cfba1bf613d', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_efdf0cfba1bf613d', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_efdf0cfba1bf613d', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_birniwa',
  'ind_efdf0cfba1bf613d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_efdf0cfba1bf613d', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Birniwa', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_efdf0cfba1bf613d', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_efdf0cfba1bf613d',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_efdf0cfba1bf613d', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_efdf0cfba1bf613d',
  'political_assignment', '{"constituency_inec": "BIRNIWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_efdf0cfba1bf613d', 'prof_efdf0cfba1bf613d',
  'Keriya Hassan',
  'keriya hassan jigawa state assembly birniwa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Alhaji Baba Sale -- Buji (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2b593483a65905af', 'Alhaji Baba Sale',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2b593483a65905af', 'ind_2b593483a65905af', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Alhaji Baba Sale', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2b593483a65905af', 'prof_2b593483a65905af',
  'Member, Jigawa State House of Assembly (BUJI)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2b593483a65905af', 'ind_2b593483a65905af', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2b593483a65905af', 'ind_2b593483a65905af', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2b593483a65905af', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|buji|2023',
  'insert', 'ind_2b593483a65905af',
  'Unique: Jigawa Buji seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2b593483a65905af', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_2b593483a65905af', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2b593483a65905af', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_buji',
  'ind_2b593483a65905af', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2b593483a65905af', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Buji', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2b593483a65905af', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_2b593483a65905af',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2b593483a65905af', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_2b593483a65905af',
  'political_assignment', '{"constituency_inec": "BUJI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2b593483a65905af', 'prof_2b593483a65905af',
  'Alhaji Baba Sale',
  'alhaji baba sale jigawa state assembly buji apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Ishaq Tasiu -- Dutse (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5e92f6d0f96aa620', 'Ishaq Tasiu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5e92f6d0f96aa620', 'ind_5e92f6d0f96aa620', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ishaq Tasiu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5e92f6d0f96aa620', 'prof_5e92f6d0f96aa620',
  'Member, Jigawa State House of Assembly (DUTSE)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5e92f6d0f96aa620', 'ind_5e92f6d0f96aa620', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5e92f6d0f96aa620', 'ind_5e92f6d0f96aa620', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5e92f6d0f96aa620', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|dutse|2023',
  'insert', 'ind_5e92f6d0f96aa620',
  'Unique: Jigawa Dutse seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5e92f6d0f96aa620', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_5e92f6d0f96aa620', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5e92f6d0f96aa620', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_dutse',
  'ind_5e92f6d0f96aa620', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5e92f6d0f96aa620', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Dutse', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5e92f6d0f96aa620', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_5e92f6d0f96aa620',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5e92f6d0f96aa620', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_5e92f6d0f96aa620',
  'political_assignment', '{"constituency_inec": "DUTSE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5e92f6d0f96aa620', 'prof_5e92f6d0f96aa620',
  'Ishaq Tasiu',
  'ishaq tasiu jigawa state assembly dutse apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Yau Ibrahim -- Gagarawa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3a4a8b16389891e1', 'Yau Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3a4a8b16389891e1', 'ind_3a4a8b16389891e1', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yau Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3a4a8b16389891e1', 'prof_3a4a8b16389891e1',
  'Member, Jigawa State House of Assembly (GAGARAWA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3a4a8b16389891e1', 'ind_3a4a8b16389891e1', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3a4a8b16389891e1', 'ind_3a4a8b16389891e1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3a4a8b16389891e1', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|gagarawa|2023',
  'insert', 'ind_3a4a8b16389891e1',
  'Unique: Jigawa Gagarawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3a4a8b16389891e1', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_3a4a8b16389891e1', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3a4a8b16389891e1', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_gagarawa',
  'ind_3a4a8b16389891e1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3a4a8b16389891e1', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Gagarawa', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3a4a8b16389891e1', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_3a4a8b16389891e1',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3a4a8b16389891e1', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_3a4a8b16389891e1',
  'political_assignment', '{"constituency_inec": "GAGARAWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3a4a8b16389891e1', 'prof_3a4a8b16389891e1',
  'Yau Ibrahim',
  'yau ibrahim jigawa state assembly gagarawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Ila Abdu Muku -- Garki (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7c13efbbd3247c0a', 'Ila Abdu Muku',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7c13efbbd3247c0a', 'ind_7c13efbbd3247c0a', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ila Abdu Muku', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7c13efbbd3247c0a', 'prof_7c13efbbd3247c0a',
  'Member, Jigawa State House of Assembly (GARKI)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7c13efbbd3247c0a', 'ind_7c13efbbd3247c0a', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7c13efbbd3247c0a', 'ind_7c13efbbd3247c0a', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7c13efbbd3247c0a', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|garki|2023',
  'insert', 'ind_7c13efbbd3247c0a',
  'Unique: Jigawa Garki seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7c13efbbd3247c0a', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7c13efbbd3247c0a', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7c13efbbd3247c0a', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_garki',
  'ind_7c13efbbd3247c0a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7c13efbbd3247c0a', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Garki', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7c13efbbd3247c0a', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7c13efbbd3247c0a',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7c13efbbd3247c0a', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7c13efbbd3247c0a',
  'political_assignment', '{"constituency_inec": "GARKI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7c13efbbd3247c0a', 'prof_7c13efbbd3247c0a',
  'Ila Abdu Muku',
  'ila abdu muku jigawa state assembly garki apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Abubakar Sani Isyaku -- Guri (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_933c0b8967837110', 'Abubakar Sani Isyaku',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_933c0b8967837110', 'ind_933c0b8967837110', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Sani Isyaku', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_933c0b8967837110', 'prof_933c0b8967837110',
  'Member, Jigawa State House of Assembly (GURI)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_933c0b8967837110', 'ind_933c0b8967837110', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_933c0b8967837110', 'ind_933c0b8967837110', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_933c0b8967837110', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|guri|2023',
  'insert', 'ind_933c0b8967837110',
  'Unique: Jigawa Guri seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_933c0b8967837110', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_933c0b8967837110', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_933c0b8967837110', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_guri',
  'ind_933c0b8967837110', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_933c0b8967837110', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Guri', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_933c0b8967837110', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_933c0b8967837110',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_933c0b8967837110', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_933c0b8967837110',
  'political_assignment', '{"constituency_inec": "GURI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_933c0b8967837110', 'prof_933c0b8967837110',
  'Abubakar Sani Isyaku',
  'abubakar sani isyaku jigawa state assembly guri apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Tura Usman Abdullahi -- Gwaram (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_03d3b247e4d4da3e', 'Tura Usman Abdullahi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_03d3b247e4d4da3e', 'ind_03d3b247e4d4da3e', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Tura Usman Abdullahi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_03d3b247e4d4da3e', 'prof_03d3b247e4d4da3e',
  'Member, Jigawa State House of Assembly (GWARAM)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_03d3b247e4d4da3e', 'ind_03d3b247e4d4da3e', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_03d3b247e4d4da3e', 'ind_03d3b247e4d4da3e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_03d3b247e4d4da3e', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|gwaram|2023',
  'insert', 'ind_03d3b247e4d4da3e',
  'Unique: Jigawa Gwaram seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_03d3b247e4d4da3e', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_03d3b247e4d4da3e', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_03d3b247e4d4da3e', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_gwaram',
  'ind_03d3b247e4d4da3e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_03d3b247e4d4da3e', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Gwaram', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_03d3b247e4d4da3e', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_03d3b247e4d4da3e',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_03d3b247e4d4da3e', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_03d3b247e4d4da3e',
  'political_assignment', '{"constituency_inec": "GWARAM", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_03d3b247e4d4da3e', 'prof_03d3b247e4d4da3e',
  'Tura Usman Abdullahi',
  'tura usman abdullahi jigawa state assembly gwaram apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Ibrahim Hamza Adamu -- Hadejia (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6f9e8400fb665136', 'Ibrahim Hamza Adamu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6f9e8400fb665136', 'ind_6f9e8400fb665136', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Hamza Adamu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6f9e8400fb665136', 'prof_6f9e8400fb665136',
  'Member, Jigawa State House of Assembly (HADEJIA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6f9e8400fb665136', 'ind_6f9e8400fb665136', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6f9e8400fb665136', 'ind_6f9e8400fb665136', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6f9e8400fb665136', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|hadejia|2023',
  'insert', 'ind_6f9e8400fb665136',
  'Unique: Jigawa Hadejia seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6f9e8400fb665136', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_6f9e8400fb665136', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6f9e8400fb665136', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_hadejia',
  'ind_6f9e8400fb665136', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6f9e8400fb665136', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Hadejia', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6f9e8400fb665136', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_6f9e8400fb665136',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6f9e8400fb665136', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_6f9e8400fb665136',
  'political_assignment', '{"constituency_inec": "HADEJIA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6f9e8400fb665136', 'prof_6f9e8400fb665136',
  'Ibrahim Hamza Adamu',
  'ibrahim hamza adamu jigawa state assembly hadejia apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Muhammad Abubakar Sadiq -- Jahun (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9d7eeb64737cb99d', 'Muhammad Abubakar Sadiq',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9d7eeb64737cb99d', 'ind_9d7eeb64737cb99d', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Abubakar Sadiq', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9d7eeb64737cb99d', 'prof_9d7eeb64737cb99d',
  'Member, Jigawa State House of Assembly (JAHUN)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9d7eeb64737cb99d', 'ind_9d7eeb64737cb99d', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9d7eeb64737cb99d', 'ind_9d7eeb64737cb99d', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9d7eeb64737cb99d', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|jahun|2023',
  'insert', 'ind_9d7eeb64737cb99d',
  'Unique: Jigawa Jahun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9d7eeb64737cb99d', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_9d7eeb64737cb99d', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9d7eeb64737cb99d', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_jahun',
  'ind_9d7eeb64737cb99d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9d7eeb64737cb99d', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Jahun', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9d7eeb64737cb99d', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_9d7eeb64737cb99d',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9d7eeb64737cb99d', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_9d7eeb64737cb99d',
  'political_assignment', '{"constituency_inec": "JAHUN", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9d7eeb64737cb99d', 'prof_9d7eeb64737cb99d',
  'Muhammad Abubakar Sadiq',
  'muhammad abubakar sadiq jigawa state assembly jahun apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Adamu Muhammad -- K/Hausa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7fa652a7332e14fc', 'Adamu Muhammad',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7fa652a7332e14fc', 'ind_7fa652a7332e14fc', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adamu Muhammad', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7fa652a7332e14fc', 'prof_7fa652a7332e14fc',
  'Member, Jigawa State House of Assembly (K/HAUSA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7fa652a7332e14fc', 'ind_7fa652a7332e14fc', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7fa652a7332e14fc', 'ind_7fa652a7332e14fc', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7fa652a7332e14fc', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|k/hausa|2023',
  'insert', 'ind_7fa652a7332e14fc',
  'Unique: Jigawa K/Hausa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7fa652a7332e14fc', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7fa652a7332e14fc', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7fa652a7332e14fc', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_k/hausa',
  'ind_7fa652a7332e14fc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7fa652a7332e14fc', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa K/Hausa', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7fa652a7332e14fc', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7fa652a7332e14fc',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7fa652a7332e14fc', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7fa652a7332e14fc',
  'political_assignment', '{"constituency_inec": "K/HAUSA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7fa652a7332e14fc', 'prof_7fa652a7332e14fc',
  'Adamu Muhammad',
  'adamu muhammad jigawa state assembly k/hausa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Sale Sani -- Kaugama (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f9e53dde5d0eba3c', 'Sale Sani',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f9e53dde5d0eba3c', 'ind_f9e53dde5d0eba3c', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sale Sani', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f9e53dde5d0eba3c', 'prof_f9e53dde5d0eba3c',
  'Member, Jigawa State House of Assembly (KAUGAMA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f9e53dde5d0eba3c', 'ind_f9e53dde5d0eba3c', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f9e53dde5d0eba3c', 'ind_f9e53dde5d0eba3c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f9e53dde5d0eba3c', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|kaugama|2023',
  'insert', 'ind_f9e53dde5d0eba3c',
  'Unique: Jigawa Kaugama seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f9e53dde5d0eba3c', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f9e53dde5d0eba3c', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f9e53dde5d0eba3c', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_kaugama',
  'ind_f9e53dde5d0eba3c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f9e53dde5d0eba3c', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Kaugama', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f9e53dde5d0eba3c', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f9e53dde5d0eba3c',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f9e53dde5d0eba3c', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_f9e53dde5d0eba3c',
  'political_assignment', '{"constituency_inec": "KAUGAMA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f9e53dde5d0eba3c', 'prof_f9e53dde5d0eba3c',
  'Sale Sani',
  'sale sani jigawa state assembly kaugama apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Idris Mohammed Inuwa -- Kazaure (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_933c19108f558218', 'Idris Mohammed Inuwa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_933c19108f558218', 'ind_933c19108f558218', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idris Mohammed Inuwa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_933c19108f558218', 'prof_933c19108f558218',
  'Member, Jigawa State House of Assembly (KAZAURE)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_933c19108f558218', 'ind_933c19108f558218', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_933c19108f558218', 'ind_933c19108f558218', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_933c19108f558218', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|kazaure|2023',
  'insert', 'ind_933c19108f558218',
  'Unique: Jigawa Kazaure seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_933c19108f558218', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_933c19108f558218', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_933c19108f558218', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_kazaure',
  'ind_933c19108f558218', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_933c19108f558218', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Kazaure', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_933c19108f558218', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_933c19108f558218',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_933c19108f558218', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_933c19108f558218',
  'political_assignment', '{"constituency_inec": "KAZAURE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_933c19108f558218', 'prof_933c19108f558218',
  'Idris Mohammed Inuwa',
  'idris mohammed inuwa jigawa state assembly kazaure apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Mohammed Yahaya -- Kiyawa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_47c76194ffc9f0c1', 'Mohammed Yahaya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_47c76194ffc9f0c1', 'ind_47c76194ffc9f0c1', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Yahaya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_47c76194ffc9f0c1', 'prof_47c76194ffc9f0c1',
  'Member, Jigawa State House of Assembly (KIYAWA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_47c76194ffc9f0c1', 'ind_47c76194ffc9f0c1', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_47c76194ffc9f0c1', 'ind_47c76194ffc9f0c1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_47c76194ffc9f0c1', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|kiyawa|2023',
  'insert', 'ind_47c76194ffc9f0c1',
  'Unique: Jigawa Kiyawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_47c76194ffc9f0c1', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_47c76194ffc9f0c1', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_47c76194ffc9f0c1', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_kiyawa',
  'ind_47c76194ffc9f0c1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_47c76194ffc9f0c1', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Kiyawa', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_47c76194ffc9f0c1', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_47c76194ffc9f0c1',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_47c76194ffc9f0c1', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_47c76194ffc9f0c1',
  'political_assignment', '{"constituency_inec": "KIYAWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_47c76194ffc9f0c1', 'prof_47c76194ffc9f0c1',
  'Mohammed Yahaya',
  'mohammed yahaya jigawa state assembly kiyawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Ibrahim Hamza Adamu -- Madori (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b611320407d56391', 'Ibrahim Hamza Adamu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b611320407d56391', 'ind_b611320407d56391', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Hamza Adamu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b611320407d56391', 'prof_b611320407d56391',
  'Member, Jigawa State House of Assembly (MADORI)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b611320407d56391', 'ind_b611320407d56391', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b611320407d56391', 'ind_b611320407d56391', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b611320407d56391', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|madori|2023',
  'insert', 'ind_b611320407d56391',
  'Unique: Jigawa Madori seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b611320407d56391', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_b611320407d56391', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b611320407d56391', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_madori',
  'ind_b611320407d56391', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b611320407d56391', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Madori', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b611320407d56391', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_b611320407d56391',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b611320407d56391', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_b611320407d56391',
  'political_assignment', '{"constituency_inec": "MADORI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b611320407d56391', 'prof_b611320407d56391',
  'Ibrahim Hamza Adamu',
  'ibrahim hamza adamu jigawa state assembly madori apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Aliyu Dangyatin Haruna -- Miga (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_15cdf3f051f9b8c3', 'Aliyu Dangyatin Haruna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_15cdf3f051f9b8c3', 'ind_15cdf3f051f9b8c3', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aliyu Dangyatin Haruna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_15cdf3f051f9b8c3', 'prof_15cdf3f051f9b8c3',
  'Member, Jigawa State House of Assembly (MIGA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_15cdf3f051f9b8c3', 'ind_15cdf3f051f9b8c3', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_15cdf3f051f9b8c3', 'ind_15cdf3f051f9b8c3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_15cdf3f051f9b8c3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|miga|2023',
  'insert', 'ind_15cdf3f051f9b8c3',
  'Unique: Jigawa Miga seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_15cdf3f051f9b8c3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_15cdf3f051f9b8c3', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_15cdf3f051f9b8c3', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_miga',
  'ind_15cdf3f051f9b8c3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_15cdf3f051f9b8c3', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Miga', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_15cdf3f051f9b8c3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_15cdf3f051f9b8c3',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_15cdf3f051f9b8c3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_15cdf3f051f9b8c3',
  'political_assignment', '{"constituency_inec": "MIGA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_15cdf3f051f9b8c3', 'prof_15cdf3f051f9b8c3',
  'Aliyu Dangyatin Haruna',
  'aliyu dangyatin haruna jigawa state assembly miga apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Sule Aminu -- Ringim (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7972743ba96a6540', 'Sule Aminu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7972743ba96a6540', 'ind_7972743ba96a6540', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sule Aminu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7972743ba96a6540', 'prof_7972743ba96a6540',
  'Member, Jigawa State House of Assembly (RINGIM)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7972743ba96a6540', 'ind_7972743ba96a6540', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7972743ba96a6540', 'ind_7972743ba96a6540', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7972743ba96a6540', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|ringim|2023',
  'insert', 'ind_7972743ba96a6540',
  'Unique: Jigawa Ringim seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7972743ba96a6540', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7972743ba96a6540', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7972743ba96a6540', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_ringim',
  'ind_7972743ba96a6540', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7972743ba96a6540', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Ringim', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7972743ba96a6540', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7972743ba96a6540',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7972743ba96a6540', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7972743ba96a6540',
  'political_assignment', '{"constituency_inec": "RINGIM", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7972743ba96a6540', 'prof_7972743ba96a6540',
  'Sule Aminu',
  'sule aminu jigawa state assembly ringim apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Muhammad Lawan Dansure -- Roni (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1b8fd3f6e03841b3', 'Muhammad Lawan Dansure',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1b8fd3f6e03841b3', 'ind_1b8fd3f6e03841b3', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Lawan Dansure', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1b8fd3f6e03841b3', 'prof_1b8fd3f6e03841b3',
  'Member, Jigawa State House of Assembly (RONI)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1b8fd3f6e03841b3', 'ind_1b8fd3f6e03841b3', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1b8fd3f6e03841b3', 'ind_1b8fd3f6e03841b3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1b8fd3f6e03841b3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|roni|2023',
  'insert', 'ind_1b8fd3f6e03841b3',
  'Unique: Jigawa Roni seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1b8fd3f6e03841b3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_1b8fd3f6e03841b3', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1b8fd3f6e03841b3', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_roni',
  'ind_1b8fd3f6e03841b3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1b8fd3f6e03841b3', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Roni', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1b8fd3f6e03841b3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_1b8fd3f6e03841b3',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1b8fd3f6e03841b3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_1b8fd3f6e03841b3',
  'political_assignment', '{"constituency_inec": "RONI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1b8fd3f6e03841b3', 'prof_1b8fd3f6e03841b3',
  'Muhammad Lawan Dansure',
  'muhammad lawan dansure jigawa state assembly roni apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Abubakar Saidu Mohammed -- S/Tankara (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6ae6dc41d1432917', 'Abubakar Saidu Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6ae6dc41d1432917', 'ind_6ae6dc41d1432917', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Saidu Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6ae6dc41d1432917', 'prof_6ae6dc41d1432917',
  'Member, Jigawa State House of Assembly (S/TANKARA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6ae6dc41d1432917', 'ind_6ae6dc41d1432917', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6ae6dc41d1432917', 'ind_6ae6dc41d1432917', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6ae6dc41d1432917', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|s/tankara|2023',
  'insert', 'ind_6ae6dc41d1432917',
  'Unique: Jigawa S/Tankara seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6ae6dc41d1432917', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_6ae6dc41d1432917', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6ae6dc41d1432917', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_s/tankara',
  'ind_6ae6dc41d1432917', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6ae6dc41d1432917', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa S/Tankara', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6ae6dc41d1432917', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_6ae6dc41d1432917',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6ae6dc41d1432917', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_6ae6dc41d1432917',
  'political_assignment', '{"constituency_inec": "S/TANKARA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6ae6dc41d1432917', 'prof_6ae6dc41d1432917',
  'Abubakar Saidu Mohammed',
  'abubakar saidu mohammed jigawa state assembly s/tankara apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Shehu Dayyabu -- Taura (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_72172c0d5c6df5e3', 'Shehu Dayyabu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_72172c0d5c6df5e3', 'ind_72172c0d5c6df5e3', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Shehu Dayyabu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_72172c0d5c6df5e3', 'prof_72172c0d5c6df5e3',
  'Member, Jigawa State House of Assembly (TAURA)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_72172c0d5c6df5e3', 'ind_72172c0d5c6df5e3', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_72172c0d5c6df5e3', 'ind_72172c0d5c6df5e3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_72172c0d5c6df5e3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|taura|2023',
  'insert', 'ind_72172c0d5c6df5e3',
  'Unique: Jigawa Taura seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_72172c0d5c6df5e3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_72172c0d5c6df5e3', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_72172c0d5c6df5e3', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_taura',
  'ind_72172c0d5c6df5e3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_72172c0d5c6df5e3', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Taura', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_72172c0d5c6df5e3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_72172c0d5c6df5e3',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_72172c0d5c6df5e3', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_72172c0d5c6df5e3',
  'political_assignment', '{"constituency_inec": "TAURA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_72172c0d5c6df5e3', 'prof_72172c0d5c6df5e3',
  'Shehu Dayyabu',
  'shehu dayyabu jigawa state assembly taura apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Saleh Yawale A. -- Yankwashi (ADC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7706995884111872', 'Saleh Yawale A.',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7706995884111872', 'ind_7706995884111872', 'individual', 'place_state_jigawa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Saleh Yawale A.', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7706995884111872', 'prof_7706995884111872',
  'Member, Jigawa State House of Assembly (YANKWASHI)',
  'place_state_jigawa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7706995884111872', 'ind_7706995884111872', 'term_ng_jigawa_state_assembly_10th_2023_2027',
  'place_state_jigawa', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7706995884111872', 'ind_7706995884111872', 'org_political_party_adc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7706995884111872', 'seed_run_s05_political_jigawa_roster_20260502', 'individual',
  'ng_state_assembly_member|jigawa|yankwashi|2023',
  'insert', 'ind_7706995884111872',
  'Unique: Jigawa Yankwashi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7706995884111872', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7706995884111872', 'seed_source_nigerianleaders_jigawa_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7706995884111872', 'seed_run_s05_political_jigawa_roster_20260502', 'seed_source_nigerianleaders_jigawa_assembly_20260502',
  'nl_jigawa_assembly_2023_yankwashi',
  'ind_7706995884111872', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7706995884111872', 'seed_run_s05_political_jigawa_roster_20260502',
  'Jigawa Yankwashi', 'place_state_jigawa', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7706995884111872', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7706995884111872',
  'seed_source_nigerianleaders_jigawa_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7706995884111872', 'seed_run_s05_political_jigawa_roster_20260502', 'individual', 'ind_7706995884111872',
  'political_assignment', '{"constituency_inec": "YANKWASHI", "party_abbrev": "ADC", "position": "Member", "source_url": "https://nigerianleaders.com/jigawa-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7706995884111872', 'prof_7706995884111872',
  'Saleh Yawale A.',
  'saleh yawale a. jigawa state assembly yankwashi adc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_jigawa',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
