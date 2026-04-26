-- Container Depot / Logistics Hub Site Seed — Pillar 3 Template
-- Niche ID: P3-container-depot-container-depot-hub
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'container-depot-container-depot-hub', 'container-depot',
  'Container Depot & Logistics Hub', 'NPA-licensed ICD — Apapa, Tin Can & inland haulage',
  'transport', 3, 'NF-TRP-PORT', 'standalone',
  ARRAY['home','services','stats','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['NPA Licensed','Nigeria Customs Compliant','NIMASA Registered','CAC Incorporated','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','wire_transfer'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
