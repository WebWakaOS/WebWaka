/**
 * Cocoa / Export Commodities Trader Site — Pillar 3 Website Template
 * Niche ID: P3-cocoa-exporter-cocoa-export-trader
 * Vertical: cocoa-exporter (priority=3, high)
 * Category: agricultural/export
 * Family: NF-AGR-COM (standalone)
 * Research brief: docs/templates/research/cocoa-exporter-cocoa-export-trader-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NCDC/CAN compliance, FMARD, NXP (SON export quality), CAC, CBN forex
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about cocoa or export commodity trading.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.cet-hero{text-align:center;padding:2.75rem 0 2rem}
.cet-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.cet-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.cet-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.cet-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.cet-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.cet-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.cet-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.cet-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.cet-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.cet-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.cet-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.cet-section{margin-top:2.75rem}
.cet-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.cet-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.cet-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.cet-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.cet-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.cet-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.cet-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.cet-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.cet-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.cet-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.cet-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.cet-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.cet-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.cet-strip-item{display:flex;flex-direction:column;gap:.2rem}
.cet-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.cet-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.cet-strip-value a{color:var(--ww-primary)}
.cet-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.cet-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.cet-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.cet-contact-layout{grid-template-columns:1fr 1fr}}
.cet-contact-info h2,.cet-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.cet-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.cet-contact-info a{color:var(--ww-primary);font-weight:600}
.cet-form{display:flex;flex-direction:column;gap:.875rem}
.cet-form-group{display:flex;flex-direction:column;gap:.375rem}
.cet-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.cet-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.cet-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.cet-textarea{min-height:100px;resize:vertical}
.cet-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.cet-ndpr a{color:var(--ww-primary)}
.cet-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.cet-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.cet-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.cet-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.cet-submit:hover{filter:brightness(1.1)}
.cet-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.cet-about-hero{text-align:center;padding:2.5rem 0 2rem}
.cet-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.cet-about-body{max-width:44rem;margin:0 auto}
.cet-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.cet-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.cet-detail-row{display:flex;gap:1rem;align-items:flex-start}
.cet-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.cet-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.cet-detail-value a{color:var(--ww-primary);font-weight:600}
.cet-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.cet-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.cet-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.cet-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.cet-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.cet-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.cet-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.cet-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.cet-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.cet-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.cet-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.cet-ctas{flex-direction:column;align-items:stretch}.cet-primary-btn,.cet-sec-btn,.cet-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about cocoa export trading with ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="cet-hero">
  ${ctx.logoUrl ? `<img class="cet-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="cet-badge">☕ ${esc(category ?? 'Cocoa Export Trader')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="cet-tagline">${esc(tagline ?? `Premium Nigerian cocoa &amp; export commodities — grade-1 certified, CAN-registered. ${placeName ?? 'Ondo, Cross River &amp; Osun'} sourced. Global buyers welcome.`)}</p>
  <div class="cet-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cet-wa-btn">${waSvg()} Enquire via WhatsApp</a>` : ''}
    <a class="cet-primary-btn" href="/services">Our Commodities</a>
    <a class="cet-sec-btn" href="/contact">Contact Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="cet-section">
  <h2 class="cet-section-title">Export Commodities</h2>
  <div class="cet-grid">
    ${featured.map(o => `
    <div class="cet-card">
      <h3 class="cet-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="cet-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="cet-item-price">FOB price on enquiry</span>` : `<span class="cet-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
</section>` : ''}
<div class="cet-trust-strip">
  <span class="cet-trust-badge"><span class="cet-dot"></span> CAN Registered</span>
  <span class="cet-trust-badge"><span class="cet-dot"></span> NCDC Compliant</span>
  <span class="cet-trust-badge"><span class="cet-dot"></span> FMARD Licensed</span>
  <span class="cet-trust-badge"><span class="cet-dot"></span> Grade-1 Certified</span>
</div>
${bioExcerpt ? `
<div class="cet-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="cet-contact-strip">
  ${placeName ? `<div class="cet-strip-item"><span class="cet-strip-label">Office / Warehouse</span><span class="cet-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="cet-strip-item"><span class="cet-strip-label">Phone / WhatsApp</span><span class="cet-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="cet-strip-item"><span class="cet-strip-label">Payment</span><span class="cet-strip-value">Bank Transfer · CBN FX · LC · Documentary Credit</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName}'s cocoa and export commodity trading.`);
  return `${CSS}
<section class="cet-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Nigeria-first cocoa &amp; export commodities — CAN registered, globally traded</p>
</section>
<div class="cet-about-body">
  <p class="cet-about-desc">${esc(description ?? `${ctx.displayName} is a CAN (Cocoa Association of Nigeria) registered export trader sourcing grade-1 Nigerian cocoa beans from Ondo, Cross River, and Osun states. We also trade in sesame, cashew, and groundnut for international buyers. NCDC (National Cocoa Development Committee) compliant. FMARD licensed. CBN-registered for FX transactions. Documentary credit (LC) and bank transfer accepted from international buyers.`)}</p>
  <div class="cet-detail-list">
    ${placeName ? `<div class="cet-detail-row"><span class="cet-detail-label">Office</span><span class="cet-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="cet-detail-row"><span class="cet-detail-label">Phone</span><span class="cet-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="cet-detail-row"><span class="cet-detail-label">Email</span><span class="cet-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="cet-detail-row"><span class="cet-detail-label">Commodities</span><span class="cet-detail-value">Cocoa beans · Sesame · Cashew · Groundnut · Shea butter</span></div>
    <div class="cet-detail-row"><span class="cet-detail-label">Certifications</span><span class="cet-detail-value">CAN · NCDC · FMARD · CAC · CBN forex registered</span></div>
    <div class="cet-detail-row"><span class="cet-detail-label">Trade Terms</span><span class="cet-detail-value">FOB Lagos/Apapa · CIF (negotiable) · LC · TT · Documentary credit</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cet-wa-btn">${waSvg()} Enquire via WhatsApp</a>` : ''}
    <a class="cet-primary-btn" href="/services">Our Commodities</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like a FOB quote from ${ctx.displayName}. Commodity: [cocoa/sesame/cashew]. Quantity: [MT]. Trade terms: [FOB/CIF].`);
  const grid = offerings.length === 0
    ? `<div class="cet-empty"><p>Our export commodities include Grade-1 Nigerian cocoa beans, sesame, cashew, and groundnut.<br/>WhatsApp us your commodity requirements, quantity, and trade terms for immediate FOB pricing.</p><br/><a class="cet-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Request FOB Quote</a></div>`
    : `<div class="cet-grid">${offerings.map(o => `
    <div class="cet-card">
      <h3 class="cet-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="cet-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="cet-item-price">FOB price on enquiry</span>` : `<span class="cet-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="cet-svc-hero">
  <h1>Export Commodities</h1>
  <p class="cet-svc-sub">${esc(ctx.displayName)} — grade-1 Nigerian cocoa &amp; agricultural exports. FOB Lagos/Apapa.</p>
</section>
<section>${grid}</section>
<div class="cet-cta-strip">
  <h3>International buyer? Request a sample &amp; SGS report.</h3>
  <p>WhatsApp us your commodity, quantity, and destination — we will provide FOB pricing, quality certificates, and shipping schedules.</p>
  <div class="cet-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cet-wa-btn">${waSvg()} Request FOB Quote</a>` : ''}
    <a class="cet-sec-btn" href="/contact">Contact Our Office</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I am interested in buying Nigerian cocoa from ${ctx.displayName}. Commodity: [type]. Quantity: [MT]. Trade terms: [FOB/CIF].`);
  return `${CSS}
<section class="cet-contact-hero">
  <h1>Contact Our Trading Desk</h1>
  <p>Enquire about Nigerian cocoa and export commodity sourcing from ${esc(ctx.displayName)} — CAN registered.</p>
</section>
${waHref ? `<div class="cet-wa-block">
  <p>WhatsApp us your commodity requirements, quantity, and trade terms. We respond with FOB pricing and quality documentation within 24 hours.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="cet-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Trading Desk</a>
</div>` : ''}
<div class="cet-contact-layout">
  <div class="cet-contact-info">
    <h2>Our Office</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Trade payment: Bank Transfer · LC · Documentary Credit · CBN FX</p>
  </div>
  <div class="cet-form-wrapper">
    <h2>Trade Enquiry</h2>
    <form class="cet-form" method="POST" action="/contact" id="cetContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="cet-form-group"><label for="cet-name">Your name / company</label><input id="cet-name" name="name" type="text" required autocomplete="name" class="cet-input" placeholder="e.g. Choco Trading GmbH" /></div>
      <div class="cet-form-group"><label for="cet-phone">Phone / WhatsApp</label><input id="cet-phone" name="phone" type="tel" autocomplete="tel" class="cet-input" placeholder="0803 000 0000 or +49 xxx" /></div>
      <div class="cet-form-group"><label for="cet-msg">Commodity, quantity, trade terms &amp; destination</label><textarea id="cet-msg" name="message" required rows="4" class="cet-input cet-textarea" placeholder="e.g. Grade-1 cocoa beans — 50 MT. FOB Lagos. Destination: Amsterdam. Need SGS inspection report and CAN certificate."></textarea></div>
      <div class="cet-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your trade enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="cet-ndpr-check"><input type="checkbox" id="cet-consent" name="ndpr_consent" value="yes" required /><label for="cet-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="cet-submit">Send Trade Enquiry</button>
    </form>
    <div id="cetContactSuccess" class="cet-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Our trading desk will respond within 24 hours. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('cetContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('cetContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const cocoaExporterCocoaExportTraderTemplate: WebsiteTemplateContract = {
  slug: 'cocoa-exporter-cocoa-export-trader',
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
