-- Rollback 0455: Broadcast Appeals (Phase 5 E32)

DROP INDEX IF EXISTS idx_broadcast_appeals_created;
DROP INDEX IF EXISTS idx_broadcast_appeals_broadcast;
DROP INDEX IF EXISTS idx_broadcast_appeals_appellant;
DROP INDEX IF EXISTS idx_broadcast_appeals_tenant;
DROP TABLE IF EXISTS broadcast_appeals;
