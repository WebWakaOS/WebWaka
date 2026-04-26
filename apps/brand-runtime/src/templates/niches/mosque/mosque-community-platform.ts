/**
 * Mosque / Islamic Centre Community Platform — Pillar 3 Website Template
 * Niche ID: P3-mosque-mosque-community-platform
 * Vertical: mosque (priority=3, critical)
 * Category: civic
 * Family: NF-CIV-REL (variant of P2-SHIPPED church-faith-community anchor)
 * Research brief: docs/templates/research/mosque-mosque-community-platform-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NSCIA affiliation, JNI/MUSWEN membership, CAC IT registration, NDPR
 *
 * Nigeria-First design decisions:
 *   • Prayer times (Salat) block is the #1 use case — placed immediately below hero
 *   • Jumu'ah (Friday prayer) given a prominent dedicated block within prayer times
 *   • "Join Jumu'ah" primary CTA; "Pay Zakat / Sadaqah" secondary; "WhatsApp Community" tertiary
 *   • Offerings array = Islamic programmes (Madrassa, Tahfiz, Halaqat, Youth Circle)
 *     null price → "Free to attend"; priceKobo → "Registration: ₦X,XXX" (term fees)
 *   • Arabic greeting (As-salamu alaykum) + Bismillah calligraphy accent in hero
 *   • Denomination badge from category field (Sunni, Salafi, Sufi, NASFAT, etc.)
 *   • NSCIA / JNI / MUSWEN / CAC IT trust signals displayed in dedicated trust strip
 *   • Zakat / Sadaqah giving strip with NGN bank transfer + Paystack + USSD — never Stripe/PayPal
 *   • No floating WhatsApp button — formal organisational context (same rule as church anchor)
 *   • WhatsApp CTA present on home page AND contact page (mandatory per prompt Section 8)
 *   • NDPR consent notice in contact form (PII collection: name, phone, email)
 *   • CSS namespace .ms- (mosque-specific, clean separation from .ch- church anchor)
 *   • Mobile-first 375px; 44px min touch targets; no external CDN; no external scripts
 *
 * Family inheritance from NF-CIV-REL anchor (church-faith-community):
 *   INHERITS: service-times block pattern → prayer-times block
 *   INHERITS: offerings-as-programmes semantics ("Free to attend" for null price)
 *   INHERITS: "Plan a Visit" CTA pattern → "Join Jumu'ah"
 *   INHERITS: no-float-WhatsApp rule
 *   INHERITS: organisation-first layout, warm community register
 *   OVERRIDES: Jumu'ah/Salat vocabulary (not "service times")
 *   OVERRIDES: Zakat/Sadaqah (not "Giving" or "Give Online")
 *   OVERRIDES: Islamic greeting, Bismillah accent, Arabic calligraphy CSS
 *   OVERRIDES: NSCIA/JNI/MUSWEN/NASFAT trust signals (not church denominational badges)
 *   OVERRIDES: Madrassa/Tahfiz/Halaqat programme vocabulary
 *   OVERRIDES: Islamic visual direction (green/gold palette context)
 *
 * Platform Invariants:
 *   T2 — TypeScript strict; no `any`
 *   T3 — no DB queries; all data via ctx.data; ctx.tenantId for contact form only
 *   T4 — prices as integer kobo; fmtKobo(); null → "Free to attend"
 *   P7 — CSS custom properties only (var(--ww-*)); #25D366 WhatsApp exception
 *   P9 — NGN-first; all displayed prices in ₦ only
 *   P10 — mobile-first 375px; 44px touch targets; no CDN; no external scripts
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

// ---------------------------------------------------------------------------
// Local utilities
// ---------------------------------------------------------------------------

const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function fmtKobo(kobo: number): string {
  return `\u20A6${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function whatsappLink(phone: string | null, message?: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  let intl: string;
  if (digits.startsWith('234')) {
    intl = digits;
  } else if (digits.startsWith('0')) {
    intl = '234' + digits.slice(1);
  } else {
    intl = '234' + digits;
  }
  const msg = encodeURIComponent(
    message ?? 'As-salamu alaykum. I would like to know more about your mosque and Jumu\'ah times.',
  );
  return `https://wa.me/${intl}?text=${msg}`;
}

function safeHref(url: string): string {
  try {
    const p = new URL(url, 'https://placeholder.invalid');
    if (p.protocol === 'http:' || p.protocol === 'https:') return encodeURI(url);
  } catch { /* invalid URL */ }
  return '#';
}

