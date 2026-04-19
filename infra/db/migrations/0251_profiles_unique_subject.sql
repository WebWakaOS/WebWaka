-- Migration 0251: Add unique constraint to prevent duplicate discovery profiles
-- for the same subject entity (subject_type + subject_id must be unique).
--
-- Rationale: A missing UNIQUE on (subject_type, subject_id) could allow multiple
-- profiles for the same entity, corrupting discovery results and claim flows.
--
-- Safety: Run after confirming no duplicates exist in production.
-- Pre-check: SELECT subject_type, subject_id, COUNT(*) FROM profiles
--              GROUP BY subject_type, subject_id HAVING COUNT(*) > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_subject_unique
  ON profiles (subject_type, subject_id);
