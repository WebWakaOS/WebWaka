-- Auto Mechanic / Garage Seed — Pillar 2 Template
-- Niche ID: P2-auto-mechanic-garage-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'auto-mechanic-garage-site', 'auto-mechanic',
  'Auto Mechanic / Garage', 'Trusted vehicle repairs — Lagos & Nigeria-wide',
  'commerce', 2, 'NF-COM-SVC', 'standalone',
  ARRAY['home','services','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['CAC Registered','VIO Compliant','FRSC Certified','NAAMSA Member','WhatsApp Booking','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
