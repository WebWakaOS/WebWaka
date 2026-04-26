import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P31 — Gym / Fitness Centre template
 * CSS namespace: .gm-
 * Platform invariants: T4 (kobo), P2 (Nigeria First), P4 (mobile-first)
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff}
      .gm-header{background:#1b1b2f;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .gm-logo{font-size:1.3rem;font-weight:700;color:#f5a623}
      .gm-nav a{color:#fff;text-decoration:none;margin-left:18px;font-size:.95rem}
      .gm-hero{background:linear-gradient(135deg,#1b1b2f 0%,#2d2d44 100%);color:#fff;padding:72px 24px 56px;text-align:center}
      .gm-hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:800;margin-bottom:14px}
      .gm-hero p{font-size:1.1rem;color:#c7c7d9;max-width:560px;margin:0 auto 32px}
      .gm-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.1rem;text-decoration:none}
      .gm-cta:hover{background:#1ebe5d}
      .gm-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .gm-section h2{font-size:1.8rem;font-weight:700;margin-bottom:32px;color:#1b1b2f;text-align:center}
      .gm-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px;margin-top:8px}
      .gm-plan{border:2px solid #e8e8f0;border-radius:16px;padding:28px;text-align:center}
      .gm-plan.featured{border-color:#f5a623;background:#fffbf0}
      .gm-plan h3{font-size:1.2rem;font-weight:700;margin-bottom:8px}
      .gm-plan .price{font-size:2rem;font-weight:800;color:#f5a623;margin:12px 0}
      .gm-plan .price span{font-size:1rem;font-weight:400;color:#666}
      .gm-plan ul{list-style:none;text-align:left;font-size:.9rem;color:#555}
      .gm-plan ul li::before{content:"✓ ";color:#25d366;font-weight:700}
      .gm-plan ul li{padding:4px 0}
      .gm-classes{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .gm-class{background:#f5f5fa;border-radius:12px;padding:20px;text-align:center}
      .gm-class .icon{font-size:2rem;margin-bottom:8px}
      .gm-class h4{font-weight:700;margin-bottom:4px}
      .gm-class p{font-size:.85rem;color:#666}
      .gm-facilities{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}
      .gm-facility{display:flex;align-items:center;gap:10px;background:#f5f5fa;border-radius:10px;padding:14px 18px}
      .gm-facility .icon{font-size:1.4rem}
      .gm-timetable{overflow-x:auto}
      .gm-timetable table{width:100%;border-collapse:collapse;min-width:500px}
      .gm-timetable th{background:#1b1b2f;color:#fff;padding:10px 12px;text-align:left;font-size:.9rem}
      .gm-timetable td{padding:10px 12px;border-bottom:1px solid #eee;font-size:.9rem}
      .gm-timetable tr:nth-child(even) td{background:#fafafa}
      .gm-whatsapp{background:#1b1b2f;color:#fff;padding:56px 24px;text-align:center}
      .gm-whatsapp h2{font-size:1.8rem;margin-bottom:16px}
      .gm-whatsapp p{color:#c7c7d9;margin-bottom:28px}
      .gm-footer{background:#111;color:#888;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.gm-nav{display:none}.gm-hero{padding:48px 16px 40px}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Fitness Centre';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const memberCount: number = (d['memberCount'] as number) ?? 0;
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20a%20free%20trial%20session%20at%20${encodeURIComponent(name)}`;

  const plans = [
    { name: 'Pay Per Class', priceNGN: '3,000', period: '/class', features: ['Single class access', 'No commitment', 'Group classes', 'WhatsApp booking'], featured: false },
    { name: 'Monthly', priceNGN: '15,000', period: '/month', features: ['Unlimited gym access', 'All group classes', 'Locker room', 'WhatsApp support'], featured: true },
    { name: 'Quarterly', priceNGN: '40,000', period: '/3 months', features: ['Everything in Monthly', 'Save ₦5,000 vs monthly', 'Priority class booking', '1 guest pass/month'], featured: false },
  ];

  const classes = [
    { icon: '🏋️', name: 'Gym Floor', desc: 'Free weights & machines' },
    { icon: '💃', name: 'Zumba', desc: 'Mon/Wed/Fri — 6am & 6pm' },
    { icon: '🧘', name: 'Yoga', desc: 'Tue/Thu — 7am & 7pm' },
    { icon: '🥊', name: 'Kickboxing', desc: 'Sat — 8am' },
    { icon: '🚴', name: 'Spinning', desc: 'Mon–Fri — 6:30am' },
    { icon: '⚡', name: 'Circuit Training', desc: 'Wed/Fri — 5:30pm' },
  ];

  const facilities = [
    { icon: '❄️', text: 'Air Conditioned' },
    { icon: '🚿', text: 'Showers & Lockers' },
    { icon: '📡', text: 'Free Wi-Fi' },
    { icon: '🅿️', text: 'Free Parking' },
    { icon: '🔌', text: 'Inverter Backup' },
    { icon: '👕', text: 'Towel Service' },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="gm-header">
  <div class="gm-logo">${name}</div>
  <nav class="gm-nav">
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/services">Membership</a>
    <a href="/contact">Contact</a>
  </nav>
</header>

<section class="gm-hero">
  <h1>Your Fitness Journey Starts Here</h1>
  <p>Professional gym in ${city}. All fitness levels welcome — no judgement.${memberCount > 0 ? ` Join ${memberCount.toLocaleString()}+ active members.` : ''}</p>
  ${phone ? `<a class="gm-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book a Free Trial Session</a>` : ''}
</section>

<section class="gm-section">
  <h2>Membership Plans</h2>
  <div class="gm-plans">
    ${plans.map(p => `
    <div class="gm-plan${p.featured ? ' featured' : ''}">
      ${p.featured ? '<div style="color:#f5a623;font-weight:700;font-size:.85rem;margin-bottom:8px">⭐ MOST POPULAR</div>' : ''}
      <h3>${p.name}</h3>
      <div class="price">₦${p.priceNGN}<span>${p.period}</span></div>
      <ul>
        ${p.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:18px;background:#1b1b2f;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700" target="_blank" rel="noopener">Join Now</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="gm-section" style="background:#f5f5fa;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Group Classes</h2>
    <div class="gm-classes">
      ${classes.map(c => `
      <div class="gm-class">
        <div class="icon">${c.icon}</div>
        <h4>${c.name}</h4>
        <p>${c.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="gm-section">
  <h2>Our Facilities</h2>
  <div class="gm-facilities">
    ${facilities.map(f => `
    <div class="gm-facility">
      <span class="icon">${f.icon}</span>
      <span>${f.text}</span>
    </div>`).join('')}
  </div>
</section>

<section class="gm-whatsapp">
  <h2>Ready to Start?</h2>
  <p>Book your free trial session today — no commitment required.</p>
  ${phone ? `<a class="gm-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book Free Trial on WhatsApp</a>` : '<p>Contact us to get started.</p>'}
</section>

<footer class="gm-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Fitness Centre';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const years: number = (d['yearsOfOperation'] as number) ?? 0;
  const trainerCerts: string = (d['trainerCertifications'] as string) ?? 'Certified fitness trainers on staff';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="gm-header">
  <div class="gm-logo">${name}</div>
  <nav class="gm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Membership</a><a href="/contact">Contact</a></nav>
</header>
<section class="gm-section" style="max-width:760px">
  <h2>About ${name}</h2>
  ${years > 0 ? `<p style="color:#666;margin-bottom:16px">Serving ${city} for over ${years} year${years > 1 ? 's' : ''}.</p>` : ''}
  <p style="margin-bottom:16px">We are a professional gym and fitness centre committed to helping people in ${city} live healthier lives. All fitness levels are welcome — from beginners to advanced athletes.</p>
  <p style="margin-bottom:24px">${trainerCerts}</p>
  <h3 style="margin-bottom:12px">Why Train With Us?</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ Modern equipment updated regularly</li>
    <li style="padding:6px 0">✓ Certified, experienced trainers</li>
    <li style="padding:6px 0">✓ Clean, hygienic environment</li>
    <li style="padding:6px 0">✓ Flexible membership — no long-term lock-in</li>
    <li style="padding:6px 0">✓ Generator backup — we never close due to NEPA</li>
  </ul>
</section>
<footer class="gm-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Fitness Centre';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20join%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Membership — ${name}</title>${css()}</head>
<body>
<header class="gm-header">
  <div class="gm-logo">${name}</div>
  <nav class="gm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Membership</a><a href="/contact">Contact</a></nav>
</header>
<section class="gm-section">
  <h2>Membership Options</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
    ${[
      { name: 'Day Pass', price: '₦2,500', desc: 'Full gym access for one day including all classes.', bold: false },
      { name: 'Monthly Membership', price: '₦15,000/month', desc: 'Unlimited gym access and all group classes for 30 days.', bold: true },
      { name: 'Quarterly Membership', price: '₦40,000/3 months', desc: 'Best value. Unlimited access for 90 days — save ₦5,000.', bold: false },
      { name: 'Personal Training (per session)', price: '₦10,000', desc: '1-on-1 session with a certified trainer. 60 minutes.', bold: false },
      { name: 'Personal Training (10 sessions)', price: '₦85,000', desc: 'Package of 10 personal training sessions. Save ₦15,000.', bold: false },
    ].map(s => `
    <div style="border:2px solid ${s.bold ? '#f5a623' : '#e8e8f0'};border-radius:14px;padding:24px;background:${s.bold ? '#fffbf0' : '#fff'}">
      <h3 style="margin-bottom:8px">${s.name}</h3>
      <div style="font-size:1.5rem;font-weight:800;color:#f5a623;margin:10px 0">${s.price}</div>
      <p style="font-size:.9rem;color:#666">${s.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:14px;background:#25d366;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center" target="_blank" rel="noopener">Sign Up</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="gm-footer"><p>WhatsApp us to join or ask questions about membership.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Fitness Centre';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Sat: 5:30am–10pm | Sun: 7am–4pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20inquire%20about%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Contact — ${name}</title>${css()}</head>
<body>
<header class="gm-header">
  <div class="gm-logo">${name}</div>
  <nav class="gm-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Membership</a><a href="/contact">Contact</a></nav>
</header>
<section class="gm-section" style="max-width:640px">
  <h2>Contact Us</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f5f5fa;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Book Trial / Inquiries)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f5f5fa;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f5f5fa;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Opening Hours</p><p style="font-weight:700">${hours}</p></div>
  </div>
  ${phone ? `<a class="gm-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Book Free Trial Now</a>` : ''}
</section>
<footer class="gm-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const gymFitnessMembershipTemplate: WebsiteTemplateContract = {
  slug: 'gym-fitness-membership',
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
