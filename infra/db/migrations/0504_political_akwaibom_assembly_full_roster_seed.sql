-- ============================================================
-- Migration 0504: Akwa Ibom State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Akwa Ibom State House of Assembly Members
-- Members seeded: 26/26
-- Party breakdown: Unknown:26
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'NigerianLeaders – Complete List of Akwa Ibom State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_akwaibom_roster_20260502', 'S05 Batch – Akwa Ibom State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_akwaibom_roster_20260502',
  'seed_run_s05_political_akwaibom_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0504_political_akwaibom_assembly_full_roster_seed.sql',
  NULL, 26,
  '26/26 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'Akwa Ibom State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_akwaibom',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (26 of 26 seats) ──────────────────────────────────────

-- 01. Udeme Otong -- Abak
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1dc429143a9bb397', 'Udeme Otong',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1dc429143a9bb397', 'ind_1dc429143a9bb397', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Udeme Otong', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1dc429143a9bb397', 'prof_1dc429143a9bb397',
  'Member, Akwa Ibom State House of Assembly (ABAK)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1dc429143a9bb397', 'ind_1dc429143a9bb397', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1dc429143a9bb397', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|abak|2023',
  'insert', 'ind_1dc429143a9bb397',
  'Unique: Akwa Ibom Abak seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1dc429143a9bb397', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1dc429143a9bb397', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1dc429143a9bb397', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_abak',
  'ind_1dc429143a9bb397', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1dc429143a9bb397', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Abak', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1dc429143a9bb397', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1dc429143a9bb397',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1dc429143a9bb397', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1dc429143a9bb397',
  'political_assignment', '{"constituency_inec": "ABAK", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1dc429143a9bb397', 'prof_1dc429143a9bb397',
  'Udeme Otong',
  'udeme otong akwa ibom state assembly abak  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Nsidibe Akata -- Eket
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e1314b14b191af20', 'Nsidibe Akata',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e1314b14b191af20', 'ind_e1314b14b191af20', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nsidibe Akata', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e1314b14b191af20', 'prof_e1314b14b191af20',
  'Member, Akwa Ibom State House of Assembly (EKET)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e1314b14b191af20', 'ind_e1314b14b191af20', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e1314b14b191af20', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|eket|2023',
  'insert', 'ind_e1314b14b191af20',
  'Unique: Akwa Ibom Eket seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e1314b14b191af20', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_e1314b14b191af20', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e1314b14b191af20', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_eket',
  'ind_e1314b14b191af20', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e1314b14b191af20', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Eket', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e1314b14b191af20', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_e1314b14b191af20',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e1314b14b191af20', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_e1314b14b191af20',
  'political_assignment', '{"constituency_inec": "EKET", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e1314b14b191af20', 'prof_e1314b14b191af20',
  'Nsidibe Akata',
  'nsidibe akata akwa ibom state assembly eket  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Udobia Friday Udo -- Esit Eket/Ibeno
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7bcf6b0b4dd65c4e', 'Udobia Friday Udo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7bcf6b0b4dd65c4e', 'ind_7bcf6b0b4dd65c4e', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Udobia Friday Udo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7bcf6b0b4dd65c4e', 'prof_7bcf6b0b4dd65c4e',
  'Member, Akwa Ibom State House of Assembly (ESIT EKET/IBENO)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7bcf6b0b4dd65c4e', 'ind_7bcf6b0b4dd65c4e', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7bcf6b0b4dd65c4e', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|esit eket/ibeno|2023',
  'insert', 'ind_7bcf6b0b4dd65c4e',
  'Unique: Akwa Ibom Esit Eket/Ibeno seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7bcf6b0b4dd65c4e', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_7bcf6b0b4dd65c4e', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7bcf6b0b4dd65c4e', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_esit_eket/ibeno',
  'ind_7bcf6b0b4dd65c4e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7bcf6b0b4dd65c4e', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Esit Eket/Ibeno', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7bcf6b0b4dd65c4e', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_7bcf6b0b4dd65c4e',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7bcf6b0b4dd65c4e', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_7bcf6b0b4dd65c4e',
  'political_assignment', '{"constituency_inec": "ESIT EKET/IBENO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7bcf6b0b4dd65c4e', 'prof_7bcf6b0b4dd65c4e',
  'Udobia Friday Udo',
  'udobia friday udo akwa ibom state assembly esit eket/ibeno  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Prince Ukpong Akpabio -- Essien Udim
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bef9e31553adfd8c', 'Prince Ukpong Akpabio',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bef9e31553adfd8c', 'ind_bef9e31553adfd8c', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Prince Ukpong Akpabio', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bef9e31553adfd8c', 'prof_bef9e31553adfd8c',
  'Member, Akwa Ibom State House of Assembly (ESSIEN UDIM)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bef9e31553adfd8c', 'ind_bef9e31553adfd8c', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bef9e31553adfd8c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|essien udim|2023',
  'insert', 'ind_bef9e31553adfd8c',
  'Unique: Akwa Ibom Essien Udim seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bef9e31553adfd8c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_bef9e31553adfd8c', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bef9e31553adfd8c', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_essien_udim',
  'ind_bef9e31553adfd8c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bef9e31553adfd8c', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Essien Udim', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bef9e31553adfd8c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_bef9e31553adfd8c',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bef9e31553adfd8c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_bef9e31553adfd8c',
  'political_assignment', '{"constituency_inec": "ESSIEN UDIM", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bef9e31553adfd8c', 'prof_bef9e31553adfd8c',
  'Prince Ukpong Akpabio',
  'prince ukpong akpabio akwa ibom state assembly essien udim  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Mfon Idung -- Etim Ekpo/Ika
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_39f34ff5e2afefeb', 'Mfon Idung',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_39f34ff5e2afefeb', 'ind_39f34ff5e2afefeb', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mfon Idung', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_39f34ff5e2afefeb', 'prof_39f34ff5e2afefeb',
  'Member, Akwa Ibom State House of Assembly (ETIM EKPO/IKA)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_39f34ff5e2afefeb', 'ind_39f34ff5e2afefeb', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_39f34ff5e2afefeb', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|etim ekpo/ika|2023',
  'insert', 'ind_39f34ff5e2afefeb',
  'Unique: Akwa Ibom Etim Ekpo/Ika seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_39f34ff5e2afefeb', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_39f34ff5e2afefeb', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_39f34ff5e2afefeb', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_etim_ekpo/ika',
  'ind_39f34ff5e2afefeb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_39f34ff5e2afefeb', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Etim Ekpo/Ika', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_39f34ff5e2afefeb', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_39f34ff5e2afefeb',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_39f34ff5e2afefeb', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_39f34ff5e2afefeb',
  'political_assignment', '{"constituency_inec": "ETIM EKPO/IKA", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_39f34ff5e2afefeb', 'prof_39f34ff5e2afefeb',
  'Mfon Idung',
  'mfon idung akwa ibom state assembly etim ekpo/ika  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Uduak Obong Ekpo -- Etinan
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f115c1ccad66f994', 'Uduak Obong Ekpo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f115c1ccad66f994', 'ind_f115c1ccad66f994', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Uduak Obong Ekpo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f115c1ccad66f994', 'prof_f115c1ccad66f994',
  'Member, Akwa Ibom State House of Assembly (ETINAN)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f115c1ccad66f994', 'ind_f115c1ccad66f994', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f115c1ccad66f994', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|etinan|2023',
  'insert', 'ind_f115c1ccad66f994',
  'Unique: Akwa Ibom Etinan seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f115c1ccad66f994', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_f115c1ccad66f994', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f115c1ccad66f994', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_etinan',
  'ind_f115c1ccad66f994', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f115c1ccad66f994', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Etinan', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f115c1ccad66f994', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_f115c1ccad66f994',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f115c1ccad66f994', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_f115c1ccad66f994',
  'political_assignment', '{"constituency_inec": "ETINAN", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f115c1ccad66f994', 'prof_f115c1ccad66f994',
  'Uduak Obong Ekpo',
  'uduak obong ekpo akwa ibom state assembly etinan  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Ubong Attah -- Ibesikpo Asutan
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_672875f4cf70b930', 'Ubong Attah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_672875f4cf70b930', 'ind_672875f4cf70b930', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ubong Attah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_672875f4cf70b930', 'prof_672875f4cf70b930',
  'Member, Akwa Ibom State House of Assembly (IBESIKPO ASUTAN)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_672875f4cf70b930', 'ind_672875f4cf70b930', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_672875f4cf70b930', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|ibesikpo asutan|2023',
  'insert', 'ind_672875f4cf70b930',
  'Unique: Akwa Ibom Ibesikpo Asutan seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_672875f4cf70b930', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_672875f4cf70b930', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_672875f4cf70b930', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_ibesikpo_asutan',
  'ind_672875f4cf70b930', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_672875f4cf70b930', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Ibesikpo Asutan', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_672875f4cf70b930', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_672875f4cf70b930',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_672875f4cf70b930', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_672875f4cf70b930',
  'political_assignment', '{"constituency_inec": "IBESIKPO ASUTAN", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_672875f4cf70b930', 'prof_672875f4cf70b930',
  'Ubong Attah',
  'ubong attah akwa ibom state assembly ibesikpo asutan  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Moses Essien -- Ibiono Ibom
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_674a9f3d96dc681c', 'Moses Essien',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_674a9f3d96dc681c', 'ind_674a9f3d96dc681c', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Moses Essien', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_674a9f3d96dc681c', 'prof_674a9f3d96dc681c',
  'Member, Akwa Ibom State House of Assembly (IBIONO IBOM)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_674a9f3d96dc681c', 'ind_674a9f3d96dc681c', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_674a9f3d96dc681c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|ibiono ibom|2023',
  'insert', 'ind_674a9f3d96dc681c',
  'Unique: Akwa Ibom Ibiono Ibom seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_674a9f3d96dc681c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_674a9f3d96dc681c', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_674a9f3d96dc681c', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_ibiono_ibom',
  'ind_674a9f3d96dc681c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_674a9f3d96dc681c', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Ibiono Ibom', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_674a9f3d96dc681c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_674a9f3d96dc681c',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_674a9f3d96dc681c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_674a9f3d96dc681c',
  'political_assignment', '{"constituency_inec": "IBIONO IBOM", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_674a9f3d96dc681c', 'prof_674a9f3d96dc681c',
  'Moses Essien',
  'moses essien akwa ibom state assembly ibiono ibom  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Asuquo Nana Udo -- Ikono
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_58e5498ef8b8f23a', 'Asuquo Nana Udo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_58e5498ef8b8f23a', 'ind_58e5498ef8b8f23a', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Asuquo Nana Udo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_58e5498ef8b8f23a', 'prof_58e5498ef8b8f23a',
  'Member, Akwa Ibom State House of Assembly (IKONO)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_58e5498ef8b8f23a', 'ind_58e5498ef8b8f23a', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_58e5498ef8b8f23a', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|ikono|2023',
  'insert', 'ind_58e5498ef8b8f23a',
  'Unique: Akwa Ibom Ikono seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_58e5498ef8b8f23a', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_58e5498ef8b8f23a', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_58e5498ef8b8f23a', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_ikono',
  'ind_58e5498ef8b8f23a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_58e5498ef8b8f23a', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Ikono', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_58e5498ef8b8f23a', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_58e5498ef8b8f23a',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_58e5498ef8b8f23a', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_58e5498ef8b8f23a',
  'political_assignment', '{"constituency_inec": "IKONO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_58e5498ef8b8f23a', 'prof_58e5498ef8b8f23a',
  'Asuquo Nana Udo',
  'asuquo nana udo akwa ibom state assembly ikono  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Mrs. Selinau Ukpatu -- Ikot Abasi/Eastern Obolo
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1aaead739d04e111', 'Mrs. Selinau Ukpatu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1aaead739d04e111', 'ind_1aaead739d04e111', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mrs. Selinau Ukpatu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1aaead739d04e111', 'prof_1aaead739d04e111',
  'Member, Akwa Ibom State House of Assembly (IKOT ABASI/EASTERN OBOLO)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1aaead739d04e111', 'ind_1aaead739d04e111', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1aaead739d04e111', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|ikot abasi/eastern obolo|2023',
  'insert', 'ind_1aaead739d04e111',
  'Unique: Akwa Ibom Ikot Abasi/Eastern Obolo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1aaead739d04e111', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1aaead739d04e111', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1aaead739d04e111', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_ikot_abasi/eastern_obolo',
  'ind_1aaead739d04e111', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1aaead739d04e111', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Ikot Abasi/Eastern Obolo', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1aaead739d04e111', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1aaead739d04e111',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1aaead739d04e111', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1aaead739d04e111',
  'political_assignment', '{"constituency_inec": "IKOT ABASI/EASTERN OBOLO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1aaead739d04e111', 'prof_1aaead739d04e111',
  'Mrs. Selinau Ukpatu',
  'mrs. selinau ukpatu akwa ibom state assembly ikot abasi/eastern obolo  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Jerry Anson Otu -- Ikot Ekpene/Obot Akara
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_81c637df17da1975', 'Jerry Anson Otu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_81c637df17da1975', 'ind_81c637df17da1975', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jerry Anson Otu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_81c637df17da1975', 'prof_81c637df17da1975',
  'Member, Akwa Ibom State House of Assembly (IKOT EKPENE/OBOT AKARA)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_81c637df17da1975', 'ind_81c637df17da1975', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_81c637df17da1975', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|ikot ekpene/obot akara|2023',
  'insert', 'ind_81c637df17da1975',
  'Unique: Akwa Ibom Ikot Ekpene/Obot Akara seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_81c637df17da1975', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_81c637df17da1975', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_81c637df17da1975', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_ikot_ekpene/obot_akara',
  'ind_81c637df17da1975', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_81c637df17da1975', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Ikot Ekpene/Obot Akara', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_81c637df17da1975', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_81c637df17da1975',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_81c637df17da1975', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_81c637df17da1975',
  'political_assignment', '{"constituency_inec": "IKOT EKPENE/OBOT AKARA", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_81c637df17da1975', 'prof_81c637df17da1975',
  'Jerry Anson Otu',
  'jerry anson otu akwa ibom state assembly ikot ekpene/obot akara  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Lawrence Udoide -- Ini
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bf888150bb77c193', 'Lawrence Udoide',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bf888150bb77c193', 'ind_bf888150bb77c193', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lawrence Udoide', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bf888150bb77c193', 'prof_bf888150bb77c193',
  'Member, Akwa Ibom State House of Assembly (INI)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bf888150bb77c193', 'ind_bf888150bb77c193', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bf888150bb77c193', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|ini|2023',
  'insert', 'ind_bf888150bb77c193',
  'Unique: Akwa Ibom Ini seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bf888150bb77c193', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_bf888150bb77c193', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bf888150bb77c193', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_ini',
  'ind_bf888150bb77c193', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bf888150bb77c193', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Ini', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bf888150bb77c193', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_bf888150bb77c193',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bf888150bb77c193', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_bf888150bb77c193',
  'political_assignment', '{"constituency_inec": "INI", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bf888150bb77c193', 'prof_bf888150bb77c193',
  'Lawrence Udoide',
  'lawrence udoide akwa ibom state assembly ini  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 13. KufreAbasi Edidem -- Itu
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_127f5e17e8ab25e5', 'KufreAbasi Edidem',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_127f5e17e8ab25e5', 'ind_127f5e17e8ab25e5', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'KufreAbasi Edidem', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_127f5e17e8ab25e5', 'prof_127f5e17e8ab25e5',
  'Member, Akwa Ibom State House of Assembly (ITU)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_127f5e17e8ab25e5', 'ind_127f5e17e8ab25e5', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_127f5e17e8ab25e5', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|itu|2023',
  'insert', 'ind_127f5e17e8ab25e5',
  'Unique: Akwa Ibom Itu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_127f5e17e8ab25e5', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_127f5e17e8ab25e5', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_127f5e17e8ab25e5', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_itu',
  'ind_127f5e17e8ab25e5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_127f5e17e8ab25e5', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Itu', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_127f5e17e8ab25e5', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_127f5e17e8ab25e5',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_127f5e17e8ab25e5', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_127f5e17e8ab25e5',
  'political_assignment', '{"constituency_inec": "ITU", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_127f5e17e8ab25e5', 'prof_127f5e17e8ab25e5',
  'KufreAbasi Edidem',
  'kufreabasi edidem akwa ibom state assembly itu  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Effiong Johnson -- Mbo
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1d9a569d63ee1b6d', 'Effiong Johnson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1d9a569d63ee1b6d', 'ind_1d9a569d63ee1b6d', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Effiong Johnson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1d9a569d63ee1b6d', 'prof_1d9a569d63ee1b6d',
  'Member, Akwa Ibom State House of Assembly (MBO)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1d9a569d63ee1b6d', 'ind_1d9a569d63ee1b6d', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1d9a569d63ee1b6d', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|mbo|2023',
  'insert', 'ind_1d9a569d63ee1b6d',
  'Unique: Akwa Ibom Mbo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1d9a569d63ee1b6d', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1d9a569d63ee1b6d', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1d9a569d63ee1b6d', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_mbo',
  'ind_1d9a569d63ee1b6d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1d9a569d63ee1b6d', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Mbo', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1d9a569d63ee1b6d', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1d9a569d63ee1b6d',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1d9a569d63ee1b6d', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1d9a569d63ee1b6d',
  'political_assignment', '{"constituency_inec": "MBO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1d9a569d63ee1b6d', 'prof_1d9a569d63ee1b6d',
  'Effiong Johnson',
  'effiong johnson akwa ibom state assembly mbo  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Uwem Peter -- Mkpat Enin
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cff59c53f5180473', 'Uwem Peter',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cff59c53f5180473', 'ind_cff59c53f5180473', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Uwem Peter', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cff59c53f5180473', 'prof_cff59c53f5180473',
  'Member, Akwa Ibom State House of Assembly (MKPAT ENIN)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cff59c53f5180473', 'ind_cff59c53f5180473', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cff59c53f5180473', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|mkpat enin|2023',
  'insert', 'ind_cff59c53f5180473',
  'Unique: Akwa Ibom Mkpat Enin seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cff59c53f5180473', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_cff59c53f5180473', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cff59c53f5180473', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_mkpat_enin',
  'ind_cff59c53f5180473', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cff59c53f5180473', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Mkpat Enin', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cff59c53f5180473', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_cff59c53f5180473',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cff59c53f5180473', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_cff59c53f5180473',
  'political_assignment', '{"constituency_inec": "MKPAT ENIN", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cff59c53f5180473', 'prof_cff59c53f5180473',
  'Uwem Peter',
  'uwem peter akwa ibom state assembly mkpat enin  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Prince-Aniefok Okon -- Nsit Atai
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1297f583fc2dfb0c', 'Prince-Aniefok Okon',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1297f583fc2dfb0c', 'ind_1297f583fc2dfb0c', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Prince-Aniefok Okon', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1297f583fc2dfb0c', 'prof_1297f583fc2dfb0c',
  'Member, Akwa Ibom State House of Assembly (NSIT ATAI)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1297f583fc2dfb0c', 'ind_1297f583fc2dfb0c', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1297f583fc2dfb0c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|nsit atai|2023',
  'insert', 'ind_1297f583fc2dfb0c',
  'Unique: Akwa Ibom Nsit Atai seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1297f583fc2dfb0c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1297f583fc2dfb0c', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1297f583fc2dfb0c', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_nsit_atai',
  'ind_1297f583fc2dfb0c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1297f583fc2dfb0c', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Nsit Atai', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1297f583fc2dfb0c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1297f583fc2dfb0c',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1297f583fc2dfb0c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_1297f583fc2dfb0c',
  'political_assignment', '{"constituency_inec": "NSIT ATAI", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1297f583fc2dfb0c', 'prof_1297f583fc2dfb0c',
  'Prince-Aniefok Okon',
  'prince-aniefok okon akwa ibom state assembly nsit atai  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Eric Akpan -- Nsit Ibom
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5079fb0d24993235', 'Eric Akpan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5079fb0d24993235', 'ind_5079fb0d24993235', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Eric Akpan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5079fb0d24993235', 'prof_5079fb0d24993235',
  'Member, Akwa Ibom State House of Assembly (NSIT IBOM)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5079fb0d24993235', 'ind_5079fb0d24993235', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5079fb0d24993235', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|nsit ibom|2023',
  'insert', 'ind_5079fb0d24993235',
  'Unique: Akwa Ibom Nsit Ibom seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5079fb0d24993235', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_5079fb0d24993235', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5079fb0d24993235', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_nsit_ibom',
  'ind_5079fb0d24993235', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5079fb0d24993235', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Nsit Ibom', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5079fb0d24993235', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_5079fb0d24993235',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5079fb0d24993235', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_5079fb0d24993235',
  'political_assignment', '{"constituency_inec": "NSIT IBOM", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5079fb0d24993235', 'prof_5079fb0d24993235',
  'Eric Akpan',
  'eric akpan akwa ibom state assembly nsit ibom  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Otobong Bob -- Nsit Ubium
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ac142a9d3a97219c', 'Otobong Bob',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ac142a9d3a97219c', 'ind_ac142a9d3a97219c', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Otobong Bob', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ac142a9d3a97219c', 'prof_ac142a9d3a97219c',
  'Member, Akwa Ibom State House of Assembly (NSIT UBIUM)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ac142a9d3a97219c', 'ind_ac142a9d3a97219c', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ac142a9d3a97219c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|nsit ubium|2023',
  'insert', 'ind_ac142a9d3a97219c',
  'Unique: Akwa Ibom Nsit Ubium seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ac142a9d3a97219c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_ac142a9d3a97219c', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ac142a9d3a97219c', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_nsit_ubium',
  'ind_ac142a9d3a97219c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ac142a9d3a97219c', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Nsit Ubium', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ac142a9d3a97219c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_ac142a9d3a97219c',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ac142a9d3a97219c', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_ac142a9d3a97219c',
  'political_assignment', '{"constituency_inec": "NSIT UBIUM", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ac142a9d3a97219c', 'prof_ac142a9d3a97219c',
  'Otobong Bob',
  'otobong bob akwa ibom state assembly nsit ubium  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Bassey Pius Bassey -- Okobo
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3f4ab8dd7e8aaf69', 'Bassey Pius Bassey',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3f4ab8dd7e8aaf69', 'ind_3f4ab8dd7e8aaf69', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bassey Pius Bassey', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3f4ab8dd7e8aaf69', 'prof_3f4ab8dd7e8aaf69',
  'Member, Akwa Ibom State House of Assembly (OKOBO)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3f4ab8dd7e8aaf69', 'ind_3f4ab8dd7e8aaf69', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3f4ab8dd7e8aaf69', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|okobo|2023',
  'insert', 'ind_3f4ab8dd7e8aaf69',
  'Unique: Akwa Ibom Okobo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3f4ab8dd7e8aaf69', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_3f4ab8dd7e8aaf69', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3f4ab8dd7e8aaf69', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_okobo',
  'ind_3f4ab8dd7e8aaf69', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3f4ab8dd7e8aaf69', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Okobo', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3f4ab8dd7e8aaf69', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_3f4ab8dd7e8aaf69',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3f4ab8dd7e8aaf69', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_3f4ab8dd7e8aaf69',
  'political_assignment', '{"constituency_inec": "OKOBO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3f4ab8dd7e8aaf69', 'prof_3f4ab8dd7e8aaf69',
  'Bassey Pius Bassey',
  'bassey pius bassey akwa ibom state assembly okobo  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Otuekong Nse Essien -- Onna
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d07e83b9ba8e8c8a', 'Otuekong Nse Essien',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d07e83b9ba8e8c8a', 'ind_d07e83b9ba8e8c8a', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Otuekong Nse Essien', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d07e83b9ba8e8c8a', 'prof_d07e83b9ba8e8c8a',
  'Member, Akwa Ibom State House of Assembly (ONNA)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d07e83b9ba8e8c8a', 'ind_d07e83b9ba8e8c8a', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d07e83b9ba8e8c8a', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|onna|2023',
  'insert', 'ind_d07e83b9ba8e8c8a',
  'Unique: Akwa Ibom Onna seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d07e83b9ba8e8c8a', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_d07e83b9ba8e8c8a', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d07e83b9ba8e8c8a', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_onna',
  'ind_d07e83b9ba8e8c8a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d07e83b9ba8e8c8a', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Onna', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d07e83b9ba8e8c8a', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_d07e83b9ba8e8c8a',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d07e83b9ba8e8c8a', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_d07e83b9ba8e8c8a',
  'political_assignment', '{"constituency_inec": "ONNA", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d07e83b9ba8e8c8a', 'prof_d07e83b9ba8e8c8a',
  'Otuekong Nse Essien',
  'otuekong nse essien akwa ibom state assembly onna  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Mrs. Kenim Victor -- Oron/Udung Uko
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b4daabd41dceb6ec', 'Mrs. Kenim Victor',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b4daabd41dceb6ec', 'ind_b4daabd41dceb6ec', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mrs. Kenim Victor', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b4daabd41dceb6ec', 'prof_b4daabd41dceb6ec',
  'Member, Akwa Ibom State House of Assembly (ORON/UDUNG UKO)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b4daabd41dceb6ec', 'ind_b4daabd41dceb6ec', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b4daabd41dceb6ec', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|oron/udung uko|2023',
  'insert', 'ind_b4daabd41dceb6ec',
  'Unique: Akwa Ibom Oron/Udung Uko seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b4daabd41dceb6ec', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_b4daabd41dceb6ec', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b4daabd41dceb6ec', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_oron/udung_uko',
  'ind_b4daabd41dceb6ec', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b4daabd41dceb6ec', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Oron/Udung Uko', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b4daabd41dceb6ec', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_b4daabd41dceb6ec',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b4daabd41dceb6ec', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_b4daabd41dceb6ec',
  'political_assignment', '{"constituency_inec": "ORON/UDUNG UKO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b4daabd41dceb6ec', 'prof_b4daabd41dceb6ec',
  'Mrs. Kenim Victor',
  'mrs. kenim victor akwa ibom state assembly oron/udung uko  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Samson Idiong -- Oruk Anam
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_096f5c9c8879eb2d', 'Samson Idiong',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_096f5c9c8879eb2d', 'ind_096f5c9c8879eb2d', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Samson Idiong', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_096f5c9c8879eb2d', 'prof_096f5c9c8879eb2d',
  'Member, Akwa Ibom State House of Assembly (ORUK ANAM)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_096f5c9c8879eb2d', 'ind_096f5c9c8879eb2d', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_096f5c9c8879eb2d', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|oruk anam|2023',
  'insert', 'ind_096f5c9c8879eb2d',
  'Unique: Akwa Ibom Oruk Anam seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_096f5c9c8879eb2d', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_096f5c9c8879eb2d', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_096f5c9c8879eb2d', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_oruk_anam',
  'ind_096f5c9c8879eb2d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_096f5c9c8879eb2d', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Oruk Anam', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_096f5c9c8879eb2d', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_096f5c9c8879eb2d',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_096f5c9c8879eb2d', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_096f5c9c8879eb2d',
  'political_assignment', '{"constituency_inec": "ORUK ANAM", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_096f5c9c8879eb2d', 'prof_096f5c9c8879eb2d',
  'Samson Idiong',
  'samson idiong akwa ibom state assembly oruk anam  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Emem Etokabasi Udom -- Ukanafun
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d7eb36aa1805071b', 'Emem Etokabasi Udom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d7eb36aa1805071b', 'ind_d7eb36aa1805071b', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emem Etokabasi Udom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d7eb36aa1805071b', 'prof_d7eb36aa1805071b',
  'Member, Akwa Ibom State House of Assembly (UKANAFUN)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d7eb36aa1805071b', 'ind_d7eb36aa1805071b', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d7eb36aa1805071b', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|ukanafun|2023',
  'insert', 'ind_d7eb36aa1805071b',
  'Unique: Akwa Ibom Ukanafun seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d7eb36aa1805071b', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_d7eb36aa1805071b', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d7eb36aa1805071b', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_ukanafun',
  'ind_d7eb36aa1805071b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d7eb36aa1805071b', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Ukanafun', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d7eb36aa1805071b', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_d7eb36aa1805071b',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d7eb36aa1805071b', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_d7eb36aa1805071b',
  'political_assignment', '{"constituency_inec": "UKANAFUN", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d7eb36aa1805071b', 'prof_d7eb36aa1805071b',
  'Emem Etokabasi Udom',
  'emem etokabasi udom akwa ibom state assembly ukanafun  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Itorobong Etim -- Uruan
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c4b64c180dc336f3', 'Itorobong Etim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c4b64c180dc336f3', 'ind_c4b64c180dc336f3', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Itorobong Etim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c4b64c180dc336f3', 'prof_c4b64c180dc336f3',
  'Member, Akwa Ibom State House of Assembly (URUAN)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c4b64c180dc336f3', 'ind_c4b64c180dc336f3', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c4b64c180dc336f3', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|uruan|2023',
  'insert', 'ind_c4b64c180dc336f3',
  'Unique: Akwa Ibom Uruan seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c4b64c180dc336f3', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_c4b64c180dc336f3', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c4b64c180dc336f3', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_uruan',
  'ind_c4b64c180dc336f3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c4b64c180dc336f3', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Uruan', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c4b64c180dc336f3', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_c4b64c180dc336f3',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c4b64c180dc336f3', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_c4b64c180dc336f3',
  'political_assignment', '{"constituency_inec": "URUAN", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c4b64c180dc336f3', 'prof_c4b64c180dc336f3',
  'Itorobong Etim',
  'itorobong etim akwa ibom state assembly uruan  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Mrs. Precious Selong -- Urue Offong/Oruko
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_116569f265ea3fe2', 'Mrs. Precious Selong',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_116569f265ea3fe2', 'ind_116569f265ea3fe2', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mrs. Precious Selong', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_116569f265ea3fe2', 'prof_116569f265ea3fe2',
  'Member, Akwa Ibom State House of Assembly (URUE OFFONG/ORUKO)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_116569f265ea3fe2', 'ind_116569f265ea3fe2', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_116569f265ea3fe2', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|urue offong/oruko|2023',
  'insert', 'ind_116569f265ea3fe2',
  'Unique: Akwa Ibom Urue Offong/Oruko seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_116569f265ea3fe2', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_116569f265ea3fe2', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_116569f265ea3fe2', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_urue_offong/oruko',
  'ind_116569f265ea3fe2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_116569f265ea3fe2', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Urue Offong/Oruko', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_116569f265ea3fe2', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_116569f265ea3fe2',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_116569f265ea3fe2', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_116569f265ea3fe2',
  'political_assignment', '{"constituency_inec": "URUE OFFONG/ORUKO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_116569f265ea3fe2', 'prof_116569f265ea3fe2',
  'Mrs. Precious Selong',
  'mrs. precious selong akwa ibom state assembly urue offong/oruko  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Uwemedimo Dianabasi -- Uyo
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4d4590b4cc8ee987', 'Uwemedimo Dianabasi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4d4590b4cc8ee987', 'ind_4d4590b4cc8ee987', 'individual', 'place_state_akwaibom',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Uwemedimo Dianabasi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4d4590b4cc8ee987', 'prof_4d4590b4cc8ee987',
  'Member, Akwa Ibom State House of Assembly (UYO)',
  'place_state_akwaibom', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4d4590b4cc8ee987', 'ind_4d4590b4cc8ee987', 'term_ng_akwaibom_state_assembly_10th_2023_2027',
  'place_state_akwaibom', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4d4590b4cc8ee987', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual',
  'ng_state_assembly_member|akwa_ibom|uyo|2023',
  'insert', 'ind_4d4590b4cc8ee987',
  'Unique: Akwa Ibom Uyo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4d4590b4cc8ee987', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_4d4590b4cc8ee987', 'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4d4590b4cc8ee987', 'seed_run_s05_political_akwaibom_roster_20260502', 'seed_source_nigerianleaders_akwaibom_assembly_20260502',
  'nl_akwa_ibom_assembly_2023_uyo',
  'ind_4d4590b4cc8ee987', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4d4590b4cc8ee987', 'seed_run_s05_political_akwaibom_roster_20260502',
  'Akwa Ibom Uyo', 'place_state_akwaibom', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4d4590b4cc8ee987', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_4d4590b4cc8ee987',
  'seed_source_nigerianleaders_akwaibom_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4d4590b4cc8ee987', 'seed_run_s05_political_akwaibom_roster_20260502', 'individual', 'ind_4d4590b4cc8ee987',
  'political_assignment', '{"constituency_inec": "UYO", "party_abbrev": "Unknown", "position": "Member", "source_url": "https://nigerianleaders.com/akwa-ibom-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4d4590b4cc8ee987', 'prof_4d4590b4cc8ee987',
  'Uwemedimo Dianabasi',
  'uwemedimo dianabasi akwa ibom state assembly uyo  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_akwaibom',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;
