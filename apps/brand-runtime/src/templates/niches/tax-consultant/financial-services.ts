import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P33 — Tax Consultant / Financial Services template
 * CSS namespace: .tc-
 * Platform invariants: T4 (kobo), P13 (no client TIN or tax liability data), P2 (Nigeria First)
 * Trust badge: FIRS Tax Agent Certificate + ICAN fellowship
 * Note: No automated tax advice — website is discovery/lead-gen only
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a2234;background:#fff}
      .tc-header{background:#0a2240;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .tc-logo{font-size:1.3rem;font-weight:700;color:#d4a843}
      .tc-nav a{color:#c9d5e8;text-decoration:none;margin-left:18px;font-size:.95rem}
      .tc-hero{background:linear-gradient(135deg,#0a2240 0%,#1a3a60 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .tc-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .tc-hero p{font-size:1.05rem;color:#b8cde0;max-width:560px;margin:0 auto 32px}
      .tc-badge{display:inline-block;background:rgba(212,168,67,.15);border:1px solid rgba(212,168,67,.4);color:#d4a843;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .tc-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .tc-cta:hover{background:#1ebe5d}
      .tc-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .tc-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#0a2240;text-align:center}
      .tc-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
      .tc-service{border:1px solid #e0e8f4;border-radius:14px;padding:24px}
      .tc-service .icon{font-size:1.8rem;margin-bottom:10px}
      .tc-service h3{font-weight:700;margin-bottom:8px;color:#0a2240}
      .tc-service p{font-size:.88rem;color:#666;line-height:1.5}
      .tc-credentials{background:#f5f8ff;padding:56px 24px}
      .tc-cred-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;max-width:1100px;margin:32px auto 0}
      .tc-cred{background:#fff;border-radius:12px;padding:20px;border:1px solid #e0e8f4;text-align:center}
      .tc-cred .icon{font-size:1.8rem;margin-bottom:8px}
      .tc-cred h4{font-weight:700;color:#0a2240;margin-bottom:6px}
      .tc-cred p{font-size:.85rem;color:#666}
      .tc-taxes{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
      .tc-tax-tag{background:#0a2240;color:#d4a843;padding:6px 14px;border-radius:20px;font-size:.85rem;font-weight:600}
      .tc-whatsapp{background:#0a2240;color:#fff;padding:64px 24px;text-align:center}
      .tc-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#d4a843}
      .tc-whatsapp p{color:#b8cde0;margin-bottom:28px}
      .tc-footer{background:#05131f;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.tc-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Tax Consulting Services';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const firsCert: string = (d['firsTaxAgentCert'] as string) ?? '';
  const icanNumber: string = (d['icanMembershipNumber'] as string) ?? '';
  const yearsOfPractice: number = (d['yearsOfPractice'] as number) ?? 0;
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20need%20tax%20consulting%20from%20${encodeURIComponent(name)}`;

  const services = [
    { icon: '📋', name: 'Company Income Tax (CIT)', desc: 'Annual CIT filing, computation, and payment coordination with FIRS TaxPro Max.' },
    { icon: '🧾', name: 'VAT Registration & Returns', desc: 'VAT registration, monthly/quarterly returns, and FIRS correspondence management.' },
    { icon: '👥', name: 'PAYE Management', desc: 'Monthly PAYE remittance, annual employer returns, and reconciliation.' },
    { icon: '✂️', name: 'Withholding Tax (WHT)', desc: 'WHT computation, remittance and management of WHT credit certificates.' },
    { icon: '🔍', name: 'Tax Audit Defence', desc: 'Representation before FIRS, SBIRS, and LIRS during tax investigations and audits.' },
    { icon: '🏢', name: 'Business Registration', desc: 'CAC incorporation, TIN registration, and full tax compliance setup for new businesses.' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="tc-header">
  <div class="tc-logo">${name}</div>
  <nav class="tc-nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/contact">Contact</a>
  </nav>
</header>

<section class="tc-hero">
  ${firsCert ? `<div class="tc-badge">🏅 FIRS Tax Agent Certificate: ${firsCert}</div><br>` : ''}
  ${icanNumber ? `<div class="tc-badge">🎓 ICAN Member: ${icanNumber}</div><br>` : ''}
  <h1>Professional Tax &amp; Financial Consulting in ${city}</h1>
  <p>Expert FIRS-licensed tax consultants helping Nigerian businesses stay compliant and pay only what they owe.${yearsOfPractice > 0 ? ` Over ${yearsOfPractice} years of practice.` : ''}</p>
  ${phone ? `<a class="tc-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book Free Consultation</a>` : ''}
</section>

<section class="tc-section">
  <h2>Our Services</h2>
  <div class="tc-services">
    ${services.map(s => `
    <div class="tc-service">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
    </div>`).join('')}
  </div>
</section>

<section class="tc-credentials">
  <h2 style="font-size:1.7rem;font-weight:700;color:#0a2240;text-align:center">Taxes We Handle</h2>
  <div style="max-width:700px;margin:20px auto;text-align:center">
    <div class="tc-taxes" style="justify-content:center">
      <span class="tc-tax-tag">VAT</span>
      <span class="tc-tax-tag">Company Income Tax (CIT)</span>
      <span class="tc-tax-tag">PAYE</span>
      <span class="tc-tax-tag">Withholding Tax (WHT)</span>
      <span class="tc-tax-tag">SDL</span>
      <span class="tc-tax-tag">Transfer Pricing</span>
      <span class="tc-tax-tag">Capital Gains Tax</span>
      <span class="tc-tax-tag">Stamp Duties</span>
    </div>
  </div>
  <div class="tc-cred-grid">
    ${firsCert ? `<div class="tc-cred"><div class="icon">🏅</div><h4>FIRS Licensed</h4><p>Tax Agent Cert: ${firsCert}</p></div>` : ''}
    ${icanNumber ? `<div class="tc-cred"><div class="icon">🎓</div><h4>ICAN Member</h4><p>${icanNumber}</p></div>` : ''}
    <div class="tc-cred"><div class="icon">🔒</div><h4>Client Confidential</h4><p>Your tax information is protected by professional privilege</p></div>
    <div class="tc-cred"><div class="icon">⚡</div><h4>TaxPro Max</h4><p>FIRS digital filing system — no queues</p></div>
  </div>
</section>

<section class="tc-whatsapp">
  <h2>Get a Free Tax Consultation</h2>
  <p>No commitment — 30-minute consultation to understand your tax position.</p>
  ${phone ? `<a class="tc-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book Free Consultation</a>` : ''}
</section>

<footer class="tc-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. | Information on this website is not tax advice — consult a qualified tax consultant for your specific situation.</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Tax Consulting Services';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const firsCert: string = (d['firsTaxAgentCert'] as string) ?? '';
  const icanNumber: string = (d['icanMembershipNumber'] as string) ?? '';
  const yearsOfPractice: number = (d['yearsOfPractice'] as number) ?? 0;
  const clientSectors: string = (d['clientSectors'] as string) ?? 'Manufacturing, FMCG, Fintech, NGOs, Professional Services';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="tc-header">
  <div class="tc-logo">${name}</div>
  <nav class="tc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Contact</a></nav>
</header>
<section class="tc-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${firsCert ? `<p style="background:#f5f8ff;border-radius:10px;padding:14px 18px;margin-bottom:16px">🏅 FIRS Tax Agent Certificate: <strong>${firsCert}</strong></p>` : ''}
  ${icanNumber ? `<p style="background:#f5f8ff;border-radius:10px;padding:14px 18px;margin-bottom:20px">🎓 ICAN Membership: <strong>${icanNumber}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is a professional tax consulting firm based in ${city}, Nigeria. ${yearsOfPractice > 0 ? `With over ${yearsOfPractice} years of practice, we` : 'We'} help businesses of all sizes navigate Nigeria's complex tax environment efficiently and compliantly.</p>
  <p style="margin-bottom:20px">We have served clients in: ${clientSectors}.</p>
  <h3 style="margin-bottom:12px;color:#0a2240">Our Approach</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ FIRS-licensed tax agents — full legal authority to represent you</li>
    <li style="padding:6px 0">✓ Complete confidentiality — tax privilege protected</li>
    <li style="padding:6px 0">✓ TaxPro Max certified — FIRS digital filing at speed</li>
    <li style="padding:6px 0">✓ Fixed-fee engagements — no billing surprises</li>
    <li style="padding:6px 0">✓ SBIRS and LIRS compliance in addition to FIRS</li>
  </ul>
</section>
<footer class="tc-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Tax Consulting Services';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20need%20help%20with%20${encodeURIComponent(name)}`;
  const services = [
    { name: 'Company Income Tax (CIT) Filing', fee: '₦80,000 – ₦400,000/year', desc: 'Annual computation, filing and FIRS payment coordination.' },
    { name: 'VAT Returns', fee: '₦25,000 – ₦80,000/return', desc: 'Monthly/quarterly VAT computation and TaxPro Max filing.' },
    { name: 'PAYE Management', fee: '₦30,000 – ₦100,000/month', desc: 'Monthly remittance, reconciliation and annual returns.' },
    { name: 'WHT Compliance', fee: 'Custom quote', desc: 'WHT computation, remittance and credit certificate management.' },
    { name: 'Tax Health Check', fee: '₦150,000 – ₦500,000', desc: 'Comprehensive review of all tax compliance positions.' },
    { name: 'Tax Audit Defence', fee: 'Custom quote', desc: 'FIRS/SBIRS/LIRS representation and objection filing.' },
    { name: 'Transfer Pricing Documentation', fee: 'Custom quote', desc: 'TP policy, local file and master file for multinational groups.' },
    { name: 'Business Registration & TIN', fee: '₦50,000 – ₦150,000', desc: 'CAC incorporation plus full FIRS/SBIRS TIN registration.' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Services — ${name}</title>${css()}</head>
<body>
<header class="tc-header">
  <div class="tc-logo">${name}</div>
  <nav class="tc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Contact</a></nav>
</header>
<section class="tc-section">
  <h2>Tax & Financial Services</h2>
  <div class="tc-services">
    ${services.map(s => `
    <div class="tc-service">
      <h3>${s.name}</h3>
      <p style="color:#d4a843;font-weight:700;margin:8px 0">${s.fee}</p>
      <p>${s.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:14px;background:#25d366;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem" target="_blank" rel="noopener">Inquire</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="tc-footer"><p>&copy; ${new Date().getFullYear()} ${name}. Fees are estimates — contact us for exact quotes.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Tax Consulting Services';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 8am–5pm | Sat: 9am–1pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20need%20a%20tax%20consultation%20from%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contact — ${name}</title>${css()}</head>
<body>
<header class="tc-header">
  <div class="tc-logo">${name}</div>
  <nav class="tc-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Contact</a></nav>
</header>
<section class="tc-section" style="max-width:640px">
  <h2>Book a Free Consultation</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f5f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Inquiries & Consultations)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f5f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Office Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f5f8ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Office Hours</p><p style="font-weight:700">${hours}</p></div>
  </div>
  ${phone ? `<a class="tc-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Book Free Consultation</a>` : ''}
</section>
<footer class="tc-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const taxConsultantFinancialServicesTemplate: WebsiteTemplateContract = {
  slug: 'tax-consultant-financial-services',
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
