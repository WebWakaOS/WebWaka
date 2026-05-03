-- ============================================================
-- Migration 0466: Lagos LGA Chairpersons — 2021 Elections (20 LGAs)
-- Phase S05 — Political and Electoral Foundation, Batch 8
-- Generated: 2026-05-02
-- Source: LASIEC (Lagos State Independent Electoral Commission) 2021 LGA elections
-- Lagos: 20 LGAs — APC won all 20 seats; term: July 2021 – July 2024
-- Note: Kano (44 LGAs) and Rivers (23 LGAs) chairpersons require editorial
--       extraction from official sources; logged as DEBT-012 remainder.
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


BEGIN TRANSACTION;

-- ── LGA election cycle (Lagos 2021) ──────────────────────────────────────────
INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'LASIEC Lagos LGA elections 2021 — official results',
  'official_government',
  'https://lasiec.org',
  'editorial_verified',
  'Lagos State Independent Electoral Commission official 2021 LGA election results. APC won all 20 LGAs.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_lagos_lga_chairs_20260502', 'S05 Batch 8 – Lagos LGA Chairpersons 2021-2024',
  'S05', 'completed', unixepoch(), unixepoch());

-- LGA chairpersons term: Lagos 2021-2024
INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_lagos_lga_chairs_2021_2024',
  'Lagos LGA Chairpersons (2021-2024)',
  'cycle_ng_lga_lagos_2021',
  'local_government',
  'lga_chairman',
  'place_state_lagos',
  '2021-07-24',
  '2024-07-23',
  unixepoch(), unixepoch()
);

-- ── Lagos LGA Chairpersons (20/20) ────────────────────────────────────────────

