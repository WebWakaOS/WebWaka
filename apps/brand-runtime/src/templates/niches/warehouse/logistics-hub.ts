import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P38 — Warehouse / Logistics Hub template
 * CSS namespace: .wh-
 * Platform invariants: T4 (kobo), P2 (Nigeria First)
 * Trust badges: CAC number + SON cert + NAFDAC cert
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2234;background:#fff}
      .wh-header{background:#112244;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .wh-logo{font-size:1.3rem;font-weight:700;color:#f0a830}
      .wh-nav a{color:#c0d0e8;text-decoration:none;margin-left:18px;font-size:.95rem}
      .wh-hero{background:linear-gradient(135deg,#112244 0%,#1e3a6e 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .wh-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .wh-hero p{font-size:1.05rem;color:#b0c4e0;max-width:560px;margin:0 auto 32px}
      .wh-badges{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:24px}
      .wh-badge{display:inline-block;background:rgba(240,168,48,.15);border:1px solid rgba(240,168,48,.4);color:#f0a830;padding:6px 16px;border-radius:20px;font-size:.82rem}
      .wh-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .wh-cta:hover{background:#1ebe5d}
      .wh-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .wh-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#112244;text-align:center}
      .wh-stats{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;margin-top:8px}
      .wh-stat{background:#f0f4ff;border-radius:14px;padding:24px 32px;text-align:center;min-width:160px;border:1px solid #d0dcff}
      .wh-stat .num{font-size:2.2rem;font-weight:800;color:#112244}
      .wh-stat p{font-size:.85rem;color:#666}
      .wh-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
      .wh-service{border:1px solid #d0dcff;border-radius:14px;padding:24px}
      .wh-service .icon{font-size:1.8rem;margin-bottom:10px}
      .wh-service h3{font-weight:700;margin-bottom:8px;color:#112244}
      .wh-service p{font-size:.88rem;color:#666;line-height:1.5}
      .wh-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:8px}
      .wh-trust-item{background:#f0f4ff;border-radius:10px;padding:16px;text-align:center;border:1px solid #d0dcff}
      .wh-trust-item .icon{font-size:1.5rem;margin-bottom:6px}
      .wh-trust-item p{font-size:.85rem;font-weight:600;color:#112244}
      .wh-whatsapp{background:#112244;color:#fff;padding:64px 24px;text-align:center}
      .wh-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#f0a830}
      .wh-whatsapp p{color:#b0c4e0;margin-bottom:28px}
      .wh-footer{background:#08142e;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.wh-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Warehouse & Logistics';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const cacNumber: string = (d['cacNumber'] as string) ?? '';
  const sonCert: string = (d['sonCert'] as string) ?? '';
  const nafdacCert: string = (d['nafdacCert'] as string) ?? '';
  const totalCapacityKg: number = (d['totalCapacityKg'] as number) ?? 0;
  const state: string = (d['state'] as string) ?? city;
  const lga: string = (d['lga'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20a%20storage%20quote%20from%20${encodeURIComponent(name)}`;

  const services = [
    { icon: '📦', name: 'Dry Storage', desc: 'Ambient temperature storage for FMCG, textiles, electronics, and general merchandise.' },
    { icon: '❄️', name: 'Cold Storage', desc: 'Temperature-controlled storage for food, pharmaceuticals, and perishables.' },
    { icon: '🌾', name: 'Agro-Commodity Storage', desc: 'Bulk storage for grains, cocoa, sesame, soybeans — SON certified.' },
    { icon: '💊', name: 'Pharmaceutical Storage', desc: 'NAFDAC-compliant storage for drugs and medical consumables.' },
    { icon: '🚛', name: 'Distribution Services', desc: 'Last-mile delivery and truck dispatch across Nigeria.' },
    { icon: '📋', name: 'Inventory Management', desc: 'Real-time stock tracking, waybills, and stock reports.' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${state}</title>
${css()}
</head>
<body>
<header class="wh-header">
  <div class="wh-logo">${name}</div>
  <nav class="wh-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Get Quote</a>
  </nav>
</header>
<section class="wh-hero">
  <div class="wh-badges">
    ${cacNumber ? `<span class="wh-badge">📜 CAC: ${cacNumber}</span>` : ''}
    ${sonCert ? `<span class="wh-badge">🏅 SON Certified: ${sonCert}</span>` : ''}
    ${nafdacCert ? `<span class="wh-badge">✅ NAFDAC: ${nafdacCert}</span>` : ''}
  </div>
  <h1>Secure Warehouse & Logistics in ${state}</h1>
  <p>CAC-registered${sonCert ? ', SON-certified' : ''}${nafdacCert ? ', NAFDAC-compliant' : ''} warehouse and logistics hub${lga ? ` in ${lga}` : ''}. Reliable storage for FMCG, agro-commodities, pharmaceuticals and more.</p>
  ${phone ? `<a class="wh-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get a Storage Quote</a>` : ''}
</section>

${totalCapacityKg > 0 ? `
<section class="wh-section">
  <div class="wh-stats">
    <div class="wh-stat"><div class="num">${(totalCapacityKg / 1000).toFixed(0)}T</div><p>Total Capacity (tonnes)</p></div>
    <div class="wh-stat"><div class="num">24/7</div><p>Security Coverage</p></div>
    <div class="wh-stat"><div class="num">100%</div><p>Generator Backup</p></div>
    ${sonCert ? '<div class="wh-stat"><div class="num">SON</div><p>Certified Facility</p></div>' : ''}
  </div>
</section>` : ''}

<section class="wh-section">
  <h2>Our Services</h2>
  <div class="wh-services">
    ${services.map(s => `
    <div class="wh-service">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:14px;background:#25d366;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem" target="_blank" rel="noopener">Get Quote</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="wh-section" style="background:#f0f4ff;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Why Store With Us?</h2>
    <div class="wh-trust">
      ${cacNumber ? '<div class="wh-trust-item"><div class="icon">📜</div><p>CAC Registered</p></div>' : ''}
      ${sonCert ? '<div class="wh-trust-item"><div class="icon">🏅</div><p>SON Certified</p></div>' : ''}
      ${nafdacCert ? '<div class="wh-trust-item"><div class="icon">✅</div><p>NAFDAC Compliant</p></div>' : ''}
      <div class="wh-trust-item"><div class="icon">🔒</div><p>24/7 CCTV & Guard</p></div>
      <div class="wh-trust-item"><div class="icon">🔌</div><p>Full Generator Backup</p></div>
      <div class="wh-trust-item"><div class="icon">🚛</div><p>Loading Bay & Forklifts</p></div>
      <div class="wh-trust-item"><div class="icon">📋</div><p>Waybill & Records</p></div>
    </div>
  </div>
</section>

<section class="wh-whatsapp">
  <h2>Need Storage? Get a Quote Today</h2>
  <p>Tell us your commodity type, volume, and duration — we'll give you the best rate.</p>
  ${phone ? `<a class="wh-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get Storage Quote on WhatsApp</a>` : ''}
</section>

<footer class="wh-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${state}, Nigeria.${cacNumber ? ` CAC: ${cacNumber}.` : ''}</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Warehouse & Logistics';
  const state: string = (d['state'] as string) ?? 'Lagos';
  const lga: string = (d['lga'] as string) ?? '';
  const cacNumber: string = (d['cacNumber'] as string) ?? '';
  const sonCert: string = (d['sonCert'] as string) ?? '';
  const nafdacCert: string = (d['nafdacCert'] as string) ?? '';
  const totalCapacityKg: number = (d['totalCapacityKg'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="wh-header">
  <div class="wh-logo">${name}</div>
  <nav class="wh-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Get Quote</a></nav>
</header>
<section class="wh-section" style="max-width:760px">
  <h2>About ${name}</h2>
  <div class="wh-badges" style="justify-content:flex-start;margin-bottom:20px">
    ${cacNumber ? `<span class="wh-badge">📜 CAC: ${cacNumber}</span>` : ''}
    ${sonCert ? `<span class="wh-badge">🏅 SON: ${sonCert}</span>` : ''}
    ${nafdacCert ? `<span class="wh-badge">✅ NAFDAC: ${nafdacCert}</span>` : ''}
  </div>
  <p style="margin-bottom:16px">${name} is a certified warehouse and logistics operator based in ${lga ? `${lga}, ` : ''}${state}, Nigeria. We provide secure, compliant storage and distribution services for businesses of all sizes.</p>
  ${totalCapacityKg > 0 ? `<p style="margin-bottom:16px">Total warehouse capacity: <strong>${totalCapacityKg.toLocaleString()} kg (${(totalCapacityKg / 1000).toFixed(0)} tonnes)</strong></p>` : ''}
  <h3 style="margin-bottom:12px;color:#112244">Certifications & Compliance</h3>
  <ul style="list-style:none;color:#555">
    ${cacNumber ? `<li style="padding:6px 0">✓ CAC-registered business: ${cacNumber}</li>` : ''}
    ${sonCert ? `<li style="padding:6px 0">✓ SON-certified facility: ${sonCert}</li>` : ''}
    ${nafdacCert ? `<li style="padding:6px 0">✓ NAFDAC-compliant for pharmaceutical/food storage: ${nafdacCert}</li>` : ''}
    <li style="padding:6px 0">✓ 24/7 manned security and CCTV</li>
    <li style="padding:6px 0">✓ Full generator backup — no downtime</li>
    <li style="padding:6px 0">✓ Comprehensive insurance cover</li>
  </ul>
</section>
<footer class="wh-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${state}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Warehouse & Logistics';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20a%20storage%20quote%20from%20${encodeURIComponent(name)}`;
  const services = [
    { name: 'Dry Storage (General)', desc: 'FMCG, electronics, textiles, building materials, general merchandise', pricing: 'From ₦5,000/pallet/month' },
    { name: 'Agro-Commodity Storage', desc: 'Grains (rice, maize, sorghum), cocoa, sesame, soybeans — SON certified', pricing: 'From ₦3,000/tonne/month' },
    { name: 'Cold Storage', desc: 'Temperature-controlled (2–8°C or -18°C) for perishables and pharmaceuticals', pricing: 'From ₦15,000/tonne/month' },
    { name: 'Pharmaceutical Storage', desc: 'NAFDAC-compliant, climate-controlled storage for drugs and medical supplies', pricing: 'Custom quote' },
    { name: 'E-commerce Fulfillment', desc: 'Pick, pack, and dispatch for online sellers. Integration with Jumia, Konga, social sellers', pricing: 'Custom quote' },
    { name: 'Distribution / Haulage', desc: 'Truck dispatch for delivery within Nigeria. From 1-tonne pickups to 30-tonne trailers', pricing: 'Per trip quotation' },
    { name: 'Cross-docking', desc: 'Receive goods from supplier, sort, and dispatch to multiple retailers — no long-term storage', pricing: 'Custom quote' },
    { name: 'Bonded Warehouse', desc: 'Duty-deferred storage for imported goods (subject to NCS approval)', pricing: 'Custom quote' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Services — ${name}</title>${css()}</head>
<body>
<header class="wh-header">
  <div class="wh-logo">${name}</div>
  <nav class="wh-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Get Quote</a></nav>
</header>
<section class="wh-section">
  <h2>Storage & Logistics Services</h2>
  <div class="wh-services">
    ${services.map(s => `
    <div class="wh-service">
      <h3>${s.name}</h3>
      <p style="font-weight:700;color:#f0a830;margin:8px 0">${s.pricing}</p>
      <p>${s.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:12px;background:#25d366;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem" target="_blank" rel="noopener">Get Quote</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="wh-footer"><p>&copy; ${new Date().getFullYear()} ${name}. Prices indicative — WhatsApp for exact quotes.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Warehouse & Logistics';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const state: string = (d['state'] as string) ?? 'Lagos';
  const lga: string = (d['lga'] as string) ?? '';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 7am–6pm | Sat: 8am–2pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20a%20storage%20quote%20from%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Get Quote — ${name}</title>${css()}</head>
<body>
<header class="wh-header">
  <div class="wh-logo">${name}</div>
  <nav class="wh-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Get Quote</a></nav>
</header>
<section class="wh-section" style="max-width:640px">
  <h2>Get a Storage Quote</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f0f4ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Quotes & Inquiries)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f0f4ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Warehouse Address</p><p style="font-weight:700">${address}${lga ? `, ${lga}` : ''}, ${state}</p></div>` : ''}
    <div style="background:#f0f4ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Operating Hours</p><p style="font-weight:700">${hours}</p></div>
    <div style="background:#f0f4ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">When quoting, please provide:</p><ul style="list-style:none;color:#555;font-size:.9rem"><li style="padding:3px 0">• Commodity type and description</li><li style="padding:3px 0">• Volume (in kg, tonnes, or pallets)</li><li style="padding:3px 0">• Duration required</li><li style="padding:3px 0">• Any temperature requirements</li></ul></div>
  </div>
  ${phone ? `<a class="wh-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Request a Quote Now</a>` : ''}
</section>
<footer class="wh-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${state}, Nigeria.</p></footer>
</body></html>`;
}

export const warehouseLogisticsHubTemplate: WebsiteTemplateContract = {
  slug: 'warehouse-logistics-hub',
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
