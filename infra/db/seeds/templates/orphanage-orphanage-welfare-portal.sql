-- Orphanage / Child Welfare NGO Portal Seed — Pillar 3 Template
-- Niche ID: P3-orphanage-orphanage-welfare-portal
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'orphanage-orphanage-welfare-portal', 'orphanage',
  'Orphanage / Child Welfare NGO', 'Shelter, education & healthcare for vulnerable children in Nigeria',
  'civic', 3, 'NF-CIV-WLF', 'standalone',
  ARRAY['home','programmes','support','contact'],
  'critical', false, true, true, 'NGN',
  ARRAY['FMWSD Registered','CAC NGO','UNICEF Partner Network','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
