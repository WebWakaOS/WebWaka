-- ============================================================
-- Migration 0470: Oyo State House of Assembly
-- 10th Assembly 2023-2027 — Full Roster Seed
-- Phase S05 — Political and Electoral Foundation
-- Generated: 2026-05-02
-- Source: NigerianLeaders + INEC cross-ref – Complete List of Oyo State House of Assembly Members
-- Members seeded: 32/32
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ── Seed metadata ────────────────────────────────────────────────

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_nigerianleaders_oyo_assembly_20260502',
  'NigerianLeaders + INEC cross-ref – Complete List of Oyo State House of Assembly Members',
  'editorial_aggregator',
  'https://nigerianleaders.com/oyo-state-house-of-assembly-members/',
  'editorial_verified',
  'Cross-referenced with official state assembly website and INEC 2023 election results.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_oyo_roster_20260502', 'S05 Batch 8d – Oyo State Assembly 2023-2027 Full Roster',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_oyo_roster_20260502',
  'seed_run_s05_political_oyo_roster_20260502', 'normalized_roster',
  'infra/db/migrations/0470_political_oyo_assembly_full_roster_seed.sql',
  NULL, 32,
  '32/32 members seeded; constituency place IDs resolved at state level pending full constituency seed');

-- Term already seeded in 0465 (INSERT OR IGNORE is safe)
INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_oyo_state_assembly_10th_2023_2027',
  'Oyo State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state', 'state_assembly_member',
  'place_state_oyo',
  '2023-06-13', '2027-06-12',
  unixepoch(), unixepoch()
);

-- ── Members (32 of 32 seats) ──────────────────────────────────────

