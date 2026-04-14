-- Migration: 0250_entity_trust_scores
-- Description: Materialized entity trust score table for P25-E.
-- Trust score = claim_tier × verification_tier × transaction_count (formula v1).
-- Recomputed by projections CRON after each completed B2B transaction.
-- Used in B2B discovery to surface verified, high-trust entities.
-- T3: entity-scoped (entities have their own tenant_id).

CREATE TABLE IF NOT EXISTS entity_trust_scores (
  id              TEXT NOT NULL PRIMARY KEY,
  entity_id       TEXT NOT NULL UNIQUE,
  tenant_id       TEXT NOT NULL,
  claim_tier      INTEGER NOT NULL DEFAULT 0 CHECK (claim_tier BETWEEN 0 AND 5),
  verification_tier INTEGER NOT NULL DEFAULT 0 CHECK (verification_tier BETWEEN 0 AND 3),
  completed_transactions INTEGER NOT NULL DEFAULT 0,
  dispute_rate_pct INTEGER NOT NULL DEFAULT 0,   -- percentage × 100 to avoid float
  trust_score     INTEGER NOT NULL DEFAULT 0,     -- composite score 0-1000
  last_transaction_at INTEGER,
  computed_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_entity_trust_tenant
  ON entity_trust_scores(tenant_id, trust_score DESC);

CREATE INDEX IF NOT EXISTS idx_entity_trust_entity
  ON entity_trust_scores(entity_id);
