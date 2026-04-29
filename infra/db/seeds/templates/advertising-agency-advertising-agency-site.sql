-- Advertising Agency Seed — Pillar 2 Template
-- Niche ID: P2-advertising-agency-advertising-agency-site
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'advertising-agency-advertising-agency-site', 'advertising-agency',
  'Advertising Agency', 'APCON-licensed creative & digital advertising agency — Nigeria',
  'media', 2, 'NF-MDA-SVC', 'standalone',
  ARRAY['home','services','portfolio','contact'],
  'medium', false, true, true, 'NGN',
  ARRAY['APCON Licensed','NIPR Member','CAC Registered','NCC Digital Compliant','BON Affiliate','WhatsApp Brief','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
