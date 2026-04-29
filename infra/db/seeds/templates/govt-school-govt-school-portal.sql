-- Government School Management Portal Seed — Pillar 3 Template
-- Niche ID: P3-govt-school-govt-school-portal
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
  'govt-school-govt-school-portal',
  'govt-school',
  'Government School Management Portal',
  'Transparent, accountable, and connected — SUBEB school portal',
  'education',
  3,
  'NF-EDU-GOV',
  'standalone',
  ARRAY['home','about','services','contact'],
  'high',
  false,
  false,
  true,
  'NGN',
  ARRAY['SUBEB Approved', 'Ministry of Education Licensed', 'SBMC Compliant', 'NDPR Compliant', 'WhatsApp CTA'],
  ARRAY['bank_transfer','pos','ussd'],
  'active',
  '1.0.0',
  NOW()
) ON CONFLICT (slug) DO UPDATE SET
  template_status = EXCLUDED.template_status,
  version = EXCLUDED.version,
  updated_at = NOW();
