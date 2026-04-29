-- Road Transport Workers Union Seed — Pillar 2 Template
-- Niche ID: P2-road-transport-union-road-transport-union-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'road-transport-union-road-transport-union-site', 'road-transport-union',
  'Road Transport Workers Union', 'FRSC/NLC-affiliated transport union — member services & benefits',
  'civic', 2, 'NF-CIV-ORG', 'standalone',
  ARRAY['home','membership','services','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['FRSC Affiliated','NLC Member','VIO Compliant','CAC Registered','WhatsApp Contact','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
