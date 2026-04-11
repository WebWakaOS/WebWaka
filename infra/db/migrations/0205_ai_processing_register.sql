CREATE TABLE IF NOT EXISTS ai_processing_register (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  data_categories TEXT NOT NULL,
  data_subjects TEXT NOT NULL,
  recipients TEXT NOT NULL,
  retention_period TEXT NOT NULL,
  security_measures TEXT NOT NULL,
  vertical TEXT NOT NULL,
  capability TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_processing_register_tenant ON ai_processing_register(tenant_id);
CREATE INDEX IF NOT EXISTS idx_processing_register_vertical ON ai_processing_register(tenant_id, vertical);
CREATE INDEX IF NOT EXISTS idx_processing_register_active ON ai_processing_register(tenant_id, is_active);