// ---------------------------------------------------------------------------
// Scoped CSS
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
<style>
/* Mosque Community Platform — NF-CIV-REL variant template */
/* CSS namespace: .ms- (mosque-specific) */

/* Bismillah / calligraphy accent */
.ms-bismillah {
  font-family: 'Scheherazade New', 'Amiri', 'Noto Naskh Arabic', serif;
  font-size: 1.375rem;
  color: var(--ww-primary);
  opacity: 0.75;
  letter-spacing: .02em;
  display: block;
  margin-bottom: .75rem;
  direction: rtl;
  unicode-bidi: embed;
}

/* Hero */
.ms-hero {
  text-align: center;
  padding: 2.75rem 0 2.25rem;
}
.ms-hero-logo {
  height: 88px;
  width: 88px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1.25rem;
  border: 3px solid var(--ww-primary);
}
.ms-denomination-badge {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .3rem .9rem;
  border-radius: 999px;
  font-size: .8rem;
  font-weight: 700;
  background: var(--ww-primary);
  color: #fff;
  margin-bottom: 1rem;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.ms-crescent {
  font-size: .85rem;
  line-height: 1;
}
.ms-hero h1 {
  font-size: clamp(1.875rem, 4.5vw, 2.875rem);
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: .375rem;
  color: var(--ww-text);
  letter-spacing: -.02em;
}
.ms-greeting {
  font-size: .9375rem;
  color: var(--ww-primary);
  font-weight: 600;
  margin-bottom: .375rem;
}
.ms-tagline {
  font-size: 1.0625rem;
  color: var(--ww-text-muted);
  max-width: 38rem;
  margin-inline: auto;
  margin-bottom: 2rem;
  line-height: 1.65;
}
.ms-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  justify-content: center;
}

/* Join Jumu'ah — primary CTA */
.ms-jumuah-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .875rem 2rem;
  background: var(--ww-primary);
  color: #fff;
  border-radius: var(--ww-radius);
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  min-height: 44px;
  transition: filter .15s;
}
.ms-jumuah-btn:hover { filter: brightness(1.1); text-decoration: none; }

/* Zakat / Sadaqah — secondary CTA */
.ms-zakat-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1.5rem;
  background: transparent;
  border: 2px solid var(--ww-primary);
  color: var(--ww-primary);
  border-radius: var(--ww-radius);
  font-size: .9375rem;
  font-weight: 700;
  text-decoration: none;
  min-height: 44px;
  transition: background .15s, color .15s;
}
.ms-zakat-btn:hover { background: var(--ww-primary); color: #fff; text-decoration: none; }

/* WhatsApp button */
.ms-wa-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1.25rem;
  background: #25D366;
  color: #fff;
  border-radius: var(--ww-radius);
  font-size: .9375rem;
  font-weight: 600;
  text-decoration: none;
  min-height: 44px;
  transition: filter .15s;
}
.ms-wa-btn:hover { filter: brightness(1.08); text-decoration: none; }

/* Prayer times block — equivalent of church service-times */
.ms-prayer-block {
  margin-top: 2.75rem;
  padding: 1.75rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  border-top: 4px solid var(--ww-primary);
}
.ms-prayer-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--ww-primary);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
}
.ms-prayer-grid {
  display: grid;
  gap: .875rem;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
}
.ms-prayer-item {
  display: flex;
  flex-direction: column;
  gap: .2rem;
  padding: .875rem 1rem;
  background: var(--ww-bg);
  border-radius: calc(var(--ww-radius) - 2px);
  border: 1px solid var(--ww-border);
}
.ms-prayer-item.ms-jumuah-prayer {
  border-color: var(--ww-primary);
  background: color-mix(in srgb, var(--ww-primary) 6%, var(--ww-bg));
}
.ms-prayer-name {
  font-size: .9375rem;
  font-weight: 700;
  color: var(--ww-text);
}
.ms-prayer-arabic {
  font-size: .8125rem;
  color: var(--ww-text-muted);
  direction: rtl;
  unicode-bidi: embed;
}
.ms-prayer-time {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ww-primary);
  margin-top: .25rem;
  font-variant-numeric: tabular-nums;
}
.ms-prayer-note {
  font-size: .75rem;
  color: var(--ww-text-muted);
  line-height: 1.4;
}
.ms-prayer-disclaimer {
  margin-top: 1.25rem;
  text-align: center;
  font-size: .8125rem;
  color: var(--ww-text-muted);
  font-style: italic;
}

