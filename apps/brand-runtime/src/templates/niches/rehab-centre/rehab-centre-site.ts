/**
 * Rehabilitation Centre Site — Pillar 3 Website Template
 * Niche ID: P3-rehab-centre-rehab-centre-site
 * Vertical: rehab-centre (priority=3, high)
 * Category: health
 * Family: NF-HLT-MNT (standalone)
 * Research brief: docs/templates/research/rehab-centre-rehab-centre-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NDLEA licence, FMOH accreditation, NAFDAC (medication), NMA referral, CAC
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about rehabilitation services for someone I care about.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.rc-hero{text-align:center;padding:2.75rem 0 2rem}
.rc-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.rc-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.rc-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.rc-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.rc-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.rc-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.rc-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.rc-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.rc-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.rc-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.rc-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.rc-section{margin-top:2.75rem}
.rc-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.rc-service-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.rc-service-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.rc-service-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.rc-service-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.rc-service-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary)}
.rc-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.rc-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.rc-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.rc-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.rc-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.rc-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.rc-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.rc-strip-item{display:flex;flex-direction:column;gap:.2rem}
.rc-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.rc-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.rc-strip-value a{color:var(--ww-primary)}
.rc-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.rc-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.rc-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.rc-contact-layout{grid-template-columns:1fr 1fr}}
.rc-contact-info h2,.rc-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.rc-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.rc-contact-info a{color:var(--ww-primary);font-weight:600}
.rc-form{display:flex;flex-direction:column;gap:.875rem}
.rc-form-group{display:flex;flex-direction:column;gap:.375rem}
.rc-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.rc-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.rc-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.rc-textarea{min-height:100px;resize:vertical}
.rc-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.rc-ndpr a{color:var(--ww-primary)}
.rc-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.rc-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.rc-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.rc-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.rc-submit:hover{filter:brightness(1.1)}
.rc-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.rc-about-hero{text-align:center;padding:2.5rem 0 2rem}
.rc-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.rc-about-body{max-width:44rem;margin:0 auto}
.rc-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.rc-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.rc-detail-row{display:flex;gap:1rem;align-items:flex-start}
.rc-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.rc-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.rc-detail-value a{color:var(--ww-primary);font-weight:600}
.rc-services-hero{text-align:center;padding:2.5rem 0 2rem}
.rc-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.rc-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.rc-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.rc-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.rc-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.rc-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.rc-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.rc-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.rc-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.rc-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.rc-ctas{flex-direction:column;align-items:stretch}.rc-primary-btn,.rc-sec-btn,.rc-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="rc-hero">
  ${ctx.logoUrl ? `<img class="rc-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="rc-badge">🏥 ${esc(category ?? 'Rehabilitation Centre')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="rc-tagline">${esc(tagline ?? `NDLEA-licensed rehabilitation centre in ${placeName ?? 'Nigeria'}. Compassionate, evidence-based care for substance use, mental health &amp; recovery.`)}</p>
  <div class="rc-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="rc-wa-btn">${waSvg()} Speak to Our Team</a>` : ''}
    <a class="rc-primary-btn" href="/services">Our Programmes</a>
    <a class="rc-sec-btn" href="/contact">Get Help Now</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="rc-section">
  <h2 class="rc-section-title">Treatment Programmes</h2>
  <div class="rc-service-grid">
    ${featured.map(o => `
    <div class="rc-service-card">
      <h3 class="rc-service-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="rc-service-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="rc-service-price">Fees on consultation</span>` : `<span class="rc-service-price">From ${fmtKobo(o.priceKobo)}/programme</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">See all programmes &rarr;</a>` : ''}
</section>` : ''}
<div class="rc-trust-strip">
  <span class="rc-trust-badge"><span class="rc-dot"></span> NDLEA Licensed</span>
  <span class="rc-trust-badge"><span class="rc-dot"></span> FMOH Accredited</span>
  <span class="rc-trust-badge"><span class="rc-dot"></span> NMA Referral Network</span>
  <span class="rc-trust-badge"><span class="rc-dot"></span> CAC Registered</span>
</div>
${bioExcerpt ? `
<div class="rc-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="rc-contact-strip">
  ${placeName ? `<div class="rc-strip-item"><span class="rc-strip-label">Location</span><span class="rc-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="rc-strip-item"><span class="rc-strip-label">Helpline</span><span class="rc-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="rc-strip-item"><span class="rc-strip-label">Payment</span><span class="rc-strip-value">Bank Transfer · Paystack · Insurance · NHIA</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone);
  return `${CSS}
<section class="rc-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Compassionate, evidence-based recovery care</p>
</section>
<div class="rc-about-body">
  <p class="rc-about-desc">${esc(description ?? `${ctx.displayName} is an NDLEA-licensed and FMOH-accredited rehabilitation centre providing compassionate, evidence-based treatment for substance use disorders, addiction, and mental health challenges. Our multidisciplinary team of psychiatrists, psychologists, counsellors, and nurses are trained in Nigeria-contextualised trauma-informed care. We provide inpatient and outpatient programmes, family therapy, and long-term aftercare support. All treatments use NAFDAC-approved medications and WHO-aligned clinical protocols.`)}</p>
  <div class="rc-detail-list">
    ${placeName ? `<div class="rc-detail-row"><span class="rc-detail-label">Location</span><span class="rc-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="rc-detail-row"><span class="rc-detail-label">Helpline</span><span class="rc-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="rc-detail-row"><span class="rc-detail-label">Email</span><span class="rc-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="rc-detail-row"><span class="rc-detail-label">Licences</span><span class="rc-detail-value">NDLEA Licence · FMOH Accreditation · CAC Registration</span></div>
    <div class="rc-detail-row"><span class="rc-detail-label">Clinical Staff</span><span class="rc-detail-value">MDCN-registered doctors · NMCN-registered nurses · Licensed counsellors</span></div>
    <div class="rc-detail-row"><span class="rc-detail-label">Payment</span><span class="rc-detail-value">Bank Transfer · Paystack · NHIA (where applicable)</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="rc-wa-btn">${waSvg()} Speak to Our Team</a>` : ''}
    <a class="rc-primary-btn" href="/services">Our Programmes</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about treatment programmes at ${ctx.displayName} for someone who needs help.`);
  const grid = offerings.length === 0
    ? `<div class="rc-empty"><p>Our clinical team will assess each individual to recommend the most appropriate programme.<br/>Please contact our helpline for a confidential conversation.</p><br/><a class="rc-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Confidential Helpline</a></div>`
    : `<div class="rc-service-grid">${offerings.map(o => `
    <div class="rc-service-card">
      <h3 class="rc-service-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="rc-service-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="rc-service-price">Fees on consultation</span>` : `<span class="rc-service-price">From ${fmtKobo(o.priceKobo)}/programme</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="rc-services-hero">
  <h1>Treatment Programmes</h1>
  <p class="rc-services-sub">${esc(ctx.displayName)} — NDLEA-licensed, evidence-based rehabilitation care</p>
</section>
<section>${grid}</section>
<div class="rc-cta-strip">
  <h3>Help is available now</h3>
  <p>Our team is ready to speak with you confidentially about treatment options at ${esc(ctx.displayName)}.</p>
  <div class="rc-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="rc-wa-btn">${waSvg()} Confidential Helpline</a>` : ''}
    <a class="rc-sec-btn" href="/contact">Contact Us</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I need confidential help regarding rehabilitation treatment at ${ctx.displayName}. Please advise on the next step.`);
  return `${CSS}
<section class="rc-contact-hero">
  <h1>Get Help Now</h1>
  <p>Speak confidentially with our team at ${esc(ctx.displayName)}. Help is closer than you think.</p>
</section>
${waHref ? `<div class="rc-wa-block">
  <p>All enquiries are handled with complete confidentiality. WhatsApp our helpline for an immediate, private response.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="rc-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Confidential Helpline</a>
</div>` : ''}
<div class="rc-contact-layout">
  <div class="rc-contact-info">
    <h2>Our Centre</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Helpline:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">All enquiries are confidential · NDLEA Licensed · FMOH Accredited</p>
    <p style="margin-top:.5rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · NHIA</p>
  </div>
  <div class="rc-form-wrapper">
    <h2>Confidential Enquiry</h2>
    <form class="rc-form" method="POST" action="/contact" id="rcContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="rc-form-group"><label for="rc-name">Your name (or use 'Anonymous')</label><input id="rc-name" name="name" type="text" required autocomplete="off" class="rc-input" placeholder="e.g. Biodun or Anonymous" /></div>
      <div class="rc-form-group"><label for="rc-phone">Phone / WhatsApp</label><input id="rc-phone" name="phone" type="tel" autocomplete="tel" class="rc-input" placeholder="0803 000 0000" /></div>
      <div class="rc-form-group"><label for="rc-msg">How can we help you?</label><textarea id="rc-msg" name="message" required rows="4" class="rc-input rc-textarea" placeholder="e.g. My brother has been struggling with substance use for 2 years. I would like to understand what treatment options are available and the costs involved."></textarea></div>
      <div class="rc-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Confidentiality &amp; NDPR:</strong> Your details are kept strictly confidential and used only to respond to your enquiry. We never share your information. <a href="/privacy">Privacy Policy</a>.</p><div class="rc-ndpr-check"><input type="checkbox" id="rc-consent" name="ndpr_consent" value="yes" required /><label for="rc-consent">I understand my enquiry is confidential and consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="rc-submit">Send Confidential Message</button>
    </form>
    <div id="rcContactSuccess" class="rc-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Our clinical team will respond to your confidential enquiry within a few hours. You are not alone.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('rcContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('rcContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const rehabCentreRehabCentreSiteTemplate: WebsiteTemplateContract = {
  slug: 'rehab-centre-rehab-centre-site',
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
