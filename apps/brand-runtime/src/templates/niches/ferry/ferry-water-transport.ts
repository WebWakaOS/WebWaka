/**
 * Ferry & Water Transport — Pillar 3 Website Template
 * Niche ID: P3-ferry-ferry-water-transport
 * Vertical: ferry (priority=3, high)
 * Category: transport
 * Family: standalone
 * Research brief: docs/templates/research/ferry-ferry-water-transport-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: NIWA licence; NIMASA vessel certification; LASWA permit (Lagos); IMO safety standards; NDPR for booking data
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to book a ferry journey.')}`;
}

const CSS = `
<style>
:root{--fw-blue:#003580;--fw-teal:#00a8cc;--fw-ocean:#001a3d;--fw-light:#f0f8ff;--fw-text:#0d1b2a;--fw-muted:#4a6080;--fw-border:#b0c8e0;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--fw-text);background:#fff;font-size:16px;line-height:1.65;}
.fw-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.fw-nav{background:var(--fw-ocean);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.fw-nav-brand{color:#fff;font-size:1.1rem;font-weight:700;text-decoration:none;display:flex;align-items:center;gap:.5rem;}
.fw-nav-cta{background:var(--fw-teal);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.85rem;}
.fw-hero{background:linear-gradient(160deg,var(--fw-ocean) 0%,var(--fw-blue) 60%,var(--fw-teal) 100%);color:#fff;padding:4.5rem 1rem 3.5rem;text-align:center;}
.fw-hero-icon{font-size:3.5rem;margin-bottom:1rem;}
.fw-hero h1{font-size:clamp(1.8rem,5vw,2.5rem);font-weight:800;margin-bottom:.5rem;}
.fw-hero-tagline{opacity:.85;margin-bottom:.5rem;}
.fw-hero-niwa{color:#88ddff;font-size:.85rem;margin-bottom:2rem;}
.fw-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:5px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.fw-btn-primary{background:var(--fw-teal);color:#fff;}
.fw-btn-wa{background:#25D366;color:#fff;}
.fw-btn-outline{border:2px solid #fff;color:#fff;}
.fw-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.fw-safety-strip{background:var(--fw-teal);color:#fff;text-align:center;padding:.55rem;font-size:.83rem;font-weight:600;}
.fw-section{padding:3rem 1rem;}
.fw-section-alt{background:var(--fw-light);}
.fw-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--fw-ocean);}
.fw-section-sub{color:var(--fw-muted);margin-bottom:2rem;}
.fw-routes{display:grid;gap:1rem;margin-top:1rem;}
.fw-route{background:#fff;border-radius:8px;padding:1.1rem 1.4rem;box-shadow:0 1px 6px rgba(0,53,128,.1);display:grid;grid-template-columns:1fr auto auto;gap:1rem;align-items:center;border-left:4px solid var(--fw-teal);}
.fw-route-info h4{font-size:.95rem;font-weight:700;color:var(--fw-ocean);}
.fw-route-info p{font-size:.8rem;color:var(--fw-muted);}
.fw-route-departs{text-align:center;font-size:.85rem;color:var(--fw-blue);font-weight:700;}
.fw-route-departs span{display:block;font-size:.75rem;color:var(--fw-muted);font-weight:400;}
.fw-route-fare{background:var(--fw-blue);color:#fff;border-radius:4px;padding:.4rem .8rem;font-weight:700;font-size:.9rem;white-space:nowrap;}
.fw-fleet{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;margin-top:1rem;}
.fw-vessel{background:#fff;border-radius:8px;padding:1.25rem;box-shadow:0 1px 6px rgba(0,53,128,.1);border-top:3px solid var(--fw-teal);}
.fw-vessel .type{font-size:.75rem;color:var(--fw-teal);font-weight:700;text-transform:uppercase;letter-spacing:.5px;}
.fw-vessel h3{font-size:1rem;font-weight:700;color:var(--fw-ocean);margin:.3rem 0;}
.fw-vessel p{font-size:.85rem;color:var(--fw-muted);}
.fw-vessel .capacity{margin-top:.4rem;font-size:.8rem;font-weight:700;color:var(--fw-blue);}
.fw-safety{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:1rem;margin-top:1rem;}
.fw-safety-badge{background:#fff;border-radius:6px;padding:1rem;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.07);border:2px solid var(--fw-teal);}
.fw-safety-badge .icon{font-size:1.5rem;margin-bottom:.3rem;}
.fw-safety-badge h4{font-size:.8rem;font-weight:700;color:var(--fw-ocean);}
.fw-safety-badge p{font-size:.75rem;color:var(--fw-muted);}
.fw-wa-strip{background:var(--fw-ocean);color:#fff;padding:2.5rem 1rem;text-align:center;border-top:3px solid var(--fw-teal);}
.fw-wa-strip h2{font-size:1.4rem;margin-bottom:.5rem;}
.fw-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.9rem;}
.fw-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.fw-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.fw-contact-box{background:var(--fw-light);padding:1.5rem;border-radius:8px;border:1px solid var(--fw-border);}
.fw-contact-box h3{margin-bottom:1rem;color:var(--fw-ocean);font-size:1rem;}
.fw-contact-box a{color:var(--fw-blue);font-weight:600;}
.fw-form{display:flex;flex-direction:column;gap:.75rem;}
.fw-input{padding:.7rem 1rem;border:1px solid var(--fw-border);border-radius:4px;font-size:1rem;width:100%;}
.fw-ndpr{font-size:.8rem;color:var(--fw-muted);}
.fw-submit{background:var(--fw-blue);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.fw-footer{background:var(--fw-ocean);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;border-top:3px solid var(--fw-teal);}
.fw-footer a{color:#88ddff;}
@media(max-width:600px){.fw-hero{padding:3rem 1rem 2.5rem;}.fw-hero h1{font-size:1.7rem;}.fw-hero-btns{flex-direction:column;align-items:center;}.fw-route{grid-template-columns:1fr;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Beat Lagos Traffic — Go by Water. Safe. Fast. On Time.');
  const desc = esc((ctx.data.description as string | null) ?? 'NIWA and NIMASA licensed passenger ferry and water transport service. Serving major routes across Lagos Lagoon and Nigerian inland waterways with modern vessels, life jackets, and a strong safety record.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const niwaLicence = esc((ctx.data.niwaLicence as string | null) ?? 'NIWA/[XXXX]');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20would%20like%20to%20book%20a%20ferry%20journey.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const routesHtml = offerings.length > 0
    ? offerings.map(o => `<div class="fw-route"><div class="fw-route-info"><h4>${esc(o.name)}</h4>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div><div class="fw-route-departs">See schedule<span>daily</span></div><div class="fw-route-fare">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'See rates'}</div></div>`).join('')
    : `<div class="fw-route"><div class="fw-route-info"><h4>Marina (CMS) ↔ Badore / Ajah</h4><p>Lagos Lagoon express route | ~35 mins | Departs every 30 min</p></div><div class="fw-route-departs">5:30 AM<span>to 9:00 PM</span></div><div class="fw-route-fare">₦2,500</div></div>
       <div class="fw-route"><div class="fw-route-info"><h4>Marina (CMS) ↔ Ikorodu</h4><p>North Lagos route | ~50 mins | Departs hourly</p></div><div class="fw-route-departs">6:00 AM<span>to 8:00 PM</span></div><div class="fw-route-fare">₦3,000</div></div>
       <div class="fw-route"><div class="fw-route-info"><h4>Lekki ↔ VI / Ozumba</h4><p>Victoria Island connector | ~20 mins | Departs every 45 min</p></div><div class="fw-route-departs">6:30 AM<span>to 10:00 PM</span></div><div class="fw-route-fare">₦1,800</div></div>
       <div class="fw-route"><div class="fw-route-info"><h4>Ilashe Beach / Tarkwa Bay Charter</h4><p>Beach day charter | Minimum 15 passengers | Prior booking</p></div><div class="fw-route-departs">By appt.<span>weekends</span></div><div class="fw-route-fare">₦75,000</div></div>
       <div class="fw-route"><div class="fw-route-info"><h4>Cargo / Pontoon Service</h4><p>Building materials, containers, and bulk cargo | Niger River and Lagoon</p></div><div class="fw-route-departs">Daily<span>by order</span></div><div class="fw-route-fare">Quote</div></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Water Transport | ${city}</title>${CSS}</head><body>
<nav class="fw-nav">
  <a href="/" class="fw-nav-brand">⛴️ ${name}</a>
  <a href="${waHref}" class="fw-nav-cta" target="_blank" rel="noopener">📱 Book Now</a>
</nav>
<div class="fw-safety-strip">
  ✅ NIWA Licensed (${niwaLicence}) &nbsp;|&nbsp; NIMASA Certified &nbsp;|&nbsp; Life Jackets on All Vessels &nbsp;|&nbsp; ${city} &nbsp;|&nbsp; Safety Record: No Lost-Time Incidents
</div>
<section class="fw-hero">
  <div class="fw-hero-icon">⛴️</div>
  <h1>${name}</h1>
  <p class="fw-hero-tagline">${tagline}</p>
  <p style="max-width:600px;margin:0 auto .75rem;opacity:.8;font-size:.9rem;">${desc}</p>
  <p class="fw-hero-niwa">NIWA Licence: ${niwaLicence} | NIMASA Certified | ${city}</p>
  <div class="fw-hero-btns">
    <a href="${waHref}" class="fw-btn fw-btn-wa" target="_blank" rel="noopener">📱 Book via WhatsApp</a>
    <a href="/services" class="fw-btn fw-btn-outline">Routes & Fares</a>
  </div>
</section>
<section class="fw-section">
  <div class="fw-container">
    <h2>Routes & Fares</h2>
    <p class="fw-section-sub">All fares in NGN. Paystack online booking available. Advance booking recommended for charters.</p>
    <div class="fw-routes">${routesHtml}</div>
  </div>
</section>
<section class="fw-section fw-section-alt">
  <div class="fw-container">
    <h2>Safety First</h2>
    <p class="fw-section-sub">Your safety is our first priority — every vessel, every journey, every passenger</p>
    <div class="fw-safety">
      <div class="fw-safety-badge"><div class="icon">🦺</div><h4>Life Jackets</h4><p>Mandatory for all passengers on every journey</p></div>
      <div class="fw-safety-badge"><div class="icon">🛥️</div><h4>NIMASA Certified</h4><p>All vessels certified and regularly inspected</p></div>
      <div class="fw-safety-badge"><div class="icon">📡</div><h4>VHF Radio</h4><p>Constant communication with harbour master</p></div>
      <div class="fw-safety-badge"><div class="icon">⚓</div><h4>NIWA Licensed</h4><p>Inland Waterways Authority operating licence</p></div>
      <div class="fw-safety-badge"><div class="icon">👨‍✈️</div><h4>Trained Crew</h4><p>All captains and crew safety-trained and licensed</p></div>
      <div class="fw-safety-badge"><div class="icon">🆘</div><h4>Emergency Drill</h4><p>Regular passenger safety briefings and crew drills</p></div>
    </div>
  </div>
</section>
<section class="fw-wa-strip">
  <h2>📱 Book Your Journey</h2>
  <p>Reserve a seat on your route or charter a vessel for your event. WhatsApp for availability, real-time updates, and group bookings.</p>
  <a href="${waHref}" class="fw-wa-btn" target="_blank" rel="noopener">WhatsApp to Book</a>
</section>
<footer class="fw-footer"><div class="fw-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | NIWA Licence: ${niwaLicence} | NIMASA Certified | ${city}</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Ticket payment: Paystack · Bank transfer · Cash at terminal | NDPR-compliant booking data | Emergency line: 0800-NIWA-SOS | <a href="/contact">Contact</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'NIWA-licensed passenger ferry and water transport operator serving Nigerian waterways.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const niwaLicence = esc((ctx.data.niwaLicence as string | null) ?? 'NIWA/[XXXX]');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="fw-nav"><a href="/" class="fw-nav-brand">⛴️ ${name}</a><a href="/contact" class="fw-nav-cta">Book Now</a></nav>
<div class="fw-safety-strip">NIWA Licensed — ${niwaLicence} | NIMASA Certified | Safety First</div>
<section class="fw-hero" style="padding:3rem 1rem 2.5rem;"><div class="fw-hero-icon">⛴️</div><h1>About ${name}</h1><p class="fw-hero-tagline">Safe Water Transport | ${city}</p></section>
<section class="fw-section"><div class="fw-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Company</h2><p style="margin:1rem 0;color:var(--fw-muted);">${desc}</p>${phone ? `<p><strong>Terminal:</strong> ${phone}</p>` : ''}<p><strong>City:</strong> ${city}</p></div>
  <div><h2>Licences & Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--fw-muted);">
    <li>✅ NIWA Operating Licence (${niwaLicence})</li>
    <li>✅ NIMASA vessel certification</li>
    <li>✅ LASWA permit (Lagos operations)</li>
    <li>✅ IMO safety standards compliance</li>
    <li>✅ Life jackets — 100% passenger coverage</li>
    <li>✅ Licensed and trained captains</li>
    <li>✅ NDPR-compliant passenger booking data</li>
  </ul></div>
</div></div></section>
<footer class="fw-footer"><div class="fw-container"><p>&copy; ${new Date().getFullYear()} ${name} | NIWA ${niwaLicence} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const niwaLicence = esc((ctx.data.niwaLicence as string | null) ?? 'NIWA/[XXXX]');
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="fw-route"><div class="fw-route-info"><h4>${esc(o.name)}</h4>${o.description ? `<p>${esc(o.description)}</p>` : ''}</div><div class="fw-route-departs">Daily<span>schedule</span></div><div class="fw-route-fare">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Quote'}</div></div>`).join('')
    : `<div class="fw-route"><div class="fw-route-info"><h4>CMS ↔ Badore</h4><p>Lagos Lagoon express | ~35 min</p></div><div class="fw-route-departs">5:30 AM<span>to 9:00 PM</span></div><div class="fw-route-fare">₦2,500</div></div>
       <div class="fw-route"><div class="fw-route-info"><h4>CMS ↔ Ikorodu</h4><p>North Lagos | ~50 min</p></div><div class="fw-route-departs">6:00 AM<span>to 8:00 PM</span></div><div class="fw-route-fare">₦3,000</div></div>
       <div class="fw-route"><div class="fw-route-info"><h4>Beach / Event Charter</h4><p>Tarkwa Bay, Ilashe Beach | Prior booking</p></div><div class="fw-route-departs">By appt.<span>weekends</span></div><div class="fw-route-fare">₦75,000</div></div>
       <div class="fw-route"><div class="fw-route-info"><h4>Cargo / Pontoon</h4><p>Building materials, bulk goods</p></div><div class="fw-route-departs">Daily<span>by order</span></div><div class="fw-route-fare">Quote</div></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Routes — ${name}</title>${CSS}</head><body>
<nav class="fw-nav"><a href="/" class="fw-nav-brand">⛴️ ${name}</a><a href="/contact" class="fw-nav-cta">Book Now</a></nav>
<div class="fw-safety-strip">NIWA ${niwaLicence} | NIMASA Certified | Life Jackets Mandatory | Fares in NGN</div>
<section class="fw-hero" style="padding:3rem 1rem 2.5rem;"><h1>Routes & Fares</h1><p class="fw-hero-tagline">Passenger · Charter · Cargo | Safe. Reliable. NIWA Licensed.</p></section>
<section class="fw-section"><div class="fw-container"><div class="fw-routes">${itemsHtml}</div>
<div style="margin-top:2rem;padding:1rem;background:var(--fw-light);border-radius:8px;font-size:.85rem;color:var(--fw-muted);border:1px solid var(--fw-border);">
  <strong>Payment:</strong> Paystack · Bank transfer · Cash at terminal | Life jackets mandatory on all journeys | Advance booking for charters
</div></div></section>
<footer class="fw-footer"><div class="fw-container"><p>&copy; ${new Date().getFullYear()} ${name} | NIWA ${niwaLicence} | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const niwaLicence = esc((ctx.data.niwaLicence as string | null) ?? 'NIWA/[XXXX]');
  const waHref = waLink(phone, 'Hello, I would like to book a ferry journey or charter.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Book — ${name}</title>${CSS}</head><body>
<nav class="fw-nav"><a href="/" class="fw-nav-brand">⛴️ ${name}</a><a href="${waHref}" class="fw-nav-cta" target="_blank" rel="noopener">📱 Book Now</a></nav>
<div class="fw-safety-strip">NIWA ${niwaLicence} | NIMASA Certified | Safety First | Emergency: 0800-NIWA-SOS</div>
<section class="fw-hero" style="padding:3rem 1rem 2.5rem;"><div class="fw-hero-icon">⛴️</div><h1>Book a Journey</h1><p class="fw-hero-tagline">Passenger · Charter · Cargo | ${city}</p></section>
<section class="fw-section"><div class="fw-container"><div class="fw-contact-grid">
  <div class="fw-contact-box">
    <h3>📱 WhatsApp Booking Line</h3>
    <p>For seat reservations, charter bookings, and group travel — WhatsApp for fastest response.</p>
    <a href="${waHref}" class="fw-btn fw-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">Book via WhatsApp</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Terminal:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}, Nigeria</p>
    <p><strong>NIWA Licence:</strong> ${niwaLicence}</p>
    <p style="margin-top:.5rem;font-size:.85rem;color:var(--fw-muted);"><strong>Emergency:</strong> 0800-NIWA-SOS</p>
  </div>
  <div class="fw-contact-box">
    <h3>Journey / Charter Booking</h3>
    <form class="fw-form" onsubmit="return false;">
      <input class="fw-input" type="text" placeholder="Your full name" autocomplete="name">
      <input class="fw-input" type="tel" placeholder="Phone number (WhatsApp)" autocomplete="tel">
      <input class="fw-input" type="email" placeholder="Email address" autocomplete="email">
      <select class="fw-input"><option value="">-- Journey type --</option><option>Regular passenger (single journey)</option><option>Return journey</option><option>Group booking (10+ passengers)</option><option>Event / Beach charter</option><option>Cargo / Pontoon service</option></select>
      <input class="fw-input" type="text" placeholder="Route (e.g. CMS to Badore)">
      <input class="fw-input" type="text" placeholder="Travel date and preferred time">
      <input class="fw-input" type="number" placeholder="Number of passengers" min="1">
      <div><input type="checkbox" id="ndpr-fw" required> <label for="ndpr-fw" class="fw-ndpr">I consent to ${name} processing my booking details and travel information in accordance with Nigeria's NDPR and our data protection policy.</label></div>
      <button class="fw-submit" type="submit">Request Booking</button>
    </form>
  </div>
</div></div></section>
<footer class="fw-footer"><div class="fw-container"><p>&copy; ${new Date().getFullYear()} ${name} | NIWA ${niwaLicence} | NIMASA Certified | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const ferryFerryWaterTransportTemplate: WebsiteTemplateContract = {
  slug: 'ferry-ferry-water-transport',
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
