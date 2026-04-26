-- Government Agency / Parastatal Portal Seed — Pillar 3 Template
-- Niche ID: P3-government-agency-govt-agency-portal
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'government-agency-govt-agency-portal', 'government-agency',
  'Government Agency / Parastatal Portal', 'Official portal — services, publications & FOIA-compliant contact',
  'institutional', 3, 'NF-INS-GOV', 'standalone',
  ARRAY['home','services','publications','contact'],
  'high', false, false, true, 'NGN',
  ARRAY['NITDA e-Gov Framework','FOIA 2011 Compliant','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','remita'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
