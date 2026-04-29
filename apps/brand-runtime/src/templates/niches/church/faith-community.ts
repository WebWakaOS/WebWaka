/**
 * Church / Faith Community template — NF-CIV-REL family ANCHOR (VN-CIV-001)
 * Pillar 2 — P2-church-faith-community
 * Milestone: M8d — P1-Original (CRITICAL priority)
 *
 * Nigeria-First design decisions:
 *   • Community-first layout: "You are welcome" warmth; "We" language throughout
 *   • Service times as a prominent visual block — #1 use case for church sites
 *   • Offerings array = ministries/programmes (not products); free → "Free to attend"
 *   • "Giving" not "Donations" — Nigerian Pentecostal-dominant vocabulary
 *   • "Plan a Visit" primary CTA; "Give Online" secondary; WhatsApp "Welcome Team"
 *   • Denomination badge from category field (Pentecostal, Anglican, Catholic, etc.)
 *   • IT Incorporated Trustees trust context via tagline
 *   • No floating WhatsApp button — organisational context
 *   • NGN (₦) only for paid events/conferences (rare); null → "Free to attend"
 *
 * Africa-First: Nigerian Pentecostal model is Africa's most exported — RCCG, Winners,
 *   MFM have pan-African presence. Template scales to Ghana (PIWC), Kenya (CITAM),
 *   South Africa (Rhema), and all Anglophone African church contexts.
 *
 * Family anchor: NF-CIV-REL — variants: mosque (adapt Jumu'ah/Imam/Salat/Zakat),
 *   ministry-mission (emphasise outreach, mission field, prayer network).
 *   All variants must inherit: .ch- namespace, service-times block pattern,
 *   offerings-as-programmes semantics, "Plan a Visit" CTA pattern, no float button.
 *
 * Platform Invariants:
 *   T2 — TypeScript strict; no `any`
 *   T3 — no DB queries; all data via ctx.data; ctx.tenantId for contact form only
 *   T4 — prices as integer kobo; fmtKobo(); null → "Free to attend"
 *   P7 — CSS custom properties only (var(--ww-*)); #25D366 WhatsApp exception
 *   P9 — NGN-first; only applies to paid conference/event offerings
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
    message ?? 'Hello, I would like to plan a visit to your church.',
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
/* Church / Faith Community — NF-CIV-REL anchor template */

/* Hero */
.ch-hero {
  text-align: center;
  padding: 2.75rem 0 2.25rem;
}
.ch-hero-logo {
  height: 88px;
  width: 88px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1.25rem;
  border: 3px solid var(--ww-primary);
}
.ch-denomination-badge {
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
.ch-hero h1 {
  font-size: clamp(1.875rem, 4.5vw, 2.875rem);
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: .625rem;
  color: var(--ww-text);
  letter-spacing: -.02em;
}
.ch-tagline {
  font-size: 1.0625rem;
  color: var(--ww-text-muted);
  max-width: 38rem;
  margin-inline: auto;
  margin-bottom: 2rem;
  line-height: 1.65;
}
.ch-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  justify-content: center;
}

/* Plan a Visit — primary CTA */
.ch-visit-btn {
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
.ch-visit-btn:hover { filter: brightness(1.1); text-decoration: none; }

/* Give Online — secondary CTA */
.ch-give-btn {
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
.ch-give-btn:hover { background: var(--ww-primary); color: #fff; text-decoration: none; }

/* WhatsApp button */
.ch-wa-btn {
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
.ch-wa-btn:hover { filter: brightness(1.08); text-decoration: none; }

/* Service times block */
.ch-times-block {
  margin-top: 2.75rem;
  padding: 1.75rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  border-top: 4px solid var(--ww-primary);
}
.ch-times-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--ww-primary);
  text-align: center;
}
.ch-times-grid {
  display: grid;
  gap: .875rem;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.ch-time-item {
  display: flex;
  flex-direction: column;
  gap: .25rem;
  padding: .875rem 1rem;
  background: var(--ww-bg);
  border-radius: calc(var(--ww-radius) - 2px);
  border: 1px solid var(--ww-border);
}
.ch-time-name { font-size: .9375rem; font-weight: 700; color: var(--ww-text); }
.ch-time-desc { font-size: .8125rem; color: var(--ww-text-muted); line-height: 1.5; }
.ch-time-free {
  display: inline-block;
  font-size: .75rem;
  font-weight: 600;
  color: var(--ww-primary);
  margin-top: .25rem;
}
.ch-time-price {
  font-size: .875rem;
  font-weight: 700;
  color: var(--ww-primary);
  margin-top: .25rem;
}

/* Section */
.ch-section { margin-top: 2.75rem; }
.ch-section-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--ww-primary);
}

/* Ministry / programme cards */
.ch-ministry-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}
.ch-ministry-card {
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  padding: 1.375rem;
  background: var(--ww-bg-surface);
  display: flex;
  flex-direction: column;
  gap: .375rem;
  transition: border-color .15s;
}
.ch-ministry-card:hover { border-color: var(--ww-primary); }
.ch-ministry-name { font-size: 1rem; font-weight: 700; color: var(--ww-text); margin: 0; }
.ch-ministry-desc { font-size: .875rem; color: var(--ww-text-muted); line-height: 1.55; flex: 1; margin: 0; }
.ch-ministry-free {
  font-size: .8125rem;
  font-weight: 600;
  color: var(--ww-primary);
  margin-top: .25rem;
}
.ch-ministry-fee {
  font-size: .9375rem;
  font-weight: 700;
  color: var(--ww-primary);
  margin-top: .25rem;
}
.ch-see-all {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: .9375rem;
  font-weight: 600;
  color: var(--ww-primary);
  text-decoration: underline;
}
.ch-see-all:hover { opacity: .8; }

