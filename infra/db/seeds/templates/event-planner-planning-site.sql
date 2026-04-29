-- Event Planner Seed — Pillar 2 Template
-- Niche ID: P2-event-planner-planning-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'event-planner-planning-site', 'event-planner',
  'Event Planner', 'Full-service event planning & coordination — Nigeria's finest',
  'professional', 2, 'NF-PRF-SVC', 'standalone',
  ARRAY['home','services','portfolio','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['CAC Registered','APCON Member','AOCN Certified','WhatsApp Consultation','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
