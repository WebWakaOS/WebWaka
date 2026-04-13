-- P14-C: FTS5 virtual table for high-performance template search
-- Replaces LIKE-based full-scan with inverted index on display_name, description, tags

CREATE VIRTUAL TABLE IF NOT EXISTS template_fts USING fts5(
  id UNINDEXED,
  slug UNINDEXED,
  display_name,
  description,
  tags,
  template_type UNINDEXED,
  compatible_verticals UNINDEXED,
  content='template_registry',
  content_rowid='rowid'
);

-- Backfill from existing approved templates
INSERT INTO template_fts(rowid, id, slug, display_name, description, tags, template_type, compatible_verticals)
SELECT rowid, id, slug, display_name, COALESCE(description, ''), COALESCE(tags, ''), template_type, COALESCE(compatible_verticals, '[]')
FROM template_registry
WHERE status = 'approved';

-- Trigger: keep FTS index in sync on insert
CREATE TRIGGER IF NOT EXISTS template_registry_ai
  AFTER INSERT ON template_registry BEGIN
  INSERT INTO template_fts(rowid, id, slug, display_name, description, tags, template_type, compatible_verticals)
  VALUES (new.rowid, new.id, new.slug, new.display_name, COALESCE(new.description, ''), COALESCE(new.tags, ''), new.template_type, COALESCE(new.compatible_verticals, '[]'));
END;

-- Trigger: keep FTS index in sync on update
CREATE TRIGGER IF NOT EXISTS template_registry_au
  AFTER UPDATE ON template_registry BEGIN
  INSERT INTO template_fts(template_fts, rowid, id, slug, display_name, description, tags, template_type, compatible_verticals)
  VALUES ('delete', old.rowid, old.id, old.slug, old.display_name, COALESCE(old.description, ''), COALESCE(old.tags, ''), old.template_type, COALESCE(old.compatible_verticals, '[]'));
  INSERT INTO template_fts(rowid, id, slug, display_name, description, tags, template_type, compatible_verticals)
  VALUES (new.rowid, new.id, new.slug, new.display_name, COALESCE(new.description, ''), COALESCE(new.tags, ''), new.template_type, COALESCE(new.compatible_verticals, '[]'));
END;

-- Trigger: keep FTS index in sync on delete
CREATE TRIGGER IF NOT EXISTS template_registry_ad
  AFTER DELETE ON template_registry BEGIN
  INSERT INTO template_fts(template_fts, rowid, id, slug, display_name, description, tags, template_type, compatible_verticals)
  VALUES ('delete', old.rowid, old.id, old.slug, old.display_name, COALESCE(old.description, ''), COALESCE(old.tags, ''), old.template_type, COALESCE(old.compatible_verticals, '[]'));
END;
