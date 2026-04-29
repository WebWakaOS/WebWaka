/**
 * Market Association / Traders Association Portal — Pillar 3 Website Template
 * Niche ID: P3-market-association-market-assoc-portal
 * Vertical: market-association (priority=3, critical)
 * Category: civic
 * Family: NF-CIV-TRD (standalone)
 * Research brief: docs/templates/research/market-association-market-assoc-portal-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: CAC Incorporated Trustees, LACCA/AMATO/NANTS, FIRS TIN
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about this market association.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ma-hero{text-align:center;padding:2.75rem 0 2rem;border-bottom:2px solid var(--ww-border)}
.ma-logo{height:80px;width:80px;object-fit:contain;margin-bottom:1rem}
.ma-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ma-hero h1{font-size:clamp(1.75rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.ma-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.ma-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ma-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ma-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ma-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ma-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ma-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ma-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ma-leadership{display:grid;gap:.875rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));margin-top:1.5rem}
.ma-leader-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.125rem;background:var(--ww-bg-surface);text-align:center;border-top:3px solid var(--ww-primary)}
.ma-leader-title{font-size:.75rem;font-weight:700;color:var(--ww-primary);text-transform:uppercase;letter-spacing:.05em;margin-bottom:.25rem}
.ma-leader-name{font-size:.9375rem;font-weight:700;color:var(--ww-text)}
.ma-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ma-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ma-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ma-news-strip{margin-top:2.25rem}
.ma-news-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-primary)}
.ma-notice-list{display:flex;flex-direction:column;gap:.75rem}
.ma-notice{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem 1.25rem;background:var(--ww-bg-surface);border-left:3px solid var(--ww-primary)}
.ma-notice h3{font-size:.9375rem;font-weight:700;margin-bottom:.25rem}
.ma-notice p{font-size:.875rem;color:var(--ww-text-muted)}
.ma-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.ma-strip-item{display:flex;flex-direction:column;gap:.2rem}
.ma-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ma-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ma-strip-value a{color:var(--ww-primary)}
.ma-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ma-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ma-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ma-contact-layout{grid-template-columns:1fr 1fr}}
.ma-contact-info h2,.ma-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ma-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ma-contact-info a{color:var(--ww-primary);font-weight:600}
.ma-form{display:flex;flex-direction:column;gap:.875rem}
.ma-form-group{display:flex;flex-direction:column;gap:.375rem}
.ma-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ma-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ma-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ma-textarea{min-height:100px;resize:vertical}
.ma-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.ma-ndpr a{color:var(--ww-primary)}
.ma-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.ma-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.ma-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.ma-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ma-submit:hover{filter:brightness(1.1)}
.ma-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ma-success h3{font-weight:700;margin-bottom:.25rem}
.ma-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ma-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ma-about-body{max-width:44rem;margin:0 auto}
.ma-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:1.5rem;font-size:1rem}
.ma-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.ma-detail-row{display:flex;gap:1rem;align-items:flex-start}
.ma-detail-label{font-size:.875rem;font-weight:700;min-width:9rem;color:var(--ww-text);flex-shrink:0}
.ma-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.ma-detail-value a{color:var(--ww-primary);font-weight:600}
.ma-services-hero{text-align:center;padding:2.5rem 0 2rem}
.ma-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ma-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.ma-service-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.ma-service-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.ma-service-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.ma-service-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.ma-service-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.ma-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.ma-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ma-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ma-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ma-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ma-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ma-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.ma-ctas{flex-direction:column;align-items:stretch}.ma-primary-btn,.ma-sec-btn,.ma-wa-btn{width:100%;justify-content:center}}
</style>`;

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to contact the secretariat of ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="ma-hero">
  ${ctx.logoUrl ? `<img class="ma-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="ma-cat-badge">🏛️ Market Association</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ma-tagline">${esc(tagline ?? 'Organised Trade. Prosperous Market. United Traders.')}</p>
  <div class="ma-ctas">
    <a class="ma-primary-btn" href="/services">Membership &amp; Levies</a>
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ma-wa-btn">${waSvg()} Contact Secretariat</a>` : ''}
    <a class="ma-sec-btn" href="/about">Our Leadership</a>
  </div>
</section>
<div class="ma-trust-strip">
  <span class="ma-badge"><span class="ma-dot"></span> CAC Incorporated Trustees</span>
  <span class="ma-badge"><span class="ma-dot"></span> State Ministry Approved</span>
  <span class="ma-badge"><span class="ma-dot"></span> LACCA / AMATO Affiliated</span>
  <span class="ma-badge"><span class="ma-dot"></span> Levy Transparency</span>
</div>
<section style="margin-top:2.25rem">
  <h2 style="font-size:1.125rem;font-weight:700;margin-bottom:.875rem;color:var(--ww-primary)">Association Leadership</h2>
  <div class="ma-leadership">
    <div class="ma-leader-card"><div class="ma-leader-title">Chairman</div><div class="ma-leader-name">${esc((ctx.data.chairmanName as string | null) ?? ctx.displayName+' Executive')}</div></div>
    <div class="ma-leader-card"><div class="ma-leader-title">Secretary</div><div class="ma-leader-name">Secretariat Office</div></div>
    <div class="ma-leader-card"><div class="ma-leader-title">Treasurer</div><div class="ma-leader-name">Levy &amp; Finance Desk</div></div>
    <div class="ma-leader-card"><div class="ma-leader-title">Members</div><div class="ma-leader-name">${esc((ctx.data.memberCount as string | null) ?? 'Registered Traders')}</div></div>
  </div>
</section>
<section class="ma-news-strip">
  <h2>Latest Notices</h2>
  <div class="ma-notice-list">
    <div class="ma-notice"><h3>Market Operations</h3><p>${esc(ctx.displayName)} operates under the rules of our constitution and state market regulations. All traders must hold a valid membership card.</p></div>
    <div class="ma-notice"><h3>Levy Schedule</h3><p>Annual membership levy and daily market contributions are payable at the secretariat or via bank transfer. See Services page for details.</p></div>
    <div class="ma-notice"><h3>Meetings</h3><p>General meetings are held monthly. Executive meetings are held weekly. Check your WhatsApp broadcast for next meeting date and venue.</p></div>
  </div>
</section>
${bioExcerpt ? `<div style="margin-top:2rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)"><h2 style="font-size:1.125rem;font-weight:700;margin-bottom:.75rem">About ${esc(ctx.displayName)}</h2><p style="color:var(--ww-text-muted);line-height:1.75;font-size:.9375rem;margin-bottom:1rem">${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Full history &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="ma-contact-strip">
  ${placeName ? `<div class="ma-strip-item"><span class="ma-strip-label">Secretariat</span><span class="ma-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="ma-strip-item"><span class="ma-strip-label">Phone</span><span class="ma-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="ma-strip-item"><span class="ma-strip-label">Levy Payment</span><span class="ma-strip-value">Bank Transfer · Paystack · Cash at Secretariat</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about membership at ${ctx.displayName}.`);
  return `${CSS}
<section class="ma-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">Organised Trade. Prosperous Market.</p></section>
<div class="ma-about-body">
  <p class="ma-about-desc">${esc(description ?? `${ctx.displayName} is a duly registered market association, incorporated as a Trustee under the Companies and Allied Matters Act (CAMA) with the Corporate Affairs Commission (CAC). We represent the collective interest of traders in our market, ensuring organised trade, transparent levy administration, and effective dialogue with government authorities.`)}</p>
  <div class="ma-detail-list">
    ${placeName ? `<div class="ma-detail-row"><span class="ma-detail-label">Secretariat</span><span class="ma-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="ma-detail-row"><span class="ma-detail-label">Phone</span><span class="ma-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="ma-detail-row"><span class="ma-detail-label">Email</span><span class="ma-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="ma-detail-row"><span class="ma-detail-label">Registration</span><span class="ma-detail-value">CAC Incorporated Trustees (IT Number)</span></div>
    <div class="ma-detail-row"><span class="ma-detail-label">Affiliation</span><span class="ma-detail-value">LACCA, AMATO, NANTS</span></div>
    <div class="ma-detail-row"><span class="ma-detail-label">Levy Payment</span><span class="ma-detail-value">Bank Transfer, Paystack, Cash at Secretariat</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ma-wa-btn">${waSvg()} Contact Secretariat</a>` : ''}
    <a class="ma-primary-btn" href="/services">Membership Information</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to register as a member of ${ctx.displayName}.`);
  const grid = offerings.length === 0
    ? `<div style="display:flex;flex-direction:column;gap:1rem">
  <div class="ma-service-card"><h3 class="ma-service-name">Annual Membership Levy</h3><p class="ma-service-desc">Yearly subscription that entitles traders to all association benefits, meeting voting rights, and market protection.</p><span class="ma-service-price">Contact Secretariat</span></div>
  <div class="ma-service-card"><h3 class="ma-service-name">Stall Registration</h3><p class="ma-service-desc">Formal registration of your market stall or lock-up shop with the association for protection and market recognition.</p><span class="ma-service-price">Contact Secretariat</span></div>
  <div class="ma-service-card"><h3 class="ma-service-name">Dispute Resolution</h3><p class="ma-service-desc">The association mediates trader disputes through a formal panel. Contact the secretariat to file a complaint.</p><span class="ma-service-price">Free for members</span></div>
  <div class="ma-service-card"><h3 class="ma-service-name">Security &amp; Market Order</h3><p class="ma-service-desc">Association security team and liaison with market management to maintain safe, orderly trading environment.</p><span class="ma-service-price">Included in levy</span></div>
</div>`
    : `<div class="ma-service-grid">${offerings.map(o => `<div class="ma-service-card"><h3 class="ma-service-name">${esc(o.name)}</h3>${o.description ? `<p class="ma-service-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="ma-service-price">Contact Secretariat</span>` : `<span class="ma-service-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="ma-services-hero"><h1>Membership &amp; Services</h1><p class="ma-services-sub">All levies and fees at ${esc(ctx.displayName)} — payable in ₦ (Naira)</p></section>
<section>${grid}</section>
<div class="ma-cta-strip"><h3>Join ${esc(ctx.displayName)}</h3><p>Register as a member today and enjoy the protection, representation, and community of our association.</p>
<div class="ma-btn-row">
  ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ma-wa-btn">${waSvg()} Register via WhatsApp</a>` : ''}
  <a class="ma-sec-btn" href="/contact">Visit Secretariat</a>
</div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello ${ctx.displayName} Secretariat, I would like to enquire about membership registration.`);
  return `${CSS}
<section class="ma-contact-hero"><h1>Contact the Secretariat</h1><p>Reach out to ${esc(ctx.displayName)} for membership, levies, or any market concerns.</p></section>
${waHref ? `<div class="ma-wa-block"><p>WhatsApp the secretariat for the fastest response on membership, levies, or complaints.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ma-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp Secretariat</a></div>` : ''}
<div class="ma-contact-layout">
  <div class="ma-contact-info">
    <h2>Secretariat Details</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Secretariat contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Levy Payment: Bank Transfer · Paystack · Cash at Secretariat</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View membership information &rarr;</a></p>
  </div>
  <div class="ma-form-wrapper">
    <h2>Send a Message</h2>
    <form class="ma-form" method="POST" action="/contact" id="maContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ma-form-group"><label for="ma-name">Your name</label><input id="ma-name" name="name" type="text" required autocomplete="name" class="ma-input" placeholder="e.g. Alhaji Bello Muhammed" /></div>
      <div class="ma-form-group"><label for="ma-phone">Phone / WhatsApp</label><input id="ma-phone" name="phone" type="tel" autocomplete="tel" class="ma-input" placeholder="0803 000 0000" /></div>
      <div class="ma-form-group"><label for="ma-msg">Your enquiry</label><textarea id="ma-msg" name="message" required rows="4" class="ma-input ma-textarea" placeholder="e.g. I would like to register as a new member and understand the levy structure."></textarea></div>
      <div class="ma-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your enquiry. <a href="/privacy">Privacy Policy</a>.<div class="ma-ndpr-check"><input type="checkbox" id="ma-consent" name="ndpr_consent" value="yes" required /><label for="ma-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="ma-submit">Send Message</button>
    </form>
    <div id="maContactSuccess" class="ma-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The secretariat will respond to your enquiry shortly. Thank you.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('maContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('maContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const marketAssociationMarketAssocPortalTemplate: WebsiteTemplateContract = {
  slug: 'market-association-market-assoc-portal',
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
