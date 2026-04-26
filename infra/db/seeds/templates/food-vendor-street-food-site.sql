-- Food Vendor / Canteen Seed — Pillar 2 Template
-- Niche ID: P2-food-vendor-street-food-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'food-vendor-street-food-site', 'food-vendor',
  'Food Vendor / Canteen', 'NAFDAC-safe local meals — delicious, affordable & hygienic',
  'commerce', 2, 'NF-COM-SVC', 'standalone',
  ARRAY['home','menu','contact'],
  'critical', true, true, true, 'NGN',
  ARRAY['NAFDAC Compliant','LHAID Certified','CAC Registered','WhatsApp Order','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
