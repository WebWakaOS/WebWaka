-- Cargo Truck / Fleet Operator Site Seed — Pillar 3 Template
-- Niche ID: P3-cargo-truck-cargo-fleet-ops
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'cargo-truck-cargo-fleet-ops', 'cargo-truck',
  'Cargo Fleet Operator', 'FRSC-roadworthy haulage — Apapa to Kano, Onitsha, Abuja & ECOWAS',
  'transport', 3, 'NF-TRP-FRT', 'standalone',
  ARRAY['home','routes','fleet','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['FRSC Roadworthy','RTEAN Member','CAC Registered','GPS Tracked Fleet','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
