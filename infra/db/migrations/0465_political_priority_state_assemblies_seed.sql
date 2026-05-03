-- ============================================================
-- Migration 0465: Priority State Houses of Assembly — Kano, Rivers, Ogun, Oyo
-- Phase S05 — Political and Electoral Foundation, Batch 7
-- Generated: 2026-05-02
-- Source: Wikipedia lists of state assembly members (2023-2027 10th Assemblies)
-- States: Kano (40 seats), Rivers (32), Ogun (26), Oyo (32) = 130 total seats
-- Seeded: 4 confirmed members (Speakers only; full rosters require
--         editorial extraction from Wikipedia per state)
-- Idempotent: all inserts use INSERT OR IGNORE
-- ============================================================


-- ============================================================
-- Kano State House of Assembly (10th, 2023-2027)
-- 40 seats | Source: Wikipedia
-- Partial seed: Speaker seeded; full roster requires editorial extraction
-- ============================================================

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_wikipedia_kano_assembly_2023_20260502',
  'Wikipedia – List of members of the Kano State House of Assembly (2023-2027)',
  'editorial_aggregator',
  'https://en.wikipedia.org/wiki/Kano_State_House_of_Assembly',
  'editorial_verified',
  'Wikipedia cites official Kano State House of Assembly website and Nigerian press.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_kano_assembly_20260502', 'S05 Batch 7 – Kano State Assembly 2023-2027',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_kano_assembly_20260502',
  'seed_run_s05_political_kano_assembly_20260502', 'partial_seed',
  'infra/db/migrations/0465_political_priority_state_assemblies_seed.sql',
  NULL, 1,
  'Partial: 1/40 members seeded (Speaker only); full roster pending Wikipedia extraction');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_kano_state_assembly_10th_2023_2027',
  'Kano State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state',
  'state_assembly_member',
  'place_state_kano',
  '2023-06-13',
  '2027-06-12',
  unixepoch(), unixepoch()
);

-- Speaker: Hamisu Ibrahim Chidari – MUNICIPAL
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_bb0cb578cd5b0cbd', 'Hamisu Ibrahim Chidari',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_bb0cb578cd5b0cbd', 'ind_bb0cb578cd5b0cbd', 'individual', 'place_state_constituency_sc_503_kn',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Hamisu Ibrahim Chidari', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_bb0cb578cd5b0cbd', 'prof_bb0cb578cd5b0cbd',
  'Speaker, Kano State House of Assembly (MUNICIPAL)',
  'place_state_constituency_sc_503_kn', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_bb0cb578cd5b0cbd', 'ind_bb0cb578cd5b0cbd', 'term_ng_kano_state_assembly_10th_2023_2027',
  'place_state_constituency_sc_503_kn', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_bb0cb578cd5b0cbd', 'ind_bb0cb578cd5b0cbd', 'org_political_party_nnpp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_bb0cb578cd5b0cbd', 'seed_run_s05_political_kano_assembly_20260502', 'individual',
  'ng_state_assembly_member|kano|municipal|2023',
  'insert', 'ind_bb0cb578cd5b0cbd',
  'Unique: Kano MUNICIPAL seat 2023-2027');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_bb0cb578cd5b0cbd', 'seed_run_s05_political_kano_assembly_20260502', 'individual', 'ind_bb0cb578cd5b0cbd', 'seed_source_wikipedia_kano_assembly_2023_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_bb0cb578cd5b0cbd', 'seed_run_s05_political_kano_assembly_20260502', 'seed_source_wikipedia_kano_assembly_2023_20260502',
  'wp_kano_assembly_2023_municipal',
  'ind_bb0cb578cd5b0cbd', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_bb0cb578cd5b0cbd', 'seed_run_s05_political_kano_assembly_20260502',
  'Kano MUNICIPAL', 'place_state_constituency_sc_503_kn', 'exact_alias', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_bb0cb578cd5b0cbd', 'seed_run_s05_political_kano_assembly_20260502', 'individual', 'ind_bb0cb578cd5b0cbd',
  'seed_source_wikipedia_kano_assembly_2023_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_bb0cb578cd5b0cbd', 'seed_run_s05_political_kano_assembly_20260502', 'individual', 'ind_bb0cb578cd5b0cbd',
  'political_assignment', '{"constituency_inec": "MUNICIPAL", "party_abbrev": "NNPP", "position": "Speaker", "source_url": "https://en.wikipedia.org/wiki/Kano_State_House_of_Assembly"}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_bb0cb578cd5b0cbd', 'prof_bb0cb578cd5b0cbd',
  'Hamisu Ibrahim Chidari',
  'hamisu ibrahim chidari kano state assembly municipal nnpp politician legislator state house',
  'place_nigeria_001/place_zone_north_west/place_state_kano/place_state_constituency_sc_503_kn',
  'political',
  unixepoch(), unixepoch()
);

