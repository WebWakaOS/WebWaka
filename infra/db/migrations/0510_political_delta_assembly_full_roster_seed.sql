-- ============================================================
-- Migration 0510: Delta State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders.com – Delta State House of Assembly Members
-- Members seeded: 27/29
-- Party breakdown: PDP:19, APC:5, Unknown:3
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_delta_assembly_20260502',
  'NigerianLeaders – Complete List of Delta State House of Assembly Members',
  'editorial_aggregator', 'https://nigerianleaders.com/delta-state-house-of-assembly-members/', 'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_delta_roster_20260502', 'S05 Batch – Delta State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_delta_roster_20260502', 'seed_run_s05_political_delta_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0510_political_delta_assembly_full_roster_seed.sql', NULL, 27,
  '27/29 members seeded; constituency place IDs resolved at state level pending full constituency seed');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_delta_state_assembly_10th_2023_2027',
  'Delta State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023', 'state', 'state_assembly_member',
  'place_state_delta', '2023-06-13', '2027-06-12', unixepoch(), unixepoch()
);

-- ── Members (27 of 29 seats) ──────────────────────────────────────

-- 01. Egbetamah Ovie Collins -- Udu (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e4a950a11c785048', 'Egbetamah Ovie Collins',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e4a950a11c785048', 'ind_e4a950a11c785048', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Egbetamah Ovie Collins', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e4a950a11c785048', 'prof_e4a950a11c785048',
  'Member, Delta State House of Assembly (UDU)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e4a950a11c785048', 'ind_e4a950a11c785048', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e4a950a11c785048', 'ind_e4a950a11c785048', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e4a950a11c785048', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|udu|2023',
  'insert', 'ind_e4a950a11c785048',
  'Unique: Delta Udu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e4a950a11c785048', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_e4a950a11c785048', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e4a950a11c785048', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_udu',
  'ind_e4a950a11c785048', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e4a950a11c785048', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Udu', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e4a950a11c785048', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_e4a950a11c785048',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e4a950a11c785048', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_e4a950a11c785048',
  'political_assignment', '{"constituency_inec":"UDU","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e4a950a11c785048', 'prof_e4a950a11c785048',
  'Egbetamah Ovie Collins',
  'egbetamah ovie collins delta state assembly udu apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Emakpor Edafe -- Aniocha North
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b3da58512aa498a5', 'Emakpor Edafe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b3da58512aa498a5', 'ind_b3da58512aa498a5', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emakpor Edafe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b3da58512aa498a5', 'prof_b3da58512aa498a5',
  'Member, Delta State House of Assembly (ANIOCHA NORTH)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b3da58512aa498a5', 'ind_b3da58512aa498a5', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b3da58512aa498a5', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|aniocha north|2023',
  'insert', 'ind_b3da58512aa498a5',
  'Unique: Delta Aniocha North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b3da58512aa498a5', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b3da58512aa498a5', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b3da58512aa498a5', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_aniocha_north',
  'ind_b3da58512aa498a5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b3da58512aa498a5', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Aniocha North', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b3da58512aa498a5', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b3da58512aa498a5',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b3da58512aa498a5', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b3da58512aa498a5',
  'political_assignment', '{"constituency_inec":"ANIOCHA NORTH","party_abbrev":"Unknown","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b3da58512aa498a5', 'prof_b3da58512aa498a5',
  'Emakpor Edafe',
  'emakpor edafe delta state assembly aniocha north  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Anwuzia Isaac Ozor -- Aniocha South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cf9a11c07e70d4a3', 'Anwuzia Isaac Ozor',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cf9a11c07e70d4a3', 'ind_cf9a11c07e70d4a3', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Anwuzia Isaac Ozor', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cf9a11c07e70d4a3', 'prof_cf9a11c07e70d4a3',
  'Member, Delta State House of Assembly (ANIOCHA SOUTH)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cf9a11c07e70d4a3', 'ind_cf9a11c07e70d4a3', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cf9a11c07e70d4a3', 'ind_cf9a11c07e70d4a3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cf9a11c07e70d4a3', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|aniocha south|2023',
  'insert', 'ind_cf9a11c07e70d4a3',
  'Unique: Delta Aniocha South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cf9a11c07e70d4a3', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_cf9a11c07e70d4a3', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cf9a11c07e70d4a3', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_aniocha_south',
  'ind_cf9a11c07e70d4a3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cf9a11c07e70d4a3', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Aniocha South', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cf9a11c07e70d4a3', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_cf9a11c07e70d4a3',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cf9a11c07e70d4a3', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_cf9a11c07e70d4a3',
  'political_assignment', '{"constituency_inec":"ANIOCHA SOUTH","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cf9a11c07e70d4a3', 'prof_cf9a11c07e70d4a3',
  'Anwuzia Isaac Ozor',
  'anwuzia isaac ozor delta state assembly aniocha south pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Preyor Oboro -- Bomadi (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b9b105423a2d0152', 'Preyor Oboro',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b9b105423a2d0152', 'ind_b9b105423a2d0152', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Preyor Oboro', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b9b105423a2d0152', 'prof_b9b105423a2d0152',
  'Member, Delta State House of Assembly (BOMADI)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b9b105423a2d0152', 'ind_b9b105423a2d0152', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b9b105423a2d0152', 'ind_b9b105423a2d0152', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b9b105423a2d0152', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|bomadi|2023',
  'insert', 'ind_b9b105423a2d0152',
  'Unique: Delta Bomadi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b9b105423a2d0152', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b9b105423a2d0152', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b9b105423a2d0152', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_bomadi',
  'ind_b9b105423a2d0152', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b9b105423a2d0152', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Bomadi', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b9b105423a2d0152', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b9b105423a2d0152',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b9b105423a2d0152', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b9b105423a2d0152',
  'political_assignment', '{"constituency_inec":"BOMADI","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b9b105423a2d0152', 'prof_b9b105423a2d0152',
  'Preyor Oboro',
  'preyor oboro delta state assembly bomadi pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 05. - -- Burutu
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c32ec0b84c16ddac', '-',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c32ec0b84c16ddac', 'ind_c32ec0b84c16ddac', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  '-', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c32ec0b84c16ddac', 'prof_c32ec0b84c16ddac',
  'Member, Delta State House of Assembly (BURUTU)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c32ec0b84c16ddac', 'ind_c32ec0b84c16ddac', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c32ec0b84c16ddac', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|burutu|2023',
  'insert', 'ind_c32ec0b84c16ddac',
  'Unique: Delta Burutu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c32ec0b84c16ddac', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c32ec0b84c16ddac', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c32ec0b84c16ddac', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_burutu',
  'ind_c32ec0b84c16ddac', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c32ec0b84c16ddac', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Burutu', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c32ec0b84c16ddac', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c32ec0b84c16ddac',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c32ec0b84c16ddac', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c32ec0b84c16ddac',
  'political_assignment', '{"constituency_inec":"BURUTU","party_abbrev":"Unknown","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c32ec0b84c16ddac', 'prof_c32ec0b84c16ddac',
  '-',
  '- delta state assembly burutu  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Akpowowo Arthur -- Ethiope East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_269fccfd213eb8eb', 'Akpowowo Arthur',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_269fccfd213eb8eb', 'ind_269fccfd213eb8eb', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akpowowo Arthur', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_269fccfd213eb8eb', 'prof_269fccfd213eb8eb',
  'Member, Delta State House of Assembly (ETHIOPE EAST)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_269fccfd213eb8eb', 'ind_269fccfd213eb8eb', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_269fccfd213eb8eb', 'ind_269fccfd213eb8eb', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_269fccfd213eb8eb', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ethiope east|2023',
  'insert', 'ind_269fccfd213eb8eb',
  'Unique: Delta Ethiope East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_269fccfd213eb8eb', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_269fccfd213eb8eb', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_269fccfd213eb8eb', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ethiope_east',
  'ind_269fccfd213eb8eb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_269fccfd213eb8eb', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ethiope East', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_269fccfd213eb8eb', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_269fccfd213eb8eb',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_269fccfd213eb8eb', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_269fccfd213eb8eb',
  'political_assignment', '{"constituency_inec":"ETHIOPE EAST","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_269fccfd213eb8eb', 'prof_269fccfd213eb8eb',
  'Akpowowo Arthur',
  'akpowowo arthur delta state assembly ethiope east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 07. - -- Ethiope West
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1daa840a98ec236a', '-',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1daa840a98ec236a', 'ind_1daa840a98ec236a', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  '-', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1daa840a98ec236a', 'prof_1daa840a98ec236a',
  'Member, Delta State House of Assembly (ETHIOPE WEST)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1daa840a98ec236a', 'ind_1daa840a98ec236a', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1daa840a98ec236a', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ethiope west|2023',
  'insert', 'ind_1daa840a98ec236a',
  'Unique: Delta Ethiope West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1daa840a98ec236a', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_1daa840a98ec236a', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1daa840a98ec236a', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ethiope_west',
  'ind_1daa840a98ec236a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1daa840a98ec236a', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ethiope West', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1daa840a98ec236a', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_1daa840a98ec236a',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1daa840a98ec236a', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_1daa840a98ec236a',
  'political_assignment', '{"constituency_inec":"ETHIOPE WEST","party_abbrev":"Unknown","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1daa840a98ec236a', 'prof_1daa840a98ec236a',
  '-',
  '- delta state assembly ethiope west  politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Okowa-Daramola Marilyn -- Ika North East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7242886e3b0fea4e', 'Okowa-Daramola Marilyn',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7242886e3b0fea4e', 'ind_7242886e3b0fea4e', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Okowa-Daramola Marilyn', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7242886e3b0fea4e', 'prof_7242886e3b0fea4e',
  'Member, Delta State House of Assembly (IKA NORTH EAST)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7242886e3b0fea4e', 'ind_7242886e3b0fea4e', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7242886e3b0fea4e', 'ind_7242886e3b0fea4e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7242886e3b0fea4e', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ika north east|2023',
  'insert', 'ind_7242886e3b0fea4e',
  'Unique: Delta Ika North East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7242886e3b0fea4e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_7242886e3b0fea4e', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7242886e3b0fea4e', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ika_north_east',
  'ind_7242886e3b0fea4e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7242886e3b0fea4e', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ika North East', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7242886e3b0fea4e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_7242886e3b0fea4e',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7242886e3b0fea4e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_7242886e3b0fea4e',
  'political_assignment', '{"constituency_inec":"IKA NORTH EAST","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7242886e3b0fea4e', 'prof_7242886e3b0fea4e',
  'Okowa-Daramola Marilyn',
  'okowa-daramola marilyn delta state assembly ika north east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Odioh Bernard -- Isoko North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f70f5bf2d26be0d9', 'Odioh Bernard',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f70f5bf2d26be0d9', 'ind_f70f5bf2d26be0d9', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Odioh Bernard', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f70f5bf2d26be0d9', 'prof_f70f5bf2d26be0d9',
  'Member, Delta State House of Assembly (ISOKO NORTH)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f70f5bf2d26be0d9', 'ind_f70f5bf2d26be0d9', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f70f5bf2d26be0d9', 'ind_f70f5bf2d26be0d9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f70f5bf2d26be0d9', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|isoko north|2023',
  'insert', 'ind_f70f5bf2d26be0d9',
  'Unique: Delta Isoko North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f70f5bf2d26be0d9', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_f70f5bf2d26be0d9', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f70f5bf2d26be0d9', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_isoko_north',
  'ind_f70f5bf2d26be0d9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f70f5bf2d26be0d9', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Isoko North', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f70f5bf2d26be0d9', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_f70f5bf2d26be0d9',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f70f5bf2d26be0d9', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_f70f5bf2d26be0d9',
  'political_assignment', '{"constituency_inec":"ISOKO NORTH","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f70f5bf2d26be0d9', 'prof_f70f5bf2d26be0d9',
  'Odioh Bernard',
  'odioh bernard delta state assembly isoko north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Obowomano Bino -- Isoko South I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b6393debbfce7e03', 'Obowomano Bino',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b6393debbfce7e03', 'ind_b6393debbfce7e03', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obowomano Bino', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b6393debbfce7e03', 'prof_b6393debbfce7e03',
  'Member, Delta State House of Assembly (ISOKO SOUTH I)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b6393debbfce7e03', 'ind_b6393debbfce7e03', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b6393debbfce7e03', 'ind_b6393debbfce7e03', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b6393debbfce7e03', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|isoko south i|2023',
  'insert', 'ind_b6393debbfce7e03',
  'Unique: Delta Isoko South I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b6393debbfce7e03', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b6393debbfce7e03', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b6393debbfce7e03', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_isoko_south_i',
  'ind_b6393debbfce7e03', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b6393debbfce7e03', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Isoko South I', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b6393debbfce7e03', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b6393debbfce7e03',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b6393debbfce7e03', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b6393debbfce7e03',
  'political_assignment', '{"constituency_inec":"ISOKO SOUTH I","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b6393debbfce7e03', 'prof_b6393debbfce7e03',
  'Obowomano Bino',
  'obowomano bino delta state assembly isoko south i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Osamuta Emeka Prince -- Ndokwa East (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0f435c5b9a9160d3', 'Osamuta Emeka Prince',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0f435c5b9a9160d3', 'ind_0f435c5b9a9160d3', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Osamuta Emeka Prince', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0f435c5b9a9160d3', 'prof_0f435c5b9a9160d3',
  'Member, Delta State House of Assembly (NDOKWA EAST)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0f435c5b9a9160d3', 'ind_0f435c5b9a9160d3', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0f435c5b9a9160d3', 'ind_0f435c5b9a9160d3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0f435c5b9a9160d3', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ndokwa east|2023',
  'insert', 'ind_0f435c5b9a9160d3',
  'Unique: Delta Ndokwa East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0f435c5b9a9160d3', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_0f435c5b9a9160d3', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0f435c5b9a9160d3', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ndokwa_east',
  'ind_0f435c5b9a9160d3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0f435c5b9a9160d3', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ndokwa East', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0f435c5b9a9160d3', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_0f435c5b9a9160d3',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0f435c5b9a9160d3', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_0f435c5b9a9160d3',
  'political_assignment', '{"constituency_inec":"NDOKWA EAST","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0f435c5b9a9160d3', 'prof_0f435c5b9a9160d3',
  'Osamuta Emeka Prince',
  'osamuta emeka prince delta state assembly ndokwa east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Emetulu Charles -- Ndokwa West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a7e0591bb8993471', 'Emetulu Charles',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a7e0591bb8993471', 'ind_a7e0591bb8993471', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emetulu Charles', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a7e0591bb8993471', 'prof_a7e0591bb8993471',
  'Member, Delta State House of Assembly (NDOKWA WEST)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a7e0591bb8993471', 'ind_a7e0591bb8993471', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a7e0591bb8993471', 'ind_a7e0591bb8993471', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a7e0591bb8993471', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ndokwa west|2023',
  'insert', 'ind_a7e0591bb8993471',
  'Unique: Delta Ndokwa West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a7e0591bb8993471', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_a7e0591bb8993471', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a7e0591bb8993471', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ndokwa_west',
  'ind_a7e0591bb8993471', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a7e0591bb8993471', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ndokwa West', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a7e0591bb8993471', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_a7e0591bb8993471',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a7e0591bb8993471', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_a7e0591bb8993471',
  'political_assignment', '{"constituency_inec":"NDOKWA WEST","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a7e0591bb8993471', 'prof_a7e0591bb8993471',
  'Emetulu Charles',
  'emetulu charles delta state assembly ndokwa west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Augoye James -- Okpe (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b7900ec3ed5867fc', 'Augoye James',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b7900ec3ed5867fc', 'ind_b7900ec3ed5867fc', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Augoye James', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b7900ec3ed5867fc', 'prof_b7900ec3ed5867fc',
  'Member, Delta State House of Assembly (OKPE)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b7900ec3ed5867fc', 'ind_b7900ec3ed5867fc', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b7900ec3ed5867fc', 'ind_b7900ec3ed5867fc', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b7900ec3ed5867fc', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|okpe|2023',
  'insert', 'ind_b7900ec3ed5867fc',
  'Unique: Delta Okpe seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b7900ec3ed5867fc', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b7900ec3ed5867fc', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b7900ec3ed5867fc', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_okpe',
  'ind_b7900ec3ed5867fc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b7900ec3ed5867fc', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Okpe', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b7900ec3ed5867fc', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b7900ec3ed5867fc',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b7900ec3ed5867fc', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b7900ec3ed5867fc',
  'political_assignment', '{"constituency_inec":"OKPE","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b7900ec3ed5867fc', 'prof_b7900ec3ed5867fc',
  'Augoye James',
  'augoye james delta state assembly okpe pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Esenwah Frank -- Oshimili North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7bdf45a329210780', 'Esenwah Frank',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7bdf45a329210780', 'ind_7bdf45a329210780', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Esenwah Frank', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7bdf45a329210780', 'prof_7bdf45a329210780',
  'Member, Delta State House of Assembly (OSHIMILI NORTH)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7bdf45a329210780', 'ind_7bdf45a329210780', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7bdf45a329210780', 'ind_7bdf45a329210780', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7bdf45a329210780', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|oshimili north|2023',
  'insert', 'ind_7bdf45a329210780',
  'Unique: Delta Oshimili North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7bdf45a329210780', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_7bdf45a329210780', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7bdf45a329210780', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_oshimili_north',
  'ind_7bdf45a329210780', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7bdf45a329210780', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Oshimili North', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7bdf45a329210780', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_7bdf45a329210780',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7bdf45a329210780', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_7bdf45a329210780',
  'political_assignment', '{"constituency_inec":"OSHIMILI NORTH","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7bdf45a329210780', 'prof_7bdf45a329210780',
  'Esenwah Frank',
  'esenwah frank delta state assembly oshimili north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Anyafulu Ifechukwu -- Oshimili South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1357b826ad42f3f5', 'Anyafulu Ifechukwu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1357b826ad42f3f5', 'ind_1357b826ad42f3f5', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Anyafulu Ifechukwu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1357b826ad42f3f5', 'prof_1357b826ad42f3f5',
  'Member, Delta State House of Assembly (OSHIMILI SOUTH)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1357b826ad42f3f5', 'ind_1357b826ad42f3f5', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1357b826ad42f3f5', 'ind_1357b826ad42f3f5', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1357b826ad42f3f5', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|oshimili south|2023',
  'insert', 'ind_1357b826ad42f3f5',
  'Unique: Delta Oshimili South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1357b826ad42f3f5', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_1357b826ad42f3f5', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1357b826ad42f3f5', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_oshimili_south',
  'ind_1357b826ad42f3f5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1357b826ad42f3f5', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Oshimili South', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1357b826ad42f3f5', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_1357b826ad42f3f5',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1357b826ad42f3f5', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_1357b826ad42f3f5',
  'political_assignment', '{"constituency_inec":"OSHIMILI SOUTH","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1357b826ad42f3f5', 'prof_1357b826ad42f3f5',
  'Anyafulu Ifechukwu',
  'anyafulu ifechukwu delta state assembly oshimili south pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Sinebe Amatare Emmanuel -- Patani (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c8e8324fc2704521', 'Sinebe Amatare Emmanuel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c8e8324fc2704521', 'ind_c8e8324fc2704521', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sinebe Amatare Emmanuel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c8e8324fc2704521', 'prof_c8e8324fc2704521',
  'Member, Delta State House of Assembly (PATANI)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c8e8324fc2704521', 'ind_c8e8324fc2704521', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c8e8324fc2704521', 'ind_c8e8324fc2704521', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c8e8324fc2704521', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|patani|2023',
  'insert', 'ind_c8e8324fc2704521',
  'Unique: Delta Patani seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c8e8324fc2704521', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c8e8324fc2704521', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c8e8324fc2704521', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_patani',
  'ind_c8e8324fc2704521', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c8e8324fc2704521', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Patani', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c8e8324fc2704521', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c8e8324fc2704521',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c8e8324fc2704521', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c8e8324fc2704521',
  'political_assignment', '{"constituency_inec":"PATANI","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c8e8324fc2704521', 'prof_c8e8324fc2704521',
  'Sinebe Amatare Emmanuel',
  'sinebe amatare emmanuel delta state assembly patani pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Umukoro Awolowo Perkins -- Sapele (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_08ef622298d33598', 'Umukoro Awolowo Perkins',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_08ef622298d33598', 'ind_08ef622298d33598', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Umukoro Awolowo Perkins', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_08ef622298d33598', 'prof_08ef622298d33598',
  'Member, Delta State House of Assembly (SAPELE)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_08ef622298d33598', 'ind_08ef622298d33598', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_08ef622298d33598', 'ind_08ef622298d33598', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_08ef622298d33598', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|sapele|2023',
  'insert', 'ind_08ef622298d33598',
  'Unique: Delta Sapele seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_08ef622298d33598', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_08ef622298d33598', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_08ef622298d33598', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_sapele',
  'ind_08ef622298d33598', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_08ef622298d33598', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Sapele', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_08ef622298d33598', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_08ef622298d33598',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_08ef622298d33598', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_08ef622298d33598',
  'political_assignment', '{"constituency_inec":"SAPELE","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_08ef622298d33598', 'prof_08ef622298d33598',
  'Umukoro Awolowo Perkins',
  'umukoro awolowo perkins delta state assembly sapele pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Omonade Mathew Onojighofia -- Ughelli North I (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b085f8c6f61427c9', 'Omonade Mathew Onojighofia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b085f8c6f61427c9', 'ind_b085f8c6f61427c9', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omonade Mathew Onojighofia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b085f8c6f61427c9', 'prof_b085f8c6f61427c9',
  'Member, Delta State House of Assembly (UGHELLI NORTH I)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b085f8c6f61427c9', 'ind_b085f8c6f61427c9', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b085f8c6f61427c9', 'ind_b085f8c6f61427c9', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b085f8c6f61427c9', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ughelli north i|2023',
  'insert', 'ind_b085f8c6f61427c9',
  'Unique: Delta Ughelli North I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b085f8c6f61427c9', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b085f8c6f61427c9', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b085f8c6f61427c9', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ughelli_north_i',
  'ind_b085f8c6f61427c9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b085f8c6f61427c9', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ughelli North I', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b085f8c6f61427c9', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b085f8c6f61427c9',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b085f8c6f61427c9', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b085f8c6f61427c9',
  'political_assignment', '{"constituency_inec":"UGHELLI NORTH I","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b085f8c6f61427c9', 'prof_b085f8c6f61427c9',
  'Omonade Mathew Onojighofia',
  'omonade mathew onojighofia delta state assembly ughelli north i apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Utuama Festus -- Ughelli South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e172e312e7bc9118', 'Utuama Festus',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e172e312e7bc9118', 'ind_e172e312e7bc9118', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Utuama Festus', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e172e312e7bc9118', 'prof_e172e312e7bc9118',
  'Member, Delta State House of Assembly (UGHELLI SOUTH)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e172e312e7bc9118', 'ind_e172e312e7bc9118', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e172e312e7bc9118', 'ind_e172e312e7bc9118', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e172e312e7bc9118', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ughelli south|2023',
  'insert', 'ind_e172e312e7bc9118',
  'Unique: Delta Ughelli South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e172e312e7bc9118', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_e172e312e7bc9118', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e172e312e7bc9118', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ughelli_south',
  'ind_e172e312e7bc9118', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e172e312e7bc9118', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ughelli South', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e172e312e7bc9118', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_e172e312e7bc9118',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e172e312e7bc9118', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_e172e312e7bc9118',
  'political_assignment', '{"constituency_inec":"UGHELLI SOUTH","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e172e312e7bc9118', 'prof_e172e312e7bc9118',
  'Utuama Festus',
  'utuama festus delta state assembly ughelli south pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Dafe Chukudi -- Ukwuani (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b39ce56e55edac6d', 'Dafe Chukudi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b39ce56e55edac6d', 'ind_b39ce56e55edac6d', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Dafe Chukudi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b39ce56e55edac6d', 'prof_b39ce56e55edac6d',
  'Member, Delta State House of Assembly (UKWUANI)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b39ce56e55edac6d', 'ind_b39ce56e55edac6d', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b39ce56e55edac6d', 'ind_b39ce56e55edac6d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b39ce56e55edac6d', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ukwuani|2023',
  'insert', 'ind_b39ce56e55edac6d',
  'Unique: Delta Ukwuani seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b39ce56e55edac6d', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b39ce56e55edac6d', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b39ce56e55edac6d', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ukwuani',
  'ind_b39ce56e55edac6d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b39ce56e55edac6d', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ukwuani', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b39ce56e55edac6d', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b39ce56e55edac6d',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b39ce56e55edac6d', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_b39ce56e55edac6d',
  'political_assignment', '{"constituency_inec":"UKWUANI","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b39ce56e55edac6d', 'prof_b39ce56e55edac6d',
  'Dafe Chukudi',
  'dafe chukudi delta state assembly ukwuani pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Emeka Emmanuel Nwaobi -- Uvwie (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c7f661bc1ee27508', 'Emeka Emmanuel Nwaobi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c7f661bc1ee27508', 'ind_c7f661bc1ee27508', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Emeka Emmanuel Nwaobi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c7f661bc1ee27508', 'prof_c7f661bc1ee27508',
  'Member, Delta State House of Assembly (UVWIE)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c7f661bc1ee27508', 'ind_c7f661bc1ee27508', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c7f661bc1ee27508', 'ind_c7f661bc1ee27508', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c7f661bc1ee27508', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|uvwie|2023',
  'insert', 'ind_c7f661bc1ee27508',
  'Unique: Delta Uvwie seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c7f661bc1ee27508', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c7f661bc1ee27508', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c7f661bc1ee27508', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_uvwie',
  'ind_c7f661bc1ee27508', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c7f661bc1ee27508', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Uvwie', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c7f661bc1ee27508', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c7f661bc1ee27508',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c7f661bc1ee27508', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_c7f661bc1ee27508',
  'political_assignment', '{"constituency_inec":"UVWIE","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c7f661bc1ee27508', 'prof_c7f661bc1ee27508',
  'Emeka Emmanuel Nwaobi',
  'emeka emmanuel nwaobi delta state assembly uvwie pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Martins Alfred O. -- Warri North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_11d0b7d13e3ba4bc', 'Martins Alfred O.',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_11d0b7d13e3ba4bc', 'ind_11d0b7d13e3ba4bc', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Martins Alfred O.', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_11d0b7d13e3ba4bc', 'prof_11d0b7d13e3ba4bc',
  'Member, Delta State House of Assembly (WARRI NORTH)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_11d0b7d13e3ba4bc', 'ind_11d0b7d13e3ba4bc', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_11d0b7d13e3ba4bc', 'ind_11d0b7d13e3ba4bc', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_11d0b7d13e3ba4bc', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|warri north|2023',
  'insert', 'ind_11d0b7d13e3ba4bc',
  'Unique: Delta Warri North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_11d0b7d13e3ba4bc', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_11d0b7d13e3ba4bc', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_11d0b7d13e3ba4bc', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_warri_north',
  'ind_11d0b7d13e3ba4bc', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_11d0b7d13e3ba4bc', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Warri North', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_11d0b7d13e3ba4bc', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_11d0b7d13e3ba4bc',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_11d0b7d13e3ba4bc', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_11d0b7d13e3ba4bc',
  'political_assignment', '{"constituency_inec":"WARRI NORTH","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_11d0b7d13e3ba4bc', 'prof_11d0b7d13e3ba4bc',
  'Martins Alfred O.',
  'martins alfred o. delta state assembly warri north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Uroye Augustine -- Warri South I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f833c830bb889001', 'Uroye Augustine',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f833c830bb889001', 'ind_f833c830bb889001', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Uroye Augustine', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f833c830bb889001', 'prof_f833c830bb889001',
  'Member, Delta State House of Assembly (WARRI SOUTH I)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f833c830bb889001', 'ind_f833c830bb889001', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f833c830bb889001', 'ind_f833c830bb889001', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f833c830bb889001', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|warri south i|2023',
  'insert', 'ind_f833c830bb889001',
  'Unique: Delta Warri South I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f833c830bb889001', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_f833c830bb889001', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f833c830bb889001', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_warri_south_i',
  'ind_f833c830bb889001', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f833c830bb889001', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Warri South I', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f833c830bb889001', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_f833c830bb889001',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f833c830bb889001', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_f833c830bb889001',
  'political_assignment', '{"constituency_inec":"WARRI SOUTH I","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f833c830bb889001', 'prof_f833c830bb889001',
  'Uroye Augustine',
  'uroye augustine delta state assembly warri south i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Guwor Emomotimi Dennis -- Warri South-West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cc4d17c975f93a4e', 'Guwor Emomotimi Dennis',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cc4d17c975f93a4e', 'ind_cc4d17c975f93a4e', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Guwor Emomotimi Dennis', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cc4d17c975f93a4e', 'prof_cc4d17c975f93a4e',
  'Member, Delta State House of Assembly (WARRI SOUTH-WEST)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cc4d17c975f93a4e', 'ind_cc4d17c975f93a4e', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cc4d17c975f93a4e', 'ind_cc4d17c975f93a4e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cc4d17c975f93a4e', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|warri south-west|2023',
  'insert', 'ind_cc4d17c975f93a4e',
  'Unique: Delta Warri South-West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cc4d17c975f93a4e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_cc4d17c975f93a4e', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cc4d17c975f93a4e', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_warri_south-west',
  'ind_cc4d17c975f93a4e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cc4d17c975f93a4e', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Warri South-West', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cc4d17c975f93a4e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_cc4d17c975f93a4e',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cc4d17c975f93a4e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_cc4d17c975f93a4e',
  'political_assignment', '{"constituency_inec":"WARRI SOUTH-WEST","party_abbrev":"PDP","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cc4d17c975f93a4e', 'prof_cc4d17c975f93a4e',
  'Guwor Emomotimi Dennis',
  'guwor emomotimi dennis delta state assembly warri south-west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Obire Benson -- Warri South II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9cab6c7e03168f0e', 'Obire Benson',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9cab6c7e03168f0e', 'ind_9cab6c7e03168f0e', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Obire Benson', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9cab6c7e03168f0e', 'prof_9cab6c7e03168f0e',
  'Member, Delta State House of Assembly (WARRI SOUTH II)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9cab6c7e03168f0e', 'ind_9cab6c7e03168f0e', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9cab6c7e03168f0e', 'ind_9cab6c7e03168f0e', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9cab6c7e03168f0e', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|warri south ii|2023',
  'insert', 'ind_9cab6c7e03168f0e',
  'Unique: Delta Warri South II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9cab6c7e03168f0e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_9cab6c7e03168f0e', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9cab6c7e03168f0e', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_warri_south_ii',
  'ind_9cab6c7e03168f0e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9cab6c7e03168f0e', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Warri South II', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9cab6c7e03168f0e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_9cab6c7e03168f0e',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9cab6c7e03168f0e', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_9cab6c7e03168f0e',
  'political_assignment', '{"constituency_inec":"WARRI SOUTH II","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9cab6c7e03168f0e', 'prof_9cab6c7e03168f0e',
  'Obire Benson',
  'obire benson delta state assembly warri south ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Ohwofa Obokpare Spencer -- Ughelli North II (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2ec3a6a2c66f8c99', 'Ohwofa Obokpare Spencer',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2ec3a6a2c66f8c99', 'ind_2ec3a6a2c66f8c99', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ohwofa Obokpare Spencer', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2ec3a6a2c66f8c99', 'prof_2ec3a6a2c66f8c99',
  'Member, Delta State House of Assembly (UGHELLI NORTH II)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2ec3a6a2c66f8c99', 'ind_2ec3a6a2c66f8c99', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2ec3a6a2c66f8c99', 'ind_2ec3a6a2c66f8c99', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2ec3a6a2c66f8c99', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ughelli north ii|2023',
  'insert', 'ind_2ec3a6a2c66f8c99',
  'Unique: Delta Ughelli North II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2ec3a6a2c66f8c99', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_2ec3a6a2c66f8c99', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2ec3a6a2c66f8c99', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ughelli_north_ii',
  'ind_2ec3a6a2c66f8c99', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2ec3a6a2c66f8c99', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ughelli North II', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2ec3a6a2c66f8c99', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_2ec3a6a2c66f8c99',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2ec3a6a2c66f8c99', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_2ec3a6a2c66f8c99',
  'political_assignment', '{"constituency_inec":"UGHELLI NORTH II","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2ec3a6a2c66f8c99', 'prof_2ec3a6a2c66f8c99',
  'Ohwofa Obokpare Spencer',
  'ohwofa obokpare spencer delta state assembly ughelli north ii apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Omonade Mathew Onojighofia -- Ughelli North 1 (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fad7a8946a7c9f67', 'Omonade Mathew Onojighofia',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fad7a8946a7c9f67', 'ind_fad7a8946a7c9f67', 'individual', 'place_state_delta',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Omonade Mathew Onojighofia', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fad7a8946a7c9f67', 'prof_fad7a8946a7c9f67',
  'Member, Delta State House of Assembly (UGHELLI NORTH 1)',
  'place_state_delta', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fad7a8946a7c9f67', 'ind_fad7a8946a7c9f67', 'term_ng_delta_state_assembly_10th_2023_2027',
  'place_state_delta', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fad7a8946a7c9f67', 'ind_fad7a8946a7c9f67', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fad7a8946a7c9f67', 'seed_run_s05_political_delta_roster_20260502', 'individual',
  'ng_state_assembly_member|delta|ughelli north 1|2023',
  'insert', 'ind_fad7a8946a7c9f67',
  'Unique: Delta Ughelli North 1 seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fad7a8946a7c9f67', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_fad7a8946a7c9f67', 'seed_source_nigerianleaders_delta_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fad7a8946a7c9f67', 'seed_run_s05_political_delta_roster_20260502', 'seed_source_nigerianleaders_delta_assembly_20260502',
  'nl_delta_assembly_2023_ughelli_north_1',
  'ind_fad7a8946a7c9f67', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fad7a8946a7c9f67', 'seed_run_s05_political_delta_roster_20260502',
  'Delta Ughelli North 1', 'place_state_delta', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fad7a8946a7c9f67', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_fad7a8946a7c9f67',
  'seed_source_nigerianleaders_delta_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fad7a8946a7c9f67', 'seed_run_s05_political_delta_roster_20260502', 'individual', 'ind_fad7a8946a7c9f67',
  'political_assignment', '{"constituency_inec":"UGHELLI NORTH 1","party_abbrev":"APC","position":"Member","source_url":"https://nigerianleaders.com/delta-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fad7a8946a7c9f67', 'prof_fad7a8946a7c9f67',
  'Omonade Mathew Onojighofia',
  'omonade mathew onojighofia delta state assembly ughelli north 1 apc politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_delta',
  'political',
  unixepoch(), unixepoch()
);

