import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P43 — Mobile Money / POS Agent template
 * CSS namespace: .mm-
 * Platform invariants: T4 (kobo), P13 (no customer BVN ref in template — hashed), P2 (Nigeria First)
 * Trust badge: CBN sub-agent number
 * Daily cap: 30,000,000 kobo (₦300,000) enforced at route level (not website)
 * SLUG MISMATCH: vertical uses 'mobile-money' vs template slug 'mobile-money-agent' — await migration 0037
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2234;background:#fff}
      .mm-header{background:#004d7a;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .mm-logo{font-size:1.3rem;font-weight:700;color:#00d2ff}
      .mm-nav a{color:#a8d4f0;text-decoration:none;margin-left:18px;font-size:.95rem}
      .mm-hero{background:linear-gradient(135deg,#004d7a 0%,#0077b6 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .mm-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .mm-hero p{font-size:1.05rem;color:#a8d4f0;max-width:560px;margin:0 auto 32px}
      .mm-badge{display:inline-block;background:rgba(0,210,255,.15);border:1px solid rgba(0,210,255,.4);color:#00d2ff;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .mm-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .mm-cta:hover{background:#1ebe5d}
      .mm-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .mm-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#004d7a;text-align:center}
      .mm-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .mm-service{background:#f0f8ff;border-radius:14px;padding:24px;text-align:center;border:1px solid #c8e4f8}
      .mm-service .icon{font-size:2.2rem;margin-bottom:10px}
      .mm-service h3{font-weight:700;color:#004d7a;margin-bottom:6px}
      .mm-service p{font-size:.85rem;color:#666}
      .mm-networks{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:16px 0}
      .mm-network{background:#004d7a;color:#00d2ff;padding:6px 16px;border-radius:20px;font-size:.85rem;font-weight:600}
      .mm-info{background:#fff8e0;border-radius:14px;padding:20px 24px;border:1px solid #ffe082}
      .mm-info p{font-size:.9rem;color:#795548}
      .mm-whatsapp{background:#004d7a;color:#fff;padding:64px 24px;text-align:center}
      .mm-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#00d2ff}
      .mm-whatsapp p{color:#a8d4f0;margin-bottom:28px}
      .mm-footer{background:#00304d;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.mm-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Mobile Money Agent';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const cbnSubAgentNumber: string = (d['cbnSubAgentNumber'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const lga: string = (d['lga'] as string) ?? '';
  const networks: string[] = (d['networks'] as string[]) ?? ['OPay', 'Moniepoint', 'MTN MoMo'];
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Sat: 7am–9pm | Sun: 10am–6pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20need%20to%20find%20your%20location%20at%20${encodeURIComponent(name)}`;

  const services = [
    { icon: '💵', name: 'Cash Out', desc: 'Withdraw cash from your mobile wallet or bank account' },
    { icon: '📥', name: 'Cash In / Deposit', desc: 'Deposit cash into any Nigerian bank account' },
    { icon: '💸', name: 'Bank Transfer', desc: 'Send money to any Nigerian bank account' },
    { icon: '📱', name: 'Airtime Top-Up', desc: 'MTN, Airtel, Glo, 9Mobile recharge' },
    { icon: '📋', name: 'Bill Payments', desc: 'DSTV, electricity, water, school fees, JAMB' },
    { icon: '🏦', name: 'Account Opening', desc: 'Open a USSD bank account on the spot' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${lga || city}</title>
${css()}
</head>
<body>
<header class="mm-header">
  <div class="mm-logo">${name}</div>
  <nav class="mm-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Find Us</a>
  </nav>
</header>
<section class="mm-hero">
  ${cbnSubAgentNumber ? `<div class="mm-badge">🏅 CBN Licensed Sub-Agent: ${cbnSubAgentNumber}</div><br>` : '<div class="mm-badge">🏅 CBN Licensed Mobile Money Agent</div><br>'}
  <h1>Fast Cash Services${lga ? ` in ${lga}` : ` in ${city}`}</h1>
  <p>CBN-licensed mobile money agent. Cash out, deposits, transfers, airtime, and bill payments. Open ${hours}.</p>
  <div class="mm-networks">
    ${networks.map((n: string) => `<span class="mm-network">${n}</span>`).join('')}
  </div>
  ${phone ? `<a class="mm-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get Our Location on WhatsApp</a>` : ''}
</section>

<section class="mm-section">
  <h2>Our Services</h2>
  <div class="mm-services">
    ${services.map(s => `
    <div class="mm-service">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
    </div>`).join('')}
  </div>
</section>

<section class="mm-section">
  <div class="mm-info">
    <p>📍 <strong>Location:</strong> ${address ? `${address}, ${lga || city}` : `${lga || city}, ${city}`}</p>
    <p style="margin-top:8px">⏰ <strong>Hours:</strong> ${hours}</p>
    ${cbnSubAgentNumber ? `<p style="margin-top:8px">🏅 <strong>CBN Sub-Agent No:</strong> ${cbnSubAgentNumber}</p>` : ''}
    <p style="margin-top:8px">💳 <strong>Max transaction:</strong> ₦300,000 daily (CBN regulated)</p>
  </div>
</section>

<section class="mm-whatsapp">
  <h2>Find Our Agent Location</h2>
  <p>WhatsApp us for precise location, current queue status, or to confirm we're open.</p>
  ${phone ? `<a class="mm-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get Directions on WhatsApp</a>` : ''}
</section>

<footer class="mm-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. CBN Licensed Agent Banking.</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Mobile Money Agent';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const cbnSubAgentNumber: string = (d['cbnSubAgentNumber'] as string) ?? '';
  const networks: string[] = (d['networks'] as string[]) ?? ['OPay', 'Moniepoint'];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="mm-header">
  <div class="mm-logo">${name}</div>
  <nav class="mm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Find Us</a></nav>
</header>
<section class="mm-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${cbnSubAgentNumber ? `<p style="background:#f0f8ff;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 CBN Sub-Agent Number: <strong>${cbnSubAgentNumber}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is a CBN-licensed mobile money sub-agent in ${city}. We are authorised by the Central Bank of Nigeria to provide agent banking services.</p>
  <p style="margin-bottom:20px">We operate on: ${networks.join(', ')}.</p>
  <h3 style="margin-bottom:12px;color:#004d7a">Regulatory Compliance</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ CBN-licensed sub-agent — full legal authority to transact</li>
    <li style="padding:6px 0">✓ Daily transaction limits per CBN regulation (₦300,000)</li>
    <li style="padding:6px 0">✓ All transactions logged and auditable</li>
    <li style="padding:6px 0">✓ Customer identity verified per KYC requirements</li>
    <li style="padding:6px 0">✓ Receipts provided for every transaction</li>
  </ul>
</section>
<footer class="mm-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Mobile Money Agent';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20use%20services%20at%20${encodeURIComponent(name)}`;
  const services = [
    { name: 'Cash Withdrawal (Cash Out)', charge: 'From ₦100/transaction', desc: 'Withdraw cash from your OPay, Moniepoint, GTWorld, FirstMonie, or any bank mobile wallet.' },
    { name: 'Cash Deposit', charge: 'Free / From ₦50', desc: 'Deposit cash into any Nigerian bank account — instant settlement.' },
    { name: 'Bank Transfer', charge: 'From ₦50', desc: 'Send money to any bank account in Nigeria. Processed instantly.' },
    { name: 'Airtime Purchase', charge: 'Free / small commission', desc: 'MTN, Airtel, Glo, and 9Mobile airtime top-up.' },
    { name: 'Data Bundle', charge: 'At standard rates', desc: 'Mobile data bundles for MTN, Airtel, Glo, 9Mobile.' },
    { name: 'DSTV / GOtv Payment', charge: 'Free', desc: 'Pay your DSTV or GOtv subscription instantly.' },
    { name: 'Electricity (NEPA) Payment', charge: 'Free', desc: 'Prepaid electricity token purchase for all DISCOs.' },
    { name: 'School Fees Payment', charge: 'Varies', desc: 'Pay school fees for institutions that accept mobile money.' },
    { name: 'JAMB PIN/Scratch Card', charge: 'Standard price', desc: 'Buy JAMB registration PINs and scratch cards.' },
    { name: 'Account Opening', charge: 'Free', desc: 'Open a basic savings account using BVN + NIN on the spot.' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Services — ${name}</title>${css()}</head>
<body>
<header class="mm-header">
  <div class="mm-logo">${name}</div>
  <nav class="mm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Find Us</a></nav>
</header>
<section class="mm-section">
  <h2>Our Services & Charges</h2>
  <div class="mm-services" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">
    ${services.map(s => `
    <div class="mm-service" style="text-align:left">
      <h3>${s.name}</h3>
      <p style="color:#004d7a;font-weight:700;margin:6px 0">${s.charge}</p>
      <p>${s.desc}</p>
    </div>`).join('')}
  </div>
  <div class="mm-info" style="margin-top:32px">
    <p>📋 <strong>Regulatory note:</strong> Maximum daily transaction limit per CBN regulation: ₦300,000 per agent. Transactions may require BVN or NIN verification as required by CBN KYC guidelines.</p>
  </div>
</section>
<footer class="mm-footer"><p>&copy; ${new Date().getFullYear()} ${name}. Charges subject to change — confirm at point of transaction.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Mobile Money Agent';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const lga: string = (d['lga'] as string) ?? '';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Sat: 7am–9pm | Sun: 10am–6pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20need%20directions%20to%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Find Us — ${name}</title>${css()}</head>
<body>
<header class="mm-header">
  <div class="mm-logo">${name}</div>
  <nav class="mm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Find Us</a></nav>
</header>
<section class="mm-section" style="max-width:640px">
  <h2>Find Our Location</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f0f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Location & Inquiries)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f0f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Agent Location</p><p style="font-weight:700">${address}${lga ? `, ${lga}` : ''}, ${city}</p></div>` : ''}
    <div style="background:#f0f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Operating Hours</p><p style="font-weight:700">${hours}</p></div>
    <div style="background:#f0f8ff;border-radius:12px;padding:16px"><p style="font-size:.88rem;color:#555">💡 Daily transaction limit: <strong>₦300,000</strong> per CBN regulation. BVN/NIN required for transactions above ₦50,000.</p></div>
  </div>
  ${phone ? `<a class="mm-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Get Directions on WhatsApp</a>` : ''}
</section>
<footer class="mm-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. CBN Licensed.</p></footer>
</body></html>`;
}

export const mobileMoneyAgentFintechTemplate: WebsiteTemplateContract = {
  slug: 'mobile-money-agent-fintech',
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