-- 01. Adebo Edward Ogundoyin -- Ibarapa East (PDP) - Speaker
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_639f9af673974a53', 'Adebo Edward Ogundoyin',
  'Adebo', 'Ogundoyin', 'Adebo Edward Ogundoyin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_639f9af673974a53', 'ind_639f9af673974a53', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adebo Edward Ogundoyin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_639f9af673974a53', 'prof_639f9af673974a53',
  'Member (Speaker), Oyo State House of Assembly (IBARAPA EAST)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_639f9af673974a53', 'ind_639f9af673974a53', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_639f9af673974a53', 'ind_639f9af673974a53', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_639f9af673974a53', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibarapa_east|2023',
  'insert', 'ind_639f9af673974a53',
  'Unique: Oyo Ibarapa East seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_639f9af673974a53', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_639f9af673974a53', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_639f9af673974a53', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibarapa_east',
  'ind_639f9af673974a53', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_639f9af673974a53', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibarapa East', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_639f9af673974a53', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_639f9af673974a53',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_639f9af673974a53', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_639f9af673974a53',
  'political_assignment', '{"constituency_inec": "IBARAPA EAST", "party_abbrev": "PDP", "position": "Speaker", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_639f9af673974a53', 'prof_639f9af673974a53',
  'Adebo Edward Ogundoyin',
  'adebo edward ogundoyin oyo state assembly ibarapa_east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 02. Abiodun Aderemi Fadeyi -- Ona Ara (PDP) - Deputy Speaker
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d155690e9562e53b', 'Abiodun Aderemi Fadeyi',
  'Abiodun', 'Fadeyi', 'Abiodun Aderemi Fadeyi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d155690e9562e53b', 'ind_d155690e9562e53b', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abiodun Aderemi Fadeyi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d155690e9562e53b', 'prof_d155690e9562e53b',
  'Member (Deputy Speaker), Oyo State House of Assembly (ONA ARA)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d155690e9562e53b', 'ind_d155690e9562e53b', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d155690e9562e53b', 'ind_d155690e9562e53b', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d155690e9562e53b', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ona_ara|2023',
  'insert', 'ind_d155690e9562e53b',
  'Unique: Oyo Ona Ara seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d155690e9562e53b', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d155690e9562e53b', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d155690e9562e53b', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ona_ara',
  'ind_d155690e9562e53b', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d155690e9562e53b', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ona Ara', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d155690e9562e53b', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d155690e9562e53b',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d155690e9562e53b', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d155690e9562e53b',
  'political_assignment', '{"constituency_inec": "ONA ARA", "party_abbrev": "PDP", "position": "Deputy Speaker", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d155690e9562e53b', 'prof_d155690e9562e53b',
  'Abiodun Aderemi Fadeyi',
  'abiodun aderemi fadeyi oyo state assembly ona_ara pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 03. Adebayo Babajide Gabriel -- Ibadan North II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_35cffcdee7c582da', 'Adebayo Babajide Gabriel',
  'Adebayo', 'Gabriel', 'Adebayo Babajide Gabriel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_35cffcdee7c582da', 'ind_35cffcdee7c582da', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adebayo Babajide Gabriel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_35cffcdee7c582da', 'prof_35cffcdee7c582da',
  'Member, Oyo State House of Assembly (IBADAN NORTH II)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_35cffcdee7c582da', 'ind_35cffcdee7c582da', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_35cffcdee7c582da', 'ind_35cffcdee7c582da', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_35cffcdee7c582da', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_north_ii|2023',
  'insert', 'ind_35cffcdee7c582da',
  'Unique: Oyo Ibadan North II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_35cffcdee7c582da', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_35cffcdee7c582da', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_35cffcdee7c582da', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_north_ii',
  'ind_35cffcdee7c582da', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_35cffcdee7c582da', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan North II', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_35cffcdee7c582da', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_35cffcdee7c582da',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_35cffcdee7c582da', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_35cffcdee7c582da',
  'political_assignment', '{"constituency_inec": "IBADAN NORTH II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_35cffcdee7c582da', 'prof_35cffcdee7c582da',
  'Adebayo Babajide Gabriel',
  'adebayo babajide gabriel oyo state assembly ibadan_north_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 04. Akande Opeyemi Modiu -- Ibadan South East I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5e97ddefaa4eb3c2', 'Akande Opeyemi Modiu',
  'Akande', 'Modiu', 'Akande Opeyemi Modiu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5e97ddefaa4eb3c2', 'ind_5e97ddefaa4eb3c2', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akande Opeyemi Modiu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5e97ddefaa4eb3c2', 'prof_5e97ddefaa4eb3c2',
  'Member, Oyo State House of Assembly (IBADAN SOUTH EAST I)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5e97ddefaa4eb3c2', 'ind_5e97ddefaa4eb3c2', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5e97ddefaa4eb3c2', 'ind_5e97ddefaa4eb3c2', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5e97ddefaa4eb3c2', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_south_east_i|2023',
  'insert', 'ind_5e97ddefaa4eb3c2',
  'Unique: Oyo Ibadan South East I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5e97ddefaa4eb3c2', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_5e97ddefaa4eb3c2', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5e97ddefaa4eb3c2', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_south_east_i',
  'ind_5e97ddefaa4eb3c2', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5e97ddefaa4eb3c2', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan South East I', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5e97ddefaa4eb3c2', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_5e97ddefaa4eb3c2',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5e97ddefaa4eb3c2', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_5e97ddefaa4eb3c2',
  'political_assignment', '{"constituency_inec": "IBADAN SOUTH EAST I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5e97ddefaa4eb3c2', 'prof_5e97ddefaa4eb3c2',
  'Akande Opeyemi Modiu',
  'akande opeyemi modiu oyo state assembly ibadan_south_east_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 05. Ogunsola Anthony Oladejo -- Iwajowa (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7c1e550062ad6ee9', 'Ogunsola Anthony Oladejo',
  'Ogunsola', 'Oladejo', 'Ogunsola Anthony Oladejo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7c1e550062ad6ee9', 'ind_7c1e550062ad6ee9', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogunsola Anthony Oladejo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7c1e550062ad6ee9', 'prof_7c1e550062ad6ee9',
  'Member, Oyo State House of Assembly (IWAJOWA)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7c1e550062ad6ee9', 'ind_7c1e550062ad6ee9', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7c1e550062ad6ee9', 'ind_7c1e550062ad6ee9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7c1e550062ad6ee9', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|iwajowa|2023',
  'insert', 'ind_7c1e550062ad6ee9',
  'Unique: Oyo Iwajowa seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7c1e550062ad6ee9', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7c1e550062ad6ee9', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7c1e550062ad6ee9', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_iwajowa',
  'ind_7c1e550062ad6ee9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7c1e550062ad6ee9', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Iwajowa', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7c1e550062ad6ee9', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7c1e550062ad6ee9',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7c1e550062ad6ee9', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7c1e550062ad6ee9',
  'political_assignment', '{"constituency_inec": "IWAJOWA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7c1e550062ad6ee9', 'prof_7c1e550062ad6ee9',
  'Ogunsola Anthony Oladejo',
  'ogunsola anthony oladejo oyo state assembly iwajowa pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 06. Adeola Bamidele Oladimeji -- Iseyin And Itesiwaju (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_63b08695944bc3b4', 'Adeola Bamidele Oladimeji',
  'Adeola', 'Oladimeji', 'Adeola Bamidele Oladimeji',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_63b08695944bc3b4', 'ind_63b08695944bc3b4', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adeola Bamidele Oladimeji', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_63b08695944bc3b4', 'prof_63b08695944bc3b4',
  'Member, Oyo State House of Assembly (ISEYIN AND ITESIWAJU)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_63b08695944bc3b4', 'ind_63b08695944bc3b4', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_63b08695944bc3b4', 'ind_63b08695944bc3b4', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_63b08695944bc3b4', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|iseyin_and_itesiwaju|2023',
  'insert', 'ind_63b08695944bc3b4',
  'Unique: Oyo Iseyin And Itesiwaju seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_63b08695944bc3b4', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_63b08695944bc3b4', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_63b08695944bc3b4', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_iseyin_and_itesiwaju',
  'ind_63b08695944bc3b4', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_63b08695944bc3b4', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Iseyin And Itesiwaju', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_63b08695944bc3b4', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_63b08695944bc3b4',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_63b08695944bc3b4', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_63b08695944bc3b4',
  'political_assignment', '{"constituency_inec": "ISEYIN AND ITESIWAJU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_63b08695944bc3b4', 'prof_63b08695944bc3b4',
  'Adeola Bamidele Oladimeji',
  'adeola bamidele oladimeji oyo state assembly iseyin_and_itesiwaju pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 07. Bisi Oluranti Oyewo-Michael -- Ogbomoso North (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d1f3066297cf6224', 'Bisi Oluranti Oyewo-Michael',
  'Bisi', 'Oyewo-Michael', 'Bisi Oluranti Oyewo-Michael',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d1f3066297cf6224', 'ind_d1f3066297cf6224', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bisi Oluranti Oyewo-Michael', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d1f3066297cf6224', 'prof_d1f3066297cf6224',
  'Member, Oyo State House of Assembly (OGBOMOSO NORTH)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d1f3066297cf6224', 'ind_d1f3066297cf6224', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d1f3066297cf6224', 'ind_d1f3066297cf6224', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d1f3066297cf6224', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ogbomoso_north|2023',
  'insert', 'ind_d1f3066297cf6224',
  'Unique: Oyo Ogbomoso North seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d1f3066297cf6224', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d1f3066297cf6224', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d1f3066297cf6224', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ogbomoso_north',
  'ind_d1f3066297cf6224', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d1f3066297cf6224', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ogbomoso North', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d1f3066297cf6224', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d1f3066297cf6224',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d1f3066297cf6224', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d1f3066297cf6224',
  'political_assignment', '{"constituency_inec": "OGBOMOSO NORTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d1f3066297cf6224', 'prof_d1f3066297cf6224',
  'Bisi Oluranti Oyewo-Michael',
  'bisi oluranti oyewo-michael oyo state assembly ogbomoso_north pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 08. Onaolapo Sanjo Adedoyin -- Ogbomoso South (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8953dd5e04a367ea', 'Onaolapo Sanjo Adedoyin',
  'Onaolapo', 'Adedoyin', 'Onaolapo Sanjo Adedoyin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8953dd5e04a367ea', 'ind_8953dd5e04a367ea', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Onaolapo Sanjo Adedoyin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8953dd5e04a367ea', 'prof_8953dd5e04a367ea',
  'Member, Oyo State House of Assembly (OGBOMOSO SOUTH)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8953dd5e04a367ea', 'ind_8953dd5e04a367ea', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8953dd5e04a367ea', 'ind_8953dd5e04a367ea', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8953dd5e04a367ea', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ogbomoso_south|2023',
  'insert', 'ind_8953dd5e04a367ea',
  'Unique: Oyo Ogbomoso South seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8953dd5e04a367ea', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_8953dd5e04a367ea', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8953dd5e04a367ea', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ogbomoso_south',
  'ind_8953dd5e04a367ea', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8953dd5e04a367ea', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ogbomoso South', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8953dd5e04a367ea', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_8953dd5e04a367ea',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8953dd5e04a367ea', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_8953dd5e04a367ea',
  'political_assignment', '{"constituency_inec": "OGBOMOSO SOUTH", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8953dd5e04a367ea', 'prof_8953dd5e04a367ea',
  'Onaolapo Sanjo Adedoyin',
  'onaolapo sanjo adedoyin oyo state assembly ogbomoso_south pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 09. Olajide Akintunde Emmanuel -- Lagelu (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_ae60bb64045a7bde', 'Olajide Akintunde Emmanuel',
  'Olajide', 'Emmanuel', 'Olajide Akintunde Emmanuel',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_ae60bb64045a7bde', 'ind_ae60bb64045a7bde', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olajide Akintunde Emmanuel', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_ae60bb64045a7bde', 'prof_ae60bb64045a7bde',
  'Member, Oyo State House of Assembly (LAGELU)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_ae60bb64045a7bde', 'ind_ae60bb64045a7bde', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_ae60bb64045a7bde', 'ind_ae60bb64045a7bde', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_ae60bb64045a7bde', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|lagelu|2023',
  'insert', 'ind_ae60bb64045a7bde',
  'Unique: Oyo Lagelu seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_ae60bb64045a7bde', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_ae60bb64045a7bde', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_ae60bb64045a7bde', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_lagelu',
  'ind_ae60bb64045a7bde', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_ae60bb64045a7bde', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Lagelu', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_ae60bb64045a7bde', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_ae60bb64045a7bde',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_ae60bb64045a7bde', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_ae60bb64045a7bde',
  'political_assignment', '{"constituency_inec": "LAGELU", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_ae60bb64045a7bde', 'prof_ae60bb64045a7bde',
  'Olajide Akintunde Emmanuel',
  'olajide akintunde emmanuel oyo state assembly lagelu pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 10. Babalola Abiodun Oluwaseun -- Ibadan North East I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_aad363e00691a448', 'Babalola Abiodun Oluwaseun',
  'Babalola', 'Oluwaseun', 'Babalola Abiodun Oluwaseun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_aad363e00691a448', 'ind_aad363e00691a448', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Babalola Abiodun Oluwaseun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_aad363e00691a448', 'prof_aad363e00691a448',
  'Member, Oyo State House of Assembly (IBADAN NORTH EAST I)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_aad363e00691a448', 'ind_aad363e00691a448', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_aad363e00691a448', 'ind_aad363e00691a448', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_aad363e00691a448', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_north_east_i|2023',
  'insert', 'ind_aad363e00691a448',
  'Unique: Oyo Ibadan North East I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_aad363e00691a448', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_aad363e00691a448', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_aad363e00691a448', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_north_east_i',
  'ind_aad363e00691a448', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_aad363e00691a448', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan North East I', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_aad363e00691a448', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_aad363e00691a448',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_aad363e00691a448', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_aad363e00691a448',
  'political_assignment', '{"constituency_inec": "IBADAN NORTH EAST I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_aad363e00691a448', 'prof_aad363e00691a448',
  'Babalola Abiodun Oluwaseun',
  'babalola abiodun oluwaseun oyo state assembly ibadan_north_east_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 11. Owolabi Olusola Adewale -- Ibadan North East II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3ee228bcaa79b68d', 'Owolabi Olusola Adewale',
  'Owolabi', 'Adewale', 'Owolabi Olusola Adewale',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3ee228bcaa79b68d', 'ind_3ee228bcaa79b68d', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Owolabi Olusola Adewale', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3ee228bcaa79b68d', 'prof_3ee228bcaa79b68d',
  'Member, Oyo State House of Assembly (IBADAN NORTH EAST II)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3ee228bcaa79b68d', 'ind_3ee228bcaa79b68d', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3ee228bcaa79b68d', 'ind_3ee228bcaa79b68d', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3ee228bcaa79b68d', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_north_east_ii|2023',
  'insert', 'ind_3ee228bcaa79b68d',
  'Unique: Oyo Ibadan North East II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3ee228bcaa79b68d', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_3ee228bcaa79b68d', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3ee228bcaa79b68d', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_north_east_ii',
  'ind_3ee228bcaa79b68d', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3ee228bcaa79b68d', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan North East II', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3ee228bcaa79b68d', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_3ee228bcaa79b68d',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3ee228bcaa79b68d', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_3ee228bcaa79b68d',
  'political_assignment', '{"constituency_inec": "IBADAN NORTH EAST II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3ee228bcaa79b68d', 'prof_3ee228bcaa79b68d',
  'Owolabi Olusola Adewale',
  'owolabi olusola adewale oyo state assembly ibadan_north_east_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 12. Olasunkanmi Samson Babalola -- Egbeda (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7e0d46c18262e424', 'Olasunkanmi Samson Babalola',
  'Olasunkanmi', 'Babalola', 'Olasunkanmi Samson Babalola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7e0d46c18262e424', 'ind_7e0d46c18262e424', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olasunkanmi Samson Babalola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7e0d46c18262e424', 'prof_7e0d46c18262e424',
  'Member, Oyo State House of Assembly (EGBEDA)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7e0d46c18262e424', 'ind_7e0d46c18262e424', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7e0d46c18262e424', 'ind_7e0d46c18262e424', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7e0d46c18262e424', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|egbeda|2023',
  'insert', 'ind_7e0d46c18262e424',
  'Unique: Oyo Egbeda seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7e0d46c18262e424', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7e0d46c18262e424', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7e0d46c18262e424', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_egbeda',
  'ind_7e0d46c18262e424', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7e0d46c18262e424', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Egbeda', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7e0d46c18262e424', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7e0d46c18262e424',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7e0d46c18262e424', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7e0d46c18262e424',
  'political_assignment', '{"constituency_inec": "EGBEDA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7e0d46c18262e424', 'prof_7e0d46c18262e424',
  'Olasunkanmi Samson Babalola',
  'olasunkanmi samson babalola oyo state assembly egbeda pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 13. Peter Gbadegesin Ojedokun -- Ibarapa North And Central (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_eecb70acd7612ac7', 'Peter Gbadegesin Ojedokun',
  'Peter', 'Ojedokun', 'Peter Gbadegesin Ojedokun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_eecb70acd7612ac7', 'ind_eecb70acd7612ac7', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Peter Gbadegesin Ojedokun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_eecb70acd7612ac7', 'prof_eecb70acd7612ac7',
  'Member, Oyo State House of Assembly (IBARAPA NORTH AND CENTRAL)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_eecb70acd7612ac7', 'ind_eecb70acd7612ac7', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_eecb70acd7612ac7', 'ind_eecb70acd7612ac7', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_eecb70acd7612ac7', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibarapa_north_and_central|2023',
  'insert', 'ind_eecb70acd7612ac7',
  'Unique: Oyo Ibarapa North And Central seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_eecb70acd7612ac7', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_eecb70acd7612ac7', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_eecb70acd7612ac7', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibarapa_north_and_central',
  'ind_eecb70acd7612ac7', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_eecb70acd7612ac7', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibarapa North And Central', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_eecb70acd7612ac7', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_eecb70acd7612ac7',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_eecb70acd7612ac7', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_eecb70acd7612ac7',
  'political_assignment', '{"constituency_inec": "IBARAPA NORTH AND CENTRAL", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_eecb70acd7612ac7', 'prof_eecb70acd7612ac7',
  'Peter Gbadegesin Ojedokun',
  'peter gbadegesin ojedokun oyo state assembly ibarapa_north_and_central pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 14. Saminu Riliwan Gbadamosi -- Saki East And Atisbo (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_a7a102e9f5e91140', 'Saminu Riliwan Gbadamosi',
  'Saminu', 'Gbadamosi', 'Saminu Riliwan Gbadamosi',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_a7a102e9f5e91140', 'ind_a7a102e9f5e91140', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Saminu Riliwan Gbadamosi', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_a7a102e9f5e91140', 'prof_a7a102e9f5e91140',
  'Member, Oyo State House of Assembly (SAKI EAST AND ATISBO)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_a7a102e9f5e91140', 'ind_a7a102e9f5e91140', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_a7a102e9f5e91140', 'ind_a7a102e9f5e91140', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_a7a102e9f5e91140', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|saki_east_and_atisbo|2023',
  'insert', 'ind_a7a102e9f5e91140',
  'Unique: Oyo Saki East And Atisbo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_a7a102e9f5e91140', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_a7a102e9f5e91140', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_a7a102e9f5e91140', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_saki_east_and_atisbo',
  'ind_a7a102e9f5e91140', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_a7a102e9f5e91140', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Saki East And Atisbo', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_a7a102e9f5e91140', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_a7a102e9f5e91140',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_a7a102e9f5e91140', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_a7a102e9f5e91140',
  'political_assignment', '{"constituency_inec": "SAKI EAST AND ATISBO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_a7a102e9f5e91140', 'prof_a7a102e9f5e91140',
  'Saminu Riliwan Gbadamosi',
  'saminu riliwan gbadamosi oyo state assembly saki_east_and_atisbo pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 15. Kehinde Olatunde Taofik -- Akinyele II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_28fd28d9e74f4b69', 'Kehinde Olatunde Taofik',
  'Kehinde', 'Taofik', 'Kehinde Olatunde Taofik',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_28fd28d9e74f4b69', 'ind_28fd28d9e74f4b69', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Kehinde Olatunde Taofik', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_28fd28d9e74f4b69', 'prof_28fd28d9e74f4b69',
  'Member, Oyo State House of Assembly (AKINYELE II)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_28fd28d9e74f4b69', 'ind_28fd28d9e74f4b69', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_28fd28d9e74f4b69', 'ind_28fd28d9e74f4b69', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_28fd28d9e74f4b69', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|akinyele_ii|2023',
  'insert', 'ind_28fd28d9e74f4b69',
  'Unique: Oyo Akinyele II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_28fd28d9e74f4b69', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_28fd28d9e74f4b69', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_28fd28d9e74f4b69', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_akinyele_ii',
  'ind_28fd28d9e74f4b69', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_28fd28d9e74f4b69', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Akinyele II', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_28fd28d9e74f4b69', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_28fd28d9e74f4b69',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_28fd28d9e74f4b69', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_28fd28d9e74f4b69',
  'political_assignment', '{"constituency_inec": "AKINYELE II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_28fd28d9e74f4b69', 'prof_28fd28d9e74f4b69',
  'Kehinde Olatunde Taofik',
  'kehinde olatunde taofik oyo state assembly akinyele_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 16. Fatokun Ayotunde -- Akinyele I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_2018ec3423da9df3', 'Fatokun Ayotunde',
  'Fatokun', 'Ayotunde', 'Fatokun Ayotunde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_2018ec3423da9df3', 'ind_2018ec3423da9df3', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Fatokun Ayotunde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_2018ec3423da9df3', 'prof_2018ec3423da9df3',
  'Member, Oyo State House of Assembly (AKINYELE I)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_2018ec3423da9df3', 'ind_2018ec3423da9df3', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_2018ec3423da9df3', 'ind_2018ec3423da9df3', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_2018ec3423da9df3', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|akinyele_i|2023',
  'insert', 'ind_2018ec3423da9df3',
  'Unique: Oyo Akinyele I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_2018ec3423da9df3', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_2018ec3423da9df3', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_2018ec3423da9df3', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_akinyele_i',
  'ind_2018ec3423da9df3', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_2018ec3423da9df3', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Akinyele I', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_2018ec3423da9df3', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_2018ec3423da9df3',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_2018ec3423da9df3', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_2018ec3423da9df3',
  'political_assignment', '{"constituency_inec": "AKINYELE I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_2018ec3423da9df3', 'prof_2018ec3423da9df3',
  'Fatokun Ayotunde',
  'fatokun ayotunde oyo state assembly akinyele_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 17. Mabaje Razaq Adekunle -- Ido (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6f5ca1d669f7a82a', 'Mabaje Razaq Adekunle',
  'Mabaje', 'Adekunle', 'Mabaje Razaq Adekunle',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6f5ca1d669f7a82a', 'ind_6f5ca1d669f7a82a', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mabaje Razaq Adekunle', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6f5ca1d669f7a82a', 'prof_6f5ca1d669f7a82a',
  'Member, Oyo State House of Assembly (IDO)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6f5ca1d669f7a82a', 'ind_6f5ca1d669f7a82a', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6f5ca1d669f7a82a', 'ind_6f5ca1d669f7a82a', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6f5ca1d669f7a82a', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ido|2023',
  'insert', 'ind_6f5ca1d669f7a82a',
  'Unique: Oyo Ido seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6f5ca1d669f7a82a', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_6f5ca1d669f7a82a', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6f5ca1d669f7a82a', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ido',
  'ind_6f5ca1d669f7a82a', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6f5ca1d669f7a82a', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ido', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6f5ca1d669f7a82a', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_6f5ca1d669f7a82a',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6f5ca1d669f7a82a', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_6f5ca1d669f7a82a',
  'political_assignment', '{"constituency_inec": "IDO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6f5ca1d669f7a82a', 'prof_6f5ca1d669f7a82a',
  'Mabaje Razaq Adekunle',
  'mabaje razaq adekunle oyo state assembly ido pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 18. Oluwafowokanmi Oluwafemi Adebayo -- Ibadan South West I (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_9077158a69da4b83', 'Oluwafowokanmi Oluwafemi Adebayo',
  'Oluwafowokanmi', 'Adebayo', 'Oluwafowokanmi Oluwafemi Adebayo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_9077158a69da4b83', 'ind_9077158a69da4b83', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oluwafowokanmi Oluwafemi Adebayo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_9077158a69da4b83', 'prof_9077158a69da4b83',
  'Member, Oyo State House of Assembly (IBADAN SOUTH WEST I)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_9077158a69da4b83', 'ind_9077158a69da4b83', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_9077158a69da4b83', 'ind_9077158a69da4b83', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_9077158a69da4b83', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_south_west_i|2023',
  'insert', 'ind_9077158a69da4b83',
  'Unique: Oyo Ibadan South West I seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_9077158a69da4b83', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_9077158a69da4b83', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_9077158a69da4b83', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_south_west_i',
  'ind_9077158a69da4b83', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_9077158a69da4b83', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan South West I', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_9077158a69da4b83', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_9077158a69da4b83',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_9077158a69da4b83', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_9077158a69da4b83',
  'political_assignment', '{"constituency_inec": "IBADAN SOUTH WEST I", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_9077158a69da4b83', 'prof_9077158a69da4b83',
  'Oluwafowokanmi Oluwafemi Adebayo',
  'oluwafowokanmi oluwafemi adebayo oyo state assembly ibadan_south_west_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 19. Adebisi Yusuf Oladeni -- Ibadan South West II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c6db59be826c0851', 'Adebisi Yusuf Oladeni',
  'Adebisi', 'Oladeni', 'Adebisi Yusuf Oladeni',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c6db59be826c0851', 'ind_c6db59be826c0851', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adebisi Yusuf Oladeni', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c6db59be826c0851', 'prof_c6db59be826c0851',
  'Member, Oyo State House of Assembly (IBADAN SOUTH WEST II)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c6db59be826c0851', 'ind_c6db59be826c0851', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c6db59be826c0851', 'ind_c6db59be826c0851', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c6db59be826c0851', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_south_west_ii|2023',
  'insert', 'ind_c6db59be826c0851',
  'Unique: Oyo Ibadan South West II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c6db59be826c0851', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_c6db59be826c0851', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c6db59be826c0851', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_south_west_ii',
  'ind_c6db59be826c0851', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c6db59be826c0851', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan South West II', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c6db59be826c0851', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_c6db59be826c0851',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c6db59be826c0851', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_c6db59be826c0851',
  'political_assignment', '{"constituency_inec": "IBADAN SOUTH WEST II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c6db59be826c0851', 'prof_c6db59be826c0851',
  'Adebisi Yusuf Oladeni',
  'adebisi yusuf oladeni oyo state assembly ibadan_south_west_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 20. Waheed Akintayo -- Oluyole (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e7635b1d59d118fa', 'Waheed Akintayo',
  'Waheed', 'Akintayo', 'Waheed Akintayo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e7635b1d59d118fa', 'ind_e7635b1d59d118fa', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Waheed Akintayo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e7635b1d59d118fa', 'prof_e7635b1d59d118fa',
  'Member, Oyo State House of Assembly (OLUYOLE)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e7635b1d59d118fa', 'ind_e7635b1d59d118fa', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e7635b1d59d118fa', 'ind_e7635b1d59d118fa', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e7635b1d59d118fa', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|oluyole|2023',
  'insert', 'ind_e7635b1d59d118fa',
  'Unique: Oyo Oluyole seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e7635b1d59d118fa', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_e7635b1d59d118fa', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e7635b1d59d118fa', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_oluyole',
  'ind_e7635b1d59d118fa', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e7635b1d59d118fa', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Oluyole', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e7635b1d59d118fa', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_e7635b1d59d118fa',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e7635b1d59d118fa', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_e7635b1d59d118fa',
  'political_assignment', '{"constituency_inec": "OLUYOLE", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e7635b1d59d118fa', 'prof_e7635b1d59d118fa',
  'Waheed Akintayo',
  'waheed akintayo oyo state assembly oluyole pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 21. Oladeji Oparinde -- Afijio (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_8c1673203d511810', 'Oladeji Oparinde',
  'Oladeji', 'Oparinde', 'Oladeji Oparinde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_8c1673203d511810', 'ind_8c1673203d511810', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oladeji Oparinde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_8c1673203d511810', 'prof_8c1673203d511810',
  'Member, Oyo State House of Assembly (AFIJIO)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_8c1673203d511810', 'ind_8c1673203d511810', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_8c1673203d511810', 'ind_8c1673203d511810', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_8c1673203d511810', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|afijio|2023',
  'insert', 'ind_8c1673203d511810',
  'Unique: Oyo Afijio seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_8c1673203d511810', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_8c1673203d511810', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_8c1673203d511810', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_afijio',
  'ind_8c1673203d511810', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_8c1673203d511810', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Afijio', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_8c1673203d511810', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_8c1673203d511810',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_8c1673203d511810', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_8c1673203d511810',
  'political_assignment', '{"constituency_inec": "AFIJIO", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_8c1673203d511810', 'prof_8c1673203d511810',
  'Oladeji Oparinde',
  'oladeji oparinde oyo state assembly afijio pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 22. Olorunpoto Rahman -- Oyo East And Oyo West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_c0b8966e89a4a227', 'Olorunpoto Rahman',
  'Olorunpoto', 'Rahman', 'Olorunpoto Rahman',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_c0b8966e89a4a227', 'ind_c0b8966e89a4a227', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Olorunpoto Rahman', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_c0b8966e89a4a227', 'prof_c0b8966e89a4a227',
  'Member, Oyo State House of Assembly (OYO EAST AND OYO WEST)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_c0b8966e89a4a227', 'ind_c0b8966e89a4a227', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_c0b8966e89a4a227', 'ind_c0b8966e89a4a227', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_c0b8966e89a4a227', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|oyo_east_and_oyo_west|2023',
  'insert', 'ind_c0b8966e89a4a227',
  'Unique: Oyo Oyo East And Oyo West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_c0b8966e89a4a227', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_c0b8966e89a4a227', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_c0b8966e89a4a227', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_oyo_east_and_oyo_west',
  'ind_c0b8966e89a4a227', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_c0b8966e89a4a227', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Oyo East And Oyo West', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_c0b8966e89a4a227', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_c0b8966e89a4a227',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_c0b8966e89a4a227', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_c0b8966e89a4a227',
  'political_assignment', '{"constituency_inec": "OYO EAST AND OYO WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_c0b8966e89a4a227', 'prof_c0b8966e89a4a227',
  'Olorunpoto Rahman',
  'olorunpoto rahman oyo state assembly oyo_east_and_oyo_west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 23. Inaolaji Nurudeen Oladayo -- Ibadan North II Alt (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0e4fc3fb109146c9', 'Inaolaji Nurudeen Oladayo',
  'Inaolaji', 'Oladayo', 'Inaolaji Nurudeen Oladayo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0e4fc3fb109146c9', 'ind_0e4fc3fb109146c9', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Inaolaji Nurudeen Oladayo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0e4fc3fb109146c9', 'prof_0e4fc3fb109146c9',
  'Member, Oyo State House of Assembly (IBADAN NORTH II ALT)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0e4fc3fb109146c9', 'ind_0e4fc3fb109146c9', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0e4fc3fb109146c9', 'ind_0e4fc3fb109146c9', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0e4fc3fb109146c9', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_north_ii_alt|2023',
  'insert', 'ind_0e4fc3fb109146c9',
  'Unique: Oyo Ibadan North II Alt seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0e4fc3fb109146c9', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_0e4fc3fb109146c9', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0e4fc3fb109146c9', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_north_ii_alt',
  'ind_0e4fc3fb109146c9', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0e4fc3fb109146c9', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan North II Alt', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0e4fc3fb109146c9', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_0e4fc3fb109146c9',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0e4fc3fb109146c9', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_0e4fc3fb109146c9',
  'political_assignment', '{"constituency_inec": "IBADAN NORTH II ALT", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0e4fc3fb109146c9', 'prof_0e4fc3fb109146c9',
  'Inaolaji Nurudeen Oladayo',
  'inaolaji nurudeen oladayo oyo state assembly ibadan_north_ii_alt pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 24. Folorunso Tolulope Hammed -- Ibadan South East II (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_939f9b90078b9689', 'Folorunso Tolulope Hammed',
  'Folorunso', 'Hammed', 'Folorunso Tolulope Hammed',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_939f9b90078b9689', 'ind_939f9b90078b9689', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Folorunso Tolulope Hammed', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_939f9b90078b9689', 'prof_939f9b90078b9689',
  'Member, Oyo State House of Assembly (IBADAN SOUTH EAST II)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_939f9b90078b9689', 'ind_939f9b90078b9689', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_939f9b90078b9689', 'ind_939f9b90078b9689', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_939f9b90078b9689', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_south_east_ii|2023',
  'insert', 'ind_939f9b90078b9689',
  'Unique: Oyo Ibadan South East II seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_939f9b90078b9689', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_939f9b90078b9689', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_939f9b90078b9689', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_south_east_ii',
  'ind_939f9b90078b9689', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_939f9b90078b9689', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan South East II', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_939f9b90078b9689', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_939f9b90078b9689',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_939f9b90078b9689', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_939f9b90078b9689',
  'political_assignment', '{"constituency_inec": "IBADAN SOUTH EAST II", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_939f9b90078b9689', 'prof_939f9b90078b9689',
  'Folorunso Tolulope Hammed',
  'folorunso tolulope hammed oyo state assembly ibadan_south_east_ii pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 25. Abideen Adeoye -- Ogo-Oluwa And Surulere (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7ed217a50b1f96bb', 'Abideen Adeoye',
  'Abideen', 'Adeoye', 'Abideen Adeoye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7ed217a50b1f96bb', 'ind_7ed217a50b1f96bb', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abideen Adeoye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7ed217a50b1f96bb', 'prof_7ed217a50b1f96bb',
  'Member, Oyo State House of Assembly (OGO-OLUWA AND SURULERE)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7ed217a50b1f96bb', 'ind_7ed217a50b1f96bb', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7ed217a50b1f96bb', 'ind_7ed217a50b1f96bb', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7ed217a50b1f96bb', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ogo_oluwa_and_surulere|2023',
  'insert', 'ind_7ed217a50b1f96bb',
  'Unique: Oyo Ogo-Oluwa And Surulere seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7ed217a50b1f96bb', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7ed217a50b1f96bb', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7ed217a50b1f96bb', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ogo_oluwa_and_surulere',
  'ind_7ed217a50b1f96bb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7ed217a50b1f96bb', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ogo-Oluwa And Surulere', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7ed217a50b1f96bb', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7ed217a50b1f96bb',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7ed217a50b1f96bb', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_7ed217a50b1f96bb',
  'political_assignment', '{"constituency_inec": "OGO-OLUWA AND SURULERE", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7ed217a50b1f96bb', 'prof_7ed217a50b1f96bb',
  'Abideen Adeoye',
  'abideen adeoye oyo state assembly ogo_oluwa_and_surulere pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 26. Gbenga Oyekola -- Atiba (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d87e4f2c3eacf2cb', 'Gbenga Oyekola',
  'Gbenga', 'Oyekola', 'Gbenga Oyekola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d87e4f2c3eacf2cb', 'ind_d87e4f2c3eacf2cb', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gbenga Oyekola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d87e4f2c3eacf2cb', 'prof_d87e4f2c3eacf2cb',
  'Member, Oyo State House of Assembly (ATIBA)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d87e4f2c3eacf2cb', 'ind_d87e4f2c3eacf2cb', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d87e4f2c3eacf2cb', 'ind_d87e4f2c3eacf2cb', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d87e4f2c3eacf2cb', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|atiba|2023',
  'insert', 'ind_d87e4f2c3eacf2cb',
  'Unique: Oyo Atiba seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d87e4f2c3eacf2cb', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d87e4f2c3eacf2cb', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d87e4f2c3eacf2cb', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_atiba',
  'ind_d87e4f2c3eacf2cb', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d87e4f2c3eacf2cb', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Atiba', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d87e4f2c3eacf2cb', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d87e4f2c3eacf2cb',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d87e4f2c3eacf2cb', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_d87e4f2c3eacf2cb',
  'political_assignment', '{"constituency_inec": "ATIBA", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d87e4f2c3eacf2cb', 'prof_d87e4f2c3eacf2cb',
  'Gbenga Oyekola',
  'gbenga oyekola oyo state assembly atiba pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 27. Bamigboye Jacob Abidoye -- Oriire (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_1f98a1a079db4e4f', 'Bamigboye Jacob Abidoye',
  'Bamigboye', 'Abidoye', 'Bamigboye Jacob Abidoye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_1f98a1a079db4e4f', 'ind_1f98a1a079db4e4f', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bamigboye Jacob Abidoye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_1f98a1a079db4e4f', 'prof_1f98a1a079db4e4f',
  'Member, Oyo State House of Assembly (ORIIRE)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_1f98a1a079db4e4f', 'ind_1f98a1a079db4e4f', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_1f98a1a079db4e4f', 'ind_1f98a1a079db4e4f', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_1f98a1a079db4e4f', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|oriire|2023',
  'insert', 'ind_1f98a1a079db4e4f',
  'Unique: Oyo Oriire seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_1f98a1a079db4e4f', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_1f98a1a079db4e4f', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_1f98a1a079db4e4f', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_oriire',
  'ind_1f98a1a079db4e4f', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_1f98a1a079db4e4f', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Oriire', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_1f98a1a079db4e4f', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_1f98a1a079db4e4f',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_1f98a1a079db4e4f', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_1f98a1a079db4e4f',
  'political_assignment', '{"constituency_inec": "ORIIRE", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_1f98a1a079db4e4f', 'prof_1f98a1a079db4e4f',
  'Bamigboye Jacob Abidoye',
  'bamigboye jacob abidoye oyo state assembly oriire pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 28. Akeem Obadara -- Ibadan North West (PDP)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_34dd3dde800ad02e', 'Akeem Obadara',
  'Akeem', 'Obadara', 'Akeem Obadara',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_34dd3dde800ad02e', 'ind_34dd3dde800ad02e', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Akeem Obadara', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_34dd3dde800ad02e', 'prof_34dd3dde800ad02e',
  'Member, Oyo State House of Assembly (IBADAN NORTH WEST)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_34dd3dde800ad02e', 'ind_34dd3dde800ad02e', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_34dd3dde800ad02e', 'ind_34dd3dde800ad02e', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_34dd3dde800ad02e', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibadan_north_west|2023',
  'insert', 'ind_34dd3dde800ad02e',
  'Unique: Oyo Ibadan North West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_34dd3dde800ad02e', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_34dd3dde800ad02e', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_34dd3dde800ad02e', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_ibadan_north_west',
  'ind_34dd3dde800ad02e', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_34dd3dde800ad02e', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Ibadan North West', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_34dd3dde800ad02e', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_34dd3dde800ad02e',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_34dd3dde800ad02e', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_34dd3dde800ad02e',
  'political_assignment', '{"constituency_inec": "IBADAN NORTH WEST", "party_abbrev": "PDP", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_34dd3dde800ad02e', 'prof_34dd3dde800ad02e',
  'Akeem Obadara',
  'akeem obadara oyo state assembly ibadan_north_west pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 29. Ibraheem Shittu -- Saki West (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b62b05f72c549ee6', 'Ibraheem Shittu',
  'Ibraheem', 'Shittu', 'Ibraheem Shittu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b62b05f72c549ee6', 'ind_b62b05f72c549ee6', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ibraheem Shittu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b62b05f72c549ee6', 'prof_b62b05f72c549ee6',
  'Member, Oyo State House of Assembly (SAKI WEST)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b62b05f72c549ee6', 'ind_b62b05f72c549ee6', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b62b05f72c549ee6', 'ind_b62b05f72c549ee6', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b62b05f72c549ee6', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|saki_west|2023',
  'insert', 'ind_b62b05f72c549ee6',
  'Unique: Oyo Saki West seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b62b05f72c549ee6', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b62b05f72c549ee6', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b62b05f72c549ee6', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_saki_west',
  'ind_b62b05f72c549ee6', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b62b05f72c549ee6', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Saki West', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b62b05f72c549ee6', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b62b05f72c549ee6',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b62b05f72c549ee6', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b62b05f72c549ee6',
  'political_assignment', '{"constituency_inec": "SAKI WEST", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b62b05f72c549ee6', 'prof_b62b05f72c549ee6',
  'Ibraheem Shittu',
  'ibraheem shittu oyo state assembly saki_west apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 30. Abdulazeez Musbau -- Kajola (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b6e837c85d0679ca', 'Abdulazeez Musbau',
  'Abdulazeez', 'Musbau', 'Abdulazeez Musbau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b6e837c85d0679ca', 'ind_b6e837c85d0679ca', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdulazeez Musbau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b6e837c85d0679ca', 'prof_b6e837c85d0679ca',
  'Member, Oyo State House of Assembly (KAJOLA)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b6e837c85d0679ca', 'ind_b6e837c85d0679ca', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b6e837c85d0679ca', 'ind_b6e837c85d0679ca', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b6e837c85d0679ca', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|kajola|2023',
  'insert', 'ind_b6e837c85d0679ca',
  'Unique: Oyo Kajola seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b6e837c85d0679ca', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b6e837c85d0679ca', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b6e837c85d0679ca', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_kajola',
  'ind_b6e837c85d0679ca', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b6e837c85d0679ca', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Kajola', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b6e837c85d0679ca', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b6e837c85d0679ca',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b6e837c85d0679ca', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b6e837c85d0679ca',
  'political_assignment', '{"constituency_inec": "KAJOLA", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b6e837c85d0679ca', 'prof_b6e837c85d0679ca',
  'Abdulazeez Musbau',
  'abdulazeez musbau oyo state assembly kajola apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 31. Jimoh Lukman -- Oorelope (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_42b9e9bdd73f48b5', 'Jimoh Lukman',
  'Jimoh', 'Lukman', 'Jimoh Lukman',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_42b9e9bdd73f48b5', 'ind_42b9e9bdd73f48b5', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jimoh Lukman', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_42b9e9bdd73f48b5', 'prof_42b9e9bdd73f48b5',
  'Member, Oyo State House of Assembly (OORELOPE)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_42b9e9bdd73f48b5', 'ind_42b9e9bdd73f48b5', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_42b9e9bdd73f48b5', 'ind_42b9e9bdd73f48b5', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_42b9e9bdd73f48b5', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|oorelope|2023',
  'insert', 'ind_42b9e9bdd73f48b5',
  'Unique: Oyo Oorelope seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_42b9e9bdd73f48b5', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_42b9e9bdd73f48b5', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_42b9e9bdd73f48b5', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_oorelope',
  'ind_42b9e9bdd73f48b5', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_42b9e9bdd73f48b5', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Oorelope', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_42b9e9bdd73f48b5', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_42b9e9bdd73f48b5',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_42b9e9bdd73f48b5', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_42b9e9bdd73f48b5',
  'political_assignment', '{"constituency_inec": "OORELOPE", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_42b9e9bdd73f48b5', 'prof_42b9e9bdd73f48b5',
  'Jimoh Lukman',
  'jimoh lukman oyo state assembly oorelope apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 32. Ayinde Waliu -- Irepo And Olorunsogo (APC)
