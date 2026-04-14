-- Migration: 0243_fx_rates
-- Description: FX exchange rate table for P24 — Multi-Currency.
-- Rates stored as integers scaled by 1,000,000 to avoid floats (P9 invariant extended).
-- Example: 1 NGN = 0.00065 USD → rate = 650 (0.00065 × 1,000,000).
-- A CRON job refreshes rates from Open Exchange Rates or Paystack FX API.
-- Non-tenant-scoped: FX rates are platform-wide.

CREATE TABLE IF NOT EXISTS fx_rates (
  id              TEXT NOT NULL PRIMARY KEY,
  base_currency   TEXT NOT NULL DEFAULT 'NGN',
  quote_currency  TEXT NOT NULL,
  -- Integer-encoded rate: actual_rate = rate / 1_000_000
  rate            INTEGER NOT NULL CHECK (rate > 0),
  rate_inverse    INTEGER NOT NULL CHECK (rate_inverse > 0),
  source          TEXT NOT NULL DEFAULT 'manual'
                  CHECK (source IN ('manual', 'paystack', 'openexchangerates', 'cron')),
  effective_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at      INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_fx_rates_pair_time
  ON fx_rates(base_currency, quote_currency, effective_at);

CREATE INDEX IF NOT EXISTS idx_fx_rates_lookup
  ON fx_rates(base_currency, quote_currency, expires_at);