/* Section */
.ms-section { margin-top: 2.75rem; }
.ms-section-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--ww-primary);
}

/* Programme / offering cards */
.ms-prog-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.ms-prog-card {
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  padding: 1.375rem;
  background: var(--ww-bg-surface);
  display: flex;
  flex-direction: column;
  gap: .375rem;
  transition: border-color .15s;
  border-left: 4px solid var(--ww-primary);
}
.ms-prog-card:hover { border-color: var(--ww-primary); }
.ms-prog-name { font-size: 1rem; font-weight: 700; color: var(--ww-text); margin: 0; }
.ms-prog-desc { font-size: .875rem; color: var(--ww-text-muted); line-height: 1.55; flex: 1; margin: 0; }
.ms-prog-free {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--ww-primary);
  margin-top: .25rem;
}
.ms-prog-fee {
  font-size: .9375rem;
  font-weight: 700;
  color: var(--ww-primary);
  margin-top: .25rem;
}
.ms-see-all {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: .9375rem;
  font-weight: 600;
  color: var(--ww-primary);
  text-decoration: underline;
}
.ms-see-all:hover { opacity: .8; }

/* Trust strip */
.ms-trust-strip {
  margin-top: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: .5rem .875rem;
  justify-content: center;
  padding: 1.25rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
}
.ms-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: .375rem;
  padding: .3rem .875rem;
  border-radius: 999px;
  font-size: .78rem;
  font-weight: 700;
  background: var(--ww-bg);
  border: 1.5px solid var(--ww-primary);
  color: var(--ww-primary);
  white-space: nowrap;
}
.ms-trust-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ww-primary);
  flex-shrink: 0;
}

/* Zakat giving strip */
.ms-zakat-strip {
  margin-top: 2.5rem;
  padding: 1.75rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  border-top: 4px solid var(--ww-primary);
}
.ms-zakat-strip h2 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: .625rem;
  color: var(--ww-primary);
}
.ms-zakat-strip p {
  color: var(--ww-text-muted);
  line-height: 1.7;
  margin-bottom: 1rem;
  font-size: .9375rem;
}
.ms-payment-list {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
  margin-bottom: 1.25rem;
}
.ms-payment-chip {
  padding: .3rem .875rem;
  border-radius: 999px;
  font-size: .8125rem;
  font-weight: 600;
  background: var(--ww-bg);
  border: 1px solid var(--ww-border);
  color: var(--ww-text-muted);
}

/* About excerpt on home */
.ms-about-strip {
  margin-top: 2.5rem;
  padding: 1.75rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
}
.ms-about-strip h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: .75rem; }
.ms-about-strip p { color: var(--ww-text-muted); line-height: 1.75; margin-bottom: 1rem; font-size: .9375rem; }

/* Contact strip */
.ms-contact-strip {
  margin-top: 2.5rem;
  padding: 1.5rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
  align-items: flex-start;
}
.ms-strip-item { display: flex; flex-direction: column; gap: .25rem; }
.ms-strip-label {
  font-size: .75rem;
  font-weight: 600;
  color: var(--ww-text-muted);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.ms-strip-value { font-size: .9375rem; font-weight: 600; color: var(--ww-text); }
.ms-strip-value a { color: var(--ww-primary); }

/* About page */
.ms-about-hero { text-align: center; padding: 2.5rem 0 2rem; }
.ms-about-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.ms-about-body { max-width: 44rem; margin: 0 auto; }
.ms-about-desc {
  color: var(--ww-text-muted);
  line-height: 1.9;
  margin-bottom: 2rem;
  font-size: 1rem;
}
.ms-detail-list { display: flex; flex-direction: column; gap: .875rem; margin-bottom: 2rem; }
.ms-detail-row { display: flex; gap: 1rem; align-items: flex-start; }
.ms-detail-label { font-size: .875rem; font-weight: 700; min-width: 7rem; color: var(--ww-text); flex-shrink: 0; }
.ms-detail-value { font-size: .9375rem; color: var(--ww-text-muted); }
.ms-detail-value a { color: var(--ww-primary); font-weight: 600; }

/* Services / programmes page */
.ms-services-hero { text-align: center; padding: 2.5rem 0 2rem; }
.ms-services-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.ms-services-sub { color: var(--ww-text-muted); margin-bottom: 1.5rem; }
.ms-empty-state {
  text-align: center;
  color: var(--ww-text-muted);
  padding: 3rem 1rem;
  font-size: 1rem;
  line-height: 1.8;
}
.ms-bottom-cta-strip {
  margin-top: 2.5rem;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border-radius: var(--ww-radius);
  border: 1px solid var(--ww-border);
  text-align: center;
}
.ms-bottom-cta-strip h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: .5rem; }
.ms-bottom-cta-strip p { color: var(--ww-text-muted); margin-bottom: 1.25rem; font-size: .9375rem; }
.ms-btn-row { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; }

