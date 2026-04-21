-- Rollback: 0287_seed_wallet_webhook_events
-- Removes all HandyLife Wallet webhook event type registrations seeded by this migration.
-- Safe to run repeatedly — DELETE WHERE id IN (...) is idempotent.

DELETE FROM webhook_event_type
WHERE id IN (
  'wh_evt_wallet_funded',
  'wh_evt_wallet_funding_rejected',
  'wh_evt_wallet_spend',
  'wh_evt_wallet_mla_credited',
  'wh_evt_wallet_frozen',
  'wh_evt_wallet_unfrozen'
);
