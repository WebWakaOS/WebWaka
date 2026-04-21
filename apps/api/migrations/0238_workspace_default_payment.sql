-- Migration: 0238_workspace_default_payment
-- Description: Adds default_payment_method preference column to workspaces (P21-F).
-- Operators can set their preferred default payment method; POS and order flows
-- pre-select this method. Does not restrict other payment methods.

ALTER TABLE workspaces ADD COLUMN default_payment_method TEXT NOT NULL DEFAULT 'bank_transfer'
  CHECK (default_payment_method IN ('bank_transfer', 'card', 'cash', 'ussd'));
