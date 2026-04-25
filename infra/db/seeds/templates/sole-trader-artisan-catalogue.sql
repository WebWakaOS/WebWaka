-- Seed: sole-trader-artisan-catalogue template registry entry
-- Pillar 2 — P2-sole-trader-artisan-catalogue (VN-SVC-002, standalone)
-- Nigeria-First: WhatsApp catalogue, Nigerian English first-person voice, NGN pricing
-- Milestone: M8e
--
-- Run against the platform database to make this template available for sole-trader tenants.
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug,
  display_name,
  description,
  template_type,
  version,
  platform_compat,
  compatible_verticals,
  render_entrypoint,
  status,
  author_name,
  pricing_model,
  price_kobo,
  created_at,
  updated_at
) VALUES (
  'sole-trader-artisan-catalogue',
  'Sole Trader & Artisan — Catalogue Site',
  'A Nigeria-first website template for sole traders and artisans — tailors, carpenters, plumbers, electricians, cobblers, welders, and more. Features first-person voice ("My Work", "WhatsApp Me"), a persistent floating WhatsApp button, an NGN-priced service catalogue with price-on-request fallback, and a mobile-first design grounded in the informal economy.',
  'website',
  '1.0.0',
  '^1.0.0',
  'sole-trader',
  'sole-trader-artisan-catalogue',
  'approved',
  'WebWaka Platform',
  'free',
  0,
  datetime('now'),
  datetime('now')
);

-- Verify
SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry
WHERE slug = 'sole-trader-artisan-catalogue';
