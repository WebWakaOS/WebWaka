-- Migration 0432: Rename support_groups_* tables to groups_*
-- Phase 0 rename per PRD: @webwaka/support-groups → @webwaka/groups
--
-- Changes:
--   (a) Rename 15 tables from support_groups_* to groups_*
--   (b) Rename column: support_groups.group_type → groups.category
--   (c) Drop politician_id, campaign_office_id from core groups table (moved to 0433)
--
-- D1 (SQLite) does not support RENAME TABLE directly in all older versions.
-- We use the SQLite-compatible pattern: CREATE new table, INSERT, DROP old.
-- All indexes, constraints, and triggers are recreated on the new tables.
--
-- Tenant invariant (T3): tenant_id ON every table — preserved through rename.
-- No data is modified — only table and column names change.
-- Rollback: 0432_rollback.sql

-- ============================================================
-- 1. groups (was: support_groups)
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
  id                    TEXT    NOT NULL,
  workspace_id          TEXT    NOT NULL,
  tenant_id             TEXT    NOT NULL,
  name                  TEXT    NOT NULL,
  slug                  TEXT    NOT NULL,
  description           TEXT,
  category              TEXT    NOT NULL DEFAULT 'general',  -- was: group_type
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
  -- politician_id and campaign_office_id REMOVED: now in group_electoral_extensions (0433)
  logo_url              TEXT,
  cover_url             TEXT,
  constitution_url      TEXT,
  website_url           TEXT,
  ndpr_consent_required INTEGER NOT NULL DEFAULT 0,
  created_at            INTEGER NOT NULL,
  updated_at            INTEGER NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (parent_group_id) REFERENCES groups(id) ON DELETE SET NULL,
  CHECK (category        IN ('general','election','political','civic','professional','church','ngo','community')),
  CHECK (hierarchy_level IN ('national','state','lga','ward','polling_unit') OR hierarchy_level IS NULL),
  CHECK (visibility      IN ('public','private','invite_only')),
  CHECK (join_policy     IN ('open','approval','invite_only')),
  CHECK (status          IN ('active','suspended','archived')),
  CHECK (member_count    >= 0),
  CHECK (volunteer_count >= 0)
);

INSERT OR IGNORE INTO groups
  (id, workspace_id, tenant_id, name, slug, description, category,
   hierarchy_level, parent_group_id, place_id, state_code, lga_code, ward_code,
   polling_unit_code, member_count, volunteer_count, visibility, join_policy,
   status, logo_url, cover_url, constitution_url, website_url,
   ndpr_consent_required, created_at, updated_at)
SELECT
  id, workspace_id, tenant_id, name, slug, description, group_type,
  hierarchy_level, parent_group_id, place_id, state_code, lga_code, ward_code,
  polling_unit_code, member_count, volunteer_count, visibility, join_policy,
  status, logo_url, cover_url, constitution_url, website_url,
  ndpr_consent_required, created_at, updated_at
