-- Migration 0199: Search index update trigger on offerings changes
-- Cross-pillar data flow (P3IN1-003): ensures discovery search stays in sync
-- when offerings are created/updated in Pillar 1

CREATE TABLE IF NOT EXISTS search_index (
  id          TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  tenant_id   TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  category    TEXT,
  place_id    TEXT,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_search_index_entity
  ON search_index(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_search_index_tenant
  ON search_index(tenant_id);

CREATE INDEX IF NOT EXISTS idx_search_index_category
  ON search_index(category);

CREATE TRIGGER IF NOT EXISTS trg_offerings_search_insert
AFTER INSERT ON offerings
BEGIN
  INSERT OR REPLACE INTO search_index (id, entity_type, entity_id, tenant_id, title, body, category, updated_at)
  VALUES (
    'si_offering_' || NEW.id,
    'offering',
    NEW.id,
    NEW.tenant_id,
    NEW.name,
    NEW.description,
    NEW.category,
    datetime('now')
  );
END;

CREATE TRIGGER IF NOT EXISTS trg_offerings_search_update
AFTER UPDATE ON offerings
BEGIN
  INSERT OR REPLACE INTO search_index (id, entity_type, entity_id, tenant_id, title, body, category, updated_at)
  VALUES (
    'si_offering_' || NEW.id,
    'offering',
    NEW.id,
    NEW.tenant_id,
    NEW.name,
    NEW.description,
    NEW.category,
    datetime('now')
  );
END;

CREATE TRIGGER IF NOT EXISTS trg_offerings_search_delete
AFTER DELETE ON offerings
BEGIN
  DELETE FROM search_index WHERE id = 'si_offering_' || OLD.id;
END;
