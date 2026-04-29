-- Seed: Dental Clinic / Specialist Care Template
-- Niche ID: P40
-- Vertical: dental-clinic
-- Research brief: docs/templates/research/dental-clinic-specialist-care-brief.md
-- Platform invariants: T4 (kobo), P13 (patient_ref_id opaque, no diagnosis), P2 (Nigeria First)
-- Trust badge: MDCN facility registration
-- SLUG MISMATCH NOTE: vertical slug 'dental' may conflict with 'dental-clinic' — await migration 0037

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'dental-clinic-specialist-care',
  'Dental Clinic',
  'Nigerian MDCN-registered dental clinic website. Displays MDCN facility registration badge, treatment menu with prices in NGN (consultation, scaling, fillings, extractions, braces, implants, whitening), emergency booking CTA, sterile environment trust badges, WhatsApp appointment booking. Clean blue and white medical theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["dental-clinic","dental"]',
  '{"name":"dental-clinic-specialist-care","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["dental-clinic","dental"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["mdcn_badge","treatment_menu_kobo","emergency_cta","sterile_badge","nhis_flag","whatsapp_booking"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
