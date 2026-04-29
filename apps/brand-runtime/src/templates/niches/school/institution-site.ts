/**
 * School / Educational Institution Site — NF-EDU-SCH anchor (VN-EDU-001)
 * Pillar 2 — P2-school-institution-site · Milestone M8e · CRITICAL
 *
 * Nigeria-First:
 *   • Admissions-first layout — "Apply for Admission" WhatsApp CTA is primary
 *   • Fee schedule displayed (school fees in NGN build trust; parents expect transparency)
 *   • Ministry of Education approval badge + WAEC/NECO centre accreditation signal
 *   • Term dates / academic calendar in hero tagline
 *   • Offerings = academic programmes / classes (nursery → secondary → vocational)
 *   • Null priceKobo → "Fee on enquiry" (some schools prefer private fee negotiation)
 *   • "Enrolling Now" acceptance signal for open admissions periods
 *   • Proprietor / Principal name + qualifications as trust signal
 *   • PTA engagement note in contact
 *
 * NF-EDU-SCH anchor: variants (private-school, govt-school, nursery-school) must
 *   inherit .sc- namespace, admissions-first CTA pattern, fee-schedule semantics.
 *
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function fmtKobo(k: number): string {
  return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
}

function whatsappLink(phone: string|null, msg?: string): string|null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about admission.')}`;
}

function safeHref(url: string): string {
  try { const p=new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch{/**/}
  return '#';
}

const CSS = `<style>
.sc-hero{text-align:center;padding:2.75rem 0 2rem}
.sc-logo{height:80px;width:80px;object-fit:cover;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.sc-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.sc-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.sc-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.sc-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.sc-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.sc-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.sc-enrol-note{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.sc-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.sc-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.sc-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.sc-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.sc-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.sc-section{margin-top:2.75rem}
.sc-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.sc-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}
.sc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.sc-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.sc-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.sc-card-fee{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.sc-card-enquiry{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.sc-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.sc-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.sc-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.sc-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.sc-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.sc-info-item{display:flex;flex-direction:column;gap:.25rem}
.sc-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.sc-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.sc-info-value a{color:var(--ww-primary)}
.sc-about-hero{text-align:center;padding:2.5rem 0 2rem}
.sc-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sc-body{max-width:44rem;margin:0 auto}
.sc-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.sc-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.sc-drow{display:flex;gap:1rem;align-items:flex-start}
.sc-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.sc-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.sc-dvalue a{color:var(--ww-primary);font-weight:600}
.sc-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.sc-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.sc-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sc-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.sc-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.sc-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.sc-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.sc-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.sc-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.sc-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sc-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.sc-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.sc-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.sc-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.sc-layout{grid-template-columns:1fr 1fr}}
.sc-info h2,.sc-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.sc-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.sc-info a{color:var(--ww-primary);font-weight:600}
.sc-form{display:flex;flex-direction:column;gap:.875rem}
.sc-fg{display:flex;flex-direction:column;gap:.375rem}
.sc-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.sc-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.sc-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.sc-ta{min-height:100px;resize:vertical}
.sc-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.sc-submit:hover{filter:brightness(1.1)}
.sc-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.sc-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.sc-ctas{flex-direction:column;align-items:stretch}.sc-wa-btn,.sc-sec-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}
function phoneSvg(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`}