/* Contact page */
.ms-contact-hero { text-align: center; padding: 2.5rem 0 2rem; }
.ms-contact-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.ms-contact-hero p { color: var(--ww-text-muted); max-width: 34rem; margin-inline: auto; }
.ms-wa-block {
  margin: 1.75rem auto;
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border: 2px solid #25D366;
  border-radius: var(--ww-radius);
  max-width: 32rem;
}
.ms-wa-block p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: 1rem; }
.ms-contact-layout {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}
@media (min-width: 640px) { .ms-contact-layout { grid-template-columns: 1fr 1fr; } }
.ms-contact-info h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.ms-contact-info p {
  font-size: .9375rem;
  color: var(--ww-text-muted);
  margin-bottom: .625rem;
  line-height: 1.6;
}
.ms-contact-info a { color: var(--ww-primary); font-weight: 600; }
.ms-form-wrapper h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.ms-form { display: flex; flex-direction: column; gap: .875rem; }
.ms-form-group { display: flex; flex-direction: column; gap: .375rem; }
.ms-form-group label { font-size: .875rem; font-weight: 600; color: var(--ww-text); }
.ms-input {
  padding: .625rem .875rem;
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  font-size: .9375rem;
  background: var(--ww-bg);
  color: var(--ww-text);
  width: 100%;
  min-height: 44px;
  font-family: var(--ww-font);
}
.ms-input:focus { outline: 2px solid var(--ww-primary); outline-offset: 1px; border-color: transparent; }
.ms-textarea { min-height: 110px; resize: vertical; }
.ms-ndpr-notice {
  font-size: .8125rem;
  color: var(--ww-text-muted);
  line-height: 1.55;
  padding: .75rem;
  background: var(--ww-bg-surface);
  border-radius: calc(var(--ww-radius) - 2px);
  border: 1px solid var(--ww-border);
}
.ms-ndpr-notice a { color: var(--ww-primary); }
.ms-ndpr-check { display: flex; align-items: flex-start; gap: .5rem; }
.ms-ndpr-check input[type="checkbox"] { margin-top: .25rem; width: 18px; height: 18px; flex-shrink: 0; accent-color: var(--ww-primary); }
.ms-ndpr-check label { font-size: .8125rem; color: var(--ww-text-muted); line-height: 1.5; }
.ms-submit-btn {
  padding: .875rem 1.5rem;
  background: var(--ww-primary);
  color: #fff;
  border: none;
  border-radius: var(--ww-radius);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  min-height: 44px;
  transition: filter .15s;
  font-family: var(--ww-font);
}
.ms-submit-btn:hover { filter: brightness(1.1); }
.ms-form-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  text-align: center;
  color: #166534;
}
.ms-form-success h3 { font-weight: 700; margin-bottom: .25rem; }

@media (max-width: 375px) {
  .ms-hero-ctas { flex-direction: column; align-items: stretch; }
  .ms-jumuah-btn, .ms-zakat-btn, .ms-wa-btn { width: 100%; justify-content: center; }
  .ms-prayer-grid { grid-template-columns: 1fr 1fr; }
}
</style>`;

// ---------------------------------------------------------------------------
// SVG icons
// ---------------------------------------------------------------------------

function waSvg(): string {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
             -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
             -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
             -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
             .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
             -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
             -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
             -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074
             .149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625
             .712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
             .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504
             A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818
             a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373
             A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182
             c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/>
  </svg>`;
}

function moonSvg(): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Prayer times — default Nigerian mosque times (indicative)
// ---------------------------------------------------------------------------

