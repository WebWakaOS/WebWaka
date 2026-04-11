CREATE TABLE IF NOT EXISTS ai_hitl_queue (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  vertical TEXT NOT NULL,
  capability TEXT NOT NULL,
  hitl_level INTEGER NOT NULL CHECK (hitl_level IN (1, 2, 3)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  ai_request_payload TEXT NOT NULL,
  ai_response_payload TEXT,
  reviewer_id TEXT,
  reviewed_at TEXT,
  review_note TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_hitl_queue_tenant_status ON ai_hitl_queue(tenant_id, status);
CREATE INDEX idx_hitl_queue_reviewer ON ai_hitl_queue(tenant_id, reviewer_id);
CREATE INDEX idx_hitl_queue_expires ON ai_hitl_queue(expires_at);

CREATE TABLE IF NOT EXISTS ai_hitl_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  queue_item_id TEXT NOT NULL REFERENCES ai_hitl_queue(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'approved', 'rejected', 'expired', 'escalated')),
  actor_id TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX idx_hitl_events_queue ON ai_hitl_events(queue_item_id);
CREATE INDEX idx_hitl_events_tenant ON ai_hitl_events(tenant_id);
