-- Solar Installer / Renewable Energy Seed — Pillar 2 Template
-- Niche ID: P2-solar-installer-solar-installer-renewable
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'solar-installer-solar-installer-renewable', 'solar-installer',
  'Solar Installer / Renewable Energy', 'NERC-certified solar & renewable energy installation across Nigeria',
  'commerce', 2, 'NF-COM-SVC', 'standalone',
  ARRAY['home','solutions','projects','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['NERC Certified','NAEE Member','REA Partner','SON Standards','CAC Registered','WhatsApp Quote','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
