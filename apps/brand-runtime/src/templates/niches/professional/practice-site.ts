/**
 * Licensed Professional Practice template — NF-PRO-LIC family ANCHOR (VN-PRO-001)
 * Pillar 2 — P2-professional-practice-site
 * Milestone: M8e — P1-Original
 *
 * Nigeria-First design decisions:
 *   • Credentials-first trust layout — professional body badge visible above the fold
 *   • WhatsApp-primary consultation booking (Nigerian professionals book via WhatsApp)
 *   • Formal register throughout — "Specialisation", "Chambers", "Practice Areas"
 *   • "Fee on enquiry" fallback for null prices (professional decorum over WhatsApp msg)
 *   • Professional body vocabulary: NBA (Lawyers), NMA (Doctors), ICAN (Accountants),
 *     NIA (Architects), COREN (Engineers), SURCON (Surveyors)
 *   • No floating WhatsApp button — professional image constraint
 *   • NGN (₦) for all consultation fees
 *
 * Africa-First: Credential display pattern maps directly to Ghana (GBA/ICAG),
 *   Kenya (LSK/KMA/ICPAK), South Africa (LSSA/HPCSA/SAICA). WhatsApp consultation
 *   booking is pan-African across all Commonwealth legal systems.
 *
 * Family anchor: NF-PRO-LIC — variants: land-surveyor, professional-association.
 *   All variants must inherit: .pr- namespace, WhatsApp-primary CTAs (no float),
 *   "Fee on enquiry" fallback, credential badge pattern, formal register.
 *
 * Platform Invariants:
 *   T2 — TypeScript strict; no `any`
 *   T3 — no DB queries; all data via ctx.data; ctx.tenantId for contact form only
 *   T4 — prices as integer kobo; fmtKobo() for display; null → "Fee on enquiry"
 *   P7 — CSS custom properties only (var(--ww-*)); #25D366 WhatsApp exception
 *   P9 — NGN-first currency
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
    message ?? 'Hello, I would like to book a consultation.',
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
// Shared scoped CSS
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
<style>
/* Licensed Professional Practice — NF-PRO-LIC anchor template */

/* Hero */
.pr-hero {
  text-align: center;
  padding: 2.75rem 0 2.25rem;
}
.pr-hero-logo {
  height: 100px;
  width: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1.25rem;
  border: 3px solid var(--ww-primary);
}
.pr-credential-badge {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .375rem 1rem;
  border-radius: 999px;
  font-size: .8125rem;
  font-weight: 700;
  background: transparent;
  border: 2px solid var(--ww-primary);
  color: var(--ww-primary);
  margin-bottom: 1rem;
  letter-spacing: .03em;
}
.pr-credential-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  background: var(--ww-primary);
  border-radius: 50%;
  flex-shrink: 0;
}
.pr-hero h1 {
  font-size: clamp(1.875rem, 4.5vw, 2.75rem);
  font-weight: 900;
  line-height: 1.2;
  margin-bottom: .625rem;
  color: var(--ww-text);
  letter-spacing: -.02em;
}
.pr-designation {
  font-size: 1.0625rem;
  color: var(--ww-text-muted);
  margin-bottom: 1.5rem;
  font-weight: 500;
  letter-spacing: .01em;
}
.pr-hero-bio {
  color: var(--ww-text-muted);
  max-width: 40rem;
  margin-inline: auto;
  margin-bottom: 2rem;
  line-height: 1.75;
  font-size: .9375rem;
}
.pr-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  justify-content: center;
}

/* WhatsApp primary button */
.pr-wa-primary {
  display: inline-flex;
  align-items: center;
  gap: .625rem;
  padding: .875rem 1.75rem;
  background: #25D366;
  color: #fff;
  border-radius: var(--ww-radius);
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  min-height: 44px;
  transition: filter .15s;
}
.pr-wa-primary:hover { filter: brightness(1.08); text-decoration: none; }

/* Phone secondary button */
.pr-phone-btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .75rem 1.5rem;
  background: transparent;
  border: 2px solid var(--ww-primary);
  color: var(--ww-primary);
  border-radius: var(--ww-radius);
  font-size: .9375rem;
  font-weight: 600;
  text-decoration: none;
  min-height: 44px;
  transition: background .15s, color .15s;
}
.pr-phone-btn:hover { background: var(--ww-primary); color: #fff; text-decoration: none; }

/* Section */
.pr-section { margin-top: 2.75rem; }
.pr-section-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--ww-primary);
}
.pr-section-sub { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: 1.5rem; }

