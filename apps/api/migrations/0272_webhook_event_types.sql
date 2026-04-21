-- Migration: 0272_webhook_event_types
-- Description: Create webhook_event_type table — registry of events that can be
--   forwarded to tenant-configured webhook endpoints (channel='webhook').
--   Tenants select which events to subscribe to via their workspace settings.
--
-- Phase 7 (N-108, N-109): WebhookChannel.dispatch() reads from this table.
-- Only 'active' event types may be subscribed to by tenants.
-- 'deprecated' event types retain existing subscriptions but block new ones.

CREATE TABLE IF NOT EXISTS webhook_event_type (
  id            TEXT PRIMARY KEY,             -- 'wh_evt_type_' + uuid
  event_key     TEXT NOT NULL UNIQUE,         -- matches notification_event.event_key
  description   TEXT NOT NULL,
  payload_schema TEXT NOT NULL,              -- JSON Schema for the webhook payload
  status        TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deprecated')),
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Seed core webhook-eligible event types
INSERT OR IGNORE INTO webhook_event_type (id, event_key, description, payload_schema, status, created_at, updated_at) VALUES
  ('wh_evt_auth_registered',      'auth.user.registered',      'Fired when a new user registers.',                   '{"type":"object","required":["user_id","email","workspace_id"]}',                             'active', unixepoch(), unixepoch()),
  ('wh_evt_billing_pay_success',  'billing.payment_succeeded', 'Fired when a billing payment is successful.',        '{"type":"object","required":["workspace_id","amount_kobo","plan","paystack_ref"]}',            'active', unixepoch(), unixepoch()),
  ('wh_evt_billing_pay_failed',   'billing.payment_failed',    'Fired when a billing payment fails.',                '{"type":"object","required":["workspace_id","amount_kobo","reason"]}',                        'active', unixepoch(), unixepoch()),
  ('wh_evt_bank_transfer_done',   'bank_transfer.completed',   'Fired when a bank transfer completes successfully.', '{"type":"object","required":["transfer_id","amount_kobo","recipient_account_number"]}',       'active', unixepoch(), unixepoch()),
  ('wh_evt_bank_transfer_failed', 'bank_transfer.failed',      'Fired when a bank transfer fails.',                  '{"type":"object","required":["transfer_id","amount_kobo","reason"]}',                        'active', unixepoch(), unixepoch()),
  ('wh_evt_kyc_approved',         'kyc.approved',              'Fired when KYC verification is approved.',           '{"type":"object","required":["user_id","kyc_level"]}',                                       'active', unixepoch(), unixepoch()),
  ('wh_evt_kyc_rejected',         'kyc.rejected',              'Fired when KYC verification is rejected.',           '{"type":"object","required":["user_id","rejection_reason"]}',                                'active', unixepoch(), unixepoch()),
  ('wh_evt_claim_submitted',      'claim.submitted',           'Fired when a claim is submitted.',                   '{"type":"object","required":["claim_id","profile_id","workspace_id"]}',                       'active', unixepoch(), unixepoch()),
  ('wh_evt_claim_approved',       'claim.approved',            'Fired when a claim is approved.',                    '{"type":"object","required":["claim_id","profile_id"]}',                                      'active', unixepoch(), unixepoch()),
  ('wh_evt_pos_sale',             'pos.sale_completed',        'Fired when a POS sale is completed.',                '{"type":"object","required":["sale_id","amount_kobo","workspace_id"]}',                       'active', unixepoch(), unixepoch());

CREATE INDEX IF NOT EXISTS idx_webhook_event_type_status
  ON webhook_event_type(status, event_key);
