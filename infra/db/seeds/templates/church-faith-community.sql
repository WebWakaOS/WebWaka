-- Seed: church-faith-community template registry entry
-- Pillar 2 — P2-church-faith-community (VN-CIV-001, NF-CIV-REL anchor)
-- Nigeria-First: CRITICAL priority — 300,000+ registered churches; community-first layout;
--   service times as prominent visual block; "Plan a Visit" + "Give Online" CTAs;
--   denomination badge; IT Incorporated Trustees trust context; Pentecostal-dominant vocabulary
-- Milestone: M8d — P1-Original
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
  'church-faith-community',
  'Church & Faith Community Website',
  'A Nigeria-first website template for churches and faith communities across all denominations (Pentecostal, Anglican, Catholic, Baptist, Methodist, ECWA, and more). Features community-first design with a prominent service-times block as the primary information element, denomination badge, "Plan a Visit" and "Give Online" CTAs, WhatsApp welcome team integration, and a warm welcoming register ("You are welcome — all are welcome"). Offerings represent ministries/programmes with "Free to attend" display for null prices. IT Incorporated Trustees context supported via tagline. NF-CIV-REL family anchor — foundation for mosque and ministry-mission templates. Africa-First: Nigerian Pentecostal model (RCCG, Winners, MFM) is Africa''s most exported; template scales to Ghana, Kenya, South Africa, and all Anglophone African church contexts.',
  'website',
  '1.0.0',
  '^1.0.0',
  'church',
  'church-faith-community',
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
WHERE slug = 'church-faith-community';
