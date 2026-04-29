-- Seed: beauty-salon-personal-care template registry entry
-- Pillar 2 — P2-beauty-salon-personal-care (VN-BEA-001, NF-BEA anchor)
-- Nigeria-First: CRITICAL priority — African hair specialisation (braiding, locs, relaxers, gele, makeup);
--   "Book Appointment" WhatsApp CTA; services grid with NGN prices;
--   null → "Price on request"; walk-ins welcome note; open 7 days;
--   lively, confident, friendly register
-- Milestone: M9 — P1-Original
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug, display_name, description, template_type, version, platform_compat,
  compatible_verticals, render_entrypoint, status, author_name, pricing_model,
  price_kobo, created_at, updated_at
) VALUES (
  'beauty-salon-personal-care',
  'Beauty Salon / Barber Shop Personal Care Site',
  'A Nigeria-first website template for Nigerian beauty salons and barber shops. African hair specialisation is central: braiding, locs, relaxers, gele tying, wig installation, and makeup artistry. "Book an Appointment" WhatsApp CTA. Services grid displays prices in NGN; null priceKobo → "Price on request" for bespoke styles. "Walk-ins welcome — book ahead to guarantee your preferred time" note. "Open 7 days" and "Trained Stylists" and "African Hair Specialists" trust badges. Circular logo (personal brand feel). Lively, confident register: "You will leave looking — and feeling — amazing." Booking form collects service type and preferred date/time. Success message: "See you soon — you are going to look amazing!" NF-BEA anchor — .bs- namespace; spa and hair-salon variants inherit services-with-prices pattern.',
  'website', '1.0.0', '^1.0.0', 'beauty-salon', 'beauty-salon-personal-care', 'approved',
  'WebWaka Platform', 'free', 0, datetime('now'), datetime('now')
);

SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry WHERE slug = 'beauty-salon-personal-care';
