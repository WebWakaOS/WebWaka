/**
 * Generator Sales & Service Centre — Pillar 3 Website Template
 * Niche ID: P3-generator-dealer-generator-dealer-service
 * Vertical: generator-dealer (priority=3, critical)
 * Category: commerce
 * Family: NF-COM-ELE standalone
 * Research brief: docs/templates/research/generator-dealer-generator-dealer-service-brief.md
 * Nigeria-First Priority: critical
 * Regulatory signals: SON conformity, CAC registration, brand authorised dealership
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need a generator quote / service booking.')}`;
}

const CSS = `
<style>
:root{--gd-red:#c0392b;--gd-dark:#1a1a2e;--gd-orange:#e67e22;--gd-light:#fef9f0;--gd-text:#2c2c2c;--gd-muted:#6c757d;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',sans-serif;color:var(--gd-text);background:#fff;font-size:16px;line-height:1.6;}
.gd-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.gd-nav{background:var(--gd-dark);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.gd-nav-brand{color:#fff;font-size:1.3rem;font-weight:700;text-decoration:none;}
.gd-emergency{background:var(--gd-red);color:#fff;font-weight:700;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-size:.9rem;}
.gd-hero{background:linear-gradient(135deg,var(--gd-dark) 0%,#2c3e50 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.gd-hero h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:800;margin-bottom:.75rem;}
.gd-hero-badge{background:var(--gd-orange);color:#fff;display:inline-block;padding:.4rem 1rem;border-radius:20px;font-size:.85rem;font-weight:700;margin-bottom:1rem;}
.gd-hero p{max-width:620px;margin:0 auto 1.5rem;opacity:.9;}
.gd-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:6px;text-decoration:none;font-weight:700;font-size:1rem;min-height:44px;line-height:1.3;text-align:center;}
.gd-btn-wa{background:#25D366;color:#fff;}
.gd-btn-outline{border:2px solid #fff;color:#fff;}
.gd-btn-emergency{background:var(--gd-red);color:#fff;}
.gd-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.gd-trust{background:var(--gd-orange);color:#fff;text-align:center;padding:.75rem;font-size:.85rem;}
.gd-section{padding:3rem 1rem;}
.gd-section-alt{background:var(--gd-light);}
.gd-section h2{font-size:1.6rem;font-weight:700;margin-bottom:.5rem;color:var(--gd-dark);}
.gd-section-sub{color:var(--gd-muted);margin-bottom:2rem;}
.gd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;}
.gd-card{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.08);border-top:4px solid var(--gd-orange);}
.gd-card h3{font-size:1.05rem;font-weight:700;margin-bottom:.5rem;color:var(--gd-dark);}
.gd-card p{color:var(--gd-muted);font-size:.9rem;}
.gd-price{margin-top:.75rem;font-weight:700;color:var(--gd-red);font-size:1rem;}
.gd-service-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;}
.gd-service-item{background:#fff;border-radius:8px;padding:1.2rem;box-shadow:0 1px 4px rgba(0,0,0,.07);border-left:4px solid var(--gd-red);}
.gd-service-item h4{font-size:.95rem;font-weight:700;margin-bottom:.3rem;}
.gd-wa-strip{background:#25D366;color:#fff;padding:2rem 1rem;text-align:center;}
.gd-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.gd-wa-btn{background:#fff;color:#128C7E;font-weight:700;padding:.75rem 2rem;border-radius:6px;text-decoration:none;display:inline-block;}
.gd-brands{display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin-top:1rem;}
.gd-brand-badge{background:#fff;border:2px solid var(--gd-orange);border-radius:6px;padding:.5rem 1rem;font-weight:700;font-size:.9rem;color:var(--gd-dark);}
.gd-testimonials{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1.5rem;margin-top:1.5rem;}
.gd-testi{background:#fff;border-radius:8px;padding:1.5rem;box-shadow:0 2px 6px rgba(0,0,0,.08);}
.gd-testi-text{font-style:italic;margin-bottom:.75rem;}
.gd-testi-author{font-weight:700;font-size:.9rem;color:var(--gd-red);}
.gd-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.gd-contact-box{background:var(--gd-light);padding:1.5rem;border-radius:8px;}
.gd-contact-box h3{margin-bottom:1rem;color:var(--gd-dark);}
.gd-contact-box a{color:var(--gd-red);font-weight:600;}
.gd-form{display:flex;flex-direction:column;gap:.75rem;}
.gd-input{padding:.75rem;border:1px solid #ddd;border-radius:6px;font-size:1rem;width:100%;}
.gd-ndpr{font-size:.8rem;color:var(--gd-muted);}
.gd-submit{background:var(--gd-dark);color:#fff;border:none;padding:.75rem 1.5rem;border-radius:6px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.gd-footer{background:var(--gd-dark);color:rgba(255,255,255,.8);text-align:center;padding:1.5rem;font-size:.85rem;}
.gd-footer a{color:var(--gd-orange);}
@media(max-width:600px){.gd-hero{padding:2.5rem 1rem 2rem;}.gd-hero h1{font-size:1.6rem;}.gd-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'When NEPA Fails, We Don\'t. Generators for Every Need.');
  const desc = esc((ctx.data.description as string | null) ?? 'We sell, install, and service Honda, Mikano, Perkins, and Elemax generators for homes, churches, estates, hospitals, and industries across Nigeria.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20need%20a%20generator%20quote.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const productsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="gd-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="gd-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Call for price'}</p></div>`).join('')
    : `
      <div class="gd-card"><h3>1kVA–5kVA Portable</h3><p>Honda EM/EB series, Tiger, Sumec Firman — perfect for homes, shops, POS machines.</p><p class="gd-price">From ₦195,000</p></div>
      <div class="gd-card"><h3>6kVA–20kVA Medium</h3><p>Elemax, Lutian, Perkins — ideal for large homes, small businesses, filling stations.</p><p class="gd-price">From ₦750,000</p></div>
      <div class="gd-card"><h3>21kVA–60kVA Industrial</h3><p>Mikano, Perkins, FG Wilson — for churches, estates, factories, hospitals.</p><p class="gd-price">From ₦4,500,000</p></div>
      <div class="gd-card"><h3>60kVA+ Heavy Industrial</h3><p>Cummins, CAT, Stamford alternators — for large estates, manufacturing plants, telecoms.</p><p class="gd-price">From ₦18,000,000</p></div>
      <div class="gd-card"><h3>Generator Repair & Service</h3><p>Oil change, AVR, carburetor, fuel pump, rewinding, and complete overhaul services.</p><p class="gd-price">From ₦15,000</p></div>
      <div class="gd-card"><h3>Maintenance Contract</h3><p>Monthly/quarterly service SLA for churches, estates, hotels. Emergency call-out included.</p><p class="gd-price">From ₦50,000/month</p></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Generator Sales & Service | ${city}</title>${CSS}</head><body>
<nav class="gd-nav">
  <a href="/" class="gd-nav-brand">⚡ ${name}</a>
  <a href="${waHref}" class="gd-emergency" target="_blank" rel="noopener">🔴 Emergency Service</a>
</nav>
<div class="gd-trust">
  SON Conformity Certified &nbsp;|&nbsp; CAC Registered &nbsp;|&nbsp; Authorised: Honda · Mikano · Perkins · Elemax &nbsp;|&nbsp; 24/7 Emergency Service
</div>
<section class="gd-hero">
  <div class="gd-hero-badge">⚡ Generator Specialists — ${city}</div>
  <h1>${name}</h1>
  <p>${tagline}</p>
  <p>${desc}</p>
  <div class="gd-hero-btns">
    <a href="${waHref}" class="gd-btn gd-btn-wa" target="_blank" rel="noopener">📱 Get Quote on WhatsApp</a>
    <a href="/services" class="gd-btn gd-btn-outline">View All Products</a>
  </div>
</section>
<section class="gd-section">
  <div class="gd-container">
    <h2>Generators & Services</h2>
    <p class="gd-section-sub">From portable 1kVA sets to 500kVA industrial plants — sales, installation, and maintenance across Nigeria</p>
    <div class="gd-grid">${productsHtml}</div>
  </div>
</section>
<section class="gd-section gd-section-alt">
  <div class="gd-container">
    <h2>Brands We Supply</h2>
    <p class="gd-section-sub">Authorised dealerships and official service partnerships</p>
    <div class="gd-brands">
      <span class="gd-brand-badge">Honda</span>
      <span class="gd-brand-badge">Mikano</span>
      <span class="gd-brand-badge">Perkins</span>
      <span class="gd-brand-badge">Elemax</span>
      <span class="gd-brand-badge">Sumec Firman</span>
      <span class="gd-brand-badge">Cummins</span>
      <span class="gd-brand-badge">FG Wilson</span>
      <span class="gd-brand-badge">Tiger</span>
    </div>
  </div>
</section>
<section class="gd-wa-strip">
  <h2>📱 24/7 Emergency Generator Support</h2>
  <p>Generator broke down? Call us on WhatsApp now. We have mobile technicians across ${city} ready to respond.</p>
  <a href="${waHref}" class="gd-wa-btn" target="_blank" rel="noopener">WhatsApp Emergency Line</a>
</section>
<section class="gd-section">
  <div class="gd-container">
    <h2>Trusted by Churches, Estates & Businesses</h2>
    <div class="gd-testimonials">
      <div class="gd-testi"><p class="gd-testi-text">"They supplied three Mikano 60kVA sets for our estate and have been servicing them monthly for two years. Zero complaints."</p><p class="gd-testi-author">— Olumide Bello, Facility Manager, Lekki Estate</p></div>
      <div class="gd-testi"><p class="gd-testi-text">"Our 100kVA Perkins was overhauled in three days. Honest diagnosis, fair pricing, Paystack invoice. Highly recommended."</p><p class="gd-testi-author">— Pastor Biodun Adeleke, New Life Church, Ibadan</p></div>
    </div>
  </div>
</section>
<footer class="gd-footer"><div class="gd-container"><p>&copy; ${new Date().getFullYear()} ${name}. SON Certified. CAC Registered. | Payment: Paystack · Bank Transfer · POS · Hire Purchase | <a href="/contact">Contact</a></p></div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'We are a SON-certified generator dealership and service centre, supplying and maintaining Honda, Mikano, Perkins, and other brands for businesses, estates, and institutions across Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="gd-nav"><a href="/" class="gd-nav-brand">⚡ ${name}</a><a href="/contact" class="gd-emergency">Contact Us</a></nav>
<section class="gd-hero" style="padding:3rem 1rem 2rem;"><h1>About ${name}</h1><p>Nigeria's power problem. Our solution.</p></section>
<section class="gd-section"><div class="gd-container"><div class="gd-grid">
  <div><h2>Who We Are</h2><p style="margin:1rem 0;color:var(--gd-muted)">${desc}</p><p>Located in ${city}, we have built a reputation for honest diagnosis, quality service, and genuine parts. Our workshop serves churches, estates, hospitals, and industrial clients across Nigeria.</p>${phone ? `<p style="margin-top:1rem;"><strong>Phone:</strong> ${phone}</p>` : ''}</div>
  <div><h2>Why Choose Us</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--gd-muted);">
    <li>✅ SON Conformity Certificate — all imports</li>
    <li>✅ CAC Registered Business</li>
    <li>✅ Authorised Honda, Mikano, Perkins dealer</li>
    <li>✅ 24/7 emergency repair service</li>
    <li>✅ Genuine OEM spare parts only</li>
    <li>✅ Maintenance SLA for estates and churches</li>
    <li>✅ Paystack, bank transfer, POS, hire purchase</li>
  </ul></div>
</div></div></section>
<footer class="gd-footer"><div class="gd-container"><p>&copy; ${new Date().getFullYear()} ${name} | SON Certified | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="gd-card"><h3>${esc(o.name)}</h3>${o.description ? `<p>${esc(o.description)}</p>` : ''}<p class="gd-price">${o.priceKobo !== null ? fmtKobo(o.priceKobo) : 'Call for price'}</p></div>`).join('')
    : `<div class="gd-card"><h3>1–5kVA Portable</h3><p>Honda, Tiger, Sumec Firman portables.</p><p class="gd-price">From ₦195,000</p></div>
       <div class="gd-card"><h3>6–20kVA Medium</h3><p>Elemax, Lutian, Perkins — for businesses.</p><p class="gd-price">From ₦750,000</p></div>
       <div class="gd-card"><h3>21–60kVA Industrial</h3><p>Mikano, Perkins — churches, estates.</p><p class="gd-price">From ₦4,500,000</p></div>
       <div class="gd-card"><h3>60kVA+ Heavy Duty</h3><p>Cummins, CAT — manufacturing, telecoms.</p><p class="gd-price">From ₦18,000,000</p></div>
       <div class="gd-card"><h3>Repair & Servicing</h3><p>Full overhaul, AVR, carb, fuel pump.</p><p class="gd-price">From ₦15,000</p></div>
       <div class="gd-card"><h3>Maintenance Contract</h3><p>Monthly SLA + emergency cover.</p><p class="gd-price">From ₦50,000/month</p></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Products & Services — ${name}</title>${CSS}</head><body>
<nav class="gd-nav"><a href="/" class="gd-nav-brand">⚡ ${name}</a><a href="/contact" class="gd-emergency">Get Quote</a></nav>
<section class="gd-hero" style="padding:3rem 1rem 2rem;"><h1>Generators & Services</h1><p>All prices in Nigerian Naira (₦). Call or WhatsApp for latest pricing.</p></section>
<section class="gd-section"><div class="gd-container"><div class="gd-grid">${itemsHtml}</div></div></section>
<footer class="gd-footer"><div class="gd-container"><p>&copy; ${new Date().getFullYear()} ${name} | Payment: Paystack · Bank Transfer · POS | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Lagos');
  const waHref = waLink(phone, 'Hello, I need a generator quote / service booking.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contact — ${name}</title>${CSS}</head><body>
<nav class="gd-nav"><a href="/" class="gd-nav-brand">⚡ ${name}</a><a href="${waHref}" class="gd-emergency" target="_blank" rel="noopener">🔴 Emergency Line</a></nav>
<section class="gd-hero" style="padding:3rem 1rem 2rem;"><h1>Contact & Booking</h1><p>Sales enquiries, service bookings, and emergency repairs — we respond fast</p></section>
<section class="gd-section"><div class="gd-container"><div class="gd-contact-grid">
  <div class="gd-contact-box">
    <h3>📱 WhatsApp (24/7 Emergency)</h3>
    <p>For urgent repairs and breakdown assistance — WhatsApp is fastest.</p>
    <a href="${waHref}" class="gd-btn gd-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp Now</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Phone:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}, Nigeria</p>
  </div>
  <div class="gd-contact-box">
    <h3>Book a Service or Quote</h3>
    <form class="gd-form" onsubmit="return false;">
      <input class="gd-input" type="text" placeholder="Your name" autocomplete="name">
      <input class="gd-input" type="tel" placeholder="Phone number" autocomplete="tel">
      <select class="gd-input"><option value="">-- Service needed --</option><option>New generator purchase</option><option>Generator repair</option><option>Maintenance contract</option><option>Emergency breakdown</option><option>Installation only</option></select>
      <textarea class="gd-input" rows="3" placeholder="Generator brand, capacity (kVA), and issue description..."></textarea>
      <div><input type="checkbox" id="ndpr-gd" required> <label for="ndpr-gd" class="gd-ndpr">I consent to ${name} storing my contact details for this service request, per Nigeria's NDPR.</label></div>
      <button class="gd-submit" type="submit">Send Booking Request</button>
    </form>
  </div>
</div>
<div style="margin-top:2rem;padding:1rem;background:var(--gd-light);border-radius:8px;font-size:.85rem;color:var(--gd-muted);">
  <strong>Payment:</strong> Paystack · Bank transfer · POS · Hire purchase available for units above ₦1M
</div>
</div></section>
<footer class="gd-footer"><div class="gd-container"><p>&copy; ${new Date().getFullYear()} ${name} | SON Certified | CAC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const generatorDealerGeneratorDealerServiceTemplate: WebsiteTemplateContract = {
  slug: 'generator-dealer-generator-dealer-service',
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
