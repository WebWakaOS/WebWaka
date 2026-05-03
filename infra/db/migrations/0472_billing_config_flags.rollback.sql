-- Rollback 0472: Remove billing runtime configuration flags
DELETE FROM configuration_flags
WHERE id IN ('flag_billing_grace_days', 'flag_billing_default_interval');
