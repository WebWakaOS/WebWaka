/**
 * Supermarket / Grocery Store Site — NF-GRC anchor (VN-GRC-001)
 * Pillar 2 — P2-supermarket-grocery-store · Milestone M9 · HIGH
 *
 * Nigeria-First:
 *   • NAFDAC compliance badge — food safety
 *   • "Order for Delivery" WhatsApp CTA — grocery delivery via WhatsApp is common
 *   • Product categories as offerings; null → "Price varies" (market fluctuation)
 *   • Home delivery note — "We deliver within [City]"
 *   • Standard vs express delivery options
 *   • FMCG brands context: Dangote, Indomie, Peak milk, Golden Morn, Milo
 *   • "Fresh produce daily" trust signal
 *   • "No expired products" — Nigerian supermarket trust concern
 *   • Minimum order note for delivery
 *
 * CSS namespace: .sm-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to order groceries for delivery. Please share your product list and delivery areas.')}`}
function safeHref(u:string){try{const p=new URL(u,'https://x');if(p.protocol==='http:'||p.protocol==='https:')return encodeURI(u);}catch{/**/}return '#'}

const CSS=`<style>
.sm-hero{text-align:center;padding:2.75rem 0 2rem}
.sm-logo{height:80px;width:80px;object-fit:contain;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.sm-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.sm-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.sm-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.sm-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.sm-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.sm-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.sm-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.sm-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.sm-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.sm-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.sm-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.sm-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:1rem}
.sm-section{margin-top:2.75rem}
.sm-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.sm-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.sm-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.sm-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.sm-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.sm-card-price{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:.375rem 0 0}
.sm-card-varies{font-size:.8125rem;color:var(--ww-text-muted);font-style:italic;margin:.375rem 0 0}
.sm-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.sm-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.sm-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.sm-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.sm-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.sm-info-item{display:flex;flex-direction:column;gap:.25rem}
.sm-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.sm-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.sm-info-value a{color:var(--ww-primary)}
.sm-about-hero{text-align:center;padding:2.5rem 0 2rem}
.sm-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sm-body{max-width:44rem;margin:0 auto}
.sm-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.sm-details{display:flex;flex-direction:column;gap:.875rem;margin-bottom:2rem}
.sm-drow{display:flex;gap:1rem;align-items:flex-start}
.sm-dlabel{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.sm-dvalue{font-size:.9375rem;color:var(--ww-text-muted)}
.sm-dvalue a{color:var(--ww-primary);font-weight:600}
.sm-btn-row{display:flex;flex-wrap:wrap;gap:.75rem}
.sm-svc-hero{text-align:center;padding:2.5rem 0 2rem}
.sm-svc-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sm-sub{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1.5rem}
.sm-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.sm-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border-radius:var(--ww-radius);border:1px solid var(--ww-border);text-align:center}
.sm-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.sm-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.sm-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.sm-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem;letter-spacing:-.01em}
.sm-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
.sm-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.sm-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.sm-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.sm-layout{grid-template-columns:1fr 1fr}}
.sm-info h2,.sm-form-wrap h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.sm-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.sm-info a{color:var(--ww-primary);font-weight:600}
.sm-form{display:flex;flex-direction:column;gap:.875rem}
.sm-fg{display:flex;flex-direction:column;gap:.375rem}
.sm-fg label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.sm-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.sm-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.sm-ta{min-height:100px;resize:vertical}
.sm-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.sm-submit:hover{filter:brightness(1.1)}
.sm-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.sm-success h3{font-weight:700;margin-bottom:.25rem}
@media(max-width:375px){.sm-ctas{flex-direction:column;align-items:stretch}.sm-wa-btn,.sm-sec-btn{width:100%;justify-content:center}}
</style>`;

const waSvg=()=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;
const bagSvg=()=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;

type Offer={name:string;description:string|null;priceKobo:number|null};

