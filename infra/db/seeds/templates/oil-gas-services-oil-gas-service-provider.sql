-- Oil & Gas Service Provider Site Seed — Pillar 3 Template
-- Niche ID: P3-oil-gas-services-oil-gas-service-provider
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'oil-gas-services-oil-gas-service-provider', 'oil-gas-services',
  'Oil & Gas Service Provider', 'Upstream & midstream services — NUPRC-compliant, Nigeria-first',
  'commerce', 3, 'NF-COM-ENE', 'standalone',
  ARRAY['home','services','certifications','clients','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['NUPRC Registered','NOGIC JQS Listed','CAC Incorporated','ISO 9001','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','wire_transfer'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
