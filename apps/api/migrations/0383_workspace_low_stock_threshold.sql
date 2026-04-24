-- Migration 0383: workspace-level low_stock_threshold (BUG-049)
-- Adds a per-workspace configurable threshold for low-stock alerts.
-- Default: NULL (inherits platform default of 5 — see pos-business route).
-- When set, overrides the route-level default without requiring a query-param every call.
-- Rollback: ALTER TABLE workspaces DROP COLUMN low_stock_threshold;

ALTER TABLE workspaces ADD COLUMN low_stock_threshold INTEGER;