interface PrayerTime {
  name: string;
  arabic: string;
  time: string;
  note?: string;
  isJumuah?: boolean;
}

const DEFAULT_PRAYER_TIMES: PrayerTime[] = [
  { name: 'Fajr', arabic: 'الفجر', time: '5:20 AM', note: 'Dawn prayer' },
  { name: 'Dhuhr', arabic: 'الظهر', time: '1:10 PM', note: 'Midday prayer' },
  { name: "Jumu'ah", arabic: 'الجمعة', time: '1:30 PM', note: 'Khutbah from 1:00 PM', isJumuah: true },
  { name: 'Asr', arabic: 'العصر', time: '4:30 PM', note: 'Afternoon prayer' },
  { name: 'Maghrib', arabic: 'المغرب', time: '7:05 PM', note: 'Sunset prayer' },
  { name: 'Isha', arabic: 'العشاء', time: '8:15 PM', note: 'Night prayer' },
];

// ---------------------------------------------------------------------------
// Page renderers
// ---------------------------------------------------------------------------

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const category = (ctx.data.category as string | null) ?? null;
  const website = (ctx.data.website as string | null) ?? null;

  const featured = offerings.slice(0, 4);
  const hasMore = offerings.length > 4;

  const bioExcerpt = description
    ? description.length > 220 ? description.slice(0, 220).trimEnd() + '\u2026' : description
    : null;

  const waHref = whatsappLink(
    phone,
    `As-salamu alaykum. I would like to join Jumu'ah at ${ctx.displayName} and learn about your programmes.`,
  );

  const denominationBadge = category
    ? `<div class="ms-denomination-badge"><span class="ms-crescent">\u{1F319}</span> ${esc(category)} Mosque</div>`
    : `<div class="ms-denomination-badge"><span class="ms-crescent">\u{1F319}</span> Islamic Centre</div>`;

  const progGrid = featured.length === 0 ? '' : `
<section class="ms-section">
  <h2 class="ms-section-title">Our Programmes &amp; Classes</h2>
  <div class="ms-prog-grid">
    ${featured.map((o) => `
    <div class="ms-prog-card">
      <h3 class="ms-prog-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ms-prog-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null
        ? `<span class="ms-prog-free">Open to all — Free to attend</span>`
        : `<span class="ms-prog-fee">Registration: ${fmtKobo(o.priceKobo)}/term</span>`}
    </div>`).join('')}
  </div>
  ${hasMore ? `<a class="ms-see-all" href="/services">View all programmes &rarr;</a>` : ''}
</section>`;

  return `
${TEMPLATE_CSS}

<section class="ms-hero">
  ${ctx.logoUrl
    ? `<img class="ms-hero-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />`
    : ''}
  ${denominationBadge}
  <p class="ms-greeting">As-salamu alaykum \u2014 Peace be upon you</p>
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline
    ? `<p class="ms-tagline">${esc(tagline)}</p>`
    : `<p class="ms-tagline">A centre of Salat, knowledge, and community service${placeName ? ` in ${esc(placeName)}` : ''}.</p>`}
  <div class="ms-hero-ctas">
    <a class="ms-jumuah-btn" href="/contact">
      ${moonSvg()} Join Jumu&apos;ah
    </a>
    <a class="ms-zakat-btn" href="/services">
      Pay Zakat &amp; Sadaqah
    </a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn"
           aria-label="WhatsApp ${esc(ctx.displayName)} community">
           ${waSvg()} WhatsApp Community
         </a>`
      : ''}
  </div>
</section>

<!-- Prayer Times Block — #1 use case for Nigerian mosque websites -->
<div class="ms-prayer-block" role="region" aria-label="Daily prayer and Jumu'ah times">
  <h2 class="ms-prayer-title">
    ${moonSvg()} &nbsp;Prayer &amp; Jumu&apos;ah Times
  </h2>
  <div class="ms-prayer-grid">
    ${DEFAULT_PRAYER_TIMES.map((pt) => `
    <div class="ms-prayer-item${pt.isJumuah ? ' ms-jumuah-prayer' : ''}">
      <span class="ms-prayer-name">${esc(pt.name)}${pt.isJumuah ? ' \u2605' : ''}</span>
      <span class="ms-prayer-arabic">${pt.arabic}</span>
      <span class="ms-prayer-time">${esc(pt.time)}</span>
      ${pt.note ? `<span class="ms-prayer-note">${esc(pt.note)}</span>` : ''}
    </div>`).join('')}
  </div>
  <p class="ms-prayer-disclaimer">
    Times shown are indicative for this location. Please confirm with your Imam
    or check our WhatsApp channel for exact daily times, especially during Ramadan.
  </p>
</div>

${progGrid}

<!-- Trust signals -->
<div class="ms-trust-strip" role="list" aria-label="Affiliations and registrations">
  <span class="ms-trust-badge" role="listitem"><span class="ms-trust-dot" aria-hidden="true"></span> NSCIA Affiliated</span>
  <span class="ms-trust-badge" role="listitem"><span class="ms-trust-dot" aria-hidden="true"></span> JNI Member</span>
  <span class="ms-trust-badge" role="listitem"><span class="ms-trust-dot" aria-hidden="true"></span> CAC Incorporated Trustees</span>
  <span class="ms-trust-badge" role="listitem"><span class="ms-trust-dot" aria-hidden="true"></span> Open to All Muslims</span>
</div>

<!-- About excerpt -->
${bioExcerpt ? `
<div class="ms-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more about us &rarr;</a>
</div>` : ''}

<!-- Zakat / Sadaqah giving strip -->
<div class="ms-zakat-strip">
  <h2>\u{1F4B3} Zakat &amp; Sadaqah</h2>
  <p>
    Support the mosque welfare fund, Madrassa scholarships, and community aid programmes.
    All Zakat and Sadaqah collections are managed by our Board of Trustees and disbursed
    transparently to eligible beneficiaries in our community. Insha&apos;Allah.
  </p>
  <div class="ms-payment-list">
    <span class="ms-payment-chip">Bank Transfer</span>
    <span class="ms-payment-chip">Paystack Online</span>
    <span class="ms-payment-chip">USSD *737#</span>
    <span class="ms-payment-chip">POS On-site</span>
    <span class="ms-payment-chip">Cash (Welfare Desk)</span>
  </div>
  ${waHref
    ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn"
         style="display:inline-flex;width:auto">
         ${waSvg()} WhatsApp for Zakat Bank Details
       </a>`
    : `<a class="ms-jumuah-btn" href="/contact">Contact Us for Payment Details</a>`}
