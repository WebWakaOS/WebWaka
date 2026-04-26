/**
 * Government School Portal — Pillar 3 Website Template
 * Niche ID: P3-govt-school-govt-school-portal
 * Vertical: govt-school (priority=3, high)
 * Category: education
 * Family: NF-EDU-PUB (standalone)
 * Research brief: docs/templates/research/govt-school-govt-school-portal-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: SUBEB approval, SBMC community, WAEC/NECO/NERDC frameworks, FMOE oversight
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about your school.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.gs-hero{text-align:center;padding:2.75rem 0 2rem}
.gs-logo{height:88px;width:88px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.gs-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.gs-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.gs-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.gs-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.gs-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.gs-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.gs-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.gs-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.gs-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.gs-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.gs-section{margin-top:2.75rem}
.gs-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.gs-info-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.gs-info-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);border-top:3px solid var(--ww-primary)}
.gs-info-label{font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--ww-text-muted);margin-bottom:.375rem}
.gs-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.gs-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.gs-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.gs-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.gs-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.gs-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.gs-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.gs-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.gs-strip-item{display:flex;flex-direction:column;gap:.2rem}
.gs-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.gs-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.gs-strip-value a{color:var(--ww-primary)}
.gs-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.gs-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.gs-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.gs-contact-layout{grid-template-columns:1fr 1fr}}
.gs-contact-info h2,.gs-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.gs-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.gs-contact-info a{color:var(--ww-primary);font-weight:600}
.gs-form{display:flex;flex-direction:column;gap:.875rem}
.gs-form-group{display:flex;flex-direction:column;gap:.375rem}
.gs-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.gs-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.gs-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.gs-textarea{min-height:100px;resize:vertical}
.gs-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.gs-ndpr a{color:var(--ww-primary)}
.gs-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.gs-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.gs-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.gs-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.gs-submit:hover{filter:brightness(1.1)}
.gs-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.gs-about-hero{text-align:center;padding:2.5rem 0 2rem}
.gs-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.gs-about-body{max-width:44rem;margin:0 auto}
.gs-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.gs-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.gs-detail-row{display:flex;gap:1rem;align-items:flex-start}
.gs-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.gs-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.gs-detail-value a{color:var(--ww-primary);font-weight:600}
.gs-programs-hero{text-align:center;padding:2.5rem 0 2rem}
.gs-programs-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.gs-programs-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.gs-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.gs-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.gs-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.gs-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.gs-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.gs-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.gs-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.gs-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.gs-ctas{flex-direction:column;align-items:stretch}.gs-primary-btn,.gs-sec-btn,.gs-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about ${ctx.displayName} — admissions, fees, or school information.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="gs-hero">
  ${ctx.logoUrl ? `<img class="gs-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="gs-badge">🏫 ${esc(category ?? 'Government School')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="gs-tagline">${esc(tagline ?? `A SUBEB-approved public school serving the community in ${placeName ?? 'Nigeria'}. WAEC · NECO · NERDC curriculum.`)}</p>
  <div class="gs-ctas">
    <a class="gs-primary-btn" href="/about">About Our School</a>
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gs-wa-btn">${waSvg()} WhatsApp School</a>` : ''}
    <a class="gs-sec-btn" href="/contact">Contact Us</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="gs-section">
  <h2 class="gs-section-title">Programmes &amp; Classes</h2>
  <div class="gs-info-grid">
    ${featured.map(o => `
    <div class="gs-info-card">
      <div class="gs-info-label">Programme</div>
      <div class="gs-info-value">${esc(o.name)}</div>
      ${o.description ? `<p style="font-size:.875rem;color:var(--ww-text-muted);margin-top:.375rem;line-height:1.5">${esc(o.description)}</p>` : ''}
    </div>`).join('')}
  </div>
</section>` : ''}
<div class="gs-trust-strip">
  <span class="gs-trust-badge"><span class="gs-dot"></span> SUBEB Approved</span>
  <span class="gs-trust-badge"><span class="gs-dot"></span> WAEC / NECO Centre</span>
  <span class="gs-trust-badge"><span class="gs-dot"></span> NERDC Curriculum</span>
  <span class="gs-trust-badge"><span class="gs-dot"></span> SBMC Active</span>
</div>
${bioExcerpt ? `
<div class="gs-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">More about us &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="gs-contact-strip">
  ${placeName ? `<div class="gs-strip-item"><span class="gs-strip-label">Address</span><span class="gs-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="gs-strip-item"><span class="gs-strip-label">School Office</span><span class="gs-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="gs-strip-item"><span class="gs-strip-label">School Fees</span><span class="gs-strip-value">Bank Transfer · Cash</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName}.`);
  return `${CSS}
<section class="gs-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Educating the next generation of Nigerians</p>
</section>
<div class="gs-about-body">
  <p class="gs-about-desc">${esc(description ?? `${ctx.displayName} is a state government-approved public school delivering quality education to children in our community. Established under the State Universal Basic Education Board (SUBEB), we offer the National Curriculum (NERDC) from primary to junior secondary levels, with qualified teachers registered with the Teachers Registration Council of Nigeria (TRCN). Our students sit for WAEC and NECO examinations and we are an active BECE/JSSCE examination centre.`)}</p>
  <div class="gs-detail-list">
    ${placeName ? `<div class="gs-detail-row"><span class="gs-detail-label">Address</span><span class="gs-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="gs-detail-row"><span class="gs-detail-label">School Office</span><span class="gs-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="gs-detail-row"><span class="gs-detail-label">Email</span><span class="gs-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="gs-detail-row"><span class="gs-detail-label">Regulatory</span><span class="gs-detail-value">SUBEB Approved · TRCN-registered teachers · NERDC curriculum</span></div>
    <div class="gs-detail-row"><span class="gs-detail-label">Exams</span><span class="gs-detail-value">WAEC · NECO · BECE / JSSCE centre</span></div>
    <div class="gs-detail-row"><span class="gs-detail-label">Governance</span><span class="gs-detail-value">School-Based Management Committee (SBMC) active</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gs-wa-btn">${waSvg()} Contact School</a>` : ''}
    <a class="gs-primary-btn" href="/services">Our Programmes</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn about the programmes and classes at ${ctx.displayName}.`);
  const grid = offerings.length === 0
    ? `<div class="gs-empty"><p>Full programme details and timetable are available on request.<br/>Please contact the school office or WhatsApp us for information.</p><br/><a class="gs-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Contact School Office</a></div>`
    : `<div class="gs-info-grid">${offerings.map(o => `
    <div class="gs-info-card">
      <div class="gs-info-label">Programme</div>
      <div class="gs-info-value">${esc(o.name)}</div>
      ${o.description ? `<p style="font-size:.875rem;color:var(--ww-text-muted);margin-top:.375rem;line-height:1.5">${esc(o.description)}</p>` : ''}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="gs-programs-hero">
  <h1>Programmes &amp; Classes</h1>
  <p class="gs-programs-sub">${esc(ctx.displayName)} — NERDC curriculum, WAEC &amp; NECO registered centre</p>
</section>
<section>${grid}</section>
<div class="gs-cta-strip">
  <h3>Enrol your child today</h3>
  <p>Contact our admissions office to begin the enrolment process for ${esc(ctx.displayName)}.</p>
  <div class="gs-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gs-wa-btn">${waSvg()} WhatsApp Admissions</a>` : ''}
    <a class="gs-sec-btn" href="/contact">Contact Us</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to contact ${ctx.displayName} about admissions or school information.`);
  return `${CSS}
<section class="gs-contact-hero">
  <h1>Contact the School</h1>
  <p>Reach the school office at ${esc(ctx.displayName)} for admissions, enquiries, and community matters.</p>
</section>
${waHref ? `<div class="gs-wa-block">
  <p>WhatsApp the school office for fast responses on admissions, fees, and school news.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="gs-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} WhatsApp School Office</a>
</div>` : ''}
<div class="gs-contact-layout">
  <div class="gs-contact-info">
    <h2>School Office</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">School fees: Bank Transfer or Cash to school bursary</p>
    <p style="margin-top:.5rem;font-size:.875rem;color:var(--ww-text-muted)">Supervised under SUBEB &amp; SBMC</p>
  </div>
  <div class="gs-form-wrapper">
    <h2>Send a Message</h2>
    <form class="gs-form" method="POST" action="/contact" id="gsContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="gs-form-group"><label for="gs-name">Parent / Guardian name</label><input id="gs-name" name="name" type="text" required autocomplete="name" class="gs-input" placeholder="e.g. Mr. Emeka Nwosu" /></div>
      <div class="gs-form-group"><label for="gs-phone">Phone / WhatsApp</label><input id="gs-phone" name="phone" type="tel" autocomplete="tel" class="gs-input" placeholder="0803 000 0000" /></div>
      <div class="gs-form-group"><label for="gs-msg">Your enquiry</label><textarea id="gs-msg" name="message" required rows="4" class="gs-input gs-textarea" placeholder="e.g. I would like to enrol my daughter (Primary 4 level) for the next term. Please advise on the process and school fees."></textarea></div>
      <div class="gs-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your school enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="gs-ndpr-check"><input type="checkbox" id="gs-consent" name="ndpr_consent" value="yes" required /><label for="gs-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="gs-submit">Send Message</button>
    </form>
    <div id="gsContactSuccess" class="gs-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>The school office will respond to your enquiry within 1-2 school days. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('gsContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('gsContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const govtSchoolGovtSchoolPortalTemplate: WebsiteTemplateContract = {
  slug: 'govt-school-govt-school-portal',
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
