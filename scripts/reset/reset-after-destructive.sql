-- WebWaka OS QA Reset — Destructive Test Recovery
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.2 Seed Reset Procedure
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- Run this script after any destructive test to restore the seed state.
-- Each reset is labeled with the TC-ID that triggered the destructive operation.
--
-- Usage:
--   wrangler d1 execute webwaka-db --env staging --file=scripts/reset/reset-after-destructive.sql
--
-- Or selectively (uncomment only the section needed):

-- ─────────────────────────────────────────────────────────────────────────────
-- RESET-01: After TC-N006 (NDPR hard delete of NTF-002)
-- G23: TC-N006 hard-deletes notification 90000000-0000-4000-b001-000000000002.
--      Re-insert before the next NDPR test run.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO notification_inbox (
  id, user_id, tenant_id, type, title, body,
  state, pinned, snoozed_until, created_at, updated_at
) VALUES (
  '90000000-0000-4000-b001-000000000002',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  'system.announcement',
  'Welcome to WebWaka',
  'Your account is set up and ready to use.',
  'unread',
  0,
  NULL,
  strftime('%s','now'),
  strftime('%s','now')
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RESET-02: After TC-S001 (support ticket closed to terminal state)
-- Re-create a support ticket in 'open' state for TNT-001
-- ─────────────────────────────────────────────────────────────────────────────

INSERT OR IGNORE INTO support_tickets (
  id, workspace_id, tenant_id, user_id,
  subject, body, status, priority,
  created_at, updated_at
) VALUES (
  'b0000000-0000-4000-a004-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  'Test Support Ticket',
  'This is a QA seed support ticket for FSM state transition tests.',
  'open',
  'medium',
  strftime('%s','now'),
  strftime('%s','now')
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RESET-03: After TC-F007/TC-F008 (dispute flow on BTO-003/BTO-004)
-- Restore BTO-003 to confirmed state (dispute may have transitioned it)
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE bank_transfer_orders
SET
  status = 'confirmed',
  confirmed_at = strftime('%s', datetime('now', '-1 hour')),
  updated_at = strftime('%s','now')
WHERE id = '50000000-0000-4000-f000-000000000003';

-- Restore BTO-004 confirmed_at to 25 hours ago (dispute window closed)
UPDATE bank_transfer_orders
SET
  status = 'confirmed',
  confirmed_at = strftime('%s', datetime('now', '-25 hours')),
  updated_at = strftime('%s','now')
WHERE id = '50000000-0000-4000-f000-000000000004';

-- Remove any dispute records created during the test run
DELETE FROM bank_transfer_disputes
WHERE order_id IN (
  '50000000-0000-4000-f000-000000000003',
  '50000000-0000-4000-f000-000000000004'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RESET-04: After TC-US010 (USSD rate-limit exhaustion on +2348000000020)
-- KV flush required (run separately via wrangler CLI):
--
--   wrangler kv:key delete --namespace-id=<RATE_LIMIT_KV_ID> \
--     "ussd_rl:+2348000000020" --env staging
--
-- The SQL reset removes any audit rows for the test phone number:
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM ussd_session_audit
WHERE phone = '+2348000000020'
  AND created_at > strftime('%s', datetime('now', '-2 hours'));

-- ─────────────────────────────────────────────────────────────────────────────
-- RESET-05: After TC-ID002 (identity rate-limit exhaustion on USR-002)
-- KV flush required (run separately via wrangler CLI):
--
--   wrangler kv:key delete --namespace-id=<RATE_LIMIT_KV_ID> \
--     "identity_rl:00000000-0000-4000-a000-000000000002" --env staging
--
-- No SQL row to reset — identity rate limit is KV-only.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────────────
-- RESET-06: After TC-MON001, TC-MON003, TC-MON005 (free-tier limits for TNT-002)
-- Reset offering/invite/place counts for TNT-002 workspace back to 0
-- ─────────────────────────────────────────────────────────────────────────────

-- Remove test offerings created during limit tests for TNT-002
DELETE FROM offerings
WHERE tenant_id = '10000000-0000-4000-b000-000000000002'
  AND name LIKE 'MON-TEST-%';

-- Remove test invitations created during limit tests for TNT-002
DELETE FROM workspace_invitations
WHERE workspace_id = '20000000-0000-4000-c000-000000000002'
  AND email LIKE '%@mon-test.invalid';

-- Remove test places created during limit tests for TNT-002
DELETE FROM places
WHERE workspace_id = '20000000-0000-4000-c000-000000000002'
  AND name LIKE 'MON-TEST-PLACE-%';
