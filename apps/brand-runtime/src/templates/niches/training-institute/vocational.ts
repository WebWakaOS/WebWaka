import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P35 — Training Institute / Vocational School template
 * CSS namespace: .ti-
 * Platform invariants: T4 (kobo), P13 (student_ref_id opaque), P2 (Nigeria First)
 * Trust badge: NBTE accreditation number
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff}
      .ti-header{background:#1a1a2e;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .ti-logo{font-size:1.3rem;font-weight:700;color:#e94560}
      .ti-nav a{color:#c8c8e0;text-decoration:none;margin-left:18px;font-size:.95rem}
      .ti-hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .ti-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .ti-hero p{font-size:1.05rem;color:#b8c8e0;max-width:560px;margin:0 auto 32px}
      .ti-badge{display:inline-block;background:rgba(233,69,96,.15);border:1px solid rgba(233,69,96,.4);color:#e94560;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .ti-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .ti-cta:hover{background:#1ebe5d}
      .ti-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .ti-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#1a1a2e;text-align:center}
      .ti-courses{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
      .ti-course{border:1px solid #e0e0f0;border-radius:14px;padding:24px}
      .ti-course .icon{font-size:2rem;margin-bottom:10px}
      .ti-course h3{font-weight:700;margin-bottom:8px;color:#1a1a2e}
      .ti-course .fee{font-size:1.1rem;font-weight:700;color:#e94560;margin:8px 0}
      .ti-course p{font-size:.88rem;color:#666;line-height:1.5}
      .ti-outcomes{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:8px}
      .ti-outcome{background:#f5f5fa;border-radius:10px;padding:16px;text-align:center}
      .ti-outcome .icon{font-size:1.5rem;margin-bottom:6px}
      .ti-outcome p{font-size:.85rem;font-weight:600;color:#1a1a2e}
      .ti-whatsapp{background:#1a1a2e;color:#fff;padding:64px 24px;text-align:center}
      .ti-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#e94560}
      .ti-whatsapp p{color:#b8c8e0;margin-bottom:28px}
      .ti-footer{background:#0d0d1e;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.ti-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Training Institute';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const nbteAccreditation: string = (d['nbteAccreditation'] as string) ?? '';
  const graduateEmploymentRate: number = (d['graduateEmploymentRate'] as number) ?? 0;
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20enroll%20at%20${encodeURIComponent(name)}`;

  const courses = [
    { icon: '💻', name: 'ICT & Computer Operations', fee: 'From ₦35,000', duration: '3 months', cert: 'NABTEB Certificate' },
    { icon: '⚡', name: 'Electrical Installation', fee: 'From ₦50,000', duration: '6 months', cert: 'NABTEB Certificate' },
    { icon: '🔧', name: 'Mechanical Engineering', fee: 'From ₦55,000', duration: '6 months', cert: 'NABTEB Certificate' },
    { icon: '✂️', name: 'Fashion & Tailoring', fee: 'From ₦40,000', duration: '4 months', cert: 'NABTEB Certificate' },
    { icon: '🍳', name: 'Catering & Hospitality', fee: 'From ₦45,000', duration: '4 months', cert: 'NABTEB Certificate' },
    { icon: '🌾', name: 'Agricultural Technology', fee: 'From ₦35,000', duration: '3 months', cert: 'NABTEB Certificate' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="ti-header">
  <div class="ti-logo">${name}</div>
  <nav class="ti-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Courses</a><a href="/contact">Enroll</a>
  </nav>
</header>
<section class="ti-hero">
  ${nbteAccreditation ? `<div class="ti-badge">🏅 NBTE Accredited: ${nbteAccreditation}</div><br>` : ''}
  ${graduateEmploymentRate > 0 ? `<div class="ti-badge">✅ ${graduateEmploymentRate}% Graduate Employment Rate</div><br>` : ''}
  <h1>Skill Up. Get Certified. Get Employed.</h1>
  <p>NBTE-accredited vocational and technical training in ${city}. Real skills for the Nigerian job market.</p>
  ${phone ? `<a class="ti-cta" href="${waLink}" target="_blank" rel="noopener">📱 Enroll Now via WhatsApp</a>` : ''}
</section>
<section class="ti-section">
  <h2>Our Courses</h2>
  <div class="ti-courses">
    ${courses.map(c => `
    <div class="ti-course">
      <div class="icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <div class="fee">${c.fee}</div>
      <p>Duration: ${c.duration} | ${c.cert}</p>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:14px;background:#e94560;color:#fff;padding:8px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;text-align:center" target="_blank" rel="noopener">Enroll</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<section class="ti-section" style="background:#f5f5fa;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Why Train With Us?</h2>
    <div class="ti-outcomes">
      ${nbteAccreditation ? `<div class="ti-outcome"><div class="icon">🏅</div><p>NBTE Accredited</p></div>` : ''}
      <div class="ti-outcome"><div class="icon">🔬</div><p>Hands-on Workshop Training</p></div>
      <div class="ti-outcome"><div class="icon">📜</div><p>NABTEB Certified</p></div>
      <div class="ti-outcome"><div class="icon">💼</div><p>SIWES Placement Support</p></div>
      <div class="ti-outcome"><div class="icon">💰</div><p>Payment Instalment Available</p></div>
      ${graduateEmploymentRate > 0 ? `<div class="ti-outcome"><div class="icon">✅</div><p>${graduateEmploymentRate}% Employment Rate</p></div>` : ''}
    </div>
  </div>
</section>
<section class="ti-whatsapp">
  <h2>Start Your Skill Journey Today</h2>
  <p>WhatsApp us to enroll or get more information about any course.</p>
  ${phone ? `<a class="ti-cta" href="${waLink}" target="_blank" rel="noopener">📱 Enroll Now on WhatsApp</a>` : ''}
</section>
<footer class="ti-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. NBTE Accredited.</p></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Training Institute';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const nbteAccreditation: string = (d['nbteAccreditation'] as string) ?? '';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="ti-header">
  <div class="ti-logo">${name}</div>
  <nav class="ti-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Courses</a><a href="/contact">Enroll</a></nav>
</header>
<section class="ti-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${nbteAccreditation ? `<p style="background:#f5f5fa;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 NBTE Accreditation: <strong>${nbteAccreditation}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is an NBTE-accredited vocational and technical training institution in ${city}, dedicated to equipping Nigerians with practical, marketable skills.</p>
  <p style="margin-bottom:20px">We partner with NABTEB for certificate examinations and support SIWES placements for qualifying students.</p>
  <h3 style="margin-bottom:12px;color:#1a1a2e">Our Facilities</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ Modern workshops equipped with industry-standard tools</li>
    <li style="padding:6px 0">✓ Computer lab with broadband internet access</li>
    <li style="padding:6px 0">✓ Experienced industry-practitioner instructors</li>
    <li style="padding:6px 0">✓ SIWES placement assistance for all qualifying programmes</li>
    <li style="padding:6px 0">✓ Flexible payment — installment plans available</li>
  </ul>
</section>
<footer class="ti-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Training Institute';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20enroll%20at%20${encodeURIComponent(name)}`;
  const courses = [
    { name: 'ICT & Computer Operations', fee: '₦35,000–₦60,000', duration: '3–6 months', cert: 'NABTEB' },
    { name: 'Electrical Installation', fee: '₦50,000–₦80,000', duration: '6 months', cert: 'NABTEB' },
    { name: 'Plumbing & Pipe Fitting', fee: '₦45,000–₦70,000', duration: '4 months', cert: 'NABTEB' },
    { name: 'Auto Mechanics', fee: '₦55,000–₦90,000', duration: '6 months', cert: 'NABTEB' },
    { name: 'Fashion Design & Tailoring', fee: '₦40,000–₦65,000', duration: '4 months', cert: 'NABTEB' },
    { name: 'Catering & Hospitality', fee: '₦45,000–₦70,000', duration: '4 months', cert: 'NABTEB' },
    { name: 'Cosmetology & Beauty', fee: '₦40,000–₦60,000', duration: '4 months', cert: 'NABTEB' },
    { name: 'Agricultural Technology', fee: '₦35,000–₦55,000', duration: '3 months', cert: 'NABTEB' },
    { name: 'Welding & Fabrication', fee: '₦55,000–₦80,000', duration: '6 months', cert: 'NABTEB' },
    { name: 'Building Construction', fee: '₦60,000–₦90,000', duration: '6 months', cert: 'NABTEB' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Courses — ${name}</title>${css()}</head>
<body>
<header class="ti-header">
  <div class="ti-logo">${name}</div>
  <nav class="ti-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Courses</a><a href="/contact">Enroll</a></nav>
</header>
<section class="ti-section">
  <h2>All Courses & Fees</h2>
  <div class="ti-courses">
    ${courses.map(c => `
    <div class="ti-course">
      <h3>${c.name}</h3>
      <div class="fee">${c.fee}</div>
      <p>Duration: ${c.duration} | Certification: ${c.cert}</p>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:14px;background:#25d366;color:#fff;padding:8px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem;text-align:center" target="_blank" rel="noopener">Enroll</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="ti-footer"><p>&copy; ${new Date().getFullYear()} ${name}. Fees are approximate — contact us for exact quote.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Training Institute';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Fri: 8am–5pm | Sat: 9am–2pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20enroll%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Enroll — ${name}</title>${css()}</head>
<body>
<header class="ti-header">
  <div class="ti-logo">${name}</div>
  <nav class="ti-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Courses</a><a href="/contact">Enroll</a></nav>
</header>
<section class="ti-section" style="max-width:640px">
  <h2>Enroll Today</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f5f5fa;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Enrollment)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f5f5fa;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f5f5fa;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Hours</p><p style="font-weight:700">${hours}</p></div>
  </div>
  ${phone ? `<a class="ti-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Enroll on WhatsApp</a>` : ''}
</section>
<footer class="ti-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const trainingInstituteVocationalTemplate: WebsiteTemplateContract = {
  slug: 'training-institute-vocational',
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
