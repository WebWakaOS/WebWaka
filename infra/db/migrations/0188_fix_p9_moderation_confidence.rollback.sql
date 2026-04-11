-- Rollback: 0188_fix_p9_moderation_confidence
-- Reverse confidence_bps (integer 0-10000) back to confidence (float 0.0-1.0).

UPDATE community_moderation_log SET
  confidence_bps = CAST(confidence_bps / 10000.0 AS REAL);

ALTER TABLE community_moderation_log RENAME COLUMN confidence_bps TO confidence;