/* About excerpt on home */
.ch-about-strip {
  margin-top: 2.5rem;
  padding: 1.75rem;
  background: var(--ww-bg-surface);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
}
.ch-about-strip h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: .75rem; }
.ch-about-strip p { color: var(--ww-text-muted); line-height: 1.75; margin-bottom: 1rem; font-size: .9375rem; }

/* Contact strip */
.ch-contact-strip {
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
.ch-strip-item { display: flex; flex-direction: column; gap: .25rem; }
.ch-strip-label {
  font-size: .75rem;
  font-weight: 600;
  color: var(--ww-text-muted);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.ch-strip-value { font-size: .9375rem; font-weight: 600; color: var(--ww-text); }
.ch-strip-value a { color: var(--ww-primary); }

/* About page */
.ch-about-hero { text-align: center; padding: 2.5rem 0 2rem; }
.ch-about-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.ch-about-body { max-width: 44rem; margin: 0 auto; }
.ch-about-desc {
  color: var(--ww-text-muted);
  line-height: 1.9;
  margin-bottom: 2rem;
  font-size: 1rem;
}
.ch-detail-list { display: flex; flex-direction: column; gap: .875rem; margin-bottom: 2rem; }
.ch-detail-row { display: flex; gap: 1rem; align-items: flex-start; }
.ch-detail-label { font-size: .875rem; font-weight: 700; min-width: 7rem; color: var(--ww-text); flex-shrink: 0; }
.ch-detail-value { font-size: .9375rem; color: var(--ww-text-muted); }
.ch-detail-value a { color: var(--ww-primary); font-weight: 600; }

/* Services page */
.ch-services-hero { text-align: center; padding: 2.5rem 0 2rem; }
.ch-services-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.ch-services-sub { color: var(--ww-text-muted); margin-bottom: 1.5rem; }
.ch-empty-state {
  text-align: center;
  color: var(--ww-text-muted);
  padding: 3rem 1rem;
  font-size: 1rem;
  line-height: 1.8;
}
.ch-bottom-cta-strip {
  margin-top: 2.5rem;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border-radius: var(--ww-radius);
  border: 1px solid var(--ww-border);
  text-align: center;
}
.ch-bottom-cta-strip h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: .5rem; }
.ch-bottom-cta-strip p { color: var(--ww-text-muted); margin-bottom: 1.25rem; font-size: .9375rem; }
.ch-btn-row { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; }

/* Contact page */
.ch-contact-hero { text-align: center; padding: 2.5rem 0 2rem; }
.ch-contact-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.ch-contact-hero p { color: var(--ww-text-muted); max-width: 34rem; margin-inline: auto; }
.ch-wa-block {
  margin: 1.75rem auto;
  text-align: center;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border: 2px solid #25D366;
  border-radius: var(--ww-radius);
  max-width: 32rem;
}
.ch-wa-block p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: 1rem; }
.ch-contact-layout {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}
@media (min-width: 640px) { .ch-contact-layout { grid-template-columns: 1fr 1fr; } }
.ch-contact-info h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.ch-contact-info p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: .625rem; line-height: 1.6; }
.ch-contact-info a { color: var(--ww-primary); font-weight: 600; }
.ch-form-wrapper h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.ch-form { display: flex; flex-direction: column; gap: .875rem; }
.ch-form-group { display: flex; flex-direction: column; gap: .375rem; }
.ch-form-group label { font-size: .875rem; font-weight: 600; color: var(--ww-text); }
.ch-input {
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
.ch-input:focus { outline: 2px solid var(--ww-primary); outline-offset: 1px; border-color: transparent; }
.ch-textarea { min-height: 110px; resize: vertical; }
.ch-submit-btn {
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
.ch-submit-btn:hover { filter: brightness(1.1); }
.ch-form-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  text-align: center;
  color: #166534;
}
.ch-form-success h3 { font-weight: 700; margin-bottom: .25rem; }

@media (max-width: 375px) {
  .ch-hero-ctas { flex-direction: column; align-items: stretch; }
  .ch-visit-btn, .ch-give-btn, .ch-wa-btn { width: 100%; justify-content: center; }
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

function crossSvg(): string {
  return `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M11 2h2v8h8v2h-8v8h-2v-8H3v-2h8z"/>
  </svg>`;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;

  const featured = offerings.slice(0, 4);
  const hasMore = offerings.length > 4;

  const bioExcerpt = description
    ? description.length > 200 ? description.slice(0, 200).trimEnd() + '…' : description
    : null;

  const waHref = whatsappLink(
    phone,
    `Hello! I would like to plan a visit to ${esc(ctx.displayName)}. Please let me know the service times.`,
  );

  const timesBlock =
    featured.length === 0
      ? ''
      : `
  <div class="ch-times-block">
    <h2 class="ch-times-title">Join Us</h2>
    <div class="ch-times-grid">
      ${featured
        .map(
          (o) => `
      <div class="ch-time-item">
        <span class="ch-time-name">${esc(o.name)}</span>
        ${o.description ? `<span class="ch-time-desc">${esc(o.description)}</span>` : ''}
        ${
          o.priceKobo === null
            ? `<span class="ch-time-free">Free to attend</span>`
            : `<span class="ch-time-price">Registration: ${fmtKobo(o.priceKobo)}</span>`
        }
      </div>`,
        )
        .join('')}
    </div>
    ${hasMore ? `<p style="margin-top:1rem;text-align:center"><a href="/services" class="ch-see-all">View all ministries &amp; programmes →</a></p>` : ''}
  </div>`;

  const aboutStrip = bioExcerpt
    ? `
  <div class="ch-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bioExcerpt)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more about us →</a>
  </div>`
    : '';

  const contactStrip = (phone || placeName)
    ? `
  <div class="ch-contact-strip">
    ${phone
      ? `<div class="ch-strip-item">
          <span class="ch-strip-label">Phone</span>
          <span class="ch-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${placeName
      ? `<div class="ch-strip-item">
          <span class="ch-strip-label">Location</span>
          <span class="ch-strip-value">${esc(placeName)}</span>
        </div>`
      : ''}
    ${waHref
      ? `<div class="ch-strip-item">
          <span class="ch-strip-label">WhatsApp</span>
          <span class="ch-strip-value">
            <a href="${waHref}" target="_blank" rel="noopener noreferrer">Welcome Team →</a>
          </span>
        </div>`
      : ''}
  </div>`
    : '';

  return `
${TEMPLATE_CSS}

<section class="ch-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ch-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline
    ? `<p class="ch-tagline">${esc(tagline)}</p>`
    : `<p class="ch-tagline">You are welcome. All are welcome.</p>`}
  <div class="ch-hero-ctas">
    <a class="ch-visit-btn" href="/contact">Plan a Visit</a>
    <a class="ch-give-btn" href="/contact">Give Online</a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ch-wa-btn"
            aria-label="WhatsApp ${esc(ctx.displayName)} welcome team">
           ${waSvg()} WhatsApp Us
         </a>`
      : ''}
  </div>
</section>

${timesBlock}
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
    `Hello! I would like to plan a visit to ${esc(ctx.displayName)}. Please let me know more.`,
  );

  return `
${TEMPLATE_CSS}

<section class="ch-about-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="ch-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category ? `<span class="ch-denomination-badge">${crossSvg()} ${esc(category)}</span>` : ''}
</section>

