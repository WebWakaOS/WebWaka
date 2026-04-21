INSERT OR IGNORE INTO tenants (id, name, plan, status, created_at, updated_at)
VALUES ('tenant_platform_seed', 'WebWaka Platform Seed Tenant', 'enterprise', 'active', unixepoch(), unixepoch());

INSERT OR IGNORE INTO organizations (id, tenant_id, name, registration_number, verification_state, created_at, updated_at)
VALUES ('org_platform_seed', 'tenant_platform_seed', 'WebWaka Platform Seed Control Plane', NULL, 'unverified', unixepoch(), unixepoch());

INSERT OR IGNORE INTO workspaces (
  id, tenant_id, name, owner_type, owner_id, subscription_plan, subscription_status, active_layers, created_at, updated_at
) VALUES (
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  'WebWaka Nationwide Seed Discovery Workspace',
  'organization',
  'org_platform_seed',
  'enterprise',
  'active',
  '["discovery"]',
  unixepoch(),
  unixepoch()
);

CREATE TABLE IF NOT EXISTS seed_runs (
  id                  TEXT PRIMARY KEY,
  phase_id            TEXT NOT NULL,
  phase_name          TEXT NOT NULL,
  batch_name          TEXT NOT NULL,
  environment         TEXT NOT NULL DEFAULT 'development'
                      CHECK (environment IN ('development','staging','production')),
  status              TEXT NOT NULL DEFAULT 'planned'
                      CHECK (status IN ('planned','running','completed','failed','rolled_back','superseded')),
  actor               TEXT,
  source_manifest_uri TEXT,
  started_at          INTEGER,
  completed_at        INTEGER,
  rows_extracted      INTEGER NOT NULL DEFAULT 0 CHECK (rows_extracted >= 0),
  rows_inserted       INTEGER NOT NULL DEFAULT 0 CHECK (rows_inserted >= 0),
  rows_updated        INTEGER NOT NULL DEFAULT 0 CHECK (rows_updated >= 0),
  rows_rejected       INTEGER NOT NULL DEFAULT 0 CHECK (rows_rejected >= 0),
  notes               TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_seed_runs_phase ON seed_runs(phase_id, status);
CREATE INDEX IF NOT EXISTS idx_seed_runs_environment ON seed_runs(environment, status);
CREATE INDEX IF NOT EXISTS idx_seed_runs_created ON seed_runs(created_at);

CREATE TABLE IF NOT EXISTS seed_sources (
  id                 TEXT PRIMARY KEY,
  source_key         TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  owner              TEXT,
  source_type        TEXT NOT NULL
                     CHECK (source_type IN ('official_regulator','official_government','official_association','public_directory','map_directory','field_collection','partner_submission','market_estimate','internal')),
  confidence         TEXT NOT NULL
                     CHECK (confidence IN ('official_verified','official_stale','public_high_confidence','field_partner_collected','market_estimate_placeholder')),
  url                TEXT,
  access_method      TEXT,
  license            TEXT,
  publication_date   TEXT,
  retrieved_at       INTEGER,
  source_hash        TEXT,
  freshness_status   TEXT NOT NULL DEFAULT 'unknown'
                     CHECK (freshness_status IN ('current','stale','superseded','unknown')),
  notes              TEXT,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_seed_sources_type ON seed_sources(source_type, confidence);
CREATE INDEX IF NOT EXISTS idx_seed_sources_owner ON seed_sources(owner);
CREATE INDEX IF NOT EXISTS idx_seed_sources_retrieved ON seed_sources(retrieved_at);

CREATE TABLE IF NOT EXISTS seed_raw_artifacts (
  id                 TEXT PRIMARY KEY,
  seed_run_id        TEXT NOT NULL REFERENCES seed_runs(id),
  source_id          TEXT NOT NULL REFERENCES seed_sources(id),
  artifact_type      TEXT NOT NULL
                     CHECK (artifact_type IN ('raw','normalized','extract','report','screenshot','schema_map','manual_review')),
  file_path          TEXT NOT NULL,
  content_hash       TEXT NOT NULL,
  row_count          INTEGER CHECK (row_count IS NULL OR row_count >= 0),
  schema_json        TEXT NOT NULL DEFAULT '{}',
  extraction_script  TEXT,
  status             TEXT NOT NULL DEFAULT 'captured'
                     CHECK (status IN ('captured','parsed','failed','superseded')),
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, source_id, artifact_type, file_path)
);

CREATE INDEX IF NOT EXISTS idx_seed_raw_artifacts_run ON seed_raw_artifacts(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_raw_artifacts_source ON seed_raw_artifacts(source_id);
CREATE INDEX IF NOT EXISTS idx_seed_raw_artifacts_hash ON seed_raw_artifacts(content_hash);

CREATE TABLE IF NOT EXISTS seed_dedupe_decisions (
  id                 TEXT PRIMARY KEY,
  seed_run_id        TEXT NOT NULL REFERENCES seed_runs(id),
  entity_type        TEXT NOT NULL
                     CHECK (entity_type IN ('individual','organization','place','profile','vertical_profile','jurisdiction','other')),
  canonical_key      TEXT NOT NULL,
  candidate_keys     TEXT NOT NULL DEFAULT '[]',
  decision           TEXT NOT NULL
                     CHECK (decision IN ('canonical','merge','reject','manual_review','split')),
  confidence         TEXT NOT NULL
                     CHECK (confidence IN ('official_verified','official_stale','public_high_confidence','field_partner_collected','market_estimate_placeholder')),
  reason             TEXT NOT NULL,
  decided_by         TEXT,
  decided_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (seed_run_id, entity_type, canonical_key)
);

CREATE INDEX IF NOT EXISTS idx_seed_dedupe_run ON seed_dedupe_decisions(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_dedupe_entity ON seed_dedupe_decisions(entity_type, canonical_key);
CREATE INDEX IF NOT EXISTS idx_seed_dedupe_decision ON seed_dedupe_decisions(decision, confidence);

CREATE TABLE IF NOT EXISTS seed_entity_sources (
  id                  TEXT PRIMARY KEY,
  seed_run_id         TEXT NOT NULL REFERENCES seed_runs(id),
  source_id           TEXT NOT NULL REFERENCES seed_sources(id),
  artifact_id         TEXT REFERENCES seed_raw_artifacts(id),
  dedupe_decision_id  TEXT REFERENCES seed_dedupe_decisions(id),
  entity_type         TEXT NOT NULL
                      CHECK (entity_type IN ('individual','organization','place','profile','vertical_profile','jurisdiction','search_entry','other')),
  entity_id           TEXT NOT NULL,
  profile_id          TEXT,
  vertical_slug       TEXT,
  source_record_id    TEXT,
  source_record_hash  TEXT,
  confidence          TEXT NOT NULL
                      CHECK (confidence IN ('official_verified','official_stale','public_high_confidence','field_partner_collected','market_estimate_placeholder')),
  source_url          TEXT,
  extracted_at        INTEGER,
  last_verified_at    INTEGER,
  verification_state  TEXT NOT NULL DEFAULT 'unverified'
                      CHECK (verification_state IN ('unverified','source_verified','conflict','stale','rejected')),
  notes               TEXT,
  created_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (source_id, source_record_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_run ON seed_entity_sources(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_source ON seed_entity_sources(source_id);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_entity ON seed_entity_sources(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_profile ON seed_entity_sources(profile_id);
CREATE INDEX IF NOT EXISTS idx_seed_entity_sources_vertical ON seed_entity_sources(vertical_slug, confidence);

CREATE TABLE IF NOT EXISTS seed_enrichment (
  id                 TEXT PRIMARY KEY,
  seed_run_id        TEXT NOT NULL REFERENCES seed_runs(id),
  entity_type        TEXT NOT NULL
                     CHECK (entity_type IN ('individual','organization','place','profile','vertical_profile','jurisdiction','other')),
  entity_id          TEXT NOT NULL,
  profile_id         TEXT,
  vertical_slug      TEXT,
  source_id          TEXT REFERENCES seed_sources(id),
  enrichment_json    TEXT NOT NULL,
  pii_classification TEXT NOT NULL DEFAULT 'public'
                     CHECK (pii_classification IN ('public','non_sensitive','sensitive','restricted')),
  lawful_basis       TEXT,
  last_reviewed_at   INTEGER,
  created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (entity_type, entity_id, vertical_slug)
);

CREATE INDEX IF NOT EXISTS idx_seed_enrichment_run ON seed_enrichment(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_enrichment_entity ON seed_enrichment(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_seed_enrichment_profile ON seed_enrichment(profile_id);
CREATE INDEX IF NOT EXISTS idx_seed_enrichment_vertical ON seed_enrichment(vertical_slug);

CREATE TABLE IF NOT EXISTS seed_coverage_snapshots (
  id                              TEXT PRIMARY KEY,
  seed_run_id                     TEXT NOT NULL REFERENCES seed_runs(id),
  vertical_slug                   TEXT,
  category                        TEXT,
  state_place_id                  TEXT REFERENCES places(id),
  lga_place_id                    TEXT REFERENCES places(id),
  ward_place_id                   TEXT REFERENCES places(id),
  confidence                      TEXT NOT NULL
                                  CHECK (confidence IN ('official_verified','official_stale','public_high_confidence','field_partner_collected','market_estimate_placeholder')),
  total_entities                  INTEGER NOT NULL DEFAULT 0 CHECK (total_entities >= 0),
  official_verified_count         INTEGER NOT NULL DEFAULT 0 CHECK (official_verified_count >= 0),
  official_stale_count            INTEGER NOT NULL DEFAULT 0 CHECK (official_stale_count >= 0),
  public_high_confidence_count    INTEGER NOT NULL DEFAULT 0 CHECK (public_high_confidence_count >= 0),
  field_partner_count             INTEGER NOT NULL DEFAULT 0 CHECK (field_partner_count >= 0),
  market_estimate_count           INTEGER NOT NULL DEFAULT 0 CHECK (market_estimate_count >= 0),
  gaps_json                       TEXT NOT NULL DEFAULT '{}',
  snapshot_at                     INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at                      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_seed_coverage_run ON seed_coverage_snapshots(seed_run_id);
CREATE INDEX IF NOT EXISTS idx_seed_coverage_vertical ON seed_coverage_snapshots(vertical_slug, confidence);
CREATE INDEX IF NOT EXISTS idx_seed_coverage_state ON seed_coverage_snapshots(state_place_id, vertical_slug);
CREATE INDEX IF NOT EXISTS idx_seed_coverage_lga ON seed_coverage_snapshots(lga_place_id, vertical_slug);
CREATE INDEX IF NOT EXISTS idx_seed_coverage_snapshot ON seed_coverage_snapshots(snapshot_at);

INSERT OR IGNORE INTO seed_runs (
  id, phase_id, phase_name, batch_name, environment, status, actor, rows_inserted, notes, created_at, updated_at
) VALUES (
  'seed_run_s00_control_plane_20260421',
  'S00',
  'Seeding Control Plane and Provenance Foundation',
  'control-plane-bootstrap',
  'production',
  'completed',
  'replit-agent',
  3,
  'Bootstrapped platform seed tenant, seed organization, seed discovery workspace, and provenance metadata tables for nationwide entity seeding.',
  unixepoch(),
  unixepoch()
);

INSERT OR IGNORE INTO seed_sources (
  id, source_key, name, owner, source_type, confidence, url, access_method, license, publication_date, retrieved_at, source_hash, freshness_status, notes, created_at, updated_at
) VALUES (
  'seed_source_webwaka_s00_plan_20260421',
  'webwaka:nationwide-seeding-plan:2026-04-21',
  'WebWaka OS Nationwide Entity Seeding Implementation Plan',
  'WebWaka OS',
  'internal',
  'official_verified',
  'docs/planning/nationwide-entity-seeding-implementation-plan-2026-04-21.md',
  'repository_document',
  'internal',
  '2026-04-21',
  unixepoch(),
  NULL,
  'current',
  'Canonical implementation plan for rigorous phase-by-phase nationwide entity seeding.',
  unixepoch(),
  unixepoch()
);
