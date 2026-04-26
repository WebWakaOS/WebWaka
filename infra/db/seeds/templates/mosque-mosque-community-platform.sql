-- Seed: mosque-mosque-community-platform template registry entry
-- Pillar 3 — P3-mosque-mosque-community-platform (VN-CIV-007, NF-CIV-REL variant)
-- Nigeria-First: CRITICAL priority — ~95-100 million Nigerian Muslims; 500,000+ mosques;
--   Jumu'ah scheduling as primary UX; Zakat/Sadaqah collection; Madrassa enrolment;
--   WhatsApp community broadcast; NSCIA/JNI/MUSWEN/NASFAT trust signals;
--   Arabic calligraphy accents; respectful Islamic tone; NDPR-compliant contact form;
--   Paystack/bank transfer/USSD payment methods — never Stripe/PayPal.
-- Family: NF-CIV-REL variant of P2-SHIPPED church-faith-community anchor.
-- Milestone: M8d
--
-- Idempotent: INSERT OR IGNORE — safe to re-run.

INSERT OR IGNORE INTO template_registry (
  slug,
  display_name,
  description,
  template_type,
  version,
  platform_compat,
  compatible_verticals,
  render_entrypoint,
  status,
  author_name,
  pricing_model,
  price_kobo,
  created_at,
  updated_at
) VALUES (
  'mosque-mosque-community-platform',
  'Mosque & Islamic Centre Community Platform',
  'A Nigeria-first website template for mosques and Islamic centres across Nigeria. Features the prayer times (Salat) block as the #1 UI element above the fold — the primary reason Nigerian Muslim visitors come to mosque websites. Includes a prominent Jumu''ah (Friday prayer) schedule, Zakat/Sadaqah payment strip with Nigerian payment methods (Paystack, bank transfer, USSD, POS), Madrassa/Tahfiz/Halaqat programme listings as offerings, WhatsApp community broadcast CTA on home and contact pages, NSCIA/JNI/MUSWEN/NASFAT trust signal badges, CAC Incorporated Trustees display, Arabic calligraphy Bismillah accent, denomination badge (Sunni, Salafi, Sufi, NASFAT), and NDPR-compliant contact form with consent checkbox. Offerings represent Islamic programmes — null price displays as "Open to all — Free to attend"; priceKobo displays as registration term fee in NGN. NF-CIV-REL family variant of the P2-SHIPPED church-faith-community anchor. All prices in ₦ (Naira). WhatsApp mandatory on home and contact pages.',
  'website',
  '1.0.0',
  '^1.0.0',
  'mosque',
  'mosque-mosque-community-platform',
  'approved',
  'WebWaka Platform',
  'free',
  0,
  datetime('now'),
  datetime('now')
);

-- Verify
SELECT slug, display_name, template_type, status, compatible_verticals, pricing_model
FROM template_registry
WHERE slug = 'mosque-mosque-community-platform';
