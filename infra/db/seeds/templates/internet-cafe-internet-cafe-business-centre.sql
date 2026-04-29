-- Internet Café / Business Centre Site Seed — Pillar 3 Template
-- Niche ID: P3-internet-cafe-internet-cafe-business-centre
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'internet-cafe-internet-cafe-business-centre', 'internet-cafe',
  'Internet Café / Business Centre', 'High-speed internet, printing, JAMB & WAEC registration services',
  'commerce', 3, 'NF-COM-DIG', 'standalone',
  ARRAY['home','services','pricing','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['NCC Compliant','NITDA Aligned','CAC Registered','JAMB Licensed','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
