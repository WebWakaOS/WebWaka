-- ============================================================
-- Migration 0529: Taraba State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Taraba State House of Assembly Members
-- Members seeded: 22/24
-- Party breakdown: APC:7, PDP:7, AA:4, SDP:1, AAC:1, NNPP:1, A:1
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_taraba_assembly_20260502',
  'NigerianLeaders – Complete List of Taraba State House of Assembly Members',
  'editorial_aggregator', 'https://nigerianleaders.com/taraba-state-house-of-assembly-members/', 'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_taraba_roster_20260502', 'S05 Batch – Taraba State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_taraba_roster_20260502', 'seed_run_s05_political_taraba_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0529_political_taraba_assembly_full_roster_seed.sql', NULL, 22,
  '22/24 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_taraba_state_assembly_10th_2023_2027',
  'Taraba State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023', 'state', 'state_assembly_member',
  'place_state_taraba', '2023-06-13', '2027-06-12', unixepoch(), unixepoch()
);

-- ── Members (22 of 24 seats) ──────────────────────────────────────

-- 01. Maikudi Gambo -- Bali I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6559066b719c18fa', 'Maikudi Gambo',
  'Maikudi', 'Gambo', 'Maikudi Gambo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6559066b719c18fa', 'ind_6559066b719c18fa', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Maikudi Gambo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6559066b719c18fa', 'prof_6559066b719c18fa',
  'Member, Taraba State House of Assembly (BALI I)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6559066b719c18fa', 'ind_6559066b719c18fa', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6559066b719c18fa', 'ind_6559066b719c18fa', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6559066b719c18fa', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|bali i|2023',
  'insert', 'ind_6559066b719c18fa',
  'Unique: Taraba Bali I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6559066b719c18fa', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6559066b719c18fa', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6559066b719c18fa', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_bali_i',
  'ind_6559066b719c18fa', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6559066b719c18fa', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Bali I', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6559066b719c18fa', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6559066b719c18fa',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6559066b719c18fa', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6559066b719c18fa',
  'political_assignment', '{"constituency_inec":"BALI I","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6559066b719c18fa', 'prof_6559066b719c18fa',
  'Maikudi Gambo',
  'maikudi gambo taraba state assembly bali i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Umar Kaura Abbas -- Gassol I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d0a7e5700d014024', 'Umar Kaura Abbas',
  'Umar', 'Abbas', 'Umar Kaura Abbas',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d0a7e5700d014024', 'ind_d0a7e5700d014024', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umar Kaura Abbas', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d0a7e5700d014024', 'prof_d0a7e5700d014024',
  'Member, Taraba State House of Assembly (GASSOL I)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d0a7e5700d014024', 'ind_d0a7e5700d014024', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d0a7e5700d014024', 'ind_d0a7e5700d014024', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d0a7e5700d014024', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|gassol i|2023',
  'insert', 'ind_d0a7e5700d014024',
  'Unique: Taraba Gassol I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d0a7e5700d014024', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_d0a7e5700d014024', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d0a7e5700d014024', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_gassol_i',
  'ind_d0a7e5700d014024', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d0a7e5700d014024', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Gassol I', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d0a7e5700d014024', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_d0a7e5700d014024',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d0a7e5700d014024', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_d0a7e5700d014024',
  'political_assignment', '{"constituency_inec":"GASSOL I","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d0a7e5700d014024', 'prof_d0a7e5700d014024',
  'Umar Kaura Abbas',
  'umar kaura abbas taraba state assembly gassol i pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Yahuza Abubakar Maidalailu -- Jalingo I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_12734197890b5db1', 'Yahuza Abubakar Maidalailu',
  'Yahuza', 'Maidalailu', 'Yahuza Abubakar Maidalailu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_12734197890b5db1', 'ind_12734197890b5db1', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yahuza Abubakar Maidalailu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_12734197890b5db1', 'prof_12734197890b5db1',
  'Member, Taraba State House of Assembly (JALINGO I)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_12734197890b5db1', 'ind_12734197890b5db1', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_12734197890b5db1', 'ind_12734197890b5db1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_12734197890b5db1', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|jalingo i|2023',
  'insert', 'ind_12734197890b5db1',
  'Unique: Taraba Jalingo I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_12734197890b5db1', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_12734197890b5db1', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_12734197890b5db1', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_jalingo_i',
  'ind_12734197890b5db1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_12734197890b5db1', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Jalingo I', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_12734197890b5db1', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_12734197890b5db1',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_12734197890b5db1', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_12734197890b5db1',
  'political_assignment', '{"constituency_inec":"JALINGO I","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_12734197890b5db1', 'prof_12734197890b5db1',
  'Yahuza Abubakar Maidalailu',
  'yahuza abubakar maidalailu taraba state assembly jalingo i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Adamu Annas Zaure -- Ardo-Kola (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6d0d85da0906805a', 'Adamu Annas Zaure',
  'Adamu', 'Zaure', 'Adamu Annas Zaure',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6d0d85da0906805a', 'ind_6d0d85da0906805a', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adamu Annas Zaure', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6d0d85da0906805a', 'prof_6d0d85da0906805a',
  'Member, Taraba State House of Assembly (ARDO-KOLA)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6d0d85da0906805a', 'ind_6d0d85da0906805a', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6d0d85da0906805a', 'ind_6d0d85da0906805a', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6d0d85da0906805a', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|ardo-kola|2023',
  'insert', 'ind_6d0d85da0906805a',
  'Unique: Taraba Ardo-Kola seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6d0d85da0906805a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6d0d85da0906805a', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6d0d85da0906805a', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_ardo-kola',
  'ind_6d0d85da0906805a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6d0d85da0906805a', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Ardo-Kola', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6d0d85da0906805a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6d0d85da0906805a',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6d0d85da0906805a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6d0d85da0906805a',
  'political_assignment', '{"constituency_inec":"ARDO-KOLA","party_abbrev":"AA","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6d0d85da0906805a', 'prof_6d0d85da0906805a',
  'Adamu Annas Zaure',
  'adamu annas zaure taraba state assembly ardo-kola aa politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Hon Garba Ajiya Samson -- Takum I (SDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_38ab9d4432ea20f1', 'Hon Garba Ajiya Samson',
  'Hon', 'Samson', 'Hon Garba Ajiya Samson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_38ab9d4432ea20f1', 'ind_38ab9d4432ea20f1', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hon Garba Ajiya Samson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_38ab9d4432ea20f1', 'prof_38ab9d4432ea20f1',
  'Member, Taraba State House of Assembly (TAKUM I)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_38ab9d4432ea20f1', 'ind_38ab9d4432ea20f1', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_38ab9d4432ea20f1', 'ind_38ab9d4432ea20f1', 'org_political_party_sdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_38ab9d4432ea20f1', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|takum i|2023',
  'insert', 'ind_38ab9d4432ea20f1',
  'Unique: Taraba Takum I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_38ab9d4432ea20f1', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_38ab9d4432ea20f1', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_38ab9d4432ea20f1', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_takum_i',
  'ind_38ab9d4432ea20f1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_38ab9d4432ea20f1', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Takum I', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_38ab9d4432ea20f1', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_38ab9d4432ea20f1',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_38ab9d4432ea20f1', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_38ab9d4432ea20f1',
  'political_assignment', '{"constituency_inec":"TAKUM I","party_abbrev":"SDP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_38ab9d4432ea20f1', 'prof_38ab9d4432ea20f1',
  'Hon Garba Ajiya Samson',
  'hon garba ajiya samson taraba state assembly takum i sdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Jedua Ahmad Dawud -- Gembu (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e603271c02abb325', 'Jedua Ahmad Dawud',
  'Jedua', 'Dawud', 'Jedua Ahmad Dawud',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e603271c02abb325', 'ind_e603271c02abb325', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jedua Ahmad Dawud', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e603271c02abb325', 'prof_e603271c02abb325',
  'Member, Taraba State House of Assembly (GEMBU)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e603271c02abb325', 'ind_e603271c02abb325', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e603271c02abb325', 'ind_e603271c02abb325', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e603271c02abb325', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|gembu|2023',
  'insert', 'ind_e603271c02abb325',
  'Unique: Taraba Gembu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e603271c02abb325', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_e603271c02abb325', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e603271c02abb325', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_gembu',
  'ind_e603271c02abb325', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e603271c02abb325', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Gembu', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e603271c02abb325', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_e603271c02abb325',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e603271c02abb325', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_e603271c02abb325',
  'political_assignment', '{"constituency_inec":"GEMBU","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e603271c02abb325', 'prof_e603271c02abb325',
  'Jedua Ahmad Dawud',
  'jedua ahmad dawud taraba state assembly gembu pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Mohammed Bashir -- Nguroje (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5bc43651624ddf3c', 'Mohammed Bashir',
  'Mohammed', 'Bashir', 'Mohammed Bashir',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5bc43651624ddf3c', 'ind_5bc43651624ddf3c', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Bashir', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5bc43651624ddf3c', 'prof_5bc43651624ddf3c',
  'Member, Taraba State House of Assembly (NGUROJE)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5bc43651624ddf3c', 'ind_5bc43651624ddf3c', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5bc43651624ddf3c', 'ind_5bc43651624ddf3c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5bc43651624ddf3c', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|nguroje|2023',
  'insert', 'ind_5bc43651624ddf3c',
  'Unique: Taraba Nguroje seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5bc43651624ddf3c', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_5bc43651624ddf3c', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5bc43651624ddf3c', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_nguroje',
  'ind_5bc43651624ddf3c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5bc43651624ddf3c', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Nguroje', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5bc43651624ddf3c', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_5bc43651624ddf3c',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5bc43651624ddf3c', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_5bc43651624ddf3c',
  'political_assignment', '{"constituency_inec":"NGUROJE","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5bc43651624ddf3c', 'prof_5bc43651624ddf3c',
  'Mohammed Bashir',
  'mohammed bashir taraba state assembly nguroje apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Peter Abel Diah -- Mbamnga (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_97039d1484ae77f9', 'Peter Abel Diah',
  'Peter', 'Diah', 'Peter Abel Diah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_97039d1484ae77f9', 'ind_97039d1484ae77f9', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Peter Abel Diah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_97039d1484ae77f9', 'prof_97039d1484ae77f9',
  'Member, Taraba State House of Assembly (MBAMNGA)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_97039d1484ae77f9', 'ind_97039d1484ae77f9', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_97039d1484ae77f9', 'ind_97039d1484ae77f9', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_97039d1484ae77f9', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|mbamnga|2023',
  'insert', 'ind_97039d1484ae77f9',
  'Unique: Taraba Mbamnga seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_97039d1484ae77f9', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_97039d1484ae77f9', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_97039d1484ae77f9', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_mbamnga',
  'ind_97039d1484ae77f9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_97039d1484ae77f9', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Mbamnga', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_97039d1484ae77f9', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_97039d1484ae77f9',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_97039d1484ae77f9', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_97039d1484ae77f9',
  'political_assignment', '{"constituency_inec":"MBAMNGA","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_97039d1484ae77f9', 'prof_97039d1484ae77f9',
  'Peter Abel Diah',
  'peter abel diah taraba state assembly mbamnga apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Tafarki Agbadu Eneme -- Baissa (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a31531f730d5b3a9', 'Tafarki Agbadu Eneme',
  'Tafarki', 'Eneme', 'Tafarki Agbadu Eneme',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a31531f730d5b3a9', 'ind_a31531f730d5b3a9', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Tafarki Agbadu Eneme', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a31531f730d5b3a9', 'prof_a31531f730d5b3a9',
  'Member, Taraba State House of Assembly (BAISSA)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a31531f730d5b3a9', 'ind_a31531f730d5b3a9', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a31531f730d5b3a9', 'ind_a31531f730d5b3a9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a31531f730d5b3a9', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|baissa|2023',
  'insert', 'ind_a31531f730d5b3a9',
  'Unique: Taraba Baissa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a31531f730d5b3a9', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_a31531f730d5b3a9', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a31531f730d5b3a9', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_baissa',
  'ind_a31531f730d5b3a9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a31531f730d5b3a9', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Baissa', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a31531f730d5b3a9', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_a31531f730d5b3a9',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a31531f730d5b3a9', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_a31531f730d5b3a9',
  'political_assignment', '{"constituency_inec":"BAISSA","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a31531f730d5b3a9', 'prof_a31531f730d5b3a9',
  'Tafarki Agbadu Eneme',
  'tafarki agbadu eneme taraba state assembly baissa pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Bonzena Kizito John -- Zing (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6e518699f12732ce', 'Bonzena Kizito John',
  'Bonzena', 'John', 'Bonzena Kizito John',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6e518699f12732ce', 'ind_6e518699f12732ce', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bonzena Kizito John', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6e518699f12732ce', 'prof_6e518699f12732ce',
  'Member, Taraba State House of Assembly (ZING)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6e518699f12732ce', 'ind_6e518699f12732ce', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6e518699f12732ce', 'ind_6e518699f12732ce', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6e518699f12732ce', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|zing|2023',
  'insert', 'ind_6e518699f12732ce',
  'Unique: Taraba Zing seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6e518699f12732ce', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6e518699f12732ce', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6e518699f12732ce', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_zing',
  'ind_6e518699f12732ce', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6e518699f12732ce', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Zing', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6e518699f12732ce', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6e518699f12732ce',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6e518699f12732ce', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_6e518699f12732ce',
  'political_assignment', '{"constituency_inec":"ZING","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6e518699f12732ce', 'prof_6e518699f12732ce',
  'Bonzena Kizito John',
  'bonzena kizito john taraba state assembly zing pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Jeremiah Ishaku -- Karim Lamido I (AAC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_28da525ee22343a6', 'Jeremiah Ishaku',
  'Jeremiah', 'Ishaku', 'Jeremiah Ishaku',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_28da525ee22343a6', 'ind_28da525ee22343a6', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jeremiah Ishaku', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_28da525ee22343a6', 'prof_28da525ee22343a6',
  'Member, Taraba State House of Assembly (KARIM LAMIDO I)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_28da525ee22343a6', 'ind_28da525ee22343a6', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_28da525ee22343a6', 'ind_28da525ee22343a6', 'org_political_party_aac', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_28da525ee22343a6', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|karim lamido i|2023',
  'insert', 'ind_28da525ee22343a6',
  'Unique: Taraba Karim Lamido I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_28da525ee22343a6', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_28da525ee22343a6', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_28da525ee22343a6', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_karim_lamido_i',
  'ind_28da525ee22343a6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_28da525ee22343a6', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Karim Lamido I', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_28da525ee22343a6', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_28da525ee22343a6',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_28da525ee22343a6', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_28da525ee22343a6',
  'political_assignment', '{"constituency_inec":"KARIM LAMIDO I","party_abbrev":"AAC","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_28da525ee22343a6', 'prof_28da525ee22343a6',
  'Jeremiah Ishaku',
  'jeremiah ishaku taraba state assembly karim lamido i aac politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Ibrahim Bala Lau -- Lau (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_69223e48423c4217', 'Ibrahim Bala Lau',
  'Ibrahim', 'Lau', 'Ibrahim Bala Lau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_69223e48423c4217', 'ind_69223e48423c4217', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Bala Lau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_69223e48423c4217', 'prof_69223e48423c4217',
  'Member, Taraba State House of Assembly (LAU)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_69223e48423c4217', 'ind_69223e48423c4217', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_69223e48423c4217', 'ind_69223e48423c4217', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_69223e48423c4217', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|lau|2023',
  'insert', 'ind_69223e48423c4217',
  'Unique: Taraba Lau seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_69223e48423c4217', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_69223e48423c4217', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_69223e48423c4217', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_lau',
  'ind_69223e48423c4217', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_69223e48423c4217', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Lau', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_69223e48423c4217', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_69223e48423c4217',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_69223e48423c4217', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_69223e48423c4217',
  'political_assignment', '{"constituency_inec":"LAU","party_abbrev":"AA","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_69223e48423c4217', 'prof_69223e48423c4217',
  'Ibrahim Bala Lau',
  'ibrahim bala lau taraba state assembly lau aa politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Gwampo Mohammed Danladi -- Yorro (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3f5febdb7c839290', 'Gwampo Mohammed Danladi',
  'Gwampo', 'Danladi', 'Gwampo Mohammed Danladi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3f5febdb7c839290', 'ind_3f5febdb7c839290', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gwampo Mohammed Danladi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3f5febdb7c839290', 'prof_3f5febdb7c839290',
  'Member, Taraba State House of Assembly (YORRO)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3f5febdb7c839290', 'ind_3f5febdb7c839290', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3f5febdb7c839290', 'ind_3f5febdb7c839290', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3f5febdb7c839290', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|yorro|2023',
  'insert', 'ind_3f5febdb7c839290',
  'Unique: Taraba Yorro seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3f5febdb7c839290', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_3f5febdb7c839290', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3f5febdb7c839290', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_yorro',
  'ind_3f5febdb7c839290', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3f5febdb7c839290', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Yorro', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3f5febdb7c839290', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_3f5febdb7c839290',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3f5febdb7c839290', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_3f5febdb7c839290',
  'political_assignment', '{"constituency_inec":"YORRO","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3f5febdb7c839290', 'prof_3f5febdb7c839290',
  'Gwampo Mohammed Danladi',
  'gwampo mohammed danladi taraba state assembly yorro pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Abdullahi Hamman Adama Borkono -- Bali II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4beba6f5f4e4ce84', 'Abdullahi Hamman Adama Borkono',
  'Abdullahi', 'Borkono', 'Abdullahi Hamman Adama Borkono',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4beba6f5f4e4ce84', 'ind_4beba6f5f4e4ce84', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Hamman Adama Borkono', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4beba6f5f4e4ce84', 'prof_4beba6f5f4e4ce84',
  'Member, Taraba State House of Assembly (BALI II)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4beba6f5f4e4ce84', 'ind_4beba6f5f4e4ce84', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4beba6f5f4e4ce84', 'ind_4beba6f5f4e4ce84', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4beba6f5f4e4ce84', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|bali ii|2023',
  'insert', 'ind_4beba6f5f4e4ce84',
  'Unique: Taraba Bali II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4beba6f5f4e4ce84', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_4beba6f5f4e4ce84', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4beba6f5f4e4ce84', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_bali_ii',
  'ind_4beba6f5f4e4ce84', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4beba6f5f4e4ce84', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Bali II', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4beba6f5f4e4ce84', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_4beba6f5f4e4ce84',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4beba6f5f4e4ce84', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_4beba6f5f4e4ce84',
  'political_assignment', '{"constituency_inec":"BALI II","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4beba6f5f4e4ce84', 'prof_4beba6f5f4e4ce84',
  'Abdullahi Hamman Adama Borkono',
  'abdullahi hamman adama borkono taraba state assembly bali ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Abbas Sulaiman -- Gassol II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_910e9fe6a039284f', 'Abbas Sulaiman',
  'Abbas', 'Sulaiman', 'Abbas Sulaiman',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_910e9fe6a039284f', 'ind_910e9fe6a039284f', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abbas Sulaiman', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_910e9fe6a039284f', 'prof_910e9fe6a039284f',
  'Member, Taraba State House of Assembly (GASSOL II)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_910e9fe6a039284f', 'ind_910e9fe6a039284f', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_910e9fe6a039284f', 'ind_910e9fe6a039284f', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_910e9fe6a039284f', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|gassol ii|2023',
  'insert', 'ind_910e9fe6a039284f',
  'Unique: Taraba Gassol II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_910e9fe6a039284f', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_910e9fe6a039284f', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_910e9fe6a039284f', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_gassol_ii',
  'ind_910e9fe6a039284f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_910e9fe6a039284f', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Gassol II', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_910e9fe6a039284f', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_910e9fe6a039284f',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_910e9fe6a039284f', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_910e9fe6a039284f',
  'political_assignment', '{"constituency_inec":"GASSOL II","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_910e9fe6a039284f', 'prof_910e9fe6a039284f',
  'Abbas Sulaiman',
  'abbas sulaiman taraba state assembly gassol ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Usman Nasiru Tafida -- Jalingo II (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_174d55494137251a', 'Usman Nasiru Tafida',
  'Usman', 'Tafida', 'Usman Nasiru Tafida',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_174d55494137251a', 'ind_174d55494137251a', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Nasiru Tafida', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_174d55494137251a', 'prof_174d55494137251a',
  'Member, Taraba State House of Assembly (JALINGO II)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_174d55494137251a', 'ind_174d55494137251a', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_174d55494137251a', 'ind_174d55494137251a', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_174d55494137251a', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|jalingo ii|2023',
  'insert', 'ind_174d55494137251a',
  'Unique: Taraba Jalingo II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_174d55494137251a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_174d55494137251a', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_174d55494137251a', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_jalingo_ii',
  'ind_174d55494137251a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_174d55494137251a', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Jalingo II', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_174d55494137251a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_174d55494137251a',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_174d55494137251a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_174d55494137251a',
  'political_assignment', '{"constituency_inec":"JALINGO II","party_abbrev":"NNPP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_174d55494137251a', 'prof_174d55494137251a',
  'Usman Nasiru Tafida',
  'usman nasiru tafida taraba state assembly jalingo ii nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Mohammed Adamu -- Karim Lamido II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_761c4be5b1b6ba4c', 'Mohammed Adamu',
  'Mohammed', 'Adamu', 'Mohammed Adamu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_761c4be5b1b6ba4c', 'ind_761c4be5b1b6ba4c', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mohammed Adamu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_761c4be5b1b6ba4c', 'prof_761c4be5b1b6ba4c',
  'Member, Taraba State House of Assembly (KARIM LAMIDO II)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_761c4be5b1b6ba4c', 'ind_761c4be5b1b6ba4c', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_761c4be5b1b6ba4c', 'ind_761c4be5b1b6ba4c', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_761c4be5b1b6ba4c', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|karim lamido ii|2023',
  'insert', 'ind_761c4be5b1b6ba4c',
  'Unique: Taraba Karim Lamido II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_761c4be5b1b6ba4c', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_761c4be5b1b6ba4c', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_761c4be5b1b6ba4c', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_karim_lamido_ii',
  'ind_761c4be5b1b6ba4c', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_761c4be5b1b6ba4c', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Karim Lamido II', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_761c4be5b1b6ba4c', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_761c4be5b1b6ba4c',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_761c4be5b1b6ba4c', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_761c4be5b1b6ba4c',
  'political_assignment', '{"constituency_inec":"KARIM LAMIDO II","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_761c4be5b1b6ba4c', 'prof_761c4be5b1b6ba4c',
  'Mohammed Adamu',
  'mohammed adamu taraba state assembly karim lamido ii apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Danlele Tanimu Mohammed -- Wukari II (A)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_621e82cf3e933533', 'Danlele Tanimu Mohammed',
  'Danlele', 'Mohammed', 'Danlele Tanimu Mohammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_621e82cf3e933533', 'ind_621e82cf3e933533', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Danlele Tanimu Mohammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_621e82cf3e933533', 'prof_621e82cf3e933533',
  'Member, Taraba State House of Assembly (WUKARI II)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_621e82cf3e933533', 'ind_621e82cf3e933533', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_621e82cf3e933533', 'ind_621e82cf3e933533', 'org_political_party_accord', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_621e82cf3e933533', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|wukari ii|2023',
  'insert', 'ind_621e82cf3e933533',
  'Unique: Taraba Wukari II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_621e82cf3e933533', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_621e82cf3e933533', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_621e82cf3e933533', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_wukari_ii',
  'ind_621e82cf3e933533', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_621e82cf3e933533', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Wukari II', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_621e82cf3e933533', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_621e82cf3e933533',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_621e82cf3e933533', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_621e82cf3e933533',
  'political_assignment', '{"constituency_inec":"WUKARI II","party_abbrev":"A","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_621e82cf3e933533', 'prof_621e82cf3e933533',
  'Danlele Tanimu Mohammed',
  'danlele tanimu mohammed taraba state assembly wukari ii a politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Yahaya Douglas Ndatse -- Donda (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b78c1d429f9e4f2e', 'Yahaya Douglas Ndatse',
  'Yahaya', 'Ndatse', 'Yahaya Douglas Ndatse',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b78c1d429f9e4f2e', 'ind_b78c1d429f9e4f2e', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yahaya Douglas Ndatse', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b78c1d429f9e4f2e', 'prof_b78c1d429f9e4f2e',
  'Member, Taraba State House of Assembly (DONDA)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b78c1d429f9e4f2e', 'ind_b78c1d429f9e4f2e', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b78c1d429f9e4f2e', 'ind_b78c1d429f9e4f2e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b78c1d429f9e4f2e', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|donda|2023',
  'insert', 'ind_b78c1d429f9e4f2e',
  'Unique: Taraba Donda seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b78c1d429f9e4f2e', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_b78c1d429f9e4f2e', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b78c1d429f9e4f2e', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_donda',
  'ind_b78c1d429f9e4f2e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b78c1d429f9e4f2e', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Donda', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b78c1d429f9e4f2e', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_b78c1d429f9e4f2e',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b78c1d429f9e4f2e', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_b78c1d429f9e4f2e',
  'political_assignment', '{"constituency_inec":"DONDA","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b78c1d429f9e4f2e', 'prof_b78c1d429f9e4f2e',
  'Yahaya Douglas Ndatse',
  'yahaya douglas ndatse taraba state assembly donda pdp politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Ibrahim Bala Lau -- Wukari I (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_75764a932f92438a', 'Ibrahim Bala Lau',
  'Ibrahim', 'Lau', 'Ibrahim Bala Lau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_75764a932f92438a', 'ind_75764a932f92438a', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibrahim Bala Lau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_75764a932f92438a', 'prof_75764a932f92438a',
  'Member, Taraba State House of Assembly (WUKARI I)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_75764a932f92438a', 'ind_75764a932f92438a', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_75764a932f92438a', 'ind_75764a932f92438a', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_75764a932f92438a', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|wukari i|2023',
  'insert', 'ind_75764a932f92438a',
  'Unique: Taraba Wukari I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_75764a932f92438a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_75764a932f92438a', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_75764a932f92438a', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_wukari_i',
  'ind_75764a932f92438a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_75764a932f92438a', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Wukari I', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_75764a932f92438a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_75764a932f92438a',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_75764a932f92438a', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_75764a932f92438a',
  'political_assignment', '{"constituency_inec":"WUKARI I","party_abbrev":"AA","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_75764a932f92438a', 'prof_75764a932f92438a',
  'Ibrahim Bala Lau',
  'ibrahim bala lau taraba state assembly wukari i aa politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Bosha Philip Tsenongo -- Ibi (AA)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f27294420e8c1ddb', 'Bosha Philip Tsenongo',
  'Bosha', 'Tsenongo', 'Bosha Philip Tsenongo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f27294420e8c1ddb', 'ind_f27294420e8c1ddb', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bosha Philip Tsenongo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f27294420e8c1ddb', 'prof_f27294420e8c1ddb',
  'Member, Taraba State House of Assembly (IBI)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f27294420e8c1ddb', 'ind_f27294420e8c1ddb', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f27294420e8c1ddb', 'ind_f27294420e8c1ddb', 'org_political_party_aa', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f27294420e8c1ddb', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|ibi|2023',
  'insert', 'ind_f27294420e8c1ddb',
  'Unique: Taraba Ibi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f27294420e8c1ddb', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_f27294420e8c1ddb', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f27294420e8c1ddb', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_ibi',
  'ind_f27294420e8c1ddb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f27294420e8c1ddb', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Ibi', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f27294420e8c1ddb', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_f27294420e8c1ddb',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f27294420e8c1ddb', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_f27294420e8c1ddb',
  'political_assignment', '{"constituency_inec":"IBI","party_abbrev":"AA","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f27294420e8c1ddb', 'prof_f27294420e8c1ddb',
  'Bosha Philip Tsenongo',
  'bosha philip tsenongo taraba state assembly ibi aa politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Abdullahi Mahmud -- Gassol I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d9d26896b7b42cae', 'Abdullahi Mahmud',
  'Abdullahi', 'Mahmud', 'Abdullahi Mahmud',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d9d26896b7b42cae', 'ind_d9d26896b7b42cae', 'individual', 'place_state_taraba',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Mahmud', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d9d26896b7b42cae', 'prof_d9d26896b7b42cae',
  'Member, Taraba State House of Assembly (GASSOL I)',
  'place_state_taraba', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d9d26896b7b42cae', 'ind_d9d26896b7b42cae', 'term_ng_taraba_state_assembly_10th_2023_2027',
  'place_state_taraba', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d9d26896b7b42cae', 'ind_d9d26896b7b42cae', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d9d26896b7b42cae', 'seed_run_s05_political_taraba_roster_20260502', 'individual',
  'ng_state_assembly_member|taraba|gassol i|2023',
  'insert', 'ind_d9d26896b7b42cae',
  'Unique: Taraba Gassol I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d9d26896b7b42cae', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_d9d26896b7b42cae', 'seed_source_nigerianleaders_taraba_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d9d26896b7b42cae', 'seed_run_s05_political_taraba_roster_20260502', 'seed_source_nigerianleaders_taraba_assembly_20260502',
  'nl_taraba_assembly_2023_gassol_i',
  'ind_d9d26896b7b42cae', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d9d26896b7b42cae', 'seed_run_s05_political_taraba_roster_20260502',
  'Taraba Gassol I', 'place_state_taraba', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d9d26896b7b42cae', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_d9d26896b7b42cae',
  'seed_source_nigerianleaders_taraba_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d9d26896b7b42cae', 'seed_run_s05_political_taraba_roster_20260502', 'individual', 'ind_d9d26896b7b42cae',
  'political_assignment', '{"constituency_inec":"GASSOL I","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/taraba-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d9d26896b7b42cae', 'prof_d9d26896b7b42cae',
  'Abdullahi Mahmud',
  'abdullahi mahmud taraba state assembly gassol i apc politician legislator state house',
  'place_nigeria_001/place_zone_north_east/place_state_taraba',
  'political',
  unixepoch(), unixepoch()
);

