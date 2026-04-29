/**
 * Okada / Keke Rider Co-operative Platform — Pillar 3 Website Template
 * Niche ID: P3-okada-keke-okada-keke-coop
 * Vertical: okada-keke (priority=3, critical)
 * Category: transport
 * Family: NF-TRP-MIC (standalone)
 * Research brief: docs/templates/research/okada-keke-okada-keke-coop-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: NURTW/RTEAN affiliation, State Ministry of Transport, NAICOM insurance
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function fmtKobo(k: number): string { return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`; }
function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to enquire about joining the co-operative.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ } return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ok-hero{text-align:center;padding:2.75rem 0 2rem}
.ok-logo{height:80px;width:80px;object-fit:contain;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.ok-cat-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ok-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem;letter-spacing:-.02em}
.ok-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:36rem;margin:0 auto 1.75rem;line-height:1.65}
.ok-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ok-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ok-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ok-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.ok-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.ok-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ok-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ok-benefit-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));margin-top:1.5rem}
.ok-benefit-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);border-top:3px solid var(--ww-primary)}
.ok-benefit-icon{font-size:1.5rem;margin-bottom:.5rem}
.ok-benefit-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin-bottom:.25rem}
.ok-benefit-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.55}
.ok-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ok-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.ok-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.ok-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.ok-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.ok-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.ok-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.ok-strip-item{display:flex;flex-direction:column;gap:.2rem}
.ok-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.ok-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.ok-strip-value a{color:var(--ww-primary)}
.ok-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.ok-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.ok-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.ok-contact-layout{grid-template-columns:1fr 1fr}}
.ok-contact-info h2,.ok-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.ok-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.ok-contact-info a{color:var(--ww-primary);font-weight:600}
.ok-form{display:flex;flex-direction:column;gap:.875rem}
.ok-form-group{display:flex;flex-direction:column;gap:.375rem}
.ok-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.ok-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.ok-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.ok-textarea{min-height:100px;resize:vertical}
.ok-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.ok-ndpr a{color:var(--ww-primary)}
.ok-ndpr-check{display:flex;align-items:flex-start;gap:.5rem;margin-top:.5rem}
.ok-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.ok-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.ok-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.ok-submit:hover{filter:brightness(1.1)}
.ok-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.ok-success h3{font-weight:700;margin-bottom:.25rem}
.ok-about-hero{text-align:center;padding:2.5rem 0 2rem}
.ok-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ok-about-body{max-width:44rem;margin:0 auto}
.ok-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:1.5rem;font-size:1rem}
.ok-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.ok-detail-row{display:flex;gap:1rem;align-items:flex-start}
.ok-detail-label{font-size:.875rem;font-weight:700;min-width:8rem;color:var(--ww-text);flex-shrink:0}
.ok-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.ok-detail-value a{color:var(--ww-primary);font-weight:600}
.ok-services-hero{text-align:center;padding:2.5rem 0 2rem}
.ok-services-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ok-services-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.ok-service-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.ok-service-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-top:3px solid var(--ww-primary)}
.ok-service-name{font-size:.9375rem;font-weight:700;color:var(--ww-text);margin:0}
.ok-service-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.ok-service-price{font-size:1rem;font-weight:800;color:var(--ww-primary);margin-top:.25rem}
.ok-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.ok-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.ok-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.ok-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ok-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.ok-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.ok-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.ok-ctas{flex-direction:column;align-items:stretch}.ok-primary-btn,.ok-sec-btn,.ok-wa-btn{width:100%;justify-content:center}}
</style>`;

const BENEFITS = [
  {icon:'🛡️',name:'Government Recognition',desc:'Operate legally under a state-registered co-op. Avoid harassment.'},
  {icon:'🏥',name:'Insurance Cover',desc:'Third-party insurance through NAICOM-approved insurers.'},
  {icon:'📋',name:'Route Permits',desc:'Official route allocation from state transport ministry.'},
  {icon:'📢',name:'WhatsApp Dispatch',desc:'Organised dispatch via co-op broadcast list.'},
  {icon:'⚖️',name:'Dispute Resolution',desc:'Fair resolution of disputes through the co-op chairman.'},
  {icon:'🎓',name:'Safety Training',desc:'FRSC-endorsed road safety training for all members.'},
];

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to join ${ctx.displayName} co-operative. Please share membership details.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="ok-hero">
  ${ctx.logoUrl ? `<img class="ok-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="ok-cat-badge">🛺 Rider Co-operative</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="ok-tagline">${esc(tagline ?? `Organised. Protected. Profitable. Join a registered okada and keke NAPEP co-operative${placeName ? ` in ${placeName}` : ''}.`)}</p>
  <div class="ok-ctas">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ok-wa-btn">${waSvg()} Join via WhatsApp</a>` : ''}
    <a class="ok-primary-btn" href="/services">Membership Details</a>
    <a class="ok-sec-btn" href="/about">Our Co-op</a>
  </div>
</section>
<section style="margin-top:2rem">
  <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.875rem;color:var(--ww-primary)">Why Join Our Co-operative?</h2>
  <div class="ok-benefit-grid">
    ${BENEFITS.map(b => `<div class="ok-benefit-card"><div class="ok-benefit-icon">${b.icon}</div><div class="ok-benefit-name">${esc(b.name)}</div><p class="ok-benefit-desc">${esc(b.desc)}</p></div>`).join('')}
  </div>
</section>
<div class="ok-trust-strip">
  <span class="ok-badge"><span class="ok-dot"></span> NURTW / RTEAN Affiliated</span>
  <span class="ok-badge"><span class="ok-dot"></span> State Ministry Registered</span>
  <span class="ok-badge"><span class="ok-dot"></span> NAICOM Insurance</span>
  <span class="ok-badge"><span class="ok-dot"></span> CAC Co-op Registration</span>
</div>
${bioExcerpt ? `<div class="ok-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bioExcerpt)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more &rarr;</a></div>` : ''}
${(phone || placeName) ? `<div class="ok-contact-strip">
  ${placeName ? `<div class="ok-strip-item"><span class="ok-strip-label">Co-op Office</span><span class="ok-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="ok-strip-item"><span class="ok-strip-label">Chairman's Line</span><span class="ok-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="ok-strip-item"><span class="ok-strip-label">Levy Payment</span><span class="ok-strip-value">Cash · Bank Transfer · Paystack</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I want to know more about joining ${ctx.displayName}.`);
  return `${CSS}
<section class="ok-about-hero"><h1>About ${esc(ctx.displayName)}</h1><p style="color:var(--ww-text-muted);margin-top:.5rem">Ride Together. Grow Together.</p></section>
<div class="ok-about-body">
  <p class="ok-about-desc">${esc(description ?? `${ctx.displayName} is a duly registered okada and keke NAPEP co-operative. We represent the rights and welfare of motorcycle and tricycle riders in our area, providing government recognition, insurance cover, route permits, and organised dispatch. Our riders operate safely, legally, and profitably.`)}</p>
  <div class="ok-detail-list">
    ${placeName ? `<div class="ok-detail-row"><span class="ok-detail-label">Co-op Office</span><span class="ok-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="ok-detail-row"><span class="ok-detail-label">Chairman's Line</span><span class="ok-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="ok-detail-row"><span class="ok-detail-label">Email</span><span class="ok-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="ok-detail-row"><span class="ok-detail-label">Affiliation</span><span class="ok-detail-value">NURTW / RTEAN &amp; State Ministry of Transport</span></div>
    <div class="ok-detail-row"><span class="ok-detail-label">Insurance</span><span class="ok-detail-value">Third-party via NAICOM-approved insurer</span></div>
    <div class="ok-detail-row"><span class="ok-detail-label">Levy Payment</span><span class="ok-detail-value">Cash, Bank Transfer, Paystack</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ok-wa-btn">${waSvg()} Join via WhatsApp</a>` : ''}
    <a class="ok-primary-btn" href="/services">Membership &amp; Levies</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I want to join ${ctx.displayName} and need details about membership fees.`);
  const defaultServices = [
    {name:'Membership Registration',desc:'One-time registration to join the co-op. Includes ID card, vest, and route assignment.',price:'Contact for fee'},
    {name:'Weekly / Monthly Levy',desc:'Contributions support co-op operations, security, and insurance pool.',price:'Contact for levy'},
    {name:'Route Permit Assistance',desc:'We facilitate your route permit application with the state transport ministry.',price:'Included for members'},
    {name:'Third-Party Insurance',desc:'Group insurance through NAICOM-approved insurer for all registered members.',price:'Subsidised for members'},
    {name:'Safety Training',desc:'FRSC-endorsed road safety training. Certificate issued. Required for all members.',price:'Free for members'},
    {name:'Dispute Resolution',desc:'File complaints and resolve disputes through the co-op executive panel.',price:'Free for members'},
  ];
  const grid = offerings.length === 0
    ? `<div class="ok-service-grid">${defaultServices.map(s => `<div class="ok-service-card"><h3 class="ok-service-name">${esc(s.name)}</h3><p class="ok-service-desc">${esc(s.desc)}</p><span class="ok-service-price">${esc(s.price)}</span></div>`).join('')}</div>`
    : `<div class="ok-service-grid">${offerings.map(o => `<div class="ok-service-card"><h3 class="ok-service-name">${esc(o.name)}</h3>${o.description ? `<p class="ok-service-desc">${esc(o.description)}</p>` : ''}${o.priceKobo === null ? `<span class="ok-service-price">Contact for fee</span>` : `<span class="ok-service-price">${fmtKobo(o.priceKobo)}</span>`}</div>`).join('')}</div>`;
  return `${CSS}
<section class="ok-services-hero"><h1>Membership &amp; Services</h1><p class="ok-services-sub">All levies and fees at ${esc(ctx.displayName)} — payable in ₦ (Naira)</p></section>
<section>${grid}</section>
<div class="ok-cta-strip"><h3>Ready to join?</h3><p>WhatsApp us to register. Ride legally, safely, and with the protection of a recognised co-operative.</p>
<div class="ok-btn-row">${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ok-wa-btn">${waSvg()} Register via WhatsApp</a>` : ''}<a class="ok-sec-btn" href="/contact">Visit Co-op Office</a></div></div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello ${ctx.displayName}! I want to register as a member of your co-operative. Please guide me on the process.`);
  return `${CSS}
<section class="ok-contact-hero"><h1>Join the Co-operative</h1><p>Register with ${esc(ctx.displayName)} and ride legally, safely, and profitably.</p></section>
${waHref ? `<div class="ok-wa-block"><p>WhatsApp the co-op chairman to begin your membership registration. We'll guide you through the process.</p><a href="${waHref}" target="_blank" rel="noopener noreferrer" class="ok-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Join via WhatsApp</a></div>` : ''}
<div class="ok-contact-layout">
  <div class="ok-contact-info">
    <h2>Co-op Office</h2>
    ${placeName ? `<p><strong>Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>Chairman's Line:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Office contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Levy Payment: Cash · Bank Transfer · Paystack</p>
    <p style="margin-top:.75rem"><a href="/services" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">View membership information &rarr;</a></p>
  </div>
  <div class="ok-form-wrapper">
    <h2>Registration Enquiry</h2>
    <form class="ok-form" method="POST" action="/contact" id="okContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="ok-form-group"><label for="ok-name">Your name</label><input id="ok-name" name="name" type="text" required autocomplete="name" class="ok-input" placeholder="e.g. Musa Tanko" /></div>
      <div class="ok-form-group"><label for="ok-phone">Phone / WhatsApp</label><input id="ok-phone" name="phone" type="tel" autocomplete="tel" class="ok-input" placeholder="0803 000 0000" /></div>
      <div class="ok-form-group"><label for="ok-vehicle">Vehicle type</label><input id="ok-vehicle" name="vehicle_type" type="text" class="ok-input" placeholder="e.g. Keke NAPEP / Okada (Honda 110)" /></div>
      <div class="ok-form-group"><label for="ok-msg">Your enquiry</label><textarea id="ok-msg" name="message" required rows="3" class="ok-input ok-textarea" placeholder="e.g. I want to register and get my route permit. What documents do I need?"></textarea></div>
      <div class="ok-ndpr"><strong>Privacy notice (NDPR):</strong> Your details are used only to process your membership enquiry. <a href="/privacy">Privacy Policy</a>.<div class="ok-ndpr-check"><input type="checkbox" id="ok-consent" name="ndpr_consent" value="yes" required /><label for="ok-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="ok-submit">Send Enquiry</button>
    </form>
    <div id="okContactSuccess" class="ok-success" style="display:none" role="status" aria-live="polite"><h3>Enquiry received!</h3><p>The co-op secretary will respond with membership details. Welcome aboard!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('okContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('okContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const okadaKekeOkadaKekeCoopTemplate: WebsiteTemplateContract = {
  slug: 'okada-keke-okada-keke-coop',
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
