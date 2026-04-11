-- Migration 0186: ministry_members table
-- Supports MinistryMissionRepository.addMember / listMembers
-- T3: tenant_id always present; member_ref_id is opaque (P13)

CREATE TABLE IF NOT EXISTS ministry_members (
  id           TEXT    NOT NULL PRIMARY KEY,
  profile_id   TEXT    NOT NULL REFERENCES ministry_mission_profiles(id) ON DELETE CASCADE,
  tenant_id    TEXT    NOT NULL,
  member_ref_id TEXT   NOT NULL,
  role         TEXT    NOT NULL DEFAULT 'member',
  join_date    INTEGER NOT NULL,
  created_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_ministry_members_profile
  ON ministry_members(profile_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_ministry_members_tenant
  ON ministry_members(tenant_id, join_date DESC);
