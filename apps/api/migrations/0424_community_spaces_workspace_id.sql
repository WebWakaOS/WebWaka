-- Migration: 0389_community_spaces_workspace_id
-- Fix: community_spaces was missing workspace_id column (schema-code mismatch confirmed).
-- The @webwaka/community package INSERT SQL and TypeScript CommunitySpace type
-- both reference workspace_id; this migration aligns the D1 schema with them.
--
-- Pre-launch: no backward-compat burden. Column added directly.
-- community_spaces with no workspace are given a sentinel 'unassigned' value;
-- in practice the table is empty pre-launch.

ALTER TABLE community_spaces ADD COLUMN workspace_id TEXT NOT NULL DEFAULT 'unassigned';

CREATE INDEX IF NOT EXISTS idx_community_spaces_workspace
  ON community_spaces(workspace_id, tenant_id);

-- Remove the single-space-per-workspace hard constraint that was enforced only
-- via app-layer CommunityEntitlements. The entitlements package now uses plan-
-- based limits (FREE=1, STARTER/GROWTH=3, PRO=10, ENTERPRISE=-1) rather than
-- a hardcoded 1.  This migration records the architectural decision only; no
-- SQL CHECK was ever on the table so no DROP is needed.
--
-- Annotation: one-CommunitySpace-per-workspace rule REMOVED (ADR encoded inline).
-- Rationale: support groups require multiple spaces per workspace (ward/LGA/state/
-- national hierarchy). Multi-space policy is now governed by plan entitlements.
