-- Rollback: 0544_pilot_rollout
-- Removes pilot rollout infrastructure tables and indexes.

DROP TABLE IF EXISTS pilot_feedback;
DROP TABLE IF EXISTS pilot_feature_flags;
DROP TABLE IF EXISTS pilot_operators;
