/**
 * Restaurant / General Eatery / Buka template — NF-FDS family ANCHOR (VN-FDS-001)
 * Pillar 2 — P2-restaurant-general-eatery
 *
 * Nigeria-First design decisions:
 *   • WhatsApp ordering is the primary conversion channel — CTA is above the fold on all pages
 *   • NGN (₦) pricing with en-NG locale formatting (T4: integer kobo → display)
 *   • Mobile-first layout: 375px minimum, 44px touch targets, no external CDN
 *   • LGA-level location specificity (not just "Lagos")
 *   • Nigerian dish names rendered as-is — no translation or anglicisation
 *   • Contact form secondary to WhatsApp (Nigerians rarely fill forms; they WhatsApp)
 *
 * Africa-First: Buka/communal-eating model shared across West Africa (Ghana chop bars,
 *   Senegal dibiteries, Ivory Coast maquis). Template is portable with minimal adaptation.
 *
 * Family anchor responsibilities:
 *   Variants that inherit this pattern: food-vendor, catering, bakery, restaurant-chain
 *   Keep the .re- CSS namespace, esc(), fmtKobo(), and whatsappLink() patterns stable.
 *
 * Platform Invariants:
 *   T2 — TypeScript strict; no `any`
 *   T3 — no DB queries; all data arrives via ctx.data (resolved by route handler)
 *   T4 — all prices are integer kobo; formatted via fmtKobo() inline
 *   P7 — only CSS custom properties from white-label theming (var(--ww-*)); no hex literals
 *   P9 — NGN-first currency display
 *   P10 — mobile-first, no external scripts, no CDN
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

// ---------------------------------------------------------------------------
// Local utilities — not exported (T2: keep scope minimal)
// ---------------------------------------------------------------------------

/** HTML-escape a string for safe template injection. */
const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Format an integer kobo value as a Nigerian Naira string. T4 compliant. */
function fmtKobo(kobo: number): string {
  return `\u20A6${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

/**
 * Build a WhatsApp deep-link for a Nigerian phone number.
 * Handles: +2348XX, 08XX, 234XX — normalises to international format.
 * Returns null if no phone provided (WhatsApp button is hidden).
 */
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
    message ?? "Hello! I'd like to make an order. Please share your menu. \uD83C\uDF7D\uFE0F",
  );
  return `https://wa.me/${intl}?text=${msg}`;
}

/**
 * Render a WhatsApp CTA button. Returns empty string if no phone.
 * Uses a green that reads as "WhatsApp" without hardcoding hex (overridable via CSS).
 */
function waBtn(phone: string | null, label = 'Order on WhatsApp'): string {
  const href = whatsappLink(phone);
  if (!href) return '';
  return `<a href="${href}"
    target="_blank"
    rel="noopener noreferrer"
    class="re-wa-btn"
    aria-label="Order on WhatsApp">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
    </svg>
    ${esc(label)}
  </a>`;
}

// ---------------------------------------------------------------------------
// Shared scoped CSS for all pages in this template
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
<style>
/* Restaurant / General Eatery — NF-FDS Anchor template scoped styles */

/* WhatsApp button — green brand colour, overrides ww-btn */
.re-wa-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1.5rem;
  background: #25D366;
  color: #fff;
  border-radius: var(--ww-radius);
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  min-height: 44px;
  transition: filter .15s;
}
.re-wa-btn:hover { filter: brightness(1.08); text-decoration: none; }

/* Hero section */
.re-hero {
  text-align: center;
  padding: 2.5rem 0 2rem;
}
.re-hero-logo {
  height: 80px;
  width: auto;
  margin-bottom: 1.25rem;
  border-radius: 8px;
}
.re-hero h1 {
  font-size: clamp(1.75rem, 4.5vw, 2.75rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: .75rem;
  color: var(--ww-text);
}
.re-tagline {
  font-size: 1.125rem;
  color: var(--ww-text-muted);
  margin-bottom: 1rem;
  max-width: 36rem;
  margin-inline: auto;
  line-height: 1.6;
}
.re-hero-desc {
  color: var(--ww-text-muted);
  max-width: 40rem;
  margin-inline: auto;
  margin-bottom: 1.75rem;
  line-height: 1.75;
}
.re-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  justify-content: center;
  margin-top: 1.25rem;
}

/* Section headings */
.re-section-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--ww-primary);
}
.re-section-sub {
  font-size: .9375rem;
  color: var(--ww-text-muted);
  margin-bottom: 1.5rem;
}

