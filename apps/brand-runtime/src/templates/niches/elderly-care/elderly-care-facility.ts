/**
 * Elderly Care Facility Site — Pillar 3 Website Template
 * Niche ID: P3-elderly-care-elderly-care-facility
 * Vertical: elderly-care (priority=3, high)
 * Category: health
 * Family: NF-HLT-ELD (standalone)
 * Research brief: docs/templates/research/elderly-care-elderly-care-facility-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: FMOH accreditation, NHIA compliance, NMA referral, CAC NGO or Ltd registration
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about elderly care services for my family member.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ec-hero{text-align:center;padding:2.75rem 0 2rem}
.ec-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.ec-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ec-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.ec-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.ec-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ec-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ec-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ec-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ec-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ec-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ec-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ec-section{margin-top:2.75rem}
.ec-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ec-service-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
.ec-service-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.ec-service-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.ec-service-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5;flex:1;margin:0}
.ec-service-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary)}
.ec-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ec-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ec-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ec-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ec-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ec-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ec-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.ec-strip-item{display:flex;flex-direction:column;gap:.2rem}
.ec-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ec-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ec-strip-value a{color:var(--ww-primary)}
.ec-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ec-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ec-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ec-contact-layout{grid-template-columns:1fr 1fr}}
.ec-contact-info h2,.ec-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ec-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ec-contact-info a{color:var(--ww-primary);font-weight:600}
.ec-form{display:flex;flex-direction:column;gap:.875rem}
.ec-form-group{display:flex;flex-direction:column;gap:.375rem}
.ec-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ec-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ec-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ec-textarea{min-height:100px;resize:vertical}
.ec-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.ec-ndpr a{color:var(--ww-primary)}
.ec-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.ec-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.ec-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.ec-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ec-submit:hover{filter:brightness(1.1)}
.ec-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ec-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ec-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ec-about-body{max-width:44rem;margin:0 auto}
.ec-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.ec-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.ec-detail-row{display:flex;gap:1rem;align-items:flex-start}
.ec-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.ec-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.ec-detail-value a{color:var(--ww-primary);font-weight:600}
.ec-services-hero{text-align:center;padding:2.5rem 0 2rem}
.ec-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ec-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.ec-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.ec-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.ec-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ec-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ec-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ec-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ec-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ec-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.ec-ctas{flex-direction:column;align-items:stretch}.ec-primary-btn,.ec-sec-btn,.ec-wa-btn{width:100%;justify-content:center}}
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
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about elderly care services at ${ctx.displayName} for my family member.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="ec-hero">
  ${ctx.logoUrl ? `<img class="ec-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="ec-badge">🤍 ${esc(category ?? 'Elderly Care')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ec-tagline">${esc(tagline ?? `Compassionate, family-partnered elderly care in ${placeName ?? 'Nigeria'}. FMOH-compliant. Dignity and respect for every resident.`)}</p>
  <div class="ec-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ec-wa-btn">${waSvg()} Speak to Our Team</a>` : ''}
    <a class="ec-primary-btn" href="/services">Our Care Services</a>
    <a class="ec-sec-btn" href="/contact">Schedule a Visit</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="ec-section">
  <h2 class="ec-section-title">Care Services &amp; Programmes</h2>
  <div class="ec-service-grid">
    ${featured.map(o => `
    <div class="ec-service-card">
      <h3 class="ec-service-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ec-service-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="ec-service-price">Care plan on consultation</span>` : `<span class="ec-service-price">From ${fmtKobo(o.priceKobo)}/month</span>`}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View all services &rarr;</a>` : ''}
</section>` : ''}
<div class="ec-trust-strip">
  <span class="ec-trust-badge"><span class="ec-dot"></span> FMOH Compliant</span>
  <span class="ec-trust-badge"><span class="ec-dot"></span> NMA Referral Network</span>
  <span class="ec-trust-badge"><span class="ec-dot"></span> NHIA Partner</span>
  <span class="ec-trust-badge"><span class="ec-dot"></span> CAC Registered</span>
</div>
${bioExcerpt ? `
<div class="ec-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="ec-contact-strip">
  ${placeName ? `<div class="ec-strip-item"><span class="ec-strip-label">Location</span><span class="ec-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="ec-strip-item"><span class="ec-strip-label">Care Helpline</span><span class="ec-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="ec-strip-item"><span class="ec-strip-label">Payment</span><span class="ec-strip-value">Bank Transfer · Paystack · NHIA · Monthly plan</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about the care offered at ${ctx.displayName} for my elderly parent.`);
  return `${CSS}
<section class="ec-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Dignity, safety, and love for every resident</p>
</section>
<div class="ec-about-body">
  <p class="ec-about-desc">${esc(description ?? `${ctx.displayName} is a Nigerian elderly care facility providing dignified, compassionate, and medically supervised care for older adults. We operate as a family-partnership model — where families remain central to care decisions and daily life. Our qualified caregivers, registered nurses (NMCN), and visiting physicians (NMA members) deliver personalised care plans covering residential care, day care, physiotherapy, dementia support, and palliative care. We comply fully with Federal Ministry of Health (FMOH) standards for residential care facilities.`)}</p>
  <div class="ec-detail-list">
    ${placeName ? `<div class="ec-detail-row"><span class="ec-detail-label">Location</span><span class="ec-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="ec-detail-row"><span class="ec-detail-label">Helpline</span><span class="ec-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="ec-detail-row"><span class="ec-detail-label">Email</span><span class="ec-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="ec-detail-row"><span class="ec-detail-label">Compliance</span><span class="ec-detail-value">FMOH Compliant · CAC Registered · NHIA Partner</span></div>
    <div class="ec-detail-row"><span class="ec-detail-label">Clinical Staff</span><span class="ec-detail-value">NMCN-registered nurses · NMA visiting physicians · Trained caregivers</span></div>
    <div class="ec-detail-row"><span class="ec-detail-label">Payment</span><span class="ec-detail-value">Monthly plan · Bank Transfer · Paystack · NHIA</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ec-wa-btn">${waSvg()} Speak to Our Team</a>` : ''}
    <a class="ec-primary-btn" href="/services">Our Services</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to enquire about care services at ${ctx.displayName} for my elderly family member.`);
  const grid = offerings.length === 0
    ? `<div class="ec-empty"><p>Our care coordinator will assess your family member's needs and create a personalised care plan.<br/>Please contact us to schedule a consultation visit.</p><br/><a class="ec-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Enquire via WhatsApp</a></div>`
    : `<div class="ec-service-grid">${offerings.map(o => `
    <div class="ec-service-card">
      <h3 class="ec-service-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="ec-service-desc">${esc(o.description)}</p>` : ''}
      ${o.priceKobo === null ? `<span class="ec-service-price">Care plan on consultation</span>` : `<span class="ec-service-price">From ${fmtKobo(o.priceKobo)}/month</span>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="ec-services-hero">
  <h1>Care Services</h1>
  <p class="ec-services-sub">${esc(ctx.displayName)} — personalised elderly care, FMOH compliant</p>
</section>
<section>${grid}</section>
<div class="ec-cta-strip">
  <h3>Schedule a facility visit</h3>
  <p>Come see our facility and meet our care team before making a decision. We welcome families to visit ${esc(ctx.displayName)} at any time.</p>
  <div class="ec-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ec-wa-btn">${waSvg()} Schedule a Visit</a>` : ''}
    <a class="ec-sec-btn" href="/contact">Contact Us</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to schedule a visit to ${ctx.displayName} and learn about care options for my elderly family member.`);
  return `${CSS}
<section class="ec-contact-hero">
  <h1>Contact &amp; Schedule a Visit</h1>
  <p>Speak with our care coordinators at ${esc(ctx.displayName)} to discuss your family's needs.</p>
</section>
${waHref ? `<div class="ec-wa-block">
  <p>WhatsApp our care helpline to speak with a care coordinator — 7 days a week.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ec-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Care Helpline</a>
</div>` : ''}
<div class="ec-contact-layout">
  <div class="ec-contact-info">
    <h2>Our Facility</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Helpline:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Monthly plan · Bank Transfer · Paystack · NHIA</p>
    <p style="margin-top:.5rem;font-size:.875rem;color:var(--ww-text-muted)">FMOH Compliant · CAC Registered</p>
  </div>
  <div class="ec-form-wrapper">
    <h2>Enquiry Form</h2>
    <form class="ec-form" method="POST" action="/contact" id="ecContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ec-form-group"><label for="ec-name">Your name (family contact)</label><input id="ec-name" name="name" type="text" required autocomplete="name" class="ec-input" placeholder="e.g. Mrs. Abimbola Adeleke" /></div>
      <div class="ec-form-group"><label for="ec-phone">Phone / WhatsApp</label><input id="ec-phone" name="phone" type="tel" autocomplete="tel" class="ec-input" placeholder="0803 000 0000" /></div>
      <div class="ec-form-group"><label for="ec-msg">Your enquiry</label><textarea id="ec-msg" name="message" required rows="4" class="ec-input ec-textarea" placeholder="e.g. I am looking for residential care for my 78-year-old father. He has diabetes and needs daily medication management. Can we schedule a visit this week?"></textarea></div>
      <div class="ec-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details and any medical information shared are handled with strict confidentiality. <a href="/privacy">Privacy Policy</a>.</p><div class="ec-ndpr-check"><input type="checkbox" id="ec-consent" name="ndpr_consent" value="yes" required /><label for="ec-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="ec-submit">Send Enquiry</button>
    </form>
    <div id="ecContactSuccess" class="ec-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Our care coordinator will reach out within a few hours to discuss your family member's needs. Thank you for trusting us.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('ecContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('ecContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const elderlyCareElderlyCareFacilityTemplate: WebsiteTemplateContract = {
  slug: 'elderly-care-elderly-care-facility',
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
