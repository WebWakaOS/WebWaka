-- Rollback: 0274_seed_phase2_notification_rules
-- Removes platform-level notification rules seeded for Phase 2 auth events.

DELETE FROM notification_rule
WHERE id IN (
  'rule_auth_invited',
  'rule_auth_email_verify_sent'
);