</div>

<!-- Contact strip -->
${(phone || placeName) ? `
<div class="ms-contact-strip">
  ${placeName ? `
  <div class="ms-strip-item">
    <span class="ms-strip-label">Location</span>
    <span class="ms-strip-value">${esc(placeName)}</span>
  </div>` : ''}
  ${phone ? `
  <div class="ms-strip-item">
    <span class="ms-strip-label">Phone / WhatsApp</span>
    <span class="ms-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
  </div>` : ''}
  <div class="ms-strip-item">
    <span class="ms-strip-label">Jumu&apos;ah</span>
    <span class="ms-strip-value">Every Friday &mdash; Khutbah 1:00 PM, Prayer 1:30 PM</span>
  </div>
  ${website ? `
  <div class="ms-strip-item">
    <span class="ms-strip-label">Website</span>
    <span class="ms-strip-value"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)}</a></span>
  </div>` : ''}
</div>` : ''}
`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const website = (ctx.data.website as string | null) ?? null;
  const category = (ctx.data.category as string | null) ?? null;

  const waHref = whatsappLink(
    phone,
    `As-salamu alaykum. I would like to learn more about ${ctx.displayName}.`,
  );

  return `
${TEMPLATE_CSS}

<section class="ms-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">
    ${category ? `${esc(category)} Islamic Centre` : 'Islamic Centre'} &mdash; Serving the Muslim Ummah
  </p>
</section>

