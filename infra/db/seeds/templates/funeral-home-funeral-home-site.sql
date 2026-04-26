-- Funeral Home Site Seed — Pillar 3 Template
-- Niche ID: P3-funeral-home-funeral-home-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'funeral-home-funeral-home-site', 'funeral-home',
  'Burial / Funeral Home', 'Compassionate funeral services — Christian, Islamic & Traditional. 24/7 available.',
  'professional', 3, 'NF-PRO-MEM', 'standalone',
  ARRAY['home','services','faith-traditions','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['MDCN Certified Embalmers','CAC Registered','LSMW Compliant','24/7 Hotline','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
