-- Migration: 0378_workspace_payment_bank_account
-- Description: Per-workspace receiving bank account for customer-facing payments.
--
-- Distinct from the platform bank account (stored in WALLET_KV as
-- platform:payment:bank_account) which is WebWaka's own receiving account
-- for subscription fees.
--
-- This column stores the workspace owner's business bank account, used when
-- customers pay the workspace operator (POS, B2B, commerce flows).
--
-- Shape: {"bank_name":"","account_number":"","account_name":"","bank_code":"","sort_code":""}
-- Managed via: PATCH /workspaces/:id (bankAccount field, admin role)

ALTER TABLE workspaces ADD COLUMN payment_bank_account_json TEXT;
