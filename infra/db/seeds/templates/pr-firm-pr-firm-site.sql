-- Public Relations Firm Site Seed — Pillar 3 Template
-- Niche ID: P3-pr-firm-pr-firm-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'pr-firm-pr-firm-site', 'pr-firm',
  'Public Relations Firm', 'Strategic PR, media relations & crisis communications — Nigeria-focused',
  'professional', 3, 'NF-PRO-COM', 'standalone',
  ARRAY['home','services','sectors','media-reach','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['NIPR Accredited','CAC Registered','APCON Adjacent','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','wire_transfer'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
