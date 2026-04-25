-- Seed: restaurant-general-eatery template registry entry
-- Pillar 2 — P2-restaurant-general-eatery (VN-FDS-001, NF-FDS anchor)
-- Nigeria-First: Buka / eatery model, WhatsApp ordering, NGN pricing
--
-- Run this seed against the platform database to make the template
-- available in the marketplace for restaurant vertical tenants.
--
-- Platform Invariants:
--   T3 — no tenant_id predicate on INSERT (this is a platform-level registry record)
--   T4 — price_kobo is integer (0 = free)
--   P9 — compatible_verticals includes "restaurant" as primary target
--
-- Idempotent: uses INSERT OR IGNORE so re-running this seed is safe.

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
  'restaurant-general-eatery',
  'Restaurant & Eatery — Buka Site',
  'A Nigeria-first website template for restaurants, eateries, and buka joints. Features WhatsApp ordering CTA, NGN-priced menu grid, location info, and a contact form. Mobile-first design with warm, food-focused aesthetic. NF-FDS family anchor — foundation for food-vendor, catering, and bakery templates.',
  'website',
  '1.0.0',
  '^1.0.0',
  'restaurant,food-vendor,catering,bakery,restaurant-chain',
  'restaurant-general-eatery',
  'approved',
  'WebWaka Platform',
  'free',
  0,
  datetime('now'),
  datetime('now')
);

-- Verify the insert
SELECT
  slug,
  display_name,
  template_type,
  status,
  compatible_verticals,
  pricing_model
FROM template_registry
WHERE slug = 'restaurant-general-eatery';