/* Practice area / service cards */
.pr-areas-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.pr-area-card {
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
.pr-area-card:hover { border-color: var(--ww-primary); }
.pr-area-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ww-text);
  margin: 0;
}
.pr-area-desc {
  font-size: .875rem;
  color: var(--ww-text-muted);
  line-height: 1.55;
  flex: 1;
  margin: 0;
}
.pr-area-fee {
  font-size: .9375rem;
  font-weight: 700;
  color: var(--ww-primary);
  margin: .375rem 0 0;
}
.pr-area-enquiry {
  font-size: .8125rem;
  color: var(--ww-text-muted);
  font-style: italic;
  margin: .375rem 0 0;
}
.pr-see-all {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: .9375rem;
  font-weight: 600;
  color: var(--ww-primary);
  text-decoration: underline;
}
.pr-see-all:hover { opacity: .8; }

/* Contact strip */
.pr-contact-strip {
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
.pr-strip-item { display: flex; flex-direction: column; gap: .25rem; }
.pr-strip-label {
  font-size: .75rem;
  font-weight: 600;
  color: var(--ww-text-muted);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.pr-strip-value { font-size: .9375rem; font-weight: 600; color: var(--ww-text); }
.pr-strip-value a { color: var(--ww-primary); }

/* About page */
.pr-about-hero { text-align: center; padding: 2.5rem 0 2rem; }
.pr-about-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.pr-about-body { max-width: 44rem; margin: 0 auto; }
.pr-about-desc {
  color: var(--ww-text-muted);
  line-height: 1.9;
  margin-bottom: 2rem;
  font-size: 1rem;
}
.pr-detail-list { display: flex; flex-direction: column; gap: .875rem; margin-bottom: 2rem; }
.pr-detail-row { display: flex; gap: 1rem; align-items: flex-start; }
.pr-detail-label { font-size: .875rem; font-weight: 700; min-width: 7.5rem; color: var(--ww-text); flex-shrink: 0; }
.pr-detail-value { font-size: .9375rem; color: var(--ww-text-muted); }
.pr-detail-value a { color: var(--ww-primary); font-weight: 600; }

/* Services page */
.pr-services-hero { text-align: center; padding: 2.5rem 0 2rem; }
.pr-services-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.pr-services-sub { color: var(--ww-text-muted); margin-bottom: 1.5rem; }
.pr-empty-state {
  text-align: center;
  color: var(--ww-text-muted);
  padding: 3rem 1rem;
  font-size: 1rem;
  line-height: 1.8;
}
.pr-bottom-cta-strip {
  margin-top: 2.5rem;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border-radius: var(--ww-radius);
  border: 1px solid var(--ww-border);
  text-align: center;
}
.pr-bottom-cta-strip h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: .5rem; }
.pr-bottom-cta-strip p { color: var(--ww-text-muted); margin-bottom: 1.25rem; font-size: .9375rem; }
.pr-btn-row { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; }

/* Contact page */
.pr-contact-hero { text-align: center; padding: 2.5rem 0 2rem; }
.pr-contact-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.pr-contact-hero p { color: var(--ww-text-muted); max-width: 34rem; margin-inline: auto; }
.pr-wa-block {
  margin: 1.75rem auto;
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border: 2px solid #25D366;
  border-radius: var(--ww-radius);
  max-width: 32rem;
}
.pr-wa-block p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: 1rem; }
.pr-contact-layout {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}
@media (min-width: 640px) { .pr-contact-layout { grid-template-columns: 1fr 1fr; } }
.pr-contact-info h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.pr-contact-info p {
  font-size: .9375rem;
  color: var(--ww-text-muted);
  margin-bottom: .625rem;
  line-height: 1.6;
}
.pr-contact-info a { color: var(--ww-primary); font-weight: 600; }
.pr-form-wrapper h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.pr-form { display: flex; flex-direction: column; gap: .875rem; }
.pr-form-group { display: flex; flex-direction: column; gap: .375rem; }
.pr-form-group label { font-size: .875rem; font-weight: 600; color: var(--ww-text); }
.pr-input {
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
.pr-input:focus { outline: 2px solid var(--ww-primary); outline-offset: 1px; border-color: transparent; }
.pr-textarea { min-height: 120px; resize: vertical; }
.pr-submit-btn {
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
.pr-submit-btn:hover { filter: brightness(1.1); }
.pr-form-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  text-align: center;
  color: #166534;
}
.pr-form-success h3 { font-weight: 700; margin-bottom: .25rem; }

@media (max-width: 375px) {
  .pr-hero-ctas { flex-direction: column; align-items: stretch; }
  .pr-wa-primary, .pr-phone-btn { width: 100%; justify-content: center; }
}
</style>`;

// ---------------------------------------------------------------------------
// Page renderers
// ---------------------------------------------------------------------------

type Offering = { name: string; description: string | null; priceKobo: number | null };

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

function phoneSvg(): string {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07
             19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72
             c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27
             a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>`;
}

