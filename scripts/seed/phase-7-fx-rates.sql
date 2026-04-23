
-- WebWaka OS QA Seed — Phase 7: FX Rates
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 7
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- SCHEMA FIX 2026-04-23: Aligned with actual 0243_fx_rates.sql schema:
--   fx_rates: id, base_currency, quote_currency,
--     rate INTEGER (not rate_scaled), rate_inverse INTEGER (req),
--     source (DEFAULT 'manual'), effective_at, expires_at
--   NOTE: no updated_by_user_id column; no updated_at column
--   UNIQUE constraint on (base_currency, quote_currency, effective_at)
--
-- P9: Rates stored as integer × 1,000,000 to avoid floating-point errors.
--     e.g. 1 USD = 1500 NGN → rate = 1500 × 1,000,000 = 1,500,000,000
--     rate_inverse = reciprocal: (1/1500) × 1,000,000 ≈ 667
-- D11 (DEFERRED): USDT rate is NOT seeded. Governance-blocked.
-- Seed applies to ALL environments (FX rates are global).
-- Only super_admin (USR-001) can PATCH /fx-rates (TC-F023, TC-PA005).
--
-- Seed ID → UUID mapping:
--   FX-001 = a0000000-0000-4000-c001-000000000001  (NGN→USD)
--   FX-002 = a0000000-0000-4000-c001-000000000002  (NGN→GHS)
--   FX-003 = a0000000-0000-4000-c001-000000000003  (NGN→KES)
--   FX-004 = a0000000-0000-4000-c001-000000000004  (NGN→ZAR)
--   FX-005 = a0000000-0000-4000-c001-000000000005  (NGN→CFA)

-- FX-001: NGN → USD — 1 USD = 1500 NGN
-- rate = 1500 × 1,000,000 = 1,500,000,000
-- rate_inverse = (1/1500) × 1,000,000 ≈ 667
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate, rate_inverse, source, effective_at
) VALUES (
  'a0000000-0000-4000-c001-000000000001',
  'NGN', 'USD',
  1500000000, 667,
  'manual', strftime('%s','now')
);

-- FX-002: NGN → GHS — 1 GHS = 85 NGN
-- rate = 85 × 1,000,000 = 85,000,000
-- rate_inverse = (1/85) × 1,000,000 ≈ 11,765
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate, rate_inverse, source, effective_at
) VALUES (
  'a0000000-0000-4000-c001-000000000002',
  'NGN', 'GHS',
  85000000, 11765,
  'manual', strftime('%s','now')
);

-- FX-003: NGN → KES — 1 KES = 11 NGN
-- rate = 11 × 1,000,000 = 11,000,000
-- rate_inverse = (1/11) × 1,000,000 ≈ 90,909
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate, rate_inverse, source, effective_at
) VALUES (
  'a0000000-0000-4000-c001-000000000003',
  'NGN', 'KES',
  11000000, 90909,
  'manual', strftime('%s','now')
);

-- FX-004: NGN → ZAR — 1 ZAR = 82 NGN
-- rate = 82 × 1,000,000 = 82,000,000
-- rate_inverse = (1/82) × 1,000,000 ≈ 12,195
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate, rate_inverse, source, effective_at
) VALUES (
  'a0000000-0000-4000-c001-000000000004',
  'NGN', 'ZAR',
  82000000, 12195,
  'manual', strftime('%s','now')
);

-- FX-005: NGN → CFA — 1 CFA = 2 NGN
-- rate = 2 × 1,000,000 = 2,000,000
-- rate_inverse = (1/2) × 1,000,000 = 500,000
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate, rate_inverse, source, effective_at
) VALUES (
  'a0000000-0000-4000-c001-000000000005',
  'NGN', 'CFA',
  2000000, 500000,
  'manual', strftime('%s','now')
);

-- VERIFICATION QUERY (run after seeding to confirm P9 compliance):
-- SELECT base_currency, quote_currency, rate, rate_inverse,
--        CASE WHEN typeof(rate) = 'integer' THEN 'OK' ELSE 'P9_VIOLATION' END as p9_check
-- FROM fx_rates
-- WHERE id LIKE 'a0000000%';

