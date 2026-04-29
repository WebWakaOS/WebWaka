-- Seed: Training Institute / Vocational School Template
-- Niche ID: P35
-- Vertical: training-institute
-- Research brief: docs/templates/research/training-institute-vocational-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First)
-- Trust badge: NBTE accreditation number
-- SLUG MISMATCH NOTE: vertical slug 'training-institute' may be normalised in migration 0037

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'training-institute-vocational',
  'Training Institute / Vocational School',
  'Nigerian NBTE-accredited vocational and technical training institute website. Displays NBTE accreditation badge, course catalogue with NABTEB certification and duration, graduate employment rate badge, SIWES placement support, instalment payment option, WhatsApp enrollment CTA. Dark professional theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["training-institute"]',
  '{"name":"training-institute-vocational","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["training-institute"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["nbte_badge","course_catalogue_kobo","nabteb_cert_badge","graduate_employment_rate","siwes_badge","instalment_flag","whatsapp_enroll_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
