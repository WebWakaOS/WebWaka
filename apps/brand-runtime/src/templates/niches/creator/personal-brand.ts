/**
 * Creator / Influencer Personal Brand template — NF-CRE-DIG family ANCHOR (VN-CRE-001)
 * Pillar 2 — P2-creator-personal-brand
 * Milestone: M8e — P1-Original
 *
 * Nigeria-First design decisions:
 *   • Media kit + booking page + content hub — the creator's professional home base
 *   • Email-first contact (brand deals are email/form-first, not WhatsApp-first)
 *   • WhatsApp present but secondary — floating button omitted (polished brand image)
 *   • NGN (₦) pricing for collaboration packages; "Rate on request" fallback for null
 *   • Creator economy vocabulary: "Work With Me", "Let's Collaborate", "Brand Deal"
 *   • Polished, design-forward aesthetic — the site IS the portfolio
 *   • Nigerian creator context: Afrobeats, Nollywood, Lagos lifestyle, Nigerian brands
 *
 * Africa-First: Afrobeats/Nollywood creators have global audiences; template scales across
 *   African creator markets (Ghana, Kenya, SA) with minimal adaptation.
 *
 * Family anchor: NF-CRE-DIG — variants: photography, podcast-studio, motivational-speaker.
 *   All variants should inherit email-first contact, .cr- namespace, polished aesthetic,
 *   "Rate on request" fallback, and the same local utility pattern.
 *
 * Platform Invariants:
 *   T2 — TypeScript strict; no `any`
 *   T3 — no DB queries; all data via ctx.data; ctx.tenantId for contact form only
 *   T4 — prices as integer kobo; fmtKobo() for display; null → "Rate on request"
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
    message ?? "Hello! I'd like to discuss a collaboration opportunity.",
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
/* Creator / Influencer Personal Brand — NF-CRE-DIG anchor template */

/* Hero */
.cr-hero {
  text-align: center;
  padding: 3rem 0 2.5rem;
}
.cr-hero-logo {
  height: 96px;
  width: 96px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 1.25rem;
  border: 3px solid var(--ww-primary);
}
.cr-category-badge {
  display: inline-block;
  padding: .25rem .875rem;
  border-radius: 999px;
  font-size: .8125rem;
  font-weight: 700;
  background: var(--ww-primary);
  color: #fff;
  margin-bottom: 1rem;
  letter-spacing: .03em;
  text-transform: uppercase;
}
.cr-hero h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.15;
  margin-bottom: .75rem;
  color: var(--ww-text);
  letter-spacing: -.02em;
}
.cr-tagline {
  font-size: 1.125rem;
  color: var(--ww-text-muted);
  margin-bottom: 1rem;
  max-width: 36rem;
  margin-inline: auto;
  line-height: 1.6;
}
.cr-hero-bio {
  color: var(--ww-text-muted);
  max-width: 38rem;
  margin-inline: auto;
  margin-bottom: 2rem;
  line-height: 1.75;
  font-size: .9375rem;
}
.cr-hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem;
  justify-content: center;
  margin-top: 1.25rem;
}

/* "Work With Me" primary button */
.cr-collab-btn {
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
.cr-collab-btn:hover { filter: brightness(1.1); text-decoration: none; }

/* WhatsApp button (secondary) */
.cr-wa-btn {
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
.cr-wa-btn:hover { filter: brightness(1.08); text-decoration: none; }

/* Section titles */
.cr-section { margin-top: 2.75rem; }
.cr-section-title {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--ww-primary);
}
.cr-section-sub {
  font-size: .9375rem;
  color: var(--ww-text-muted);
  margin-bottom: 1.5rem;
}

/* Offering / collaboration cards */
.cr-offerings-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
.cr-offering-card {
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius);
  padding: 1.375rem;
  background: var(--ww-bg-surface);
  display: flex;
  flex-direction: column;
  gap: .375rem;
  transition: border-color .15s;
}
.cr-offering-card:hover { border-color: var(--ww-primary); }
.cr-offering-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ww-text);
  margin: 0;
}
.cr-offering-desc {
  font-size: .875rem;
  color: var(--ww-text-muted);
  line-height: 1.55;
  flex: 1;
  margin: 0;
}
.cr-offering-price {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ww-primary);
  margin: .375rem 0 0;
}
.cr-offering-ror {
  font-size: .8125rem;
  color: var(--ww-text-muted);
  font-style: italic;
  margin: .375rem 0 0;
}
.cr-see-all {
  display: inline-block;
  margin-top: 1.25rem;
  font-size: .9375rem;
  font-weight: 600;
  color: var(--ww-primary);
  text-decoration: underline;
}
.cr-see-all:hover { opacity: .8; }

