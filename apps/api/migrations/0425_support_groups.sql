-- Migration: 0390_support_groups
-- WebWaka Election Support Group Management System — full schema.
-- Pillar 1: Operations backbone for support groups.
--
-- Platform Invariants:
--   T3  — tenant_id on every table, every index
--   T4  — all monetary values in integer kobo
--   P9  — no REAL/FLOAT columns
--   P13 — voter_id and contact PII never forwarded to AI
--
-- Assumption (inline, no legal deferral):
--   Nigerian political support groups operate at 5 hierarchy levels:
--   national / state / lga / ward / polling_unit.
--   The hierarchy is self-referencing via parent_group_id.
--   Non-political groups (community, professional, church, NGO) use
--   hierarchy_level = NULL and parent_group_id = NULL.

-- ---------------------------------------------------------------------------
-- Core support group entity
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_groups (
  id                   TEXT    PRIMARY KEY,
  workspace_id         TEXT    NOT NULL REFERENCES workspaces(id),
  tenant_id            TEXT    NOT NULL,
  name                 TEXT    NOT NULL,
  slug                 TEXT    NOT NULL,
  description          TEXT,
  -- group_type covers all verticals (not just political)
  group_type           TEXT    NOT NULL DEFAULT 'general',
  -- TEXT not enum — app-layer validation only
  -- valid values: general|election|political|civic|professional|church|ngo|community
  hierarchy_level      TEXT,
  -- national|state|lga|ward|polling_unit|NULL (for non-hierarchical groups)
  parent_group_id      TEXT    REFERENCES support_groups(id),
  place_id             TEXT,
  state_code           TEXT,
  lga_code             TEXT,
  ward_code            TEXT,
  polling_unit_code    TEXT,
  member_count         INTEGER NOT NULL DEFAULT 0,
  volunteer_count      INTEGER NOT NULL DEFAULT 0,
  visibility           TEXT    NOT NULL DEFAULT 'public',
  -- public|private|invite_only
  join_policy          TEXT    NOT NULL DEFAULT 'open',
  -- open|approval|invite_only
  status               TEXT    NOT NULL DEFAULT 'active',
  -- active|suspended|archived
  -- Political linkage (nullable — non-political groups leave these null)
  politician_id        TEXT,
  campaign_office_id   TEXT,
  -- Public branding
  logo_url             TEXT,
  cover_url            TEXT,
  constitution_url     TEXT,
  website_url          TEXT,
  -- NDPR
  ndpr_consent_required INTEGER NOT NULL DEFAULT 0,
  created_at           INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at           INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_groups_slug_tenant
  ON support_groups(slug, tenant_id);

CREATE INDEX IF NOT EXISTS idx_support_groups_tenant
  ON support_groups(tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_support_groups_workspace
  ON support_groups(workspace_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_support_groups_parent
  ON support_groups(parent_group_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_support_groups_place
  ON support_groups(place_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_support_groups_hierarchy
  ON support_groups(hierarchy_level, state_code, lga_code, ward_code, tenant_id);

-- ---------------------------------------------------------------------------
-- Members and volunteers
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_members (
  id            TEXT    PRIMARY KEY,
  group_id      TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  user_id       TEXT    NOT NULL,
  -- chair|secretary|treasurer|executive|coordinator|mobilizer|member|volunteer
  role          TEXT    NOT NULL DEFAULT 'member',
  -- pending|active|suspended|expelled
  status        TEXT    NOT NULL DEFAULT 'active',
  ward_code     TEXT,
  polling_unit_code TEXT,
  joined_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  approved_by   TEXT,
  approved_at   INTEGER,
  ndpr_consented INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_support_group_members_user_group
  ON support_group_members(user_id, group_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_support_group_members_group
  ON support_group_members(group_id, tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_support_group_members_user
  ON support_group_members(user_id, tenant_id);

-- ---------------------------------------------------------------------------
-- Executive roles
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_executive_roles (
  id           TEXT    PRIMARY KEY,
  group_id     TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  member_id    TEXT    NOT NULL REFERENCES support_group_members(id),
  -- chairman|secretary_general|financial_secretary|pro|women_leader|youth_leader|coordinator|patron
  role_title   TEXT    NOT NULL,
  start_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  end_at       INTEGER,
  appointed_by TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sg_exec_roles_group
  ON support_group_executive_roles(group_id, tenant_id);

-- ---------------------------------------------------------------------------
-- Meetings (general, executive, AGM, rallies, town halls)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_meetings (
  id           TEXT    PRIMARY KEY,
  group_id     TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  agenda       TEXT,
  -- general|executive|emergency|agm|rally|townhall|training|mobilization
  meeting_type TEXT    NOT NULL DEFAULT 'general',
  venue        TEXT,
  place_id     TEXT,
  starts_at    INTEGER NOT NULL,
  ends_at      INTEGER,
  is_virtual   INTEGER NOT NULL DEFAULT 0,
  join_url     TEXT,
  -- scheduled|ongoing|completed|cancelled
  status       TEXT    NOT NULL DEFAULT 'scheduled',
  minutes_url  TEXT,
  quorum_met   INTEGER,
  attendance   INTEGER NOT NULL DEFAULT 0,
  created_by   TEXT    NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sg_meetings_group
  ON support_group_meetings(group_id, tenant_id, starts_at DESC);

-- ---------------------------------------------------------------------------
-- Resolutions
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_resolutions (
  id             TEXT    PRIMARY KEY,
  group_id       TEXT    NOT NULL REFERENCES support_groups(id),
  meeting_id     TEXT    REFERENCES support_group_meetings(id),
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  title          TEXT    NOT NULL,
  body           TEXT    NOT NULL,
  resolution_ref TEXT,
  -- passed|failed|tabled|withdrawn
  status         TEXT    NOT NULL DEFAULT 'passed',
  -- voice_vote|show_of_hands|ballot|consensus
  passed_by      TEXT    NOT NULL DEFAULT 'voice_vote',
  recorded_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  recorded_by    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sg_resolutions_group
  ON support_group_resolutions(group_id, tenant_id, recorded_at DESC);

-- ---------------------------------------------------------------------------
-- Committees
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_committees (
  id            TEXT    PRIMARY KEY,
  group_id      TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  name          TEXT    NOT NULL,
  mandate       TEXT,
  -- standing|ad_hoc|special|disciplinary|finance|welfare|publicity
  committee_type TEXT   NOT NULL DEFAULT 'ad_hoc',
  chair_member_id TEXT,
  status        TEXT    NOT NULL DEFAULT 'active',
  formed_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  dissolved_at  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sg_committees_group
  ON support_group_committees(group_id, tenant_id);

CREATE TABLE IF NOT EXISTS support_group_committee_members (
  id            TEXT    PRIMARY KEY,
  committee_id  TEXT    NOT NULL REFERENCES support_group_committees(id),
  group_id      TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  member_id     TEXT    NOT NULL REFERENCES support_group_members(id),
  committee_role TEXT   NOT NULL DEFAULT 'member',
  joined_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ---------------------------------------------------------------------------
-- Broadcasts (in-app, SMS, WhatsApp-aware, email)
-- Assumption: WhatsApp delivery is routed via Meta Business API through
-- apps/notificator channel provider. No deferral for Meta review;
-- the channel is implemented with the adapter pattern and falls back to SMS.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_broadcasts (
  id            TEXT    PRIMARY KEY,
  group_id      TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  sender_id     TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  body          TEXT    NOT NULL,
  -- in_app|sms|whatsapp|email|ussd_push
  channel       TEXT    NOT NULL DEFAULT 'in_app',
  -- all|executive|volunteers|members_only|ward_coordinators
  audience      TEXT    NOT NULL DEFAULT 'all',
  -- queued|sending|sent|failed
  status        TEXT    NOT NULL DEFAULT 'queued',
  sent_count    INTEGER NOT NULL DEFAULT 0,
  failed_count  INTEGER NOT NULL DEFAULT 0,
  scheduled_at  INTEGER,
  sent_at       INTEGER,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sg_broadcasts_group
  ON support_group_broadcasts(group_id, tenant_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Events (rallies, town halls, mobilization drives)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_events (
  id              TEXT    PRIMARY KEY,
  group_id        TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  title           TEXT    NOT NULL,
  description     TEXT,
  -- rally|townhall|workshop|training|mobilization|press_conference|fundraiser
  event_type      TEXT    NOT NULL DEFAULT 'rally',
  venue           TEXT,
  place_id        TEXT,
  state_code      TEXT,
  lga_code        TEXT,
  ward_code       TEXT,
  starts_at       INTEGER NOT NULL,
  ends_at         INTEGER,
  expected_count  INTEGER,
  actual_count    INTEGER,
  -- scheduled|ongoing|completed|cancelled
  status          TEXT    NOT NULL DEFAULT 'scheduled',
  is_public       INTEGER NOT NULL DEFAULT 1,
  rsvp_count      INTEGER NOT NULL DEFAULT 0,
  created_by      TEXT    NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sg_events_group
  ON support_group_events(group_id, tenant_id, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_sg_events_public
  ON support_group_events(is_public, tenant_id, starts_at DESC);

CREATE TABLE IF NOT EXISTS support_group_event_rsvps (
  id            TEXT    PRIMARY KEY,
  event_id      TEXT    NOT NULL REFERENCES support_group_events(id),
  group_id      TEXT    NOT NULL,
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  user_id       TEXT    NOT NULL,
  -- going|maybe|not_going
  status        TEXT    NOT NULL DEFAULT 'going',
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sg_event_rsvps_user
  ON support_group_event_rsvps(user_id, event_id, tenant_id);

-- ---------------------------------------------------------------------------
-- GOTV — Get Out The Vote tracking
-- P13: voter_id is a local reference only; never forwarded to AI
-- Assumption: INEC voter registration numbers are stored encrypted at the
-- infrastructure layer. This table stores only opaque local references.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_gotv_records (
  id                    TEXT    PRIMARY KEY,
  group_id              TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id          TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  -- P13: voter_id is opaque local reference only, never sent to AI
  voter_ref             TEXT    NOT NULL,
  polling_unit_code     TEXT    NOT NULL,
  state_code            TEXT,
  lga_code              TEXT,
  ward_code             TEXT,
  coordinator_member_id TEXT    NOT NULL,
  accredited            INTEGER NOT NULL DEFAULT 0,
  voted                 INTEGER NOT NULL DEFAULT 0,
  mobilized_at          INTEGER NOT NULL DEFAULT (unixepoch()),
  vote_confirmed_at     INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sg_gotv_group
  ON support_group_gotv_records(group_id, tenant_id, polling_unit_code);

CREATE INDEX IF NOT EXISTS idx_sg_gotv_coordinator
  ON support_group_gotv_records(coordinator_member_id, tenant_id);

-- ---------------------------------------------------------------------------
-- Petitions and issue desk
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_petitions (
  id              TEXT    PRIMARY KEY,
  group_id        TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  title           TEXT    NOT NULL,
  body            TEXT    NOT NULL,
  target          TEXT,
  signature_count INTEGER NOT NULL DEFAULT 0,
  -- open|closed|submitted|resolved
  status          TEXT    NOT NULL DEFAULT 'open',
  created_by      TEXT    NOT NULL,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  closed_at       INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sg_petitions_group
  ON support_group_petitions(group_id, tenant_id, status);

CREATE TABLE IF NOT EXISTS support_group_petition_signatures (
  id          TEXT    PRIMARY KEY,
  petition_id TEXT    NOT NULL REFERENCES support_group_petitions(id),
  group_id    TEXT    NOT NULL,
  workspace_id TEXT   NOT NULL,
  tenant_id   TEXT    NOT NULL,
  user_id     TEXT    NOT NULL,
  signed_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sg_signatures_user
  ON support_group_petition_signatures(user_id, petition_id, tenant_id);

-- ---------------------------------------------------------------------------
-- Asset and logistics tracking
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_assets (
  id            TEXT    PRIMARY KEY,
  group_id      TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id  TEXT    NOT NULL,
  tenant_id     TEXT    NOT NULL,
  asset_name    TEXT    NOT NULL,
  -- material|vehicle|equipment|uniform|branded_item|funds
  asset_type    TEXT    NOT NULL DEFAULT 'material',
  quantity      INTEGER NOT NULL DEFAULT 1,
  quantity_unit TEXT    NOT NULL DEFAULT 'unit',
  custodian_member_id TEXT,
  -- available|in_use|depleted|lost|returned
  status        TEXT    NOT NULL DEFAULT 'available',
  -- T4: integer kobo
  value_kobo    INTEGER NOT NULL DEFAULT 0,
  notes         TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_sg_assets_group
  ON support_group_assets(group_id, tenant_id, status);

-- ---------------------------------------------------------------------------
-- Analytics rollup (denormalized for fast dashboard reads)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS support_group_analytics (
  id              TEXT    PRIMARY KEY,
  group_id        TEXT    NOT NULL REFERENCES support_groups(id),
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  period_date     TEXT    NOT NULL, -- YYYY-MM-DD
  new_members     INTEGER NOT NULL DEFAULT 0,
  active_members  INTEGER NOT NULL DEFAULT 0,
  broadcasts_sent INTEGER NOT NULL DEFAULT 0,
  events_held     INTEGER NOT NULL DEFAULT 0,
  gotv_mobilized  INTEGER NOT NULL DEFAULT 0,
  gotv_voted      INTEGER NOT NULL DEFAULT 0,
  signatures_collected INTEGER NOT NULL DEFAULT 0,
  computed_at     INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sg_analytics_period
  ON support_group_analytics(group_id, period_date, tenant_id);
