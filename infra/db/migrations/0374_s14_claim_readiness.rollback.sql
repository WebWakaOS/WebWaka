-- Rollback: 0374_s14_claim_readiness
ALTER TABLE seed_sources DROP COLUMN refresh_interval_days;
ALTER TABLE seed_sources DROP COLUMN next_refresh_due;
UPDATE profiles SET claim_state = 'seeded', updated_at = strftime('%s','now')
WHERE tenant_id = 'tenant_platform_seed' AND claim_state = 'claimable';