type Offering = {name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const description=(ctx.data.description as string|null)??null;
  const tagline=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const featured=offerings.slice(0,6);
  const hasMore=offerings.length>6;
  const bio=description ? (description.length>200?description.slice(0,200).trimEnd()+'…':description) : null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about admission. Please share more details.`);
  const grid=featured.length===0?'':`
  <section class="sc-section">
    <h2 class="sc-section-title">Academic Programmes</h2>
    <div class="sc-grid">
      ${featured.map(o=>`
      <div class="sc-card">
        <h3 class="sc-card-name">${esc(o.name)}</h3>
        ${o.description?`<p class="sc-card-desc">${esc(o.description)}</p>`:''}
        ${o.priceKobo!==null?`<p class="sc-card-fee">Fees from ${fmtKobo(o.priceKobo)} per term</p>`:`<p class="sc-card-enquiry">Fee on enquiry</p>`}
      </div>`).join('')}
    </div>
    ${hasMore?`<a href="/services" class="sc-see-all">View all programmes →</a>`:''}
  </section>`;
  const aboutStrip=bio?`
  <div class="sc-about-strip">
    <h2>About ${esc(ctx.displayName)}</h2>
    <p>${esc(bio)}</p>
    <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more about us →</a>
  </div>`:'';
  const infoStrip=(phone||placeName)?`
  <div class="sc-info-strip">
    ${phone?`<div class="sc-info-item"><span class="sc-info-label">Phone</span><span class="sc-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${placeName?`<div class="sc-info-item"><span class="sc-info-label">Address</span><span class="sc-info-value">${esc(placeName)}</span></div>`:''}
    <div class="sc-info-item"><span class="sc-info-label">Admissions</span><span class="sc-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">Enquire on WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div>
  </div>`:'';
  return `${CSS}
<section class="sc-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="sc-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${tagline?`<p class="sc-tagline">${esc(tagline)}</p>`:`<p class="sc-tagline">Nurturing excellence — quality education for every child. Now enrolling.</p>`}
  <div class="sc-ctas">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sc-wa-btn" aria-label="Apply for admission at ${esc(ctx.displayName)}">${waSvg()} Apply for Admission</a>`:`<a class="sc-wa-btn" href="/contact">${waSvg()} Apply for Admission</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="sc-sec-btn">${phoneSvg()} Call Now</a>`:`<a class="sc-sec-btn" href="/contact">View Contact</a>`}
  </div>
  <div class="sc-trust-strip">
    <span class="sc-badge"><span class="sc-dot"></span>Min. of Education Approved</span>
    <span class="sc-badge"><span class="sc-dot"></span>WAEC Centre</span>
    <span class="sc-badge"><span class="sc-dot"></span>Enrolling Now</span>
  </div>
  <p class="sc-enrol-note">New session admissions are open — limited spaces available</p>
</section>
${grid}${aboutStrip}${infoStrip}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description=(ctx.data.description as string|null)??null;
  const category=(ctx.data.category as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const website=(ctx.data.website as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about admission.`);
  return `${CSS}
<section class="sc-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="sc-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${category?`<span class="sc-cat-badge">${esc(category)}</span>`:''}
</section>
<div class="sc-body">
  <p class="sc-desc">${description?esc(description):`${esc(ctx.displayName)} is an approved Nigerian educational institution dedicated to academic excellence and holistic development. Our qualified, experienced staff prepare students for WAEC, NECO, JAMB and beyond.`}</p>
  <div class="sc-details">
    ${category?`<div class="sc-drow"><span class="sc-dlabel">School Type</span><span class="sc-dvalue">${esc(category)}</span></div>`:''}
    ${placeName?`<div class="sc-drow"><span class="sc-dlabel">Address</span><span class="sc-dvalue">${esc(placeName)}</span></div>`:''}
    ${phone?`<div class="sc-drow"><span class="sc-dlabel">Phone</span><span class="sc-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${website?`<div class="sc-drow"><span class="sc-dlabel">Portal</span><span class="sc-dvalue"><a href="${safeHref(website)}" target="_blank" rel="noopener noreferrer">${esc(website)} ↗</a></span></div>`:''}
  </div>
  <div class="sc-btn-row">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sc-wa-btn">${waSvg()} Enquire on WhatsApp</a>`:`<a class="sc-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="sc-sec-btn">${phoneSvg()} Call Now</a>`:''}
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about admission and school fees.`);
  const content=offerings.length===0?`<div class="sc-empty"><p>Our full programme listing and fee schedule is available on request.<br/>Please contact the school for details.</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sc-wa-btn">${waSvg()} Enquire on WhatsApp</a>`:`<a class="sc-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`
    :`<div class="sc-grid">${offerings.map(o=>`
    <div class="sc-card">
      <h3 class="sc-card-name">${esc(o.name)}</h3>
      ${o.description?`<p class="sc-card-desc">${esc(o.description)}</p>`:''}
      ${o.priceKobo!==null?`<p class="sc-card-fee">Fees from ${fmtKobo(o.priceKobo)} per term</p>`:`<p class="sc-card-enquiry">Fee on enquiry</p>`}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="sc-svc-hero">
  <h1>Academic Programmes</h1>
  <p class="sc-sub">Programmes and fee schedule at ${esc(ctx.displayName)}</p>
</section>
<section>${content}</section>
<div class="sc-cta-strip">
  <h3>Ready to enrol your child?</h3>
  <p>Contact our admissions team on WhatsApp or by phone. Limited spaces — apply early.</p>
  <div class="sc-btn-row" style="justify-content:center">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sc-wa-btn">${waSvg()} Apply on WhatsApp</a>`:`<a class="sc-wa-btn" href="/contact">${waSvg()} Apply Now</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="sc-sec-btn">${phoneSvg()} Call Now</a>`:''}
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const placeName=(ctx.data.placeName as string|null)??null;
  const waHref=whatsappLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about admission for my child.`);
  return `${CSS}
<section class="sc-contact-hero">
  <h1>Admissions Enquiry</h1>
  <p>Contact our admissions team to apply for a place or request our prospectus.</p>
</section>
${waHref?`<div class="sc-wa-block"><p>Send us a message on WhatsApp for a quick response from our admissions team.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="sc-wa-btn" style="display:inline-flex;justify-content:center" aria-label="Enquire at ${esc(ctx.displayName)} on WhatsApp">${waSvg()} Enquire on WhatsApp</a></div>`:''}
<div class="sc-layout">
  <div class="sc-info">
    <h2>School Details</h2>
    ${placeName?`<p><strong>Address:</strong> ${esc(placeName)}</p>`:''}
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${!phone&&!email&&!placeName?`<p>Contact details coming soon.</p>`:''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">PTA meetings are held at the start of each term. All parents are welcome.</p>
  </div>
  <div class="sc-form-wrap">
    <h2>Send an Enquiry</h2>
    <form class="sc-form" method="POST" action="/contact" id="scForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="sc-fg"><label for="sc-name">Parent / Guardian name</label><input id="sc-name" name="name" type="text" required autocomplete="name" class="sc-input" placeholder="e.g. Mrs Amaka Obi" /></div>
      <div class="sc-fg"><label for="sc-phone">Phone number</label><input id="sc-phone" name="phone" type="tel" autocomplete="tel" class="sc-input" placeholder="0803 000 0000" /></div>
      <div class="sc-fg"><label for="sc-email">Email (optional)</label><input id="sc-email" name="email" type="email" class="sc-input" placeholder="you@example.com" /></div>
      <div class="sc-fg"><label for="sc-msg">Admission enquiry details</label><textarea id="sc-msg" name="message" required rows="4" class="sc-input sc-ta" placeholder="e.g. Child's name, age, class to enter, and any questions about the school."></textarea></div>
      <button type="submit" class="sc-submit">Send Enquiry</button>
    </form>
    <div id="scSuccess" class="sc-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>Thank you — our admissions team will contact you shortly.</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('scForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('scSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const schoolInstitutionSiteTemplate: WebsiteTemplateContract = {
  slug: 'school-institution-site',
  version: '1.0.0',
  pages: ['home','about','services','contact'],
  renderPage(ctx: WebsiteRenderContext): string {
    try {
      switch(ctx.pageType){
        case 'home': return renderHome(ctx);
        case 'about': return renderAbout(ctx);
        case 'services': return renderServices(ctx);
        case 'contact': return renderContact(ctx);
        default: return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    } catch {
      return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Unable to load page.</p>`;
    }
  },
};