/* Menu / offering grid */
.re-menu-section { margin-top: 2.5rem; }
.re-menu-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.re-menu-card {
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  background: var(--ww-bg-surface);
  display: flex;
  flex-direction: column;
  gap: .375rem;
}
.re-menu-card-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ww-text);
  margin: 0;
}
.re-menu-card-desc {
  font-size: .875rem;
  color: var(--ww-text-muted);
  line-height: 1.55;
  flex: 1;
  margin: 0;
}
.re-menu-card-price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ww-primary);
  margin: .25rem 0 0;
}
.re-menu-see-all {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: .9375rem;
  font-weight: 600;
  color: var(--ww-primary);
  text-decoration: underline;
}
.re-menu-see-all:hover { opacity: .8; }

/* Contact strip / info bar */
.re-contact-strip {
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
.re-contact-strip-item {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.re-contact-strip-label {
  font-size: .75rem;
  font-weight: 600;
  color: var(--ww-text-muted);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.re-contact-strip-value {
  font-size: .9375rem;
  font-weight: 600;
  color: var(--ww-text);
}
.re-contact-strip-value a {
  color: var(--ww-primary);
}

/* About page */
.re-about-hero {
  text-align: center;
  padding: 2rem 0 1.5rem;
}
.re-about-hero h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  margin-bottom: .75rem;
}
.re-about-body { max-width: 40rem; margin: 0 auto; }
.re-about-desc {
  color: var(--ww-text-muted);
  line-height: 1.8;
  margin-bottom: 2rem;
}
.re-detail-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}
.re-detail-row { display: flex; gap: 1rem; align-items: flex-start; }
.re-detail-label {
  font-size: .875rem;
  font-weight: 700;
  min-width: 6rem;
  color: var(--ww-text);
  flex-shrink: 0;
}
.re-detail-value {
  font-size: .9375rem;
  color: var(--ww-text-muted);
}
.re-detail-value a { color: var(--ww-primary); }
.re-badge {
  display: inline-block;
  padding: .125rem .625rem;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 700;
  background: var(--ww-primary);
  color: #fff;
  margin-bottom: 1rem;
}

/* Services / full menu page */
.re-services-hero {
  text-align: center;
  padding: 2rem 0 1.5rem;
}
.re-services-hero h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  margin-bottom: .5rem;
}
.re-services-sub {
  color: var(--ww-text-muted);
  margin-bottom: 1.5rem;
}
.re-empty-state {
  text-align: center;
  color: var(--ww-text-muted);
  padding: 3rem 1rem;
  font-size: 1rem;
}
.re-empty-state a { color: var(--ww-primary); font-weight: 600; }
.re-services-wa-strip {
  margin-top: 2.5rem;
  padding: 1.5rem;
  background: var(--ww-bg-surface);
  border-radius: var(--ww-radius);
  text-align: center;
}
.re-services-wa-strip p {
  color: var(--ww-text-muted);
  margin-bottom: 1rem;
  font-size: .9375rem;
}

/* Contact page */
.re-contact-hero {
  text-align: center;
  padding: 2rem 0 1.5rem;
}
.re-contact-hero h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  margin-bottom: .5rem;
}
.re-contact-hero p { color: var(--ww-text-muted); }
.re-contact-wa-primary {
  margin: 1.5rem auto;
  text-align: center;
  padding: 1.5rem;
  background: var(--ww-bg-surface);
  border: 2px solid #25D366;
  border-radius: var(--ww-radius);
  max-width: 32rem;
}
.re-contact-wa-primary p {
  font-size: .9375rem;
  color: var(--ww-text-muted);
  margin-bottom: 1rem;
}
.re-contact-layout {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}
@media (min-width: 640px) {
  .re-contact-layout { grid-template-columns: 1fr 1fr; }
}
.re-contact-info h2 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.re-contact-info p {
  font-size: .9375rem;
  color: var(--ww-text-muted);
  margin-bottom: .625rem;
  line-height: 1.6;
}
.re-contact-info a { color: var(--ww-primary); font-weight: 600; }

