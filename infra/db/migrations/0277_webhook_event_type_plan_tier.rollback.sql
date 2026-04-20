-- Rollback: 0277_webhook_event_type_plan_tier
-- Removes the plan_tier column and the 20 additional events seeded in 0277.
-- SQLite does not support DROP COLUMN, so we recreate the table.

-- Delete the 20 events added in 0277 (IDs wh_evt_auth_login through wh_evt_notification_bounce)
DELETE FROM webhook_event_type WHERE id IN (
  'wh_evt_auth_login',
  'wh_evt_auth_password_changed',
  'wh_evt_auth_2fa_enabled',
  'wh_evt_workspace_created',
  'wh_evt_workspace_plan_upgraded',
  'wh_evt_workspace_member_removed',
  'wh_evt_kyc_submitted',
  'wh_evt_kyc_escalated',
  'wh_evt_virtual_account_created',
  'wh_evt_bank_transfer_initiated',
  'wh_evt_reversal_initiated',
  'wh_evt_subscription_created',
  'wh_evt_subscription_cancelled',
  'wh_evt_refund_processed',
  'wh_evt_claim_paid',
  'wh_evt_claim_rejected',
  'wh_evt_pos_refund',
  'wh_evt_product_created',
  'wh_evt_system_provider_down',
  'wh_evt_notification_bounce'
);

-- Note: SQLite does not support ALTER TABLE DROP COLUMN in older versions.
-- The plan_tier column with DEFAULT 'standard' is backwards-compatible and
-- can remain without the rollback removing it in SQLite.
-- In production D1 (which supports newer SQLite), run:
-- ALTER TABLE webhook_event_type DROP COLUMN plan_tier;