INSERT OR IGNORE INTO individuals
  (id, full_name, first_name, last_name, display_name,
   tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b54f05ad15fea012', 'Ayinde Waliu',
  'Ayinde', 'Waliu', 'Ayinde Waliu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified',
  unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b54f05ad15fea012', 'ind_b54f05ad15fea012', 'individual', 'place_state_oyo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ayinde Waliu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b54f05ad15fea012', 'prof_b54f05ad15fea012',
  'Member, Oyo State House of Assembly (IREPO AND OLORUNSOGO)',
  'place_state_oyo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b54f05ad15fea012', 'ind_b54f05ad15fea012', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_oyo', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b54f05ad15fea012', 'ind_b54f05ad15fea012', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b54f05ad15fea012', 'seed_run_s05_political_oyo_roster_20260502', 'individual',
  'ng_state_assembly_member|oyo|irepo_and_olorunsogo|2023',
  'insert', 'ind_b54f05ad15fea012',
  'Unique: Oyo Irepo And Olorunsogo seat 2023-2027'
);
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b54f05ad15fea012', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b54f05ad15fea012', 'seed_source_nigerianleaders_oyo_assembly_20260502', 'ingested'
);
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b54f05ad15fea012', 'seed_run_s05_political_oyo_roster_20260502', 'seed_source_nigerianleaders_oyo_assembly_20260502',
  'nl_oyo_assembly_2023_irepo_and_olorunsogo',
  'ind_b54f05ad15fea012', 'individual'
);
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b54f05ad15fea012', 'seed_run_s05_political_oyo_roster_20260502',
  'Oyo Irepo And Olorunsogo', 'place_state_oyo', 'state_fallback', 0.8
);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b54f05ad15fea012', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b54f05ad15fea012',
  'seed_source_nigerianleaders_oyo_assembly_20260502', 'editorial_verified'
);
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b54f05ad15fea012', 'seed_run_s05_political_oyo_roster_20260502', 'individual', 'ind_b54f05ad15fea012',
  'political_assignment', '{"constituency_inec": "IREPO AND OLORUNSOGO", "party_abbrev": "APC", "position": "Member", "source_url": "https://nigerianleaders.com/oyo-state-house-of-assembly-members/"}'
);
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b54f05ad15fea012', 'prof_b54f05ad15fea012',
  'Ayinde Waliu',
  'ayinde waliu oyo state assembly irepo_and_olorunsogo apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo',
  'political',
  unixepoch(), unixepoch()
);

-- 32 members inserted for Oyo State House of Assembly
-- Migration 0470 complete
