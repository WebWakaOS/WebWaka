-- Produce Aggregator / Storage Hub Site Seed — Pillar 3 Template
-- Niche ID: P3-produce-aggregator-produce-aggregator-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug,
  vertical_slug,
  display_name,
  tagline,
  category,
  pillar,
  niche_family,
  family_role,
  pages,
  nigeria_first_priority,
  nafdac_required,
  cac_required,
  whatsapp_cta,
  currency,
  trust_signals,
  payment_methods,
  template_status,
  version,
  created_at
) VALUES (
  'produce-aggregator-produce-aggregator-site',
  'produce-aggregator',
  'Produce Storage / Market Aggregator Site',
  'AFEX-compliant commodity hub — maize, soybeans, rice & groundnuts',
  'agricultural',
  3,
  'NF-AGR-MKT',
  'standalone',
  ARRAY['home','about','services','contact'],
  'medium',
  false,
  true,
  true,
  'NGN',
  ARRAY['FMARD Registered', 'AFEX Compliant', 'NIRSAL Partner', 'CAC Registered', 'WhatsApp Commodity Enquiry'],
  ARRAY['bank_transfer','paystack','pos'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
