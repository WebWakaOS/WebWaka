-- WebWaka OS QA Seed — Phase 1: Users
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 1
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- FIX(2026-05-04): Corrected password hashing algorithm and TOTP seed.
--   PREVIOUS BUG: passwords were stored as fake bcrypt stubs ($2b$12$...) which the
--                 auth system could never verify. The auth system uses PBKDF2-SHA256
--                 (Web Crypto API, Cloudflare Workers) — NOT bcrypt.
--   PREVIOUS BUG: USR-001 (super_admin) had totp_enabled=1 in staging with an
--                 undocumented TOTP secret, making login impossible without knowing
--                 the secret. Production had totp_enabled=0, which triggers the
--                 mandatory enrolment gate — another dead-end for seeded credentials.
--   ROOT CAUSE:   Seed was authored assuming a Node.js/bcrypt stack. The actual stack
--                 is Cloudflare Workers + Web Crypto PBKDF2.
--
-- P6 COMPLIANCE: All passwords are PBKDF2-SHA256 hashes of 'QaTest#2026!'
--   Algorithm: PBKDF2-SHA256, 100,000 iterations (password_hash_version=1)
--   Format: base64(16-byte-salt):base64(32-byte-derived-key)
--   Never store plaintext passwords. Never use real BVN/NIN/phone.
--   Phone numbers use +234800000XXXX test range (non-routable).
--
-- SUPER ADMIN TOTP: USR-001 uses a fixed, documented TOTP secret for QA.
--   Secret (base32): JBSWY3DPEHPK3PXP
--   This is the well-known RFC 6238 test vector secret ("Hello!" in ASCII).
--   Use any TOTP app (Google Authenticator, Authy, etc.) or the helper script:
--     python3 scripts/seed/totp-helper.py JBSWY3DPEHPK3PXP
--   QR URI: otpauth://totp/WebWaka:super%40test.webwaka.io?secret=JBSWY3DPEHPK3PXP&issuer=WebWaka
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

-- USR-001: super_admin — platform-wide admin
-- Required before: any platform-admin tests, TC-PA001, TC-INV009, TC-F020
-- LOGIN: email=super@test.webwaka.io  password=QaTest#2026!  totp=<6-digit from JBSWY3DPEHPK3PXP>
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  totp_secret, totp_enabled, totp_enrolled_at,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000001',
  'super@test.webwaka.io',
  '+2348000000001',
  'obLD1OX2obLD1OX2obLD1A==:RbFfG0tXM87QLmMIZ6JDFYqcW1KPQJAdJYwAa/1MzMc=',
  1,
  'super_admin', 't3', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  'JBSWY3DPEHPK3PXP', 1, strftime('%s','now'),
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-002: TNT-001 owner — main test tenant owner
-- Required before: offering, POS, wallet, bank-transfer tests
-- LOGIN: email=owner@tenant-a.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000002',
  'owner@tenant-a.test',
  '+2348000000002',
  'ssPU5fahssPU5fahssPU5Q==:tbzE8zNMwOK/9GYJoRJlkBFJUGvH1axaGrSVenFrXXY=',
  1,
  'owner', 't2', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-003: TNT-001 admin
-- LOGIN: email=admin@tenant-a.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000003',
  'admin@tenant-a.test',
  '+2348000000003',
  'w9Tl9qGyw9Tl9qGyw9Tl9g==:GjLgBbZYnnVsyEfVQysmvkN9eTqFZJOMRnfLYcCsr7o=',
  1,
  'admin', 't1', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-004: TNT-001 cashier
-- Required before: TC-P001 (POS sale recording)
-- LOGIN: email=cashier@tenant-a.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000004',
  'cashier@tenant-a.test',
  '+2348000000004',
  '1OX2obLD1OX2obLD1OX2oQ==:JO76T02LMb3fkIuohi3xEmokGwwHsBM6Cxe311WNi/o=',
  1,
  'cashier', 't0', 'unverified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-005: TNT-002 owner — free plan tenant
