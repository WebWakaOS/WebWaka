-- WebWaka OS QA Seed — Phase 7: FX Rates
-- Source: WebWaka_OS_QA_Execution_Plan.md v1.0 §3.1 Phase 7
-- Frozen baseline: WebWaka_OS_Corrected_Master_Inventory_v2.0-FROZEN
--
-- P9: FX rates stored as integers: rate × 1,000,000.
--     e.g. 1 USD = 1500 NGN → stored as 1,500,000,000 (1500 × 1,000,000)
--     This avoids floating-point precision errors.
-- D11 (DEFERRED): USDT rate is NOT seeded. Governance-blocked. When unblocked,
--     add: INSERT INTO fx_rates (base, quote, rate_scaled) VALUES ('NGN','USDT',...);
--
-- Seed applies to ALL environments (no tenant scope — FX rates are global).
-- Only super_admin (USR-001) can PATCH /fx-rates (verified by TC-F023, TC-PA005).
--
-- Seed ID → UUID mapping:
--   FX-001 = a0000000-0000-4000-c001-000000000001  (NGN→USD)
--   FX-002 = a0000000-0000-4000-c001-000000000002  (NGN→GHS)
--   FX-003 = a0000000-0000-4000-c001-000000000003  (NGN→KES)
--   FX-004 = a0000000-0000-4000-c001-000000000004  (NGN→ZAR)
--   FX-005 = a0000000-0000-4000-c001-000000000005  (NGN→CFA)

-- FX-001: NGN → USD — 1 USD = 1500 NGN
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate_scaled, updated_by_user_id, updated_at
) VALUES (
  'a0000000-0000-4000-c001-000000000001',
  'NGN', 'USD',
  1500000000,
  '00000000-0000-4000-a000-000000000001',
  strftime('%s','now')
);

-- FX-002: NGN → GHS — 1 GHS = 85 NGN
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate_scaled, updated_by_user_id, updated_at
) VALUES (
  'a0000000-0000-4000-c001-000000000002',
  'NGN', 'GHS',
  85000000,
  '00000000-0000-4000-a000-000000000001',
  strftime('%s','now')
);

-- FX-003: NGN → KES — 1 KES = 11 NGN
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate_scaled, updated_by_user_id, updated_at
) VALUES (
  'a0000000-0000-4000-c001-000000000003',
  'NGN', 'KES',
  11000000,
  '00000000-0000-4000-a000-000000000001',
  strftime('%s','now')
);

-- FX-004: NGN → ZAR — 1 ZAR = 82 NGN
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate_scaled, updated_by_user_id, updated_at
) VALUES (
  'a0000000-0000-4000-c001-000000000004',
  'NGN', 'ZAR',
  82000000,
  '00000000-0000-4000-a000-000000000001',
  strftime('%s','now')
);

-- FX-005: NGN → CFA — 1 CFA = 2 NGN
INSERT OR IGNORE INTO fx_rates (
  id, base_currency, quote_currency, rate_scaled, updated_by_user_id, updated_at
) VALUES (
  'a0000000-0000-4000-c001-000000000005',
  'NGN', 'CFA',
  2000000,
  '00000000-0000-4000-a000-000000000001',
  strftime('%s','now')
);

-- VERIFICATION QUERY (run after seeding to confirm P9 compliance):
-- SELECT base_currency, quote_currency, rate_scaled,
--        CASE WHEN typeof(rate_scaled) = 'integer' THEN 'OK' ELSE 'P9_VIOLATION' END as p9_check
-- FROM fx_rates
-- WHERE id LIKE 'a0000000%';
