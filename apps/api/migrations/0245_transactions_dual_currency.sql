-- Migration: 0245_transactions_dual_currency
-- Description: Dual-currency recording for P24 — Multi-Currency.
-- Adds original_currency and original_amount to transactions for cross-currency recording.
-- The primary amount_kobo remains NGN (base currency); original_* fields record the
-- buyer's currency and amount before conversion.
-- P9 invariant: original_amount is also integer smallest-unit.

ALTER TABLE transactions ADD COLUMN original_currency_code TEXT;
ALTER TABLE transactions ADD COLUMN original_amount INTEGER CHECK (original_amount IS NULL OR original_amount > 0);
ALTER TABLE transactions ADD COLUMN fx_rate_used INTEGER;   -- rate × 1,000,000 at time of transaction

CREATE INDEX IF NOT EXISTS idx_transactions_currency
  ON transactions(currency_code, created_at) WHERE original_currency_code IS NOT NULL;
