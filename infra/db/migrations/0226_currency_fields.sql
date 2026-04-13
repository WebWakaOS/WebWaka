-- Migration: 0226_currency_fields
-- Description: Add currency_code to transactional tables for MED-014 (PROD-06) — P6-D
-- Forward-compatibility stub: all current operations use NGN/kobo.
-- Invariant: P9 (amounts remain INTEGER kobo)

ALTER TABLE subscriptions     ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE transactions       ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE billing_history    ADD COLUMN currency_code TEXT NOT NULL DEFAULT 'NGN';
