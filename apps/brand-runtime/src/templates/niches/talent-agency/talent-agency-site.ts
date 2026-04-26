/**
 * Talent Agency Site — Pillar 3 Website Template
 * Niche ID: P3-talent-agency-talent-agency-site
 * Vertical: talent-agency (priority=3, high)
 * Category: creative
 * Family: NF-CRE-TAL (standalone)
 * Research brief: docs/templates/research/talent-agency-talent-agency-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: APCON registration (for models), CAC, Lagos State government entertainment licences
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about talent representation or booking.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ta-hero{text-align:center;padding:3rem 0 2.5rem}
.ta-logo{height:80px;width:80px;object-fit:cover;border-radius:12px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.ta-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ta-hero h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:900;line-height:1.1;margin-bottom:.625rem;letter-spacing:-.03em}
.ta-tagline{font-size:1.125rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 2rem;line-height:1.7}
.ta-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ta-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.9rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ta-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ta-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ta-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ta-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ta-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ta-section{margin-top:3rem}
.ta-section-title{font-size:1.375rem;font-weight:800;margin-bottom:1.25rem;color:var(--ww-primary)}
.ta-talent-grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.ta-talent-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.5rem;border-left:4px solid var(--ww-primary)}
.ta-talent-name{font-size:1rem;font-weight:800;color:var(--ww-text);margin:0}
.ta-talent-type{font-size:.8125rem;color:var(--ww-primary);font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.ta-talent-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.6;flex:1;margin:0}
.ta-talent-rate{font-size:.9375rem;font-weight:700;color:var(--ww-primary)}
.ta-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2.5rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ta-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ta-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ta-about-strip{margin-top:2.5rem;padding:2rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ta-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ta-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ta-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.ta-strip-item{display:flex;flex-direction:column;gap:.2rem}
.ta-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ta-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ta-strip-value a{color:var(--ww-primary)}
.ta-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ta-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ta-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ta-contact-layout{grid-template-columns:1fr 1fr}}
.ta-contact-info h2,.ta-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ta-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ta-contact-info a{color:var(--ww-primary);font-weight:600}
.ta-form{display:flex;flex-direction:column;gap:.875rem}
.ta-form-group{display:flex;flex-direction:column;gap:.375rem}
.ta-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ta-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ta-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ta-textarea{min-height:110px;resize:vertical}
.ta-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.ta-ndpr a{color:var(--ww-primary)}
.ta-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.ta-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.ta-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.ta-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ta-submit:hover{filter:brightness(1.1)}
.ta-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ta-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ta-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ta-about-body{max-width:44rem;margin:0 auto}
.ta-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ta-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.ta-detail-row{display:flex;gap:1rem;align-items:flex-start}
.ta-detail-label{font-size:.875rem;font-weight:700;min-width:7.5rem;color:var(--ww-text);flex-shrink:0}
.ta-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.ta-detail-value a{color:var(--ww-primary);font-weight:600}
.ta-roster-hero{text-align:center;padding:2.5rem 0 2rem}
.ta-roster-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ta-roster-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.ta-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ta-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.ta-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ta-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ta-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ta-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ta-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ta-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.ta-ctas{flex-direction:column;align-items:stretch}.ta-primary-btn,.ta-sec-btn,.ta-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about talent representation or booking via ${ctx.displayName}.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="ta-hero">
  ${ctx.logoUrl ? `<img class="ta-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="ta-badge">⭐ ${esc(category ?? 'Talent Agency')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ta-tagline">${esc(tagline ?? `Nigeria's premier talent agency — models, actors, musicians, influencers &amp; entertainers. Lagos Fashion Week · AMVCA · Nollywood. CAC-registered.`)}</p>
  <div class="ta-ctas">
    <a class="ta-primary-btn" href="/services">View Our Talent</a>
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ta-wa-btn">${waSvg()} Book Talent</a>` : ''}
    <a class="ta-sec-btn" href="/contact">Contact Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="ta-section">
  <h2 class="ta-section-title">Featured Talent</h2>
  <div class="ta-talent-grid">
    ${featured.map(o => `
    <div class="ta-talent-card">
      <h3 class="ta-talent-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ta-talent-type">${esc(o.description.split('|')[0]?.trim() ?? 'Talent')}</p><p class="ta-talent-desc">${esc(o.description.split('|')[1]?.trim() ?? o.description)}</p>` : ''}
      ${o.priceKobo !== null ? `<span class="ta-talent-rate">Booking from ${fmtKobo(o.priceKobo)}</span>` : '<span class="ta-talent-rate">Rate on request</span>'}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">See full talent roster &rarr;</a>` : ''}
</section>` : ''}
<div class="ta-trust-strip">
  <span class="ta-trust-badge"><span class="ta-dot"></span> APCON Compliant</span>
  <span class="ta-trust-badge"><span class="ta-dot"></span> CAC Registered</span>
  <span class="ta-trust-badge"><span class="ta-dot"></span> Lagos Fashion Week</span>
  <span class="ta-trust-badge"><span class="ta-dot"></span> Nollywood &amp; AMVCA</span>
</div>
${bioExcerpt ? `
<div class="ta-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Our story &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="ta-contact-strip">
  ${placeName ? `<div class="ta-strip-item"><span class="ta-strip-label">Office Location</span><span class="ta-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="ta-strip-item"><span class="ta-strip-label">Bookings Line</span><span class="ta-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="ta-strip-item"><span class="ta-strip-label">Payment</span><span class="ta-strip-value">Bank Transfer · Paystack · Invoice</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName} and discuss representation.`);
  return `${CSS}
<section class="ta-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Representing Nigeria's finest creative talent</p>
</section>
<div class="ta-about-body">
  <p class="ta-about-desc">${esc(description ?? `${ctx.displayName} is a leading Nigerian talent agency representing models, actors, musicians, content creators, and entertainers. Incorporated under the CAC and operating in compliance with advertising regulatory guidelines (APCON), we match top-tier talent with brands, productions, and events across Nigeria and internationally. Our roster has featured at Lagos Fashion Week, AMVCA, Nollywood productions, and major brand campaigns.`)}</p>
  <div class="ta-detail-list">
    ${placeName ? `<div class="ta-detail-row"><span class="ta-detail-label">Office</span><span class="ta-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="ta-detail-row"><span class="ta-detail-label">Bookings</span><span class="ta-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="ta-detail-row"><span class="ta-detail-label">Email</span><span class="ta-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="ta-detail-row"><span class="ta-detail-label">Regulatory</span><span class="ta-detail-value">CAC Registered · APCON Compliant</span></div>
    <div class="ta-detail-row"><span class="ta-detail-label">Talent Types</span><span class="ta-detail-value">Models · Actors · Musicians · Influencers · Speakers</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ta-wa-btn">${waSvg()} Book Talent</a>` : ''}
    <a class="ta-primary-btn" href="/services">Our Roster</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book talent from ${ctx.displayName} for an event or campaign.`);
  const grid = offerings.length === 0
    ? `<div class="ta-empty"><p>Our full talent roster is being updated.<br/>Please contact us directly to discuss bookings and availability.</p><br/><a class="ta-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Book Talent via WhatsApp</a></div>`
    : `<div class="ta-talent-grid">${offerings.map(o => `
    <div class="ta-talent-card">
      <h3 class="ta-talent-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ta-talent-type">${esc(o.description.split('|')[0]?.trim() ?? 'Talent')}</p><p class="ta-talent-desc">${esc(o.description.split('|')[1]?.trim() ?? o.description)}</p>` : ''}
      ${o.priceKobo !== null ? `<span class="ta-talent-rate">Booking from ${fmtKobo(o.priceKobo)}</span>` : '<span class="ta-talent-rate">Rate on request</span>'}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="ta-roster-hero">
  <h1>Our Talent Roster</h1>
  <p class="ta-roster-sub">${esc(ctx.displayName)} — Nigeria's finest models, actors, and entertainers</p>
</section>
<section>${grid}</section>
<div class="ta-cta-strip">
  <h3>Need talent for your project?</h3>
  <p>Contact our bookings team via WhatsApp for fast availability confirmation and rate cards.</p>
  <div class="ta-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ta-wa-btn">${waSvg()} Book via WhatsApp</a>` : ''}
    <a class="ta-sec-btn" href="/contact">Send a Brief</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book talent from ${ctx.displayName} or discuss representation.`);
  return `${CSS}
<section class="ta-contact-hero">
  <h1>Bookings &amp; Enquiries</h1>
  <p>Book talent, request rate cards, or discuss representation with ${esc(ctx.displayName)}.</p>
</section>
${waHref ? `<div class="ta-wa-block">
  <p>The fastest way to check talent availability is via WhatsApp. Our bookings team responds promptly.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ta-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book via WhatsApp</a>
</div>` : ''}
<div class="ta-contact-layout">
  <div class="ta-contact-info">
    <h2>Agency Contacts</h2>
    ${placeName ? `<p><strong>Office:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Bookings:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · Invoice</p>
  </div>
  <div class="ta-form-wrapper">
    <h2>Send a Brief</h2>
    <form class="ta-form" method="POST" action="/contact" id="taContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ta-form-group"><label for="ta-name">Your name / company</label><input id="ta-name" name="name" type="text" required autocomplete="name" class="ta-input" placeholder="e.g. Simi Bankole / StyleHub Nigeria Ltd" /></div>
      <div class="ta-form-group"><label for="ta-phone">Phone / WhatsApp</label><input id="ta-phone" name="phone" type="tel" autocomplete="tel" class="ta-input" placeholder="0803 000 0000" /></div>
      <div class="ta-form-group"><label for="ta-email">Email</label><input id="ta-email" name="email" type="email" autocomplete="email" class="ta-input" placeholder="you@company.com" /></div>
      <div class="ta-form-group"><label for="ta-msg">Your project brief or enquiry</label><textarea id="ta-msg" name="message" required rows="5" class="ta-input ta-textarea" placeholder="e.g. We are looking for a female model aged 20-28 for a fashion shoot in Lagos on 15 May. Budget is ₦150,000 for the day."></textarea></div>
      <div class="ta-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="ta-ndpr-check"><input type="checkbox" id="ta-consent" name="ndpr_consent" value="yes" required /><label for="ta-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="ta-submit">Send Brief</button>
    </form>
    <div id="taContactSuccess" class="ta-success" style="display:none" role="status" aria-live="polite"><h3>Brief received!</h3><p>Our bookings team will respond within 24 hours with talent options and availability. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('taContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('taContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const talentAgencyTalentAgencySiteTemplate: WebsiteTemplateContract = {
  slug: 'talent-agency-talent-agency-site',
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
