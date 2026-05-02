-- Migration 0462: Drop support_groups_* shadow tables + complete fundraising column rename
-- Phase 0 cleanup — ADR-0042
--
-- Context:
--   Migration 0432 created groups_* tables (copying data from support_groups_*).
--   The old support_groups_* tables were kept as shadows pending QA gate.
--   The /support-groups route now issues 308 redirects to /groups.
--   All application code has been updated to use groups_* tables.
--   This migration completes the rename by:
--     (a) Renaming fundraising_campaigns.support_group_id → group_id
--     (b) Backfilling search_entries entity_type 'support_group' → 'group'
--     (c) Dropping all 14 support_groups_* shadow tables
--
-- Platform Invariants:
--   T3 — tenant_id preserved; no data loss
--   P9 — no monetary values touched
--
-- Rollback: 0462_drop_support_groups_shadow_tables.rollback.sql

-- ============================================================
-- Step 1: Rename fundraising_campaigns.support_group_id → group_id
-- D1 (SQLite 3.35+) supports ALTER TABLE ... RENAME COLUMN.
-- ============================================================

ALTER TABLE fundraising_campaigns RENAME COLUMN support_group_id TO group_id;

-- ============================================================
-- Step 2: Backfill search_entries entity_type 'support_group' → 'group'
-- New writes use 'group' (updated in search-index.ts); this fixes existing rows.
-- ============================================================

UPDATE search_entries
SET entity_type = 'group'
WHERE entity_type = 'support_group';

-- ============================================================
-- Step 3: Drop support_groups_* shadow tables (14 tables)
-- Order matters — child tables with FKs must be dropped before parents.
-- ============================================================

DROP TABLE IF EXISTS support_group_committee_members;
DROP TABLE IF EXISTS support_group_committees;
DROP TABLE IF EXISTS support_group_executive_roles;
DROP TABLE IF EXISTS support_group_petition_signatures;
DROP TABLE IF EXISTS support_group_petitions;
DROP TABLE IF EXISTS support_group_event_rsvps;
DROP TABLE IF EXISTS support_group_events;
DROP TABLE IF EXISTS support_group_broadcasts;
DROP TABLE IF EXISTS support_group_resolutions;
DROP TABLE IF EXISTS support_group_meetings;
DROP TABLE IF EXISTS support_group_assets;
DROP TABLE IF EXISTS support_group_analytics;
DROP TABLE IF EXISTS support_group_members;
DROP TABLE IF EXISTS support_groups;
