-- Rollback: 0268_seed_platform_notification_templates
-- Removes all platform-seeded templates (tenant_id IS NULL)
DELETE FROM notification_template WHERE tenant_id IS NULL AND template_family IN (
  'auth.welcome',
  'auth.password_reset',
  'auth.account_locked',
  'billing.payment_success',
  'billing.payment_failed',
  'bank_transfer.receipt',
  'ai.budget_warning',
  'system.provider_down'
);
