-- Rollback: 0420_wakapage_blocks
-- Safe: wakapage_blocks is a new table. ON DELETE CASCADE means no orphans.

DROP INDEX IF EXISTS idx_wakapage_blocks_block_type;
DROP INDEX IF EXISTS idx_wakapage_blocks_tenant_id;
DROP INDEX IF EXISTS idx_wakapage_blocks_page_id;
DROP TABLE IF EXISTS wakapage_blocks;
