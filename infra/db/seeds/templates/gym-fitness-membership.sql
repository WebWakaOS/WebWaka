-- Seed: Gym / Fitness Centre Template
-- Niche ID: P31
-- Vertical: gym (awaiting slug normalisation in migration 0037 → 'gym-fitness-membership')
-- Research brief: docs/templates/research/gym-fitness-membership-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First), P4 (mobile-first)
-- Trust badge: NASC registration

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'gym-fitness-membership',
  'Gym / Fitness Centre',
  'Nigerian gym and fitness centre website. Displays membership plans in NGN, group class timetable, facilities (generator backup, showers, AC, Wi-Fi), WhatsApp trial booking, and member count badge. Mobile-first with dark sports aesthetic.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["gym"]',
  '{"name":"gym-fitness-membership","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["gym"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["membership_plans_kobo","class_timetable","facilities_list","member_count_badge","whatsapp_trial_cta","generator_backup_badge"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
