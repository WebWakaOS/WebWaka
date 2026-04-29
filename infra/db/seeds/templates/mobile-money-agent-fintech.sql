-- Seed: Mobile Money / POS Agent Template
-- Niche ID: P43
-- Vertical: mobile-money-agent
-- Research brief: docs/templates/research/mobile-money-agent-fintech-brief.md
-- Platform invariants: T4 (kobo; daily_cap 30,000,000 kobo enforced at route level),
--   P13 (no customer BVN ref in template — hashed), P2 (Nigeria First)
-- Trust badge: CBN sub-agent number
-- SLUG MISMATCH NOTE: vertical slug 'mobile-money' vs 'mobile-money-agent' — await migration 0037

INSERT OR IGNORE INTO template_registry (
  id, slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, manifest_json, status, is_free, price_kobo, created_at, updated_at
) VALUES (
  lower(hex(randomblob(16))),
  'mobile-money-agent-fintech',
  'Mobile Money / POS Agent',
  'Nigerian CBN-licensed mobile money sub-agent website. Displays CBN sub-agent number badge, operating networks (OPay, Moniepoint, MTN MoMo, etc.), services (cash-in, cash-out, transfers, airtime, bill payments, account opening), daily transaction limit (₦300,000 CBN cap), WhatsApp location/directions CTA. Clean blue fintech theme.',
  'website',
  '1.0.0',
  '>=1.0.1',
  '["mobile-money-agent","mobile-money"]',
  '{"name":"mobile-money-agent-fintech","version":"1.0.0","platform_compat":">=1.0.1","template_type":"website","compatible_verticals":["mobile-money-agent","mobile-money"],"rollback_strategy":"soft_delete","nigeria_first":true,"daily_cap_kobo":30000000,"features":["cbn_sub_agent_badge","network_logos","service_list","daily_cap_display","kyc_notice","whatsapp_directions_cta"]}',
  'approved',
  1,
  0,
  unixepoch(),
  unixepoch()
);
