/**
 * Borehole Driller Site — Pillar 3 Website Template
 * Niche ID: P3-borehole-driller-borehole-drilling
 * Vertical: borehole-driller (priority=3, high)
 * Category: construction
 * Family: standalone
 * Research brief: docs/templates/research/borehole-driller-borehole-drilling-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: COREN registration (Council for the Regulation of Engineering in Nigeria); state drilling contractor licence; NESREA EIA; NAFDAC/WHO water quality; NDPR for client data
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need a borehole drilling quote.')}`;
}

const CSS = `
<style>
:root{--bd-blue:#00529b;--bd-earth:#7a5c1e;--bd-sky:#e8f4fd;--bd-light:#f5f8fc;--bd-text:#1a2332;--bd-muted:#4a6080;--bd-border:#b8cde0;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--bd-text);background:#fff;font-size:16px;line-height:1.65;}
.bd-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.bd-nav{background:#0a1929;padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.bd-nav-brand{color:#fff;font-size:1.1rem;font-weight:700;text-decoration:none;}
.bd-nav-cta{background:var(--bd-blue);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.85rem;}
.bd-hero{background:linear-gradient(160deg,#0a1929 0%,var(--bd-blue) 70%,#1a6b9e 100%);color:#fff;padding:4.5rem 1rem 3.5rem;text-align:center;}
.bd-hero-icon{font-size:3rem;margin-bottom:1rem;}
.bd-hero h1{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:700;margin-bottom:.5rem;}
.bd-hero-tagline{opacity:.85;margin-bottom:.5rem;font-size:.95rem;}
.bd-hero-coren{color:#88ccff;font-size:.85rem;margin-bottom:2rem;}
.bd-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:5px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.bd-btn-primary{background:var(--bd-blue);color:#fff;}
.bd-btn-wa{background:#25D366;color:#fff;}
.bd-btn-outline{border:2px solid #fff;color:#fff;}
.bd-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.bd-coren-strip{background:var(--bd-blue);color:#fff;text-align:center;padding:.55rem;font-size:.83rem;font-weight:600;}
.bd-section{padding:3rem 1rem;}
.bd-section-alt{background:var(--bd-light);}
.bd-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--bd-text);}
.bd-section-sub{color:var(--bd-muted);margin-bottom:2rem;}
.bd-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;}
.bd-service{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 1px 6px rgba(0,82,155,.1);border-left:4px solid var(--bd-blue);}
.bd-service .icon{font-size:1.8rem;margin-bottom:.5rem;}
.bd-service h3{font-size:1rem;font-weight:700;color:var(--bd-text);margin-bottom:.3rem;}
.bd-service p{font-size:.9rem;color:var(--bd-muted);}
.bd-service .price{margin-top:.5rem;font-weight:700;color:var(--bd-blue);font-size:.9rem;}
.bd-process{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;counter-reset:step;}
.bd-step{background:#fff;border-radius:8px;padding:1.5rem;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.07);counter-increment:step;}
.bd-step::before{content:counter(step);display:block;width:40px;height:40px;background:var(--bd-blue);color:#fff;border-radius:50%;font-weight:800;font-size:1.2rem;line-height:40px;margin:0 auto .75rem;}
.bd-step h4{font-size:.9rem;font-weight:700;color:var(--bd-text);margin-bottom:.3rem;}
.bd-step p{font-size:.82rem;color:var(--bd-muted);}
.bd-certs{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-top:1rem;}
.bd-cert{background:#fff;border-radius:6px;padding:1rem;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.07);border:2px solid var(--bd-blue);}
.bd-cert .icon{font-size:1.3rem;margin-bottom:.3rem;}
.bd-cert h4{font-size:.82rem;font-weight:700;color:var(--bd-text);}
.bd-cert p{font-size:.75rem;color:var(--bd-muted);}
.bd-wa-strip{background:#0a1929;color:#fff;padding:2.5rem 1rem;text-align:center;border-top:3px solid var(--bd-blue);}
.bd-wa-strip h2{font-size:1.4rem;margin-bottom:.5rem;}
.bd-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.9rem;}
.bd-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.bd-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.bd-contact-box{background:var(--bd-light);padding:1.5rem;border-radius:8px;border:1px solid var(--bd-border);}
.bd-contact-box h3{margin-bottom:1rem;color:var(--bd-text);font-size:1rem;}
.bd-contact-box a{color:var(--bd-blue);font-weight:600;}
.bd-form{display:flex;flex-direction:column;gap:.75rem;}
.bd-input{padding:.7rem 1rem;border:1px solid var(--bd-border);border-radius:4px;font-size:1rem;width:100%;}
.bd-ndpr{font-size:.8rem;color:var(--bd-muted);}
.bd-submit{background:var(--bd-blue);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.bd-footer{background:#0a1929;color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;border-top:3px solid var(--bd-blue);}
.bd-footer a{color:#88ccff;}
@media(max-width:600px){.bd-hero{padding:3rem 1rem 2.5rem;}.bd-hero h1{font-size:1.6rem;}.bd-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Clean Water. Every Day. COREN-Certified Borehole Engineers.');
  const desc = esc((ctx.data.description as string | null) ?? 'COREN-registered borehole drilling engineers providing clean water solutions for estates, schools, churches, hospitals, and industries across Nigeria. Expert in deep borehole drilling, solar borehole systems, and water treatment.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const corenNo = esc((ctx.data.corenNumber as string | null) ?? 'COREN/[XXXX]');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20need%20a%20borehole%20drilling%20quote.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const servicesHtml = offerings.length > 0
    ? offerings.map(o => `<div class="bd-service"><div class="icon">💧</div><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="price">${o.priceKobo !== null ? `From ${fmtKobo(o.priceKobo)}` : 'Request a quote'}</p></div>`).join('')
    : `<div class="bd-service"><div class="icon">🌊</div><h3>Deep Borehole Drilling</h3><p>50m–200m+ depth. Casing installation, gravel packing, and pump installation. For estates, schools, churches.</p><p class="price">From ₦1,500,000</p></div>
       <div class="bd-service"><div class="icon">☀️</div><h3>Solar Borehole System</h3><p>Solar panels + submersible pump + elevated tank. Off-grid water solution for rural and estate use.</p><p class="price">From ₦2,500,000</p></div>
       <div class="bd-service"><div class="icon">🔧</div><h3>Borehole Rehabilitation</h3><p>Repair and cleaning of failed or low-yielding boreholes. Pump replacement, casing repair.</p><p class="price">From ₦350,000</p></div>
       <div class="bd-service"><div class="icon">🏗️</div><h3>Overhead / Ground Tank</h3><p>Elevated galvanised or plastic tanks. 10,000L–100,000L capacity. Structure and installation.</p><p class="price">From ₦800,000</p></div>
       <div class="bd-service"><div class="icon">🧪</div><h3>Water Treatment</h3><p>Iron filter, UV disinfection, reverse osmosis — meeting NAFDAC/WHO water quality standards.</p><p class="price">From ₦250,000</p></div>
       <div class="bd-service"><div class="icon">🗺️</div><h3>Hydrogeological Survey</h3><p>Geophysical resistivity survey to identify optimal drilling location. Reduces dry hole risk.</p><p class="price">From ₦150,000</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Borehole Drilling | ${city}</title>${CSS}</head><body>
<nav class="bd-nav">
  <a href="/" class="bd-nav-brand">💧 ${name}</a>
  <a href="${waHref}" class="bd-nav-cta" target="_blank" rel="noopener">📱 Get Free Quote</a>
</nav>
<div class="bd-coren-strip">
  ✅ COREN Registered Engineers (${corenNo}) &nbsp;|&nbsp; State Drilling Contractor Licence &nbsp;|&nbsp; Water Quality Certified &nbsp;|&nbsp; ${city}
</div>
<section class="bd-hero">
  <div class="bd-hero-icon">💧</div>
  <h1>${name}</h1>
  <p class="bd-hero-tagline">${tagline}</p>
  <p style="max-width:600px;margin:0 auto .75rem;opacity:.8;font-size:.9rem;">${desc}</p>
  <p class="bd-hero-coren">COREN Reg. ${corenNo} | ${city} | Free site visit & quote</p>
  <div class="bd-hero-btns">
    <a href="${waHref}" class="bd-btn bd-btn-wa" target="_blank" rel="noopener">📱 WhatsApp for Free Quote</a>
    <a href="/services" class="bd-btn bd-btn-outline">Our Services</a>
  </div>
</section>
<section class="bd-section">
  <div class="bd-container">
    <h2>Borehole & Water Services</h2>
    <p class="bd-section-sub">All fees in Nigerian Naira (₦). Paystack and bank transfer accepted. Mobilisation fee upfront, balance on completion.</p>
    <div class="bd-services">${servicesHtml}</div>
  </div>
</section>
<section class="bd-section bd-section-alt">
  <div class="bd-container">
    <h2>How It Works</h2>
    <p class="bd-section-sub">From your WhatsApp inquiry to clean water flowing — typically 5–10 working days</p>
    <div class="bd-process">
      <div class="bd-step"><h4>WhatsApp Enquiry</h4><p>Send location, intended use, and depth estimate. Free quote within 24 hours.</p></div>
      <div class="bd-step"><h4>Site Visit</h4><p>Our engineer visits for geophysical survey and site assessment. Free of charge.</p></div>
      <div class="bd-step"><h4>Quote & Contract</h4><p>Fixed-price contract. Mobilisation fee paid. Drilling schedule agreed.</p></div>
      <div class="bd-step"><h4>Drilling & Casing</h4><p>Rig mobilised. Drilling, casing, gravel packing, and pump installation done.</p></div>
      <div class="bd-step"><h4>Water Test</h4><p>Water quality test (NAFDAC/WHO standards). Test certificate provided.</p></div>
    </div>
  </div>
</section>
<section class="bd-section">
  <div class="bd-container">
    <h2>Our Credentials</h2>
    <p class="bd-section-sub">COREN-certified. Fully licensed. Insured. Experienced across Nigeria.</p>
    <div class="bd-certs">
      <div class="bd-cert"><div class="icon">🏛️</div><h4>COREN Registered</h4><p>${corenNo}</p></div>
      <div class="bd-cert"><div class="icon">📋</div><h4>State Drilling Licence</h4><p>State-specific contractor licence</p></div>
      <div class="bd-cert"><div class="icon">🧪</div><h4>Water Quality</h4><p>NAFDAC/WHO certified testing</p></div>
      <div class="bd-cert"><div class="icon">🔧</div><h4>Modern Rig Fleet</h4><p>150m–300m depth capability</p></div>
      <div class="bd-cert"><div class="icon">🌿</div><h4>NESREA Compliant</h4><p>Environmental compliance</p></div>
      <div class="bd-cert"><div class="icon">🛡️</div><h4>Professional Indemnity</h4><p>Project insurance covered</p></div>
    </div>
  </div>
</section>
<section class="bd-wa-strip">
  <h2>📱 Get a Free Borehole Quote</h2>
  <p>WhatsApp us with your location, intended use (estate, church, school, factory), and approximate depth needed. Free quote and site visit within 48 hours.</p>
  <a href="${waHref}" class="bd-wa-btn" target="_blank" rel="noopener">WhatsApp for Free Quote</a>
</section>
<footer class="bd-footer"><div class="bd-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | COREN Reg. ${corenNo} | State Drilling Licence | ${city}</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Payment: Paystack · Bank transfer | Water quality certified (NAFDAC/WHO standards) | NDPR-compliant client data | <a href="/contact">Contact</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'COREN-registered borehole drilling engineers providing clean water solutions across Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const corenNo = esc((ctx.data.corenNumber as string | null) ?? 'COREN/[XXXX]');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="bd-nav"><a href="/" class="bd-nav-brand">💧 ${name}</a><a href="/contact" class="bd-nav-cta">Get a Quote</a></nav>
<div class="bd-coren-strip">COREN Registered — ${corenNo} | State Drilling Licence | Water Quality Certified</div>
<section class="bd-hero" style="padding:3rem 1rem 2.5rem;"><div class="bd-hero-icon">💧</div><h1>About ${name}</h1><p class="bd-hero-tagline">COREN-Certified Borehole Engineers | ${city}</p></section>
<section class="bd-section"><div class="bd-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Firm</h2><p style="margin:1rem 0;color:var(--bd-muted);">${desc}</p>${phone ? `<p><strong>Contact:</strong> ${phone}</p>` : ''}<p><strong>City:</strong> ${city}</p></div>
  <div><h2>Credentials & Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--bd-muted);">
    <li>✅ COREN Registered (${corenNo})</li>
    <li>✅ State drilling contractor licence</li>
    <li>✅ NAFDAC/WHO water quality certification</li>
    <li>✅ NESREA environmental compliance</li>
    <li>✅ Professional indemnity insurance</li>
    <li>✅ Modern rig fleet (150m–300m depth)</li>
    <li>✅ NDPR-compliant client data policy</li>
  </ul></div>
</div></div></section>
<footer class="bd-footer"><div class="bd-container"><p>&copy; ${new Date().getFullYear()} ${name} | COREN ${corenNo} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const corenNo = esc((ctx.data.corenNumber as string | null) ?? 'COREN/[XXXX]');
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="bd-service"><div class="icon">💧</div><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="price">${o.priceKobo !== null ? `From ${fmtKobo(o.priceKobo)}` : 'Request quote'}</p></div>`).join('')
    : `<div class="bd-service"><div class="icon">🌊</div><h3>Deep Borehole Drilling</h3><p>50m–200m+ depth. Full installation.</p><p class="price">From ₦1,500,000</p></div>
       <div class="bd-service"><div class="icon">☀️</div><h3>Solar Borehole System</h3><p>Solar + pump + tank. Off-grid water.</p><p class="price">From ₦2,500,000</p></div>
       <div class="bd-service"><div class="icon">🔧</div><h3>Borehole Rehabilitation</h3><p>Repair of failed or low-yield boreholes.</p><p class="price">From ₦350,000</p></div>
       <div class="bd-service"><div class="icon">🧪</div><h3>Water Treatment</h3><p>Iron filter, UV, reverse osmosis systems.</p><p class="price">From ₦250,000</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Services — ${name}</title>${CSS}</head><body>
<nav class="bd-nav"><a href="/" class="bd-nav-brand">💧 ${name}</a><a href="/contact" class="bd-nav-cta">Get a Quote</a></nav>
<div class="bd-coren-strip">COREN Registered — ${corenNo} | All prices in NGN | Free site visit & quote</div>
<section class="bd-hero" style="padding:3rem 1rem 2.5rem;"><h1>Borehole Services</h1><p class="bd-hero-tagline">Drilling · Solar Systems · Rehabilitation · Water Treatment</p></section>
<section class="bd-section"><div class="bd-container"><div class="bd-services">${itemsHtml}</div>
<div style="margin-top:2rem;padding:1rem;background:var(--bd-light);border-radius:8px;font-size:.85rem;color:var(--bd-muted);border:1px solid var(--bd-border);">
  <strong>Payment:</strong> Paystack · Bank transfer | Mobilisation fee then balance on completion | NAFDAC/WHO water quality test certificate provided with every borehole
</div></div></section>
<footer class="bd-footer"><div class="bd-container"><p>&copy; ${new Date().getFullYear()} ${name} | COREN ${corenNo} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const corenNo = esc((ctx.data.corenNumber as string | null) ?? 'COREN/[XXXX]');
  const waHref = waLink(phone, 'Hello, I need a borehole drilling quote. Please advise.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Get a Quote — ${name}</title>${CSS}</head><body>
<nav class="bd-nav"><a href="/" class="bd-nav-brand">💧 ${name}</a><a href="${waHref}" class="bd-nav-cta" target="_blank" rel="noopener">📱 WhatsApp</a></nav>
<div class="bd-coren-strip">COREN Registered — ${corenNo} | Free Quote & Site Visit</div>
<section class="bd-hero" style="padding:3rem 1rem 2.5rem;"><div class="bd-hero-icon">💧</div><h1>Get a Free Borehole Quote</h1><p class="bd-hero-tagline">Site visit and quote within 48 hours. COREN-certified engineers.</p></section>
<section class="bd-section"><div class="bd-container"><div class="bd-contact-grid">
  <div class="bd-contact-box">
    <h3>📱 WhatsApp for Free Quote</h3>
    <p>Send us your: <strong>Location · Type of property · Approximate depth needed · Intended use</strong>. Quote within 24 hours.</p>
    <a href="${waHref}" class="bd-btn bd-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp for Free Quote</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Office:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}, Nigeria</p>
    <p><strong>COREN Reg.:</strong> ${corenNo}</p>
  </div>
  <div class="bd-contact-box">
    <h3>Borehole Project Enquiry</h3>
    <form class="bd-form" onsubmit="return false;">
      <input class="bd-input" type="text" placeholder="Your name or company name" autocomplete="name">
      <input class="bd-input" type="tel" placeholder="Phone number (WhatsApp preferred)" autocomplete="tel">
      <input class="bd-input" type="email" placeholder="Email address" autocomplete="email">
      <input class="bd-input" type="text" placeholder="Project location (LGA, State)">
      <select class="bd-input"><option value="">-- Property type --</option><option>Residential estate</option><option>Commercial property</option><option>Church / School</option><option>Hospital / Clinic</option><option>Factory / Industry</option><option>Individual residence</option></select>
      <select class="bd-input"><option value="">-- Service needed --</option><option>New deep borehole drilling</option><option>Solar borehole system</option><option>Borehole rehabilitation</option><option>Overhead/ground tank installation</option><option>Water treatment system</option><option>Hydrogeological survey</option></select>
      <input class="bd-input" type="text" placeholder="Estimated depth (if known, e.g. 100m)">
      <textarea class="bd-input" rows="2" placeholder="Any other details about your project..."></textarea>
      <div><input type="checkbox" id="ndpr-bd" required> <label for="ndpr-bd" class="bd-ndpr">I consent to ${name} processing my project and contact details for this quote enquiry, in accordance with Nigeria's NDPR.</label></div>
      <button class="bd-submit" type="submit">Request Free Quote</button>
    </form>
  </div>
</div></div></section>
<footer class="bd-footer"><div class="bd-container"><p>&copy; ${new Date().getFullYear()} ${name} | COREN ${corenNo} | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const boreholeDrillerBoreholeDrillingTemplate: WebsiteTemplateContract = {
  slug: 'borehole-driller-borehole-drilling',
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
