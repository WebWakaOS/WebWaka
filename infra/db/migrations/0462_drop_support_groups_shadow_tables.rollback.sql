-- Rollback 0462: Restore support_groups_* shadow tables + revert fundraising column
--
-- WARNING: This rollback recreates the shadow table STRUCTURES only.
-- Data written to groups_* after migration 0462 ran will NOT be in the restored
-- support_groups_* tables. Only apply this rollback before any new group data is written.
--
-- Rollback steps (reverse order):
--   (a) Re-create support_groups_* shadow tables from groups_* current data
--   (b) Revert search_entries entity_type 'group' → 'support_group'
--   (c) Revert fundraising_campaigns.group_id → support_group_id

-- ============================================================
-- Step 1: Restore fundraising_campaigns column name
-- ============================================================

ALTER TABLE fundraising_campaigns RENAME COLUMN group_id TO support_group_id;

-- ============================================================
-- Step 2: Revert search_entries entity_type backfill
-- ============================================================

UPDATE search_entries
SET entity_type = 'support_group'
WHERE entity_type = 'group';

-- ============================================================
-- Step 3: Recreate support_groups shadow table
-- ============================================================

CREATE TABLE IF NOT EXISTS support_groups (
  id                    TEXT    NOT NULL,
  workspace_id          TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  name                  TEXT    NOT NULL,
  slug                  TEXT    NOT NULL,
  description           TEXT,
  group_type            TEXT    NOT NULL DEFAULT 'general',
  hierarchy_level       TEXT,
  parent_group_id       TEXT,
  place_id              TEXT,
  state_code            TEXT,
  lga_code              TEXT,
  ward_code             TEXT,
  polling_unit_code     TEXT,
  member_count          INTEGER NOT NULL DEFAULT 0,
  volunteer_count       INTEGER NOT NULL DEFAULT 0,
  visibility            TEXT    NOT NULL DEFAULT 'public',
  join_policy           TEXT    NOT NULL DEFAULT 'open',
  status                TEXT    NOT NULL DEFAULT 'active',
  politician_id         TEXT,
  campaign_office_id    TEXT,
  logo_url              TEXT,
  cover_url             TEXT,
  constitution_url      TEXT,
  website_url           TEXT,
  ndpr_consent_required INTEGER NOT NULL DEFAULT 0,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_groups
  (id, workspace_id, tenant_id, name, slug, description, group_type,
   hierarchy_level, parent_group_id, place_id, state_code, lga_code, ward_code,
   polling_unit_code, member_count, volunteer_count, visibility, join_policy,
   status, logo_url, cover_url, constitution_url, website_url,
   ndpr_consent_required, created_at, updated_at)
SELECT
  id, workspace_id, tenant_id, name, slug, description, category,
  hierarchy_level, parent_group_id, place_id, state_code, lga_code, ward_code,
  polling_unit_code, member_count, volunteer_count, visibility, join_policy,
  status, logo_url, cover_url, constitution_url, website_url,
  ndpr_consent_required, created_at, updated_at
FROM groups;

-- ============================================================
-- Step 4: Recreate support_group_members shadow table
-- ============================================================

CREATE TABLE IF NOT EXISTS support_group_members (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  profile_id   TEXT    NOT NULL,
  role         TEXT    NOT NULL DEFAULT 'member',
  status       TEXT    NOT NULL DEFAULT 'active',
  joined_at    INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (group_id) REFERENCES support_groups(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO support_group_members
  SELECT * FROM group_members;

-- ============================================================
-- Step 5: Recreate remaining shadow tables (structure only, data from groups_*)
-- ============================================================

CREATE TABLE IF NOT EXISTS support_group_meetings (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  meeting_type TEXT    NOT NULL DEFAULT 'general',
  status       TEXT    NOT NULL DEFAULT 'scheduled',
  scheduled_at INTEGER NOT NULL,
  location     TEXT,
  agenda       TEXT,
  minutes      TEXT,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_meetings SELECT * FROM group_meetings;

CREATE TABLE IF NOT EXISTS support_group_resolutions (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  meeting_id   TEXT,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  body         TEXT    NOT NULL,
  resolved_by  TEXT,
  resolved_at  INTEGER NOT NULL,
  created_at   INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_resolutions SELECT * FROM group_resolutions;

CREATE TABLE IF NOT EXISTS support_group_broadcasts (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  subject      TEXT    NOT NULL,
  body         TEXT    NOT NULL,
  channel      TEXT    NOT NULL DEFAULT 'in_app',
  audience     TEXT    NOT NULL DEFAULT 'all',
  status       TEXT    NOT NULL DEFAULT 'queued',
  sent_by      TEXT    NOT NULL,
  sent_at      INTEGER,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_broadcasts SELECT * FROM group_broadcasts;

CREATE TABLE IF NOT EXISTS support_group_events (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  event_type   TEXT    NOT NULL DEFAULT 'general',
  status       TEXT    NOT NULL DEFAULT 'scheduled',
  starts_at    INTEGER NOT NULL,
  ends_at      INTEGER,
  location     TEXT,
  description  TEXT,
  max_rsvps    INTEGER,
  rsvp_count   INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_events SELECT * FROM group_events;

CREATE TABLE IF NOT EXISTS support_group_event_rsvps (
  id           TEXT    NOT NULL,
  event_id     TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  profile_id   TEXT    NOT NULL,
  rsvp_status  TEXT    NOT NULL DEFAULT 'attending',
  created_at   INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_event_rsvps SELECT * FROM group_event_rsvps;

CREATE TABLE IF NOT EXISTS support_group_petitions (
  id               TEXT    NOT NULL,
  group_id         TEXT    NOT NULL,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  title            TEXT    NOT NULL,
  body             TEXT    NOT NULL,
  target           TEXT,
  signature_count  INTEGER NOT NULL DEFAULT 0,
  goal             INTEGER,
  status           TEXT    NOT NULL DEFAULT 'open',
  created_by       TEXT    NOT NULL,
  closes_at        INTEGER,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_petitions SELECT * FROM group_petitions;

CREATE TABLE IF NOT EXISTS support_group_petition_signatures (
  id           TEXT    NOT NULL,
  petition_id  TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  profile_id   TEXT    NOT NULL,
  signed_at    INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_petition_signatures SELECT * FROM group_petition_signatures;

CREATE TABLE IF NOT EXISTS support_group_assets (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  asset_type   TEXT    NOT NULL DEFAULT 'equipment',
  value_kobo   INTEGER NOT NULL DEFAULT 0,
  description  TEXT,
  acquired_at  INTEGER,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_assets SELECT * FROM group_assets;

CREATE TABLE IF NOT EXISTS support_group_analytics (
  id                   TEXT    NOT NULL,
  group_id             TEXT    NOT NULL,
  workspace_id         TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  period_start         INTEGER NOT NULL,
  period_end           INTEGER NOT NULL,
  members_joined       INTEGER NOT NULL DEFAULT 0,
  members_active       INTEGER NOT NULL DEFAULT 0,
  meetings_held        INTEGER NOT NULL DEFAULT 0,
  broadcasts_sent      INTEGER NOT NULL DEFAULT 0,
  events_held          INTEGER NOT NULL DEFAULT 0,
  gotv_mobilized       INTEGER NOT NULL DEFAULT 0,
  gotv_voted           INTEGER NOT NULL DEFAULT 0,
  petitions_opened     INTEGER NOT NULL DEFAULT 0,
  petition_signatures  INTEGER NOT NULL DEFAULT 0,
  created_at           INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_analytics SELECT * FROM group_analytics;

CREATE TABLE IF NOT EXISTS support_group_executive_roles (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  profile_id   TEXT    NOT NULL,
  role_title   TEXT    NOT NULL,
  started_at   INTEGER NOT NULL,
  ended_at     INTEGER,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_executive_roles SELECT * FROM group_executive_roles;

CREATE TABLE IF NOT EXISTS support_group_committees (
  id               TEXT    NOT NULL,
  group_id         TEXT    NOT NULL,
  workspace_id     TEXT    NOT NULL,
  tenant_id        TEXT    NOT NULL,
  name             TEXT    NOT NULL,
  committee_type   TEXT    NOT NULL DEFAULT 'ad_hoc',
  mandate          TEXT,
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_committees SELECT * FROM group_committees;

CREATE TABLE IF NOT EXISTS support_group_committee_members (
  id            TEXT    NOT NULL,
  committee_id  TEXT    NOT NULL,
  group_id      TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  profile_id    TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'member',
  joined_at     INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO support_group_committee_members SELECT * FROM group_committee_members;
