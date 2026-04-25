-- Seed: rideshare-ride-hailing-service template registry entry
-- Pillar 2 — P2-rideshare-ride-hailing-service (VN-TRP-003, NF-TRP-PAS variant)
-- Nigeria-First: HIGH priority — FRSC driver verification + VIO roadworthiness + insured vehicles;
--   "Book a Ride" WhatsApp CTA; airport/intercity/corporate/shared ride types;
--   null → "Rate on request"; operates against Bolt/Uber/informal okada networks;
--   advance booking recommended signal
-- Milestone: M8c — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'rideshare-ride-hailing-service',
  'Ride-Hailing / Carpooling Service Site',
  'A Nigeria-first website template for Nigerian ride-hailing and carpooling services operating against Bolt, Uber, and informal okada/keke networks. FRSC driver licence verification, VIO vehicle roadworthiness, and goods-in-transit (passenger) insurance badges. "Book a Ride" WhatsApp CTA with pre-populated trip enquiry. Ride types as services: airport pickup, intercity, shared, corporate, per-hour. null priceKobo → "Rate on request" (pricing varies by route and demand). 24/7 availability note with advance booking recommendation for airport/intercity. Trip details form (pickup, destination, date, passenger count). NF-TRP-PAS variant — .rs- namespace.',
  'website', '1.0.0', '^1.0.0', 'rideshare', 'rideshare-ride-hailing-service', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'rideshare-ride-hailing-service';
