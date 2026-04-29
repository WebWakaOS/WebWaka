import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P32 — Spa / Wellness Centre template
 * CSS namespace: .sw-
 * Platform invariants: T4 (kobo), P13 (no client health data), P2 (Nigeria First)
 * Trust badge: NASC registration + state health permit
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#2c2c2c;background:#fff}
      .sw-header{background:#4a2c2a;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .sw-logo{font-size:1.3rem;font-weight:700;color:#f0c987;letter-spacing:.5px}
      .sw-nav a{color:#f0c987;text-decoration:none;margin-left:18px;font-size:.95rem}
      .sw-hero{background:linear-gradient(135deg,#4a2c2a 0%,#7b4a3e 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .sw-hero h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:700;margin-bottom:14px;letter-spacing:.5px}
      .sw-hero p{font-size:1.05rem;color:#f0c987cc;max-width:520px;margin:0 auto 32px}
      .sw-badge{display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);color:#fff;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:24px;backdrop-filter:blur(4px)}
      .sw-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .sw-cta:hover{background:#1ebe5d}
      .sw-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .sw-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#4a2c2a;text-align:center}
      .sw-services{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
      .sw-service{border:1px solid #f0e8e0;border-radius:16px;padding:28px;text-align:center;transition:.2s}
      .sw-service:hover{border-color:#c98a5a;box-shadow:0 4px 20px rgba(201,138,90,.1)}
      .sw-service .icon{font-size:2.2rem;margin-bottom:12px}
      .sw-service h3{font-size:1.1rem;font-weight:700;margin-bottom:8px;color:#4a2c2a}
      .sw-service .price{font-size:1.1rem;font-weight:700;color:#c98a5a;margin:8px 0}
      .sw-service p{font-size:.88rem;color:#777;line-height:1.5}
      .sw-trust{background:#fdf8f4;padding:56px 24px;text-align:center}
      .sw-trust-badges{display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin-top:24px}
      .sw-trust-badge{background:#fff;border:1px solid #f0e8e0;border-radius:12px;padding:16px 24px;min-width:160px}
      .sw-trust-badge .t-icon{font-size:1.6rem;margin-bottom:6px}
      .sw-trust-badge p{font-size:.88rem;color:#666;font-weight:600}
      .sw-whatsapp{background:#4a2c2a;color:#fff;padding:64px 24px;text-align:center}
      .sw-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#f0c987}
      .sw-whatsapp p{color:#f0c987cc;margin-bottom:28px}
      .sw-footer{background:#2c1a18;color:#888;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.sw-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Spa & Wellness';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const nascNumber: string = (d['nascNumber'] as string) ?? '';
  const statePermit: string = (d['stateHealthPermit'] as string) ?? '';
  const spaType: string = (d['spaType'] as string) ?? 'day_spa';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20an%20appointment%20at%20${encodeURIComponent(name)}`;

  const spaTypeLabel: Record<string, string> = {
    day_spa: 'Day Spa',
    hotel_spa: 'Hotel Spa',
    mobile: 'Mobile Spa (Home Service Available)',
  };

  const services = [
    { icon: '💆', name: 'Swedish Massage', price: 'From ₦15,000', desc: '60-minute full body relaxation massage', duration: '60 min' },
    { icon: '💪', name: 'Deep Tissue Massage', price: 'From ₦18,000', desc: 'Targeted muscle tension and pain relief', duration: '60 min' },
    { icon: '✨', name: 'Facial Treatment', price: 'From ₦12,000', desc: 'Deep cleansing, hydration and glow facial', duration: '45–60 min' },
    { icon: '🧖', name: 'Body Scrub & Wrap', price: 'From ₦20,000', desc: 'Full body exfoliation and skin renewal', duration: '90 min' },
    { icon: '💅', name: 'Manicure & Pedicure', price: 'From ₦8,000', desc: 'Classic mani/pedi with quality polish', duration: '45 min' },
    { icon: '🌿', name: 'Aromatherapy', price: 'From ₦16,000', desc: 'Essential oil massage for stress relief', duration: '60 min' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${spaTypeLabel[spaType] ?? 'Spa'} in ${city}</title>
${css()}
</head>
<body>
<header class="sw-header">
  <div class="sw-logo">${name}</div>
  <nav class="sw-nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/services">Services</a>
    <a href="/contact">Book</a>
  </nav>
</header>

<section class="sw-hero">
  ${nascNumber ? `<div class="sw-badge">🏅 NASC Registered · ${nascNumber}</div><br>` : ''}
  ${statePermit ? `<div class="sw-badge" style="margin-bottom:20px">✅ State Health Permit: ${statePermit}</div><br>` : ''}
  <h1>Luxury Spa & Wellness in ${city}</h1>
  <p>${spaTypeLabel[spaType] ?? 'Spa'} — Experience world-class treatments in a serene Nigerian setting.</p>
  ${phone ? `<a class="sw-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book an Appointment</a>` : ''}
</section>

<section class="sw-section">
  <h2>Our Treatments</h2>
  <div class="sw-services">
    ${services.map(s => `
    <div class="sw-service">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <div class="price">${s.price}</div>
      <p>${s.desc}</p>
      <p style="margin-top:6px;font-size:.82rem;color:#aaa">⏱ ${s.duration}</p>
    </div>`).join('')}
  </div>
</section>

<section class="sw-trust">
  <h2 style="font-size:1.7rem;font-weight:700;color:#4a2c2a;margin-bottom:8px">Why Choose ${name}?</h2>
  <div class="sw-trust-badges">
    ${nascNumber ? `<div class="sw-trust-badge"><div class="t-icon">🏅</div><p>NASC<br>Registered</p></div>` : ''}
    ${statePermit ? `<div class="sw-trust-badge"><div class="t-icon">✅</div><p>State Health<br>Permitted</p></div>` : ''}
    <div class="sw-trust-badge"><div class="t-icon">🌿</div><p>Natural<br>Products</p></div>
    <div class="sw-trust-badge"><div class="t-icon">🧼</div><p>Sterile &<br>Hygienic</p></div>
    <div class="sw-trust-badge"><div class="t-icon">🎓</div><p>Certified<br>Therapists</p></div>
    ${spaType === 'mobile' ? `<div class="sw-trust-badge"><div class="t-icon">🏠</div><p>Home Service<br>Available</p></div>` : ''}
  </div>
</section>

<section class="sw-whatsapp">
  <h2>Ready to Relax?</h2>
  <p>Book your appointment via WhatsApp. No hidden charges.</p>
  ${phone ? `<a class="sw-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book Now on WhatsApp</a>` : ''}
</section>

<footer class="sw-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Spa & Wellness';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const nascNumber: string = (d['nascNumber'] as string) ?? '';
  const therapistCerts: string = (d['therapistCertifications'] as string) ?? 'CIBTAC-certified therapists on staff';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="sw-header">
  <div class="sw-logo">${name}</div>
  <nav class="sw-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Book</a></nav>
</header>
<section class="sw-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${nascNumber ? `<p style="background:#fdf8f4;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 NASC Registration: <strong>${nascNumber}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is a premium spa and wellness centre in ${city}, Nigeria. We are committed to providing world-class relaxation and beauty treatments in a clean, serene environment.</p>
  <p style="margin-bottom:20px">${therapistCerts}</p>
  <h3 style="margin-bottom:12px;color:#4a2c2a">Our Promise</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ 100% natural and organic products used</li>
    <li style="padding:6px 0">✓ Sterile, single-use materials for all treatments</li>
    <li style="padding:6px 0">✓ Certified therapists with international training</li>
    <li style="padding:6px 0">✓ No hidden charges — prices as quoted</li>
    <li style="padding:6px 0">✓ Private treatment rooms for full comfort</li>
  </ul>
</section>
<footer class="sw-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Spa & Wellness';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20at%20${encodeURIComponent(name)}`;
  const services = [
    { name: 'Swedish Massage (60 min)', price: 'From ₦15,000' },
    { name: 'Deep Tissue Massage (60 min)', price: 'From ₦18,000' },
    { name: 'Hot Stone Massage (90 min)', price: 'From ₦25,000' },
    { name: 'Aromatherapy Massage (60 min)', price: 'From ₦16,000' },
    { name: 'Facial (45–60 min)', price: 'From ₦12,000' },
    { name: 'Body Scrub (60 min)', price: 'From ₦14,000' },
    { name: 'Body Wrap (90 min)', price: 'From ₦20,000' },
    { name: 'Classic Manicure', price: 'From ₦6,000' },
    { name: 'Classic Pedicure', price: 'From ₦7,000' },
    { name: 'Manicure & Pedicure Combo', price: 'From ₦12,000' },
    { name: 'Gel Manicure', price: 'From ₦10,000' },
    { name: 'Full Wax (Body)', price: 'From ₦15,000' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Services & Prices — ${name}</title>${css()}</head>
<body>
<header class="sw-header">
  <div class="sw-logo">${name}</div>
  <nav class="sw-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Book</a></nav>
</header>
<section class="sw-section">
  <h2>Treatments & Prices</h2>
  <div class="sw-services">
    ${services.map(s => `
    <div class="sw-service">
      <h3>${s.name}</h3>
      <div class="price">${s.price}</div>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:14px;background:#25d366;color:#fff;padding:8px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem" target="_blank" rel="noopener">Book This</a>` : ''}
    </div>`).join('')}
  </div>
  <p style="text-align:center;margin-top:32px;color:#888;font-size:.9rem">All prices in NGN. WhatsApp us for group/corporate package pricing.</p>
</section>
<footer class="sw-footer"><p>&copy; ${new Date().getFullYear()} ${name}.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Spa & Wellness';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Sat: 9am–8pm | Sun: 11am–6pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20an%20appointment%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Book — ${name}</title>${css()}</head>
<body>
<header class="sw-header">
  <div class="sw-logo">${name}</div>
  <nav class="sw-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Services</a><a href="/contact">Book</a></nav>
</header>
<section class="sw-section" style="max-width:640px">
  <h2>Book an Appointment</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#fdf8f4;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp Booking</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#fdf8f4;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Location</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#fdf8f4;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Hours</p><p style="font-weight:700">${hours}</p></div>
  </div>
  ${phone ? `<a class="sw-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Book on WhatsApp</a>` : ''}
</section>
<footer class="sw-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const spaWellnessCentreTemplate: WebsiteTemplateContract = {
  slug: 'spa-wellness-centre',
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
