-- Migration 0449: Template Registry Phase 4 Extension (E25)
-- Phase 4 — Template System Rollout (Weeks 35–46, M14 gate)
--
-- Extends template_registry with 4 new columns required for the Template System:
--   module_config    — JSON object specifying enabled capability modules
--   vocabulary       — JSON object with term overrides (e.g. "Group"→"Ministry")
--   default_policies — JSON array of policy rule objects to seed into policy_rules on install
--   default_workflows — JSON array of workflow definitions to register on install
--
-- Platform Invariants:
--   T3  — tenant_id carried through to seeded policy_rules rows at install time
--   P9  — no monetary amounts stored here; amounts are nested in default_policies condition_json
--   AC-FUNC-03 — rollback in rollback/0449_rollback.sql
--
-- Why these are TEXT DEFAULT '{}' / '[]' (not NOT NULL with CHECK JSON):
--   D1 (SQLite) does not have a native JSON column type or runtime json_valid() CHECK
--   that can be applied in ALTER TABLE constraints. Validation is enforced at the API layer
--   (templates.ts publish/install routes). NOT NULL DEFAULT applied for integrity.

ALTER TABLE template_registry ADD COLUMN module_config    TEXT NOT NULL DEFAULT '{}';
ALTER TABLE template_registry ADD COLUMN vocabulary        TEXT NOT NULL DEFAULT '{}';
ALTER TABLE template_registry ADD COLUMN default_policies  TEXT NOT NULL DEFAULT '[]';
ALTER TABLE template_registry ADD COLUMN default_workflows TEXT NOT NULL DEFAULT '[]';
