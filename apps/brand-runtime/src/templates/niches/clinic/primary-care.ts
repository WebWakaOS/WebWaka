/**
 * Primary Care Clinic / Healthcare Site template — Standalone (VN-HLT-001, P1 health anchor)
 * Pillar 2 — P2-clinic-primary-care
 * Milestone: M8e — P1-Original (CRITICAL priority)
 *
 * Nigeria-First design decisions:
 *   • Trust-first layout: MDCN licence + HMO acceptance + NHIS accreditation displayed
 *     as the primary trust signals (from tagline/description)
 *   • WhatsApp-primary appointment booking — standard in Nigerian private clinic sector
 *   • Warm-professional register: "Your health is our priority" + formal medical language
 *   • Services = medical treatments/departments (not products); null → "Fee on enquiry"
 *   • "Walk-ins welcome" as secondary acquisition channel alongside WhatsApp appointments
 *   • Common Nigerian conditions in copy: malaria, hypertension, antenatal, typhoid
 *   • HMO Accepted as patient-facing trust label (AXA, Hygeia, Total Health Trust, etc.)
 *   • No floating WhatsApp button — formal healthcare context
 *   • NGN (₦) for consultation fees; null priceKobo → "Fee on enquiry"
 *
 * Africa-First: Primary care patterns (malaria/typhoid/hypertension) universal across
 *   West Africa. HMO/NHIS model parallels NHIF (Kenya), NHIA (Ghana). WhatsApp
 *   appointment booking is pan-African. Template scales to Ghana, Kenya, Senegal,
 *   South Africa.
 *
 * Standalone — P1 health anchor: .cl- namespace, WhatsApp-primary appointments,
 *   "Fee on enquiry" fallback, and trust-badge strip pattern should be referenced
 *   when building NF-HLT-SPE (dental, optician, vet) and NF-PHA (pharmacy) templates.
 *
 * Platform Invariants:
 *   T2 — TypeScript strict; no `any`
 *   T3 — no DB queries; all data via ctx.data; ctx.tenantId for contact form only
 *   T4 — prices as integer kobo; fmtKobo(); null → "Fee on enquiry"
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
    message ?? 'Hello, I would like to book an appointment at your clinic.',
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
/* Primary Care Clinic — VN-HLT-001 standalone template */

/* Hero */
.cl-hero {
  text-align: center;
  padding: 2.75rem 0 2rem;
}
.cl-hero-logo {
  height: 84px;
  width: 84px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1.25rem;
  border: 2px solid var(--ww-border);
}
.cl-hero h1 {
  font-size: clamp(1.875rem, 4.5vw, 2.75rem);
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: .625rem;
  color: var(--ww-text);
  letter-spacing: -.02em;
}
.cl-tagline {
  font-size: 1rem;
  color: var(--ww-text-muted);
  max-width: 40rem;
  margin-inline: auto;
  margin-bottom: 1.75rem;
  line-height: 1.6;
}
.cl-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  justify-content: center;
}

/* Trust badge strip */
.cl-trust-strip {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem .875rem;
  justify-content: center;
  margin: 1.5rem 0 0;
}
.cl-trust-badge {
  display: inline-flex;
  align-items: center;
  gap: .375rem;
  padding: .3rem .875rem;
  border-radius: 999px;
  font-size: .78rem;
  font-weight: 700;
  background: var(--ww-bg-surface);
  border: 1.5px solid var(--ww-primary);
  color: var(--ww-primary);
  letter-spacing: .02em;
  white-space: nowrap;
}
.cl-trust-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ww-primary);
  flex-shrink: 0;
}
.cl-walkin-note {
  margin-top: .875rem;
  font-size: .875rem;
  color: var(--ww-text-muted);
  text-align: center;
}

