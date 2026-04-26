-- Seed: Travel Agent / Tour Operator Website Template
-- Niche ID: P2-travel-agent-tour-operator
-- Vertical: travel-agent (VN-SVC-003)
-- Research brief: docs/templates/research/travel-agent-tour-operator-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First)

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'travel-agent-tour-operator',
  'Travel Agent & Tour Operator Site',
  'NANTA-registered Nigerian travel agency website with Hajj/Umrah package showcase, visa assistance services, domestic tour listings, WhatsApp-first booking flow, and trust badge display. Supports five package types: holiday, hajj, umrah, domestic, corporate.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["travel-agent"]',
  '{"name":"travel-agent-tour-operator","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["travel-agent"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["nanta_badge","iata_badge","hajj_umrah_packages","visa_assistance","domestic_tours","whatsapp_cta","kobo_pricing"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