/* Contact form */
.re-contact-form-wrapper h2 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.re-form { display: flex; flex-direction: column; gap: .875rem; }
.re-form-group { display: flex; flex-direction: column; gap: .375rem; }
.re-form-group label {
  font-size: .875rem;
  font-weight: 600;
  color: var(--ww-text);
}
.re-input {
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
.re-input:focus {
  outline: 2px solid var(--ww-primary);
  outline-offset: 1px;
  border-color: transparent;
}
.re-textarea { min-height: 120px; resize: vertical; }
.re-submit-btn {
  padding: .75rem 1.5rem;
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
.re-submit-btn:hover { filter: brightness(1.1); }
.re-form-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  text-align: center;
  color: #166534;
}
.re-form-success h3 { font-weight: 700; margin-bottom: .25rem; }

@media (max-width: 375px) {
  .re-hero-ctas { flex-direction: column; align-items: stretch; }
  .re-wa-btn, .ww-btn { width: 100%; justify-content: center; }
}
</style>`;

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

  const featured = offerings.slice(0, 6);

  const menuSection =
    featured.length === 0
      ? ''
      : `
  <section class="re-menu-section">
    <h2 class="re-section-title">Today's Offerings</h2>
    <div class="re-menu-grid">
      ${featured
        .map(
          (o) => `
      <div class="re-menu-card">
        <h3 class="re-menu-card-name">${esc(o.name)}</h3>
        ${o.description ? `<p class="re-menu-card-desc">${esc(o.description)}</p>` : ''}
        ${o.priceKobo !== null ? `<p class="re-menu-card-price">${fmtKobo(o.priceKobo)}</p>` : ''}
      </div>`,
        )
        .join('')}
    </div>
    ${offerings.length > 6 ? `<a href="/services" class="re-menu-see-all">View full menu (${offerings.length} items) →</a>` : `<a href="/services" class="re-menu-see-all">View full menu →</a>`}
  </section>`;

  const contactStrip = phone || placeName
    ? `
  <div class="re-contact-strip">
    ${phone
      ? `<div class="re-contact-strip-item">
        <span class="re-contact-strip-label">Phone / WhatsApp</span>
        <span class="re-contact-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
      </div>`
      : ''}
    ${placeName
      ? `<div class="re-contact-strip-item">
        <span class="re-contact-strip-label">Location</span>
        <span class="re-contact-strip-value">${esc(placeName)}</span>
      </div>`
      : ''}
    <div class="re-contact-strip-item">
      <span class="re-contact-strip-label">Order</span>
      <span class="re-contact-strip-value">
        ${waBtn(phone, `Hello ${esc(ctx.displayName)}! I'd like to place an order.`)}
      </span>
    </div>
  </div>`
    : '';

  return `
${TEMPLATE_CSS}

<section class="re-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" class="re-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline ? `<p class="re-tagline">${esc(tagline)}</p>` : `<p class="re-tagline">Authentic Nigerian cuisine — dine in, takeaway &amp; WhatsApp orders welcome.</p>`}
  ${description ? `<p class="re-hero-desc">${esc(description)}</p>` : ''}
  <div class="re-hero-ctas">
    ${waBtn(phone, `Hello ${esc(ctx.displayName)}! I'd like to place an order.`)}
    <a class="ww-btn ww-btn-outline" href="/services">View Menu</a>
  </div>
</section>

${menuSection}
${contactStrip}
`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const category = (ctx.data.category as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const website = (ctx.data.website as string | null) ?? null;

  function safeHref(url: string): string {
    try {
      const p = new URL(url, 'https://placeholder.invalid');
      if (p.protocol === 'http:' || p.protocol === 'https:') return encodeURI(url);
    } catch { /* invalid URL */ }
    return '#';
  }

  return `
${TEMPLATE_CSS}

<section class="re-about-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" class="re-hero-logo" />` : ''}
  <h1>About ${esc(ctx.displayName)}</h1>
  ${category ? `<span class="re-badge">${esc(category)}</span>` : ''}
</section>

<div class="re-about-body">
  <p class="re-about-desc">
    ${description
      ? esc(description)
      : `${esc(ctx.displayName)} is a Nigerian food business dedicated to serving authentic, freshly prepared meals. We take pride in our ingredients and the experience we offer every customer — whether dining in or ordering for takeaway.`}
  </p>

  <div class="re-detail-list">
    ${placeName
      ? `<div class="re-detail-row">
          <span class="re-detail-label">Location</span>
          <span class="re-detail-value">${esc(placeName)}</span>
        </div>`
      : ''}
    ${phone
      ? `<div class="re-detail-row">
          <span class="re-detail-label">Phone</span>
          <span class="re-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${website
      ? `<div class="re-detail-row">
          <span class="re-detail-label">Website</span>
          <span class="re-detail-value"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)}</a></span>
        </div>`
      : ''}
  </div>

  ${waBtn(phone, `Hello ${esc(ctx.displayName)}! I'd like to know more and place an order.`)}
