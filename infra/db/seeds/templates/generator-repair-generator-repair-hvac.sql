-- Generator Repair & HVAC Seed — Pillar 2 Template
-- Niche ID: P2-generator-repair-generator-repair-hvac
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'generator-repair-generator-repair-hvac', 'generator-repair',
  'Generator Repair & HVAC', 'COREN-certified generator & AC repairs — quick response across Nigeria',
  'professional', 2, 'NF-PRF-SVC', 'standalone',
  ARRAY['home','services','pricing','contact'],
  'critical', false, true, true, 'NGN',
  ARRAY['COREN Certified','NERC Compliant','CAC Registered','SON Standards','WhatsApp Emergency','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
