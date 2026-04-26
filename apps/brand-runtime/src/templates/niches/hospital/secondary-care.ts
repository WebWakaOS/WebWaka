/**
 * Hospital / Secondary Healthcare — VN-HLT-012 (P1)
 * Pillar 2 — P2-hospital-secondary-care
 *
 * Nigeria-First:
 *   • MDCN hospital licence + NHIS accreditation + HMO panel trust badges
 *   • Inpatient / ward / theatre as primary differentiators from clinic
 *   • Emergency hotline CTA — 24-hr emergency is a key trust signal
 *   • Specialty departments (A&E, Maternity, ICU, Surgery, Paediatrics)
 *   • "Blood bank on-site" — important Nigerian hospital signal
 *   • Null price → "Contact for admission rates"
 *
 * CSS namespace: .hs-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */
import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return`https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to enquire about hospital services and admission.')}` }
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return'#'}

const CSS=`<style>
.hs-hero{text-align:center;padding:2.75rem 0 2rem}
.hs-logo{height:84px;width:84px;object-fit:cover;border-radius:12px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.hs-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.hs-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.hs-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.hs-emg-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#dc2626;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.hs-emg-btn:hover{filter:brightness(1.1);text-decoration:none}
.hs-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.hs-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.hs-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.hs-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.hs-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.hs-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.hs-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.hs-section{margin-top:2.75rem}
.hs-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.hs-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.hs-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.hs-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.hs-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.hs-card-fee{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.hs-card-enq{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.hs-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.hs-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.hs-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.hs-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.hs-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.hs-info-item{display:flex;flex-direction:column;gap:.25rem}
.hs-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.hs-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.hs-info-value a{color:var(--ww-primary)}
.hs-about-hero{text-align:center;padding:2.5rem 0 2rem}
.hs-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.hs-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.hs-about-body{max-width:44rem;margin:0 auto}
.hs-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.hs-detail-list{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.hs-detail-row{display:flex;gap:1rem;align-items:flex-start}
.hs-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.hs-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.hs-detail-value a{color:var(--ww-primary);font-weight:600}
.hs-services-hero{text-align:center;padding:2.5rem 0 2rem}
.hs-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.hs-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.hs-bottom-cta{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.hs-bottom-cta h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.hs-bottom-cta p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.hs-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.hs-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.hs-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.hs-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.hs-emg-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:#fef2f2;border:2px solid #dc2626;border-radius:var(--ww-radius);max-width:32rem}
.hs-emg-block p{font-size:.9375rem;color:#7f1d1d;margin-bottom:1rem}
.hs-wa-block{margin:1rem auto;text-align:center;padding:1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.hs-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.hs-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.hs-contact-layout{grid-template-columns:1fr 1fr}}
.hs-contact-info h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.hs-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.hs-contact-info a{color:var(--ww-primary);font-weight:600}
.hs-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.hs-form{display:flex;flex-direction:column;gap:.875rem}
.hs-form-group{display:flex;flex-direction:column;gap:.375rem}
.hs-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.hs-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.hs-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.hs-textarea{min-height:110px;resize:vertical}
.hs-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.hs-submit:hover{filter:brightness(1.1)}
@media(max-width:375px){.hs-ctas{flex-direction:column;align-items:stretch}.hs-emg-btn,.hs-wa-btn,.hs-sec-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}
function phoneSvg(){return`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`}

type Offering={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offs=(ctx.data.offerings??[]) as Offering[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const feat=offs.slice(0,6);
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about admission and hospital services.`);
  return`${CSS}
<section class="hs-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="hs-logo"/>`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="hs-tagline">${tag?esc(tag):'Comprehensive secondary healthcare. MDCN-licensed. 24-hour emergency services available.'}</p>
  <div class="hs-ctas">
    ${phone?`<a href="tel:${esc(phone)}" class="hs-emg-btn">${phoneSvg()} Emergency: ${esc(phone)}</a>`:''}
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn">${waSvg()} Enquire on WhatsApp</a>`:''}
  </div>
  <div class="hs-trust-strip">
    <span class="hs-badge"><span class="hs-dot"></span>MDCN Licensed</span>
    <span class="hs-badge"><span class="hs-dot"></span>NHIS Accredited</span>
    <span class="hs-badge"><span class="hs-dot"></span>HMO Panel</span>
    <span class="hs-badge"><span class="hs-dot"></span>24-Hr Emergency</span>
    <span class="hs-badge"><span class="hs-dot"></span>Blood Bank</span>
  </div>
