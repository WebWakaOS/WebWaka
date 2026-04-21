CREATE TABLE IF NOT EXISTS seed_ingestion_records (
  id                    TEXT PRIMARY KEY,
  seed_run_id           TEXT NOT NULL REFERENCES seed_runs(id),
  source_id             TEXT NOT NULL REFERENCES seed_sources(id),
  artifact_id           TEXT REFERENCES seed_raw_artifacts(id),
  row_number            INTEGER CHECK (row_number IS NULL OR row_number >= 0),
  source_record_id      TEXT NOT NULL,
  source_record_hash    TEXT NOT NULL,
  target_entity_type    TEXT NOT NULL CHECK (target_entity_type IN ('individual','organization','place','profile','vertical_profile','jurisdiction','other')),
  target_entity_id      TEXT,
  target_profile_id     TEXT,
  vertical_slug         TEXT,
  primary_place_id      TEXT REFERENCES places(id),
  raw_json              TEXT NOT NULL DEFAULT '{}',
  normalized_json       TEXT NOT NULL DEFAULT '{}',
  record_status         TEXT NOT NULL DEFAULT 'staged' CHECK (record_status IN ('staged','validated','inserted','rejected','duplicate','superseded')),
  error_json            TEXT NOT NULL DEFAULT '{}',
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, source_id, source_record_id, target_entity_type)
);

CREATE INDEX IF NOT EXISTS idx_seed_ingestion_records_run ON seed_ingestion_records(seed_run_id, record_status);

CREATE INDEX IF NOT EXISTS idx_seed_ingestion_records_source ON seed_ingestion_records(source_id, source_record_id);

CREATE INDEX IF NOT EXISTS idx_seed_ingestion_records_entity ON seed_ingestion_records(target_entity_type, target_entity_id);

CREATE INDEX IF NOT EXISTS idx_seed_ingestion_records_place ON seed_ingestion_records(primary_place_id);

CREATE TABLE IF NOT EXISTS seed_identity_map (
  id                    TEXT PRIMARY KEY,
  seed_run_id           TEXT NOT NULL REFERENCES seed_runs(id),
  source_id             TEXT NOT NULL REFERENCES seed_sources(id),
  source_record_id      TEXT NOT NULL,
  source_record_hash    TEXT,
  entity_type           TEXT NOT NULL CHECK (entity_type IN ('individual','organization','place','profile','vertical_profile','jurisdiction','other')),
  entity_id             TEXT NOT NULL,
  profile_id            TEXT,
  vertical_slug         TEXT,
  stable_key            TEXT NOT NULL,
  generation_method     TEXT NOT NULL DEFAULT 'sha256_v1',
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (source_id, source_record_id, entity_type)
);

CREATE INDEX IF NOT EXISTS idx_seed_identity_map_entity ON seed_identity_map(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_seed_identity_map_run ON seed_identity_map(seed_run_id);

CREATE INDEX IF NOT EXISTS idx_seed_identity_map_stable_key ON seed_identity_map(stable_key);

CREATE TABLE IF NOT EXISTS seed_place_resolutions (
  id                    TEXT PRIMARY KEY,
  seed_run_id           TEXT NOT NULL REFERENCES seed_runs(id),
  source_id             TEXT NOT NULL REFERENCES seed_sources(id),
  source_record_id      TEXT NOT NULL,
  input_state           TEXT,
  input_lga             TEXT,
  input_ward            TEXT,
  explicit_place_id     TEXT,
  resolved_place_id     TEXT REFERENCES places(id),
  resolution_level      TEXT NOT NULL CHECK (resolution_level IN ('explicit','ward','local_government_area','state','country','none')),
  confidence            TEXT NOT NULL CHECK (confidence IN ('official_verified','official_stale','public_high_confidence','field_partner_collected','market_estimate_placeholder')),
  status                TEXT NOT NULL DEFAULT 'unresolved' CHECK (status IN ('resolved','ambiguous','unresolved','rejected')),
  candidate_place_ids   TEXT NOT NULL DEFAULT '[]',
  notes                 TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, source_id, source_record_id)
);

CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_run ON seed_place_resolutions(seed_run_id, status);

CREATE INDEX IF NOT EXISTS idx_seed_place_resolutions_resolved ON seed_place_resolutions(resolved_place_id);