-- ============================================================
-- Rivers State House of Assembly (10th, 2023-2027)
-- 32 seats | Source: Wikipedia
-- Partial seed: Speaker seeded; full roster requires editorial extraction
-- ============================================================

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_wikipedia_rivers_assembly_2023_20260502',
  'Wikipedia – List of members of the Rivers State House of Assembly (2023-2027)',
  'editorial_aggregator',
  'https://en.wikipedia.org/wiki/Rivers_State_House_of_Assembly',
  'editorial_verified',
  'Wikipedia cites official Rivers State House of Assembly website and Nigerian press.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_rivers_assembly_20260502', 'S05 Batch 7 – Rivers State Assembly 2023-2027',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_rivers_assembly_20260502',
  'seed_run_s05_political_rivers_assembly_20260502', 'partial_seed',
  'infra/db/migrations/0465_political_priority_state_assemblies_seed.sql',
  NULL, 1,
  'Partial: 1/32 members seeded (Speaker only); full roster pending Wikipedia extraction');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_rivers_state_assembly_10th_2023_2027',
  'Rivers State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state',
  'state_assembly_member',
  'place_state_rivers',
  '2023-06-13',
  '2027-06-12',
  unixepoch(), unixepoch()
);

-- Speaker (initial, contested): Martin Amaewhule – IKWERE I
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_18008758cf004617', 'Martin Amaewhule',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_18008758cf004617', 'ind_18008758cf004617', 'individual', 'place_state_constituency_sc_873_rv',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Martin Amaewhule', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_18008758cf004617', 'prof_18008758cf004617',
  'Speaker (initial, contested), Rivers State House of Assembly (IKWERE I)',
  'place_state_constituency_sc_873_rv', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_18008758cf004617', 'ind_18008758cf004617', 'term_ng_rivers_state_assembly_10th_2023_2027',
  'place_state_constituency_sc_873_rv', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_18008758cf004617', 'ind_18008758cf004617', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_18008758cf004617', 'seed_run_s05_political_rivers_assembly_20260502', 'individual',
  'ng_state_assembly_member|rivers|ikwere_i|2023',
  'insert', 'ind_18008758cf004617',
  'Unique: Rivers IKWERE I seat 2023-2027');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_18008758cf004617', 'seed_run_s05_political_rivers_assembly_20260502', 'individual', 'ind_18008758cf004617', 'seed_source_wikipedia_rivers_assembly_2023_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_18008758cf004617', 'seed_run_s05_political_rivers_assembly_20260502', 'seed_source_wikipedia_rivers_assembly_2023_20260502',
  'wp_rivers_assembly_2023_ikwere_i',
  'ind_18008758cf004617', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_18008758cf004617', 'seed_run_s05_political_rivers_assembly_20260502',
  'Rivers IKWERE I', 'place_state_constituency_sc_873_rv', 'exact_alias', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_18008758cf004617', 'seed_run_s05_political_rivers_assembly_20260502', 'individual', 'ind_18008758cf004617',
  'seed_source_wikipedia_rivers_assembly_2023_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_18008758cf004617', 'seed_run_s05_political_rivers_assembly_20260502', 'individual', 'ind_18008758cf004617',
  'political_assignment', '{"constituency_inec": "IKWERE I", "party_abbrev": "PDP", "position": "Speaker (initial, contested)", "source_url": "https://en.wikipedia.org/wiki/Rivers_State_House_of_Assembly"}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_18008758cf004617', 'prof_18008758cf004617',
  'Martin Amaewhule',
  'martin amaewhule rivers state assembly ikwere_i pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_south/place_state_rivers/place_state_constituency_sc_873_rv',
  'political',
  unixepoch(), unixepoch()
);

