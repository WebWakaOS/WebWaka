-- Polling Unit Representative Site Seed — Pillar 3 Template
-- Niche ID: P3-polling-unit-rep-polling-unit-rep-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'polling-unit-rep-polling-unit-rep-site', 'polling-unit-rep',
  'Polling Unit Representative Site', 'INEC BVAS transparency, voter information & civic support',
  'politics', 3, 'NF-POL-PU', 'standalone',
  ARRAY['home','polling-unit','results','civic-services','contact'],
  'high', false, false, true, 'NGN',
  ARRAY['INEC BVAS Aligned','FOIA Compliant','NDPR Compliant'],
  ARRAY['bank_transfer'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
