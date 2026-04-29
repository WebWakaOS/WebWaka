-- Seed: microfinance-bank-mfb-site template registry entry
-- Nigeria-first: Microfinance Bank Site
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'microfinance-bank-mfb-site',
  'Microfinance Bank Site',
  'Nigeria-first site for CBN-licensed microfinance banks. Loan products, savings accounts, MSME lending, branch/agent network, CBN licence display.',
  'website', '1.0.0', '^1.0.0', 'microfinance-bank', 'microfinance-bank-mfb-site', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'microfinance-bank-mfb-site';
