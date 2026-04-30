-- Migration: 0420_wakapage_blocks
-- Phase 1 — WakaPage entities: composable block rows.
--
-- Each block belongs to one wakapage_pages row.
-- Block config is stored as JSON in config_json (typed by block_type at application layer).
-- Block types must match the BlockType union in @webwaka/wakapage-blocks.
--
-- Platform Invariants:
--   T3 — tenant_id on every row; every query MUST predicate on tenant_id
--   G23 — additive only
--   P9  — no monetary fields in this table (offerings price lives in offerings table)
--
-- Dependencies: wakapage_pages (0419)

CREATE TABLE IF NOT EXISTS wakapage_blocks (
  id           TEXT    NOT NULL PRIMARY KEY,
  page_id      TEXT    NOT NULL
               REFERENCES wakapage_pages(id) ON DELETE CASCADE,
  tenant_id    TEXT    NOT NULL,
  block_type   TEXT    NOT NULL
               CHECK (block_type IN (
                 'hero','bio','offerings','contact_form','social_links',
                 'gallery','cta_button','map','testimonials','faq',
                 'countdown','media_kit','trust_badges','social_feed',
                 'blog_post','community','event_list'
               )),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_visible   INTEGER NOT NULL DEFAULT 1
               CHECK (is_visible IN (0,1)),
  config_json  TEXT    NOT NULL DEFAULT '{}',
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_page_id
  ON wakapage_blocks(page_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_tenant_id
  ON wakapage_blocks(tenant_id);

CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_block_type
  ON wakapage_blocks(tenant_id, block_type);
