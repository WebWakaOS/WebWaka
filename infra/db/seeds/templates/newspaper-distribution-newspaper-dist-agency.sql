-- Newspaper Distribution Agency Site Seed — Pillar 3 Template
-- Niche ID: P3-newspaper-distribution-newspaper-dist-agency
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'newspaper-distribution-newspaper-dist-agency', 'newspaper-distribution',
  'Newspaper Distribution Agency', 'Early-morning delivery — Punch, Vanguard, ThisDay, BusinessDay & more',
  'media', 3, 'NF-MED-PRT', 'standalone',
  ARRAY['home','titles','plans','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['NPC Registered','NUJ Partner','CAC Incorporated','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