<div class="ms-about-body">
  ${description
    ? `<p class="ms-about-desc">${esc(description)}</p>`
    : `<p class="ms-about-desc">
        ${esc(ctx.displayName)} is a centre of Islamic worship, learning, and community service.
        We welcome Muslims of all backgrounds and madhabs to join us for daily Salat, Jumu&apos;ah,
        Madrassa education, and welfare programmes. Our doors are open to all who seek knowledge,
        community, and connection with Allah (SWT).
      </p>`}

  <div class="ms-detail-list">
    ${category ? `
    <div class="ms-detail-row">
      <span class="ms-detail-label">Denomination</span>
      <span class="ms-detail-value">${esc(category)}</span>
    </div>` : ''}
    ${placeName ? `
    <div class="ms-detail-row">
      <span class="ms-detail-label">Address</span>
      <span class="ms-detail-value">${esc(placeName)}</span>
    </div>` : ''}
    ${phone ? `
    <div class="ms-detail-row">
      <span class="ms-detail-label">Phone</span>
      <span class="ms-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
    </div>` : ''}
    ${email ? `
    <div class="ms-detail-row">
      <span class="ms-detail-label">Email</span>
      <span class="ms-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span>
    </div>` : ''}
    ${website ? `
    <div class="ms-detail-row">
      <span class="ms-detail-label">Website</span>
      <span class="ms-detail-value">
        <a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)}</a>
      </span>
    </div>` : ''}
    <div class="ms-detail-row">
      <span class="ms-detail-label">Registration</span>
      <span class="ms-detail-value">CAC Incorporated Trustees (IT Number on request)</span>
    </div>
    <div class="ms-detail-row">
      <span class="ms-detail-label">Affiliation</span>
      <span class="ms-detail-value">Nigerian Supreme Council for Islamic Affairs (NSCIA)</span>
    </div>
    <div class="ms-detail-row">
      <span class="ms-detail-label">Jumu&apos;ah</span>
      <span class="ms-detail-value">Every Friday &mdash; Khutbah 1:00 PM, Prayer 1:30 PM</span>
    </div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:.75rem;margin-top:1.5rem">
    <a class="ms-jumuah-btn" href="/contact">${moonSvg()} Plan Your Visit</a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">
           ${waSvg()} WhatsApp Us
         </a>`
      : ''}
  </div>
</div>
`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;

  const waHref = whatsappLink(
    phone,
    `As-salamu alaykum. I would like to enquire about the programmes and classes at ${ctx.displayName}.`,
  );

  const grid =
    offerings.length === 0
      ? `<div class="ms-empty-state">
          <p>Programme details are being updated.<br/>
          Please contact us directly to learn about our Madrassa, Tahfiz, and community programmes.</p>
          <br/>
          <a class="ms-jumuah-btn" href="/contact">${moonSvg()} Contact Us</a>
        </div>`
      : `<div class="ms-prog-grid">
          ${offerings
            .map(
              (o) => `
          <div class="ms-prog-card">
            <h3 class="ms-prog-name">${esc(o.name)}</h3>
            ${o.description ? `<p class="ms-prog-desc">${esc(o.description)}</p>` : ''}
            ${o.priceKobo === null
              ? `<span class="ms-prog-free">Open to all \u2014 Free to attend</span>`
              : `<span class="ms-prog-fee">Registration: ${fmtKobo(o.priceKobo)}/term</span>`}
          </div>`,
            )
            .join('')}
        </div>`;

  return `
${TEMPLATE_CSS}

<section class="ms-services-hero">
  <h1>Programmes &amp; Islamic Classes</h1>
  <p class="ms-services-sub">What we offer at ${esc(ctx.displayName)}</p>
</section>

<section>${grid}</section>

<div class="ms-bottom-cta-strip">
  <h3>Ready to enrol or get involved?</h3>
  <p>
    As-salamu alaykum &mdash; All are welcome at ${esc(ctx.displayName)}.
    Contact us via WhatsApp to enquire about Madrassa enrolment, Tahfiz registration,
    or any of our community programmes. Insha&apos;Allah.
  </p>
  <div class="ms-btn-row">
    <a class="ms-jumuah-btn" href="/contact">${moonSvg()} Plan Your Visit</a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">
           ${waSvg()} WhatsApp Us
         </a>`
      : ''}
  </div>
