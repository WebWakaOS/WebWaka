import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P34 — Driving School template
 * CSS namespace: .ds-
 * Platform invariants: T4 (kobo), P13 (student_ref_id opaque), P2 (Nigeria First)
 * Trust badge: FRSC registration number + CAC RC
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff}
      .ds-header{background:#1a3a1a;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .ds-logo{font-size:1.3rem;font-weight:700;color:#f5c842}
      .ds-nav a{color:#c5ddc5;text-decoration:none;margin-left:18px;font-size:.95rem}
      .ds-hero{background:linear-gradient(135deg,#1a3a1a 0%,#2d5a2d 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .ds-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .ds-hero p{font-size:1.05rem;color:#b8d4b8;max-width:560px;margin:0 auto 32px}
      .ds-badge{display:inline-block;background:rgba(245,200,66,.15);border:1px solid rgba(245,200,66,.4);color:#f5c842;padding:6px 18px;border-radius:20px;font-size:.85rem;margin-bottom:16px}
      .ds-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .ds-cta:hover{background:#1ebe5d}
      .ds-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .ds-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#1a3a1a;text-align:center}
      .ds-courses{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
      .ds-course{border:2px solid #e4ede4;border-radius:16px;padding:28px;text-align:center}
      .ds-course.featured{border-color:#f5c842;background:#fffef0}
      .ds-course .icon{font-size:2.5rem;margin-bottom:12px}
      .ds-course h3{font-weight:700;margin-bottom:8px;color:#1a3a1a}
      .ds-course .price{font-size:1.8rem;font-weight:800;color:#2d7a2d;margin:10px 0}
      .ds-course p{font-size:.88rem;color:#666;line-height:1.5}
      .ds-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .ds-step{background:#f5faf5;border-radius:12px;padding:20px;text-align:center}
      .ds-step .num{background:#1a3a1a;color:#f5c842;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;margin:0 auto 12px}
      .ds-step h4{font-weight:700;margin-bottom:6px}
      .ds-step p{font-size:.85rem;color:#666}
      .ds-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-top:32px}
      .ds-trust-item{background:#f5faf5;border-radius:10px;padding:16px;text-align:center;border:1px solid #d4e8d4}
      .ds-trust-item .icon{font-size:1.5rem;margin-bottom:6px}
      .ds-trust-item p{font-size:.85rem;font-weight:600;color:#1a3a1a}
      .ds-whatsapp{background:#1a3a1a;color:#fff;padding:64px 24px;text-align:center}
      .ds-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#f5c842}
      .ds-whatsapp p{color:#b8d4b8;margin-bottom:28px}
      .ds-footer{background:#0d1e0d;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.ds-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Driving School';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const frscReg: string = (d['frscRegistration'] as string) ?? '';
  const cacRc: string = (d['cacRc'] as string) ?? '';
  const passRate: number = (d['frscPassRate'] as number) ?? 0;
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20enroll%20at%20${encodeURIComponent(name)}`;

  const courses = [
    { icon: '🚗', name: 'Car Driving Course', price: '₦55,000', lessons: '8 lessons', featured: true, includes: 'Theory + Practical + FRSC test preparation' },
    { icon: '🛵', name: 'Motorcycle Course', price: '₦25,000', lessons: '5 lessons', featured: false, includes: 'Practical training + road test prep' },
    { icon: '🚛', name: 'Commercial Vehicle', price: '₦120,000', lessons: '12 lessons', featured: false, includes: 'Truck/bus/lorry training + FRSC certification' },
  ];

  const steps = [
    { num: '1', title: 'Enroll', desc: 'WhatsApp us to register and pay enrollment fee' },
    { num: '2', title: 'Theory Class', desc: 'Learn traffic rules, road signs, and FRSC regulations' },
    { num: '3', title: 'Practical Lessons', desc: 'On-road training with certified instructors and our vehicles' },
    { num: '4', title: 'FRSC Test', desc: 'We guide you through the FRSC road test — 95%+ pass rate' },
    { num: '5', title: 'Get Your Licence', desc: 'Collect your Nigerian driver\'s licence from FRSC' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="ds-header">
  <div class="ds-logo">${name}</div>
  <nav class="ds-nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/services">Courses</a>
    <a href="/contact">Enroll</a>
  </nav>
</header>

<section class="ds-hero">
  ${frscReg ? `<div class="ds-badge">🏅 FRSC Registered: ${frscReg}</div><br>` : ''}
  ${cacRc ? `<div class="ds-badge">📜 CAC RC: ${cacRc}</div><br>` : ''}
  ${passRate > 0 ? `<div class="ds-badge">✅ ${passRate}% FRSC Test Pass Rate</div><br>` : ''}
  <h1>Get Your Nigerian Driver's Licence with Confidence</h1>
  <p>FRSC-registered driving school in ${city}. Professional instructors, modern vehicles, and the highest pass rates.</p>
  ${phone ? `<a class="ds-cta" href="${waLink}" target="_blank" rel="noopener">📱 Enroll Now via WhatsApp</a>` : ''}
</section>

<section class="ds-section">
  <h2>Our Driving Courses</h2>
  <div class="ds-courses">
    ${courses.map(c => `
    <div class="ds-course${c.featured ? ' featured' : ''}">
      ${c.featured ? '<div style="color:#f5c842;font-weight:700;font-size:.85rem;margin-bottom:8px">⭐ MOST POPULAR</div>' : ''}
      <div class="icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <div class="price">${c.price}</div>
      <p style="font-weight:600;color:#444;margin-bottom:8px">${c.lessons}</p>
      <p>${c.includes}</p>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:18px;background:#1a3a1a;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700" target="_blank" rel="noopener">Enroll Now</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="ds-section" style="background:#f5faf5;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>How It Works</h2>
    <div class="ds-steps">
      ${steps.map(s => `
      <div class="ds-step">
        <div class="num">${s.num}</div>
        <h4>${s.title}</h4>
        <p>${s.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="ds-section">
  <h2>Why Choose Us?</h2>
  <div class="ds-trust">
    ${frscReg ? `<div class="ds-trust-item"><div class="icon">🏅</div><p>FRSC Registered<br>${frscReg}</p></div>` : ''}
    <div class="ds-trust-item"><div class="icon">🚗</div><p>Modern Training<br>Vehicles</p></div>
    <div class="ds-trust-item"><div class="icon">👨‍🏫</div><p>Certified<br>Instructors</p></div>
    ${passRate > 0 ? `<div class="ds-trust-item"><div class="icon">✅</div><p>${passRate}% FRSC<br>Pass Rate</p></div>` : ''}
    <div class="ds-trust-item"><div class="icon">🔌</div><p>No hidden<br>charges</p></div>
  </div>
</section>

<section class="ds-whatsapp">
  <h2>Ready to Start Driving?</h2>
  <p>Enroll today via WhatsApp — quick and easy registration.</p>
  ${phone ? `<a class="ds-cta" href="${waLink}" target="_blank" rel="noopener">📱 Enroll Now on WhatsApp</a>` : ''}
</section>

<footer class="ds-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. FRSC Registered Driving School.</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Driving School';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const frscReg: string = (d['frscRegistration'] as string) ?? '';
  const years: number = (d['yearsOfOperation'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="ds-header">
  <div class="ds-logo">${name}</div>
  <nav class="ds-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Courses</a><a href="/contact">Enroll</a></nav>
</header>
<section class="ds-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${frscReg ? `<p style="background:#f5faf5;border-radius:10px;padding:14px 18px;margin-bottom:20px">🏅 FRSC Registration: <strong>${frscReg}</strong></p>` : ''}
  <p style="margin-bottom:16px">${name} is an FRSC-registered driving school in ${city}, Nigeria. ${years > 0 ? `With ${years}+ years of experience, we` : 'We'} have helped thousands of Nigerians get their driver's licences safely and confidently.</p>
  <h3 style="margin-bottom:12px;color:#1a3a1a">Our Instructors</h3>
  <p style="margin-bottom:20px;color:#555">All instructors are FRSC-certified, experienced, and patient with beginners. We believe everyone can learn to drive safely.</p>
  <h3 style="margin-bottom:12px;color:#1a3a1a">Our Fleet</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ Modern, well-maintained training vehicles</li>
    <li style="padding:6px 0">✓ Dual-control cars for beginner safety</li>
    <li style="padding:6px 0">✓ Regular servicing and inspection</li>
    <li style="padding:6px 0">✓ Insurance covers students during lessons</li>
  </ul>
</section>
<footer class="ds-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Driving School';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20enroll%20in%20a%20course%20at%20${encodeURIComponent(name)}`;
  const courses = [
    { name: 'Car Driving (Standard)', fee: '₦55,000', lessons: '8 lessons', desc: 'Theory class + 8 practical sessions + FRSC test preparation', bestFor: 'First-time drivers' },
    { name: 'Car Driving (Intensive)', fee: '₦80,000', lessons: '12 lessons', desc: '12 intensive sessions + theory + FRSC test + 30-day refresher', bestFor: 'Fast-track learners' },
    { name: 'Motorcycle', fee: '₦25,000', lessons: '5 lessons', desc: 'Practical motorcycle training + FRSC road test preparation', bestFor: 'Okada / personal use' },
    { name: 'Truck / Commercial Vehicle', fee: '₦120,000', lessons: '12 lessons', desc: 'Lorry/bus/tanker training for FRSC commercial vehicle licence', bestFor: 'Commercial drivers' },
    { name: 'Defensive Driving (Corporate)', fee: 'Custom quote', lessons: 'Full day', desc: 'On-site corporate defensive driving training for company fleets', bestFor: 'Companies' },
    { name: 'Refresher Course', fee: '₦30,000', lessons: '4 lessons', desc: 'For existing licence holders who want to brush up on skills', bestFor: 'Returning drivers' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Courses — ${name}</title>${css()}</head>
<body>
<header class="ds-header">
  <div class="ds-logo">${name}</div>
  <nav class="ds-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Courses</a><a href="/contact">Enroll</a></nav>
</header>
<section class="ds-section">
  <h2>Driving Courses & Fees</h2>
  <div class="ds-courses">
    ${courses.map(c => `
    <div class="ds-course">
      <h3>${c.name}</h3>
      <div class="price">${c.fee}</div>
      <p style="font-weight:600;color:#555;margin-bottom:6px">${c.lessons}</p>
      <p style="margin-bottom:6px">${c.desc}</p>
      <p style="font-size:.82rem;color:#888">Best for: ${c.bestFor}</p>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:14px;background:#25d366;color:#fff;padding:8px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.9rem" target="_blank" rel="noopener">Enroll</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="ds-footer"><p>&copy; ${new Date().getFullYear()} ${name}.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Driving School';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Sat: 7am–6pm | Sun: 9am–2pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20enroll%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Enroll — ${name}</title>${css()}</head>
<body>
<header class="ds-header">
  <div class="ds-logo">${name}</div>
  <nav class="ds-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Courses</a><a href="/contact">Enroll</a></nav>
</header>
<section class="ds-section" style="max-width:640px">
  <h2>Enroll Now</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f5faf5;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Enrollment & Inquiries)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f5faf5;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">School Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f5faf5;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Hours</p><p style="font-weight:700">${hours}</p></div>
  </div>
  ${phone ? `<a class="ds-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Enroll Now on WhatsApp</a>` : ''}
</section>
<footer class="ds-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const drivingSchoolTrainingTemplate: WebsiteTemplateContract = {
  slug: 'driving-school-training',
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
