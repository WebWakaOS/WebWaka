-- Seed: Community Hall / Civic Space Template
-- Niche ID: P46
-- Vertical: community-hall
-- Research brief: docs/templates/research/community-hall-civic-space-brief.md
-- Platform invariants: T4 (kobo; capacity_seats as integer), P2 (Nigeria First)
-- FSM: 3-state (seeded → claimed → active)
-- Double-booking prevention enforced at route level (not website)
-- AI: L1 cap — booking frequency aggregate only

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'community-hall-civic-space',
  'Community Hall / Civic Space',
  'Nigerian community hall and civic space venue website. Displays seated and standing capacity, generator backup badge, AC/fan flag, kitchen access, PA system, parking, event types (weddings/naming/owambe/corporate/church), booking packages in NGN (half day/full day/weekend), 30% deposit policy, WhatsApp availability check CTA. Purple regal theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["community-hall"]',
  '{"name":"community-hall-civic-space","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["community-hall"],"rollback_strategy":"soft_delete","nigeria_first":true,"fsm_states":["seeded","claimed","active"],"features":["capacity_seated","capacity_standing","generator_badge","ac_flag","kitchen_flag","event_types","booking_packages_kobo","deposit_policy","double_booking_prevention","whatsapp_availability_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
