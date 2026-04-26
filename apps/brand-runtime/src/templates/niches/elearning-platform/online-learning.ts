/**
 * E-Learning Platform / Online Education — VN-EDU-011 (P1, score 43)
 * Pillar 2 — P2-elearning-platform-online-learning
 *
 * Nigeria-First:
 *   • Course catalog with Nigerian-relevant subjects (ICAN, CIBN, COREN prep, digital skills)
 *   • "Learn from anywhere" — data-light mode signal for low-bandwidth users
 *   • Certificate issuance as key trust signal
 *   • Cohort start dates and enrollment deadlines
 *   • Installment payment / "pay as you go" options
 *   • WhatsApp class community and support
 *
 * CSS namespace: .el-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */
import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return`https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to enrol in one of your online courses. Please share more details.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return'#'}

const CSS=`<style>
.el-hero{text-align:center;padding:3rem 0 2rem}
.el-logo{height:80px;width:80px;object-fit:cover;border-radius:12px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.el-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.el-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:42rem;margin:0 auto 1.75rem;line-height:1.6}
.el-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.el-primary-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.el-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.el-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.el-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.el-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.el-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.el-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.el-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.el-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.el-section{margin-top:2.75rem}
.el-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.el-section-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.el-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.el-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem}
.el-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.el-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.el-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.el-card-enq{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.el-card-enrol{display:inline-flex;align-items:center;justify-content:center;margin-top:.75rem;padding:.5rem .875rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:.875rem;font-weight:700;text-decoration:none;transition:filter .15s}
.el-card-enrol:hover{filter:brightness(1.1);text-decoration:none}
.el-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.el-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.el-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.el-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.el-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.el-info-item{display:flex;flex-direction:column;gap:.25rem}
.el-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.el-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.el-info-value a{color:var(--ww-primary)}
.el-about-hero{text-align:center;padding:2.5rem 0 2rem}
.el-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.el-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.el-about-body{max-width:44rem;margin:0 auto}
.el-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.el-detail-list{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.el-detail-row{display:flex;gap:1rem;align-items:flex-start}
.el-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.el-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.el-detail-value a{color:var(--ww-primary);font-weight:600}
.el-services-hero{text-align:center;padding:2.5rem 0 2rem}
.el-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.el-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.el-bottom-cta{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.el-bottom-cta h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.el-bottom-cta p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.el-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.el-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.el-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.el-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.el-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.el-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.el-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.el-contact-layout{grid-template-columns:1fr 1fr}}
.el-contact-info h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.el-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.el-contact-info a{color:var(--ww-primary);font-weight:600}
.el-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.el-form{display:flex;flex-direction:column;gap:.875rem}
.el-form-group{display:flex;flex-direction:column;gap:.375rem}
.el-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.el-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.el-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.el-textarea{min-height:110px;resize:vertical}
.el-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.el-submit:hover{filter:brightness(1.1)}
@media(max-width:375px){.el-ctas{flex-direction:column;align-items:stretch}.el-primary-btn,.el-wa-btn,.el-sec-btn{width:100%;justify-content:center}}
</style>`;

function waSvg(){return`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`}

type Offering={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offs=(ctx.data.offerings??[]) as Offering[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const feat=offs.slice(0,6);
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enrol in one of your courses. Please share more details.`);
  return`${CSS}
<section class="el-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="el-logo"/>`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="el-tagline">${tag?esc(tag):'Learn in-demand skills online. Industry-recognised certificates. Study at your own pace from anywhere in Nigeria.'}</p>
  <div class="el-ctas">
    <a href="/services" class="el-primary-btn">Browse Courses</a>
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="el-wa-btn">${waSvg()} Enrol on WhatsApp</a>`:''}
  </div>
  <div class="el-trust-strip">
    <span class="el-badge"><span class="el-dot"></span>Certificate Issued</span>
    <span class="el-badge"><span class="el-dot"></span>Self-Paced + Live</span>
    <span class="el-badge"><span class="el-dot"></span>Instalment Payment</span>
    <span class="el-badge"><span class="el-dot"></span>WhatsApp Community</span>
    <span class="el-badge"><span class="el-dot"></span>Data-Light Video</span>
  </div>
</section>
${feat.length?`<section class="el-section"><h2 class="el-section-title">Featured Courses</h2><p class="el-section-sub">Start learning today — new cohorts enrolling now</p><div class="el-grid">${feat.map(o=>`<div class="el-card"><h3 class="el-card-name">${esc(o.name)}</h3>${o.description?`<p class="el-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="el-card-price">${fmtKobo(o.priceKobo)}</p>`:`<p class="el-card-enq">Price on enquiry</p>`}${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="el-card-enrol">Enrol Now →</a>`:''}</div>`).join('')}</div>${offs.length>6?`<a href="/services" class="el-see-all">View all courses →</a>`:''}</section>`:''}
${desc?`<div class="el-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(desc.length>220?desc.slice(0,220)+'…':desc)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${(phone||place)?`<div class="el-info-strip">${phone?`<div class="el-info-item"><span class="el-info-label">Support</span><span class="el-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="el-info-item"><span class="el-info-label">Location</span><span class="el-info-value">${esc(place)}</span></div>`:''}<div class="el-info-item"><span class="el-info-label">Enrol Now</span><span class="el-info-value">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const web=(ctx.data.website as string|null)??null;
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I'd like to know more about your online courses and enrollment process.`);
  return`${CSS}
<section class="el-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="el-logo"/>`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="el-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="el-about-body">
  <p class="el-about-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a Nigerian online learning platform delivering industry-relevant courses to students across Nigeria and the diaspora. Our curriculum is designed by industry practitioners and recognised by leading employers.`}</p>
  <div class="el-detail-list">
    ${cat?`<div class="el-detail-row"><span class="el-detail-label">Platform Type</span><span class="el-detail-value">${esc(cat)}</span></div>`:''}
    ${place?`<div class="el-detail-row"><span class="el-detail-label">HQ</span><span class="el-detail-value">${esc(place)}</span></div>`:''}
    ${phone?`<div class="el-detail-row"><span class="el-detail-label">Support</span><span class="el-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${web?`<div class="el-detail-row"><span class="el-detail-label">Platform</span><span class="el-detail-value"><a href="${safeHref(web)}" target="_blank" rel="noopener noreferrer">${esc(web)} ↗</a></span></div>`:''}
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="el-wa-btn">${waSvg()} Enrol on WhatsApp</a>`:`<a class="el-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    <a href="/services" class="el-sec-btn">Browse Courses</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offs=(ctx.data.offerings??[]) as Offering[];
  const phone=(ctx.data.phone as string|null)??null;
  const waHref=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to enquire about enrollment and course fees.`);
  return`${CSS}
<section class="el-services-hero">
  <h1>Our Courses</h1>
  <p style="color:var(--ww-text-muted);max-width:34rem;margin-inline:auto">All courses at ${esc(ctx.displayName)} — with certificates</p>
</section>
${offs.length===0?`<div class="el-empty"><p>Our course catalog is being updated. New cohorts enrolling soon.<br/>Join our WhatsApp to be the first notified.</p><br/>${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="el-wa-btn">${waSvg()} Join WhatsApp Community</a>`:`<a class="el-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`:`<div class="el-grid">${offs.map(o=>`<div class="el-card"><h3 class="el-card-name">${esc(o.name)}</h3>${o.description?`<p class="el-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="el-card-price">${fmtKobo(o.priceKobo)}</p>`:`<p class="el-card-enq">Price on enquiry</p>`}${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="el-card-enrol">Enrol →</a>`:''}</div>`).join('')}</div>`}
<div class="el-bottom-cta"><h3>Not Sure Which Course Is Right for You?</h3><p>Chat with our advisors. We'll help you pick the right path for your career goals.</p><div class="el-btn-row">${waHref?`<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="el-wa-btn">${waSvg()} Get Course Advice</a>`:''}</div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const waHref=waLink(phone,'Hello, I would like to enquire about your online courses and enrollment process.');
  return`${CSS}
<section class="el-contact-hero">
  <h1>Contact ${esc(ctx.displayName)}</h1>
  <p>Enrol, ask questions, or join our learning community</p>
</section>
${waHref?`<div class="el-wa-block"><p>Quickest way to enrol and join our student WhatsApp community:</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="el-wa-btn">${waSvg()} WhatsApp Enrolment</a></div>`:''}
<div class="el-contact-layout">
  <div class="el-contact-info">
    <h2>Student Support</h2>
    ${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}
    ${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}
    ${place?`<p><strong>Address:</strong> ${esc(place)}</p>`:''}
    <p>Support hours: Mon–Fri 8am–6pm WAT</p>
  </div>
  <div class="el-form-wrapper">
    <h2>Send a Message</h2>
    <form class="el-form" action="/api/contact" method="POST">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}"/>
      <div class="el-form-group"><label for="el-name">Full Name</label><input id="el-name" class="el-input" name="name" type="text" placeholder="Your name" required/></div>
      <div class="el-form-group"><label for="el-email">Email</label><input id="el-email" class="el-input" name="email" type="email" placeholder="you@email.com"/></div>
      <div class="el-form-group"><label for="el-msg">Course Interest / Message</label><textarea id="el-msg" class="el-input el-textarea" name="message" placeholder="Which course are you interested in? Any questions?" required></textarea></div>
      <button type="submit" class="el-submit">Send Message</button>
    </form>
  </div>
</div>`;
}

export const elearningPlatformOnlineLearningTemplate:WebsiteTemplateContract={
  slug:'elearning-platform-online-learning',
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
