-- Rollback: 0462_pilot_rollout
-- Removes all pilot rollout tables and their indexes.

DROP TABLE IF EXISTS pilot_feedback;
DROP TABLE IF EXISTS pilot_feature_flags;
DROP TABLE IF EXISTS pilot_operators;