/* WhatsApp + phone CTAs */
.cl-wa-btn {
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
.cl-wa-btn:hover { filter: brightness(1.08); text-decoration: none; }
.cl-phone-btn {
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
.cl-phone-btn:hover { background: var(--ww-primary); color: #fff; text-decoration: none; }

/* Category badge */
.cl-category-badge {
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
  letter-spacing: .03em;
}

/* Section */
.cl-section { margin-top: 2.75rem; }
.cl-section-title { font-size: 1.375rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--ww-primary); }
.cl-section-sub { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: 1.5rem; }

/* Service cards */
.cl-services-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.cl-service-card {
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
.cl-service-card:hover { border-color: var(--ww-primary); }
.cl-service-name { font-size: 1rem; font-weight: 700; color: var(--ww-text); margin: 0; }
.cl-service-desc { font-size: .875rem; color: var(--ww-text-muted); line-height: 1.55; flex: 1; margin: 0; }
.cl-service-fee { font-size: .9375rem; font-weight: 700; color: var(--ww-primary); margin: .375rem 0 0; }
.cl-service-enquiry { font-size: .8125rem; color: var(--ww-text-muted); font-style: italic; margin: .375rem 0 0; }
.cl-see-all { display: inline-block; margin-top: 1.25rem; font-size: .9375rem; font-weight: 600; color: var(--ww-primary); text-decoration: underline; }
.cl-see-all:hover { opacity: .8; }

/* About strip on home */
.cl-about-strip {
  margin-top: 2.5rem;
  padding: 1.75rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
}
.cl-about-strip h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: .75rem; }
.cl-about-strip p { color: var(--ww-text-muted); line-height: 1.75; margin-bottom: 1rem; font-size: .9375rem; }

/* Contact strip */
.cl-contact-strip {
  margin-top: 2.5rem;
  padding: 1.5rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 2rem;
}
.cl-strip-item { display: flex; flex-direction: column; gap: .25rem; }
.cl-strip-label { font-size: .75rem; font-weight: 600; color: var(--ww-text-muted); text-transform: uppercase; letter-spacing: .04em; }
.cl-strip-value { font-size: .9375rem; font-weight: 600; color: var(--ww-text); }
.cl-strip-value a { color: var(--ww-primary); }

/* About page */
.cl-about-hero { text-align: center; padding: 2.5rem 0 2rem; }
.cl-about-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 900; margin-bottom: .5rem; letter-spacing: -.01em; }
.cl-about-body { max-width: 44rem; margin: 0 auto; }
.cl-about-desc { color: var(--ww-text-muted); line-height: 1.9; margin-bottom: 2rem; font-size: 1rem; }
.cl-detail-list { display: flex; flex-direction: column; gap: .875rem; margin-bottom: 2rem; }
.cl-detail-row { display: flex; gap: 1rem; align-items: flex-start; }
.cl-detail-label { font-size: .875rem; font-weight: 700; min-width: 7rem; color: var(--ww-text); flex-shrink: 0; }
.cl-detail-value { font-size: .9375rem; color: var(--ww-text-muted); }
.cl-detail-value a { color: var(--ww-primary); font-weight: 600; }

/* Services page */
.cl-services-hero { text-align: center; padding: 2.5rem 0 2rem; }
.cl-services-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 900; margin-bottom: .5rem; letter-spacing: -.01em; }
.cl-empty-state { text-align: center; color: var(--ww-text-muted); padding: 3rem 1rem; font-size: 1rem; line-height: 1.8; }
.cl-bottom-cta-strip {
  margin-top: 2.5rem;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border-radius: var(--ww-radius);
  border: 1px solid var(--ww-border);
  text-align: center;
}
.cl-bottom-cta-strip h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: .5rem; }
.cl-bottom-cta-strip p { color: var(--ww-text-muted); margin-bottom: 1.25rem; font-size: .9375rem; }
.cl-btn-row { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; }

