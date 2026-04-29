-- Seed: pos-business-operations-portal template registry entry
-- Pillar 2 — P2-pos-business-operations-portal (VN-SVC-001, standalone)
-- Nigeria-First: CRITICAL priority — POS agent operations portal; "Start a Transaction" WhatsApp CTA;
--   CAC + FIRS TIN + CBN compliance badges; services = financial transaction types;
--   null price → "Enquire for rate"; extended hours note; daily limit signal
-- Milestone: M8b — P1-Original (standalone)
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'pos-business-operations-portal',
  'POS Business Operations Portal',
  'A Nigeria-first website template for POS (Point of Sale) agent businesses. Operations portal targeting the POS agent managing their own business — not customer-facing e-commerce. Services represent financial transactions offered: cash withdrawals, transfers, airtime, bill payments, POS payment processing. "Start a Transaction" WhatsApp CTA. CAC Business Name, FIRS TIN, and CBN compliance badges as trust signals. null priceKobo → "Enquire for rate" (transaction fees vary by agent/network). Extended hours note and daily limit signalling. Standalone — .pb- CSS namespace.',
  'website', '1.0.0', '^1.0.0', 'pos-business', 'pos-business-operations-portal', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'pos-business-operations-portal';