function shieldSvg(): string {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/>
  </svg>`;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;

  const featured = offerings.slice(0, 6);

  const bioExcerpt = description
    ? description.length > 220 ? description.slice(0, 220).trimEnd() + '…' : description
    : null;

  const waHref = whatsappLink(
    phone,
    `Hello ${esc(ctx.displayName)}, I would like to book a consultation. Please advise on availability.`,
  );

  const areasSection =
    featured.length === 0
      ? ''
      : `
  <section class="pr-section">
    <h2 class="pr-section-title">Areas of Practice</h2>
    <div class="pr-areas-grid">
      ${featured
        .map(
          (o) => `
      <div class="pr-area-card">
        <h3 class="pr-area-name">${esc(o.name)}</h3>
        ${o.description ? `<p class="pr-area-desc">${esc(o.description)}</p>` : ''}
        ${
          o.priceKobo !== null
            ? `<p class="pr-area-fee">From ${fmtKobo(o.priceKobo)}</p>`
            : `<p class="pr-area-enquiry">Fee on enquiry</p>`
        }
      </div>`,
        )
        .join('')}
    </div>
    <a href="/services" class="pr-see-all">View all areas of practice →</a>
  </section>`;

  const contactStrip = (phone || placeName)
    ? `
  <div class="pr-contact-strip">
    ${phone
      ? `<div class="pr-strip-item">
          <span class="pr-strip-label">Phone</span>
          <span class="pr-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${placeName
      ? `<div class="pr-strip-item">
          <span class="pr-strip-label">Office</span>
          <span class="pr-strip-value">${esc(placeName)}</span>
        </div>`
      : ''}
    <div class="pr-strip-item">
      <span class="pr-strip-label">Consultation</span>
      <span class="pr-strip-value"><a href="/contact">Book an appointment →</a></span>
    </div>
  </div>`
    : '';

  return `
${TEMPLATE_CSS}

<section class="pr-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pr-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline ? `<p class="pr-designation">${esc(tagline)}</p>` : `<p class="pr-designation">Licensed Professional</p>`}
  <div>
    <span class="pr-credential-badge">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"/>
        <path d="M9 12l2 2 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
      Verified Professional
    </span>
  </div>
  ${bioExcerpt ? `<p class="pr-hero-bio">${esc(bioExcerpt)}</p>` : ''}
  <div class="pr-hero-ctas">
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-primary"
            aria-label="WhatsApp ${esc(ctx.displayName)}">
           ${waSvg()} Book on WhatsApp
         </a>`
      : `<a class="pr-wa-primary" href="/contact">${waSvg()} Book a Consultation</a>`}
    ${phone
      ? `<a href="tel:${esc(phone)}" class="pr-phone-btn" aria-label="Call ${esc(ctx.displayName)}">
           ${phoneSvg()} Call Now
         </a>`
      : `<a href="/contact" class="pr-phone-btn">View Contact Details</a>`}
  </div>
</section>

${areasSection}
${contactStrip}
`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const category = (ctx.data.category as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const website = (ctx.data.website as string | null) ?? null;

  const waHref = whatsappLink(
    phone,
    `Hello ${esc(ctx.displayName)}, I would like to book a consultation. Please advise on availability.`,
  );

  return `
${TEMPLATE_CSS}

<section class="pr-about-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="pr-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category ? `<span class="pr-credential-badge">${shieldSvg()} ${esc(category)}</span>` : ''}
</section>

<div class="pr-about-body">
  <p class="pr-about-desc">
    ${description
      ? esc(description)
      : `${esc(ctx.displayName)} is a licensed Nigerian professional providing expert consultation and advisory services. ${category ? `Specialising in ${esc(category.toLowerCase())}, ` : ''}clients are provided with knowledgeable, confidential, and results-oriented professional services.`}
  </p>

  <div class="pr-detail-list">
    ${category
      ? `<div class="pr-detail-row">
          <span class="pr-detail-label">Profession</span>
          <span class="pr-detail-value">${esc(category)}</span>
        </div>`
      : ''}
    ${placeName
      ? `<div class="pr-detail-row">
          <span class="pr-detail-label">Office</span>
          <span class="pr-detail-value">${esc(placeName)}</span>
        </div>`
      : ''}
    ${phone
      ? `<div class="pr-detail-row">
          <span class="pr-detail-label">Phone</span>
          <span class="pr-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${website
      ? `<div class="pr-detail-row">
          <span class="pr-detail-label">Professional Profile</span>
          <span class="pr-detail-value">
            <a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">
              ${esc(website)} ↗
            </a>
          </span>
        </div>`
      : ''}
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-primary">
           ${waSvg()} Book on WhatsApp
         </a>`
      : `<a class="pr-wa-primary" href="/contact">${waSvg()} Book a Consultation</a>`}
    ${phone
      ? `<a href="tel:${esc(phone)}" class="pr-phone-btn">${phoneSvg()} Call Now</a>`
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
    `Hello ${esc(ctx.displayName)}, I would like to book a consultation. Please advise on availability.`,
  );

  const grid =
    offerings.length === 0
      ? `<div class="pr-empty-state">
          <p>Practice areas and service details are being updated.<br/>
          Please contact the office directly to discuss your matter.</p>
          <br/>
          ${waHref
            ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-primary">
                 ${waSvg()} Book on WhatsApp
               </a>`
            : `<a class="pr-wa-primary" href="/contact">${waSvg()} Book a Consultation</a>`}
        </div>`
      : `<div class="pr-areas-grid">
          ${offerings
            .map(
              (o) => `
          <div class="pr-area-card">
            <h3 class="pr-area-name">${esc(o.name)}</h3>
            ${o.description ? `<p class="pr-area-desc">${esc(o.description)}</p>` : ''}
            ${
              o.priceKobo !== null
                ? `<p class="pr-area-fee">From ${fmtKobo(o.priceKobo)}</p>`
                : `<p class="pr-area-enquiry">Fee on enquiry</p>`
            }
          </div>`,
            )
            .join('')}
        </div>`;

  return `
