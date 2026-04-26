-- Constituency Development Office Portal Seed — Pillar 3 Template
-- Niche ID: P3-constituency-office-constituency-dev-portal
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'constituency-office-constituency-dev-portal', 'constituency-office',
  'Constituency Development Office Portal', 'CDF transparency, projects & constituent service portal',
  'politics', 3, 'NF-POL-CON', 'standalone',
  ARRAY['home','projects','cdf-report','contact'],
  'high', false, false, true, 'NGN',
  ARRAY['CDF Act Compliant','FOIA Compliant','INEC Registered','NDPR Compliant'],
  ARRAY['bank_transfer'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
