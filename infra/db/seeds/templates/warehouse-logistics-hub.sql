-- Seed: Warehouse / Logistics Hub Template
-- Niche ID: P38
-- Vertical: warehouse
-- Research brief: docs/templates/research/warehouse-logistics-hub-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First)
-- Trust badges: CAC number + SON cert + NAFDAC cert (all optional, combined)

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'warehouse-logistics-hub',
  'Warehouse / Logistics Hub',
  'Nigerian certified warehouse and logistics hub website. Displays CAC registration, SON certification, NAFDAC compliance badges, total capacity in kg/tonnes, storage services (dry, cold, agro, pharma, e-commerce fulfillment), distribution services, WhatsApp quote CTA. Professional blue theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["warehouse"]',
  '{"name":"warehouse-logistics-hub","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["warehouse"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["cac_badge","son_cert_badge","nafdac_badge","capacity_kg","storage_services","distribution_services","whatsapp_quote_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
