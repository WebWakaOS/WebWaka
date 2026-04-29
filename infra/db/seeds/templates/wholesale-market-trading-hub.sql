-- Seed: Wholesale Market / Trading Hub Template
-- Niche ID: P37
-- Vertical: wholesale-market
-- Research brief: docs/templates/research/wholesale-market-trading-hub-brief.md
-- Platform invariants: T4 (kobo), P2 (Nigeria First)

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'wholesale-market-trading-hub',
  'Wholesale Market / Trading Hub',
  'Nigerian wholesale market and trading hub website. Displays commodity category directory (electronics, textiles, FMCG, building materials, agro-commodities, auto parts, pharma), trader count, years of operation, market facilities (weighbridge, loading bay, POS), WhatsApp price inquiry CTA. No static prices — always "WhatsApp for today''s rate".',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["wholesale-market"]',
  '{"name":"wholesale-market-trading-hub","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["wholesale-market"],"rollback_strategy":"soft_delete","nigeria_first":true,"features":["commodity_directory","trader_count_badge","market_facilities","whatsapp_price_inquiry_cta","no_static_prices"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
