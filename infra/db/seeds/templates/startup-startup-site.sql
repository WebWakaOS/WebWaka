-- Startup / Early-Stage Company Site Seed — Pillar 3 Template
-- Niche ID: P3-startup-startup-site
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
  'startup-startup-site',
  'startup',
  'Startup / Early-Stage Company Site',
  'Building for Africa — traction-first, investor-ready',
  'professional',
  3,
  'NF-PRO-TEC',
  'standalone',
  ARRAY['home','about','services','contact'],
  'high',
  false,
  true,
  true,
  'NGN',
  ARRAY['CAC Registered', 'NITDA Compliant', 'NDPR Compliant', 'WhatsApp Demo Request', 'Accelerator Backed'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
