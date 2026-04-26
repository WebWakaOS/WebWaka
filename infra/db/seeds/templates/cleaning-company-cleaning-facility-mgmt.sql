-- Cleaning & Facility Management Site Seed — Pillar 3 Template
-- Niche ID: P3-cleaning-company-cleaning-facility-mgmt
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'cleaning-company-cleaning-facility-mgmt', 'cleaning-company',
  'Cleaning & Facility Management Co.', 'Professional cleaning — hospitals, offices, estates & warehouses',
  'commerce', 3, 'NF-COM-SVC', 'standalone',
  ARRAY['home','services','sectors','credentials','contact'],
  'high', true, true, true, 'NGN',
  ARRAY['CAC Registered','NAFDAC Products','ISO 9001 Aligned','LASEPA Compliant','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','wire_transfer'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
