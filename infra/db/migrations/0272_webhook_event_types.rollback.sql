-- Rollback: 0272_webhook_event_types
DROP INDEX IF EXISTS idx_webhook_event_type_status;
DROP TABLE IF EXISTS webhook_event_type;
