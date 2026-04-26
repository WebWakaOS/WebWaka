-- Ward Representative / Councillor Seed — Pillar 2 Template
-- Niche ID: P2-ward-rep-ward-rep-councillor-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'ward-rep-ward-rep-councillor-site', 'ward-rep',
  'Ward Representative / Councillor', 'INEC-endorsed ward representative — serving constituents at grassroots level',
  'civic', 2, 'NF-CIV-ORG', 'standalone',
  ARRAY['home','projects','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['INEC Endorsed','State Assembly Member','SIEC Compliant','WhatsApp Contact','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
