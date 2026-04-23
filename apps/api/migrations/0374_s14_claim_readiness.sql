-- 0374_s14_claim_readiness.sql
-- Phase S14: Transition all platform-seed profiles from claim_state='seeded'
-- to 'claimable', enabling claim CTAs to appear in public discovery.
-- Pre-condition QA checks passed: 0 empty keywords, 0 missing primary_place_id.
-- Also adds refresh_interval_days + next_refresh_due to seed_sources.
--
-- FIX (prod idempotence): Use IF NOT EXISTS so this migration is safe to apply
-- even if the columns were added manually or by a partial earlier run on production.
-- D1 uses SQLite 3.37+ which supports ALTER TABLE ... ADD COLUMN IF NOT EXISTS.

ALTER TABLE seed_sources ADD COLUMN IF NOT EXISTS refresh_interval_days INTEGER;
ALTER TABLE seed_sources ADD COLUMN IF NOT EXISTS next_refresh_due TEXT;

UPDATE profiles
SET    claim_state = 'claimable',
       updated_at  = strftime('%s', 'now')
WHERE  tenant_id   = 'tenant_platform_seed'
AND    claim_state = 'seeded';
