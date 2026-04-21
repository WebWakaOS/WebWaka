-- Migration: 0277_webhook_event_type_plan_tier
-- Description: N-132 (Phase 4) — Add plan_tier column to webhook_event_type table.
--   Seeds additional events to reach the 30-event curated starter set per OQ-013.
--
-- OQ-013 resolution (spec lines 2069-2080):
--   'standard'   — up to 25 active subscriptions per workspace; 30 starter events
--   'business'   — up to 100 active subscriptions; full 30 starter events
--   'enterprise' — unlimited subscriptions; full event catalog (100+)
--
-- Phase 4 seeds 30 starter events as plan_tier='standard'.
-- Events added here (IDs 11-30) complement the 10 events from migration 0272.

-- Add plan_tier column (default 'standard' for backwards-compat with existing rows)
ALTER TABLE webhook_event_type ADD COLUMN plan_tier TEXT NOT NULL DEFAULT 'standard'
  CHECK (plan_tier IN ('standard', 'business', 'enterprise'));

-- Update existing 10 seeded events to plan_tier='standard'
UPDATE webhook_event_type SET plan_tier = 'standard';

-- Seed events 11-30 (completing the 30-event starter set)
INSERT OR IGNORE INTO webhook_event_type
  (id, event_key, description, payload_schema, status, plan_tier, created_at, updated_at)
VALUES
  -- Auth / identity
  ('wh_evt_auth_login',
   'auth.user.login',
   'Fired when a user successfully logs in.',
   '{"type":"object","required":["user_id","workspace_id","ip_hash"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_auth_password_changed',
   'auth.user.password_changed',
   'Fired when a user changes their password.',
   '{"type":"object","required":["user_id"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_auth_2fa_enabled',
   'auth.user.2fa_enabled',
   'Fired when a user enables two-factor authentication.',
   '{"type":"object","required":["user_id","method"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  -- Workspace
  ('wh_evt_workspace_created',
   'workspace.created',
   'Fired when a new workspace is created.',
   '{"type":"object","required":["workspace_id","owner_id","plan"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_workspace_plan_upgraded',
   'workspace.plan_upgraded',
   'Fired when a workspace upgrades its subscription plan.',
   '{"type":"object","required":["workspace_id","old_plan","new_plan"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_workspace_member_removed',
   'workspace.member_removed',
   'Fired when a member is removed from a workspace.',
   '{"type":"object","required":["workspace_id","removed_user_id","removed_by"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  -- KYC
  ('wh_evt_kyc_submitted',
   'kyc.submitted',
   'Fired when a user submits KYC documents for review.',
   '{"type":"object","required":["user_id","kyc_level","submitted_at"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_kyc_escalated',
   'kyc.escalated',
   'Fired when a KYC review is escalated for manual review.',
   '{"type":"object","required":["user_id","reason"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  -- Banking / transfers
  ('wh_evt_virtual_account_created',
   'virtual_account.created',
   'Fired when a virtual bank account is created for a user.',
   '{"type":"object","required":["user_id","workspace_id","account_number","bank_name"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_bank_transfer_initiated',
   'bank_transfer.initiated',
   'Fired when a bank transfer is initiated.',
   '{"type":"object","required":["transfer_id","amount_kobo","recipient_account_number"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_reversal_initiated',
   'bank_transfer.reversal_initiated',
   'Fired when a bank transfer reversal is initiated.',
   '{"type":"object","required":["transfer_id","reversal_reason"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  -- Billing / subscriptions
  ('wh_evt_subscription_created',
   'billing.subscription_created',
   'Fired when a workspace subscription is created.',
   '{"type":"object","required":["workspace_id","plan","amount_kobo"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_subscription_cancelled',
   'billing.subscription_cancelled',
   'Fired when a workspace subscription is cancelled.',
   '{"type":"object","required":["workspace_id","plan","cancelled_at"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_refund_processed',
   'billing.refund_processed',
   'Fired when a refund is processed.',
   '{"type":"object","required":["workspace_id","amount_kobo","paystack_ref"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  -- Insurance / claims
  ('wh_evt_claim_paid',
   'claim.paid',
   'Fired when a claim payout is processed.',
   '{"type":"object","required":["claim_id","amount_kobo","profile_id"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_claim_rejected',
   'claim.rejected',
   'Fired when a claim is rejected.',
   '{"type":"object","required":["claim_id","rejection_reason"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  -- POS / commerce
  ('wh_evt_pos_refund',
   'pos.refund_processed',
   'Fired when a POS sale refund is processed.',
   '{"type":"object","required":["sale_id","refund_amount_kobo","workspace_id"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  ('wh_evt_product_created',
   'product.created',
   'Fired when a product is created in the product catalog.',
   '{"type":"object","required":["product_id","workspace_id","name"]}',
   'active', 'standard', unixepoch(), unixepoch()),

  -- System / platform
  ('wh_evt_system_provider_down',
   'system.provider.down',
   'Fired when a notification provider is detected as degraded or down.',
   '{"type":"object","required":["provider","channel","reason"]}',
   'active', 'business', unixepoch(), unixepoch()),

  ('wh_evt_notification_bounce',
   'notification.delivery.bounced',
   'Fired when a notification delivery permanently bounces (hard bounce).',
   '{"type":"object","required":["delivery_id","tenant_id","channel","bounce_reason"]}',
   'active', 'business', unixepoch(), unixepoch());
