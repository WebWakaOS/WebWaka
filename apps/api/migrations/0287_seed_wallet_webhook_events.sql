-- Migration: 0287_seed_wallet_webhook_events
-- Registers wallet event keys in webhook_event_type so tenants can subscribe
-- to wallet webhook notifications via their workspace settings.
-- Only 'active' event types may be subscribed to by tenants.
--
-- Phase 7 (N-108, N-109): WebhookChannel.dispatch() reads from this table.

INSERT OR IGNORE INTO webhook_event_type (id, event_key, description, payload_schema, status, created_at, updated_at)
VALUES
  ('wh_evt_wallet_funded',
   'wallet.funding.confirmed',
   'Fired when a wallet funding request is confirmed and the wallet is credited.',
   '{"type":"object","required":["wallet_id","user_id","amount_kobo","reference","new_balance_kobo"]}',
   'active', unixepoch(), unixepoch()),

  ('wh_evt_wallet_funding_rejected',
   'wallet.funding.rejected',
   'Fired when a wallet funding request is rejected by an admin.',
   '{"type":"object","required":["wallet_id","user_id","amount_kobo","reference","rejection_reason"]}',
   'active', unixepoch(), unixepoch()),

  ('wh_evt_wallet_spend',
   'wallet.spend.completed',
   'Fired when a wallet is successfully debited for a purchase.',
   '{"type":"object","required":["wallet_id","user_id","amount_kobo","vertical_slug","order_id"]}',
   'active', unixepoch(), unixepoch()),

  ('wh_evt_wallet_mla_credited',
   'wallet.mla.credited',
   'Fired when an MLA referral commission is credited to a wallet.',
   '{"type":"object","required":["wallet_id","earner_user_id","commission_kobo","referral_level"]}',
   'active', unixepoch(), unixepoch()),

  ('wh_evt_wallet_frozen',
   'wallet.admin.frozen',
   'Fired when a super admin freezes a wallet.',
   '{"type":"object","required":["wallet_id","user_id","frozen_reason"]}',
   'active', unixepoch(), unixepoch()),

  ('wh_evt_wallet_unfrozen',
   'wallet.admin.unfrozen',
   'Fired when a super admin unfreezes a wallet.',
   '{"type":"object","required":["wallet_id","user_id"]}',
   'active', unixepoch(), unixepoch());