${TEMPLATE_CSS}

<section class="pr-services-hero">
  <h1>Areas of Practice</h1>
  <p class="pr-services-sub">Professional services offered by ${esc(ctx.displayName)}</p>
</section>

<section>${grid}</section>

<div class="pr-bottom-cta-strip">
  <h3>Ready to discuss your matter?</h3>
  <p>Book a consultation to speak directly with the professional. All enquiries are handled with strict confidentiality.</p>
  <div class="pr-btn-row">
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-primary">
           ${waSvg()} Book on WhatsApp
         </a>`
      : `<a class="pr-wa-primary" href="/contact">${waSvg()} Book a Consultation</a>`}
    ${phone
      ? `<a href="tel:${esc(phone)}" class="pr-phone-btn">${phoneSvg()} Call Now</a>`
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
    `Hello ${esc(ctx.displayName)}, I would like to book a consultation. Please advise on your availability and fees.`,
  );

  return `
${TEMPLATE_CSS}

<section class="pr-contact-hero">
  <h1>Book a Consultation</h1>
  <p>All enquiries are handled with strict professional confidentiality. Please describe your matter briefly and I will respond promptly.</p>
</section>

${waHref
  ? `<div class="pr-wa-block">
      <p>The fastest way to book a consultation is via WhatsApp. I respond to messages personally.</p>
      <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pr-wa-primary"
         aria-label="WhatsApp ${esc(ctx.displayName)}">
        ${waSvg()} Book on WhatsApp
      </a>
    </div>`
  : ''}

<div class="pr-contact-layout">
  <div class="pr-contact-info">
    <h2>Contact Details</h2>
    ${placeName ? `<p><strong>Office:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? `<p>Contact details will be listed here shortly.</p>` : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">
      All communications are subject to professional confidentiality obligations.
    </p>
  </div>

  <div class="pr-form-wrapper">
    <h2>Send an Enquiry</h2>
    <form class="pr-form" method="POST" action="/contact" id="prContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pr-form-group">
        <label for="pr-name">Your full name</label>
        <input id="pr-name" name="name" type="text" required autocomplete="name"
               class="pr-input" placeholder="e.g. Chidi Okeke" />
      </div>
      <div class="pr-form-group">
        <label for="pr-phone">Phone number</label>
        <input id="pr-phone" name="phone" type="tel" autocomplete="tel"
               class="pr-input" placeholder="0803 000 0000" />
      </div>
      <div class="pr-form-group">
        <label for="pr-email">Email address (optional)</label>
        <input id="pr-email" name="email" type="email" autocomplete="email"
               class="pr-input" placeholder="you@example.com" />
      </div>
      <div class="pr-form-group">
        <label for="pr-message">Nature of your matter</label>
        <textarea id="pr-message" name="message" required rows="4"
                  class="pr-input pr-textarea"
                  placeholder="Please briefly describe the nature of your matter so I can advise appropriately. All details are kept strictly confidential."></textarea>
      </div>
      <button type="submit" class="pr-submit-btn">Send Enquiry</button>
    </form>
    <div id="prContactSuccess" class="pr-form-success" style="display:none" role="status" aria-live="polite">
      <h3>Enquiry received</h3>
      <p>Thank you — your message has been received and will be treated with full confidentiality. I will respond promptly.</p>
    </div>
  </div>
</div>

<script>
(function () {
  var form = document.getElementById('prContactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch('/contact', { method: 'POST', body: data })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function () {
        form.style.display = 'none';
        var success = document.getElementById('prContactSuccess');
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

export const professionalPracticeSiteTemplate: WebsiteTemplateContract = {
  slug: 'professional-practice-site',
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
