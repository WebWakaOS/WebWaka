-- Seed: Driving School Template
-- Niche ID: P34
-- Vertical: driving-school
-- Research brief: docs/templates/research/driving-school-training-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First)
-- Trust badges: FRSC registration number + CAC RC number

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'driving-school-training',
  'Driving School',
  'Nigerian FRSC-registered driving school website. Displays FRSC registration badge, CAC RC, course types (car, motorcycle, commercial vehicle), fee schedule in NGN, FRSC pass rate percentage, 5-step learning journey, WhatsApp enrollment CTA. Green and gold theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["driving-school"]',
  '{"name":"driving-school-training","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["driving-school"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["frsc_badge","cac_badge","course_types","fee_schedule_kobo","frsc_pass_rate","learning_steps","whatsapp_enroll_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
