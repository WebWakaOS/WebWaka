-- Rollback migration 0199
DROP TRIGGER IF EXISTS trg_offerings_search_delete;
DROP TRIGGER IF EXISTS trg_offerings_search_update;
DROP TRIGGER IF EXISTS trg_offerings_search_insert;
DROP INDEX IF EXISTS idx_search_index_category;
DROP INDEX IF EXISTS idx_search_index_tenant;
DROP INDEX IF EXISTS idx_search_index_entity;
DROP TABLE IF EXISTS search_index;