-- LGA Chairman: Gafar Usman Akangbe – Lagos Agege
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_74416677f425a38d', 'Gafar Usman Akangbe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_74416677f425a38d', 'ind_74416677f425a38d', 'individual', 'place_lga_lagos_agege',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Gafar Usman Akangbe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_74416677f425a38d', 'prof_74416677f425a38d',
  'Chairman, Lagos Agege Local Government Area',
  'place_lga_lagos_agege', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_74416677f425a38d', 'ind_74416677f425a38d', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_agege', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_74416677f425a38d', 'ind_74416677f425a38d', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_74416677f425a38d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|agege|2021',
  'insert', 'ind_74416677f425a38d',
  'Unique: Lagos Agege LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_74416677f425a38d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_74416677f425a38d', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_74416677f425a38d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_agege',
  'ind_74416677f425a38d', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_74416677f425a38d', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Agege LGA', 'place_lga_lagos_agege', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_74416677f425a38d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_74416677f425a38d',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_74416677f425a38d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_74416677f425a38d',
  'political_assignment', '{"lga_slug": "agege", "lga_place_id": "place_lga_lagos_agege", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_74416677f425a38d', 'prof_74416677f425a38d',
  'Gafar Usman Akangbe',
  'gafar usman akangbe lagos agege lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_agege',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Fatai Adekunle Ayoola – Lagos Ajeromi Ifelodun
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_28aebff1b5ac0b4d', 'Fatai Adekunle Ayoola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_28aebff1b5ac0b4d', 'ind_28aebff1b5ac0b4d', 'individual', 'place_lga_lagos_ajeromi_ifelodun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Fatai Adekunle Ayoola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_28aebff1b5ac0b4d', 'prof_28aebff1b5ac0b4d',
  'Chairman, Lagos Ajeromi Ifelodun Local Government Area',
  'place_lga_lagos_ajeromi_ifelodun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_28aebff1b5ac0b4d', 'ind_28aebff1b5ac0b4d', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_ajeromi_ifelodun', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_28aebff1b5ac0b4d', 'ind_28aebff1b5ac0b4d', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_28aebff1b5ac0b4d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|ajeromi_ifelodun|2021',
  'insert', 'ind_28aebff1b5ac0b4d',
  'Unique: Lagos Ajeromi Ifelodun LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_28aebff1b5ac0b4d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_28aebff1b5ac0b4d', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_28aebff1b5ac0b4d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_ajeromi_ifelodun',
  'ind_28aebff1b5ac0b4d', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_28aebff1b5ac0b4d', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Ajeromi Ifelodun LGA', 'place_lga_lagos_ajeromi_ifelodun', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_28aebff1b5ac0b4d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_28aebff1b5ac0b4d',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_28aebff1b5ac0b4d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_28aebff1b5ac0b4d',
  'political_assignment', '{"lga_slug": "ajeromi_ifelodun", "lga_place_id": "place_lga_lagos_ajeromi_ifelodun", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_28aebff1b5ac0b4d', 'prof_28aebff1b5ac0b4d',
  'Fatai Adekunle Ayoola',
  'fatai adekunle ayoola lagos ajeromi ifelodun lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_ajeromi_ifelodun',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Jelili Sulaimon – Lagos Alimosho
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_209cbcf3fd578ba2', 'Jelili Sulaimon',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_209cbcf3fd578ba2', 'ind_209cbcf3fd578ba2', 'individual', 'place_lga_lagos_alimosho',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Jelili Sulaimon', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_209cbcf3fd578ba2', 'prof_209cbcf3fd578ba2',
  'Chairman, Lagos Alimosho Local Government Area',
  'place_lga_lagos_alimosho', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_209cbcf3fd578ba2', 'ind_209cbcf3fd578ba2', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_alimosho', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_209cbcf3fd578ba2', 'ind_209cbcf3fd578ba2', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_209cbcf3fd578ba2', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|alimosho|2021',
  'insert', 'ind_209cbcf3fd578ba2',
  'Unique: Lagos Alimosho LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_209cbcf3fd578ba2', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_209cbcf3fd578ba2', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_209cbcf3fd578ba2', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_alimosho',
  'ind_209cbcf3fd578ba2', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_209cbcf3fd578ba2', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Alimosho LGA', 'place_lga_lagos_alimosho', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_209cbcf3fd578ba2', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_209cbcf3fd578ba2',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_209cbcf3fd578ba2', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_209cbcf3fd578ba2',
  'political_assignment', '{"lga_slug": "alimosho", "lga_place_id": "place_lga_lagos_alimosho", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_209cbcf3fd578ba2', 'prof_209cbcf3fd578ba2',
  'Jelili Sulaimon',
  'jelili sulaimon lagos alimosho lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_alimosho',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Abdulaziz Adediran – Lagos Amuwo Odofin
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_7f358c665a259970', 'Abdulaziz Adediran',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_7f358c665a259970', 'ind_7f358c665a259970', 'individual', 'place_lga_lagos_amuwo_odofin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abdulaziz Adediran', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_7f358c665a259970', 'prof_7f358c665a259970',
  'Chairman, Lagos Amuwo Odofin Local Government Area',
  'place_lga_lagos_amuwo_odofin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_7f358c665a259970', 'ind_7f358c665a259970', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_amuwo_odofin', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_7f358c665a259970', 'ind_7f358c665a259970', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_7f358c665a259970', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|amuwo_odofin|2021',
  'insert', 'ind_7f358c665a259970',
  'Unique: Lagos Amuwo Odofin LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_7f358c665a259970', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_7f358c665a259970', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_7f358c665a259970', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_amuwo_odofin',
  'ind_7f358c665a259970', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_7f358c665a259970', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Amuwo Odofin LGA', 'place_lga_lagos_amuwo_odofin', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_7f358c665a259970', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_7f358c665a259970',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_7f358c665a259970', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_7f358c665a259970',
  'political_assignment', '{"lga_slug": "amuwo_odofin", "lga_place_id": "place_lga_lagos_amuwo_odofin", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_7f358c665a259970', 'prof_7f358c665a259970',
  'Abdulaziz Adediran',
  'abdulaziz adediran lagos amuwo odofin lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_amuwo_odofin',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Oladele Jolaosho – Lagos Apapa
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e7f57a601b4cfc7e', 'Oladele Jolaosho',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e7f57a601b4cfc7e', 'ind_e7f57a601b4cfc7e', 'individual', 'place_lga_lagos_apapa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oladele Jolaosho', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e7f57a601b4cfc7e', 'prof_e7f57a601b4cfc7e',
  'Chairman, Lagos Apapa Local Government Area',
  'place_lga_lagos_apapa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e7f57a601b4cfc7e', 'ind_e7f57a601b4cfc7e', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_apapa', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e7f57a601b4cfc7e', 'ind_e7f57a601b4cfc7e', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e7f57a601b4cfc7e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|apapa|2021',
  'insert', 'ind_e7f57a601b4cfc7e',
  'Unique: Lagos Apapa LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e7f57a601b4cfc7e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_e7f57a601b4cfc7e', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e7f57a601b4cfc7e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_apapa',
  'ind_e7f57a601b4cfc7e', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e7f57a601b4cfc7e', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Apapa LGA', 'place_lga_lagos_apapa', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e7f57a601b4cfc7e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_e7f57a601b4cfc7e',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e7f57a601b4cfc7e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_e7f57a601b4cfc7e',
  'political_assignment', '{"lga_slug": "apapa", "lga_place_id": "place_lga_lagos_apapa", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e7f57a601b4cfc7e', 'prof_e7f57a601b4cfc7e',
  'Oladele Jolaosho',
  'oladele jolaosho lagos apapa lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_apapa',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Eugene Isaac Babalola – Lagos Badagry
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5305ca5e062fec80', 'Eugene Isaac Babalola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5305ca5e062fec80', 'ind_5305ca5e062fec80', 'individual', 'place_lga_lagos_badagry',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Eugene Isaac Babalola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5305ca5e062fec80', 'prof_5305ca5e062fec80',
  'Chairman, Lagos Badagry Local Government Area',
  'place_lga_lagos_badagry', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5305ca5e062fec80', 'ind_5305ca5e062fec80', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_badagry', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5305ca5e062fec80', 'ind_5305ca5e062fec80', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5305ca5e062fec80', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|badagry|2021',
  'insert', 'ind_5305ca5e062fec80',
  'Unique: Lagos Badagry LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5305ca5e062fec80', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5305ca5e062fec80', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5305ca5e062fec80', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_badagry',
  'ind_5305ca5e062fec80', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5305ca5e062fec80', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Badagry LGA', 'place_lga_lagos_badagry', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5305ca5e062fec80', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5305ca5e062fec80',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5305ca5e062fec80', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5305ca5e062fec80',
  'political_assignment', '{"lga_slug": "badagry", "lga_place_id": "place_lga_lagos_badagry", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5305ca5e062fec80', 'prof_5305ca5e062fec80',
  'Eugene Isaac Babalola',
  'eugene isaac babalola lagos badagry lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_badagry',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Sufianu Lawal Alade – Lagos Epe
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_99a06b871fc69dd7', 'Sufianu Lawal Alade',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_99a06b871fc69dd7', 'ind_99a06b871fc69dd7', 'individual', 'place_lga_lagos_epe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Sufianu Lawal Alade', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_99a06b871fc69dd7', 'prof_99a06b871fc69dd7',
  'Chairman, Lagos Epe Local Government Area',
  'place_lga_lagos_epe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_99a06b871fc69dd7', 'ind_99a06b871fc69dd7', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_epe', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_99a06b871fc69dd7', 'ind_99a06b871fc69dd7', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_99a06b871fc69dd7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|epe|2021',
  'insert', 'ind_99a06b871fc69dd7',
  'Unique: Lagos Epe LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_99a06b871fc69dd7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_99a06b871fc69dd7', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_99a06b871fc69dd7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_epe',
  'ind_99a06b871fc69dd7', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_99a06b871fc69dd7', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Epe LGA', 'place_lga_lagos_epe', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_99a06b871fc69dd7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_99a06b871fc69dd7',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_99a06b871fc69dd7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_99a06b871fc69dd7',
  'political_assignment', '{"lga_slug": "epe", "lga_place_id": "place_lga_lagos_epe", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_99a06b871fc69dd7', 'prof_99a06b871fc69dd7',
  'Sufianu Lawal Alade',
  'sufianu lawal alade lagos epe lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_epe',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Segun Omomowo – Lagos Eti Osa
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6b9d1ea01c7340f1', 'Segun Omomowo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6b9d1ea01c7340f1', 'ind_6b9d1ea01c7340f1', 'individual', 'place_lga_lagos_eti_osa',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Segun Omomowo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6b9d1ea01c7340f1', 'prof_6b9d1ea01c7340f1',
  'Chairman, Lagos Eti Osa Local Government Area',
  'place_lga_lagos_eti_osa', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6b9d1ea01c7340f1', 'ind_6b9d1ea01c7340f1', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_eti_osa', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6b9d1ea01c7340f1', 'ind_6b9d1ea01c7340f1', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6b9d1ea01c7340f1', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|eti_osa|2021',
  'insert', 'ind_6b9d1ea01c7340f1',
  'Unique: Lagos Eti Osa LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6b9d1ea01c7340f1', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_6b9d1ea01c7340f1', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6b9d1ea01c7340f1', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_eti_osa',
  'ind_6b9d1ea01c7340f1', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6b9d1ea01c7340f1', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Eti Osa LGA', 'place_lga_lagos_eti_osa', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6b9d1ea01c7340f1', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_6b9d1ea01c7340f1',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6b9d1ea01c7340f1', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_6b9d1ea01c7340f1',
  'political_assignment', '{"lga_slug": "eti_osa", "lga_place_id": "place_lga_lagos_eti_osa", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6b9d1ea01c7340f1', 'prof_6b9d1ea01c7340f1',
  'Segun Omomowo',
  'segun omomowo lagos eti osa lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_eti_osa',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Abiodun Tobun – Lagos Ibeju Lekki
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_3114ecf47eeaa13e', 'Abiodun Tobun',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_3114ecf47eeaa13e', 'ind_3114ecf47eeaa13e', 'individual', 'place_lga_lagos_ibeju_lekki',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Abiodun Tobun', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_3114ecf47eeaa13e', 'prof_3114ecf47eeaa13e',
  'Chairman, Lagos Ibeju Lekki Local Government Area',
  'place_lga_lagos_ibeju_lekki', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_3114ecf47eeaa13e', 'ind_3114ecf47eeaa13e', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_ibeju_lekki', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_3114ecf47eeaa13e', 'ind_3114ecf47eeaa13e', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_3114ecf47eeaa13e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|ibeju_lekki|2021',
  'insert', 'ind_3114ecf47eeaa13e',
  'Unique: Lagos Ibeju Lekki LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_3114ecf47eeaa13e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_3114ecf47eeaa13e', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_3114ecf47eeaa13e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_ibeju_lekki',
  'ind_3114ecf47eeaa13e', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_3114ecf47eeaa13e', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Ibeju Lekki LGA', 'place_lga_lagos_ibeju_lekki', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_3114ecf47eeaa13e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_3114ecf47eeaa13e',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_3114ecf47eeaa13e', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_3114ecf47eeaa13e',
  'political_assignment', '{"lga_slug": "ibeju_lekki", "lga_place_id": "place_lga_lagos_ibeju_lekki", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_3114ecf47eeaa13e', 'prof_3114ecf47eeaa13e',
  'Abiodun Tobun',
  'abiodun tobun lagos ibeju lekki lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_ibeju_lekki',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Mosafejo Adewale Olanrewaju – Lagos Ifako Ijaiye
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_333fb1b666664c5d', 'Mosafejo Adewale Olanrewaju',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_333fb1b666664c5d', 'ind_333fb1b666664c5d', 'individual', 'place_lga_lagos_ifako_ijaiye',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Mosafejo Adewale Olanrewaju', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_333fb1b666664c5d', 'prof_333fb1b666664c5d',
  'Chairman, Lagos Ifako Ijaiye Local Government Area',
  'place_lga_lagos_ifako_ijaiye', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_333fb1b666664c5d', 'ind_333fb1b666664c5d', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_ifako_ijaiye', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_333fb1b666664c5d', 'ind_333fb1b666664c5d', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_333fb1b666664c5d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|ifako_ijaiye|2021',
  'insert', 'ind_333fb1b666664c5d',
  'Unique: Lagos Ifako Ijaiye LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_333fb1b666664c5d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_333fb1b666664c5d', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_333fb1b666664c5d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_ifako_ijaiye',
  'ind_333fb1b666664c5d', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_333fb1b666664c5d', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Ifako Ijaiye LGA', 'place_lga_lagos_ifako_ijaiye', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_333fb1b666664c5d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_333fb1b666664c5d',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_333fb1b666664c5d', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_333fb1b666664c5d',
  'political_assignment', '{"lga_slug": "ifako_ijaiye", "lga_place_id": "place_lga_lagos_ifako_ijaiye", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_333fb1b666664c5d', 'prof_333fb1b666664c5d',
  'Mosafejo Adewale Olanrewaju',
  'mosafejo adewale olanrewaju lagos ifako ijaiye lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_ifako_ijaiye',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Setonji David Bamgbose – Lagos Ikeja
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d37c4c311827304f', 'Setonji David Bamgbose',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d37c4c311827304f', 'ind_d37c4c311827304f', 'individual', 'place_lga_lagos_ikeja',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Setonji David Bamgbose', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d37c4c311827304f', 'prof_d37c4c311827304f',
  'Chairman, Lagos Ikeja Local Government Area',
  'place_lga_lagos_ikeja', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d37c4c311827304f', 'ind_d37c4c311827304f', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_ikeja', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d37c4c311827304f', 'ind_d37c4c311827304f', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d37c4c311827304f', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|ikeja|2021',
  'insert', 'ind_d37c4c311827304f',
  'Unique: Lagos Ikeja LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d37c4c311827304f', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_d37c4c311827304f', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d37c4c311827304f', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_ikeja',
  'ind_d37c4c311827304f', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d37c4c311827304f', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Ikeja LGA', 'place_lga_lagos_ikeja', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d37c4c311827304f', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_d37c4c311827304f',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d37c4c311827304f', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_d37c4c311827304f',
  'political_assignment', '{"lga_slug": "ikeja", "lga_place_id": "place_lga_lagos_ikeja", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d37c4c311827304f', 'prof_d37c4c311827304f',
  'Setonji David Bamgbose',
  'setonji david bamgbose lagos ikeja lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_ikeja',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Wasiu Adesina – Lagos Ikorodu
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b9745135405ac0e7', 'Wasiu Adesina',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b9745135405ac0e7', 'ind_b9745135405ac0e7', 'individual', 'place_lga_lagos_ikorodu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Wasiu Adesina', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b9745135405ac0e7', 'prof_b9745135405ac0e7',
  'Chairman, Lagos Ikorodu Local Government Area',
  'place_lga_lagos_ikorodu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b9745135405ac0e7', 'ind_b9745135405ac0e7', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_ikorodu', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b9745135405ac0e7', 'ind_b9745135405ac0e7', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b9745135405ac0e7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|ikorodu|2021',
  'insert', 'ind_b9745135405ac0e7',
  'Unique: Lagos Ikorodu LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b9745135405ac0e7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_b9745135405ac0e7', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b9745135405ac0e7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_ikorodu',
  'ind_b9745135405ac0e7', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b9745135405ac0e7', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Ikorodu LGA', 'place_lga_lagos_ikorodu', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b9745135405ac0e7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_b9745135405ac0e7',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b9745135405ac0e7', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_b9745135405ac0e7',
  'political_assignment', '{"lga_slug": "ikorodu", "lga_place_id": "place_lga_lagos_ikorodu", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b9745135405ac0e7', 'prof_b9745135405ac0e7',
  'Wasiu Adesina',
  'wasiu adesina lagos ikorodu lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_ikorodu',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Moyosore Ogunlewe – Lagos Kosofe
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5af2a05c8f82498b', 'Moyosore Ogunlewe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5af2a05c8f82498b', 'ind_5af2a05c8f82498b', 'individual', 'place_lga_lagos_kosofe',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Moyosore Ogunlewe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5af2a05c8f82498b', 'prof_5af2a05c8f82498b',
  'Chairman, Lagos Kosofe Local Government Area',
  'place_lga_lagos_kosofe', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5af2a05c8f82498b', 'ind_5af2a05c8f82498b', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_kosofe', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5af2a05c8f82498b', 'ind_5af2a05c8f82498b', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5af2a05c8f82498b', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|kosofe|2021',
  'insert', 'ind_5af2a05c8f82498b',
  'Unique: Lagos Kosofe LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5af2a05c8f82498b', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5af2a05c8f82498b', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5af2a05c8f82498b', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_kosofe',
  'ind_5af2a05c8f82498b', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5af2a05c8f82498b', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Kosofe LGA', 'place_lga_lagos_kosofe', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5af2a05c8f82498b', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5af2a05c8f82498b',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5af2a05c8f82498b', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5af2a05c8f82498b',
  'political_assignment', '{"lga_slug": "kosofe", "lga_place_id": "place_lga_lagos_kosofe", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5af2a05c8f82498b', 'prof_5af2a05c8f82498b',
  'Moyosore Ogunlewe',
  'moyosore ogunlewe lagos kosofe lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_kosofe',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Christopher Okelola – Lagos Lagos Island
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_e19740f4517e5632', 'Christopher Okelola',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_e19740f4517e5632', 'ind_e19740f4517e5632', 'individual', 'place_lga_lagos_lagos_island',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Christopher Okelola', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_e19740f4517e5632', 'prof_e19740f4517e5632',
  'Chairman, Lagos Lagos Island Local Government Area',
  'place_lga_lagos_lagos_island', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_e19740f4517e5632', 'ind_e19740f4517e5632', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_lagos_island', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_e19740f4517e5632', 'ind_e19740f4517e5632', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_e19740f4517e5632', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|lagos_island|2021',
  'insert', 'ind_e19740f4517e5632',
  'Unique: Lagos Lagos Island LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_e19740f4517e5632', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_e19740f4517e5632', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_e19740f4517e5632', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_lagos_island',
  'ind_e19740f4517e5632', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_e19740f4517e5632', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Lagos Island LGA', 'place_lga_lagos_lagos_island', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_e19740f4517e5632', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_e19740f4517e5632',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_e19740f4517e5632', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_e19740f4517e5632',
  'political_assignment', '{"lga_slug": "lagos_island", "lga_place_id": "place_lga_lagos_lagos_island", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_e19740f4517e5632', 'prof_e19740f4517e5632',
  'Christopher Okelola',
  'christopher okelola lagos lagos island lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_lagos_island',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Bolaji Salau – Lagos Lagos Mainland
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_5d641617d44ec53a', 'Bolaji Salau',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_5d641617d44ec53a', 'ind_5d641617d44ec53a', 'individual', 'place_lga_lagos_lagos_mainland',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Bolaji Salau', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_5d641617d44ec53a', 'prof_5d641617d44ec53a',
  'Chairman, Lagos Lagos Mainland Local Government Area',
  'place_lga_lagos_lagos_mainland', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_5d641617d44ec53a', 'ind_5d641617d44ec53a', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_lagos_mainland', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_5d641617d44ec53a', 'ind_5d641617d44ec53a', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_5d641617d44ec53a', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|lagos_mainland|2021',
  'insert', 'ind_5d641617d44ec53a',
  'Unique: Lagos Lagos Mainland LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_5d641617d44ec53a', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5d641617d44ec53a', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_5d641617d44ec53a', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_lagos_mainland',
  'ind_5d641617d44ec53a', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_5d641617d44ec53a', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Lagos Mainland LGA', 'place_lga_lagos_lagos_mainland', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_5d641617d44ec53a', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5d641617d44ec53a',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_5d641617d44ec53a', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_5d641617d44ec53a',
  'political_assignment', '{"lga_slug": "lagos_mainland", "lga_place_id": "place_lga_lagos_lagos_mainland", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_5d641617d44ec53a', 'prof_5d641617d44ec53a',
  'Bolaji Salau',
  'bolaji salau lagos lagos mainland lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_lagos_mainland',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Fuad Lawal – Lagos Mushin
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_916ec35caed7fa00', 'Fuad Lawal',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_916ec35caed7fa00', 'ind_916ec35caed7fa00', 'individual', 'place_lga_lagos_mushin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Fuad Lawal', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_916ec35caed7fa00', 'prof_916ec35caed7fa00',
  'Chairman, Lagos Mushin Local Government Area',
  'place_lga_lagos_mushin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_916ec35caed7fa00', 'ind_916ec35caed7fa00', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_mushin', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_916ec35caed7fa00', 'ind_916ec35caed7fa00', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_916ec35caed7fa00', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|mushin|2021',
  'insert', 'ind_916ec35caed7fa00',
  'Unique: Lagos Mushin LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_916ec35caed7fa00', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_916ec35caed7fa00', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_916ec35caed7fa00', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_mushin',
  'ind_916ec35caed7fa00', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_916ec35caed7fa00', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Mushin LGA', 'place_lga_lagos_mushin', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_916ec35caed7fa00', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_916ec35caed7fa00',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_916ec35caed7fa00', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_916ec35caed7fa00',
  'political_assignment', '{"lga_slug": "mushin", "lga_place_id": "place_lga_lagos_mushin", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_916ec35caed7fa00', 'prof_916ec35caed7fa00',
  'Fuad Lawal',
  'fuad lawal lagos mushin lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_mushin',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Oludahunsi Rufai – Lagos Ojo
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_29d0d1aecaad5288', 'Oludahunsi Rufai',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_29d0d1aecaad5288', 'ind_29d0d1aecaad5288', 'individual', 'place_lga_lagos_ojo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oludahunsi Rufai', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_29d0d1aecaad5288', 'prof_29d0d1aecaad5288',
  'Chairman, Lagos Ojo Local Government Area',
  'place_lga_lagos_ojo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_29d0d1aecaad5288', 'ind_29d0d1aecaad5288', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_ojo', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_29d0d1aecaad5288', 'ind_29d0d1aecaad5288', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_29d0d1aecaad5288', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|ojo|2021',
  'insert', 'ind_29d0d1aecaad5288',
  'Unique: Lagos Ojo LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_29d0d1aecaad5288', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_29d0d1aecaad5288', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_29d0d1aecaad5288', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_ojo',
  'ind_29d0d1aecaad5288', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_29d0d1aecaad5288', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Ojo LGA', 'place_lga_lagos_ojo', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_29d0d1aecaad5288', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_29d0d1aecaad5288',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_29d0d1aecaad5288', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_29d0d1aecaad5288',
  'political_assignment', '{"lga_slug": "ojo", "lga_place_id": "place_lga_lagos_ojo", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_29d0d1aecaad5288', 'prof_29d0d1aecaad5288',
  'Oludahunsi Rufai',
  'oludahunsi rufai lagos ojo lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_ojo',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Idowu Moruf Akinwande – Lagos Oshodi Isolo
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_0c2d8da557cb2728', 'Idowu Moruf Akinwande',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_0c2d8da557cb2728', 'ind_0c2d8da557cb2728', 'individual', 'place_lga_lagos_oshodi_isolo',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Idowu Moruf Akinwande', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_0c2d8da557cb2728', 'prof_0c2d8da557cb2728',
  'Chairman, Lagos Oshodi Isolo Local Government Area',
  'place_lga_lagos_oshodi_isolo', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_0c2d8da557cb2728', 'ind_0c2d8da557cb2728', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_oshodi_isolo', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_0c2d8da557cb2728', 'ind_0c2d8da557cb2728', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_0c2d8da557cb2728', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|oshodi_isolo|2021',
  'insert', 'ind_0c2d8da557cb2728',
  'Unique: Lagos Oshodi Isolo LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_0c2d8da557cb2728', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_0c2d8da557cb2728', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_0c2d8da557cb2728', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_oshodi_isolo',
  'ind_0c2d8da557cb2728', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_0c2d8da557cb2728', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Oshodi Isolo LGA', 'place_lga_lagos_oshodi_isolo', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_0c2d8da557cb2728', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_0c2d8da557cb2728',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_0c2d8da557cb2728', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_0c2d8da557cb2728',
  'political_assignment', '{"lga_slug": "oshodi_isolo", "lga_place_id": "place_lga_lagos_oshodi_isolo", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_0c2d8da557cb2728', 'prof_0c2d8da557cb2728',
  'Idowu Moruf Akinwande',
  'idowu moruf akinwande lagos oshodi isolo lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_oshodi_isolo',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Ogunkoya Kehinde – Lagos Shomolu
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_b67a23a3b6f2a4eb', 'Ogunkoya Kehinde',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_b67a23a3b6f2a4eb', 'ind_b67a23a3b6f2a4eb', 'individual', 'place_lga_lagos_shomolu',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Ogunkoya Kehinde', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_b67a23a3b6f2a4eb', 'prof_b67a23a3b6f2a4eb',
  'Chairman, Lagos Shomolu Local Government Area',
  'place_lga_lagos_shomolu', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_b67a23a3b6f2a4eb', 'ind_b67a23a3b6f2a4eb', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_shomolu', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_b67a23a3b6f2a4eb', 'ind_b67a23a3b6f2a4eb', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_b67a23a3b6f2a4eb', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|shomolu|2021',
  'insert', 'ind_b67a23a3b6f2a4eb',
  'Unique: Lagos Shomolu LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_b67a23a3b6f2a4eb', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_b67a23a3b6f2a4eb', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_b67a23a3b6f2a4eb', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_shomolu',
  'ind_b67a23a3b6f2a4eb', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_b67a23a3b6f2a4eb', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Shomolu LGA', 'place_lga_lagos_shomolu', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_b67a23a3b6f2a4eb', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_b67a23a3b6f2a4eb',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_b67a23a3b6f2a4eb', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_b67a23a3b6f2a4eb',
  'political_assignment', '{"lga_slug": "shomolu", "lga_place_id": "place_lga_lagos_shomolu", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_b67a23a3b6f2a4eb', 'prof_b67a23a3b6f2a4eb',
  'Ogunkoya Kehinde',
  'ogunkoya kehinde lagos shomolu lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_shomolu',
  'political',
  unixepoch(), unixepoch()
);
-- LGA Chairman: Nojeem Adubiaro – Lagos Surulere
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_d029cefaf10f05c6', 'Nojeem Adubiaro',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_d029cefaf10f05c6', 'ind_d029cefaf10f05c6', 'individual', 'place_lga_lagos_surulere',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Nojeem Adubiaro', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_d029cefaf10f05c6', 'prof_d029cefaf10f05c6',
  'Chairman, Lagos Surulere Local Government Area',
  'place_lga_lagos_surulere', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_d029cefaf10f05c6', 'ind_d029cefaf10f05c6', 'term_ng_lagos_lga_chairs_2021_2024',
  'place_lga_lagos_surulere', 'lga_chairman', 2021, 2024, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_d029cefaf10f05c6', 'ind_d029cefaf10f05c6', 'org_political_party_apc', 2021, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_d029cefaf10f05c6', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual',
  'ng_lga_chairman|lagos|surulere|2021',
  'insert', 'ind_d029cefaf10f05c6',
  'Unique: Lagos Surulere LGA chair 2021-2024');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_d029cefaf10f05c6', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_d029cefaf10f05c6', 'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_d029cefaf10f05c6', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'seed_source_lasiec_lga_elections_lagos_2021_20260502',
  'lasiec_lagos_lga_chair_2021_surulere',
  'ind_d029cefaf10f05c6', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_d029cefaf10f05c6', 'seed_run_s05_political_lagos_lga_chairs_20260502',
  'Lagos Surulere LGA', 'place_lga_lagos_surulere', 'exact_match', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_d029cefaf10f05c6', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_d029cefaf10f05c6',
  'seed_source_lasiec_lga_elections_lagos_2021_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_d029cefaf10f05c6', 'seed_run_s05_political_lagos_lga_chairs_20260502', 'individual', 'ind_d029cefaf10f05c6',
  'political_assignment', '{"lga_slug": "surulere", "lga_place_id": "place_lga_lagos_surulere", "office": "chairman", "party": "APC", "election_year": 2021, "term_end": 2024}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_d029cefaf10f05c6', 'prof_d029cefaf10f05c6',
  'Nojeem Adubiaro',
  'nojeem adubiaro lagos surulere lga chairman local government apc politician',
  'place_nigeria_001/place_zone_south_west/place_state_lagos/place_lga_lagos_surulere',
  'political',
  unixepoch(), unixepoch()
);
COMMIT;
