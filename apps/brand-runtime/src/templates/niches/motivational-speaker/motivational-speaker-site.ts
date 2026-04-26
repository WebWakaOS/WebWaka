/**
 * Motivational Speaker / Keynote Speaker Site — Pillar 3 Website Template
 * Niche ID: P3-motivational-speaker-motivational-speaker-site
 * Vertical: motivational-speaker (priority=3, high)
 * Category: creative/professional
 * Family: NF-CRE-SPK (standalone)
 * Research brief: docs/templates/research/motivational-speaker-motivational-speaker-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: CIPM (for HR topics), NITAD, NSQ, CAC
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to book a speaking engagement.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ms-hero{text-align:center;padding:3rem 0 2.5rem}
.ms-logo{height:96px;width:96px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.ms-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ms-hero h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:900;line-height:1.1;margin-bottom:.625rem;letter-spacing:-.03em}
.ms-tagline{font-size:1.125rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 2rem;line-height:1.7}
.ms-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ms-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.9rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ms-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ms-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ms-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ms-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ms-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ms-section{margin-top:3rem}
.ms-section-title{font-size:1.375rem;font-weight:800;margin-bottom:1.25rem;color:var(--ww-primary)}
.ms-topic-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.ms-topic-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.5rem;border-left:4px solid var(--ww-primary)}
.ms-topic-name{font-size:1rem;font-weight:800;color:var(--ww-text);margin:0}
.ms-topic-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.6;flex:1;margin:0}
.ms-topic-fee{font-size:.9375rem;font-weight:700;color:var(--ww-primary)}
.ms-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2.5rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ms-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ms-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ms-about-strip{margin-top:2.5rem;padding:2rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ms-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ms-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ms-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.ms-strip-item{display:flex;flex-direction:column;gap:.2rem}
.ms-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ms-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ms-strip-value a{color:var(--ww-primary)}
.ms-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ms-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ms-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ms-contact-layout{grid-template-columns:1fr 1fr}}
.ms-contact-info h2,.ms-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ms-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ms-contact-info a{color:var(--ww-primary);font-weight:600}
.ms-form{display:flex;flex-direction:column;gap:.875rem}
.ms-form-group{display:flex;flex-direction:column;gap:.375rem}
.ms-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ms-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ms-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ms-textarea{min-height:100px;resize:vertical}
.ms-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.ms-ndpr a{color:var(--ww-primary)}
.ms-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.ms-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.ms-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.ms-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ms-submit:hover{filter:brightness(1.1)}
.ms-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ms-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ms-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ms-about-body{max-width:44rem;margin:0 auto}
.ms-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ms-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.ms-detail-row{display:flex;gap:1rem;align-items:flex-start}
.ms-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.ms-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.ms-detail-value a{color:var(--ww-primary);font-weight:600}
.ms-speaking-hero{text-align:center;padding:2.5rem 0 2rem}
.ms-speaking-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ms-speaking-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.ms-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ms-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.ms-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ms-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ms-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ms-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ms-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ms-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.ms-ctas{flex-direction:column;align-items:stretch}.ms-primary-btn,.ms-sec-btn,.ms-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to book ${ctx.displayName} for a speaking engagement.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="ms-hero">
  ${ctx.logoUrl ? `<img class="ms-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} photo" />` : ''}
  <div class="ms-badge">🎤 ${esc(category ?? 'Motivational Speaker')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ms-tagline">${esc(tagline ?? `Nigeria's foremost keynote speaker — corporate events, NYSC, church conferences &amp; executive leadership. Based in ${placeName ?? 'Lagos, Nigeria'}.`)}</p>
  <div class="ms-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">${waSvg()} Book a Speaking Engagement</a>` : ''}
    <a class="ms-primary-btn" href="/services">Speaking Topics</a>
    <a class="ms-sec-btn" href="/contact">Get a Quote</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="ms-section">
  <h2 class="ms-section-title">Speaking Topics &amp; Programmes</h2>
  <div class="ms-topic-grid">
    ${featured.map(o => `
    <div class="ms-topic-card">
      <h3 class="ms-topic-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ms-topic-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="ms-topic-fee">Fee on request</span>` : `<span class="ms-topic-fee">From ${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View all topics &rarr;</a>` : ''}
</section>` : ''}
<div class="ms-trust-strip">
  <span class="ms-trust-badge"><span class="ms-dot"></span> CIPM Certified</span>
  <span class="ms-trust-badge"><span class="ms-dot"></span> CAC Registered</span>
  <span class="ms-trust-badge"><span class="ms-dot"></span> Corporate &amp; Church</span>
  <span class="ms-trust-badge"><span class="ms-dot"></span> NYSC &amp; Youth Events</span>
</div>
${bioExcerpt ? `
<div class="ms-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Full biography &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="ms-contact-strip">
  ${placeName ? `<div class="ms-strip-item"><span class="ms-strip-label">Base</span><span class="ms-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="ms-strip-item"><span class="ms-strip-label">Bookings</span><span class="ms-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="ms-strip-item"><span class="ms-strip-label">Payment</span><span class="ms-strip-value">Bank Transfer · Paystack · Invoice</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book ${ctx.displayName} for a speaking engagement.`);
  return `${CSS}
<section class="ms-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Inspiring change, one audience at a time</p>
</section>
<div class="ms-about-body">
  <p class="ms-about-desc">${esc(description ?? `${ctx.displayName} is a renowned Nigerian motivational speaker, author, and leadership coach with over a decade of experience transforming audiences across corporate boardrooms, universities, church conferences, and NYSC orientation programmes. Certified by CIPM (Chartered Institute of Personnel Management of Nigeria) and a member of the National Speakers Association network, they deliver powerful keynotes on leadership, personal finance, entrepreneurship, and youth empowerment.`)}</p>
  <div class="ms-detail-list">
    ${placeName ? `<div class="ms-detail-row"><span class="ms-detail-label">Location</span><span class="ms-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="ms-detail-row"><span class="ms-detail-label">Bookings</span><span class="ms-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="ms-detail-row"><span class="ms-detail-label">Email</span><span class="ms-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="ms-detail-row"><span class="ms-detail-label">Credentials</span><span class="ms-detail-value">CIPM Certified · CAC Registered · Published Author</span></div>
    <div class="ms-detail-row"><span class="ms-detail-label">Venues</span><span class="ms-detail-value">Corporate · Church · University · NYSC · Government</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">${waSvg()} Book a Speaking Engagement</a>` : ''}
    <a class="ms-primary-btn" href="/services">Speaking Topics</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book ${ctx.displayName} for a speaking engagement. Please share your topics and fee schedule.`);
  const grid = offerings.length === 0
    ? `<div class="ms-empty"><p>Speaking topics and fee schedule available on request.<br/>Please contact us via WhatsApp to discuss your event requirements.</p><br/><a class="ms-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Request Speaker Package</a></div>`
    : `<div class="ms-topic-grid">${offerings.map(o => `
    <div class="ms-topic-card">
      <h3 class="ms-topic-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ms-topic-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="ms-topic-fee">Fee on request</span>` : `<span class="ms-topic-fee">From ${fmtKobo(o.priceKobo)}</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="ms-speaking-hero">
  <h1>Speaking Topics</h1>
  <p class="ms-speaking-sub">${esc(ctx.displayName)} — keynotes and training programmes for Nigerian audiences</p>
</section>
<section>${grid}</section>
<div class="ms-cta-strip">
  <h3>Book ${esc(ctx.displayName)} for your event</h3>
  <p>Corporate, church, university, NYSC, or government events — our team will create a bespoke proposal for you.</p>
  <div class="ms-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn">${waSvg()} Book via WhatsApp</a>` : ''}
    <a class="ms-sec-btn" href="/contact">Request a Quote</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to book ${ctx.displayName} for a speaking engagement. Please send your speaker package and fee schedule.`);
  return `${CSS}
<section class="ms-contact-hero">
  <h1>Book a Speaking Engagement</h1>
  <p>Request a speaking proposal, fee schedule, or discuss your event with the team at ${esc(ctx.displayName)}.</p>
</section>
${waHref ? `<div class="ms-wa-block">
  <p>The fastest way to book is via WhatsApp. Our bookings team responds within a few hours.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ms-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Book via WhatsApp</a>
</div>` : ''}
<div class="ms-contact-layout">
  <div class="ms-contact-info">
    <h2>Bookings Contact</h2>
    ${placeName ? `<p><strong>Location:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Bookings:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · Invoice</p>
  </div>
  <div class="ms-form-wrapper">
    <h2>Event Enquiry</h2>
    <form class="ms-form" method="POST" action="/contact" id="msContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ms-form-group"><label for="ms-name">Your name / organisation</label><input id="ms-name" name="name" type="text" required autocomplete="name" class="ms-input" placeholder="e.g. Ngozi Adeyemi / Zenith Bank HR Dept" /></div>
      <div class="ms-form-group"><label for="ms-phone">Phone / WhatsApp</label><input id="ms-phone" name="phone" type="tel" autocomplete="tel" class="ms-input" placeholder="0803 000 0000" /></div>
      <div class="ms-form-group"><label for="ms-msg">Event details and preferred topic</label><textarea id="ms-msg" name="message" required rows="4" class="ms-input ms-textarea" placeholder="e.g. We are hosting our Annual Staff Summit in Lagos on 10 June (300 attendees). We would like a keynote on Leadership &amp; Resilience. Please send your speaker package."></textarea></div>
      <div class="ms-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your booking enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="ms-ndpr-check"><input type="checkbox" id="ms-consent" name="ndpr_consent" value="yes" required /><label for="ms-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="ms-submit">Submit Enquiry</button>
    </form>
    <div id="msContactSuccess" class="ms-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Our bookings team will send a speaker package within 24 hours. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('msContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('msContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const motivationalSpeakerMotivationalSpeakerSiteTemplate: WebsiteTemplateContract = {
  slug: 'motivational-speaker-motivational-speaker-site',
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
