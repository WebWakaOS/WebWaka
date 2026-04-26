/**
 * Vegetable Garden / Urban Horticulture Site — Pillar 3 Website Template
 * Niche ID: P3-vegetable-garden-urban-veg-garden
 * Vertical: vegetable-garden (priority=3, medium)
 * Category: agricultural/horticulture
 * Family: NF-AGR-HRT (standalone)
 * Research brief: docs/templates/research/vegetable-garden-urban-veg-garden-brief.md
 * Nigeria-First Priority: medium
 * Regulatory signals: FMARD registration, NAFDAC for packaged produce, CAC, NASC (seed certification)
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to order fresh vegetables or enquire about your garden services.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.uvg-hero{text-align:center;padding:2.75rem 0 2rem}
.uvg-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.uvg-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.uvg-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.uvg-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.uvg-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.uvg-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.uvg-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.uvg-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.uvg-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.uvg-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.uvg-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.uvg-section{margin-top:2.75rem}
.uvg-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.uvg-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.uvg-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.uvg-item-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.uvg-item-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.uvg-item-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.uvg-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.uvg-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.uvg-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.uvg-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.uvg-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.uvg-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.uvg-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.uvg-strip-item{display:flex;flex-direction:column;gap:.2rem}
.uvg-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.uvg-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.uvg-strip-value a{color:var(--ww-primary)}
.uvg-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.uvg-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.uvg-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.uvg-contact-layout{grid-template-columns:1fr 1fr}}
.uvg-contact-info h2,.uvg-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.uvg-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.uvg-contact-info a{color:var(--ww-primary);font-weight:600}
.uvg-form{display:flex;flex-direction:column;gap:.875rem}
.uvg-form-group{display:flex;flex-direction:column;gap:.375rem}
.uvg-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.uvg-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.uvg-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.uvg-textarea{min-height:100px;resize:vertical}
.uvg-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.uvg-ndpr a{color:var(--ww-primary)}
.uvg-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.uvg-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.uvg-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.uvg-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.uvg-submit:hover{filter:brightness(1.1)}
.uvg-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.uvg-about-hero{text-align:center;padding:2.5rem 0 2rem}
.uvg-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.uvg-about-body{max-width:44rem;margin:0 auto}
.uvg-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.uvg-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.uvg-detail-row{display:flex;gap:1rem;align-items:flex-start}
.uvg-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.uvg-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.uvg-detail-value a{color:var(--ww-primary);font-weight:600}
.uvg-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.uvg-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.uvg-svc-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.uvg-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.uvg-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.uvg-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.uvg-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.uvg-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.uvg-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.uvg-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.uvg-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.uvg-ctas{flex-direction:column;align-items:stretch}.uvg-primary-btn,.uvg-sec-btn,.uvg-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to order fresh vegetables from ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="uvg-hero">
  ${ctx.logoUrl ? `<img class="uvg-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="uvg-badge">🥬 ${esc(category ?? 'Vegetable Garden')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="uvg-tagline">${esc(tagline ?? `Farm-fresh vegetables grown in ${placeName ?? 'Nigeria'}. Tomatoes · Peppers · Ugwu · Waterleaf · Lettuce. Hotel &amp; restaurant supply. Chemical-free growing.`)}</p>
  <div class="uvg-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="uvg-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="uvg-primary-btn" href="/services">Our Produce</a>
    <a class="uvg-sec-btn" href="/contact">Contact Farm</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="uvg-section">
  <h2 class="uvg-section-title">Fresh Produce Available</h2>
  <div class="uvg-grid">
    ${featured.map(o => `
    <div class="uvg-card">
      <h3 class="uvg-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="uvg-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="uvg-item-price">Market price — WhatsApp</span>` : `<span class="uvg-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View all produce &rarr;</a>` : ''}
</section>` : ''}
<div class="uvg-trust-strip">
  <span class="uvg-trust-badge"><span class="uvg-dot"></span> FMARD Registered</span>
  <span class="uvg-trust-badge"><span class="uvg-dot"></span> CAC Registered</span>
  <span class="uvg-trust-badge"><span class="uvg-dot"></span> Chemical-Free Growing</span>
  <span class="uvg-trust-badge"><span class="uvg-dot"></span> Hotel &amp; Restaurant Supply</span>
</div>
${bioExcerpt ? `
<div class="uvg-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="uvg-contact-strip">
  ${placeName ? `<div class="uvg-strip-item"><span class="uvg-strip-label">Farm Location</span><span class="uvg-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="uvg-strip-item"><span class="uvg-strip-label">Phone / WhatsApp</span><span class="uvg-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="uvg-strip-item"><span class="uvg-strip-label">Payment</span><span class="uvg-strip-value">Cash · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName}'s fresh vegetable supply.`);
  return `${CSS}
<section class="uvg-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Farm-fresh Nigerian vegetables — grown with care, delivered with pride</p>
</section>
<div class="uvg-about-body">
  <p class="uvg-about-desc">${esc(description ?? `${ctx.displayName} is a FMARD-registered urban vegetable farm producing fresh, chemical-free vegetables for Nigerian households, hotels, and restaurants. We grow tomatoes, peppers, ugwu (pumpkin leaf), waterleaf, lettuce, cucumbers, garden eggs, and seasonal greens. Subscription boxes available for weekly home delivery. Hotel and restaurant standing orders welcome. WhatsApp for pricing and delivery scheduling.`)}</p>
  <div class="uvg-detail-list">
    ${placeName ? `<div class="uvg-detail-row"><span class="uvg-detail-label">Farm Address</span><span class="uvg-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="uvg-detail-row"><span class="uvg-detail-label">Phone</span><span class="uvg-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="uvg-detail-row"><span class="uvg-detail-label">Email</span><span class="uvg-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="uvg-detail-row"><span class="uvg-detail-label">Produce</span><span class="uvg-detail-value">Tomatoes · Peppers · Ugwu · Waterleaf · Lettuce · Garden eggs</span></div>
    <div class="uvg-detail-row"><span class="uvg-detail-label">Customers</span><span class="uvg-detail-value">Households · Hotels · Restaurants · Catering firms</span></div>
    <div class="uvg-detail-row"><span class="uvg-detail-label">Payment</span><span class="uvg-detail-value">Cash, Bank Transfer, Paystack</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="uvg-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="uvg-primary-btn" href="/services">View Produce</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to order fresh vegetables from ${ctx.displayName}. Please send this week's available produce and prices.`);
  const grid = offerings.length === 0
    ? `<div class="uvg-empty"><p>Our fresh vegetable selection changes weekly based on harvest.<br/>WhatsApp us for this week's available produce and current market prices.</p><br/><a class="uvg-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Ask About This Week's Harvest</a></div>`
    : `<div class="uvg-grid">${offerings.map(o => `
    <div class="uvg-card">
      <h3 class="uvg-item-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="uvg-item-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="uvg-item-price">Market price — WhatsApp</span>` : `<span class="uvg-item-price">${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="uvg-svc-hero">
  <h1>Fresh Produce</h1>
  <p class="uvg-svc-sub">${esc(ctx.displayName)} — farm-fresh Nigerian vegetables. All prices in ₦ per bundle/kg.</p>
</section>
<section>${grid}</section>
<div class="uvg-cta-strip">
  <h3>Want a weekly subscription box?</h3>
  <p>Subscribe to our weekly vegetable box — hotel and restaurant standing orders available at bulk pricing.</p>
  <div class="uvg-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="uvg-wa-btn">${waSvg()} Order via WhatsApp</a>` : ''}
    <a class="uvg-sec-btn" href="/contact">Contact Our Farm</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to order fresh vegetables from ${ctx.displayName}. I am a [household/hotel/restaurant]. Preferred delivery day: [day].`);
  return `${CSS}
<section class="uvg-contact-hero">
  <h1>Order Fresh Produce</h1>
  <p>Order farm-fresh vegetables from ${esc(ctx.displayName)} — household delivery &amp; B2B supply available.</p>
</section>
${waHref ? `<div class="uvg-wa-block">
  <p>WhatsApp us your vegetable order, delivery address, and preferred day — we deliver fresh from the farm.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="uvg-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Order via WhatsApp</a>
</div>` : ''}
<div class="uvg-contact-layout">
  <div class="uvg-contact-info">
    <h2>Our Farm</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">We accept: Cash · Bank Transfer · Paystack</p>
  </div>
  <div class="uvg-form-wrapper">
    <h2>Produce Order</h2>
    <form class="uvg-form" method="POST" action="/contact" id="uvgContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="uvg-form-group"><label for="uvg-name">Your name</label><input id="uvg-name" name="name" type="text" required autocomplete="name" class="uvg-input" placeholder="e.g. Mrs Ngozi Obi" /></div>
      <div class="uvg-form-group"><label for="uvg-phone">Phone / WhatsApp</label><input id="uvg-phone" name="phone" type="tel" autocomplete="tel" class="uvg-input" placeholder="0803 000 0000" /></div>
      <div class="uvg-form-group"><label for="uvg-msg">Vegetables needed, quantity &amp; delivery address</label><textarea id="uvg-msg" name="message" required rows="4" class="uvg-input uvg-textarea" placeholder="e.g. 2 bundles ugwu, 1 bag tomatoes (medium), 0.5kg peppers. Delivery: 12 Adewale Street, Yaba Lagos. Preferred day: Friday."></textarea></div>
      <div class="uvg-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to process your produce order. <a href="/privacy">Privacy Policy</a>.</p><div class="uvg-ndpr-check"><input type="checkbox" id="uvg-consent" name="ndpr_consent" value="yes" required /><label for="uvg-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="uvg-submit">Send Order</button>
    </form>
    <div id="uvgContactSuccess" class="uvg-success" style="display:none" role="status" aria-live="polite"><h3>Order received!</h3><p>We will confirm your order and delivery details shortly. Fresh vegetables coming your way!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('uvgContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('uvgContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const vegetableGardenUrbanVegGardenTemplate: WebsiteTemplateContract = {
  slug: 'vegetable-garden-urban-veg-garden',
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
