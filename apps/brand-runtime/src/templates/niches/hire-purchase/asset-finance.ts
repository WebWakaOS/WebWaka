import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P45 — Hire Purchase / Asset Finance template
 * CSS namespace: .hp-
 * Platform invariants: T4 (kobo integers; tenor_months as integer; installments as integer),
 *   P13 (no customer BVN ref in template — hashed), P2 (Nigeria First)
 * Trust badge: CBN consumer credit registration
 * Asset types: motorcycle | electronics | agricultural_equipment
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff}
      .hp-header{background:#6a2000;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .hp-logo{font-size:1.3rem;font-weight:700;color:#ff8c42}
      .hp-nav a{color:#f0c8a8;text-decoration:none;margin-left:18px;font-size:.95rem}
      .hp-hero{background:linear-gradient(135deg,#6a2000 0%,#9a3a00 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .hp-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .hp-hero p{font-size:1.05rem;color:#f0c8a8;max-width:560px;margin:0 auto 32px}
      .hp-badge{display:inline-block;background:rgba(255,140,66,.15);border:1px solid rgba(255,140,66,.4);color:#ff8c42;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .hp-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .hp-cta:hover{background:#1ebe5d}
      .hp-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .hp-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#6a2000;text-align:center}
      .hp-assets{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
      .hp-asset{border:2px solid #f0c8a8;border-radius:16px;padding:28px;text-align:center}
      .hp-asset.featured{border-color:#ff8c42;background:#fff8f4}
      .hp-asset .icon{font-size:2.5rem;margin-bottom:12px}
      .hp-asset h3{font-weight:700;margin-bottom:8px;color:#6a2000}
      .hp-asset .price-range{font-size:1rem;font-weight:600;color:#9a3a00;margin:6px 0}
      .hp-asset .example{background:#fff3e8;border-radius:8px;padding:10px 12px;font-size:.85rem;color:#5a1500;margin:12px 0;text-align:left}
      .hp-asset ul{list-style:none;text-align:left;font-size:.85rem;color:#555}
      .hp-asset ul li::before{content:"✓ ";color:#25d366;font-weight:700}
      .hp-asset ul li{padding:3px 0}
      .hp-how{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
      .hp-step{background:#fff8f4;border-radius:12px;padding:20px;text-align:center;border:1px solid #f0c8a8}
      .hp-step .num{background:#6a2000;color:#ff8c42;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;margin:0 auto 12px}
      .hp-step h4{font-weight:700;margin-bottom:6px;color:#6a2000}
      .hp-step p{font-size:.85rem;color:#666}
      .hp-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
      .hp-trust-item{background:#fff8f4;border-radius:10px;padding:16px;text-align:center;border:1px solid #f0c8a8}
      .hp-trust-item .icon{font-size:1.5rem;margin-bottom:6px}
      .hp-trust-item p{font-size:.85rem;font-weight:600;color:#6a2000}
      .hp-whatsapp{background:#6a2000;color:#fff;padding:64px 24px;text-align:center}
      .hp-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#ff8c42}
      .hp-whatsapp p{color:#f0c8a8;margin-bottom:28px}
      .hp-footer{background:#3a1000;color:#887;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.hp-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Hire Purchase Finance';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const cbnConsumerCreditReg: string = (d['cbnConsumerCreditReg'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20apply%20for%20hire%20purchase%20at%20${encodeURIComponent(name)}`;

  const assets = [
    {
      icon: '🏍️', name: 'Motorcycles', featured: true,
      priceRange: '₦400,000 – ₦800,000',
      example: '₦500,000 motorcycle: Pay ₦100,000 deposit + ₦25,000/week for 20 weeks',
      features: ['Bajaj, TVS, Honda, Qlink brands', 'Keke NAPEP (tricycles) available', 'New or certified refurbished', 'Instant handover after approval'],
    },
    {
      icon: '📱', name: 'Electronics', featured: false,
      priceRange: '₦50,000 – ₦500,000',
      example: '₦100,000 smartphone: Pay ₦20,000 deposit + ₦10,000/week for 10 weeks',
      features: ['Smartphones (Tecno, Infinix, Samsung)', 'TVs, refrigerators, fans, generators', 'New devices with warranty', 'Weekly payment collected at your location'],
    },
    {
      icon: '🌾', name: 'Farm Equipment', featured: false,
      priceRange: '₦150,000 – ₦2,000,000',
      example: '₦300,000 irrigation pump: Pay ₦60,000 deposit + ₦15,000/week for 20 weeks',
      features: ['Irrigation pumps and pipes', 'Hand tractors / power tillers', 'Threshers and shellers', 'Sprayers and seeders'],
    },
  ];

  const steps = [
    { num: '1', title: 'Apply on WhatsApp', desc: 'Tell us the asset you want and we\'ll share the application form' },
    { num: '2', title: 'Verification', desc: 'We verify your BVN, NIN, and guarantor details (24–48 hours)' },
    { num: '3', title: 'Pay Deposit', desc: 'Pay the agreed deposit (usually 20–30% of asset value)' },
    { num: '4', title: 'Get Your Asset', desc: 'Asset is handed over or delivered to you immediately after deposit' },
    { num: '5', title: 'Weekly Payments', desc: 'Our agent collects weekly installments at your location' },
    { num: '6', title: 'Own It Fully', desc: 'After final payment, full ownership is transferred to you' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="hp-header">
  <div class="hp-logo">${name}</div>
  <nav class="hp-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Assets & Plans</a><a href="/contact">Apply</a>
  </nav>
</header>
<section class="hp-hero">
  ${cbnConsumerCreditReg ? `<div class="hp-badge">🏅 CBN Consumer Credit Reg: ${cbnConsumerCreditReg}</div><br>` : '<div class="hp-badge">🏅 CBN Registered Consumer Credit Operator</div><br>'}
  <h1>Own It Now, Pay Later — Hire Purchase in ${city}</h1>
  <p>CBN-registered hire purchase finance. Get motorcycles, electronics, and farm equipment today — pay in weekly installments.</p>
  ${phone ? `<a class="hp-cta" href="${waLink}" target="_blank" rel="noopener">📱 Apply Now via WhatsApp</a>` : ''}
</section>

<section class="hp-section">
  <h2>Assets Available on Hire Purchase</h2>
  <div class="hp-assets">
    ${assets.map(a => `
    <div class="hp-asset${a.featured ? ' featured' : ''}">
      ${a.featured ? '<div style="color:#ff8c42;font-weight:700;font-size:.85rem;margin-bottom:8px">⭐ MOST POPULAR</div>' : ''}
      <div class="icon">${a.icon}</div>
      <h3>${a.name}</h3>
      <div class="price-range">Asset value: ${a.priceRange}</div>
      <div class="example">📊 Example: ${a.example}</div>
      <ul>${a.features.map(f => `<li>${f}</li>`).join('')}</ul>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:16px;background:#6a2000;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center" target="_blank" rel="noopener">Apply Now</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="hp-section" style="background:#fff8f4;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>How It Works</h2>
    <div class="hp-how">
      ${steps.map(s => `
      <div class="hp-step">
        <div class="num">${s.num}</div>
        <h4>${s.title}</h4>
        <p>${s.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="hp-section">
  <h2>Why Choose ${name}?</h2>
  <div class="hp-trust">
    ${cbnConsumerCreditReg ? `<div class="hp-trust-item"><div class="icon">🏅</div><p>CBN Registered<br>Credit Operator</p></div>` : ''}
    <div class="hp-trust-item"><div class="icon">🤝</div><p>No Hidden<br>Charges</p></div>
    <div class="hp-trust-item"><div class="icon">🏠</div><p>Payment Collected<br>at Your Location</p></div>
    <div class="hp-trust-item"><div class="icon">⚡</div><p>Fast Approval<br>24–48 hours</p></div>
    <div class="hp-trust-item"><div class="icon">📱</div><p>WhatsApp<br>Application</p></div>
  </div>
</section>

<section class="hp-whatsapp">
  <h2>Apply for Hire Purchase Today</h2>
  <p>WhatsApp us to start your application. No commitment until we agree on terms.</p>
  ${phone ? `<a class="hp-cta" href="${waLink}" target="_blank" rel="noopener">📱 Apply Now on WhatsApp</a>` : ''}
</section>

<footer class="hp-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.${cbnConsumerCreditReg ? ` CBN Consumer Credit Reg: ${cbnConsumerCreditReg}.` : ''}</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Hire Purchase Finance';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const cbnConsumerCreditReg: string = (d['cbnConsumerCreditReg'] as string) ?? '';
  const yearsOp: number = (d['yearsOfOperation'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="hp-header">
  <div class="hp-logo">${name}</div>
  <nav class="hp-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Assets & Plans</a><a href="/contact">Apply</a></nav>
</header>
<section class="hp-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${cbnConsumerCreditReg ? `<p style="background:#fff8f4;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 CBN Consumer Credit Registration: <strong>${cbnConsumerCreditReg}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is a CBN-registered consumer credit operator in ${city}.${yearsOp > 0 ? ` With ${yearsOp}+ years of operation, we` : ' We'} help low-income earners and small traders acquire productive and household assets through affordable hire purchase plans.</p>
  <h3 style="margin-bottom:12px;color:#6a2000">Our Approach</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ CBN-registered — full legal consumer credit authority</li>
    <li style="padding:6px 0">✓ Weekly payment collection at your location — convenient</li>
    <li style="padding:6px 0">✓ Guarantor system — we don't exclude people without formal credit history</li>
    <li style="padding:6px 0">✓ No hidden charges — all terms agreed upfront in writing</li>
    <li style="padding:6px 0">✓ Asset ownership fully transferred on final payment</li>
    <li style="padding:6px 0">✓ Repossession is last resort — we work with you first if you face difficulty</li>
  </ul>
</section>
<footer class="hp-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Hire Purchase Finance';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20apply%20for%20hire%20purchase%20at%20${encodeURIComponent(name)}`;
  const plans = [
    { asset: 'Motorcycle (Bajaj/TVS/Honda)', price: '₦400,000–₦800,000', deposit: '20–25%', tenor: '16–24 weeks', weekly: '₦15,000–₦35,000/week' },
    { asset: 'Keke NAPEP (Tricycle)', price: '₦700,000–₦1,200,000', deposit: '25–30%', tenor: '20–30 weeks', weekly: '₦20,000–₦45,000/week' },
    { asset: 'Smartphone (Tecno/Infinix)', price: '₦80,000–₦250,000', deposit: '20%', tenor: '8–12 weeks', weekly: '₦8,000–₦25,000/week' },
    { asset: 'Television (32"–65")', price: '₦80,000–₦300,000', deposit: '20%', tenor: '8–16 weeks', weekly: '₦5,000–₦25,000/week' },
    { asset: 'Refrigerator', price: '₦120,000–₦350,000', deposit: '25%', tenor: '12–20 weeks', weekly: '₦8,000–₦20,000/week' },
    { asset: 'Generator (2.5kVA–5kVA)', price: '₦150,000–₦500,000', deposit: '25%', tenor: '12–20 weeks', weekly: '₦10,000–₦30,000/week' },
    { asset: 'Irrigation Pump', price: '₦100,000–₦400,000', deposit: '20%', tenor: '12–20 weeks', weekly: '₦6,000–₦25,000/week' },
    { asset: 'Hand Tractor / Power Tiller', price: '₦400,000–₦1,500,000', deposit: '25%', tenor: '20–32 weeks', weekly: '₦15,000–₦60,000/week' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Assets & Plans — ${name}</title>${css()}</head>
<body>
<header class="hp-header">
  <div class="hp-logo">${name}</div>
  <nav class="hp-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Assets & Plans</a><a href="/contact">Apply</a></nav>
</header>
<section class="hp-section">
  <h2>Available Assets & Instalment Plans</h2>
  <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;min-width:600px">
      <thead><tr style="background:#6a2000;color:#fff">
        <th style="padding:12px;text-align:left">Asset</th>
        <th style="padding:12px;text-align:left">Price Range</th>
        <th style="padding:12px;text-align:left">Min. Deposit</th>
        <th style="padding:12px;text-align:left">Tenor</th>
        <th style="padding:12px;text-align:left">Weekly Payment</th>
        <th style="padding:12px;text-align:left"></th>
      </tr></thead>
      <tbody>
        ${plans.map((p, i) => `<tr style="background:${i % 2 === 0 ? '#fff' : '#fff8f4'}">
          <td style="padding:10px 12px;font-weight:600">${p.asset}</td>
          <td style="padding:10px 12px">${p.price}</td>
          <td style="padding:10px 12px">${p.deposit}</td>
          <td style="padding:10px 12px">${p.tenor}</td>
          <td style="padding:10px 12px;color:#6a2000;font-weight:600">${p.weekly}</td>
          <td style="padding:10px 12px">${phone ? `<a href="${waLink}" style="background:#25d366;color:#fff;padding:6px 12px;border-radius:6px;text-decoration:none;font-weight:700;font-size:.82rem;white-space:nowrap" target="_blank" rel="noopener">Apply</a>` : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
  <p style="margin-top:20px;color:#888;font-size:.88rem;text-align:center">All plans are indicative. Final terms depend on your credit profile and guarantor. Terms in NGN — no foreign currency obligations.</p>
</section>
<footer class="hp-footer"><p>&copy; ${new Date().getFullYear()} ${name}.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Hire Purchase Finance';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Sat: 8am–6pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20apply%20for%20hire%20purchase%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Apply — ${name}</title>${css()}</head>
<body>
<header class="hp-header">
  <div class="hp-logo">${name}</div>
  <nav class="hp-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Assets & Plans</a><a href="/contact">Apply</a></nav>
</header>
<section class="hp-section" style="max-width:640px">
  <h2>Apply for Hire Purchase</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#fff8f4;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Applications & Inquiries)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#fff8f4;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Office Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#fff8f4;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Office Hours</p><p style="font-weight:700">${hours}</p></div>
    <div style="background:#fff8f4;border-radius:12px;padding:16px"><p style="font-size:.9rem;color:#5a1500"><strong>What you need to apply:</strong> Valid ID (NIN), BVN, guarantor details, 3-month bank statement (or equivalent income proof). Everything starts on WhatsApp.</p></div>
  </div>
  ${phone ? `<a class="hp-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Apply Now on WhatsApp</a>` : ''}
</section>
<footer class="hp-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const hirePurchaseAssetFinanceTemplate: WebsiteTemplateContract = {
  slug: 'hire-purchase-asset-finance',
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
