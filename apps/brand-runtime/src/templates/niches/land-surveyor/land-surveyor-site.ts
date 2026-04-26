/**
 * Land Surveyor Site — Pillar 3 Website Template
 * Niche ID: P3-land-surveyor-land-surveyor-site
 * Vertical: land-surveyor (priority=3, high)
 * Category: professional
 * Family: standalone
 * Research brief: docs/templates/research/land-surveyor-land-surveyor-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: SURCON registration (mandatory); NIS membership; State Ministry of Lands; CAC firm registration
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fmtKobo(kobo: number): string {
  return `\u20A6${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
}

function waLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g, '');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234' + d.slice(1) : '234' + d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like a survey quote.')}`;
}

const CSS = `
<style>
:root{--ls-navy:#002147;--ls-gold:#c9a030;--ls-green:#1a6632;--ls-light:#f4f6f0;--ls-text:#1a2332;--ls-muted:#5a6472;--ls-border:#d1d9e6;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--ls-text);background:#fff;font-size:16px;line-height:1.65;}
.ls-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.ls-nav{background:var(--ls-navy);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.ls-nav-brand{color:#fff;font-size:1.1rem;font-weight:700;text-decoration:none;}
.ls-nav-cta{background:var(--ls-gold);color:var(--ls-navy);padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.85rem;}
.ls-hero{background:linear-gradient(160deg,var(--ls-navy) 0%,var(--ls-green) 100%);color:#fff;padding:4.5rem 1rem 3.5rem;text-align:center;}
.ls-hero-seal{font-size:3rem;margin-bottom:1rem;}
.ls-hero h1{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:700;margin-bottom:.5rem;}
.ls-hero-tagline{opacity:.85;margin-bottom:.5rem;}
.ls-hero-surcon{color:var(--ls-gold);font-size:.9rem;margin-bottom:2rem;}
.ls-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.ls-btn-primary{background:var(--ls-gold);color:var(--ls-navy);}
.ls-btn-outline{border:2px solid #fff;color:#fff;}
.ls-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.ls-surcon-strip{background:var(--ls-gold);color:var(--ls-navy);text-align:center;padding:.6rem;font-size:.85rem;font-weight:600;}
.ls-section{padding:3rem 1rem;}
.ls-section-alt{background:var(--ls-light);}
.ls-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--ls-navy);}
.ls-section-sub{color:var(--ls-muted);margin-bottom:2rem;font-size:.95rem;}
.ls-services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.ls-service-card{background:#fff;border-radius:6px;padding:1.5rem;box-shadow:0 1px 6px rgba(0,0,0,.09);border-left:4px solid var(--ls-gold);}
.ls-service-card h3{font-size:1rem;font-weight:700;color:var(--ls-navy);margin-bottom:.5rem;}
.ls-service-card p{color:var(--ls-muted);font-size:.9rem;}
.ls-service-card .price{margin-top:.5rem;font-weight:700;color:var(--ls-navy);font-size:.9rem;}
.ls-projects{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-top:1rem;}
.ls-project{background:#fff;border-radius:6px;padding:1.25rem;box-shadow:0 1px 5px rgba(0,0,0,.08);border-left:3px solid var(--ls-green);}
.ls-project h4{font-size:.95rem;font-weight:700;color:var(--ls-navy);margin-bottom:.3rem;}
.ls-project p{font-size:.85rem;color:var(--ls-muted);}
.ls-project .loc{font-size:.8rem;color:var(--ls-gold);font-weight:600;}
.ls-wa-strip{background:var(--ls-navy);color:#fff;padding:2.5rem 1rem;text-align:center;border-top:3px solid var(--ls-gold);}
.ls-wa-strip h2{font-size:1.4rem;margin-bottom:.5rem;}
.ls-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.9rem;}
.ls-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.ls-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.ls-contact-box{background:var(--ls-light);padding:1.5rem;border-radius:6px;border:1px solid var(--ls-border);}
.ls-contact-box h3{margin-bottom:1rem;color:var(--ls-navy);font-size:1rem;}
.ls-contact-box a{color:var(--ls-navy);font-weight:600;}
.ls-form{display:flex;flex-direction:column;gap:.75rem;}
.ls-input{padding:.7rem 1rem;border:1px solid var(--ls-border);border-radius:4px;font-size:1rem;width:100%;}
.ls-ndpr{font-size:.8rem;color:var(--ls-muted);}
.ls-submit{background:var(--ls-navy);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.ls-footer{background:var(--ls-navy);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;border-top:3px solid var(--ls-gold);}
.ls-footer a{color:var(--ls-gold);}
@media(max-width:600px){.ls-hero{padding:3rem 1rem 2.5rem;}.ls-hero h1{font-size:1.6rem;}.ls-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Precision You Can Trust. Land You Can Build On.');
  const desc = esc((ctx.data.description as string | null) ?? 'SURCON-registered land surveyors providing Certificate of Occupancy surveys, estate layouts, topographical surveys, and boundary dispute resolution across Nigeria.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const surconNo = esc((ctx.data.surconNumber as string | null) ?? 'SURCON/[XXXX]/[YYYY]');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20a%20survey%20quote.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const servicesHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ls-service-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Request a quote'}</p></div>`).join('')
    : `<div class="ls-service-card"><h3>C-of-O Survey</h3><p>Certificate of Occupancy survey — residential, commercial, and agricultural land.</p><p class="price">From ₦150,000</p></div>
       <div class="ls-service-card"><h3>Estate Layout</h3><p>Full estate subdivision plan with plot numbers, roads, and infrastructure layout.</p><p class="price">From ₦500,000</p></div>
       <div class="ls-service-card"><h3>Topographical Survey</h3><p>Detailed terrain mapping for civil engineering and construction projects.</p><p class="price">Request quote</p></div>
       <div class="ls-service-card"><h3>Beacon / Boundary</h3><p>Beacon planting and boundary demarcation with beacons and survey plan.</p><p class="price">From ₦80,000</p></div>
       <div class="ls-service-card"><h3>Boundary Dispute</h3><p>Expert witness and boundary dispute resolution. Court-acceptable survey reports.</p><p class="price">Request quote</p></div>
       <div class="ls-service-card"><h3>GIS & Drone Mapping</h3><p>GPS/GIS surveys, drone aerial mapping, AutoCAD plans for large-scale projects.</p><p class="price">Request quote</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Land Surveyors | ${city}</title>${CSS}</head><body>
<nav class="ls-nav">
  <a href="/" class="ls-nav-brand">📐 ${name}</a>
  <a href="/contact" class="ls-nav-cta">Get a Quote</a>
</nav>
<div class="ls-surcon-strip">
  ✅ SURCON Registered (${surconNo}) — NIS Member — CAC Registered — State Ministry of Lands Approved
</div>
<section class="ls-hero">
  <div class="ls-hero-seal">📐</div>
  <h1>${name}</h1>
  <p class="ls-hero-tagline">${tagline}</p>
  <p style="max-width:600px;margin:0 auto .75rem;opacity:.8;font-size:.9rem;">${desc}</p>
  <p class="ls-hero-surcon">SURCON Reg. No: ${surconNo} | ${city}</p>
  <div class="ls-hero-btns">
    <a href="${waHref}" class="ls-btn ls-btn-primary" target="_blank" rel="noopener">📱 WhatsApp for Quote</a>
    <a href="/services" class="ls-btn ls-btn-outline">Our Services</a>
  </div>
</section>
<section class="ls-section">
  <div class="ls-container">
    <h2>Survey Services</h2>
    <p class="ls-section-sub">All survey fees in Nigerian Naira (₦). Paystack and bank transfer accepted. Quote provided within 24 hours.</p>
    <div class="ls-services-grid">${servicesHtml}</div>
  </div>
</section>
<section class="ls-section ls-section-alt">
  <div class="ls-container">
    <h2>Recent Projects</h2>
    <p class="ls-section-sub">Selected from our portfolio — residential estates, commercial properties, and agricultural land</p>
    <div class="ls-projects">
      <div class="ls-project"><p class="loc">Lekki Phase 2, Lagos</p><h4>72-Plot Residential Estate Layout</h4><p>Full estate survey, plot delineation, access roads, and site plan submission to Lagos State Ministry of Lands.</p></div>
      <div class="ls-project"><p class="loc">Lugbe, FCT Abuja</p><h4>C-of-O Surveys — 15 Individual Plots</h4><p>Series of residential C-of-O surveys for individual property owners. All survey plans approved by FCT Lands Department.</p></div>
      <div class="ls-project"><p class="loc">Port Harcourt, Rivers State</p><h4>Industrial Site Topographical Survey</h4><p>3.2-hectare topographical survey for a warehousing and logistics facility development.</p></div>
    </div>
  </div>
</section>
<section class="ls-wa-strip">
  <h2>📱 Request a Free Survey Quote</h2>
  <p>WhatsApp us with your location, land size, and survey type. Quote provided within 24 hours. SURCON-certified team.</p>
  <a href="${waHref}" class="ls-wa-btn" target="_blank" rel="noopener">WhatsApp for Quote</a>
</section>
<footer class="ls-footer"><div class="ls-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | SURCON Reg. ${surconNo} | NIS Member | CAC Registered | ${city}</p>
  <p style="margin-top:.5rem;font-size:.8rem;">All surveys comply with SURCON regulations and State Ministry of Lands requirements. NDPR-compliant client data. | <a href="/contact">Contact</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'SURCON-registered land surveying firm serving clients across Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const surconNo = esc((ctx.data.surconNumber as string | null) ?? 'SURCON/[XXXX]/[YYYY]');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="ls-nav"><a href="/" class="ls-nav-brand">📐 ${name}</a><a href="/contact" class="ls-nav-cta">Get a Quote</a></nav>
<div class="ls-surcon-strip">SURCON Registered — ${surconNo}</div>
<section class="ls-hero" style="padding:3rem 1rem 2.5rem;"><div class="ls-hero-seal">📐</div><h1>About ${name}</h1><p class="ls-hero-tagline">Professional Land Surveyors | ${city}</p></section>
<section class="ls-section"><div class="ls-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Firm</h2><p style="margin:1rem 0;color:var(--ls-muted);">${desc}</p>${phone ? `<p><strong>Contact:</strong> ${phone}</p>` : ''}<p><strong>City:</strong> ${city}</p></div>
  <div><h2>Professional Credentials</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--ls-muted);">
    <li>✅ SURCON Registered Surveyor (${surconNo})</li>
    <li>✅ NIS — Nigerian Institution of Surveyors</li>
    <li>✅ CAC firm registration</li>
    <li>✅ State Ministry of Lands approved</li>
    <li>✅ AutoCAD and GIS certified</li>
    <li>✅ Professional indemnity insured</li>
    <li>✅ NDPR-compliant client data policy</li>
  </ul></div>
</div></div></section>
<footer class="ls-footer"><div class="ls-container"><p>&copy; ${new Date().getFullYear()} ${name} | SURCON ${surconNo} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const surconNo = esc((ctx.data.surconNumber as string | null) ?? 'SURCON/[XXXX]/[YYYY]');
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="ls-service-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Request quote'}</p></div>`).join('')
    : `<div class="ls-service-card"><h3>C-of-O Survey</h3><p>Residential and commercial land.</p><p class="price">From ₦150,000</p></div>
       <div class="ls-service-card"><h3>Estate Layout</h3><p>Subdivision plan with plots, roads, infrastructure.</p><p class="price">From ₦500,000</p></div>
       <div class="ls-service-card"><h3>Topographical Survey</h3><p>Terrain mapping for engineering projects.</p><p class="price">Request quote</p></div>
       <div class="ls-service-card"><h3>Beacon Planting</h3><p>Boundary demarcation with survey plan.</p><p class="price">From ₦80,000</p></div>
       <div class="ls-service-card"><h3>Boundary Dispute</h3><p>Expert reports, court-acceptable surveys.</p><p class="price">Request quote</p></div>
       <div class="ls-service-card"><h3>GIS & Drone Mapping</h3><p>Large-scale aerial and GPS surveys.</p><p class="price">Request quote</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Services — ${name}</title>${CSS}</head><body>
<nav class="ls-nav"><a href="/" class="ls-nav-brand">📐 ${name}</a><a href="/contact" class="ls-nav-cta">Get a Quote</a></nav>
<div class="ls-surcon-strip">SURCON Registered — ${surconNo} | Fees in Nigerian Naira (₦)</div>
<section class="ls-hero" style="padding:3rem 1rem 2.5rem;"><h1>Survey Services</h1><p class="ls-hero-tagline">Professional. Accurate. SURCON-Certified.</p></section>
<section class="ls-section"><div class="ls-container"><div class="ls-services-grid">${itemsHtml}</div>
<div style="margin-top:2rem;padding:1rem;background:var(--ls-light);border-radius:6px;font-size:.85rem;color:var(--ls-muted);border:1px solid var(--ls-border);">
  <strong>Payment:</strong> Paystack · Bank transfer | <strong>Turnaround:</strong> 5–15 working days (state dependent) | All surveys comply with SURCON regulations and State Ministry of Lands requirements.
</div></div></section>
<footer class="ls-footer"><div class="ls-container"><p>&copy; ${new Date().getFullYear()} ${name} | SURCON ${surconNo} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const surconNo = esc((ctx.data.surconNumber as string | null) ?? 'SURCON/[XXXX]/[YYYY]');
  const waHref = waLink(phone, 'Hello, I would like a survey quote.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="ls-nav"><a href="/" class="ls-nav-brand">📐 ${name}</a><a href="${waHref}" class="ls-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<div class="ls-surcon-strip">SURCON Registered — ${surconNo}</div>
<section class="ls-hero" style="padding:3rem 1rem 2.5rem;"><div class="ls-hero-seal">📐</div><h1>Request a Survey Quote</h1><p class="ls-hero-tagline">Quote provided within 24 hours. SURCON-certified surveyors.</p></section>
<section class="ls-section"><div class="ls-container"><div class="ls-contact-grid">
  <div class="ls-contact-box">
    <h3>📱 WhatsApp for Quote</h3>
    <p>Message us with: <strong>Location · Land size · Survey type needed</strong>. Quote within 24 hours.</p>
    <a href="${waHref}" class="ls-btn ls-btn-primary" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp for Quote</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Office:</strong> ${city}, Nigeria</p>
    <p><strong>SURCON Reg.:</strong> ${surconNo}</p>
  </div>
  <div class="ls-contact-box">
    <h3>Survey Enquiry Form</h3>
    <form class="ls-form" onsubmit="return false;">
      <input class="ls-input" type="text" placeholder="Full name" autocomplete="name">
      <input class="ls-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <input class="ls-input" type="email" placeholder="Email address" autocomplete="email">
      <input class="ls-input" type="text" placeholder="Property location (LGA, State)">
      <input class="ls-input" type="text" placeholder="Approximate land size (e.g. 500sqm, 2 hectares)">
      <select class="ls-input"><option value="">-- Survey type needed --</option><option>C-of-O Survey</option><option>Estate Layout</option><option>Topographical Survey</option><option>Beacon/Boundary Planting</option><option>Boundary Dispute Report</option><option>GIS / Drone Mapping</option><option>Other (describe below)</option></select>
      <textarea class="ls-input" rows="3" placeholder="Additional details about your project..."></textarea>
      <div><input type="checkbox" id="ndpr-ls" required> <label for="ndpr-ls" class="ls-ndpr">I consent to ${name} processing my contact and property details for this survey enquiry, in accordance with Nigeria's NDPR and our data protection policy.</label></div>
      <button class="ls-submit" type="submit">Request Quote</button>
    </form>
  </div>
</div></div></section>
<footer class="ls-footer"><div class="ls-container"><p>&copy; ${new Date().getFullYear()} ${name} | SURCON ${surconNo} | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const landSurveyorLandSurveyorSiteTemplate: WebsiteTemplateContract = {
  slug: 'land-surveyor-land-surveyor-site',
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'],
  renderPage(ctx: WebsiteRenderContext): string {
    switch (ctx.pageType) {
      case 'home': return renderHome(ctx);
      case 'about': return renderAbout(ctx);
      case 'services': return renderServices(ctx);
      case 'contact': return renderContact(ctx);
      default: return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
    }
  },
};
