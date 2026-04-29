-- Seed: tech-hub-innovation-centre template registry entry
-- Pillar 2 — P2-tech-hub-innovation-centre (VN-PLC-002, standalone)
-- Nigeria-First: HIGH priority — NITDA + GIZ + World Bank affiliation badges;
--   dual CTA "Apply for Space" + "View Programmes"; coworking + incubation + acceleration;
--   portfolio companies as trust signals; null → "Enquire for pricing";
--   CcHUB / FATE Foundation / Co-Creation Hub / Ventures Platform context
-- Milestone: M8e — P1-Original (standalone)
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'tech-hub-innovation-centre',
  'Tech Hub / Innovation Centre Site',
  'A Nigeria-first website template for Nigerian tech hubs and innovation centres (CcHUB, FATE Foundation, Co-Creation Hub, Ventures Platform, Itanna, Seedstars context). CAC registration, NITDA accreditation, and international partner (GIZ, World Bank, LASER) badges as trust signals. Dual CTA: "Apply for Space" and "View Programmes". Coworking, incubation, and acceleration as primary service types. Programmes as offerings; null priceKobo → "Enquire for pricing". Energetic builder-community register. Portfolio companies referenced as social proof. Standalone — .th- CSS namespace. P1 standalone anchor for innovation/place vertical.',
  'website', '1.0.0', '^1.0.0', 'tech-hub', 'tech-hub-innovation-centre', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'tech-hub-innovation-centre';
