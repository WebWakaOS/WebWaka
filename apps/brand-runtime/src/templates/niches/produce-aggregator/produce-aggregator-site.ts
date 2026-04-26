/**
 * Produce Storage / Market Aggregator Site — Pillar 3 Website Template
 * Niche ID: P3-produce-aggregator-produce-aggregator-site
 * Vertical: produce-aggregator (priority=3, medium)
 * Category: agricultural/markets
 * Family: NF-AGR-MKT (standalone)
 * Research brief: docs/templates/research/produce-aggregator-produce-aggregator-site-brief.md
 * Nigeria-First Priority: medium
 * Regulatory signals: FMARD, AFEX commodity exchange, NIRSAL, CAC
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function fmtKobo(k: number): string {
  return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
}

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about produce storage or aggregation services.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.pag-hero{text-align:center;padding:2.75rem 0 2rem}
.pag-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.pag-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.pag-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.pag-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.pag-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pag-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.pag-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.pag-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.pag-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.pag-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.pag-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.pag-section{margin-top:2.75rem}
.pag-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.pag-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.pag-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.pag-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.pag-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.pag-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.pag-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pag-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.pag-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.pag-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.pag-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.pag-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.pag-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.pag-strip-item{display:flex;flex-direction:column;gap:.2rem}
.pag-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.pag-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.pag-strip-value a{color:var(--ww-primary)}
.pag-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.pag-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.pag-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.pag-contact-layout{grid-template-columns:1fr 1fr}}
.pag-contact-info h2,.pag-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.pag-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.pag-contact-info a{color:var(--ww-primary);font-weight:600}
.pag-form{display:flex;flex-direction:column;gap:.875rem}
.pag-form-group{display:flex;flex-direction:column;gap:.375rem}
.pag-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.pag-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.pag-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.pag-textarea{min-height:100px;resize:vertical}
.pag-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.pag-ndpr a{color:var(--ww-primary)}
.pag-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.pag-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.pag-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.pag-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.pag-submit:hover{filter:brightness(1.1)}
.pag-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.pag-about-hero{text-align:center;padding:2.5rem 0 2rem}
.pag-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pag-about-body{max-width:44rem;margin:0 auto}
.pag-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.pag-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.pag-detail-row{display:flex;gap:1rem;align-items:flex-start}
.pag-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.pag-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.pag-detail-value a{color:var(--ww-primary);font-weight:600}
.pag-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.pag-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pag-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.pag-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.pag-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.pag-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.pag-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.pag-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.pag-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.pag-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.pag-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.pag-ctas{flex-direction:column;align-items:stretch}.pag-primary-btn,.pag-sec-btn,.pag-wa-btn{width:100%;justify-content:center}}
</style>`;

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const category = (ctx.data.category as string | null) ?? null;
  const featured = offerings.slice(0,6);
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about produce aggregation or storage at ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="pag-hero">
  ${ctx.logoUrl ? `<img class="pag-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="pag-badge">🌽 ${esc(category ?? 'Produce Aggregator')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="pag-tagline">${esc(tagline ?? `Trusted produce aggregator &amp; storage hub in ${placeName ?? 'Nigeria'}. Maize · Soybeans · Rice · Groundnuts. AFEX-compliant. FMARD registered.`)}</p>
  <div class="pag-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pag-wa-btn">${waSvg()} Enquire via WhatsApp</a>` : ''}
    <a class="pag-primary-btn" href="/services">Our Services</a>
    <a class="pag-sec-btn" href="/contact">Contact Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="pag-section">
  <h2 class="pag-section-title">Commodities We Aggregate</h2>
  <div class="pag-grid">
    ${featured.map(o => `
    <div class="pag-card">
      <h3 class="pag-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="pag-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="pag-item-price">Market price — enquire</span>` : `<span class="pag-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
</section>` : ''}
<div class="pag-trust-strip">
  <span class="pag-trust-badge"><span class="pag-dot"></span> FMARD Registered</span>
  <span class="pag-trust-badge"><span class="pag-dot"></span> CAC Registered</span>
  <span class="pag-trust-badge"><span class="pag-dot"></span> AFEX Compliant</span>
  <span class="pag-trust-badge"><span class="pag-dot"></span> NIRSAL Partner</span>
</div>
${bioExcerpt ? `
<div class="pag-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="pag-contact-strip">
  ${placeName ? `<div class="pag-strip-item"><span class="pag-strip-label">Warehouse Location</span><span class="pag-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="pag-strip-item"><span class="pag-strip-label">Phone / WhatsApp</span><span class="pag-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="pag-strip-item"><span class="pag-strip-label">Payment</span><span class="pag-strip-value">Bank Transfer · Paystack · POS</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName}'s produce aggregation services.`);
  return `${CSS}
<section class="pag-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Trusted produce aggregation, storage &amp; market linkage — Nigeria-first</p>
</section>
<div class="pag-about-body">
  <p class="pag-about-desc">${esc(description ?? `${ctx.displayName} is a FMARD-registered produce aggregator and storage hub connecting smallholder farmers to commodity buyers, processors, and export markets. We aggregate maize, soybeans, rice, sorghum, groundnuts, and sesame. Silos and dry warehouses available for certified storage. AFEX-compliant commodity receipts issued. NIRSAL partner for agricultural finance linkage.`)}</p>
  <div class="pag-detail-list">
    ${placeName ? `<div class="pag-detail-row"><span class="pag-detail-label">Warehouse</span><span class="pag-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="pag-detail-row"><span class="pag-detail-label">Phone</span><span class="pag-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="pag-detail-row"><span class="pag-detail-label">Email</span><span class="pag-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="pag-detail-row"><span class="pag-detail-label">Commodities</span><span class="pag-detail-value">Maize · Soybeans · Rice · Groundnuts · Sorghum · Sesame</span></div>
    <div class="pag-detail-row"><span class="pag-detail-label">Certifications</span><span class="pag-detail-value">FMARD registered · AFEX compliant · NIRSAL partner · CAC</span></div>
    <div class="pag-detail-row"><span class="pag-detail-label">Payment</span><span class="pag-detail-value">Bank Transfer, Paystack, POS</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pag-wa-btn">${waSvg()} Enquire via WhatsApp</a>` : ''}
    <a class="pag-primary-btn" href="/services">Our Services</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I want to sell or buy produce via ${ctx.displayName}. Commodity: [type]. Quantity: [amount in MT]. Please advise on current market rates.`);
  const grid = offerings.length === 0
    ? `<div class="pag-empty"><p>We aggregate and store major Nigerian food commodities.<br/>WhatsApp us your commodity type, quantity, and location for current market pricing.</p><br/><a class="pag-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Enquire via WhatsApp</a></div>`
    : `<div class="pag-grid">${offerings.map(o => `
    <div class="pag-card">
      <h3 class="pag-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="pag-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="pag-item-price">Market price — enquire</span>` : `<span class="pag-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="pag-svc-hero">
  <h1>Aggregation &amp; Storage Services</h1>
  <p class="pag-svc-sub">${esc(ctx.displayName)} — AFEX-compliant commodity hub. All prices in ₦ per metric tonne.</p>
</section>
<section>${grid}</section>
<div class="pag-cta-strip">
  <h3>Farmer, processor, or buyer?</h3>
  <p>WhatsApp us your commodity requirements — we will connect you to the right counterparty at fair market price.</p>
  <div class="pag-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pag-wa-btn">${waSvg()} Enquire via WhatsApp</a>` : ''}
    <a class="pag-sec-btn" href="/contact">Contact Our Hub</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to work with ${ctx.displayName}. I am a [farmer/processor/buyer]. Commodity: [type]. Quantity: [amount].`);
  return `${CSS}
<section class="pag-contact-hero">
  <h1>Contact Our Hub</h1>
  <p>Enquire about produce aggregation, storage, and market linkage at ${esc(ctx.displayName)}.</p>
</section>
${waHref ? `<div class="pag-wa-block">
  <p>Whether you are a farmer, processor, or commodity buyer — WhatsApp us your requirements for immediate response.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="pag-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Now</a>
</div>` : ''}
<div class="pag-contact-layout">
  <div class="pag-contact-info">
    <h2>Warehouse Location</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · POS</p>
  </div>
  <div class="pag-form-wrapper">
    <h2>Produce Enquiry</h2>
    <form class="pag-form" method="POST" action="/contact" id="pagContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="pag-form-group"><label for="pag-name">Your name / organisation</label><input id="pag-name" name="name" type="text" required autocomplete="name" class="pag-input" placeholder="e.g. Adamu Grains Cooperative" /></div>
      <div class="pag-form-group"><label for="pag-phone">Phone / WhatsApp</label><input id="pag-phone" name="phone" type="tel" autocomplete="tel" class="pag-input" placeholder="0803 000 0000" /></div>
      <div class="pag-form-group"><label for="pag-msg">Commodity, quantity &amp; role (farmer/buyer/processor)</label><textarea id="pag-msg" name="message" required rows="4" class="pag-input pag-textarea" placeholder="e.g. I am a maize farmer with 50MT of dried maize ready for sale. Location: Benue State. Looking for competitive offtake price."></textarea></div>
      <div class="pag-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="pag-ndpr-check"><input type="checkbox" id="pag-consent" name="ndpr_consent" value="yes" required /><label for="pag-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="pag-submit">Send Enquiry</button>
    </form>
    <div id="pagContactSuccess" class="pag-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Our commodity team will respond shortly. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('pagContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('pagContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const produceAggregatorProduceAggregatorSiteTemplate: WebsiteTemplateContract = {
  slug: 'produce-aggregator-produce-aggregator-site',
  version: '1.0.0',
  pages: ['home','about','services','contact'],
  renderPage(ctx: WebsiteRenderContext): string {
    try {
      switch(ctx.pageType) {
        case 'home': return renderHome(ctx);
        case 'about': return renderAbout(ctx);
        case 'services': return renderServices(ctx);
        case 'contact': return renderContact(ctx);
        default: return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    } catch { return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Unable to load page.</p>`; }
  },
};