</div>
`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;

  const waHref = whatsappLink(
    phone,
    `As-salamu alaykum! I would like to visit ${ctx.displayName} for Jumu'ah. Please share the prayer times and directions.`,
  );

  return `
${TEMPLATE_CSS}

<section class="ms-contact-hero">
  <h1>As-salamu Alaykum</h1>
  <p>We are here for you. Join us for Salat, Jumu&apos;ah, or any of our community programmes.
     All are welcome at ${esc(ctx.displayName)}.</p>
</section>

<!-- WhatsApp block — mandatory per P3 Nigeria-First requirements -->
${waHref
  ? `<div class="ms-wa-block">
      <p>The fastest way to reach us is via WhatsApp. Our team responds to all enquiries
         about prayer times, Madrassa enrolment, Zakat payment, and community programmes.</p>
      <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn"
         aria-label="WhatsApp ${esc(ctx.displayName)}"
         style="display:inline-flex;justify-content:center">
        ${waSvg()} WhatsApp the Mosque Office
      </a>
    </div>`
  : ''}

<div class="ms-contact-layout">
  <div class="ms-contact-info">
    <h2>Find Us</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone / WhatsApp:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details will be listed here shortly.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">
      <strong>Jumu&apos;ah:</strong> Every Friday &mdash; Khutbah 1:00 PM, Prayer 1:30 PM.<br/>
      Kindly arrive early and remember to bring your own prayer mat.
    </p>
    <p style="margin-top:.75rem">
      <a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">
        View all programmes &amp; prayer times &rarr;
      </a>
    </p>
  </div>

  <div class="ms-form-wrapper">
    <h2>Send a Message</h2>
    <form class="ms-form" method="POST" action="/contact" id="msContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ms-form-group">
        <label for="ms-name">Your name</label>
        <input id="ms-name" name="name" type="text" required autocomplete="name"
               class="ms-input" placeholder="e.g. Alhaji Musa Abdullahi" />
      </div>
      <div class="ms-form-group">
        <label for="ms-phone">Phone / WhatsApp number</label>
        <input id="ms-phone" name="phone" type="tel" autocomplete="tel"
               class="ms-input" placeholder="0803 000 0000" />
      </div>
      <div class="ms-form-group">
        <label for="ms-email">Email address (optional)</label>
        <input id="ms-email" name="email" type="email" autocomplete="email"
               class="ms-input" placeholder="you@example.com" />
      </div>
      <div class="ms-form-group">
        <label for="ms-message">How can we help you?</label>
        <textarea id="ms-message" name="message" required rows="4"
                  class="ms-input ms-textarea"
                  placeholder="e.g. I would like to plan a visit, enquire about Madrassa enrolment, or get Zakat payment details."></textarea>
      </div>
      <!-- NDPR consent notice — mandatory for PII collection in Nigeria -->
      <div class="ms-ndpr-notice">
        <p style="margin:0 0 .5rem;font-size:.8125rem;color:var(--ww-text-muted)">
          <strong>Privacy notice (NDPR):</strong> The information you provide will be used solely to
          respond to your enquiry and will not be shared with third parties without your consent.
          <a href="/privacy">View our Privacy Policy</a>.
        </p>
        <div class="ms-ndpr-check">
          <input type="checkbox" id="ms-ndpr-consent" name="ndpr_consent" value="yes" required />
          <label for="ms-ndpr-consent">
            I consent to ${esc(ctx.displayName)} contacting me using the details provided above.
          </label>
        </div>
      </div>
      <button type="submit" class="ms-submit-btn">Send Message</button>
    </form>
    <div id="msContactSuccess" class="ms-form-success" style="display:none" role="status" aria-live="polite">
      <h3>Wa alaykum as-salam!</h3>
      <p>
        Jazakallahu khayran &mdash; your message has been received. Our team will be in
        touch with you shortly. May Allah (SWT) bless you. Ameen.
      </p>
    </div>
  </div>
</div>

<script>
(function () {
  var form = document.getElementById('msContactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch('/contact', { method: 'POST', body: data })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function () {
        form.style.display = 'none';
        var success = document.getElementById('msContactSuccess');
        if (success) success.style.display = 'block';
      })
      .catch(function () { form.submit(); });
  });
})();
</script>
`;
}

// ---------------------------------------------------------------------------
// WebsiteTemplateContract — exported implementation
// ---------------------------------------------------------------------------

export const mosqueMosqueCommunityPlatformTemplate: WebsiteTemplateContract = {
  slug: 'mosque-mosque-community-platform',
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'],

  renderPage(ctx: WebsiteRenderContext): string {
    try {
      switch (ctx.pageType) {
        case 'home':     return renderHome(ctx);
        case 'about':    return renderAbout(ctx);
        case 'services': return renderServices(ctx);
        case 'contact':  return renderContact(ctx);
        default:
          return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    } catch {
      return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">
        Unable to load page. Please try again.
      </p>`;
    }
  },
};