CREATE TABLE IF NOT EXISTS seed_search_rebuild_jobs (
  id                    TEXT PRIMARY KEY,
  seed_run_id           TEXT NOT NULL REFERENCES seed_runs(id),
  batch_name            TEXT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','superseded')),
  entity_type           TEXT,
  entity_count          INTEGER NOT NULL DEFAULT 0 CHECK (entity_count >= 0),
  search_entries_count  INTEGER NOT NULL DEFAULT 0 CHECK (search_entries_count >= 0),
  queued_at             INTEGER NOT NULL DEFAULT (unixepoch()),
  started_at            INTEGER,
  completed_at          INTEGER,
  fts_rebuilt_at        INTEGER,
  notes                 TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, batch_name)
);

CREATE INDEX IF NOT EXISTS idx_seed_search_rebuild_jobs_status ON seed_search_rebuild_jobs(status, queued_at);

CREATE INDEX IF NOT EXISTS idx_seed_search_rebuild_jobs_run ON seed_search_rebuild_jobs(seed_run_id);

CREATE TABLE IF NOT EXISTS seed_qa_query_library (
  id                    TEXT PRIMARY KEY,
  phase_id              TEXT NOT NULL,
  check_name            TEXT NOT NULL,
  severity              TEXT NOT NULL CHECK (severity IN ('info','warning','error','critical')),
  sql_text              TEXT NOT NULL,
  expected_result       TEXT NOT NULL,
  notes                 TEXT,
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (phase_id, check_name)
);

CREATE INDEX IF NOT EXISTS idx_seed_qa_query_library_phase ON seed_qa_query_library(phase_id, severity);

