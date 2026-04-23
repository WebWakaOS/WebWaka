-- WebWaka OS QA Seed — Phase 8: USSD Sessions
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 8
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- T10: Each USSD Worker is scoped to a single tenant (TENANT_ID in wrangler.toml).
--      Sessions are stored in USSD_SESSION_KV (KV namespace binding).
--      These SQL rows are metadata only; the actual USSD state lives in KV.
--      USSD session KV key format: ussd_session:{sessionId}
--
-- R5: Rate limit is 30 USSD requests per phone number per hour.
--     TC-US010 exhausts the rate limit for +2348000000020 (USSD-002 phone).
--     After that test, flush KV: wrangler kv:key delete ussd_rl:+2348000000020
--
-- USSD-001: Active session for USR-009 (+2348000000009), main_menu state
--   KV key: ussd_session:qa-session-001
--   TTL: 120 seconds from now (allows test navigation)
--
-- USSD-002: +2348000000020 — rate limit exhaust target (TC-US010)
--   No session row needed; phone number used in test payload
--
-- USSD-003: Expired session for testing expiry rejection
--   KV TTL already elapsed; system must reject continuation
--
-- NOTE: USSD sessions are primarily KV-based, not D1-based.
--       The KV seed must be performed via wrangler KV commands (see below).
--       These SQL stubs track the seed metadata for audit purposes only.

INSERT OR IGNORE INTO ussd_session_audit (
  session_id, phone, tenant_id, state, created_at, expires_at, is_expired
) VALUES (
  'qa-session-001',
  '+2348000000009',
  '10000000-0000-4000-b000-000000000001',
  'main_menu',
  strftime('%s','now'),
  strftime('%s', datetime('now', '+120 seconds')),
  0
);

INSERT OR IGNORE INTO ussd_session_audit (
  session_id, phone, tenant_id, state, created_at, expires_at, is_expired
) VALUES (
  'qa-session-003',
  '+2348000000021',
  '10000000-0000-4000-b000-000000000001',
  'main_menu',
  strftime('%s', datetime('now', '-5 minutes')),
  strftime('%s', datetime('now', '-2 minutes')),
  1
);

-- KV seed commands (run separately against ussd-staging ENV-02):
-- wrangler kv:key put --namespace-id=<USSD_SESSION_KV_ID> \
--   "ussd_session:qa-session-001" \
--   '{"state":"main_menu","phone":"+2348000000009","tenant_id":"10000000-0000-4000-b000-000000000001","step":0}' \
--   --ttl=120 --env staging
--
-- wrangler kv:key put --namespace-id=<USSD_SESSION_KV_ID> \
--   "ussd_session:qa-session-003" \
--   '{"state":"main_menu","phone":"+2348000000021","tenant_id":"10000000-0000-4000-b000-000000000001","step":0}' \
--   --ttl=1 --env staging
