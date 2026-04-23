-- WebWaka OS QA Seed — Phase 1: Users
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 1
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- P6 COMPLIANCE: All passwords are bcrypt(cost=12) hashes of 'QaTest#2026!'
--   Never store plaintext passwords. Never use real BVN/NIN/phone.
--   Phone numbers use +234800000XXXX test range (non-routable).
--
-- P10 COMPLIANCE: KYC tier is set directly for test purposes only.
--   In production, tier advancement requires full consent + verification flow.
--
-- T3 COMPLIANCE: Every user row includes tenant_id where applicable.
--
-- Schema alignment (0013_init_users + 0190_users_auth_columns + 0233):
--   kyc_tier is TEXT: 't0'|'t1'|'t2'|'t3'  (NOT integer)
--   email_verified is NOT a column (use email_verified_at INTEGER instead)
--   phone_verified is NOT a column
--   plan is NOT on users (subscription plans live in a separate table)
--
-- Seed ID → UUID mapping:
--   USR-001 = 00000000-0000-4000-a000-000000000001
--   USR-002 = 00000000-0000-4000-a000-000000000002
--   ... (sequence continues)

-- USR-001: super_admin — platform-wide admin, no workspace tenant
-- Required before: any platform-admin tests, TC-PA001, TC-INV009, TC-F020
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000001',
  'super@test.webwaka.io',
  '+2348000000001',
  '$2b$12$QaTest2026HashSuperAdmin001ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'super_admin',
  't3', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-002: TNT-001 owner — main test tenant owner
-- Required before: offering, POS, wallet, bank-transfer tests
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000002',
  'owner@tenant-a.test',
  '+2348000000002',
  '$2b$12$QaTest2026HashTenantAOwner002ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'owner',
  't2', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-003: TNT-001 admin
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000003',
  'admin@tenant-a.test',
  '+2348000000003',
  '$2b$12$QaTest2026HashTenantAAdmin003ABCDEFGHIJKLMNOPQRSTUVWXY',
  'admin',
  't1', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-004: TNT-001 cashier
-- Required before: TC-P001 (POS sale recording)
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000004',
  'cashier@tenant-a.test',
  '+2348000000004',
  '$2b$12$QaTest2026HashTenantACashier04ABCDEFGHIJKLMNOPQRSTUVWX',
  'cashier',
  't0', 'unverified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-005: TNT-002 owner — free plan tenant
-- Required before: TC-MON001, TC-MON003, TC-MON005 (free-tier limit tests)
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000005',
  'owner@tenant-b.test',
  '+2348000000005',
  '$2b$12$QaTest2026HashTenantBOwner005ABCDEFGHIJKLMNOPQRSTUVWXY',
  'owner',
  't2', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-006: Partner admin — PTN-001
-- Required before: any partner-admin tests, TC-PR001–PR008
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000006',
  'partner@test.webwaka.io',
  '+2348000000006',
  '$2b$12$QaTest2026HashPartnerAdmin006ABCDEFGHIJKLMNOPQRSTUVWXY',
  'partner',
  't3', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-007: Sub-partner under PTN-001
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000007',
  'subpartner@test.webwaka.io',
  '+2348000000007',
  '$2b$12$QaTest2026HashSubPartner007ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'sub_partner',
  't2', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-008: Unauthenticated / public — no row needed; represents anonymous requests
-- No INSERT for USR-008; referenced in test comments only.

-- USR-009: USSD session user
-- Required before: TC-US001–TC-US011
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000009',
  'ussd.user@tenant-a.test',
  '+2348000000009',
  '$2b$12$QaTest2026HashUSSDUser009ABCDEFGHIJKLMNOPQRSTUVWXYZAA',
  'member',
  't1', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-010: Buyer in TNT-001 — B2B buyer role
-- Required before: TC-B001–TC-B009
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000010',
  'buyer@tenant-a.test',
  '+2348000000010',
  '$2b$12$QaTest2026HashBuyerTenantA010ABCDEFGHIJKLMNOPQRSTUVWXY',
  'member',
  't2', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-011: Seller in TNT-003 — B2B seller role
-- Required before: TC-B001–TC-B009
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000011',
  'seller@tenant-c.test',
  '+2348000000011',
  '$2b$12$QaTest2026HashSellerTenantC011ABCDEFGHIJKLMNOPQRSTUVWX',
  'owner',
  't2', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-012: law-firm tenant owner (TNT-004) — L3 HITL compliance tests
-- Required before: TC-HR001, TC-HR002 (law-firm NBA HITL)
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000012',
  'lawfirm@tenant-d.test',
  '+2348000000012',
  '$2b$12$QaTest2026HashLawFirmOwner012ABCDEFGHIJKLMNOPQRSTUVWXY',
  'owner',
  't3', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-013: polling-unit tenant admin (TNT-005) — voter PII compliance tests
-- Required before: TC-HR005 (no voter PII in polling-unit)
INSERT OR IGNORE INTO users (
  id, email, phone, password_hash, role,
  kyc_tier, kyc_status,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000013',
  'pollingunit@tenant-e.test',
  '+2348000000013',
  '$2b$12$QaTest2026HashPollingUnit013ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'admin',
  't3', 'verified',
  strftime('%s','now'),
  strftime('%s','now')
);
