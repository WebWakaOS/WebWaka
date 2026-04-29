-- Seed: Private Tutoring / Lesson Teacher Template
-- Niche ID: P36
-- Vertical: tutoring
-- Research brief: docs/templates/research/tutoring-private-lessons-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First — JAMB/WAEC context)

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'tutoring-private-lessons',
  'Private Tutoring / Lesson Teacher',
  'Nigerian private tutoring website. Displays teacher qualifications, subject coverage (JAMB/WAEC/GCE), lesson packages in NGN per session or per month, top JAMB score badge, home service availability, free trial lesson CTA via WhatsApp, and session timetable. Blue academic theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["tutoring"]',
  '{"name":"tutoring-private-lessons","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["tutoring"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["teacher_quals","subject_list","lesson_packages_kobo","jamb_score_badge","home_service_flag","free_trial_cta","whatsapp_booking"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
