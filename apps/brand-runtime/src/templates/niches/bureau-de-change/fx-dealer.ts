import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P44 — Bureau de Change / FX Dealer template
 * CSS namespace: .bd-
 * Platform invariants: T4 (kobo integers for NGN; integer cents for USD amounts; kobo per USD cent for FX rates),
 *   P13 (no customer BVN ref in template), P2 (Nigeria First)
 * Trust badge: CBN BDC licence
 * CRITICAL: Do NOT display static FX rates — they change daily. Always "WhatsApp for today's rate"
 * SLUG MISMATCH: vertical uses 'bdc' vs template slug 'bureau-de-change' — await migration 0037
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2234;background:#fff}
      .bd-header{background:#1a3a00;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .bd-logo{font-size:1.3rem;font-weight:700;color:#c8e840}
      .bd-nav a{color:#b0cc80;text-decoration:none;margin-left:18px;font-size:.95rem}
      .bd-hero{background:linear-gradient(135deg,#1a3a00 0%,#2a5a00 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .bd-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .bd-hero p{font-size:1.05rem;color:#b0cc80;max-width:560px;margin:0 auto 32px}
      .bd-badge{display:inline-block;background:rgba(200,232,64,.15);border:1px solid rgba(200,232,64,.4);color:#c8e840;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .bd-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .bd-cta:hover{background:#1ebe5d}
      .bd-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .bd-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#1a3a00;text-align:center}
      .bd-currencies{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .bd-currency{background:#f5faf0;border-radius:14px;padding:24px;text-align:center;border:2px solid #d8edc8}
      .bd-currency .flag{font-size:2.5rem;margin-bottom:8px}
      .bd-currency h3{font-weight:700;color:#1a3a00;margin-bottom:6px}
      .bd-currency p{font-size:.85rem;color:#666}
      .bd-currency .rate-note{margin-top:8px;background:#e8f5e0;border-radius:8px;padding:6px 10px;font-size:.8rem;color:#2a5a00;font-weight:600}
      .bd-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
      .bd-service{border:1px solid #d8edc8;border-radius:12px;padding:20px}
      .bd-service h3{font-weight:700;color:#1a3a00;margin-bottom:8px}
      .bd-service p{font-size:.88rem;color:#666;line-height:1.5}
      .bd-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
      .bd-trust-item{background:#f5faf0;border-radius:10px;padding:16px;text-align:center;border:1px solid #d8edc8}
      .bd-trust-item .icon{font-size:1.5rem;margin-bottom:6px}
      .bd-trust-item p{font-size:.85rem;font-weight:600;color:#1a3a00}
      .bd-alert{background:#fffde7;border-radius:12px;padding:16px 20px;border:1px solid #f9a825;margin:24px 0}
      .bd-alert p{font-size:.9rem;color:#795548}
      .bd-whatsapp{background:#1a3a00;color:#fff;padding:64px 24px;text-align:center}
      .bd-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#c8e840}
      .bd-whatsapp p{color:#b0cc80;margin-bottom:28px}
      .bd-footer{background:#0d2000;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.bd-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Bureau de Change';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const cbnBdcLicence: string = (d['cbnBdcLicence'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 9am–5pm | Sat: 9am–2pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20know%20today%27s%20FX%20rate%20at%20${encodeURIComponent(name)}`;

  const currencies = [
    { flag: '🇺🇸', code: 'USD', name: 'US Dollar', desc: 'Most traded currency — travel, imports, tuition, PTA/BTA' },
    { flag: '🇪🇺', code: 'EUR', name: 'Euro', desc: 'European travel, imports, Hajj allowance supplement' },
    { flag: '🇬🇧', code: 'GBP', name: 'British Pound', desc: 'UK travel, student fees, remittances to UK' },
    { flag: '🇨🇳', code: 'CNY', name: 'Chinese Yuan', desc: 'Imports from China — growing demand for trade finance' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="bd-header">
  <div class="bd-logo">${name}</div>
  <nav class="bd-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Get Rate</a>
  </nav>
</header>
<section class="bd-hero">
  ${cbnBdcLicence ? `<div class="bd-badge">🏅 CBN BDC Licence: ${cbnBdcLicence}</div><br>` : '<div class="bd-badge">🏅 CBN Licensed Bureau de Change</div><br>'}
  <h1>Trusted FX Exchange in ${city}</h1>
  <p>CBN-licensed BDC. Competitive rates for USD, EUR, GBP, and CNY. Transparent dealing — no hidden charges.</p>
  ${phone ? `<a class="bd-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get Today's Rate on WhatsApp</a>` : ''}
</section>

<section class="bd-section">
  <div class="bd-alert">
    <p>📊 <strong>FX rates change daily.</strong> We do NOT display rates on this website as they are updated throughout the trading day. WhatsApp us for the latest buying and selling rates.</p>
  </div>
  <h2>Currencies We Trade</h2>
  <div class="bd-currencies">
    ${currencies.map(c => `
    <div class="bd-currency">
      <div class="flag">${c.flag}</div>
      <h3>${c.code} — ${c.name}</h3>
      <p>${c.desc}</p>
      <div class="rate-note">📱 WhatsApp for today's rate</div>
    </div>`).join('')}
  </div>
</section>

<section class="bd-section" style="background:#f5faf0;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Why Choose ${name}?</h2>
    <div class="bd-trust">
      ${cbnBdcLicence ? `<div class="bd-trust-item"><div class="icon">🏅</div><p>CBN BDC<br>Licensed</p></div>` : ''}
      <div class="bd-trust-item"><div class="icon">⚡</div><p>Instant<br>Exchange</p></div>
      <div class="bd-trust-item"><div class="icon">💯</div><p>Genuine<br>Currencies Only</p></div>
      <div class="bd-trust-item"><div class="icon">🔒</div><p>EFCC<br>Compliant</p></div>
      <div class="bd-trust-item"><div class="icon">📋</div><p>Receipt<br>Provided</p></div>
      <div class="bd-trust-item"><div class="icon">📱</div><p>WhatsApp<br>Rate Service</p></div>
    </div>
  </div>
</section>

<section class="bd-whatsapp">
  <h2>Get Today's FX Rate</h2>
  <p>Rates are updated daily. WhatsApp us to confirm today's buying and selling rate before you visit.</p>
  ${phone ? `<a class="bd-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get Rate on WhatsApp</a>` : ''}
</section>

<footer class="bd-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.${cbnBdcLicence ? ` CBN BDC Licence: ${cbnBdcLicence}.` : ''} | ${hours}</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Bureau de Change';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const cbnBdcLicence: string = (d['cbnBdcLicence'] as string) ?? '';
  const yearsOp: number = (d['yearsOfOperation'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="bd-header">
  <div class="bd-logo">${name}</div>
  <nav class="bd-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Get Rate</a></nav>
</header>
<section class="bd-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${cbnBdcLicence ? `<p style="background:#f5faf0;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 CBN BDC Licence: <strong>${cbnBdcLicence}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is a CBN-licensed bureau de change operating in ${city}, Nigeria.${yearsOp > 0 ? ` With over ${yearsOp} years of operation, we` : ' We'} provide reliable foreign exchange services to individuals, importers, and travellers.</p>
  <h3 style="margin-bottom:12px;color:#1a3a00">Our Compliance Standards</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ CBN BDC Licence — fully authorised to deal in foreign exchange</li>
    <li style="padding:6px 0">✓ EFCC AML/CFT compliance — all transactions above threshold reported</li>
    <li style="padding:6px 0">✓ NIN + BVN verification for regulated transactions</li>
    <li style="padding:6px 0">✓ CBN PTA/BTA form A documentation assistance</li>
    <li style="padding:6px 0">✓ Receipt issued for every transaction — FIRS compliant</li>
    <li style="padding:6px 0">✓ Genuine foreign currencies verified with UV light detector</li>
  </ul>
</section>
<footer class="bd-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Bureau de Change';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20today%27s%20FX%20rate%20at%20${encodeURIComponent(name)}`;
  const services = [
    { name: 'Currency Purchase (Buy)', desc: 'We buy foreign currency from you at today\'s buying rate. USD, EUR, GBP, CNY accepted.' },
    { name: 'Currency Sale (Sell)', desc: 'We sell foreign currency to you at today\'s selling rate. PTA ($5,000/trip) and BTA available.' },
    { name: 'Personal Travel Allowance (PTA)', desc: 'CBN-approved personal travel allowance: up to $5,000 per trip. Form A documentation required.' },
    { name: 'Business Travel Allowance (BTA)', desc: 'CBN-approved business travel allowance: up to $5,000 per trip. Supporting documents required.' },
    { name: 'Student Tuition Remittance', desc: 'Foreign currency for school fees abroad. CBN Form M + school admission letter required.' },
    { name: 'Medical Tourism Allowance', desc: 'Foreign currency for overseas medical treatment. Medical referral letter required.' },
    { name: 'Import Trade Facilitation', desc: 'FX for Form M (import documentation). We assist with documentation requirements.' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Services — ${name}</title>${css()}</head>
<body>
<header class="bd-header">
  <div class="bd-logo">${name}</div>
  <nav class="bd-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Get Rate</a></nav>
</header>
<section class="bd-section">
  <h2>FX Services</h2>
  <div class="bd-alert">
    <p>📊 <strong>Rates not shown on website</strong> — FX rates change daily. WhatsApp us for today's buying and selling rates before transacting.</p>
  </div>
  <div class="bd-services">
    ${services.map(s => `
    <div class="bd-service">
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:12px;background:#25d366;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.85rem" target="_blank" rel="noopener">Get Today's Rate</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="bd-footer"><p>&copy; ${new Date().getFullYear()} ${name}. Rates are subject to change without notice.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Bureau de Change';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 9am–5pm | Sat: 9am–2pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20today%27s%20FX%20rate%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Get Rate — ${name}</title>${css()}</head>
<body>
<header class="bd-header">
  <div class="bd-logo">${name}</div>
  <nav class="bd-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Get Rate</a></nav>
</header>
<section class="bd-section" style="max-width:640px">
  <h2>Get Today's FX Rate</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f5faf0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Rates & Transactions)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f5faf0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Office Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f5faf0;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Trading Hours</p><p style="font-weight:700">${hours}</p></div>
    <div class="bd-alert"><p>💡 To transact above $500 equivalent, please bring your NIN and BVN as required by CBN KYC regulations.</p></div>
  </div>
  ${phone ? `<a class="bd-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Get Today's Rate</a>` : ''}
</section>
<footer class="bd-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. CBN Licensed BDC.</p></footer>
</body></html>`;
}

export const bureauDeChangeFxDealerTemplate: WebsiteTemplateContract = {
  slug: 'bureau-de-change-fx-dealer',
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