INSERT OR IGNORE INTO seed_runs (id, phase_id, phase_name, batch_name, environment, status, actor, source_manifest_uri, started_at, completed_at, rows_extracted, rows_inserted, rows_updated, rows_rejected, notes, created_at, updated_at) VALUES ('seed_run_s04_ingestion_tooling_20260421', 'S04', 'Ingestion Tooling, Seed Tenant, and Search Rebuild Readiness', 'ingestion-tooling-bootstrap', 'production', 'completed', 'replit-agent', 'docs/reports/phase-s04-ingestion-tooling-source-manifest-2026-04-21.md', unixepoch(), unixepoch(), 0, 14, 0, 0, 'Created deterministic nationwide seeding support tables, QA query library, search rebuild job tracking, and source identity/place-resolution staging required before high-volume entity batches.', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_sources (id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at) VALUES ('seed_source_webwaka_s04_ingestion_tooling_20260421', 'webwaka:s04-ingestion-tooling:2026-04-21', 'WebWaka Nationwide Seed Ingestion Tooling', 'WebWaka OS', 'internal', 'official_verified', 'infra/db/seed/scripts/nationwide_ingestion_tooling.ts', 'repository_script_and_sql', 'internal', '2026-04-21', unixepoch(), NULL, 'current', 'Deterministic source-to-ID, place resolution, duplicate detection, search-entry generation, FTS rebuild, and batch QA tooling for nationwide seeded data phases.', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_raw_artifacts (id, seed_run_id, source_id, artifact_type, file_path, content_hash, row_count, schema_json, extraction_script, status, created_at, updated_at) VALUES ('seed_artifact_s04_ingestion_tooling_script_20260421', 'seed_run_s04_ingestion_tooling_20260421', 'seed_source_webwaka_s04_ingestion_tooling_20260421', 'schema_map', 'infra/db/seed/scripts/nationwide_ingestion_tooling.ts', '844292b43e42a3d13fcac4c7bef6ce585f306d8424485d8a47bf89911d0ce8ac', 0, '{"exports":["stableWebwakaId","sourceStableKey","resolveMostSpecificPlace","findDuplicateCandidates","buildSearchEntry","S04_QA_QUERIES","SEARCH_FTS_REBUILD_SQL"]}', 'tsx infra/db/seed/scripts/nationwide_ingestion_tooling.ts --self-test', 'parsed', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_entity_sources (id, seed_run_id, source_id, artifact_id, dedupe_decision_id, entity_type, entity_id, profile_id, vertical_slug, source_record_id, source_record_hash, confidence, source_url, extracted_at, last_verified_at, verification_state, notes, created_at, updated_at) VALUES ('seed_entity_source_s04_org_platform_seed', 'seed_run_s04_ingestion_tooling_20260421', 'seed_source_webwaka_s04_ingestion_tooling_20260421', 'seed_artifact_s04_ingestion_tooling_script_20260421', NULL, 'organization', 'org_platform_seed', NULL, NULL, 'org_platform_seed', '7f7a47745871a9ff524bdcbb244f15e7858a7f44565bfb37e51eed636bc44bed', 'official_verified', 'infra/db/seed/scripts/nationwide_ingestion_tooling.ts', unixepoch(), unixepoch(), 'source_verified', 'S04 provenance link for the platform seed control-plane organization used by nationwide ingestion batches.', unixepoch(), unixepoch());

INSERT OR IGNORE INTO seed_qa_query_library (id, phase_id, check_name, severity, sql_text, expected_result, notes, created_at, updated_at) VALUES
('seed_qa_s04_root_entities_missing_source_links', 'S04', 'root_entities_missing_source_links', 'error', 'SELECT COUNT(*) AS failures FROM (SELECT ''individual'' AS entity_type, id AS entity_id FROM individuals WHERE tenant_id = ''tenant_platform_seed'' UNION ALL SELECT ''organization'', id FROM organizations WHERE tenant_id = ''tenant_platform_seed'') e WHERE NOT EXISTS (SELECT 1 FROM seed_entity_sources s WHERE s.entity_type = e.entity_type AND s.entity_id = e.entity_id)', '0', 'Every inserted platform-seed root individual/organization must have a provenance link.', unixepoch(), unixepoch()),
('seed_qa_s04_profiles_missing_primary_place', 'S04', 'profiles_missing_primary_place', 'error', 'SELECT COUNT(*) AS failures FROM profiles p WHERE p.claim_state IN (''seeded'',''claimable'') AND p.primary_place_id IS NULL', '0', 'Seeded/claimable profiles must resolve to the most specific valid primary_place_id.', unixepoch(), unixepoch()),
('seed_qa_s04_profiles_invalid_primary_place', 'S04', 'profiles_invalid_primary_place', 'error', 'SELECT COUNT(*) AS failures FROM profiles p LEFT JOIN places pl ON pl.id = p.primary_place_id WHERE p.primary_place_id IS NOT NULL AND pl.id IS NULL', '0', 'Profile primary_place_id values must reference existing places.', unixepoch(), unixepoch()),
('seed_qa_s04_seeded_profiles_missing_search_entry', 'S04', 'seeded_profiles_missing_search_entry', 'error', 'SELECT COUNT(*) AS failures FROM profiles p WHERE p.publication_state = ''published'' AND p.primary_place_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM search_entries s WHERE s.entity_type = p.subject_type AND s.entity_id = p.subject_id)', '0', 'Published seeded profiles with valid places must be represented in search_entries.', unixepoch(), unixepoch()),
('seed_qa_s04_unresolved_place_resolutions', 'S04', 'unresolved_place_resolutions', 'error', 'SELECT COUNT(*) AS failures FROM seed_place_resolutions WHERE status <> ''resolved''', '0', 'No approved batch should proceed with unresolved or ambiguous place resolutions.', unixepoch(), unixepoch()),
('seed_qa_s04_duplicate_source_identity_maps', 'S04', 'duplicate_source_identity_maps', 'error', 'SELECT COUNT(*) AS failures FROM (SELECT source_id, source_record_id, entity_type FROM seed_identity_map GROUP BY source_id, source_record_id, entity_type HAVING COUNT(*) > 1)', '0', 'A source record may map to only one canonical WebWaka entity per entity type.', unixepoch(), unixepoch()),
('seed_qa_s04_search_entries_invalid_place', 'S04', 'search_entries_invalid_place', 'error', 'SELECT COUNT(*) AS failures FROM search_entries se LEFT JOIN places p ON p.id = se.place_id WHERE se.place_id IS NOT NULL AND p.id IS NULL', '0', 'Search entries must not reference missing places.', unixepoch(), unixepoch()),
('seed_qa_s04_search_entries_blank_keywords', 'S04', 'search_entries_blank_keywords', 'error', 'SELECT COUNT(*) AS failures FROM search_entries WHERE visibility = ''public'' AND length(trim(keywords)) = 0', '0', 'Public search entries must include generated keywords.', unixepoch(), unixepoch());
