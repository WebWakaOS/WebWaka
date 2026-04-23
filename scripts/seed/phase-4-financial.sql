-- WebWaka OS QA Seed — Phase 4: Financial State
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 4
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- P9 COMPLIANCE: All amounts stored as integer kobo. No floats permitted.
-- T3 COMPLIANCE: Every row scoped to tenant_id.
-- T4 COMPLIANCE: Wallet updates must be atomic conditional UPDATE (not INSERT).
--                Seed only creates initial rows; tests drive FSM transitions.
--
-- CRITICAL: BTO-004 confirmed_at is set to 25 hours ago to ensure the 24-hour
--           dispute window is CLOSED. This is required for TC-F008.
--
-- Seed ID → UUID mapping:
--   WLT-001 = 40000000-0000-4000-e000-000000000001
--   WLT-002 = 40000000-0000-4000-e000-000000000002
--   WLT-003 = 40000000-0000-4000-e000-000000000003
--   BTO-001 = 50000000-0000-4000-f000-000000000001
--   BTO-002 = 50000000-0000-4000-f000-000000000002
--   BTO-003 = 50000000-0000-4000-f000-000000000003
--   BTO-004 = 50000000-0000-4000-f000-000000000004

-- WLT-001: USR-002's wallet — 1,000,000 kobo (₦10,000) for payment tests
INSERT OR IGNORE INTO hl_wallets (
  id, user_id, tenant_id, balance_kobo, status, kyc_tier_required,
  created_at, updated_at
) VALUES (
  '40000000-0000-4000-e000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  1000000,
  'active',
  1,
  strftime('%s','now'),
  strftime('%s','now')
);

-- WLT-002: USR-005's wallet — 50,000 kobo (₦500) for free-tier tests
INSERT OR IGNORE INTO hl_wallets (
  id, user_id, tenant_id, balance_kobo, status, kyc_tier_required,
  created_at, updated_at
) VALUES (
  '40000000-0000-4000-e000-000000000002',
  '00000000-0000-4000-a000-000000000005',
  '10000000-0000-4000-b000-000000000002',
  50000,
  'active',
  1,
  strftime('%s','now'),
  strftime('%s','now')
);

-- WLT-003: USR-009's wallet (USSD user) — 200,000 kobo (₦2,000)
INSERT OR IGNORE INTO hl_wallets (
  id, user_id, tenant_id, balance_kobo, status, kyc_tier_required,
  created_at, updated_at
) VALUES (
  '40000000-0000-4000-e000-000000000003',
  '00000000-0000-4000-a000-000000000009',
  '10000000-0000-4000-b000-000000000001',
  200000,
  'active',
  1,
  strftime('%s','now'),
  strftime('%s','now')
);

-- BTO-001: pending state — USR-002, 1,000,000 kobo
-- Required for TC-F001, TC-F002, TC-F003
INSERT OR IGNORE INTO bank_transfer_orders (
  id, workspace_id, tenant_id, user_id,
  amount_kobo, reference, status,
  proof_url, confirmed_at, rejected_at, expires_at,
  created_at, updated_at
) VALUES (
  '50000000-0000-4000-f000-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  1000000,
  'WKA-20260423-T0001',
  'pending',
  NULL, NULL, NULL,
  strftime('%s', datetime('now', '+7 days')),
  strftime('%s','now'),
  strftime('%s','now')
);

-- BTO-002: proof_submitted state — USR-002, 500,000 kobo
-- Required for TC-F011 (proof submission), TC-F004 (confirm)
INSERT OR IGNORE INTO bank_transfer_orders (
  id, workspace_id, tenant_id, user_id,
  amount_kobo, reference, status,
  proof_url, confirmed_at, rejected_at, expires_at,
  created_at, updated_at
) VALUES (
  '50000000-0000-4000-f000-000000000002',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  500000,
  'WKA-20260423-T0002',
  'proof_submitted',
  'https://storage.webwaka-test.invalid/proof/bto-002.jpg',
  NULL, NULL,
  strftime('%s', datetime('now', '+6 days')),
  strftime('%s','now'),
  strftime('%s','now')
);

-- BTO-003: confirmed, < 24h ago — dispute window OPEN
-- Required for TC-F007 (dispute within 24h)
-- confirmed_at = 1 hour ago
INSERT OR IGNORE INTO bank_transfer_orders (
  id, workspace_id, tenant_id, user_id,
  amount_kobo, reference, status,
  proof_url, confirmed_at, rejected_at, expires_at,
  created_at, updated_at
) VALUES (
  '50000000-0000-4000-f000-000000000003',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  250000,
  'WKA-20260423-T0003',
  'confirmed',
  'https://storage.webwaka-test.invalid/proof/bto-003.jpg',
  strftime('%s', datetime('now', '-1 hour')),
  NULL,
  strftime('%s', datetime('now', '+5 days')),
  strftime('%s','now'),
  strftime('%s','now')
);

-- BTO-004: confirmed, 25 hours ago — dispute window CLOSED
-- Required for TC-F008 (dispute rejected after 24h)
-- CRITICAL: confirmed_at must be more than 24 hours in the past
INSERT OR IGNORE INTO bank_transfer_orders (
  id, workspace_id, tenant_id, user_id,
  amount_kobo, reference, status,
  proof_url, confirmed_at, rejected_at, expires_at,
  created_at, updated_at
) VALUES (
  '50000000-0000-4000-f000-000000000004',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  100000,
  'WKA-20260423-T0004',
  'confirmed',
  'https://storage.webwaka-test.invalid/proof/bto-004.jpg',
  strftime('%s', datetime('now', '-25 hours')),
  NULL,
  strftime('%s', datetime('now', '+4 days')),
  strftime('%s','now'),
  strftime('%s','now')
);
