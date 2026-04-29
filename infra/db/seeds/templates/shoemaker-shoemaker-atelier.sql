-- Shoemaker Atelier Site Seed — Pillar 3 Template
-- Niche ID: P3-shoemaker-shoemaker-atelier
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'shoemaker-shoemaker-atelier', 'shoemaker',
  'Shoe Cobbler / Shoe Maker Atelier', 'Bespoke shoe making & expert cobbling — Aba-trained craftsmen',
  'commerce', 3, 'NF-COM-FSH', 'standalone',
  ARRAY['home','catalogue','repairs','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['Aba Craft Heritage','CAC Registered','SON Compliant','WhatsApp Orders','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
