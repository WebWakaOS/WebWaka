-- Rollback: 0278_notification_inbox_item_phase5
-- Removes the Phase 5 columns added to notification_inbox_item.
-- Requires SQLite 3.35+ (Cloudflare D1 supports DROP COLUMN as of 2023).

ALTER TABLE notification_inbox_item DROP COLUMN delivery_id;
ALTER TABLE notification_inbox_item DROP COLUMN category;
ALTER TABLE notification_inbox_item DROP COLUMN icon_type;
ALTER TABLE notification_inbox_item DROP COLUMN archived_at;
ALTER TABLE notification_inbox_item DROP COLUMN pinned_at;
ALTER TABLE notification_inbox_item DROP COLUMN dismissed_at;
ALTER TABLE notification_inbox_item DROP COLUMN snoozed_until;
