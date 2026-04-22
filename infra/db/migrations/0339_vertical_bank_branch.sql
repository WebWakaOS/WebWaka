-- 0339_vertical_bank_branch.sql
-- S12: Bank Branch vertical profile table
-- No 'bank' vertical existed in registry; OSM amenity=bank = branch locations
-- CBN-licensed banks (parent organizations) are already seeded in S07 (migration 0315)

CREATE TABLE IF NOT EXISTS bank_branch_profiles (
  id              TEXT    PRIMARY KEY,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  branch_name     TEXT    NOT NULL,
  bank_slug        TEXT,            -- e.g. 'access-bank', 'gtb', 'zenith', 'uba', 'fidelity'
  osm_node_id     TEXT,
  cbn_institution_code TEXT,       -- CBN 6-digit institution code (links to S07 CBN entry)
  swift_bic       TEXT,
  address         TEXT,
  phone           TEXT,
  atm_available   INTEGER NOT NULL DEFAULT 0,
  state           TEXT,
  lga             TEXT,
  opening_hours   TEXT,
  status          TEXT    NOT NULL DEFAULT 'seeded'
                  CHECK (status IN ('seeded','claimed','active','closed')),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bank_branch_profiles_tenant    ON bank_branch_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bank_branch_profiles_workspace ON bank_branch_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_bank_branch_profiles_state     ON bank_branch_profiles(state, tenant_id);
CREATE INDEX IF NOT EXISTS idx_bank_branch_profiles_bank      ON bank_branch_profiles(bank_slug);
CREATE INDEX IF NOT EXISTS idx_bank_branch_profiles_osm       ON bank_branch_profiles(osm_node_id);

-- Register bank-branch vertical
INSERT OR IGNORE INTO verticals (id, slug, display_name, category, subcategory, priority, status,
  entity_type, fsm_states, required_kyc_tier, requires_frsc, requires_cac, requires_it,
  requires_community, requires_social, package_name, milestone_target, notes)
VALUES (
  'vtx_bank_branch', 'bank-branch', 'Bank Branch / ATM Location', 'financial', 'banking',
  2, 'planned', 'organization',
  '["seeded","claimed","active"]', 2, 0, 1, 0, 0, 0,
  'packages/verticals-bank-branch', 'M9',
  'Branch locator; hours; ATM availability; CBN parent institution link'
);

INSERT OR REPLACE INTO vertical_seedability_matrix (
  vertical_slug, profile_status, profile_table, profile_migration, profile_column_count,
  requires_sidecar_enrichment, seedability_status, seedability_notes, created_at, updated_at
) VALUES (
  'bank-branch', 'exists', 'bank_branch_profiles',
  'apps/api/migrations/0339_vertical_bank_branch.sql',
  17, 1, 'seedable_with_sidecar',
  'bank_branch_profiles added (0339). OSM Nigeria amenity=bank seeded S12. CBN parent orgs in S07 (0315). cbn_institution_code links branches to parent bank entity.',
  unixepoch(), unixepoch()
);
