-- Rollback: 0463_pilot_cohort1_seed
-- Removes cohort 1 pilot seed data and the prune scheduler job.

DELETE FROM scheduled_jobs WHERE name = 'pilot-prune-expired-flags';

DELETE FROM pilot_feature_flags WHERE id IN (
  'pff_c1_001_ai', 'pff_c1_001_pro',
  'pff_c1_002_ai', 'pff_c1_002_pro',
  'pff_c1_003_ai', 'pff_c1_003_pro',
  'pff_c1_004_ai', 'pff_c1_004_pro',
  'pff_c1_005_ai', 'pff_c1_005_pro'
);

DELETE FROM pilot_operators WHERE id IN (
  'pop_c1_001', 'pop_c1_002', 'pop_c1_003', 'pop_c1_004', 'pop_c1_005'
);