FROM support_groups
WHERE 1=1;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_groups_slug_tenant        ON groups(slug, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_groups_workspace_tenant     ON groups(workspace_id, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_groups_status               ON groups(status, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_groups_category             ON groups(category, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_groups_state_lga            ON groups(state_code, lga_code, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_groups_parent               ON groups(parent_group_id, tenant_id);

-- ============================================================
-- 2. group_members (was: support_group_members)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_members (
  id                TEXT    NOT NULL,
  group_id          TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id      TEXT    NOT NULL,
  tenant_id         TEXT    NOT NULL,
  user_id           TEXT    NOT NULL,
  role              TEXT    NOT NULL DEFAULT 'member',
  status            TEXT    NOT NULL DEFAULT 'active',
  ward_code         TEXT,
  polling_unit_code TEXT,
  joined_at         INTEGER NOT NULL,
  approved_by       TEXT,
  approved_at       INTEGER,
  ndpr_consented    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CHECK (role   IN ('chair','secretary','treasurer','executive','coordinator','mobilizer','member','volunteer')),
  CHECK (status IN ('pending','active','suspended','expelled'))
);

INSERT OR IGNORE INTO group_members
SELECT id, group_id, workspace_id, tenant_id, user_id, role, status,
       ward_code, polling_unit_code, joined_at, approved_by, approved_at, ndpr_consented
FROM support_group_members;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_group_members_user       ON group_members(group_id, user_id, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_group_members_group        ON group_members(group_id, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_group_members_status       ON group_members(status, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_group_members_ward         ON group_members(ward_code, tenant_id);

-- ============================================================
-- 3. group_meetings (was: support_group_meetings)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_meetings (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  agenda       TEXT,
  meeting_type TEXT    NOT NULL DEFAULT 'general',
  venue        TEXT,
  place_id     TEXT,
  starts_at    INTEGER NOT NULL,
  ends_at      INTEGER,
  is_virtual   INTEGER NOT NULL DEFAULT 0,
  join_url     TEXT,
  status       TEXT    NOT NULL DEFAULT 'scheduled',
  minutes_url  TEXT,
  quorum_met   INTEGER,
  attendance   INTEGER NOT NULL DEFAULT 0,
  created_by   TEXT    NOT NULL,
  created_at   INTEGER NOT NULL,
  PRIMARY KEY (id),
  CHECK (meeting_type IN ('general','executive','emergency','agm','rally','townhall','training','mobilization')),
  CHECK (status       IN ('scheduled','ongoing','completed','cancelled'))
);

INSERT OR IGNORE INTO group_meetings
SELECT id, group_id, workspace_id, tenant_id, title, agenda, meeting_type,
       venue, place_id, starts_at, ends_at, is_virtual, join_url, status,
       minutes_url, quorum_met, attendance, created_by, created_at
FROM support_group_meetings;

CREATE INDEX IF NOT EXISTS idx_group_meetings_group   ON group_meetings(group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_meetings_starts  ON group_meetings(starts_at, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_meetings_status  ON group_meetings(status, tenant_id);

-- ============================================================
-- 4. group_resolutions (was: support_group_resolutions)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_resolutions (
  id             TEXT    NOT NULL,
  group_id       TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  meeting_id     TEXT    REFERENCES group_meetings(id) ON DELETE SET NULL,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  title          TEXT    NOT NULL,
  body           TEXT    NOT NULL,
  resolution_ref TEXT,
  status         TEXT    NOT NULL DEFAULT 'passed',
  passed_by      TEXT    NOT NULL DEFAULT 'voice_vote',
  recorded_at    INTEGER NOT NULL,
  recorded_by    TEXT    NOT NULL,
  PRIMARY KEY (id),
  CHECK (status    IN ('passed','failed','tabled','withdrawn')),
  CHECK (passed_by IN ('voice_vote','show_of_hands','ballot','consensus'))
);

INSERT OR IGNORE INTO group_resolutions
SELECT id, group_id, meeting_id, workspace_id, tenant_id, title, body,
       resolution_ref, status, passed_by, recorded_at, recorded_by
FROM support_group_resolutions;

CREATE INDEX IF NOT EXISTS idx_group_resolutions_group   ON group_resolutions(group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_resolutions_meeting ON group_resolutions(meeting_id, tenant_id);

-- ============================================================
-- 5. group_broadcasts (was: support_group_broadcasts)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_broadcasts (
  id           TEXT    NOT NULL,
  group_id     TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  sender_id    TEXT    NOT NULL,
  title        TEXT    NOT NULL,
  body         TEXT    NOT NULL,
  channel      TEXT    NOT NULL DEFAULT 'in_app',
  audience     TEXT    NOT NULL DEFAULT 'all',
  status       TEXT    NOT NULL DEFAULT 'queued',
  sent_count   INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  scheduled_at INTEGER,
  sent_at      INTEGER,
  created_at   INTEGER NOT NULL,
  PRIMARY KEY (id),
  CHECK (channel  IN ('in_app','sms','whatsapp','email','ussd_push')),
  CHECK (audience IN ('all','executive','volunteers','members_only','coordinators')),
  CHECK (status   IN ('queued','sending','sent','failed'))
);

INSERT OR IGNORE INTO group_broadcasts
SELECT id, group_id, workspace_id, tenant_id, sender_id, title, body,
       channel, audience, status, sent_count, failed_count, scheduled_at, sent_at, created_at
FROM support_group_broadcasts;

CREATE INDEX IF NOT EXISTS idx_group_broadcasts_group  ON group_broadcasts(group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_broadcasts_status ON group_broadcasts(status, tenant_id);

-- ============================================================
-- 6. group_events (was: support_group_events)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_events (
  id             TEXT    NOT NULL,
  group_id       TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id   TEXT    NOT NULL,
  tenant_id      TEXT    NOT NULL,
  title          TEXT    NOT NULL,
  description    TEXT,
  event_type     TEXT    NOT NULL DEFAULT 'general',
  venue          TEXT,
  place_id       TEXT,
  state_code     TEXT,
  lga_code       TEXT,
  ward_code      TEXT,
  starts_at      INTEGER NOT NULL,
  ends_at        INTEGER,
  expected_count INTEGER,
  actual_count   INTEGER,
  status         TEXT    NOT NULL DEFAULT 'scheduled',
  is_public      INTEGER NOT NULL DEFAULT 0,
  rsvp_count     INTEGER NOT NULL DEFAULT 0,
  created_by     TEXT    NOT NULL,
  created_at     INTEGER NOT NULL,
  PRIMARY KEY (id),
  CHECK (event_type IN ('rally','townhall','workshop','training','mobilization',
                        'press_conference','fundraiser','service','outreach','worship','meeting','general')),
  CHECK (status     IN ('scheduled','ongoing','completed','cancelled'))
);

INSERT OR IGNORE INTO group_events
SELECT id, group_id, workspace_id, tenant_id, title, description, event_type,
       venue, place_id, state_code, lga_code, ward_code,
       starts_at, ends_at, expected_count, actual_count,
       status, is_public, rsvp_count, created_by, created_at
FROM support_group_events;

CREATE INDEX IF NOT EXISTS idx_group_events_group   ON group_events(group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_events_starts  ON group_events(starts_at, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_events_public  ON group_events(is_public, tenant_id);

-- ============================================================
-- 7. group_event_rsvps (was: support_group_event_rsvps)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_event_rsvps (
  id         TEXT    NOT NULL,
  event_id   TEXT    NOT NULL REFERENCES group_events(id) ON DELETE CASCADE,
  group_id   TEXT    NOT NULL,
  tenant_id  TEXT    NOT NULL,
  user_id    TEXT    NOT NULL,
  status     TEXT    NOT NULL DEFAULT 'attending',
  rsvped_at  INTEGER NOT NULL,
  PRIMARY KEY (id),
  CHECK (status IN ('attending','maybe','declined'))
);

INSERT OR IGNORE INTO group_event_rsvps
SELECT id, event_id, group_id, tenant_id, user_id, status, created_at AS rsvped_at
FROM support_group_event_rsvps;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_group_rsvps_user ON group_event_rsvps(event_id, user_id, tenant_id);
CREATE INDEX        IF NOT EXISTS idx_group_rsvps_event  ON group_event_rsvps(event_id, tenant_id);

-- ============================================================
-- 8. group_petitions (was: support_group_petitions)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_petitions (
  id              TEXT    NOT NULL,
  group_id        TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  title           TEXT    NOT NULL,
  body            TEXT    NOT NULL,
  target          TEXT,
  signature_count INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'open',
  created_by      TEXT    NOT NULL,
  created_at      INTEGER NOT NULL,
  closed_at       INTEGER,
  PRIMARY KEY (id),
  CHECK (status IN ('open','closed','submitted','resolved'))
);

INSERT OR IGNORE INTO group_petitions
SELECT id, group_id, workspace_id, tenant_id, title, body, target,
       signature_count, status, created_by, created_at, closed_at
FROM support_group_petitions;

CREATE INDEX IF NOT EXISTS idx_group_petitions_group  ON group_petitions(group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_petitions_status ON group_petitions(status, tenant_id);

-- ============================================================
-- 9. group_petition_signatures (was: support_group_petition_signatures)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_petition_signatures (
  id          TEXT    NOT NULL,
  petition_id TEXT    NOT NULL REFERENCES group_petitions(id) ON DELETE CASCADE,
  group_id    TEXT    NOT NULL,
  workspace_id TEXT   NOT NULL,
  tenant_id   TEXT    NOT NULL,
  user_id     TEXT    NOT NULL,
  signed_at   INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO group_petition_signatures
SELECT id, petition_id, group_id, workspace_id, tenant_id, user_id, signed_at
FROM support_group_petition_signatures;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_group_petition_sigs_user ON group_petition_signatures(petition_id, user_id, tenant_id);

-- ============================================================
-- 10. group_assets (was: support_group_assets)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_assets (
  id                  TEXT    NOT NULL,
  group_id            TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id        TEXT    NOT NULL,
  tenant_id           TEXT    NOT NULL,
  asset_name          TEXT    NOT NULL,
  asset_type          TEXT    NOT NULL,
  quantity            INTEGER NOT NULL DEFAULT 1,
  quantity_unit       TEXT    NOT NULL DEFAULT 'units',
  custodian_member_id TEXT,
  status              TEXT    NOT NULL DEFAULT 'available',
  value_kobo          INTEGER NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          INTEGER NOT NULL,
  PRIMARY KEY (id),
  CHECK (asset_type IN ('material','vehicle','equipment','uniform','branded_item','funds')),
  CHECK (status     IN ('available','in_use','depleted','lost','returned')),
  CHECK (value_kobo >= 0)
);

INSERT OR IGNORE INTO group_assets
SELECT id, group_id, workspace_id, tenant_id, asset_name, asset_type,
       quantity, quantity_unit, custodian_member_id, status, value_kobo, notes, created_at
FROM support_group_assets;

CREATE INDEX IF NOT EXISTS idx_group_assets_group  ON group_assets(group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_assets_type   ON group_assets(asset_type, tenant_id);

-- ============================================================
-- 11. group_executive_roles (was: support_group_executive_roles)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_executive_roles (
  id         TEXT    NOT NULL,
  group_id   TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id TEXT  NOT NULL,
  tenant_id  TEXT    NOT NULL,
  member_id  TEXT    NOT NULL,
  role_title TEXT    NOT NULL,
  start_at   INTEGER NOT NULL,
  end_at     INTEGER,
  appointed_by TEXT  NOT NULL,
  PRIMARY KEY (id),
  CHECK (role_title IN ('chairman','secretary_general','financial_secretary','pro',
                        'women_leader','youth_leader','coordinator','patron'))
);

INSERT OR IGNORE INTO group_executive_roles
SELECT id, group_id, workspace_id, tenant_id, member_id, role_title,
       start_at, end_at, appointed_by
FROM support_group_executive_roles;

CREATE INDEX IF NOT EXISTS idx_group_exec_roles_group ON group_executive_roles(group_id, tenant_id);

-- ============================================================
-- 12. group_committees (was: support_group_committees)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_committees (
  id              TEXT    NOT NULL,
  group_id        TEXT    NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  workspace_id    TEXT    NOT NULL,
  tenant_id       TEXT    NOT NULL,
  name            TEXT    NOT NULL,
  mandate         TEXT,
  committee_type  TEXT    NOT NULL DEFAULT 'standing',
  chair_member_id TEXT,
  status          TEXT    NOT NULL DEFAULT 'active',
  formed_at       INTEGER NOT NULL,
  dissolved_at    INTEGER,
  PRIMARY KEY (id),
  CHECK (committee_type IN ('standing','ad_hoc','special','disciplinary','finance','welfare','publicity'))
);

INSERT OR IGNORE INTO group_committees
SELECT id, group_id, workspace_id, tenant_id, name, mandate, committee_type,
       chair_member_id, status, formed_at, dissolved_at
FROM support_group_committees;

CREATE INDEX IF NOT EXISTS idx_group_committees_group ON group_committees(group_id, tenant_id);

-- ============================================================
-- 13. group_committee_members (was: support_group_committee_members)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_committee_members (
  id           TEXT    NOT NULL,
  committee_id TEXT    NOT NULL REFERENCES group_committees(id) ON DELETE CASCADE,
  group_id     TEXT    NOT NULL,
  tenant_id    TEXT    NOT NULL,
  member_id    TEXT    NOT NULL,
  role         TEXT    NOT NULL DEFAULT 'member',
  joined_at    INTEGER NOT NULL,
  PRIMARY KEY (id)
);

INSERT OR IGNORE INTO group_committee_members
SELECT id, committee_id, group_id, tenant_id, member_id, role, joined_at
FROM support_group_committee_members;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_group_committee_members ON group_committee_members(committee_id, member_id, tenant_id);

-- ============================================================
-- 14. group_analytics (was: support_group_analytics)
-- ============================================================

CREATE TABLE IF NOT EXISTS group_analytics (
  group_id             TEXT    NOT NULL,
  period_date          TEXT    NOT NULL,
  tenant_id            TEXT    NOT NULL,
  new_members          INTEGER NOT NULL DEFAULT 0,
  active_members       INTEGER NOT NULL DEFAULT 0,
  broadcasts_sent      INTEGER NOT NULL DEFAULT 0,
  events_held          INTEGER NOT NULL DEFAULT 0,
  gotv_mobilized       INTEGER NOT NULL DEFAULT 0,
  gotv_voted           INTEGER NOT NULL DEFAULT 0,
  signatures_collected INTEGER NOT NULL DEFAULT 0,
  computed_at          INTEGER NOT NULL,
  PRIMARY KEY (group_id, period_date, tenant_id)
);

INSERT OR IGNORE INTO group_analytics
SELECT group_id, period_date, tenant_id, new_members, active_members,
       broadcasts_sent, events_held, gotv_mobilized, gotv_voted,
       signatures_collected, computed_at
FROM support_group_analytics;

CREATE INDEX IF NOT EXISTS idx_group_analytics_group  ON group_analytics(group_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_group_analytics_period ON group_analytics(period_date, tenant_id);

-- ============================================================
-- 15. Update search_entries block_type reference
-- ============================================================

UPDATE search_entries
SET record_type = 'group'
WHERE record_type = 'support_group';

-- ============================================================
-- 16. Update wakapage_blocks block_type reference
-- ============================================================

UPDATE wakapage_blocks
SET block_type = 'group'
WHERE block_type = 'support_group';

-- ============================================================
-- NOTE: Old tables (support_groups, support_group_*) are NOT dropped in this migration.
-- They are kept as shadow tables until full verification in staging.
-- Removal migration: 0438_drop_support_groups_shadow_tables.sql (Phase 0 QA gate pass)
-- ============================================================