-- Required before: TC-MON001, TC-MON003, TC-MON005 (free-tier limit tests)
-- LOGIN: email=owner@tenant-b.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000005',
  'owner@tenant-b.test',
  '+2348000000005',
  '5fahssPU5fahssPU5fahsg==:bA2bXttOtvQHVAtEaNARLb7GEAhBxD290q/MGQdE2Fg=',
  1,
  'owner', 't2', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-006: Partner admin — PTN-001
-- Required before: any partner-admin tests, TC-PR001–PR008
-- LOGIN: email=partner@test.webwaka.io  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000006',
  'partner@test.webwaka.io',
  '+2348000000006',
  '9qGyw9Tl9qGyw9Tl9qGyww==:Vd6yLD8r35w7XR3CQL40li/sj6aSvPurrmS0mnWuenc=',
  1,
  'partner', 't3', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-007: Sub-partner under PTN-001
-- LOGIN: email=subpartner@test.webwaka.io  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000007',
  'subpartner@test.webwaka.io',
  '+2348000000007',
  'p7jJ0OHyp7jJ0OHyp7jJ0A==:SxABBzPTaiDmDW+NqoL+p6AYEZmQPH9DcMfQTI93yAE=',
  1,
  'sub_partner', 't2', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-008: Unauthenticated / public — no row needed; represents anonymous requests
-- No INSERT for USR-008; referenced in test comments only.

-- USR-009: USSD session user
-- Required before: TC-US001–TC-US011
-- LOGIN: email=ussd.user@tenant-a.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000009',
  'ussd.user@tenant-a.test',
  '+2348000000009',
  'qbDB0uP0qbDB0uP0qbDB0g==:SSwb2V6xc4v0gOURFLb2/emPs5Z1qLzghDReyyltKZQ=',
  1,
  'member', 't1', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-010: Buyer in TNT-001 — B2B buyer role
-- Required before: TC-B001–TC-B009
-- LOGIN: email=buyer@tenant-a.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000010',
  'buyer@tenant-a.test',
  '+2348000000010',
  'qhuyzD3U7l+qG7LMPdTuXw==:abwMiLvssjX4P8TVK7e0qdKRmfgLS7Kvjta429d+GrA=',
  1,
  'member', 't2', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-011: Seller in TNT-003 — B2B seller role
-- Required before: TC-B001–TC-B009
-- LOGIN: email=seller@tenant-c.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000011',
  'seller@tenant-c.test',
  '+2348000000011',
  'scLT5PWmscLT5PWmscLT5A==:ab0pjF3/95SdR6nNtCA+SC75t/280aOPcFLkbTKyzwA=',
  1,
  'owner', 't2', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-012: law-firm tenant owner (TNT-004) — L3 HITL compliance tests
-- Required before: TC-HR001, TC-HR002 (law-firm NBA HITL)
-- LOGIN: email=lawfirm@tenant-d.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000012',
  'lawfirm@tenant-d.test',
  '+2348000000012',
  'wtPk9aa3wtPk9aa3wtPk9Q==:VlG3Vc5KowKklmfLwEwIPC1qAMZYC01rPzmmc+g7Urw=',
  1,
  'owner', 't3', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);

-- USR-013: polling-unit tenant admin (TNT-005) — voter PII compliance tests
-- Required before: TC-HR005 (no voter PII in polling-unit)
-- LOGIN: email=pollingunit@tenant-e.test  password=QaTest#2026!  (no TOTP)
INSERT OR REPLACE INTO users (
  id, email, phone,
  password_hash, password_hash_version,
  role, kyc_tier, kyc_status,
  workspace_id, tenant_id,
  created_at, updated_at
) VALUES (
  '00000000-0000-4000-a000-000000000013',
  'pollingunit@tenant-e.test',
  '+2348000000013',
  '0+T1prfI0+T1prfI0+T1pg==:ML5r3r+/9vylLnIzPyd7TLKFZD+aSWZkThwPvwtKmYE=',
  1,
  'admin', 't3', 'verified',
  'workspace_platform_seed_discovery',
  'tenant_platform_seed',
  strftime('%s','now'),
  strftime('%s','now')
);