-- ============================================================
-- Ogun State House of Assembly (10th, 2023-2027)
-- 26 seats | Source: Wikipedia
-- Partial seed: Speaker seeded; full roster requires editorial extraction
-- ============================================================

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_wikipedia_ogun_assembly_2023_20260502',
  'Wikipedia – List of members of the Ogun State House of Assembly (2023-2027)',
  'editorial_aggregator',
  'https://en.wikipedia.org/wiki/Ogun_State_House_of_Assembly',
  'editorial_verified',
  'Wikipedia cites official Ogun State House of Assembly website and Nigerian press.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_ogun_assembly_20260502', 'S05 Batch 7 – Ogun State Assembly 2023-2027',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_ogun_assembly_20260502',
  'seed_run_s05_political_ogun_assembly_20260502', 'partial_seed',
  'infra/db/migrations/0465_political_priority_state_assemblies_seed.sql',
  NULL, 1,
  'Partial: 1/26 members seeded (Speaker only); full roster pending Wikipedia extraction');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_ogun_state_assembly_10th_2023_2027',
  'Ogun State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state',
  'state_assembly_member',
  'place_state_ogun',
  '2023-06-13',
  '2027-06-12',
  unixepoch(), unixepoch()
);

-- Speaker: Oludaisi Elemide – ABEOKUTA NORTH
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_fe990f61b402d932', 'Oludaisi Elemide',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_fe990f61b402d932', 'ind_fe990f61b402d932', 'individual', 'place_state_constituency_sc_726_og',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Oludaisi Elemide', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_fe990f61b402d932', 'prof_fe990f61b402d932',
  'Speaker, Ogun State House of Assembly (ABEOKUTA NORTH)',
  'place_state_constituency_sc_726_og', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_fe990f61b402d932', 'ind_fe990f61b402d932', 'term_ng_ogun_state_assembly_10th_2023_2027',
  'place_state_constituency_sc_726_og', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_fe990f61b402d932', 'ind_fe990f61b402d932', 'org_political_party_apc', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_fe990f61b402d932', 'seed_run_s05_political_ogun_assembly_20260502', 'individual',
  'ng_state_assembly_member|ogun|abeokuta_north|2023',
  'insert', 'ind_fe990f61b402d932',
  'Unique: Ogun ABEOKUTA NORTH seat 2023-2027');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_fe990f61b402d932', 'seed_run_s05_political_ogun_assembly_20260502', 'individual', 'ind_fe990f61b402d932', 'seed_source_wikipedia_ogun_assembly_2023_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_fe990f61b402d932', 'seed_run_s05_political_ogun_assembly_20260502', 'seed_source_wikipedia_ogun_assembly_2023_20260502',
  'wp_ogun_assembly_2023_abeokuta_north',
  'ind_fe990f61b402d932', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_fe990f61b402d932', 'seed_run_s05_political_ogun_assembly_20260502',
  'Ogun ABEOKUTA NORTH', 'place_state_constituency_sc_726_og', 'exact_alias', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_fe990f61b402d932', 'seed_run_s05_political_ogun_assembly_20260502', 'individual', 'ind_fe990f61b402d932',
  'seed_source_wikipedia_ogun_assembly_2023_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_fe990f61b402d932', 'seed_run_s05_political_ogun_assembly_20260502', 'individual', 'ind_fe990f61b402d932',
  'political_assignment', '{"constituency_inec": "ABEOKUTA NORTH", "party_abbrev": "APC", "position": "Speaker", "source_url": "https://en.wikipedia.org/wiki/Ogun_State_House_of_Assembly"}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_fe990f61b402d932', 'prof_fe990f61b402d932',
  'Oludaisi Elemide',
  'oludaisi elemide ogun state assembly abeokuta_north apc politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_ogun/place_state_constituency_sc_726_og',
  'political',
  unixepoch(), unixepoch()
);

