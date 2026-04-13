-- Rollback: 0224_template_ratings
DROP INDEX IF EXISTS idx_template_ratings_tenant;
DROP INDEX IF EXISTS idx_template_ratings_slug;
DROP TABLE IF EXISTS template_ratings;
