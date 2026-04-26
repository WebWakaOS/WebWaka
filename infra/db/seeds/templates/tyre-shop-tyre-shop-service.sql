-- Tyre Shop / Vulcanizer Site Seed — Pillar 3 Template
-- Niche ID: P3-tyre-shop-tyre-shop-service
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
  'tyre-shop-tyre-shop-service',
  'tyre-shop',
  'Tyre Shop / Vulcanizer Site',
  'Road-ready tyres — fitting, balancing, alignment & emergency patching',
  'commerce',
  3,
  'NF-COM-AUT',
  'variant',
  ARRAY['home','about','services','contact'],
  'high',
  false,
  true,
  true,
  'NGN',
  ARRAY['FRSC-Compliant Brands', 'CAC Registered', 'Emergency Patching', 'Fleet Contracts Available', 'WhatsApp Emergency CTA'],
  ARRAY['bank_transfer','paystack','pos','ussd','cash'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
