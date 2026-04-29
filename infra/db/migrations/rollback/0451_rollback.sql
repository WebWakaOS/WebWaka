-- Rollback 0451: Restore wakapage_blocks to pre-Phase-4 schema
-- Re-creates the table with the 17-type constraint (pre-Phase-4 state).
-- Data rows with Phase-4-only block types (cases_board, dues_status, mutual_aid_wall)
-- are not preserved (they cannot satisfy the restored constraint).

PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS wakapage_blocks_rollback_0451 AS
  SELECT * FROM wakapage_blocks
  WHERE block_type IN (
    'hero','bio','offerings','contact_form','social_links',
    'gallery','cta_button','map','testimonials','faq',
    'countdown','media_kit','trust_badges','social_feed',
    'blog_post','community','event_list',
    'group','support_group','fundraising_campaign'
  );

DROP TABLE IF EXISTS wakapage_blocks;

CREATE TABLE wakapage_blocks (
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
                 'group','support_group','fundraising_campaign'
               )),
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_visible   INTEGER NOT NULL DEFAULT 1
               CHECK (is_visible IN (0,1)),
  config_json  TEXT    NOT NULL DEFAULT '{}',
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO wakapage_blocks
  SELECT * FROM wakapage_blocks_rollback_0451;

DROP TABLE wakapage_blocks_rollback_0451;

CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_page_id
  ON wakapage_blocks(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_tenant_id
  ON wakapage_blocks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_wakapage_blocks_block_type
  ON wakapage_blocks(tenant_id, block_type);

PRAGMA foreign_keys = ON;
