import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P37 — Wholesale Market / Trading Hub template
 * CSS namespace: .wm-
 * Platform invariants: T4 (kobo), P2 (Nigeria First)
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff}
      .wm-header{background:#5c2d00;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .wm-logo{font-size:1.3rem;font-weight:700;color:#f5c842}
      .wm-nav a{color:#f0d090;text-decoration:none;margin-left:18px;font-size:.95rem}
      .wm-hero{background:linear-gradient(135deg,#5c2d00 0%,#8b4a00 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .wm-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .wm-hero p{font-size:1.05rem;color:#f0d090cc;max-width:560px;margin:0 auto 32px}
      .wm-stat-bar{background:rgba(245,200,66,.1);border-top:1px solid rgba(245,200,66,.2);border-bottom:1px solid rgba(245,200,66,.2);padding:20px 24px;display:flex;flex-wrap:wrap;justify-content:center;gap:32px}
      .wm-stat{text-align:center}
      .wm-stat .num{font-size:1.8rem;font-weight:800;color:#f5c842}
      .wm-stat p{font-size:.8rem;color:#f0d090}
      .wm-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .wm-cta:hover{background:#1ebe5d}
      .wm-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .wm-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#5c2d00;text-align:center}
      .wm-categories{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .wm-cat{background:#fff8f0;border-radius:12px;padding:24px;text-align:center;border:1px solid #f0d8b8;cursor:pointer}
      .wm-cat:hover{border-color:#5c2d00}
      .wm-cat .icon{font-size:2.2rem;margin-bottom:10px}
      .wm-cat h3{font-weight:700;color:#5c2d00;margin-bottom:6px}
      .wm-cat p{font-size:.85rem;color:#888}
      .wm-facilities{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:8px}
      .wm-facility{display:flex;align-items:center;gap:10px;background:#fff8f0;border-radius:10px;padding:14px 18px;border:1px solid #f0d8b8}
      .wm-facility .icon{font-size:1.4rem}
      .wm-whatsapp{background:#5c2d00;color:#fff;padding:64px 24px;text-align:center}
      .wm-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#f5c842}
      .wm-whatsapp p{color:#f0d090cc;margin-bottom:28px}
      .wm-footer{background:#3a1c00;color:#887;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.wm-nav{display:none}.wm-stat-bar{gap:20px}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Wholesale Market';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const traderCount: number = (d['traderCount'] as number) ?? 0;
  const yearsOp: number = (d['yearsOfOperation'] as number) ?? 0;
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20inquire%20about%20wholesale%20pricing%20at%20${encodeURIComponent(name)}`;

  const categories = [
    { icon: '📱', name: 'Electronics', desc: 'Mobile phones, accessories, components' },
    { icon: '👗', name: 'Textiles & Clothing', desc: 'Ankara, lace, ankara bale, ready-to-wear' },
    { icon: '🧴', name: 'FMCG / Consumables', desc: 'Food items, beverages, household goods' },
    { icon: '🔩', name: 'Building Materials', desc: 'Cement, iron rods, tiles, plumbing materials' },
    { icon: '🌾', name: 'Agro-Commodities', desc: 'Grains, pulses, palm oil, groundnuts' },
    { icon: '💊', name: 'Pharmaceuticals', desc: 'Drugs, medical supplies (NAFDAC listed)' },
    { icon: '👟', name: 'Footwear & Bags', desc: 'Shoes, sandals, bags (wholesale bale)' },
    { icon: '🔧', name: 'Auto Parts', desc: 'Spare parts, accessories, oil and lubricants' },
  ];

  const facilities = [
    { icon: '⚖️', text: 'Weighbridge on site' },
    { icon: '🔒', text: '24-hour security' },
    { icon: '🚛', text: 'Loading bay / trucks' },
    { icon: '💳', text: 'POS / bank transfer' },
    { icon: '🏪', text: 'Storage rental' },
    { icon: '📦', text: 'Palletised goods' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="wm-header">
  <div class="wm-logo">${name}</div>
  <nav class="wm-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Commodities</a><a href="/contact">Inquire</a>
  </nav>
</header>
<section class="wm-hero">
  <h1>${city}'s Premier Wholesale Market</h1>
  <p>Your one-stop wholesale hub for electronics, textiles, FMCG, agro-commodities, building materials and more.</p>
  ${phone ? `<a class="wm-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get Wholesale Prices on WhatsApp</a>` : ''}
</section>
${(traderCount > 0 || yearsOp > 0) ? `
<div class="wm-stat-bar">
  ${traderCount > 0 ? `<div class="wm-stat"><div class="num">${traderCount.toLocaleString()}+</div><p>Active Traders</p></div>` : ''}
  ${yearsOp > 0 ? `<div class="wm-stat"><div class="num">${yearsOp}+</div><p>Years Operating</p></div>` : ''}
  <div class="wm-stat"><div class="num">8</div><p>Commodity Categories</p></div>
  <div class="wm-stat"><div class="num">6am</div><p>Market Opens Daily</p></div>
</div>` : ''}

<section class="wm-section">
  <h2>Commodity Categories</h2>
  <div class="wm-categories">
    ${categories.map(c => `
    <div class="wm-cat">
      <div class="icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <p>${c.desc}</p>
    </div>`).join('')}
  </div>
</section>

<section class="wm-section" style="background:#fff8f0;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Market Facilities</h2>
    <div class="wm-facilities">
      ${facilities.map(f => `
      <div class="wm-facility">
        <span class="icon">${f.icon}</span>
        <span>${f.text}</span>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="wm-whatsapp">
  <h2>Get Wholesale Prices Today</h2>
  <p>WhatsApp us to connect with traders in your category and get the best rates.</p>
  ${phone ? `<a class="wm-cta" href="${waLink}" target="_blank" rel="noopener">📱 Inquire on WhatsApp</a>` : ''}
</section>

<footer class="wm-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. | Market Hours: Mon–Sat 6am–6pm</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Wholesale Market';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const mgmtBody: string = (d['managementBody'] as string) ?? 'Market Management Authority';
  const yearsOp: number = (d['yearsOfOperation'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="wm-header">
  <div class="wm-logo">${name}</div>
  <nav class="wm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Commodities</a><a href="/contact">Inquire</a></nav>
</header>
<section class="wm-section" style="max-width:760px">
  <h2>About ${name}</h2>
  <p style="margin-bottom:16px">${name} is ${city}'s established wholesale trading hub${yearsOp > 0 ? `, with over ${yearsOp} years of operation.` : '.'} Managed by ${mgmtBody}.</p>
  <p style="margin-bottom:20px">We bring together hundreds of traders across major commodity categories — enabling manufacturers, importers, and distributors to connect with retailers and buyers across Nigeria.</p>
  <h3 style="margin-bottom:12px;color:#5c2d00">Payment Methods Accepted</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ Bank transfer (all Nigerian banks)</li>
    <li style="padding:6px 0">✓ POS machine payments</li>
    <li style="padding:6px 0">✓ Cash (standard for market transactions)</li>
    <li style="padding:6px 0">✓ Mobile money (OPay, PalmPay, Moniepoint)</li>
  </ul>
</section>
<footer class="wm-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Wholesale Market';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20wholesale%20pricing%20from%20${encodeURIComponent(name)}`;
  const cats = [
    { name: 'Electronics', items: 'Mobile phones, chargers, earphones, power banks, tablets, accessories (wholesale carton pricing)' },
    { name: 'Textiles & Clothing', items: 'Ankara (bales), lace (rolls), aso-oke, ready-to-wear wholesale bundles, uniforms (dozens)' },
    { name: 'FMCG / Consumables', items: 'Tinned foods, noodles, beverages, cooking oil, detergents, toiletries (wholesale cartons)' },
    { name: 'Building Materials', items: 'Cement (50kg bags), iron rods, corrugated sheets, tiles, PVC pipes, electrical fittings' },
    { name: 'Agro-Commodities', items: 'Rice (50kg bags), beans, garri, palm oil (kegs/drums), groundnuts, melon, crayfish' },
    { name: 'Auto Parts', items: 'Engine parts, brake pads, filters, batteries, tyres, lubricants — for all vehicle makes' },
    { name: 'Footwear & Bags', items: 'Wholesale bales of shoes, sandals, handbags, school bags — mixed sizes and styles' },
    { name: 'Pharmaceuticals', items: 'NAFDAC-registered drugs, hospital consumables, surgical items (for licensed buyers only)' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Commodity Directory — ${name}</title>${css()}</head>
<body>
<header class="wm-header">
  <div class="wm-logo">${name}</div>
  <nav class="wm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Commodities</a><a href="/contact">Inquire</a></nav>
</header>
<section class="wm-section">
  <h2>Commodity Directory</h2>
  <p style="text-align:center;color:#888;margin-bottom:32px">WhatsApp us to get connected with traders and get today's wholesale prices.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
    ${cats.map(c => `
    <div style="background:#fff8f0;border:1px solid #f0d8b8;border-radius:12px;padding:20px">
      <h3 style="color:#5c2d00;margin-bottom:10px">${c.name}</h3>
      <p style="font-size:.88rem;color:#666;margin-bottom:14px">${c.items}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;background:#25d366;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem" target="_blank" rel="noopener">Get Price</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="wm-footer"><p>&copy; ${new Date().getFullYear()} ${name}. Prices vary daily — WhatsApp for current wholesale rates.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Wholesale Market';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20inquire%20about%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inquire — ${name}</title>${css()}</head>
<body>
<header class="wm-header">
  <div class="wm-logo">${name}</div>
  <nav class="wm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Commodities</a><a href="/contact">Inquire</a></nav>
</header>
<section class="wm-section" style="max-width:640px">
  <h2>Get in Touch</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#fff8f0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Price Inquiries)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#fff8f0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Market Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#fff8f0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Trading Hours</p><p style="font-weight:700">Mon–Sat: 6am–6pm | Sun: Closed</p></div>
  </div>
  ${phone ? `<a class="wm-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Get Wholesale Prices</a>` : ''}
</section>
<footer class="wm-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const wholesaleMarketTradingHubTemplate: WebsiteTemplateContract = {
  slug: 'wholesale-market-trading-hub',
  version: '1.0.0',
  pages: ['home', 'about', 'services', 'contact'] as WebsitePageType[],
  renderPage(ctx: WebsiteRenderContext): string {
    switch (ctx.pageType) {
      case 'about': return renderAbout(ctx);
      case 'services': return renderServices(ctx);
      case 'contact': return renderContact(ctx);
      default: return renderHome(ctx);
    }
  },
};