-- ============================================================
-- Oyo State House of Assembly (10th, 2023-2027)
-- 32 seats | Source: Wikipedia
-- Partial seed: Speaker seeded; full roster requires editorial extraction
-- ============================================================

INSERT OR IGNORE INTO seed_sources (id, label, source_type, url, confidence_tier, notes)
VALUES ('seed_source_wikipedia_oyo_assembly_2023_20260502',
  'Wikipedia – List of members of the Oyo State House of Assembly (2023-2027)',
  'editorial_aggregator',
  'https://en.wikipedia.org/wiki/Oyo_State_House_of_Assembly',
  'editorial_verified',
  'Wikipedia cites official Oyo State House of Assembly website and Nigerian press.');

INSERT OR IGNORE INTO seed_runs (id, label, phase, status, started_at, completed_at)
VALUES ('seed_run_s05_political_oyo_assembly_20260502', 'S05 Batch 7 – Oyo State Assembly 2023-2027',
  'S05', 'completed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, artifact_type, file_path, content_hash, row_count, notes)
VALUES ('seed_artifact_oyo_assembly_20260502',
  'seed_run_s05_political_oyo_assembly_20260502', 'partial_seed',
  'infra/db/migrations/0465_political_priority_state_assemblies_seed.sql',
  NULL, 1,
  'Partial: 1/32 members seeded (Speaker only); full roster pending Wikipedia extraction');

INSERT OR IGNORE INTO terms (id, label, election_cycle_id, level, office_type,
  jurisdiction_place_id, start_date, end_date, created_at, updated_at)
VALUES (
  'term_ng_oyo_state_assembly_10th_2023_2027',
  'Oyo State House of Assembly (10th Assembly, 2023-2027)',
  'cycle_ng_state_general_2023',
  'state',
  'state_assembly_member',
  'place_state_oyo',
  '2023-06-13',
  '2027-06-12',
  unixepoch(), unixepoch()
);

-- Speaker: Adebo Ogundoyin – IBARAPA EAST
INSERT OR IGNORE INTO individuals
  (id, full_name, tenant_id, workspace_id, verification_state, created_at, updated_at)
VALUES (
  'ind_6d28a45ee58a3402', 'Adebo Ogundoyin',
  'tenant_platform_seed', 'workspace_platform_seed_discovery', 'editorial_verified', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO profiles
  (id, subject_id, subject_type, primary_place_id, tenant_id, workspace_id,
   display_name, created_at, updated_at)
VALUES (
  'prof_6d28a45ee58a3402', 'ind_6d28a45ee58a3402', 'individual', 'place_state_constituency_sc_816_oy',
  'tenant_platform_seed', 'workspace_platform_seed_discovery',
  'Adebo Ogundoyin', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO politician_profiles
  (id, profile_id, office_title, jurisdiction_place_id, created_at, updated_at)
VALUES (
  'pp_6d28a45ee58a3402', 'prof_6d28a45ee58a3402',
  'Speaker, Oyo State House of Assembly (IBARAPA EAST)',
  'place_state_constituency_sc_816_oy', unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO political_assignments
  (id, individual_id, term_id, jurisdiction_place_id, office_type,
   took_office_year, left_office_year, created_at, updated_at)
VALUES (
  'assign_6d28a45ee58a3402', 'ind_6d28a45ee58a3402', 'term_ng_oyo_state_assembly_10th_2023_2027',
  'place_state_constituency_sc_816_oy', 'state_assembly_member', 2023, NULL, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO party_affiliations
  (id, individual_id, party_id, start_year, is_current, created_at, updated_at)
VALUES (
  'aff_6d28a45ee58a3402', 'ind_6d28a45ee58a3402', 'org_political_party_pdp', 2023, 1, unixepoch(), unixepoch()
);
INSERT OR IGNORE INTO seed_dedupe_decisions
  (id, seed_run_id, entity_type, dedup_key, decision, canonical_id, notes)
VALUES (
  'dd_6d28a45ee58a3402', 'seed_run_s05_political_oyo_assembly_20260502', 'individual',
  'ng_state_assembly_member|oyo|ibarapa_east|2023',
  'insert', 'ind_6d28a45ee58a3402',
  'Unique: Oyo IBARAPA EAST seat 2023-2027');
INSERT OR IGNORE INTO seed_ingestion_records
  (id, seed_run_id, entity_type, entity_id, source_id, status)
VALUES (
  'ir_6d28a45ee58a3402', 'seed_run_s05_political_oyo_assembly_20260502', 'individual', 'ind_6d28a45ee58a3402', 'seed_source_wikipedia_oyo_assembly_2023_20260502', 'ingested');
INSERT OR IGNORE INTO seed_identity_map
  (id, seed_run_id, source_id, source_entity_key, canonical_entity_id, entity_type)
VALUES (
  'im_6d28a45ee58a3402', 'seed_run_s05_political_oyo_assembly_20260502', 'seed_source_wikipedia_oyo_assembly_2023_20260502',
  'wp_oyo_assembly_2023_ibarapa_east',
  'ind_6d28a45ee58a3402', 'individual');
INSERT OR IGNORE INTO seed_place_resolutions
  (id, seed_run_id, source_name, resolved_place_id, resolution_method, confidence)
VALUES (
  'pr_6d28a45ee58a3402', 'seed_run_s05_political_oyo_assembly_20260502',
  'Oyo IBARAPA EAST', 'place_state_constituency_sc_816_oy', 'exact_alias', 1.0);
INSERT OR IGNORE INTO seed_entity_sources
  (id, seed_run_id, entity_type, entity_id, source_id, confidence_tier)
VALUES (
  'es_6d28a45ee58a3402', 'seed_run_s05_political_oyo_assembly_20260502', 'individual', 'ind_6d28a45ee58a3402',
  'seed_source_wikipedia_oyo_assembly_2023_20260502', 'editorial_verified');
INSERT OR IGNORE INTO seed_enrichment
  (id, seed_run_id, entity_type, entity_id, enrichment_type, enrichment_json)
VALUES (
  'enr_6d28a45ee58a3402', 'seed_run_s05_political_oyo_assembly_20260502', 'individual', 'ind_6d28a45ee58a3402',
  'political_assignment', '{"constituency_inec": "IBARAPA EAST", "party_abbrev": "PDP", "position": "Speaker", "source_url": "https://en.wikipedia.org/wiki/Oyo_State_House_of_Assembly"}');
INSERT OR IGNORE INTO search_entries
  (id, profile_id, display_name, keywords, ancestry_path, vertical, created_at, updated_at)
VALUES (
  'se_6d28a45ee58a3402', 'prof_6d28a45ee58a3402',
  'Adebo Ogundoyin',
  'adebo ogundoyin oyo state assembly ibarapa_east pdp politician legislator state house',
  'place_nigeria_001/place_zone_south_west/place_state_oyo/place_state_constituency_sc_816_oy',
  'political',
  unixepoch(), unixepoch()
);