function renderHome(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const desc=(ctx.data.description as string|null)??null;
  const tag=(ctx.data.tagline as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const featured=offers.slice(0,6);const hasMore=offers.length>6;
  const bio=desc?(desc.length>200?desc.slice(0,200).trimEnd()+'…':desc):null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order groceries for delivery. Please share your product list and delivery areas.`);
  return `${CSS}
<section class="sm-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="sm-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="sm-tagline">${tag?esc(tag):'Your neighbourhood supermarket — fresh produce, groceries, and household essentials. Order on WhatsApp for home delivery.'}</p>
  <div class="sm-ctas">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="sm-wa-btn">${waSvg()} Order for Delivery</a>`:`<a class="sm-wa-btn" href="/contact">${waSvg()} Order Now</a>`}
    <a href="/services" class="sm-sec-btn">${bagSvg()} View Products</a>
  </div>
  <div class="sm-trust-strip">
    <span class="sm-badge"><span class="sm-dot"></span>NAFDAC Compliant</span>
    <span class="sm-badge"><span class="sm-dot"></span>No Expired Products</span>
    <span class="sm-badge"><span class="sm-dot"></span>Fresh Produce Daily</span>
  </div>
  <p class="sm-avail">Home delivery available · WhatsApp order = fastest way to shop</p>
</section>
${featured.length?`<section class="sm-section"><h2 class="sm-section-title">Product Categories</h2><div class="sm-grid">${featured.map(o=>`<div class="sm-card"><h3 class="sm-card-name">${esc(o.name)}</h3>${o.description?`<p class="sm-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="sm-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="sm-card-varies">Price varies</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="sm-see-all">View all products →</a>`:''}</section>`:''}
${bio?`<div class="sm-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
${phone||place?`<div class="sm-info-strip">${phone?`<div class="sm-info-item"><span class="sm-info-label">Phone</span><span class="sm-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="sm-info-item"><span class="sm-info-label">Store Location</span><span class="sm-info-value">${esc(place)}</span></div>`:''}<div class="sm-info-item"><span class="sm-info-label">Order</span><span class="sm-info-value">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact us →</a>`}</span></div></div>`:''}`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const cat=(ctx.data.category as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const site=(ctx.data.website as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order groceries.`);
  return `${CSS}
<section class="sm-about-hero">
  ${ctx.logoUrl?`<img src="${encodeURI(ctx.logoUrl)}" alt="${esc(ctx.displayName)}" class="sm-logo" />`:''}
  <h1>${esc(ctx.displayName)}</h1>
  ${cat?`<span class="sm-cat-badge">${esc(cat)}</span>`:''}
</section>
<div class="sm-body">
  <p class="sm-desc">${desc?esc(desc):`${esc(ctx.displayName)} is a NAFDAC-compliant Nigerian supermarket stocking fresh produce, groceries, beverages, household essentials, and personal care products. We offer home delivery via WhatsApp for your convenience.`}</p>
  <div class="sm-details">
    ${cat?`<div class="sm-drow"><span class="sm-dlabel">Store Type</span><span class="sm-dvalue">${esc(cat)}</span></div>`:''}
    ${place?`<div class="sm-drow"><span class="sm-dlabel">Location</span><span class="sm-dvalue">${esc(place)}</span></div>`:''}
    ${phone?`<div class="sm-drow"><span class="sm-dlabel">Phone</span><span class="sm-dvalue"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''}
    ${site?`<div class="sm-drow"><span class="sm-dlabel">Website</span><span class="sm-dvalue"><a href="${safeHref(site)}" target="_blank" rel="noopener noreferrer">${esc(site)} ↗</a></span></div>`:''}
  </div>
  <div class="sm-btn-row">
    ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="sm-wa-btn">${waSvg()} Order Now</a>`:`<a class="sm-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}
    <a href="/services" class="sm-sec-btn">${bagSvg()} View Products</a>
  </div>
</div>`;
}

function renderServices(ctx:WebsiteRenderContext):string{
  const offers=(ctx.data.offerings??[]) as Offer[];
  const phone=(ctx.data.phone as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order groceries. Please share your product list.`);
  const content=offers.length===0
    ?`<div class="sm-empty"><p>Our full product list is available on WhatsApp.<br/>Message us to see what is available and to place an order.</p><br/>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="sm-wa-btn">${waSvg()} Order on WhatsApp</a>`:`<a class="sm-wa-btn" href="/contact">${waSvg()} Contact Us</a>`}</div>`
    :`<div class="sm-grid">${offers.map(o=>`<div class="sm-card"><h3 class="sm-card-name">${esc(o.name)}</h3>${o.description?`<p class="sm-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="sm-card-price">From ${fmtKobo(o.priceKobo)}</p>`:`<p class="sm-card-varies">Price varies</p>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="sm-svc-hero"><h1>Products</h1><p class="sm-sub">Groceries and essentials from ${esc(ctx.displayName)}</p></section>
<section>${content}</section>
<div class="sm-cta-strip"><h3>Ready to place an order?</h3><p>WhatsApp us your shopping list and we will arrange delivery or in-store pickup.</p><div class="sm-btn-row" style="justify-content:center">${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="sm-wa-btn">${waSvg()} Order on WhatsApp</a>`:`<a class="sm-wa-btn" href="/contact">${waSvg()} Order Now</a>`}<a href="/contact" class="sm-sec-btn">Other Enquiries</a></div></div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const email=(ctx.data.email as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const wa=waLink(phone,`Hello ${esc(ctx.displayName)}, I would like to order groceries for delivery. Please share your product list.`);
  return `${CSS}
<section class="sm-contact-hero"><h1>Order or Contact Us</h1><p>Send your shopping list on WhatsApp or call the store directly.</p></section>
${wa?`<div class="sm-wa-block"><p>List the items you need and your delivery address — we will confirm availability and delivery time.</p><a href="${wa}" target="_blank" rel="noopener noreferrer" class="sm-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Order on WhatsApp</a></div>`:''}
<div class="sm-layout">
  <div class="sm-info"><h2>Store Details</h2>${place?`<p><strong>Store:</strong> ${esc(place)}</p>`:''}${phone?`<p><strong>Phone:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>`:''}${email?`<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>`:''}${!phone&&!email&&!place?`<p>Contact details coming soon.</p>`:''}<p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Delivery available within our service area. Minimum order may apply. All products are NAFDAC compliant.</p></div>
  <div class="sm-form-wrap"><h2>Send an Enquiry</h2>
    <form class="sm-form" method="POST" action="/contact" id="smForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="sm-fg"><label for="sm-name">Your name</label><input id="sm-name" name="name" type="text" required autocomplete="name" class="sm-input" placeholder="e.g. Amaka Eze" /></div>
      <div class="sm-fg"><label for="sm-phone">Phone number</label><input id="sm-phone" name="phone" type="tel" autocomplete="tel" class="sm-input" placeholder="0803 000 0000" /></div>
      <div class="sm-fg"><label for="sm-msg">Enquiry or shopping list</label><textarea id="sm-msg" name="message" required rows="4" class="sm-input sm-ta" placeholder="e.g. I need Indomie (5 cartons), Peak milk (1 carton), Milo (2 tins). Please deliver to GRA Enugu."></textarea></div>
      <button type="submit" class="sm-submit">Send Enquiry</button>
    </form>
    <div id="smSuccess" class="sm-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>We will respond shortly with pricing and delivery details. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('smForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('smSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const supermarketGroceryStoreTemplate:WebsiteTemplateContract={
  slug:'supermarket-grocery-store',
  version:'1.0.0',
  pages:['home','about','services','contact'],
  renderPage(ctx:WebsiteRenderContext):string{
    try{
      switch(ctx.pageType){
        case 'home':return renderHome(ctx);
        case 'about':return renderAbout(ctx);
        case 'services':return renderServices(ctx);
        case 'contact':return renderContact(ctx);
        default:return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    }catch{return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Unable to load page.</p>`}
  },
};
