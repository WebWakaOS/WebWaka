-- Accounting Firm Seed — Pillar 2 Template
-- Niche ID: P2-accounting-firm-accounting-firm-audit
-- Generated: 2026-04-26

INSERT INTO website_templates (
  slug, vertical_slug, display_name, tagline, category, pillar, niche_family, family_role,
  pages, nigeria_first_priority, nafdac_required, cac_required, whatsapp_cta, currency,
  trust_signals, payment_methods, template_status, version, created_at
) VALUES (
  'accounting-firm-accounting-firm-audit', 'accounting-firm',
  'Accounting Firm', 'ICAN-certified audit, tax & advisory services — trusted by Nigerian businesses',
  'professional', 2, 'NF-PRF-SVC', 'standalone',
  ARRAY['home','services','team','contact'],
  'high', false, true, true, 'NGN',
  ARRAY['ICAN Certified','ACCA Member','CAC Registered','FIRS Compliant','WhatsApp Consultation','NDPR Compliant'],
  ARRAY['bank_transfer','paystack','pos','ussd'],
  'active', '1.0.0', NOW()
) ON CONFLICT (slug) DO UPDATE SET template_status = EXCLUDED.template_status, version = EXCLUDED.version, updated_at = NOW();
