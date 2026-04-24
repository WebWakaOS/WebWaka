-- Migration 0384: Add attribution_enabled column to partners table
-- Governance: white-label-policy.md — partners above a tier may disable attribution badge
-- BUG-031 / COMP-007: Column required before PATCH /partners/:id/attribution route can function
-- Invariant: T3 preserved (partners table already has tenant_id on every row)

ALTER TABLE partners ADD COLUMN attribution_enabled INTEGER NOT NULL DEFAULT 1;