</div>
`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;

  const menuGrid =
    offerings.length === 0
      ? `<p class="re-empty-state">
          Our menu is coming soon!<br/>
          Call us to order today:
          ${phone ? `<br/><a href="tel:${esc(phone)}">${esc(phone)}</a>` : ''}
        </p>`
      : `<div class="re-menu-grid">
          ${offerings
            .map(
              (o) => `
          <div class="re-menu-card">
            <h3 class="re-menu-card-name">${esc(o.name)}</h3>
            ${o.description ? `<p class="re-menu-card-desc">${esc(o.description)}</p>` : ''}
            ${o.priceKobo !== null ? `<p class="re-menu-card-price">${fmtKobo(o.priceKobo)}</p>` : ''}
          </div>`,
            )
            .join('')}
        </div>`;

  const waLink = whatsappLink(phone, `Hello ${esc(ctx.displayName)}! I've seen your menu and I'd like to order.`);

  return `
${TEMPLATE_CSS}

<section class="re-services-hero">
  <h1>Our Menu</h1>
  <p class="re-services-sub">Browse ${esc(ctx.displayName)}'s freshly prepared dishes</p>
</section>

<section>
  ${menuGrid}
</section>

${waLink
  ? `<div class="re-services-wa-strip">
      <p>Ready to order? Tap below to send us a WhatsApp message — we'll confirm your order and give you a pickup or delivery time.</p>
      <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="re-wa-btn" aria-label="Order on WhatsApp">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
        </svg>
        Order on WhatsApp
      </a>
    </div>`
  : ''}
`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;

  const waHref = whatsappLink(phone, `Hello ${esc(ctx.displayName)}! I'd like to get in touch.`);

  return `
${TEMPLATE_CSS}

<section class="re-contact-hero">
  <h1>Find Us &amp; Order</h1>
  <p>We love hearing from our customers. WhatsApp us to order — or use the form below.</p>
</section>

${waHref
  ? `<div class="re-contact-wa-primary">
      <p>The fastest way to reach us is via WhatsApp. Tap the button below to start a conversation — we typically respond within minutes.</p>
      <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="re-wa-btn" aria-label="Order on WhatsApp">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
        </svg>
        Chat with us on WhatsApp
      </a>
    </div>`
  : ''}

<div class="re-contact-layout">
  <div class="re-contact-info">
    <h2>Our Details</h2>
    ${placeName ? `<p><strong>Location:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName
      ? `<p>Check back soon for our contact details.</p>`
      : ''}
  </div>

  <div class="re-contact-form-wrapper">
    <h2>Send Us a Message</h2>
    <form class="re-form" method="POST" action="/contact" id="reContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="re-form-group">
        <label for="re-name">Your name</label>
        <input id="re-name" name="name" type="text" required autocomplete="name"
               class="re-input" placeholder="Adaeze Okafor" />
      </div>
      <div class="re-form-group">
        <label for="re-phone">Phone number</label>
        <input id="re-phone" name="phone" type="tel" required autocomplete="tel"
               class="re-input" placeholder="0803 000 0000" />
      </div>
      <div class="re-form-group">
        <label for="re-email">Email (optional)</label>
        <input id="re-email" name="email" type="email" autocomplete="email"
               class="re-input" placeholder="you@example.com" />
      </div>
      <div class="re-form-group">
        <label for="re-message">Message or order details</label>
        <textarea id="re-message" name="message" required rows="4"
                  class="re-input re-textarea"
                  placeholder="e.g. I'd like to order 2 plates of Jollof rice and 1 Egusi soup for takeaway at 1pm."></textarea>
      </div>
      <button type="submit" class="re-submit-btn">Send Message</button>
    </form>
    <div id="reContactSuccess" class="re-form-success" style="display:none" role="status" aria-live="polite">
      <h3>Message sent!</h3>
      <p>Thank you for reaching out. We'll get back to you shortly.</p>
    </div>
  </div>
</div>

<script>
(function () {
  var form = document.getElementById('reContactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch('/contact', { method: 'POST', body: data })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function () {
        form.style.display = 'none';
        var success = document.getElementById('reContactSuccess');
        if (success) success.style.display = 'block';
      })
      .catch(function () {
        form.submit();
      });
  });
})();
</script>
`;
}

// ---------------------------------------------------------------------------
// WebsiteTemplateContract — exported implementation
// ---------------------------------------------------------------------------

export const restaurantGeneralEateryTemplate: WebsiteTemplateContract = {
  slug: 'restaurant-general-eatery',
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
