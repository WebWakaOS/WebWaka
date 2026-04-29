-- Seed: Savings Group / Thrift Community Template
-- Niche ID: P2-savings-group-thrift-community
-- Vertical: savings-group
-- Research brief: docs/templates/research/savings-group-thrift-community-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First), P13 (no member PII)

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'savings-group-thrift-community',
  'Savings Group / Thrift Community Portal',
  'Nigerian Ajo, Esusu, Osusu and Cooperative savings group member portal. Displays group type (ajo/esusu/cooperative/thrift), contribution amount in NGN, contribution frequency, member capacity, open positions, coordinator contact, WhatsApp-first join flow, and how-it-works guide. CAC registration badge for formal cooperatives.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["savings-group"]',
  '{"name":"savings-group-thrift-community","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["savings-group"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["group_type_badge","contribution_amount_kobo","member_capacity","open_positions","cac_badge","whatsapp_cta","how_it_works"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
