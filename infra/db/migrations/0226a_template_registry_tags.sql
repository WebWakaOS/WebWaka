-- Migration 0226a: Add tags column to template_registry
-- Required by 0227 FTS5 backfill which SELECTs tags from template_registry.
-- tags stores a space/comma-separated keyword string for full-text search.

ALTER TABLE template_registry ADD COLUMN tags TEXT;
