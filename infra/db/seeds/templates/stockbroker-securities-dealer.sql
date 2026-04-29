-- Seed: stockbroker-securities-dealer template registry entry
-- Nigeria-first: Stockbroker / Securities Dealer Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'stockbroker-securities-dealer',
  'Stockbroker / Securities Dealer Site',
  'Nigeria-first site for SEC-registered stockbrokers and securities dealers. NGX trading services, portfolio statements, account opening, research notes.',
  'website', '1.0.0', '^1.0.0', 'stockbroker', 'stockbroker-securities-dealer', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'stockbroker-securities-dealer';
