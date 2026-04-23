PRAGMA foreign_keys = OFF;

-- WebWaka OS QA Seed — Phase 4: Financial State
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 4
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- SCHEMA FIX 2026-04-23: Aligned with actual migration schemas:
--   hl_wallets (0279): id, user_id, tenant_id, workspace_id (req),
--     balance_kobo, kyc_tier (INTEGER, not kyc_tier_required), status
--   bank_transfer_orders (0237): id, workspace_id, tenant_id, buyer_id (not user_id),
--     seller_entity_id (req), amount_kobo, reference, status, proof_url,
--     proof_submitted_at, confirmed_at, confirmed_by, expires_at
--     NOTE: no rejected_at column; rejection stored as status='rejected'
--
-- P9 COMPLIANCE: All amounts stored as integer kobo. No floats permitted.
-- T3 COMPLIANCE: Every row scoped to tenant_id.
-- T4 COMPLIANCE: Wallet seed creates initial rows only; tests drive FSM transitions.
-- CRITICAL: BTO-004 confirmed_at is 25 hours ago (dispute window CLOSED for TC-F008).

-- ─────────────────────────────────────────────────────────────────
-- HL Wallets
-- ─────────────────────────────────────────────────────────────────

-- WLT-001: USR-002's wallet — 1,000,000 kobo (₦10,000)
INSERT OR IGNORE INTO hl_wallets (
  id, user_id, tenant_id, workspace_id,
  balance_kobo, status, kyc_tier,
  created_at, updated_at
) VALUES (
  '40000000-0000-4000-e000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  '10000000-0000-4000-b000-000000000001',
  '20000000-0000-4000-c000-000000000001',
  1000000, 'active', 1,
  strftime('%s','now'), strftime('%s','now')
);

-- WLT-002: USR-005's wallet — 50,000 kobo (₦500) for free-tier tests
INSERT OR IGNORE INTO hl_wallets (
  id, user_id, tenant_id, workspace_id,
  balance_kobo, status, kyc_tier,
  created_at, updated_at
) VALUES (
  '40000000-0000-4000-e000-000000000002',
  '00000000-0000-4000-a000-000000000005',
  '10000000-0000-4000-b000-000000000002',
  '20000000-0000-4000-c000-000000000002',
  50000, 'active', 1,
  strftime('%s','now'), strftime('%s','now')
);

-- WLT-003: USR-009's wallet (USSD user) — 200,000 kobo (₦2,000)
INSERT OR IGNORE INTO hl_wallets (
  id, user_id, tenant_id, workspace_id,
  balance_kobo, status, kyc_tier,
  created_at, updated_at
) VALUES (
  '40000000-0000-4000-e000-000000000003',
  '00000000-0000-4000-a000-000000000009',
  '10000000-0000-4000-b000-000000000001',
  '20000000-0000-4000-c000-000000000001',
  200000, 'active', 1,
  strftime('%s','now'), strftime('%s','now')
);

-- ─────────────────────────────────────────────────────────────────
-- Bank Transfer Orders
-- seller_entity_id = workspace receiving the top-up (TNT-001 workspace)
-- ─────────────────────────────────────────────────────────────────

-- BTO-001: pending — USR-002 funding wallet ₦10,000 (Required: TC-F001–TC-F003)
INSERT OR IGNORE INTO bank_transfer_orders (
  id, workspace_id, tenant_id, buyer_id, seller_entity_id,
  amount_kobo, reference, status,
  proof_url, confirmed_at, expires_at,
  created_at, updated_at
) VALUES (
  '50000000-0000-4000-f000-000000000001',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  '20000000-0000-4000-c000-000000000001',
  1000000, 'WKA-20260423-T0001', 'pending',
  NULL, NULL,
  strftime('%s', datetime('now', '+7 days')),
  strftime('%s','now'), strftime('%s','now')
);

-- BTO-002: proof_submitted — USR-002, ₦5,000 (Required: TC-F011, TC-F004)
INSERT OR IGNORE INTO bank_transfer_orders (
  id, workspace_id, tenant_id, buyer_id, seller_entity_id,
  amount_kobo, reference, status,
  proof_url, confirmed_at, expires_at,
  created_at, updated_at
) VALUES (
  '50000000-0000-4000-f000-000000000002',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  '20000000-0000-4000-c000-000000000001',
  500000, 'WKA-20260423-T0002', 'proof_submitted',
  'https://storage.webwaka-test.invalid/proof/bto-002.jpg',
  NULL,
  strftime('%s', datetime('now', '+6 days')),
  strftime('%s','now'), strftime('%s','now')
);

-- BTO-003: confirmed <24h ago — dispute window OPEN (Required: TC-F007)
INSERT OR IGNORE INTO bank_transfer_orders (
  id, workspace_id, tenant_id, buyer_id, seller_entity_id,
  amount_kobo, reference, status,
  proof_url, confirmed_at, expires_at,
  created_at, updated_at
) VALUES (
  '50000000-0000-4000-f000-000000000003',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  '20000000-0000-4000-c000-000000000001',
  250000, 'WKA-20260423-T0003', 'confirmed',
  'https://storage.webwaka-test.invalid/proof/bto-003.jpg',
  strftime('%s', datetime('now', '-1 hour')),
  strftime('%s', datetime('now', '+5 days')),
  strftime('%s','now'), strftime('%s','now')
);

-- BTO-004: confirmed 25h ago — dispute window CLOSED (Required: TC-F008)
-- CRITICAL: confirmed_at must be >24 hours in the past
INSERT OR IGNORE INTO bank_transfer_orders (
  id, workspace_id, tenant_id, buyer_id, seller_entity_id,
  amount_kobo, reference, status,
  proof_url, confirmed_at, expires_at,
  created_at, updated_at
) VALUES (
  '50000000-0000-4000-f000-000000000004',
  '20000000-0000-4000-c000-000000000001',
  '10000000-0000-4000-b000-000000000001',
  '00000000-0000-4000-a000-000000000002',
  '20000000-0000-4000-c000-000000000001',
  100000, 'WKA-20260423-T0004', 'confirmed',
  'https://storage.webwaka-test.invalid/proof/bto-004.jpg',
  strftime('%s', datetime('now', '-25 hours')),
  strftime('%s', datetime('now', '+4 days')),
  strftime('%s','now'), strftime('%s','now')
);

PRAGMA foreign_keys = ON;