<div class="ch-about-body">
  <p class="ch-about-desc">
    ${description
      ? esc(description)
      : `${esc(ctx.displayName)} is a vibrant Nigerian Christian community committed to worship, prayer, and service. We welcome everyone — regardless of background — into a family of faith, fellowship, and growth.`}
  </p>

  <div class="ch-detail-list">
    ${category
      ? `<div class="ch-detail-row">
          <span class="ch-detail-label">Denomination</span>
          <span class="ch-detail-value">${esc(category)}</span>
        </div>`
      : ''}
    ${placeName
      ? `<div class="ch-detail-row">
          <span class="ch-detail-label">Location</span>
          <span class="ch-detail-value">${esc(placeName)}</span>
        </div>`
      : ''}
    ${phone
      ? `<div class="ch-detail-row">
          <span class="ch-detail-label">Phone</span>
          <span class="ch-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${website
      ? `<div class="ch-detail-row">
          <span class="ch-detail-label">Online</span>
          <span class="ch-detail-value">
            <a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">
              ${esc(website)} ↗
            </a>
          </span>
        </div>`
      : ''}
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    <a class="ch-visit-btn" href="/contact">Plan a Visit</a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ch-wa-btn">
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
    `Hello! I would like to learn more about the ministries at ${esc(ctx.displayName)}.`,
  );

  const grid =
    offerings.length === 0
      ? `<div class="ch-empty-state">
          <p>Ministry and programme details are coming soon.<br/>Please contact us directly to find out more.</p>
          <br/>
          <a class="ch-visit-btn" href="/contact">Plan a Visit</a>
        </div>`
      : `<div class="ch-ministry-grid">
          ${offerings
            .map(
              (o) => `
          <div class="ch-ministry-card">
            <h3 class="ch-ministry-name">${esc(o.name)}</h3>
            ${o.description ? `<p class="ch-ministry-desc">${esc(o.description)}</p>` : ''}
            ${
              o.priceKobo === null
                ? `<span class="ch-ministry-free">Free to attend</span>`
                : `<span class="ch-ministry-fee">Registration: ${fmtKobo(o.priceKobo)}</span>`
            }
          </div>`,
            )
            .join('')}
        </div>`;

  return `
${TEMPLATE_CSS}

<section class="ch-services-hero">
  <h1>Our Ministries &amp; Programmes</h1>
  <p class="ch-services-sub">What we offer at ${esc(ctx.displayName)}</p>
</section>

<section>${grid}</section>

<div class="ch-bottom-cta-strip">
  <h3>Ready to join us?</h3>
  <p>You are welcome at ${esc(ctx.displayName)}. Come as you are — all are welcome.</p>
  <div class="ch-btn-row">
    <a class="ch-visit-btn" href="/contact">Plan a Visit</a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ch-wa-btn">
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
    `Hello! I would like to plan a visit to ${esc(ctx.displayName)}. Please let me know the service times and how to find you.`,
  );

  return `
${TEMPLATE_CSS}

<section class="ch-contact-hero">
  <h1>Plan a Visit</h1>
  <p>We would love to have you join us. You are welcome at ${esc(ctx.displayName)} — all are welcome.</p>
</section>

${waHref
  ? `<div class="ch-wa-block">
      <p>The quickest way to reach us is via WhatsApp. Our welcome team will be happy to answer your questions and help you plan your visit.</p>
      <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ch-wa-btn"
         aria-label="WhatsApp ${esc(ctx.displayName)} welcome team" style="display:inline-flex;justify-content:center">
        ${waSvg()} WhatsApp the Welcome Team
      </a>
    </div>`
  : ''}

<div class="ch-contact-layout">
  <div class="ch-contact-info">
    <h2>Find Us</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? `<p>Contact details will be listed here shortly.</p>` : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">
      All are welcome. No prior arrangement is needed to attend a service.
    </p>
    <p style="margin-top:.75rem">
      <a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">
        View our ministries &amp; service times →
      </a>
    </p>
  </div>

  <div class="ch-form-wrapper">
    <h2>Send a Message</h2>
    <form class="ch-form" method="POST" action="/contact" id="chContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ch-form-group">
        <label for="ch-name">Your name</label>
        <input id="ch-name" name="name" type="text" required autocomplete="name"
               class="ch-input" placeholder="e.g. Funmi Adeyemi" />
      </div>
      <div class="ch-form-group">
        <label for="ch-phone">Phone number</label>
        <input id="ch-phone" name="phone" type="tel" autocomplete="tel"
               class="ch-input" placeholder="0803 000 0000" />
      </div>
      <div class="ch-form-group">
        <label for="ch-email">Email address (optional)</label>
        <input id="ch-email" name="email" type="email" autocomplete="email"
               class="ch-input" placeholder="you@example.com" />
      </div>
      <div class="ch-form-group">
        <label for="ch-message">How can we help you?</label>
        <textarea id="ch-message" name="message" required rows="4"
                  class="ch-input ch-textarea"
                  placeholder="e.g. I'd like to plan my first visit, find out about Sunday service times, or learn about your children's ministry."></textarea>
      </div>
      <button type="submit" class="ch-submit-btn">Send Message</button>
    </form>
    <div id="chContactSuccess" class="ch-form-success" style="display:none" role="status" aria-live="polite">
      <h3>Message received!</h3>
      <p>Thank you for reaching out. Our team will be in touch with you shortly. You are welcome!</p>
    </div>
  </div>
</div>

<script>
(function () {
  var form = document.getElementById('chContactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch('/contact', { method: 'POST', body: data })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function () {
        form.style.display = 'none';
        var success = document.getElementById('chContactSuccess');
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

export const churchFaithCommunityTemplate: WebsiteTemplateContract = {
  slug: 'church-faith-community',
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
