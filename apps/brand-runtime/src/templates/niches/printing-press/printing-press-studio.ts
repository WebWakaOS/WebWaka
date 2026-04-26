/**
 * Printing Press & Studio — Pillar 3 Website Template
 * Niche ID: P3-printing-press-printing-press-studio
 * Vertical: printing-press (priority=3, high)
 * Category: media / commerce
 * Family: standalone
 * Research brief: docs/templates/research/printing-press-printing-press-studio-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: CAC business registration; APCON membership (if advertising agency); copyright compliance; INEC Electoral Act 2022 (campaign materials); NDPR for customer artwork
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need a printing quote.')}`;
}

const CSS = `
<style>
:root{--pp-black:#1a1a1a;--pp-ink:#0d0d0d;--pp-red:#cc0000;--pp-yellow:#ffc107;--pp-light:#f8f9fa;--pp-text:#1a1a1a;--pp-muted:#555;--pp-border:#ddd;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;color:var(--pp-text);background:#fff;font-size:16px;line-height:1.65;}
.pp-container{max-width:1100px;margin:0 auto;padding:0 1rem;}
.pp-nav{background:var(--pp-ink);padding:1rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:.5rem;}
.pp-nav-brand{color:#fff;font-size:1.2rem;font-weight:700;text-decoration:none;}
.pp-nav-cta{background:var(--pp-red);color:#fff;padding:.5rem 1rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;}
.pp-hero{background:linear-gradient(135deg,var(--pp-ink) 0%,var(--pp-red) 100%);color:#fff;padding:4rem 1rem 3rem;text-align:center;}
.pp-hero-icon{font-size:3rem;margin-bottom:1rem;}
.pp-hero h1{font-size:clamp(1.8rem,5vw,2.6rem);font-weight:800;margin-bottom:.5rem;}
.pp-hero-tagline{opacity:.85;margin-bottom:.5rem;font-size:1rem;}
.pp-hero-cac{color:var(--pp-yellow);font-size:.85rem;margin-bottom:2rem;}
.pp-btn{display:inline-block;padding:.75rem 1.5rem;border-radius:4px;text-decoration:none;font-weight:700;font-size:.95rem;min-height:44px;line-height:1.3;}
.pp-btn-wa{background:#25D366;color:#fff;}
.pp-btn-primary{background:var(--pp-red);color:#fff;}
.pp-btn-outline{border:2px solid #fff;color:#fff;}
.pp-hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
.pp-cac-strip{background:var(--pp-red);color:#fff;text-align:center;padding:.55rem;font-size:.83rem;}
.pp-section{padding:3rem 1rem;}
.pp-section-alt{background:var(--pp-light);}
.pp-section h2{font-size:1.5rem;font-weight:700;margin-bottom:.5rem;color:var(--pp-ink);}
.pp-section-sub{color:var(--pp-muted);margin-bottom:2rem;font-size:.9rem;}
.pp-pricelist{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;}
.pp-price-card{background:#fff;border-radius:6px;padding:1.25rem;box-shadow:0 1px 6px rgba(0,0,0,.09);border-left:4px solid var(--pp-red);}
.pp-price-card h3{font-size:1rem;font-weight:700;color:var(--pp-ink);margin-bottom:.5rem;}
.pp-price-card table{width:100%;border-collapse:collapse;font-size:.85rem;}
.pp-price-card td{padding:.3rem 0;border-bottom:1px solid var(--pp-border);}
.pp-price-card td:last-child{text-align:right;font-weight:700;color:var(--pp-red);}
.pp-price-card tr:last-child td{border-bottom:none;}
.pp-turnaround{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:1rem;}
.pp-turn{background:#fff;border-radius:6px;padding:1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.07);text-align:center;border-top:3px solid var(--pp-yellow);}
.pp-turn .t{font-size:1.5rem;font-weight:800;color:var(--pp-red);}
.pp-turn h4{font-size:.9rem;font-weight:700;color:var(--pp-ink);margin:.3rem 0;}
.pp-turn p{font-size:.8rem;color:var(--pp-muted);}
.pp-clients{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-top:1rem;}
.pp-client{background:#fff;border-radius:6px;padding:1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.07);border-left:3px solid var(--pp-yellow);}
.pp-client h4{font-size:.9rem;font-weight:700;color:var(--pp-ink);}
.pp-client p{font-size:.8rem;color:var(--pp-muted);margin-top:.2rem;}
.pp-wa-strip{background:var(--pp-ink);color:#fff;padding:2.5rem 1rem;text-align:center;}
.pp-wa-strip h2{font-size:1.5rem;margin-bottom:.5rem;}
.pp-wa-strip p{opacity:.85;margin-bottom:1.25rem;font-size:.9rem;}
.pp-wa-btn{background:#25D366;color:#fff;font-weight:700;padding:.75rem 2rem;border-radius:4px;text-decoration:none;display:inline-block;}
.pp-contact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:2rem;margin-top:1.5rem;}
.pp-contact-box{background:var(--pp-light);padding:1.5rem;border-radius:6px;border:1px solid var(--pp-border);}
.pp-contact-box h3{margin-bottom:1rem;color:var(--pp-ink);font-size:1rem;}
.pp-contact-box a{color:var(--pp-red);font-weight:600;}
.pp-form{display:flex;flex-direction:column;gap:.75rem;}
.pp-input{padding:.7rem 1rem;border:1px solid var(--pp-border);border-radius:4px;font-size:1rem;width:100%;}
.pp-ndpr{font-size:.8rem;color:var(--pp-muted);}
.pp-submit{background:var(--pp-red);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:4px;font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;}
.pp-footer{background:var(--pp-ink);color:rgba(255,255,255,.75);text-align:center;padding:2rem 1rem;font-size:.85rem;}
.pp-footer a{color:var(--pp-yellow);}
@media(max-width:600px){.pp-hero{padding:2.5rem 1rem 2rem;}.pp-hero h1{font-size:1.7rem;}.pp-hero-btns{flex-direction:column;align-items:center;}}
</style>`;

function renderHome(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const tagline = esc((ctx.data.tagline as string | null) ?? 'Print Right. Print Fast. Print Nigerian.');
  const desc = esc((ctx.data.description as string | null) ?? 'Professional printing studio specialising in digital printing, large-format banners, offset printing, and same-day delivery. Serving churches, campaign organisations, universities, and businesses across Nigeria.');
  const phone = (ctx.data.phone as string | null) ?? null;
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const equipment = esc((ctx.data.equipment as string | null) ?? 'HP DesignJet · Heidelberg Offset · Ricoh Digital');
  const waHref = waLink(phone) ?? 'https://wa.me/2348000000000?text=Hello%2C%20I%20need%20a%20printing%20quote.';
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;

  const priceHtml = offerings.length > 0
    ? offerings.map(o => `<div class="pp-price-card"><h3>${esc(o.name)}</h3>${o.description ? `<p style="color:var(--pp-muted);font-size:.85rem;margin-bottom:.5rem;">${esc(o.description)}</p>` : ''}${o.priceKobo !== null ? `<p style="font-weight:700;color:var(--pp-red);">From ${fmtKobo(o.priceKobo)}</p>` : ''}</div>`).join('')
    : `<div class="pp-price-card"><h3>📋 Flyers</h3><table><tr><td>A4 (100 copies)</td><td>₦8,000</td></tr><tr><td>A5 (200 copies)</td><td>₦10,000</td></tr><tr><td>A4 (500 copies)</td><td>₦30,000</td></tr></table></div>
       <div class="pp-price-card"><h3>🃏 Business Cards</h3><table><tr><td>100 cards (full colour)</td><td>₦7,000</td></tr><tr><td>250 cards (full colour)</td><td>₦15,000</td></tr><tr><td>500 cards (laminated)</td><td>₦22,000</td></tr></table></div>
       <div class="pp-price-card"><h3>🎌 Banners & Flexboards</h3><table><tr><td>4×3ft banner</td><td>₦8,000</td></tr><tr><td>6×4ft banner</td><td>₦15,000</td></tr><tr><td>Roll-up standee</td><td>₦28,000</td></tr></table></div>
       <div class="pp-price-card"><h3>📅 Calendars</h3><table><tr><td>Desk calendar (100 pcs)</td><td>₦45,000</td></tr><tr><td>Wall calendar A3 (50 pcs)</td><td>₦60,000</td></tr><tr><td>Pocket calendar (500 pcs)</td><td>₦40,000</td></tr></table></div>
       <div class="pp-price-card"><h3>📖 Brochures / Booklets</h3><table><tr><td>A4 tri-fold (200 pcs)</td><td>₦45,000</td></tr><tr><td>A5 8-page booklet (100 pcs)</td><td>₦55,000</td></tr><tr><td>Church programme (500 pcs)</td><td>₦40,000</td></tr></table></div>
       <div class="pp-price-card"><h3>🎊 Event Backdrops</h3><table><tr><td>8×6ft backdrop</td><td>₦25,000</td></tr><tr><td>10×8ft backdrop</td><td>₦40,000</td></tr><tr><td>Step-and-repeat 8×8ft</td><td>₦55,000</td></tr></table></div>`;

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — Printing Press | ${city}</title>${CSS}</head><body>
<nav class="pp-nav">
  <a href="/" class="pp-nav-brand">🖨️ ${name}</a>
  <a href="${waHref}" class="pp-nav-cta" target="_blank" rel="noopener">📱 Order via WhatsApp</a>
</nav>
<div class="pp-cac-strip">
  ✅ CAC Registered ${cacNo ? `(${cacNo})` : ''} &nbsp;|&nbsp; ${equipment} &nbsp;|&nbsp; Same-Day Available &nbsp;|&nbsp; ${city}
</div>
<section class="pp-hero">
  <div class="pp-hero-icon">🖨️</div>
  <h1>${name}</h1>
  <p class="pp-hero-tagline">${tagline}</p>
  <p style="max-width:600px;margin:0 auto .75rem;opacity:.8;font-size:.9rem;">${desc}</p>
  <p class="pp-hero-cac">CAC Registered ${cacNo ? `(${cacNo})` : ''} | ${equipment} | ${city}</p>
  <div class="pp-hero-btns">
    <a href="${waHref}" class="pp-btn pp-btn-wa" target="_blank" rel="noopener">📱 Order via WhatsApp</a>
    <a href="/services" class="pp-btn pp-btn-outline">View Full Price List</a>
  </div>
</section>
<section class="pp-section">
  <div class="pp-container">
    <h2>Prices & Products</h2>
    <p class="pp-section-sub">All prices in NGN. Prices include design if artwork provided. Send artwork via WhatsApp — JPG, PDF, or CorelDraw formats accepted.</p>
    <div class="pp-pricelist">${priceHtml}</div>
  </div>
</section>
<section class="pp-section pp-section-alt">
  <div class="pp-container">
    <h2>Turnaround Times</h2>
    <p class="pp-section-sub">We print fast. Quality never compromised.</p>
    <div class="pp-turnaround">
      <div class="pp-turn"><div class="t">2hrs</div><h4>Same-Day Digital Print</h4><p>Flyers, business cards, certificates (digital printing, small qty)</p></div>
      <div class="pp-turn"><div class="t">24hrs</div><h4>Standard Order</h4><p>Banners, booklets, most digital orders. Send artwork by 10am.</p></div>
      <div class="pp-turn"><div class="t">3–5 days</div><h4>Offset / Bulk</h4><p>Offset printing for 1,000+ copies. Calendars, bulk flyers, letterheads.</p></div>
      <div class="pp-turn"><div class="t">7 days</div><h4>Branded Merch</h4><p>T-shirts, pens, branded gift items, custom packaging.</p></div>
    </div>
  </div>
</section>
<section class="pp-section">
  <div class="pp-container">
    <h2>Who We Print For</h2>
    <p class="pp-section-sub">Trusted by churches, politicians, universities, businesses, and NGOs across ${city}</p>
    <div class="pp-clients">
      <div class="pp-client"><h4>⛪ Churches & Ministries</h4><p>Weekly bulletins, gospel banners, event programmes, seasonal prints.</p></div>
      <div class="pp-client"><h4>🗳️ Political Campaigns</h4><p>Campaign banners, posters, buntings, branded merchandise. INEC-compliant.</p></div>
      <div class="pp-client"><h4>🎓 Schools & Universities</h4><p>Result sheets, certificates, SUG backdrops, graduation materials.</p></div>
      <div class="pp-client"><h4>🏢 Corporate Nigeria</h4><p>Annual reports, letterheads, business cards, branded gifts.</p></div>
      <div class="pp-client"><h4>🎉 Event Planners</h4><p>Backdrops, step-and-repeat, table cards, invitation cards.</p></div>
      <div class="pp-client"><h4>🛒 Market Businesses</h4><h4></h4><p>Price tags, invoices, branded bags, packaging printing.</p></div>
    </div>
  </div>
</section>
<section class="pp-wa-strip">
  <h2>📱 Order Your Print Job Now</h2>
  <p>Send your artwork + quantity needed to WhatsApp. Get a quote in under 5 minutes. Same-day delivery available in ${city}.</p>
  <a href="${waHref}" class="pp-wa-btn" target="_blank" rel="noopener">WhatsApp Your Order</a>
</section>
<footer class="pp-footer"><div class="pp-container">
  <p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered ${cacNo ? `(${cacNo})` : ''} | ${equipment} | ${city}</p>
  <p style="margin-top:.5rem;font-size:.8rem;">Payment: Paystack · Bank transfer · Cash | Artwork: JPG/PDF/CDR via WhatsApp | Copyright-compliant printing | NDPR for customer artwork | <a href="/contact">Contact</a></p>
</div></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const desc = esc((ctx.data.description as string | null) ?? 'Professional printing studio serving churches, businesses, campaign organisations, and universities in Nigeria.');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const equipment = esc((ctx.data.equipment as string | null) ?? 'HP DesignJet · Heidelberg Offset · Ricoh Digital');
  const phone = esc((ctx.data.phone as string | null) ?? '');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>About — ${name}</title>${CSS}</head><body>
<nav class="pp-nav"><a href="/" class="pp-nav-brand">🖨️ ${name}</a><a href="/contact" class="pp-nav-cta">Order Now</a></nav>
<div class="pp-cac-strip">CAC Registered ${cacNo ? `(${cacNo})` : ''} | ${equipment}</div>
<section class="pp-hero" style="padding:3rem 1rem 2.5rem;"><div class="pp-hero-icon">🖨️</div><h1>About ${name}</h1><p class="pp-hero-tagline">Professional Printing Studio | ${city}</p></section>
<section class="pp-section"><div class="pp-container"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;">
  <div><h2>Our Studio</h2><p style="margin:1rem 0;color:var(--pp-muted);">${desc}</p>${phone ? `<p><strong>Studio:</strong> ${phone}</p>` : ''}<p><strong>City:</strong> ${city}</p><p><strong>Equipment:</strong> ${equipment}</p></div>
  <div><h2>Trust & Compliance</h2><ul style="margin:1rem 0;padding-left:1.5rem;line-height:2.2;color:var(--pp-muted);">
    ${cacNo ? `<li>✅ CAC Registered (${cacNo})</li>` : '<li>✅ CAC Registered Business</li>'}
    <li>✅ APCON compliant (advertising materials)</li>
    <li>✅ INEC Electoral Act 2022 compliant (campaign materials)</li>
    <li>✅ Copyright-compliant printing only</li>
    <li>✅ NDPR-compliant customer artwork data</li>
    <li>✅ Paystack-verified payment</li>
  </ul></div>
</div></div></section>
<footer class="pp-footer"><div class="pp-container"><p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const offerings = (ctx.data.offerings ?? []) as Array<{ name: string; description: string | null; priceKobo: number | null }>;
  const itemsHtml = offerings.length > 0
    ? offerings.map(o => `<div class="pp-price-card"><h3>${esc(o.name)}</h3>${o.description ? `<p style="color:var(--pp-muted);font-size:.85rem;margin-bottom:.5rem;">${esc(o.description)}</p>` : ''}${o.priceKobo !== null ? `<p style="font-weight:700;color:var(--pp-red);">From ${fmtKobo(o.priceKobo)}</p>` : ''}</div>`).join('')
    : `<div class="pp-price-card"><h3>Flyers</h3><table><tr><td>A4 (100 copies)</td><td>₦8,000</td></tr><tr><td>A5 (200 copies)</td><td>₦10,000</td></tr><tr><td>A4 (500 copies)</td><td>₦30,000</td></tr></table></div>
       <div class="pp-price-card"><h3>Business Cards</h3><table><tr><td>100 cards</td><td>₦7,000</td></tr><tr><td>250 cards</td><td>₦15,000</td></tr><tr><td>500 cards (laminated)</td><td>₦22,000</td></tr></table></div>
       <div class="pp-price-card"><h3>Banners</h3><table><tr><td>4×3ft</td><td>₦8,000</td></tr><tr><td>6×4ft</td><td>₦15,000</td></tr><tr><td>Roll-up standee</td><td>₦28,000</td></tr></table></div>
       <div class="pp-price-card"><h3>Booklets / Programmes</h3><table><tr><td>A4 tri-fold (200)</td><td>₦45,000</td></tr><tr><td>Church programme (500)</td><td>₦40,000</td></tr></table></div>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Price List — ${name}</title>${CSS}</head><body>
<nav class="pp-nav"><a href="/" class="pp-nav-brand">🖨️ ${name}</a><a href="/contact" class="pp-nav-cta">Order Now</a></nav>
<div class="pp-cac-strip">CAC Registered ${cacNo ? `(${cacNo})` : ''} | All prices in NGN | Same-day digital print available</div>
<section class="pp-hero" style="padding:3rem 1rem 2.5rem;"><h1>Full Price List</h1><p class="pp-hero-tagline">Digital · Offset · Large Format · Binding | All prices in NGN</p></section>
<section class="pp-section"><div class="pp-container"><div class="pp-pricelist">${itemsHtml}</div>
<div style="margin-top:2rem;padding:1rem;background:var(--pp-light);border-radius:6px;font-size:.85rem;color:var(--pp-muted);border:1px solid var(--pp-border);">
  <strong>Payment:</strong> Paystack · Bank transfer · Cash | <strong>Artwork format:</strong> JPG, PDF, CorelDraw, AI — send via WhatsApp | <strong>Design:</strong> Available for additional fee
</div></div></section>
<footer class="pp-footer"><div class="pp-container"><p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered | Payment: Paystack · Bank Transfer | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const name = esc(ctx.displayName);
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = esc((ctx.data.email as string | null) ?? '');
  const city = esc((ctx.data.placeName as string | null) ?? 'Nigeria');
  const cacNo = esc((ctx.data.cacRegistration as string | null) ?? '');
  const waHref = waLink(phone, 'Hello, I need a printing quote. Please advise.') ?? 'https://wa.me/2348000000000';
  const phoneTxt = phone ? esc(phone) : '';
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Order — ${name}</title>${CSS}</head><body>
<nav class="pp-nav"><a href="/" class="pp-nav-brand">🖨️ ${name}</a><a href="${waHref}" class="pp-nav-cta" target="_blank" rel="noopener">📱 Order Now</a></nav>
<div class="pp-cac-strip">CAC Registered ${cacNo ? `(${cacNo})` : ''} | Same-Day Printing Available</div>
<section class="pp-hero" style="padding:3rem 1rem 2.5rem;"><div class="pp-hero-icon">🖨️</div><h1>Place Your Order</h1><p class="pp-hero-tagline">Send artwork · Get quote · Print fast | ${city}</p></section>
<section class="pp-section"><div class="pp-container"><div class="pp-contact-grid">
  <div class="pp-contact-box">
    <h3>📱 WhatsApp Order Line (Fastest)</h3>
    <p>Send your artwork + quantity. Quote in under 5 minutes. Artwork accepted: <strong>JPG, PDF, CorelDraw, AI</strong>.</p>
    <a href="${waHref}" class="pp-btn pp-btn-wa" target="_blank" rel="noopener" style="display:inline-block;margin-top:.5rem;text-decoration:none;padding:.6rem 1rem;">WhatsApp Your Order</a>
    ${phoneTxt ? `<p style="margin-top:1rem;"><strong>Studio:</strong> <a href="tel:${phoneTxt}">${phoneTxt}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
    <p><strong>Location:</strong> ${city}, Nigeria</p>
    ${cacNo ? `<p><strong>CAC Reg.:</strong> ${cacNo}</p>` : ''}
    <p style="margin-top:.5rem;font-size:.85rem;color:var(--pp-muted);"><strong>Payment:</strong> Paystack · Bank transfer · Cash</p>
  </div>
  <div class="pp-contact-box">
    <h3>Print Order Form</h3>
    <form class="pp-form" onsubmit="return false;">
      <input class="pp-input" type="text" placeholder="Your name / Business name" autocomplete="name">
      <input class="pp-input" type="tel" placeholder="Phone number (WhatsApp)" autocomplete="tel">
      <input class="pp-input" type="email" placeholder="Email address" autocomplete="email">
      <select class="pp-input"><option value="">-- Print product --</option><option>Flyers / Handbills</option><option>Business Cards</option><option>Banners / Flex boards</option><option>Calendars</option><option>Church Programmes / Booklets</option><option>Backdrops / Step-and-Repeat</option><option>T-shirts / Branded Merch</option><option>Roll-up Standee</option><option>Brochures</option><option>Custom / Other</option></select>
      <input class="pp-input" type="text" placeholder="Quantity needed (e.g. 500 copies, 3 banners)">
      <input class="pp-input" type="text" placeholder="Preferred size (e.g. A4, 6×4ft)">
      <input class="pp-input" type="text" placeholder="Deadline (e.g. same-day, 3 days)">
      <textarea class="pp-input" rows="2" placeholder="Additional details (paper type, lamination, binding, etc.)"></textarea>
      <div><input type="checkbox" id="ndpr-pp" required> <label for="ndpr-pp" class="pp-ndpr">I consent to ${name} processing my order details and artwork in accordance with Nigeria's NDPR. Artwork files handled confidentially and not shared with third parties.</label></div>
      <button class="pp-submit" type="submit">Submit Print Order</button>
    </form>
  </div>
</div></div></section>
<footer class="pp-footer"><div class="pp-container"><p>&copy; ${new Date().getFullYear()} ${name} | CAC Registered | APCON Compliant | NDPR Compliant | <a href="/">Home</a></p></div></footer>
</body></html>`;
}

export const printingPressPrintingPressStudioTemplate: WebsiteTemplateContract = {
  slug: 'printing-press-printing-press-studio',
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