</section>
${feat.length?`<section class="hs-section"><h2 class="hs-section-title">Departments & Services</h2><div class="hs-grid">${feat.map(o=>`<div class="hs-card"><h3 class="hs-card-name">${esc(o.name)}</h3>${o.description?`<p class="hs-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="hs-card-fee">${fmtKobo(o.priceKobo)}</p>`:`<p class="hs-card-enq">Contact for admission rates</p>`}</div>`).join('')}</div>${offs.length>6?`<a href="/services" class="hs-see-all">View all departments →</a>`:''}</section>`:''}
${desc?`<div class="hs-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(desc.length>220?desc.slice(0,220)+'…':desc)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${(phone||place)?`<div class="hs-info-strip">${phone?`<div class="hs-info-item"><span class="hs-info-label">Emergency Line</span><span class="hs-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="hs-info-item"><span class="hs-info-label">Hospital Address</span><span class="hs-info-value">${esc(place)}</span></div>`:''}<div class="hs-info-item"><span class="hs-info-label">Enquiries</span><span class="hs-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const web=(ctx.data.website as string|null)??null;
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about your hospital services.`);
  return`${CSS}
<section class="hs-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="hs-logo"/>`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="hs-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="hs-about-body">
  <p class="hs-about-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a MDCN-licensed secondary healthcare facility providing comprehensive inpatient and outpatient medical services. Our hospital is equipped with modern wards, operating theatres, ICU, and specialist consulting suites.`}</p>
  <div class="hs-detail-list">
    ${cat?`<div class="hs-detail-row"><span class="hs-detail-label">Hospital Type</span><span class="hs-detail-value">${esc(cat)}</span></div>`:''}
    ${place?`<div class="hs-detail-row"><span class="hs-detail-label">Address</span><span class="hs-detail-value">${esc(place)}</span></div>`:''}
    ${phone?`<div class="hs-detail-row"><span class="hs-detail-label">Emergency</span><span class="hs-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${web?`<div class="hs-detail-row"><span class="hs-detail-label">Patient Portal</span><span class="hs-detail-value"><a href="${safeHref(web)}" target="_blank" rel="noopener noreferrer">${esc(web)} ↗</a></span></div>`:''}
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn">${waSvg()} Enquire on WhatsApp</a>`:`<a class="hs-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    ${phone?`<a href="tel:${esc(phone)}" class="hs-sec-btn">${phoneSvg()} Call Emergency</a>`:''}
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offs=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to know more about your hospital departments and admission fees.`);
  return`${CSS}
<section class="hs-services-hero">
  <h1>Departments &amp; Services</h1>
  <p style="color:var(--ww-text-muted);max-width:34rem;margin-inline:auto">Specialised medical departments at ${esc(ctx.displayName)}</p>
</section>
${offs.length===0?`<div class="hs-empty"><p>Full department directory is being updated.<br/>Please contact the hospital directly for admission enquiries.</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn">${waSvg()} WhatsApp Enquiry</a>`:`<a class="hs-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`:`<div class="hs-grid">${offs.map(o=>`<div class="hs-card"><h3 class="hs-card-name">${esc(o.name)}</h3>${o.description?`<p class="hs-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="hs-card-fee">${fmtKobo(o.priceKobo)}</p>`:`<p class="hs-card-enq">Contact for admission rates</p>`}</div>`).join('')}</div>`}
<div class="hs-bottom-cta"><h3>Need Emergency Care?</h3><p>Our 24-hour emergency unit is always open. Call our emergency line or walk in.</p><div class="hs-btn-row">${phone?`<a href="tel:${esc(phone)}" class="hs-emg-btn">${phoneSvg()} Emergency Line</a>`:''} ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn">${waSvg()} WhatsApp Enquiry</a>`:''}</div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const waHref=waLink(phone,'Hello, I would like to contact the hospital for an enquiry or appointment.');
  return`${CSS}
<section class="hs-contact-hero">
  <h1>Contact ${esc(ctx.displayName)}</h1>
  <p>Reach our reception, admissions desk, or emergency unit</p>
</section>
${phone?`<div class="hs-emg-block"><p><strong>24-Hour Emergency Line</strong><br/>Call immediately for urgent medical attention.</p><a href="tel:${esc(phone)}" class="hs-emg-btn">${phoneSvg()} ${esc(phone)}</a></div>`:''}
${waHref?`<div class="hs-wa-block"><p>For non-emergency enquiries, appointment scheduling, and admission questions:</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="hs-wa-btn">${waSvg()} WhatsApp Enquiry</a></div>`:''}
<div class="hs-contact-layout">
  <div class="hs-contact-info">
    <h2>Hospital Information</h2>
    ${phone?`<p><strong>Emergency:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${place?`<p><strong>Address:</strong> ${esc(place)}</p>`:''}
    <p>Visiting hours: Mon–Sat 8am–8pm (restricted for ICU/HDU)</p>
  </div>
  <div class="hs-form-wrapper">
    <h2>Send a Message</h2>
    <form class="hs-form" action="/api/contact" method="POST">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}"/>
      <div class="hs-form-group"><label for="hs-name">Full Name</label><input id="hs-name" class="hs-input" name="name" type="text" placeholder="Your name" required/></div>
      <div class="hs-form-group"><label for="hs-phone">Phone Number</label><input id="hs-phone" class="hs-input" name="phone" type="tel" placeholder="08012345678"/></div>
      <div class="hs-form-group"><label for="hs-msg">Message / Enquiry</label><textarea id="hs-msg" class="hs-input hs-textarea" name="message" placeholder="Department of interest, admission enquiry, etc." required></textarea></div>
      <button type="submit" class="hs-submit">Send Enquiry</button>
    </form>
  </div>
</div>`;
}

export const hospitalSecondaryCareTemplate:WebsiteTemplateContract={
  slug:'hospital-secondary-care',
  version:'1.0.0',
  pages:['home','about','services','contact'],
  renderPage(ctx:WebsiteRenderContext):string{
    switch(ctx.pageType){
      case'home':return renderHome(ctx);
      case'about':return renderAbout(ctx);
      case'services':return renderServices(ctx);
      case'contact':return renderContact(ctx);
      default:return`<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
    }
  }
};
