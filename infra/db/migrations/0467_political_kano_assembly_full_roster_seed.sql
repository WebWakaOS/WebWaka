-- ============================================================
-- Migration 0467: Kano State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders – Complete List of Kano State House of Assembly Members
-- Members seeded: 39/40
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_kano_assembly_20260502',
  'NigerianLeaders – Complete List of Kano State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/kano-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_kano_roster_20260502', 'S05 Batch 8a – Kano State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_kano_roster_20260502',
  'seed_run_s05_political_kano_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0467_political_kano_assembly_full_roster_seed.sql',
  NULL, 39,
  '39/40 members seeded; constituency place IDs resolved at state level pending full constituency seed');

-- Term already seeded in 0465 (INSERT OR IGNORE is safe)
INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_kano_state_assembly_10th_2023_2027',
  'Kano State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_kano',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (39 of 40 seats) ──────────────────────────────────────

-- 01. Lawal Tini -- Ajingi (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3080d8cff8426769', 'Lawal Tini',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3080d8cff8426769', 'ind_3080d8cff8426769', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lawal Tini', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3080d8cff8426769', 'prof_3080d8cff8426769',
  'Member, Kano State House of Assembly (AJINGI)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3080d8cff8426769', 'ind_3080d8cff8426769', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3080d8cff8426769', 'ind_3080d8cff8426769', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3080d8cff8426769', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|ajingi|2023',
  'insert', 'ind_3080d8cff8426769',
  'Unique: Kano Ajingi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3080d8cff8426769', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_3080d8cff8426769', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3080d8cff8426769', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_ajingi',
  'ind_3080d8cff8426769', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3080d8cff8426769', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Ajingi', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3080d8cff8426769', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_3080d8cff8426769',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3080d8cff8426769', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_3080d8cff8426769',
  'political_assignment', '{"constituency_inec": "AJINGI", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3080d8cff8426769', 'prof_3080d8cff8426769',
  'Lawal Tini',
  'lawal tini kano state assembly ajingi nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Musa Tahir Haruna -- Albasu (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7900ad709d246c18', 'Musa Tahir Haruna',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7900ad709d246c18', 'ind_7900ad709d246c18', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Tahir Haruna', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7900ad709d246c18', 'prof_7900ad709d246c18',
  'Member, Kano State House of Assembly (ALBASU)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7900ad709d246c18', 'ind_7900ad709d246c18', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7900ad709d246c18', 'ind_7900ad709d246c18', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7900ad709d246c18', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|albasu|2023',
  'insert', 'ind_7900ad709d246c18',
  'Unique: Kano Albasu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7900ad709d246c18', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7900ad709d246c18', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7900ad709d246c18', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_albasu',
  'ind_7900ad709d246c18', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7900ad709d246c18', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Albasu', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7900ad709d246c18', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7900ad709d246c18',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7900ad709d246c18', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7900ad709d246c18',
  'political_assignment', '{"constituency_inec": "ALBASU", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7900ad709d246c18', 'prof_7900ad709d246c18',
  'Musa Tahir Haruna',
  'musa tahir haruna kano state assembly albasu nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Halilu Ibrahim Kundila -- Bagwai/Shanono (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fcefc0cde601d8e3', 'Halilu Ibrahim Kundila',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fcefc0cde601d8e3', 'ind_fcefc0cde601d8e3', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Halilu Ibrahim Kundila', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fcefc0cde601d8e3', 'prof_fcefc0cde601d8e3',
  'Member, Kano State House of Assembly (BAGWAI/SHANONO)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fcefc0cde601d8e3', 'ind_fcefc0cde601d8e3', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fcefc0cde601d8e3', 'ind_fcefc0cde601d8e3', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fcefc0cde601d8e3', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|bagwai_shanono|2023',
  'insert', 'ind_fcefc0cde601d8e3',
  'Unique: Kano Bagwai/Shanono seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fcefc0cde601d8e3', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_fcefc0cde601d8e3', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fcefc0cde601d8e3', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_bagwai_shanono',
  'ind_fcefc0cde601d8e3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fcefc0cde601d8e3', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Bagwai/Shanono', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fcefc0cde601d8e3', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_fcefc0cde601d8e3',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fcefc0cde601d8e3', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_fcefc0cde601d8e3',
  'political_assignment', '{"constituency_inec": "BAGWAI/SHANONO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fcefc0cde601d8e3', 'prof_fcefc0cde601d8e3',
  'Halilu Ibrahim Kundila',
  'halilu ibrahim kundila kano state assembly bagwai_shanono apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Ali Muhammad Tiga -- Bebeji (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_deadaf91b26642c9', 'Ali Muhammad Tiga',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_deadaf91b26642c9', 'ind_deadaf91b26642c9', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ali Muhammad Tiga', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_deadaf91b26642c9', 'prof_deadaf91b26642c9',
  'Member, Kano State House of Assembly (BEBEJI)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_deadaf91b26642c9', 'ind_deadaf91b26642c9', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_deadaf91b26642c9', 'ind_deadaf91b26642c9', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_deadaf91b26642c9', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|bebeji|2023',
  'insert', 'ind_deadaf91b26642c9',
  'Unique: Kano Bebeji seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_deadaf91b26642c9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_deadaf91b26642c9', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_deadaf91b26642c9', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_bebeji',
  'ind_deadaf91b26642c9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_deadaf91b26642c9', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Bebeji', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_deadaf91b26642c9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_deadaf91b26642c9',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_deadaf91b26642c9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_deadaf91b26642c9',
  'political_assignment', '{"constituency_inec": "BEBEJI", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_deadaf91b26642c9', 'prof_deadaf91b26642c9',
  'Ali Muhammad Tiga',
  'ali muhammad tiga kano state assembly bebeji nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Lawal Shehu -- Bichi (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5cca38dacc1e04a6', 'Lawal Shehu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5cca38dacc1e04a6', 'ind_5cca38dacc1e04a6', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lawal Shehu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5cca38dacc1e04a6', 'prof_5cca38dacc1e04a6',
  'Member, Kano State House of Assembly (BICHI)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5cca38dacc1e04a6', 'ind_5cca38dacc1e04a6', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5cca38dacc1e04a6', 'ind_5cca38dacc1e04a6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5cca38dacc1e04a6', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|bichi|2023',
  'insert', 'ind_5cca38dacc1e04a6',
  'Unique: Kano Bichi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5cca38dacc1e04a6', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_5cca38dacc1e04a6', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5cca38dacc1e04a6', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_bichi',
  'ind_5cca38dacc1e04a6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5cca38dacc1e04a6', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Bichi', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5cca38dacc1e04a6', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_5cca38dacc1e04a6',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5cca38dacc1e04a6', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_5cca38dacc1e04a6',
  'political_assignment', '{"constituency_inec": "BICHI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5cca38dacc1e04a6', 'prof_5cca38dacc1e04a6',
  'Lawal Shehu',
  'lawal shehu kano state assembly bichi apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Hafiz Gambo -- Bunkure (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9ce2c1fcc5bce3b5', 'Hafiz Gambo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9ce2c1fcc5bce3b5', 'ind_9ce2c1fcc5bce3b5', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hafiz Gambo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9ce2c1fcc5bce3b5', 'prof_9ce2c1fcc5bce3b5',
  'Member, Kano State House of Assembly (BUNKURE)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9ce2c1fcc5bce3b5', 'ind_9ce2c1fcc5bce3b5', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9ce2c1fcc5bce3b5', 'ind_9ce2c1fcc5bce3b5', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9ce2c1fcc5bce3b5', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|bunkure|2023',
  'insert', 'ind_9ce2c1fcc5bce3b5',
  'Unique: Kano Bunkure seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9ce2c1fcc5bce3b5', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_9ce2c1fcc5bce3b5', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9ce2c1fcc5bce3b5', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_bunkure',
  'ind_9ce2c1fcc5bce3b5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9ce2c1fcc5bce3b5', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Bunkure', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9ce2c1fcc5bce3b5', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_9ce2c1fcc5bce3b5',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9ce2c1fcc5bce3b5', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_9ce2c1fcc5bce3b5',
  'political_assignment', '{"constituency_inec": "BUNKURE", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9ce2c1fcc5bce3b5', 'prof_9ce2c1fcc5bce3b5',
  'Hafiz Gambo',
  'hafiz gambo kano state assembly bunkure nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Lawal Husain -- Dala (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_29c8ce62311791f1', 'Lawal Husain',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_29c8ce62311791f1', 'ind_29c8ce62311791f1', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Lawal Husain', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_29c8ce62311791f1', 'prof_29c8ce62311791f1',
  'Member, Kano State House of Assembly (DALA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_29c8ce62311791f1', 'ind_29c8ce62311791f1', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_29c8ce62311791f1', 'ind_29c8ce62311791f1', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_29c8ce62311791f1', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|dala|2023',
  'insert', 'ind_29c8ce62311791f1',
  'Unique: Kano Dala seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_29c8ce62311791f1', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_29c8ce62311791f1', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_29c8ce62311791f1', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_dala',
  'ind_29c8ce62311791f1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_29c8ce62311791f1', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Dala', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_29c8ce62311791f1', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_29c8ce62311791f1',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_29c8ce62311791f1', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_29c8ce62311791f1',
  'political_assignment', '{"constituency_inec": "DALA", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_29c8ce62311791f1', 'prof_29c8ce62311791f1',
  'Lawal Husain',
  'lawal husain kano state assembly dala nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Murtala Musa Kore -- Dambatta (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_706535e916ff62a1', 'Murtala Musa Kore',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_706535e916ff62a1', 'ind_706535e916ff62a1', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Murtala Musa Kore', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_706535e916ff62a1', 'prof_706535e916ff62a1',
  'Member, Kano State House of Assembly (DAMBATTA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_706535e916ff62a1', 'ind_706535e916ff62a1', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_706535e916ff62a1', 'ind_706535e916ff62a1', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_706535e916ff62a1', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|dambatta|2023',
  'insert', 'ind_706535e916ff62a1',
  'Unique: Kano Dambatta seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_706535e916ff62a1', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_706535e916ff62a1', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_706535e916ff62a1', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_dambatta',
  'ind_706535e916ff62a1', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_706535e916ff62a1', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Dambatta', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_706535e916ff62a1', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_706535e916ff62a1',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_706535e916ff62a1', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_706535e916ff62a1',
  'political_assignment', '{"constituency_inec": "DAMBATTA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_706535e916ff62a1', 'prof_706535e916ff62a1',
  'Murtala Musa Kore',
  'murtala musa kore kano state assembly dambatta apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Rabiu Shuaibu -- Dawakin Kudu (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f025c4710c0f80e8', 'Rabiu Shuaibu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f025c4710c0f80e8', 'ind_f025c4710c0f80e8', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Rabiu Shuaibu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f025c4710c0f80e8', 'prof_f025c4710c0f80e8',
  'Member, Kano State House of Assembly (DAWAKIN KUDU)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f025c4710c0f80e8', 'ind_f025c4710c0f80e8', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f025c4710c0f80e8', 'ind_f025c4710c0f80e8', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f025c4710c0f80e8', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|dawakin_kudu|2023',
  'insert', 'ind_f025c4710c0f80e8',
  'Unique: Kano Dawakin Kudu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f025c4710c0f80e8', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f025c4710c0f80e8', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f025c4710c0f80e8', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_dawakin_kudu',
  'ind_f025c4710c0f80e8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f025c4710c0f80e8', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Dawakin Kudu', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f025c4710c0f80e8', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f025c4710c0f80e8',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f025c4710c0f80e8', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f025c4710c0f80e8',
  'political_assignment', '{"constituency_inec": "DAWAKIN KUDU", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f025c4710c0f80e8', 'prof_f025c4710c0f80e8',
  'Rabiu Shuaibu',
  'rabiu shuaibu kano state assembly dawakin_kudu nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Saleh Ahmad Marke -- Dawakin Tofa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d83346b31546a1ae', 'Saleh Ahmad Marke',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d83346b31546a1ae', 'ind_d83346b31546a1ae', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Saleh Ahmad Marke', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d83346b31546a1ae', 'prof_d83346b31546a1ae',
  'Member, Kano State House of Assembly (DAWAKIN TOFA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d83346b31546a1ae', 'ind_d83346b31546a1ae', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d83346b31546a1ae', 'ind_d83346b31546a1ae', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d83346b31546a1ae', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|dawakin_tofa|2023',
  'insert', 'ind_d83346b31546a1ae',
  'Unique: Kano Dawakin Tofa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d83346b31546a1ae', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_d83346b31546a1ae', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d83346b31546a1ae', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_dawakin_tofa',
  'ind_d83346b31546a1ae', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d83346b31546a1ae', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Dawakin Tofa', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d83346b31546a1ae', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_d83346b31546a1ae',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d83346b31546a1ae', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_d83346b31546a1ae',
  'political_assignment', '{"constituency_inec": "DAWAKIN TOFA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d83346b31546a1ae', 'prof_d83346b31546a1ae',
  'Saleh Ahmad Marke',
  'saleh ahmad marke kano state assembly dawakin_tofa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Salisu Ibrahim Muhammad -- Doguwa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_647c8c24d3474a66', 'Salisu Ibrahim Muhammad',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_647c8c24d3474a66', 'ind_647c8c24d3474a66', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Salisu Ibrahim Muhammad', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_647c8c24d3474a66', 'prof_647c8c24d3474a66',
  'Member, Kano State House of Assembly (DOGUWA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_647c8c24d3474a66', 'ind_647c8c24d3474a66', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_647c8c24d3474a66', 'ind_647c8c24d3474a66', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_647c8c24d3474a66', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|doguwa|2023',
  'insert', 'ind_647c8c24d3474a66',
  'Unique: Kano Doguwa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_647c8c24d3474a66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_647c8c24d3474a66', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_647c8c24d3474a66', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_doguwa',
  'ind_647c8c24d3474a66', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_647c8c24d3474a66', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Doguwa', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_647c8c24d3474a66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_647c8c24d3474a66',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_647c8c24d3474a66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_647c8c24d3474a66',
  'political_assignment', '{"constituency_inec": "DOGUWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_647c8c24d3474a66', 'prof_647c8c24d3474a66',
  'Salisu Ibrahim Muhammad',
  'salisu ibrahim muhammad kano state assembly doguwa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Muhammad Dan'azumi -- Gabasawa (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6c5a7d55a50b67be', 'Muhammad Dan''azumi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6c5a7d55a50b67be', 'ind_6c5a7d55a50b67be', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Dan''azumi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6c5a7d55a50b67be', 'prof_6c5a7d55a50b67be',
  'Member, Kano State House of Assembly (GABASAWA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6c5a7d55a50b67be', 'ind_6c5a7d55a50b67be', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6c5a7d55a50b67be', 'ind_6c5a7d55a50b67be', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6c5a7d55a50b67be', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|gabasawa|2023',
  'insert', 'ind_6c5a7d55a50b67be',
  'Unique: Kano Gabasawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6c5a7d55a50b67be', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6c5a7d55a50b67be', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6c5a7d55a50b67be', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_gabasawa',
  'ind_6c5a7d55a50b67be', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6c5a7d55a50b67be', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Gabasawa', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6c5a7d55a50b67be', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6c5a7d55a50b67be',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6c5a7d55a50b67be', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6c5a7d55a50b67be',
  'political_assignment', '{"constituency_inec": "GABASAWA", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6c5a7d55a50b67be', 'prof_6c5a7d55a50b67be',
  'Muhammad Dan''azumi',
  'muhammad dan'azumi kano state assembly gabasawa nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Abba Ibrahim -- Garko (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_59271771242884a3', 'Abba Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_59271771242884a3', 'ind_59271771242884a3', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abba Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_59271771242884a3', 'prof_59271771242884a3',
  'Member, Kano State House of Assembly (GARKO)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_59271771242884a3', 'ind_59271771242884a3', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_59271771242884a3', 'ind_59271771242884a3', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_59271771242884a3', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|garko|2023',
  'insert', 'ind_59271771242884a3',
  'Unique: Kano Garko seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_59271771242884a3', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_59271771242884a3', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_59271771242884a3', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_garko',
  'ind_59271771242884a3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_59271771242884a3', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Garko', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_59271771242884a3', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_59271771242884a3',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_59271771242884a3', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_59271771242884a3',
  'political_assignment', '{"constituency_inec": "GARKO", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_59271771242884a3', 'prof_59271771242884a3',
  'Abba Ibrahim',
  'abba ibrahim kano state assembly garko nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Abubakar Danladi Isah -- Gaya (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7b4e9caf66807b8b', 'Abubakar Danladi Isah',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7b4e9caf66807b8b', 'ind_7b4e9caf66807b8b', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abubakar Danladi Isah', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7b4e9caf66807b8b', 'prof_7b4e9caf66807b8b',
  'Member, Kano State House of Assembly (GAYA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7b4e9caf66807b8b', 'ind_7b4e9caf66807b8b', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7b4e9caf66807b8b', 'ind_7b4e9caf66807b8b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7b4e9caf66807b8b', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|gaya|2023',
  'insert', 'ind_7b4e9caf66807b8b',
  'Unique: Kano Gaya seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7b4e9caf66807b8b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7b4e9caf66807b8b', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7b4e9caf66807b8b', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_gaya',
  'ind_7b4e9caf66807b8b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7b4e9caf66807b8b', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Gaya', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7b4e9caf66807b8b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7b4e9caf66807b8b',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7b4e9caf66807b8b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7b4e9caf66807b8b',
  'political_assignment', '{"constituency_inec": "GAYA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7b4e9caf66807b8b', 'prof_7b4e9caf66807b8b',
  'Abubakar Danladi Isah',
  'abubakar danladi isah kano state assembly gaya apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Abdullahi Yahya -- Gezawa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f22ff7788fc0ca66', 'Abdullahi Yahya',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f22ff7788fc0ca66', 'ind_f22ff7788fc0ca66', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Yahya', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f22ff7788fc0ca66', 'prof_f22ff7788fc0ca66',
  'Member, Kano State House of Assembly (GEZAWA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f22ff7788fc0ca66', 'ind_f22ff7788fc0ca66', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f22ff7788fc0ca66', 'ind_f22ff7788fc0ca66', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f22ff7788fc0ca66', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|gezawa|2023',
  'insert', 'ind_f22ff7788fc0ca66',
  'Unique: Kano Gezawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f22ff7788fc0ca66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f22ff7788fc0ca66', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f22ff7788fc0ca66', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_gezawa',
  'ind_f22ff7788fc0ca66', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f22ff7788fc0ca66', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Gezawa', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f22ff7788fc0ca66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f22ff7788fc0ca66',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f22ff7788fc0ca66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f22ff7788fc0ca66',
  'political_assignment', '{"constituency_inec": "GEZAWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f22ff7788fc0ca66', 'prof_f22ff7788fc0ca66',
  'Abdullahi Yahya',
  'abdullahi yahya kano state assembly gezawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Abdulmajid Isah Umar -- Gwale (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e3554424863a7326', 'Abdulmajid Isah Umar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e3554424863a7326', 'ind_e3554424863a7326', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdulmajid Isah Umar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e3554424863a7326', 'prof_e3554424863a7326',
  'Member, Kano State House of Assembly (GWALE)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e3554424863a7326', 'ind_e3554424863a7326', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e3554424863a7326', 'ind_e3554424863a7326', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e3554424863a7326', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|gwale|2023',
  'insert', 'ind_e3554424863a7326',
  'Unique: Kano Gwale seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e3554424863a7326', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_e3554424863a7326', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e3554424863a7326', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_gwale',
  'ind_e3554424863a7326', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e3554424863a7326', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Gwale', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e3554424863a7326', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_e3554424863a7326',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e3554424863a7326', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_e3554424863a7326',
  'political_assignment', '{"constituency_inec": "GWALE", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e3554424863a7326', 'prof_e3554424863a7326',
  'Abdulmajid Isah Umar',
  'abdulmajid isah umar kano state assembly gwale nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Yunusa Haruna Kayyu -- Gwarzo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c2c62edd17ecab99', 'Yunusa Haruna Kayyu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c2c62edd17ecab99', 'ind_c2c62edd17ecab99', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yunusa Haruna Kayyu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c2c62edd17ecab99', 'prof_c2c62edd17ecab99',
  'Member, Kano State House of Assembly (GWARZO)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c2c62edd17ecab99', 'ind_c2c62edd17ecab99', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c2c62edd17ecab99', 'ind_c2c62edd17ecab99', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c2c62edd17ecab99', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|gwarzo|2023',
  'insert', 'ind_c2c62edd17ecab99',
  'Unique: Kano Gwarzo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c2c62edd17ecab99', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_c2c62edd17ecab99', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c2c62edd17ecab99', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_gwarzo',
  'ind_c2c62edd17ecab99', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c2c62edd17ecab99', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Gwarzo', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c2c62edd17ecab99', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_c2c62edd17ecab99',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c2c62edd17ecab99', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_c2c62edd17ecab99',
  'political_assignment', '{"constituency_inec": "GWARZO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c2c62edd17ecab99', 'prof_c2c62edd17ecab99',
  'Yunusa Haruna Kayyu',
  'yunusa haruna kayyu kano state assembly gwarzo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Ayuba Labaran Alhassan -- Kabo (APC) - Minority Whip
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7753ce2367da2b8b', 'Ayuba Labaran Alhassan',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7753ce2367da2b8b', 'ind_7753ce2367da2b8b', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayuba Labaran Alhassan', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7753ce2367da2b8b', 'prof_7753ce2367da2b8b',
  'Member (Minority Whip), Kano State House of Assembly (KABO)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7753ce2367da2b8b', 'ind_7753ce2367da2b8b', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7753ce2367da2b8b', 'ind_7753ce2367da2b8b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7753ce2367da2b8b', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|kabo|2023',
  'insert', 'ind_7753ce2367da2b8b',
  'Unique: Kano Kabo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7753ce2367da2b8b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7753ce2367da2b8b', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7753ce2367da2b8b', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_kabo',
  'ind_7753ce2367da2b8b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7753ce2367da2b8b', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Kabo', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7753ce2367da2b8b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7753ce2367da2b8b',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7753ce2367da2b8b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_7753ce2367da2b8b',
  'political_assignment', '{"constituency_inec": "KABO", "party_abbrev": "APC", "position": "Minority Whip", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7753ce2367da2b8b', 'prof_7753ce2367da2b8b',
  'Ayuba Labaran Alhassan',
  'ayuba labaran alhassan kano state assembly kabo apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Sarki Aliyu Daneji -- Kano Municipal (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_84619ed241aa0e66', 'Sarki Aliyu Daneji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_84619ed241aa0e66', 'ind_84619ed241aa0e66', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sarki Aliyu Daneji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_84619ed241aa0e66', 'prof_84619ed241aa0e66',
  'Member, Kano State House of Assembly (KANO MUNICIPAL)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_84619ed241aa0e66', 'ind_84619ed241aa0e66', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_84619ed241aa0e66', 'ind_84619ed241aa0e66', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_84619ed241aa0e66', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|kano_municipal|2023',
  'insert', 'ind_84619ed241aa0e66',
  'Unique: Kano Kano Municipal seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_84619ed241aa0e66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_84619ed241aa0e66', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_84619ed241aa0e66', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_kano_municipal',
  'ind_84619ed241aa0e66', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_84619ed241aa0e66', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Kano Municipal', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_84619ed241aa0e66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_84619ed241aa0e66',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_84619ed241aa0e66', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_84619ed241aa0e66',
  'political_assignment', '{"constituency_inec": "KANO MUNICIPAL", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_84619ed241aa0e66', 'prof_84619ed241aa0e66',
  'Sarki Aliyu Daneji',
  'sarki aliyu daneji kano state assembly kano_municipal nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Ahmad Ibrahim -- Karaye (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4a9368d7dc3d5c83', 'Ahmad Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4a9368d7dc3d5c83', 'ind_4a9368d7dc3d5c83', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ahmad Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4a9368d7dc3d5c83', 'prof_4a9368d7dc3d5c83',
  'Member, Kano State House of Assembly (KARAYE)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4a9368d7dc3d5c83', 'ind_4a9368d7dc3d5c83', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4a9368d7dc3d5c83', 'ind_4a9368d7dc3d5c83', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4a9368d7dc3d5c83', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|karaye|2023',
  'insert', 'ind_4a9368d7dc3d5c83',
  'Unique: Kano Karaye seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4a9368d7dc3d5c83', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_4a9368d7dc3d5c83', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4a9368d7dc3d5c83', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_karaye',
  'ind_4a9368d7dc3d5c83', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4a9368d7dc3d5c83', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Karaye', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4a9368d7dc3d5c83', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_4a9368d7dc3d5c83',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4a9368d7dc3d5c83', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_4a9368d7dc3d5c83',
  'political_assignment', '{"constituency_inec": "KARAYE", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4a9368d7dc3d5c83', 'prof_4a9368d7dc3d5c83',
  'Ahmad Ibrahim',
  'ahmad ibrahim kano state assembly karaye nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Garba Shehu Fammar -- Kibiya (NNPP) - Deputy Majority Leader
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_f2bb9e6449e1afc9', 'Garba Shehu Fammar',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_f2bb9e6449e1afc9', 'ind_f2bb9e6449e1afc9', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Garba Shehu Fammar', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_f2bb9e6449e1afc9', 'prof_f2bb9e6449e1afc9',
  'Member (Deputy Majority Leader), Kano State House of Assembly (KIBIYA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_f2bb9e6449e1afc9', 'ind_f2bb9e6449e1afc9', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_f2bb9e6449e1afc9', 'ind_f2bb9e6449e1afc9', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_f2bb9e6449e1afc9', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|kibiya|2023',
  'insert', 'ind_f2bb9e6449e1afc9',
  'Unique: Kano Kibiya seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_f2bb9e6449e1afc9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f2bb9e6449e1afc9', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_f2bb9e6449e1afc9', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_kibiya',
  'ind_f2bb9e6449e1afc9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_f2bb9e6449e1afc9', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Kibiya', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_f2bb9e6449e1afc9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f2bb9e6449e1afc9',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_f2bb9e6449e1afc9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_f2bb9e6449e1afc9',
  'political_assignment', '{"constituency_inec": "KIBIYA", "party_abbrev": "NNPP", "position": "Deputy Majority Leader", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_f2bb9e6449e1afc9', 'prof_f2bb9e6449e1afc9',
  'Garba Shehu Fammar',
  'garba shehu fammar kano state assembly kibiya nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Usman Rabula -- Kiru (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5d19781a09a32b76', 'Usman Rabula',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5d19781a09a32b76', 'ind_5d19781a09a32b76', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Usman Rabula', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5d19781a09a32b76', 'prof_5d19781a09a32b76',
  'Member, Kano State House of Assembly (KIRU)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5d19781a09a32b76', 'ind_5d19781a09a32b76', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5d19781a09a32b76', 'ind_5d19781a09a32b76', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5d19781a09a32b76', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|kiru|2023',
  'insert', 'ind_5d19781a09a32b76',
  'Unique: Kano Kiru seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5d19781a09a32b76', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_5d19781a09a32b76', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5d19781a09a32b76', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_kiru',
  'ind_5d19781a09a32b76', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5d19781a09a32b76', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Kiru', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5d19781a09a32b76', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_5d19781a09a32b76',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5d19781a09a32b76', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_5d19781a09a32b76',
  'political_assignment', '{"constituency_inec": "KIRU", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5d19781a09a32b76', 'prof_5d19781a09a32b76',
  'Usman Rabula',
  'usman rabula kano state assembly kiru nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Mudassir Ibrahim -- Kumbotso (NNPP) - Chief Whip
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e3b588a38a34735e', 'Mudassir Ibrahim',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e3b588a38a34735e', 'ind_e3b588a38a34735e', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mudassir Ibrahim', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e3b588a38a34735e', 'prof_e3b588a38a34735e',
  'Member (Chief Whip), Kano State House of Assembly (KUMBOTSO)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e3b588a38a34735e', 'ind_e3b588a38a34735e', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e3b588a38a34735e', 'ind_e3b588a38a34735e', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e3b588a38a34735e', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|kumbotso|2023',
  'insert', 'ind_e3b588a38a34735e',
  'Unique: Kano Kumbotso seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e3b588a38a34735e', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_e3b588a38a34735e', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e3b588a38a34735e', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_kumbotso',
  'ind_e3b588a38a34735e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e3b588a38a34735e', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Kumbotso', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e3b588a38a34735e', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_e3b588a38a34735e',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e3b588a38a34735e', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_e3b588a38a34735e',
  'political_assignment', '{"constituency_inec": "KUMBOTSO", "party_abbrev": "NNPP", "position": "Chief Whip", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e3b588a38a34735e', 'prof_e3b588a38a34735e',
  'Mudassir Ibrahim',
  'mudassir ibrahim kano state assembly kumbotso nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Garba Ya'u Gwarmai -- Kunchi/Tsanyawa (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1ed25370458d2a2b', 'Garba Ya''u Gwarmai',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1ed25370458d2a2b', 'ind_1ed25370458d2a2b', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Garba Ya''u Gwarmai', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1ed25370458d2a2b', 'prof_1ed25370458d2a2b',
  'Member, Kano State House of Assembly (KUNCHI/TSANYAWA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1ed25370458d2a2b', 'ind_1ed25370458d2a2b', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1ed25370458d2a2b', 'ind_1ed25370458d2a2b', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1ed25370458d2a2b', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|kunchi_tsanyawa|2023',
  'insert', 'ind_1ed25370458d2a2b',
  'Unique: Kano Kunchi/Tsanyawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1ed25370458d2a2b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_1ed25370458d2a2b', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1ed25370458d2a2b', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_kunchi_tsanyawa',
  'ind_1ed25370458d2a2b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1ed25370458d2a2b', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Kunchi/Tsanyawa', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1ed25370458d2a2b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_1ed25370458d2a2b',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1ed25370458d2a2b', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_1ed25370458d2a2b',
  'political_assignment', '{"constituency_inec": "KUNCHI/TSANYAWA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1ed25370458d2a2b', 'prof_1ed25370458d2a2b',
  'Garba Ya''u Gwarmai',
  'garba ya'u gwarmai kano state assembly kunchi_tsanyawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Alhassan Zakari Ishaq -- Kura/Garun Malam (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8e2617f907f32d99', 'Alhassan Zakari Ishaq',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8e2617f907f32d99', 'ind_8e2617f907f32d99', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Alhassan Zakari Ishaq', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8e2617f907f32d99', 'prof_8e2617f907f32d99',
  'Member, Kano State House of Assembly (KURA/GARUN MALAM)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8e2617f907f32d99', 'ind_8e2617f907f32d99', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8e2617f907f32d99', 'ind_8e2617f907f32d99', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8e2617f907f32d99', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|kura_garun_malam|2023',
  'insert', 'ind_8e2617f907f32d99',
  'Unique: Kano Kura/Garun Malam seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8e2617f907f32d99', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_8e2617f907f32d99', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8e2617f907f32d99', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_kura_garun_malam',
  'ind_8e2617f907f32d99', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8e2617f907f32d99', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Kura/Garun Malam', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8e2617f907f32d99', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_8e2617f907f32d99',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8e2617f907f32d99', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_8e2617f907f32d99',
  'political_assignment', '{"constituency_inec": "KURA/GARUN MALAM", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8e2617f907f32d99', 'prof_8e2617f907f32d99',
  'Alhassan Zakari Ishaq',
  'alhassan zakari ishaq kano state assembly kura_garun_malam nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Suleiman Mukhtar Ishaq -- Madobi (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_14e344ea1d6e8cde', 'Suleiman Mukhtar Ishaq',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_14e344ea1d6e8cde', 'ind_14e344ea1d6e8cde', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Suleiman Mukhtar Ishaq', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_14e344ea1d6e8cde', 'prof_14e344ea1d6e8cde',
  'Member, Kano State House of Assembly (MADOBI)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_14e344ea1d6e8cde', 'ind_14e344ea1d6e8cde', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_14e344ea1d6e8cde', 'ind_14e344ea1d6e8cde', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_14e344ea1d6e8cde', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|madobi|2023',
  'insert', 'ind_14e344ea1d6e8cde',
  'Unique: Kano Madobi seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_14e344ea1d6e8cde', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_14e344ea1d6e8cde', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_14e344ea1d6e8cde', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_madobi',
  'ind_14e344ea1d6e8cde', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_14e344ea1d6e8cde', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Madobi', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_14e344ea1d6e8cde', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_14e344ea1d6e8cde',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_14e344ea1d6e8cde', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_14e344ea1d6e8cde',
  'political_assignment', '{"constituency_inec": "MADOBI", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_14e344ea1d6e8cde', 'prof_14e344ea1d6e8cde',
  'Suleiman Mukhtar Ishaq',
  'suleiman mukhtar ishaq kano state assembly madobi nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Ahmad Muhammad -- Makoda (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b1aadb0634a92152', 'Ahmad Muhammad',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b1aadb0634a92152', 'ind_b1aadb0634a92152', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ahmad Muhammad', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b1aadb0634a92152', 'prof_b1aadb0634a92152',
  'Member, Kano State House of Assembly (MAKODA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b1aadb0634a92152', 'ind_b1aadb0634a92152', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b1aadb0634a92152', 'ind_b1aadb0634a92152', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b1aadb0634a92152', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|makoda|2023',
  'insert', 'ind_b1aadb0634a92152',
  'Unique: Kano Makoda seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b1aadb0634a92152', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b1aadb0634a92152', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b1aadb0634a92152', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_makoda',
  'ind_b1aadb0634a92152', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b1aadb0634a92152', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Makoda', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b1aadb0634a92152', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b1aadb0634a92152',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b1aadb0634a92152', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b1aadb0634a92152',
  'political_assignment', '{"constituency_inec": "MAKODA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b1aadb0634a92152', 'prof_b1aadb0634a92152',
  'Ahmad Muhammad',
  'ahmad muhammad kano state assembly makoda apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 28. Abdul Abdulhamid -- Minjibir (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fcb39be83fb41712', 'Abdul Abdulhamid',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fcb39be83fb41712', 'ind_fcb39be83fb41712', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdul Abdulhamid', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fcb39be83fb41712', 'prof_fcb39be83fb41712',
  'Member, Kano State House of Assembly (MINJIBIR)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fcb39be83fb41712', 'ind_fcb39be83fb41712', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fcb39be83fb41712', 'ind_fcb39be83fb41712', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fcb39be83fb41712', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|minjibir|2023',
  'insert', 'ind_fcb39be83fb41712',
  'Unique: Kano Minjibir seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fcb39be83fb41712', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_fcb39be83fb41712', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fcb39be83fb41712', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_minjibir',
  'ind_fcb39be83fb41712', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fcb39be83fb41712', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Minjibir', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fcb39be83fb41712', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_fcb39be83fb41712',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fcb39be83fb41712', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_fcb39be83fb41712',
  'political_assignment', '{"constituency_inec": "MINJIBIR", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fcb39be83fb41712', 'prof_fcb39be83fb41712',
  'Abdul Abdulhamid',
  'abdul abdulhamid kano state assembly minjibir nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 29. Yusuf Bello Aliyu -- Nassarawa (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b5bea02a79db6add', 'Yusuf Bello Aliyu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b5bea02a79db6add', 'ind_b5bea02a79db6add', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Yusuf Bello Aliyu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b5bea02a79db6add', 'prof_b5bea02a79db6add',
  'Member, Kano State House of Assembly (NASSARAWA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b5bea02a79db6add', 'ind_b5bea02a79db6add', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b5bea02a79db6add', 'ind_b5bea02a79db6add', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b5bea02a79db6add', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|nassarawa|2023',
  'insert', 'ind_b5bea02a79db6add',
  'Unique: Kano Nassarawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b5bea02a79db6add', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b5bea02a79db6add', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b5bea02a79db6add', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_nassarawa',
  'ind_b5bea02a79db6add', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b5bea02a79db6add', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Nassarawa', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b5bea02a79db6add', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b5bea02a79db6add',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b5bea02a79db6add', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b5bea02a79db6add',
  'political_assignment', '{"constituency_inec": "NASSARAWA", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b5bea02a79db6add', 'prof_b5bea02a79db6add',
  'Yusuf Bello Aliyu',
  'yusuf bello aliyu kano state assembly nassarawa nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 30. Nuradden Alhassan Ahmad -- Rano (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_23ff79887632b12f', 'Nuradden Alhassan Ahmad',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_23ff79887632b12f', 'ind_23ff79887632b12f', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nuradden Alhassan Ahmad', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_23ff79887632b12f', 'prof_23ff79887632b12f',
  'Member, Kano State House of Assembly (RANO)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_23ff79887632b12f', 'ind_23ff79887632b12f', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_23ff79887632b12f', 'ind_23ff79887632b12f', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_23ff79887632b12f', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|rano|2023',
  'insert', 'ind_23ff79887632b12f',
  'Unique: Kano Rano seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_23ff79887632b12f', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_23ff79887632b12f', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_23ff79887632b12f', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_rano',
  'ind_23ff79887632b12f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_23ff79887632b12f', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Rano', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_23ff79887632b12f', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_23ff79887632b12f',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_23ff79887632b12f', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_23ff79887632b12f',
  'political_assignment', '{"constituency_inec": "RANO", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_23ff79887632b12f', 'prof_23ff79887632b12f',
  'Nuradden Alhassan Ahmad',
  'nuradden alhassan ahmad kano state assembly rano nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 31. Muhammad Bello Butu-Butu -- Rimin Gado/Tofa (NNPP) - Deputy Speaker
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6dac1db366ab668f', 'Muhammad Bello Butu-Butu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6dac1db366ab668f', 'ind_6dac1db366ab668f', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Muhammad Bello Butu-Butu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6dac1db366ab668f', 'prof_6dac1db366ab668f',
  'Member (Deputy Speaker), Kano State House of Assembly (RIMIN GADO/TOFA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6dac1db366ab668f', 'ind_6dac1db366ab668f', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6dac1db366ab668f', 'ind_6dac1db366ab668f', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6dac1db366ab668f', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|rimin_gado_tofa|2023',
  'insert', 'ind_6dac1db366ab668f',
  'Unique: Kano Rimin Gado/Tofa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6dac1db366ab668f', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6dac1db366ab668f', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6dac1db366ab668f', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_rimin_gado_tofa',
  'ind_6dac1db366ab668f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6dac1db366ab668f', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Rimin Gado/Tofa', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6dac1db366ab668f', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6dac1db366ab668f',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6dac1db366ab668f', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6dac1db366ab668f',
  'political_assignment', '{"constituency_inec": "RIMIN GADO/TOFA", "party_abbrev": "NNPP", "position": "Deputy Speaker", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6dac1db366ab668f', 'prof_6dac1db366ab668f',
  'Muhammad Bello Butu-Butu',
  'muhammad bello butu-butu kano state assembly rimin_gado_tofa nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 32. Jibril Ismail Falgore -- Rogo (NNPP) - Speaker
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_cdcb80a4298d45c0', 'Jibril Ismail Falgore',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_cdcb80a4298d45c0', 'ind_cdcb80a4298d45c0', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jibril Ismail Falgore', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_cdcb80a4298d45c0', 'prof_cdcb80a4298d45c0',
  'Member (Speaker), Kano State House of Assembly (ROGO)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_cdcb80a4298d45c0', 'ind_cdcb80a4298d45c0', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_cdcb80a4298d45c0', 'ind_cdcb80a4298d45c0', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_cdcb80a4298d45c0', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|rogo|2023',
  'insert', 'ind_cdcb80a4298d45c0',
  'Unique: Kano Rogo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_cdcb80a4298d45c0', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_cdcb80a4298d45c0', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_cdcb80a4298d45c0', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_rogo',
  'ind_cdcb80a4298d45c0', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_cdcb80a4298d45c0', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Rogo', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_cdcb80a4298d45c0', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_cdcb80a4298d45c0',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_cdcb80a4298d45c0', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_cdcb80a4298d45c0',
  'political_assignment', '{"constituency_inec": "ROGO", "party_abbrev": "NNPP", "position": "Speaker", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_cdcb80a4298d45c0', 'prof_cdcb80a4298d45c0',
  'Jibril Ismail Falgore',
  'jibril ismail falgore kano state assembly rogo nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 33. Zubairu Hamza Masu -- Sumaila (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b7115ce43c334ab9', 'Zubairu Hamza Masu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b7115ce43c334ab9', 'ind_b7115ce43c334ab9', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Zubairu Hamza Masu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b7115ce43c334ab9', 'prof_b7115ce43c334ab9',
  'Member, Kano State House of Assembly (SUMAILA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b7115ce43c334ab9', 'ind_b7115ce43c334ab9', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b7115ce43c334ab9', 'ind_b7115ce43c334ab9', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b7115ce43c334ab9', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|sumaila|2023',
  'insert', 'ind_b7115ce43c334ab9',
  'Unique: Kano Sumaila seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b7115ce43c334ab9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b7115ce43c334ab9', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b7115ce43c334ab9', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_sumaila',
  'ind_b7115ce43c334ab9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b7115ce43c334ab9', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Sumaila', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b7115ce43c334ab9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b7115ce43c334ab9',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b7115ce43c334ab9', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_b7115ce43c334ab9',
  'political_assignment', '{"constituency_inec": "SUMAILA", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b7115ce43c334ab9', 'prof_b7115ce43c334ab9',
  'Zubairu Hamza Masu',
  'zubairu hamza masu kano state assembly sumaila nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 34. Musa Ali Kachako -- Takai (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_4c79446935a10c34', 'Musa Ali Kachako',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_4c79446935a10c34', 'ind_4c79446935a10c34', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Musa Ali Kachako', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_4c79446935a10c34', 'prof_4c79446935a10c34',
  'Member, Kano State House of Assembly (TAKAI)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_4c79446935a10c34', 'ind_4c79446935a10c34', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_4c79446935a10c34', 'ind_4c79446935a10c34', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_4c79446935a10c34', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|takai|2023',
  'insert', 'ind_4c79446935a10c34',
  'Unique: Kano Takai seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_4c79446935a10c34', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_4c79446935a10c34', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_4c79446935a10c34', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_takai',
  'ind_4c79446935a10c34', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_4c79446935a10c34', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Takai', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_4c79446935a10c34', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_4c79446935a10c34',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_4c79446935a10c34', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_4c79446935a10c34',
  'political_assignment', '{"constituency_inec": "TAKAI", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_4c79446935a10c34', 'prof_4c79446935a10c34',
  'Musa Ali Kachako',
  'musa ali kachako kano state assembly takai apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 35. Kabiru Sule Dahiru -- Tarauni (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6b640d3deddb0e49', 'Kabiru Sule Dahiru',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6b640d3deddb0e49', 'ind_6b640d3deddb0e49', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kabiru Sule Dahiru', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6b640d3deddb0e49', 'prof_6b640d3deddb0e49',
  'Member, Kano State House of Assembly (TARAUNI)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6b640d3deddb0e49', 'ind_6b640d3deddb0e49', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6b640d3deddb0e49', 'ind_6b640d3deddb0e49', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6b640d3deddb0e49', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|tarauni|2023',
  'insert', 'ind_6b640d3deddb0e49',
  'Unique: Kano Tarauni seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6b640d3deddb0e49', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6b640d3deddb0e49', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6b640d3deddb0e49', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_tarauni',
  'ind_6b640d3deddb0e49', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6b640d3deddb0e49', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Tarauni', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6b640d3deddb0e49', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6b640d3deddb0e49',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6b640d3deddb0e49', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_6b640d3deddb0e49',
  'political_assignment', '{"constituency_inec": "TARAUNI", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6b640d3deddb0e49', 'prof_6b640d3deddb0e49',
  'Kabiru Sule Dahiru',
  'kabiru sule dahiru kano state assembly tarauni nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 36. Sule Lawal Shuwaki -- Tudun Wada (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c689ee8c4afeb646', 'Sule Lawal Shuwaki',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c689ee8c4afeb646', 'ind_c689ee8c4afeb646', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sule Lawal Shuwaki', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c689ee8c4afeb646', 'prof_c689ee8c4afeb646',
  'Member, Kano State House of Assembly (TUDUN WADA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c689ee8c4afeb646', 'ind_c689ee8c4afeb646', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c689ee8c4afeb646', 'ind_c689ee8c4afeb646', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c689ee8c4afeb646', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|tudun_wada|2023',
  'insert', 'ind_c689ee8c4afeb646',
  'Unique: Kano Tudun Wada seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c689ee8c4afeb646', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_c689ee8c4afeb646', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c689ee8c4afeb646', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_tudun_wada',
  'ind_c689ee8c4afeb646', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c689ee8c4afeb646', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Tudun Wada', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c689ee8c4afeb646', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_c689ee8c4afeb646',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c689ee8c4afeb646', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_c689ee8c4afeb646',
  'political_assignment', '{"constituency_inec": "TUDUN WADA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c689ee8c4afeb646', 'prof_c689ee8c4afeb646',
  'Sule Lawal Shuwaki',
  'sule lawal shuwaki kano state assembly tudun_wada apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 37. Aminu Sa'ad -- Ungoggo (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_92bd33965231ace8', 'Aminu Sa''ad',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_92bd33965231ace8', 'ind_92bd33965231ace8', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Aminu Sa''ad', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_92bd33965231ace8', 'prof_92bd33965231ace8',
  'Member, Kano State House of Assembly (UNGOGGO)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_92bd33965231ace8', 'ind_92bd33965231ace8', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_92bd33965231ace8', 'ind_92bd33965231ace8', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_92bd33965231ace8', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|ungoggo|2023',
  'insert', 'ind_92bd33965231ace8',
  'Unique: Kano Ungoggo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_92bd33965231ace8', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_92bd33965231ace8', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_92bd33965231ace8', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_ungoggo',
  'ind_92bd33965231ace8', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_92bd33965231ace8', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Ungoggo', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_92bd33965231ace8', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_92bd33965231ace8',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_92bd33965231ace8', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_92bd33965231ace8',
  'political_assignment', '{"constituency_inec": "UNGOGGO", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_92bd33965231ace8', 'prof_92bd33965231ace8',
  'Aminu Sa''ad',
  'aminu sa'ad kano state assembly ungoggo nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 38. Labaran Abdul Madari -- Warawa (APC) - Minority Leader
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9196acccfbfc8ab6', 'Labaran Abdul Madari',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9196acccfbfc8ab6', 'ind_9196acccfbfc8ab6', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Labaran Abdul Madari', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9196acccfbfc8ab6', 'prof_9196acccfbfc8ab6',
  'Member (Minority Leader), Kano State House of Assembly (WARAWA)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9196acccfbfc8ab6', 'ind_9196acccfbfc8ab6', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9196acccfbfc8ab6', 'ind_9196acccfbfc8ab6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9196acccfbfc8ab6', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|warawa|2023',
  'insert', 'ind_9196acccfbfc8ab6',
  'Unique: Kano Warawa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9196acccfbfc8ab6', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_9196acccfbfc8ab6', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9196acccfbfc8ab6', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_warawa',
  'ind_9196acccfbfc8ab6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9196acccfbfc8ab6', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Warawa', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9196acccfbfc8ab6', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_9196acccfbfc8ab6',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9196acccfbfc8ab6', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_9196acccfbfc8ab6',
  'political_assignment', '{"constituency_inec": "WARAWA", "party_abbrev": "APC", "position": "Minority Leader", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9196acccfbfc8ab6', 'prof_9196acccfbfc8ab6',
  'Labaran Abdul Madari',
  'labaran abdul madari kano state assembly warawa apc politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

-- 39. Abdullahi Ali Manager -- Wudil (NNPP)
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3a5d5570f46fde80', 'Abdullahi Ali Manager',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3a5d5570f46fde80', 'ind_3a5d5570f46fde80', 'individual', 'place_state_kano',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdullahi Ali Manager', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3a5d5570f46fde80', 'prof_3a5d5570f46fde80',
  'Member, Kano State House of Assembly (WUDIL)',
  'place_state_kano', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3a5d5570f46fde80', 'ind_3a5d5570f46fde80', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_kano', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3a5d5570f46fde80', 'ind_3a5d5570f46fde80', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3a5d5570f46fde80', 'seed_run_s05_political_kano_roster_20260502', 'individual',
  'ng_state_assembly_member|kano|wudil|2023',
  'insert', 'ind_3a5d5570f46fde80',
  'Unique: Kano Wudil seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3a5d5570f46fde80', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_3a5d5570f46fde80', 'seed_source_nigerianleaders_kano_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3a5d5570f46fde80', 'seed_run_s05_political_kano_roster_20260502', 'seed_source_nigerianleaders_kano_assembly_20260502',
  'nl_kano_assembly_2023_wudil',
  'ind_3a5d5570f46fde80', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3a5d5570f46fde80', 'seed_run_s05_political_kano_roster_20260502',
  'Kano Wudil', 'place_state_kano', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3a5d5570f46fde80', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_3a5d5570f46fde80',
  'seed_source_nigerianleaders_kano_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3a5d5570f46fde80', 'seed_run_s05_political_kano_roster_20260502', 'individual', 'ind_3a5d5570f46fde80',
  'political_assignment', '{"constituency_inec": "WUDIL", "party_abbrev": "NNPP", "position": "Member", "source_url": "https://nigerianleaders.com/kano-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3a5d5570f46fde80', 'prof_3a5d5570f46fde80',
  'Abdullahi Ali Manager',
  'abdullahi ali manager kano state assembly wudil nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano',
  'political',
  unixepoch(), unixepoch()
);

COMMIT;

-- 39 members inserted for Kano State House of Assembly
-- Migration 0467 complete
