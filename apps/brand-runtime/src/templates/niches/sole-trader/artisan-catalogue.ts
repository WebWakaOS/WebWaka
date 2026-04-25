/**
 * Sole Trader / Artisan Catalogue template — standalone (VN-SVC-002)
 * Pillar 2 — P2-sole-trader-artisan-catalogue
 * Milestone: M8e
 *
 * Nigeria-First design decisions:
 *   • First-person voice throughout — "My Work", "My Services", "WhatsApp Me"
 *   • WhatsApp is the primary (often sole) digital channel — CTA is the hero
 *   • Floating WhatsApp button fixed bottom-right on all pages (CSS-only, no JS)
 *   • NGN (₦) pricing with en-NG locale; price-on-request fallback for null prices
 *   • Informal, direct language — Nigerian English register, not corporate
 *   • LGA + market/area level location specificity
 *   • Works for ALL artisan trades: tailors, carpenters, plumbers, electricians, cobblers, welders…
 *
 * Africa-First: Informal artisan economy dominant across sub-Saharan Africa.
 *   WhatsApp-first catalogue model (Kenya Jua Kali, Ghana roadside, SA informal trades).
 *
 * Standalone: this template is not an anchor for any family variant.
 *
 * Platform Invariants:
 *   T2 — TypeScript strict; no `any`
 *   T3 — no DB queries; all data via ctx.data; ctx.tenantId for contact form only
 *   T4 — prices as integer kobo; fmtKobo() for display
 *   P7 — CSS custom properties only (var(--ww-*)); #25D366 WhatsApp brand exception
 *   P9 — NGN-first currency display
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
  const msg = encodeURIComponent(message ?? "Hello! I saw your profile and I'd like to enquire about your services.");
  return `https://wa.me/${intl}?text=${msg}`;
}

/** WhatsApp CTA anchor (inline) — returns '' if no phone. */
function waInlineBtn(phone: string | null, label: string, msg?: string): string {
  const href = whatsappLink(phone, msg);
  if (!href) return '';
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="st-wa-btn" aria-label="${esc(label)}">
    ${waSvg()}
    ${esc(label)}
  </a>`;
}

function waSvg(): string {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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

/** Floating WhatsApp button — CSS-only, rendered on every page when phone is present. */
function waFloat(phone: string | null, displayName: string): string {
  const href = whatsappLink(
    phone,
    `Hello ${displayName}! I found your profile and I'd like to enquire about your services.`,
  );
  if (!href) return '';
  return `
<div class="st-wa-float" aria-label="Chat on WhatsApp">
  <a href="${href}" target="_blank" rel="noopener noreferrer" class="st-wa-float-btn"
     aria-label="WhatsApp ${esc(displayName)}">
    ${waSvg()}
    <span class="st-wa-float-label">WhatsApp Me</span>
  </a>
</div>`;
}

// ---------------------------------------------------------------------------
// Shared scoped CSS
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
<style>
/* Sole Trader / Artisan Catalogue — standalone template scoped styles */

/* WhatsApp inline button */
.st-wa-btn {
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
.st-wa-btn:hover { filter: brightness(1.08); text-decoration: none; }

/* Floating WhatsApp button */
.st-wa-float {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 500;
}
.st-wa-float-btn {
  display: flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1.25rem;
  background: #25D366;
  color: #fff;
  border-radius: 999px;
  font-size: .9375rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(37, 211, 102, .4);
  transition: filter .15s, box-shadow .15s;
}
.st-wa-float-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 6px 24px rgba(37, 211, 102, .5);
  text-decoration: none;
}
.st-wa-float-label { white-space: nowrap; }

/* Hero */
.st-hero {
  text-align: center;
  padding: 2.5rem 0 2rem;
}
.st-hero-logo {
  height: 80px;
  width: auto;
  margin-bottom: 1.25rem;
  border-radius: 8px;
}
.st-hero h1 {
  font-size: clamp(1.75rem, 4.5vw, 2.75rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: .75rem;
  color: var(--ww-text);
}
.st-tagline {
  font-size: 1.125rem;
  color: var(--ww-text-muted);
  margin-bottom: 1rem;
  max-width: 36rem;
  margin-inline: auto;
  line-height: 1.6;
}
.st-hero-desc {
  color: var(--ww-text-muted);
  max-width: 40rem;
  margin-inline: auto;
  margin-bottom: 1.75rem;
  line-height: 1.75;
}
.st-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  justify-content: center;
  margin-top: 1.25rem;
}

/* Section titles */
.st-section-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--ww-primary);
}

