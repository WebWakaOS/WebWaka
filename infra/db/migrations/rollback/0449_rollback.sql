-- Rollback 0449: Remove template_registry Phase 4 extension columns
-- Requires SQLite 3.35.0+ (ALTER TABLE DROP COLUMN) — D1 supports this.

ALTER TABLE template_registry DROP COLUMN module_config;
ALTER TABLE template_registry DROP COLUMN vocabulary;
ALTER TABLE template_registry DROP COLUMN default_policies;
ALTER TABLE template_registry DROP COLUMN default_workflows;
