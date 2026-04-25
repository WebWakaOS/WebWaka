-- Seed: creator-personal-brand template registry entry
-- Pillar 2 — P2-creator-personal-brand (VN-CRE-001, NF-CRE-DIG anchor)
-- Nigeria-First: media kit + booking page, brand deal vocabulary, NGN rates
-- Milestone: M8e — P1-Original
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
  'creator-personal-brand',
  'Creator & Influencer — Personal Brand Site',
  'A Nigeria-first website template for content creators and social media influencers. Functions as a media kit, brand deal booking page, and content portfolio in one. Features email-first collaboration CTAs, NGN-priced collaboration packages with rate-on-request fallback, polished typography-forward design, and integration of social/channel links. NF-CRE-DIG family anchor — foundation for photography, podcast-studio, and motivational-speaker templates.',
  'website',
  '1.0.0',
  '^1.0.0',
  'creator',
  'creator-personal-brand',
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
WHERE slug = 'creator-personal-brand';
