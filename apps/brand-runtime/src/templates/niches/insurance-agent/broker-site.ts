import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P39 — Insurance Agent / Broker template
 * CSS namespace: .ia-
 * Platform invariants: T4 (kobo), P2 (Nigeria First)
 * Trust badge: NAICOM-licensed status
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2234;background:#fff}
      .ia-header{background:#0c2340;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .ia-logo{font-size:1.3rem;font-weight:700;color:#f0a820}
      .ia-nav a{color:#b8cce0;text-decoration:none;margin-left:18px;font-size:.95rem}
      .ia-hero{background:linear-gradient(135deg,#0c2340 0%,#1a3a60 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .ia-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .ia-hero p{font-size:1.05rem;color:#b8cce0;max-width:560px;margin:0 auto 32px}
      .ia-badge{display:inline-block;background:rgba(240,168,32,.15);border:1px solid rgba(240,168,32,.4);color:#f0a820;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .ia-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .ia-cta:hover{background:#1ebe5d}
      .ia-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .ia-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#0c2340;text-align:center}
      .ia-products{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
      .ia-product{border:1px solid #d4e0f0;border-radius:14px;padding:24px}
      .ia-product .icon{font-size:1.8rem;margin-bottom:10px}
      .ia-product h3{font-weight:700;margin-bottom:8px;color:#0c2340}
      .ia-product .compulsory{display:inline-block;background:#fff3e0;color:#e65100;font-size:.75rem;padding:2px 8px;border-radius:10px;font-weight:700;margin-bottom:8px}
      .ia-product p{font-size:.88rem;color:#666;line-height:1.5}
      .ia-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .ia-trust-item{background:#f5f8ff;border-radius:12px;padding:20px;text-align:center;border:1px solid #d4e0f0}
      .ia-trust-item .icon{font-size:1.6rem;margin-bottom:8px}
      .ia-trust-item h4{font-weight:700;color:#0c2340;margin-bottom:4px}
      .ia-trust-item p{font-size:.85rem;color:#666}
      .ia-whatsapp{background:#0c2340;color:#fff;padding:64px 24px;text-align:center}
      .ia-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#f0a820}
      .ia-whatsapp p{color:#b8cce0;margin-bottom:28px}
      .ia-footer{background:#07162a;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.ia-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Insurance Services';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const naicomLicence: string = (d['naicomLicenceNumber'] as string) ?? '';
  const yearsOfPractice: number = (d['yearsOfPractice'] as number) ?? 0;
  const underwriters: string = (d['underwriters'] as string) ?? 'Multiple NAICOM-licensed underwriters';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20need%20an%20insurance%20quote%20from%20${encodeURIComponent(name)}`;

  const products = [
    { icon: '🚗', name: 'Motor Insurance', compulsory: true, desc: 'Third-party (compulsory by law) and comprehensive motor insurance. Fast policy issuance.' },
    { icon: '🏠', name: 'Property / Home Insurance', compulsory: false, desc: 'Building, household contents, landlord\'s liability. Protects your biggest asset.' },
    { icon: '❤️', name: 'Life Insurance', compulsory: false, desc: 'Term life, whole life, and endowment plans. Protect your family\'s future.' },
    { icon: '🏥', name: 'Health Insurance / HMO', compulsory: false, desc: 'Individual and group HMO plans. NHIS-registered options available.' },
    { icon: '⚓', name: 'Marine / Cargo Insurance', compulsory: false, desc: 'Goods in transit — road, sea, and air. Import/export cargo coverage.' },
    { icon: '👥', name: 'Group Life (Employer)', compulsory: true, desc: 'Employers\' mandatory group life insurance (Pension Reform Act). Staff cover.' },
    { icon: '🏗️', name: 'Construction / Engineering', compulsory: false, desc: 'Building under construction, contractor\'s all risk, plant & machinery.' },
    { icon: '💼', name: 'Professional Indemnity', compulsory: false, desc: 'Cover for professionals (lawyers, doctors, consultants) against claims.' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="ia-header">
  <div class="ia-logo">${name}</div>
  <nav class="ia-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Products</a><a href="/contact">Get Quote</a>
  </nav>
</header>
<section class="ia-hero">
  ${naicomLicence ? `<div class="ia-badge">🏅 NAICOM Licensed Agent: ${naicomLicence}</div><br>` : '<div class="ia-badge">🏅 NAICOM Licensed Insurance Agent</div><br>'}
  <h1>Trusted Insurance Solutions in ${city}</h1>
  <p>NAICOM-licensed broker helping Nigerians and businesses get the right insurance coverage at the best price.${yearsOfPractice > 0 ? ` ${yearsOfPractice}+ years of practice.` : ''}</p>
  <p style="font-size:.9rem;color:#8ab0cc;margin-bottom:24px">${underwriters}</p>
  ${phone ? `<a class="ia-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get a Free Insurance Quote</a>` : ''}
</section>

<section class="ia-section">
  <h2>Insurance Products We Offer</h2>
  <div class="ia-products">
    ${products.map(p => `
    <div class="ia-product">
      <div class="icon">${p.icon}</div>
      ${p.compulsory ? '<span class="compulsory">⚠️ COMPULSORY BY LAW</span>' : ''}
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:12px;background:#0c2340;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.85rem" target="_blank" rel="noopener">Get Quote</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="ia-section" style="background:#f5f8ff;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Why Choose Us?</h2>
    <div class="ia-trust">
      ${naicomLicence ? `<div class="ia-trust-item"><div class="icon">🏅</div><h4>NAICOM Licensed</h4><p>Fully licensed and regulated insurance intermediary</p></div>` : ''}
      <div class="ia-trust-item"><div class="icon">💰</div><h4>Claims Support</h4><p>We represent you during claims — not just at policy purchase</p></div>
      <div class="ia-trust-item"><div class="icon">🤝</div><h4>Multiple Underwriters</h4><p>Access to Nigeria's best insurers — we find you the best rate</p></div>
      <div class="ia-trust-item"><div class="icon">📱</div><h4>WhatsApp Service</h4><p>Fast response via WhatsApp — policies issued digitally</p></div>
    </div>
  </div>
</section>

<section class="ia-whatsapp">
  <h2>Get Your Free Insurance Quote</h2>
  <p>Tell us what you need to cover — we'll compare rates from multiple insurers and recommend the best option.</p>
  ${phone ? `<a class="ia-cta" href="${waLink}" target="_blank" rel="noopener">📱 Get Quote on WhatsApp</a>` : ''}
</section>

<footer class="ia-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. NAICOM Licensed Insurance Agent.</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Insurance Services';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const naicomLicence: string = (d['naicomLicenceNumber'] as string) ?? '';
  const yearsOfPractice: number = (d['yearsOfPractice'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="ia-header">
  <div class="ia-logo">${name}</div>
  <nav class="ia-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Products</a><a href="/contact">Get Quote</a></nav>
</header>
<section class="ia-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${naicomLicence ? `<p style="background:#f5f8ff;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 NAICOM Licence: <strong>${naicomLicence}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is a NAICOM-licensed insurance intermediary in ${city}, Nigeria. ${yearsOfPractice > 0 ? `With ${yearsOfPractice}+ years of practice, we` : 'We'} help individuals, SMEs, and corporations get the right insurance coverage at competitive rates.</p>
  <h3 style="margin-bottom:12px;color:#0c2340">Our Promise</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ NAICOM-licensed and regulated — full professional accountability</li>
    <li style="padding:6px 0">✓ We represent YOU, not the insurer — we fight for your claims</li>
    <li style="padding:6px 0">✓ Access to multiple underwriters — best rate for your risk profile</li>
    <li style="padding:6px 0">✓ Fast policy issuance via WhatsApp — digital certificates delivered</li>
    <li style="padding:6px 0">✓ Transparent — all charges disclosed upfront</li>
  </ul>
</section>
<footer class="ia-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Insurance Services';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20an%20insurance%20quote%20from%20${encodeURIComponent(name)}`;
  const products = [
    { name: 'Motor — Third Party (Compulsory)', premium: 'From ₦15,000/year', law: true },
    { name: 'Motor — Comprehensive', premium: 'From ₦80,000/year (2.5–5% of vehicle value)', law: false },
    { name: 'Buildings Insurance (Compulsory for commercial)', premium: 'From ₦50,000/year', law: true },
    { name: 'Home Contents Insurance', premium: 'From ₦30,000/year', law: false },
    { name: 'Life Insurance (Term)', premium: 'From ₦50,000/year (depends on sum assured)', law: false },
    { name: 'Group Life (Employer Mandatory)', premium: '1% of annual basic salary per employee', law: true },
    { name: 'Health Insurance (Individual HMO)', premium: 'From ₦60,000/year', law: false },
    { name: 'Health Insurance (Family HMO)', premium: 'From ₦150,000/year', law: false },
    { name: 'Marine / Cargo', premium: 'Custom — % of cargo value', law: false },
    { name: 'Professional Indemnity', premium: 'Custom quote', law: false },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Insurance Products — ${name}</title>${css()}</head>
<body>
<header class="ia-header">
  <div class="ia-logo">${name}</div>
  <nav class="ia-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Products</a><a href="/contact">Get Quote</a></nav>
</header>
<section class="ia-section">
  <h2>Insurance Products & Premiums</h2>
  <p style="text-align:center;color:#888;margin-bottom:24px">Premiums are indicative — WhatsApp us for an exact quote based on your specific risk.</p>
  <div class="ia-products">
    ${products.map(p => `
    <div class="ia-product">
      ${p.law ? '<span class="compulsory">⚠️ COMPULSORY</span>' : ''}
      <h3>${p.name}</h3>
      <p style="color:#f0a820;font-weight:700;margin:8px 0">${p.premium}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:10px;background:#25d366;color:#fff;padding:8px 14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.85rem" target="_blank" rel="noopener">Get Quote</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="ia-footer"><p>&copy; ${new Date().getFullYear()} ${name}. Premiums are indicative only.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Insurance Services';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 8am–5pm | Sat: 10am–2pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20need%20an%20insurance%20quote%20from%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Get Quote — ${name}</title>${css()}</head>
<body>
<header class="ia-header">
  <div class="ia-logo">${name}</div>
  <nav class="ia-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Products</a><a href="/contact">Get Quote</a></nav>
</header>
<section class="ia-section" style="max-width:640px">
  <h2>Get a Free Insurance Quote</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f5f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Quotes & Claims Support)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f5f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Office Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f5f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Office Hours</p><p style="font-weight:700">${hours}</p></div>
  </div>
  ${phone ? `<a class="ia-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Get Quote on WhatsApp</a>` : ''}
</section>
<footer class="ia-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const insuranceAgentBrokerSiteTemplate: WebsiteTemplateContract = {
  slug: 'insurance-agent-broker-site',
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
