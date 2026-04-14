-- Migration: 0244_workspace_currency_preference
-- Description: Workspace-level display currency preference for P24 — Multi-Currency.
-- This controls what currency the operator sees amounts in (display only).
-- Transaction currency is determined at order creation; settlement is always NGN for now.

ALTER TABLE workspaces ADD COLUMN display_currency TEXT NOT NULL DEFAULT 'NGN'
  CHECK (display_currency IN ('NGN', 'GHS', 'KES', 'ZAR', 'USD', 'CFA', 'USDT'));
