-- Migration 0451: WakaPage Blocks Phase 4 Extension (E28)
-- Phase 4 — Template System Rollout (M14 gate: WakaPage has 4 new block types)
--
-- Adds 3 new block types to wakapage_blocks.block_type CHECK constraint:
--   cases_board     — embeds the tenant's cases board filtered by status/type
--   dues_status     — embeds a member's dues payment status and history
--   mutual_aid_wall — embeds the network's open/recent aid requests
--
-- Also adds the pre-existing block types that were missing from the original 0420 constraint:
--   group              — @webwaka/groups public profile + join CTA (Phase 0 rename)
--   support_group      — deprecated alias for 'group', kept for data migration compat
--   fundraising_campaign — @webwaka/fundraising public campaign + donate CTA
--
-- Implementation: SQLite does not support ALTER TABLE ... MODIFY CONSTRAINT.
-- The table is recreated using the SQLite-compatible pattern (CREATE, INSERT, DROP, RENAME).
-- All existing data is preserved. Foreign keys are temporarily disabled during recreation.
--
-- Platform Invariants:
--   T3  — tenant_id preserved on all rows
--   G23 — additive only (no rows deleted; no valid block types removed)
--   AC-FUNC-03 — rollback in rollback/0451_rollback.sql

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS wakapage_blocks_new_0451 (
  id           TEXT    NOT NULL PRIMARY KEY,
  page_id      TEXT    NOT NULL
               REFERENCES wakapage_pages(id) ON DELETE CASCADE,
  tenant_id    TEXT    NOT NULL,
  block_type   TEXT    NOT NULL
               CHECK (block_type IN (
                 'hero','bio','offerings','contact_form','social_links',
                 'gallery','cta_button','map','testimonials','faq',
                 'countdown','media_kit','trust_badges','social_feed',
                 'blog_post','community','event_list',
                 'group','support_group','fundraising_campaign',
                 'cases_board','dues_status','mutual_aid_wall'
               )),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_visible   INTEGER NOT NULL DEFAULT 1
               CHECK (is_visible IN (0,1)),
  config_json  TEXT    NOT NULL DEFAULT '{}',
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO wakapage_blocks_new_0451
  SELECT id, page_id, tenant_id, block_type, sort_order, is_visible, config_json, created_at, updated_at
  FROM wakapage_blocks;

DROP TABLE IF EXISTS wakapage_blocks;

ALTER TABLE wakapage_blocks_new_0451 RENAME TO wakapage_blocks;

CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_page_id
  ON wakapage_blocks(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_tenant_id
  ON wakapage_blocks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_block_type
  ON wakapage_blocks(tenant_id, block_type);

PRAGMA foreign_keys = ON;
