-- Rollback for migration 0037a
-- Reverts the 6 corrected slugs back to the default '["ops","marketplace"]'
-- (which is what 0037's silent failures left them as)
-- WARNING: This rollback should only be applied if 0037a needs to be reversed in isolation.
-- In most cases, rolling back to a pre-0037a state is not desirable.

UPDATE verticals SET primary_pillars = '["ops","marketplace"]'
WHERE slug IN (
  'photography',
  'dental-clinic',
  'vet-clinic',
  'training-institute',
  'mobile-money-agent',
  'bureau-de-change'
);
