-- Seed: Insurance Agent / Broker Template
-- Niche ID: P39
-- Vertical: insurance-agent
-- Research brief: docs/templates/research/insurance-agent-broker-site-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First)
-- Trust badge: NAICOM-licensed agent status

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'insurance-agent-broker-site',
  'Insurance Agent / Broker',
  'Nigerian NAICOM-licensed insurance intermediary website. Displays NAICOM licence badge, insurance products (motor, property, life, health, marine, group life, professional indemnity), compulsory-by-law flags on motor and group life, underwriter partnerships, WhatsApp quote CTA. Professional navy theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["insurance-agent"]',
  '{"name":"insurance-agent-broker-site","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["insurance-agent"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["naicom_badge","product_catalogue","compulsory_by_law_flags","underwriter_list","claims_support_badge","whatsapp_quote_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