/* Contact strip */
.cr-contact-strip {
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
.cr-strip-item { display: flex; flex-direction: column; gap: .25rem; }
.cr-strip-label {
  font-size: .75rem;
  font-weight: 600;
  color: var(--ww-text-muted);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.cr-strip-value { font-size: .9375rem; font-weight: 600; color: var(--ww-text); }
.cr-strip-value a { color: var(--ww-primary); }

/* About page */
.cr-about-hero { text-align: center; padding: 2.5rem 0 2rem; }
.cr-about-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .75rem;
  letter-spacing: -.01em;
}
.cr-about-body { max-width: 42rem; margin: 0 auto; }
.cr-about-desc {
  color: var(--ww-text-muted);
  line-height: 1.85;
  margin-bottom: 2rem;
  font-size: 1rem;
}
.cr-detail-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.cr-detail-row { display: flex; gap: 1rem; align-items: flex-start; }
.cr-detail-label { font-size: .875rem; font-weight: 700; min-width: 7rem; color: var(--ww-text); flex-shrink: 0; }
.cr-detail-value { font-size: .9375rem; color: var(--ww-text-muted); }
.cr-detail-value a { color: var(--ww-primary); font-weight: 600; }

/* Services / "What I Offer" page */
.cr-services-hero { text-align: center; padding: 2.5rem 0 2rem; }
.cr-services-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.cr-services-sub { color: var(--ww-text-muted); margin-bottom: 1.5rem; }
.cr-empty-state {
  text-align: center;
  color: var(--ww-text-muted);
  padding: 3rem 1rem;
  font-size: 1rem;
  line-height: 1.7;
}
.cr-empty-state a { color: var(--ww-primary); font-weight: 600; }
.cr-bottom-cta-strip {
  margin-top: 2.5rem;
  padding: 2rem 1.5rem;
  background: var(--ww-bg-surface);
  border-radius: var(--ww-radius);
  border: 1px solid var(--ww-border);
  text-align: center;
}
.cr-bottom-cta-strip h3 { font-size: 1.125rem; font-weight: 700; margin-bottom: .5rem; }
.cr-bottom-cta-strip p { color: var(--ww-text-muted); margin-bottom: 1.25rem; font-size: .9375rem; }
.cr-btn-row { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; }

/* Contact / "Work With Me" page */
.cr-contact-hero { text-align: center; padding: 2.5rem 0 2rem; }
.cr-contact-hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 900;
  margin-bottom: .5rem;
  letter-spacing: -.01em;
}
.cr-contact-hero p { color: var(--ww-text-muted); max-width: 32rem; margin-inline: auto; }
.cr-email-primary {
  margin: 1.5rem auto;
  text-align: center;
  padding: 1.75rem 1.5rem;
  background: var(--ww-bg-surface);
  border: 2px solid var(--ww-primary);
  border-radius: var(--ww-radius);
  max-width: 32rem;
}
.cr-email-primary p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: 1rem; }
.cr-contact-layout {
  display: grid;
  gap: 2rem;
  margin-top: 1.5rem;
}
@media (min-width: 640px) { .cr-contact-layout { grid-template-columns: 1fr 1fr; } }
.cr-contact-info h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.cr-contact-info p { font-size: .9375rem; color: var(--ww-text-muted); margin-bottom: .625rem; line-height: 1.6; }
.cr-contact-info a { color: var(--ww-primary); font-weight: 600; }
.cr-form-wrapper h2 { font-size: 1.125rem; font-weight: 700; margin-bottom: 1rem; }
.cr-form { display: flex; flex-direction: column; gap: .875rem; }
.cr-form-group { display: flex; flex-direction: column; gap: .375rem; }
.cr-form-group label { font-size: .875rem; font-weight: 600; color: var(--ww-text); }
.cr-input {
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
.cr-input:focus { outline: 2px solid var(--ww-primary); outline-offset: 1px; border-color: transparent; }
.cr-textarea { min-height: 130px; resize: vertical; }
.cr-submit-btn {
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
.cr-submit-btn:hover { filter: brightness(1.1); }
.cr-form-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: var(--ww-radius);
  padding: 1.25rem;
  text-align: center;
  color: #166534;
}
.cr-form-success h3 { font-weight: 700; margin-bottom: .25rem; }

@media (max-width: 375px) {
  .cr-hero-ctas { flex-direction: column; align-items: stretch; }
  .cr-collab-btn, .cr-wa-btn, .ww-btn { width: 100%; justify-content: center; }
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

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;

  const featured = offerings.slice(0, 6);

  // Short bio excerpt for hero (first ~200 chars)
  const bioExcerpt = description
    ? description.length > 200 ? description.slice(0, 200).trimEnd() + '…' : description
    : null;

  const offeringsSection =
    featured.length === 0
      ? ''
      : `
  <section class="cr-section">
    <h2 class="cr-section-title">What I Offer</h2>
    <div class="cr-offerings-grid">
      ${featured
        .map(
          (o) => `
      <div class="cr-offering-card">
        <h3 class="cr-offering-name">${esc(o.name)}</h3>
        ${o.description ? `<p class="cr-offering-desc">${esc(o.description)}</p>` : ''}
        ${
          o.priceKobo !== null
            ? `<p class="cr-offering-price">${fmtKobo(o.priceKobo)}</p>`
            : `<p class="cr-offering-ror">Rate on request — send a brief</p>`
        }
      </div>`,
        )
        .join('')}
    </div>
    <a href="/services" class="cr-see-all">View all collaboration types →</a>
  </section>`;

  const waHref = whatsappLink(phone, `Hello ${esc(ctx.displayName)}! I'd like to discuss a collaboration.`);

  const contactStrip = (phone || placeName || null)
    ? `
  <div class="cr-contact-strip">
    ${phone
      ? `<div class="cr-strip-item">
          <span class="cr-strip-label">Phone</span>
          <span class="cr-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${placeName
      ? `<div class="cr-strip-item">
          <span class="cr-strip-label">Based in</span>
          <span class="cr-strip-value">${esc(placeName)}</span>
        </div>`
      : ''}
    <div class="cr-strip-item">
      <span class="cr-strip-label">Collaborate</span>
      <span class="cr-strip-value"><a href="/contact">Send a brief →</a></span>
    </div>
  </div>`
    : '';

  return `
${TEMPLATE_CSS}

<section class="cr-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="cr-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline
    ? `<p class="cr-tagline">${esc(tagline)}</p>`
    : `<p class="cr-tagline">Content Creator &amp; Digital Influencer</p>`}
  ${bioExcerpt ? `<p class="cr-hero-bio">${esc(bioExcerpt)}</p>` : ''}
  <div class="cr-hero-ctas">
    <a class="cr-collab-btn" href="/contact">Let&apos;s Collaborate</a>
    <a class="ww-btn ww-btn-outline" href="/services">What I Offer</a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cr-wa-btn"
            aria-label="WhatsApp ${esc(ctx.displayName)}">
           ${waSvg()} WhatsApp
         </a>`
      : ''}
  </div>
</section>

${offeringsSection}
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
    `Hello ${esc(ctx.displayName)}! I'd like to discuss a collaboration opportunity.`,
  );

  return `
${TEMPLATE_CSS}

<section class="cr-about-hero">
  ${ctx.logoUrl ? `<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="cr-hero-logo" />` : ''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category ? `<span class="cr-category-badge">${esc(category)}</span>` : ''}
</section>

<div class="cr-about-body">
  <p class="cr-about-desc">
    ${description
      ? esc(description)
      : `${esc(ctx.displayName)} is a Nigerian content creator and digital influencer. With a growing audience across social media platforms, ${esc(ctx.displayName)} delivers authentic, engaging content that resonates with Nigerian audiences and beyond.`}
  </p>

  <div class="cr-detail-list">
    ${placeName
      ? `<div class="cr-detail-row">
          <span class="cr-detail-label">Based in</span>
          <span class="cr-detail-value">${esc(placeName)}</span>
        </div>`
      : ''}
    ${phone
      ? `<div class="cr-detail-row">
          <span class="cr-detail-label">Phone</span>
          <span class="cr-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span>
        </div>`
      : ''}
    ${website
      ? `<div class="cr-detail-row">
          <span class="cr-detail-label">Find Me Online</span>
          <span class="cr-detail-value">
            <a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">
              ${esc(website)} ↗
            </a>
          </span>
        </div>`
      : ''}
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    <a class="cr-collab-btn" href="/contact">Work With Me</a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cr-wa-btn"
            aria-label="WhatsApp ${esc(ctx.displayName)}">
           ${waSvg()} WhatsApp
         </a>`
      : ''}
  </div>
