-- 0218: Webhook deliveries — PROD-04 Webhook System
-- T3: tenant_id on all records
-- Tracks delivery attempts for each webhook event dispatch.

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  tenant_id       TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  payload         TEXT NOT NULL,   -- JSON string of event payload
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending','delivered','failed','skipped')),
  attempts        INTEGER NOT NULL DEFAULT 0,
  last_error      TEXT,            -- HTTP status or error message from last attempt
  delivered_at    INTEGER,         -- unix timestamp when first successful delivery
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_wd_subscription ON webhook_deliveries(subscription_id, created_at);
CREATE INDEX idx_wd_status ON webhook_deliveries(status, created_at);
CREATE INDEX idx_wd_tenant ON webhook_deliveries(tenant_id, created_at);
