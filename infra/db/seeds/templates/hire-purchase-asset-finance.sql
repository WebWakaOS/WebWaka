-- Seed: Hire Purchase / Asset Finance Template
-- Niche ID: P45
-- Vertical: hire-purchase
-- Research brief: docs/templates/research/hire-purchase-asset-finance-brief.md
-- Platform invariants: T4 (kobo; tenor_months as integer; installments as integer),
--   P13 (no customer BVN ref in template — hashed), P2 (Nigeria First)
-- Trust badge: CBN consumer credit registration
-- Asset types: motorcycle | electronics | agricultural_equipment

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'hire-purchase-asset-finance',
  'Hire Purchase / Asset Finance',
  'Nigerian CBN-registered hire purchase operator website. Displays CBN consumer credit registration badge, asset types (motorcycles/keke NAPEP, electronics/smartphones, farm equipment), indicative instalment tables in NGN (deposit + weekly payments), 6-step process, home collection service badge, WhatsApp application CTA. Orange earthy theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["hire-purchase"]',
  '{"name":"hire-purchase-asset-finance","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["hire-purchase"],"rollback_strategy":"soft_delete","nigeria_first":true,"asset_types":["motorcycle","electronics","agricultural_equipment"],"features":["cbn_consumer_credit_badge","asset_catalogue","instalment_table_kobo","deposit_percentage","home_collection_badge","guarantor_notice","whatsapp_application_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