</div>
`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;

  const grid =
    offerings.length === 0
      ? `<div class="cr-empty-state">
          <p>Collaboration packages are being updated — check back soon.</p>
          ${email
            ? `<p>In the meantime, email me directly:<br/>
               <a href="mailto:${esc(email)}">${esc(email)}</a></p>`
            : ''}
          <br/>
          <a class="cr-collab-btn" href="/contact">Send a Brief</a>
        </div>`
      : `<div class="cr-offerings-grid">
          ${offerings
            .map(
              (o) => `
          <div class="cr-offering-card">
            <h3 class="cr-offering-name">${esc(o.name)}</h3>
            ${o.description ? `<p class="cr-offering-desc">${esc(o.description)}</p>` : ''}
            ${
              o.priceKobo !== null
                ? `<p class="cr-offering-price">${fmtKobo(o.priceKobo)}</p>`
                : `<p class="cr-offering-ror">Rate on request — send a brief</p>`
            }
          </div>`,
            )
            .join('')}
        </div>`;

  const waHref = whatsappLink(
    phone,
    `Hello ${esc(ctx.displayName)}! I've seen your collaboration packages and I'd like to discuss a deal.`,
  );

  return `
${TEMPLATE_CSS}

<section class="cr-services-hero">
  <h1>What I Offer</h1>
  <p class="cr-services-sub">Collaboration packages and brand deal options from ${esc(ctx.displayName)}</p>