/* Service / offering cards */
.st-services-section { margin-top: 2.5rem; }
.st-services-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.st-service-card {
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  background: var(--ww-bg-surface);
  display: flex;
  flex-direction: column;
  gap: .375rem;
}
.st-service-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ww-text);
  margin: 0;
}
.st-service-desc {
  font-size: .875rem;
  color: var(--ww-text-muted);
  line-height: 1.55;
  flex: 1;
  margin: 0;
}
.st-service-price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ww-primary);
  margin: .25rem 0 0;
}
.st-service-poa {
  font-size: .875rem;
  color: var(--ww-text-muted);
  font-style: italic;
  margin: .25rem 0 0;
}
.st-see-all {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: .9375rem;
  font-weight: 600;
  color: var(--ww-primary);
  text-decoration: underline;
}
.st-see-all:hover { opacity: .8; }

/* Contact strip */
.st-contact-strip {
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
.st-contact-strip-item { display: flex; flex-direction: column; gap: .25rem; }
.st-contact-strip-label {
  font-size: .75rem;
  font-weight: 600;
  color: var(--ww-text-muted);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.st-contact-strip-value { font-size: .9375rem; font-weight: 600; color: var(--ww-text); }
.st-contact-strip-value a { color: var(--ww-primary); }

/* About page */
.st-about-hero { text-align: center; padding: 2rem 0 1.5rem; }
.st-about-hero h1 {
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  font-weight: 800;
  margin-bottom: .75rem;
}
.st-about-body { max-width: 40rem; margin: 0 auto; }
.st-about-desc {
  color: var(--ww-text-muted);
  line-height: 1.8;
  margin-bottom: 2rem;
}
.st-detail-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.st-detail-row { display: flex; gap: 1rem; align-items: flex-start; }
.st-detail-label { font-size: .875rem; font-weight: 700; min-width: 6rem; color: var(--ww-text); flex-shrink: 0; }
.st-detail-value { font-size: .9375rem; color: var(--ww-text-muted); }
.st-detail-value a { color: var(--ww-primary); }
.st-badge {
  display: inline-block;
  padding: .125rem .625rem;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 700;
  background: var(--ww-primary);
  color: #fff;
  margin-bottom: 1rem;
}

/* Services full page */
.st-services-hero { text-align: center; padding: 2rem 0 1.5rem; }
.st-services-hero h1 { font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 800; margin-bottom: .5rem; }
.st-services-sub { color: var(--ww-text-muted); margin-bottom: 1.5rem; }
.st-empty-state {
  text-align: center;
  color: var(--ww-text-muted);
  padding: 3rem 1rem;
  font-size: 1rem;
  line-height: 1.7;
}
.st-empty-state a { color: var(--ww-primary); font-weight: 600; }
.st-bottom-wa-strip {
  margin-top: 2.5rem;
  padding: 1.5rem;
  background: var(--ww-bg-surface);
  border-radius: var(--ww-radius);
  text-align: center;
}
.st-bottom-wa-strip p { color: var(--ww-text-muted); margin-bottom: 1rem; font-size: .9375rem; }

/* Contact page */
.st-contact-hero { text-align: center; padding: 2rem 0 1.5rem; }
.st-contact-hero h1 { font-size: clamp(1.5rem, 4vw, 2.25rem); font-weight: 800; margin-bottom: .5rem; }
.st-contact-hero p { color: var(--ww-text-muted); }
.st-contact-wa-primary {
  margin: 1.5rem auto;
  text-align: center;
  padding: 1.75rem 1.5rem;
  background: var(--ww-bg-surface);
  border: 2px solid #25D366;
  border-radius: var(--ww-radius);
  max-width: 32rem;
}
.st-contact-wa-primary p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: 1rem; }
.st-contact-layout {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}
@media (min-width: 640px) { .st-contact-layout { grid-template-columns: 1fr 1fr; } }
.st-contact-info h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.st-contact-info p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: .625rem; line-height: 1.6; }
.st-contact-info a { color: var(--ww-primary); font-weight: 600; }
.st-form-wrapper h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.st-form { display: flex; flex-direction: column; gap: .875rem; }
.st-form-group { display: flex; flex-direction: column; gap: .375rem; }
.st-form-group label { font-size: .875rem; font-weight: 600; color: var(--ww-text); }
.st-input {
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
.st-input:focus { outline: 2px solid var(--ww-primary); outline-offset: 1px; border-color: transparent; }
.st-textarea { min-height: 120px; resize: vertical; }
.st-submit-btn {
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
.st-submit-btn:hover { filter: brightness(1.1); }
.st-form-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  text-align: center;
  color: #166534;
}
.st-form-success h3 { font-weight: 700; margin-bottom: .25rem; }

/* Bottom padding so floating WhatsApp button doesn't overlap footer */
.st-page-pad { padding-bottom: 5rem; }

@media (max-width: 375px) {
  .st-hero-ctas { flex-direction: column; align-items: stretch; }
  .st-wa-btn, .ww-btn { width: 100%; justify-content: center; }
  .st-wa-float-label { display: none; }
  .st-wa-float-btn { padding: .875rem; }
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

  const servicesSection =
    featured.length === 0
      ? ''
      : `
  <section class="st-services-section">
    <h2 class="st-section-title">My Services</h2>
    <div class="st-services-grid">
      ${featured
        .map(
          (o) => `
      <div class="st-service-card">
        <h3 class="st-service-name">${esc(o.name)}</h3>
        ${o.description ? `<p class="st-service-desc">${esc(o.description)}</p>` : ''}
        ${
          o.priceKobo !== null
            ? `<p class="st-service-price">${fmtKobo(o.priceKobo)}</p>`
            : `<p class="st-service-poa">Price on request — WhatsApp me</p>`
        }
      </div>`,
        )
        .join('')}
    </div>
    <a href="/services" class="st-see-all">See all my services →</a>
  </section>`;

  const contactStrip = phone || placeName
    ? `
  <div class="st-contact-strip">
    ${phone
      ? `<div class="st-contact-strip-item">
          <span class="st-contact-strip-label">Phone / WhatsApp</span>
          <span class="st-contact-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${placeName
      ? `<div class="st-contact-strip-item">
          <span class="st-contact-strip-label">Location</span>
          <span class="st-contact-strip-value">${esc(placeName)}</span>
        </div>`
      : ''}
    ${phone
      ? `<div class="st-contact-strip-item">
          <span class="st-contact-strip-label">Order / Enquire</span>
          <span class="st-contact-strip-value">
            ${waInlineBtn(phone, 'WhatsApp Me', `Hello ${esc(ctx.displayName)}! I'd like to enquire about your services.`)}
          </span>
        </div>`
      : ''}
  </div>`
    : '';

  return `
${TEMPLATE_CSS}

<div class="st-page-pad">
  <section class="st-hero">
    ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" class="st-hero-logo" />` : ''}
    <h1>${esc(ctx.displayName)}</h1>
    ${tagline
      ? `<p class="st-tagline">${esc(tagline)}</p>`
      : `<p class="st-tagline">Quality work, honest prices. WhatsApp me to get started.</p>`}
    ${description ? `<p class="st-hero-desc">${esc(description)}</p>` : ''}
    <div class="st-hero-ctas">
      ${waInlineBtn(phone, 'WhatsApp Me', `Hello ${esc(ctx.displayName)}! I'd like to enquire about your services.`)}
      <a class="ww-btn ww-btn-outline" href="/services">See My Work</a>
    </div>
  </section>

  ${servicesSection}
  ${contactStrip}
</div>

${waFloat(phone, ctx.displayName)}
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

<div class="st-page-pad">
  <section class="st-about-hero">
    ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" class="st-hero-logo" />` : ''}
    <h1>About Me</h1>
    ${category ? `<span class="st-badge">${esc(category)}</span>` : ''}
  </section>

  <div class="st-about-body">
    <p class="st-about-desc">
      ${description
        ? esc(description)
        : `I am ${esc(ctx.displayName)}, a skilled artisan and sole trader serving customers across Nigeria. I take pride in delivering quality work at honest prices. Contact me today to discuss your requirements.`}
    </p>

    <div class="st-detail-list">
      ${placeName
        ? `<div class="st-detail-row">
            <span class="st-detail-label">Location</span>
            <span class="st-detail-value">${esc(placeName)}</span>
          </div>`
        : ''}
      ${phone
        ? `<div class="st-detail-row">
            <span class="st-detail-label">Phone</span>
            <span class="st-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
          </div>`
        : ''}
      ${website
        ? `<div class="st-detail-row">
            <span class="st-detail-label">Website</span>
            <span class="st-detail-value"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)}</a></span>
          </div>`
        : ''}
    </div>

    ${waInlineBtn(phone, 'WhatsApp Me', `Hello ${esc(ctx.displayName)}! I found your profile and I'd like to enquire about your work.`)}
  </div>
</div>

${waFloat(phone, ctx.displayName)}
`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;

  const grid =
    offerings.length === 0
      ? `<div class="st-empty-state">
          <p>My full service list is coming soon.</p>
          ${phone
            ? `<p>In the meantime, WhatsApp me or call to find out what I can do for you:<br/>
               <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`
            : ''}
          ${waInlineBtn(phone, 'WhatsApp Me', `Hello ${esc(ctx.displayName)}! I'd like to know what services you offer.`)}
        </div>`
      : `<div class="st-services-grid">
          ${offerings
            .map(
              (o) => `
          <div class="st-service-card">
            <h3 class="st-service-name">${esc(o.name)}</h3>
            ${o.description ? `<p class="st-service-desc">${esc(o.description)}</p>` : ''}
            ${
              o.priceKobo !== null
                ? `<p class="st-service-price">${fmtKobo(o.priceKobo)}</p>`
                : `<p class="st-service-poa">Price on request — WhatsApp me</p>`
            }
          </div>`,
            )
            .join('')}
        </div>`;

  const waHref = whatsappLink(
    phone,
    `Hello ${esc(ctx.displayName)}! I've seen your services and I'd like to discuss a job.`,
  );

  return `
${TEMPLATE_CSS}

<div class="st-page-pad">
  <section class="st-services-hero">
    <h1>My Services</h1>
    <p class="st-services-sub">Here's what I do — contact me to discuss your requirements</p>
  </section>

  <section>${grid}</section>

  ${waHref
    ? `<div class="st-bottom-wa-strip">
        <p>Don't see exactly what you need? WhatsApp me — I may still be able to help.</p>
        <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="st-wa-btn" aria-label="WhatsApp enquiry">
          ${waSvg()}
          WhatsApp Me to Discuss
        </a>
      </div>`
    : ''}
</div>

${waFloat(phone, ctx.displayName)}
`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;

  const waHref = whatsappLink(
    phone,
    `Hello ${esc(ctx.displayName)}! I'd like to get in touch about your services.`,
  );

  return `
${TEMPLATE_CSS}

<div class="st-page-pad">
  <section class="st-contact-hero">
    <h1>Get in Touch</h1>
    <p>The quickest way to reach me is WhatsApp — I respond fast.</p>
  </section>

  ${waHref
    ? `<div class="st-contact-wa-primary">
        <p>Tap below to start a WhatsApp conversation with me. Tell me what you need and I'll get back to you as soon as possible.</p>
        <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="st-wa-btn" aria-label="WhatsApp me directly">
          ${waSvg()}
          WhatsApp Me Directly
        </a>
      </div>`
    : ''}

  <div class="st-contact-layout">
    <div class="st-contact-info">
      <h2>My Details</h2>
      ${placeName ? `<p><strong>Location:</strong> ${esc(placeName)}</p>` : ''}
      ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
      ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
      ${!phone && !email && !placeName
        ? '<p>Contact details coming soon.</p>'
        : ''}
    </div>

    <div class="st-form-wrapper">
      <h2>Send a Message</h2>
      <form class="st-form" method="POST" action="/contact" id="stContactForm">
        <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
        <div class="st-form-group">
          <label for="st-name">Your name</label>
          <input id="st-name" name="name" type="text" required autocomplete="name"
                 class="st-input" placeholder="Chukwuemeka Obi" />
        </div>
        <div class="st-form-group">
          <label for="st-phone">Phone number</label>
          <input id="st-phone" name="phone" type="tel" required autocomplete="tel"
                 class="st-input" placeholder="0803 000 0000" />
        </div>
        <div class="st-form-group">
          <label for="st-email">Email (optional)</label>
          <input id="st-email" name="email" type="email" autocomplete="email"
                 class="st-input" placeholder="you@example.com" />
        </div>
        <div class="st-form-group">
          <label for="st-message">What do you need?</label>
          <textarea id="st-message" name="message" required rows="4"
                    class="st-input st-textarea"
                    placeholder="e.g. I need a 3-door wardrobe, about 6ft tall, in mahogany finish. When can you start?"></textarea>
        </div>
        <button type="submit" class="st-submit-btn">Send Message</button>
      </form>
      <div id="stContactSuccess" class="st-form-success" style="display:none" role="status" aria-live="polite">
        <h3>Message sent!</h3>
        <p>Thank you — I'll get back to you shortly. You can also WhatsApp me for a faster response.</p>
      </div>
    </div>
  </div>
</div>

${waFloat(phone, ctx.displayName)}

<script>
(function () {
  var form = document.getElementById('stContactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch('/contact', { method: 'POST', body: data })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function () {
        form.style.display = 'none';
        var success = document.getElementById('stContactSuccess');
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

export const soleTraderArtisanCatalogueTemplate: WebsiteTemplateContract = {
  slug: 'sole-trader-artisan-catalogue',
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