/* Contact page */
.cl-contact-hero { text-align: center; padding: 2.5rem 0 2rem; }
.cl-contact-hero h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 900; margin-bottom: .5rem; letter-spacing: -.01em; }
.cl-contact-hero p { color: var(--ww-text-muted); max-width: 34rem; margin-inline: auto; }
.cl-wa-block {
  margin: 1.75rem auto;
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border: 2px solid #25D366;
  border-radius: var(--ww-radius);
  max-width: 32rem;
}
.cl-wa-block p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: 1rem; }
.cl-walkin-block {
  margin: 1rem auto;
  text-align: center;
  padding: 1rem 1.5rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  max-width: 32rem;
  font-size: .9375rem;
  color: var(--ww-text-muted);
}
.cl-contact-layout { display: grid; gap: 2rem; margin-top: 1.5rem; }
@media (min-width: 640px) { .cl-contact-layout { grid-template-columns: 1fr 1fr; } }
.cl-contact-info h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.cl-contact-info p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: .625rem; line-height: 1.6; }
.cl-contact-info a { color: var(--ww-primary); font-weight: 600; }
.cl-form-wrapper h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.cl-form { display: flex; flex-direction: column; gap: .875rem; }
.cl-form-group { display: flex; flex-direction: column; gap: .375rem; }
.cl-form-group label { font-size: .875rem; font-weight: 600; color: var(--ww-text); }
.cl-input {
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
.cl-input:focus { outline: 2px solid var(--ww-primary); outline-offset: 1px; border-color: transparent; }
.cl-textarea { min-height: 110px; resize: vertical; }
.cl-submit-btn {
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
.cl-submit-btn:hover { filter: brightness(1.1); }
.cl-form-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  text-align: center;
  color: #166534;
}
.cl-form-success h3 { font-weight: 700; margin-bottom: .25rem; }

@media (max-width: 375px) {
  .cl-hero-ctas { flex-direction: column; align-items: stretch; }
  .cl-wa-btn, .cl-phone-btn { width: 100%; justify-content: center; }
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

function checkSvg(): string {
  return `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;

  const featured = offerings.slice(0, 6);
  const hasMore = offerings.length > 6;

  const bioExcerpt = description
    ? description.length > 200 ? description.slice(0, 200).trimEnd() + '…' : description
    : null;

  const waHref = whatsappLink(
    phone,
    `Hello ${esc(ctx.displayName)}, I would like to book an appointment. Please advise on availability.`,
  );

  const servicesSection =
    featured.length === 0
      ? ''
      : `
  <section class="cl-section">
    <h2 class="cl-section-title">Our Services</h2>
    <div class="cl-services-grid">
      ${featured
        .map(
          (o) => `
      <div class="cl-service-card">
        <h3 class="cl-service-name">${esc(o.name)}</h3>
        ${o.description ? `<p class="cl-service-desc">${esc(o.description)}</p>` : ''}
        ${
          o.priceKobo !== null
            ? `<p class="cl-service-fee">Consultation: ${fmtKobo(o.priceKobo)}</p>`
            : `<p class="cl-service-enquiry">Fee on enquiry</p>`
        }
      </div>`,
        )
        .join('')}
    </div>
    ${hasMore ? `<a href="/services" class="cl-see-all">View all our services →</a>` : ''}
  </section>`;

  const aboutStrip = bioExcerpt
    ? `
  <div class="cl-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bioExcerpt)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more about us →</a>
  </div>`
    : '';

  const contactStrip = (phone || placeName)
    ? `
  <div class="cl-contact-strip">
    ${phone
      ? `<div class="cl-strip-item">
          <span class="cl-strip-label">Phone</span>
          <span class="cl-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${placeName
      ? `<div class="cl-strip-item">
          <span class="cl-strip-label">Address</span>
          <span class="cl-strip-value">${esc(placeName)}</span>
        </div>`
      : ''}
    <div class="cl-strip-item">
      <span class="cl-strip-label">Appointment</span>
      <span class="cl-strip-value">
        ${waHref
          ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer">Book on WhatsApp →</a>`
          : `<a href="/contact">Contact us →</a>`}
      </span>
    </div>
  </div>`
    : '';

  return `
${TEMPLATE_CSS}

<section class="cl-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="cl-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline
    ? `<p class="cl-tagline">${esc(tagline)}</p>`
    : `<p class="cl-tagline">Your trusted primary care clinic. Accepting new patients — walk-ins welcome.</p>`}
  <div class="cl-hero-ctas">
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cl-wa-btn"
            aria-label="Book an appointment at ${esc(ctx.displayName)} on WhatsApp">
           ${waSvg()} Book on WhatsApp
         </a>`
      : `<a class="cl-wa-btn" href="/contact">${waSvg()} Book an Appointment</a>`}
    ${phone
      ? `<a href="tel:${esc(phone)}" class="cl-phone-btn" aria-label="Call ${esc(ctx.displayName)}">
           ${phoneSvg()} Call Now
         </a>`
      : `<a class="cl-phone-btn" href="/contact">View Contact</a>`}
  </div>
  <div class="cl-trust-strip">
    <span class="cl-trust-badge"><span class="cl-trust-dot"></span>HMO Accepted</span>
    <span class="cl-trust-badge"><span class="cl-trust-dot"></span>NHIS Accredited</span>
    <span class="cl-trust-badge"><span class="cl-trust-dot"></span>MDCN Licensed</span>
  </div>
  <p class="cl-walkin-note">Walk-ins welcome during clinic hours</p>
</section>

${servicesSection}
${aboutStrip}
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
    `Hello ${esc(ctx.displayName)}, I would like to book an appointment. Please advise on availability.`,
  );

  return `
${TEMPLATE_CSS}

<section class="cl-about-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="cl-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category ? `<span class="cl-category-badge">${checkSvg()} ${esc(category)}</span>` : ''}
</section>

<div class="cl-about-body">
  <p class="cl-about-desc">
    ${description
      ? esc(description)
      : `${esc(ctx.displayName)} is a registered Nigerian healthcare facility providing quality primary care services to patients across the community. Our team of qualified, MDCN-licensed practitioners is committed to your health and wellbeing.`}
  </p>

  <div class="cl-detail-list">
    ${category
      ? `<div class="cl-detail-row">
          <span class="cl-detail-label">Clinic Type</span>
          <span class="cl-detail-value">${esc(category)}</span>
        </div>`
      : ''}
    ${placeName
      ? `<div class="cl-detail-row">
          <span class="cl-detail-label">Address</span>
          <span class="cl-detail-value">${esc(placeName)}</span>
        </div>`
      : ''}
    ${phone
      ? `<div class="cl-detail-row">
          <span class="cl-detail-label">Phone</span>
          <span class="cl-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${website
      ? `<div class="cl-detail-row">
          <span class="cl-detail-label">Online Portal</span>
          <span class="cl-detail-value">
            <a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">
              ${esc(website)} ↗
            </a>
          </span>
        </div>`
      : ''}
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cl-wa-btn">
           ${waSvg()} Book on WhatsApp
         </a>`
      : `<a class="cl-wa-btn" href="/contact">${waSvg()} Book an Appointment</a>`}
    ${phone
      ? `<a href="tel:${esc(phone)}" class="cl-phone-btn">${phoneSvg()} Call Now</a>`
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
    `Hello ${esc(ctx.displayName)}, I would like to book an appointment. Please advise on availability.`,
  );

  const grid =
    offerings.length === 0
      ? `<div class="cl-empty-state">
          <p>Our full list of services and consultation fees is being updated.<br/>
          Please contact the clinic directly for more information.</p>
          <br/>
          ${waHref
            ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cl-wa-btn">
                 ${waSvg()} Book on WhatsApp
               </a>`
            : `<a class="cl-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
        </div>`
      : `<div class="cl-services-grid">
          ${offerings
            .map(
              (o) => `
          <div class="cl-service-card">
            <h3 class="cl-service-name">${esc(o.name)}</h3>
            ${o.description ? `<p class="cl-service-desc">${esc(o.description)}</p>` : ''}
            ${
              o.priceKobo !== null
                ? `<p class="cl-service-fee">Consultation: ${fmtKobo(o.priceKobo)}</p>`
                : `<p class="cl-service-enquiry">Fee on enquiry</p>`
            }
          </div>`,
            )
            .join('')}
        </div>`;

  return `
${TEMPLATE_CSS}

<section class="cl-services-hero">
  <h1>Our Services</h1>
  <p class="cl-section-sub">Medical services provided at ${esc(ctx.displayName)}</p>
</section>

<section>${grid}</section>

<div class="cl-bottom-cta-strip">
  <h3>Ready to see a doctor?</h3>
  <p>Book an appointment on WhatsApp or call us directly. Walk-ins are also welcome during clinic hours.</p>
  <div class="cl-btn-row">
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cl-wa-btn">
           ${waSvg()} Book on WhatsApp
         </a>`
      : `<a class="cl-wa-btn" href="/contact">${waSvg()} Book an Appointment</a>`}
    ${phone
      ? `<a href="tel:${esc(phone)}" class="cl-phone-btn">${phoneSvg()} Call Now</a>`
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
    `Hello ${esc(ctx.displayName)}, I would like to book an appointment. Please advise on availability and the services you offer.`,
  );

  return `
${TEMPLATE_CSS}

<section class="cl-contact-hero">
  <h1>Book an Appointment</h1>
  <p>Reach out to book an appointment or ask about our services. Walk-ins are also welcome during clinic hours.</p>
</section>

${waHref
  ? `<div class="cl-wa-block">
      <p>Book your appointment quickly on WhatsApp. Our team will confirm your slot promptly.</p>
      <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cl-wa-btn"
         style="display:inline-flex;justify-content:center"
         aria-label="Book appointment at ${esc(ctx.displayName)} on WhatsApp">
        ${waSvg()} Book on WhatsApp
      </a>
    </div>`
  : ''}

<div class="cl-walkin-block">
  <strong>Walk-ins welcome</strong> — no appointment needed. Please arrive during clinic hours.
</div>

<div class="cl-contact-layout">
  <div class="cl-contact-info">
    <h2>Clinic Details</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? `<p>Contact details coming soon.</p>` : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">
      HMO patients: please bring your HMO card and valid ID to your appointment.
    </p>
  </div>

  <div class="cl-form-wrapper">
    <h2>Send an Enquiry</h2>
    <form class="cl-form" method="POST" action="/contact" id="clContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="cl-form-group">
        <label for="cl-name">Your full name</label>
        <input id="cl-name" name="name" type="text" required autocomplete="name"
               class="cl-input" placeholder="e.g. Ngozi Adeyemi" />
      </div>
      <div class="cl-form-group">
        <label for="cl-phone">Phone number</label>
        <input id="cl-phone" name="phone" type="tel" autocomplete="tel"
               class="cl-input" placeholder="0803 000 0000" />
      </div>
      <div class="cl-form-group">
        <label for="cl-email">Email address (optional)</label>
        <input id="cl-email" name="email" type="email" autocomplete="email"
               class="cl-input" placeholder="you@example.com" />
      </div>
      <div class="cl-form-group">
        <label for="cl-message">Nature of your visit</label>
        <textarea id="cl-message" name="message" required rows="4"
                  class="cl-input cl-textarea"
                  placeholder="e.g. General consultation, antenatal registration, malaria test, HMO enquiry, or any other reason for your visit."></textarea>
      </div>
      <button type="submit" class="cl-submit-btn">Send Enquiry</button>
    </form>
    <div id="clContactSuccess" class="cl-form-success" style="display:none" role="status" aria-live="polite">
      <h3>Enquiry received!</h3>
      <p>Thank you — our team will get back to you promptly to confirm your appointment details.</p>
    </div>
  </div>
</div>

<script>
(function () {
  var form = document.getElementById('clContactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch('/contact', { method: 'POST', body: data })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function () {
        form.style.display = 'none';
        var success = document.getElementById('clContactSuccess');
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

export const clinicPrimaryCareTemplate: WebsiteTemplateContract = {
  slug: 'clinic-primary-care',
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
