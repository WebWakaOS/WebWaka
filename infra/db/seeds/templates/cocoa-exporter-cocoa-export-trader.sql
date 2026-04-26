-- Cocoa / Export Commodities Trader Site Seed — Pillar 3 Template
-- Niche ID: P3-cocoa-exporter-cocoa-export-trader
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
  'cocoa-exporter-cocoa-export-trader',
  'cocoa-exporter',
  'Cocoa / Export Commodities Trader Site',
  'CAN-registered Nigerian cocoa & export commodity trading',
  'agricultural',
  3,
  'NF-AGR-COM',
  'standalone',
  ARRAY['home','about','services','contact'],
  'high',
  false,
  true,
  true,
  'NGN',
  ARRAY['CAN Registered', 'NCDC Compliant', 'FMARD Licensed', 'CAC Registered', 'Grade-1 Certified', 'WhatsApp Trading Desk'],
  ARRAY['bank_transfer','paystack','lc','documentary_credit'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