</section>

<section>${grid}</section>

<div class="cr-bottom-cta-strip">
  <h3>Ready to work together?</h3>
  <p>Send me a brief with your campaign goals and I'll get back to you within 24 hours.</p>
  <div class="cr-btn-row">
    <a class="cr-collab-btn" href="/contact">Send a Brief</a>
    ${waHref
      ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cr-wa-btn">
           ${waSvg()} WhatsApp Me
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
    `Hello ${esc(ctx.displayName)}! I'd like to discuss a collaboration opportunity.`,
  );

  return `
${TEMPLATE_CSS}

<section class="cr-contact-hero">
  <h1>Work With Me</h1>
  <p>I'm open to brand partnerships, sponsored content, event appearances, and creative collaborations. Send me a brief and I'll respond within 24 hours.</p>
</section>

${email
  ? `<div class="cr-email-primary">
      <p>The best way to reach me for brand deals and collaborations is by email. I review all briefs personally.</p>
      <a class="cr-collab-btn" href="mailto:${esc(email)}" aria-label="Email ${esc(ctx.displayName)}">
        ✉ ${esc(email)}
      </a>
    </div>`
  : ''}

<div class="cr-contact-layout">
  <div class="cr-contact-info">
    <h2>My Details</h2>
    ${placeName ? `<p><strong>Based in:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? `<p>Contact details coming soon.</p>` : ''}
    ${waHref
      ? `<p style="margin-top:1.25rem">
          <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cr-wa-btn">
            ${waSvg()} WhatsApp Me
          </a>
        </p>`
      : ''}
  </div>

  <div class="cr-form-wrapper">
    <h2>Send a Brief</h2>
    <form class="cr-form" method="POST" action="/contact" id="crContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="cr-form-group">
        <label for="cr-name">Your name / brand</label>
        <input id="cr-name" name="name" type="text" required autocomplete="name"
               class="cr-input" placeholder="e.g. Adaeze Okafor / Peak Milk Brand" />
      </div>
      <div class="cr-form-group">
        <label for="cr-email">Email address</label>
        <input id="cr-email" name="email" type="email" required autocomplete="email"
               class="cr-input" placeholder="you@brand.com" />
      </div>
      <div class="cr-form-group">
        <label for="cr-phone">Phone (optional)</label>
        <input id="cr-phone" name="phone" type="tel" autocomplete="tel"
               class="cr-input" placeholder="0803 000 0000" />
      </div>
      <div class="cr-form-group">
        <label for="cr-message">Your brief / campaign details</label>
        <textarea id="cr-message" name="message" required rows="5"
                  class="cr-input cr-textarea"
                  placeholder="e.g. We are launching a new product in June and would like a sponsored Instagram post + story. Our budget is ₦200,000. Please share your media kit."></textarea>
      </div>
      <button type="submit" class="cr-submit-btn">Send Brief</button>
    </form>
    <div id="crContactSuccess" class="cr-form-success" style="display:none" role="status" aria-live="polite">
      <h3>Brief received!</h3>
      <p>Thank you — I'll review your campaign details and get back to you within 24 hours.</p>
    </div>
  </div>
</div>

<script>
(function () {
  var form = document.getElementById('crContactForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = new FormData(form);
    fetch('/contact', { method: 'POST', body: data })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function () {
        form.style.display = 'none';
        var success = document.getElementById('crContactSuccess');
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

export const creatorPersonalBrandTemplate: WebsiteTemplateContract = {
  slug: 'creator-personal-brand',
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
