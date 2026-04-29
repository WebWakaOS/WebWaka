import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P46 — Community Hall / Civic Space template
 * CSS namespace: .ch-
 * Platform invariants: T4 (kobo integers; capacity_seats as integer), P2 (Nigeria First)
 * FSM: 3-state (seeded → claimed → active)
 * Double-booking prevention enforced at route level (not website)
 * AI: L1 cap — booking frequency aggregate only
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff}
      .ch-header{background:#2c1654;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .ch-logo{font-size:1.3rem;font-weight:700;color:#f7c948}
      .ch-nav a{color:#c8b8f0;text-decoration:none;margin-left:18px;font-size:.95rem}
      .ch-hero{background:linear-gradient(135deg,#2c1654 0%,#4a2880 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .ch-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .ch-hero p{font-size:1.05rem;color:#c8b8f0;max-width:560px;margin:0 auto 32px}
      .ch-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .ch-cta:hover{background:#1ebe5d}
      .ch-stats{background:rgba(247,201,72,.08);border-top:1px solid rgba(247,201,72,.2);border-bottom:1px solid rgba(247,201,72,.2);padding:20px 24px;display:flex;flex-wrap:wrap;justify-content:center;gap:32px}
      .ch-stat{text-align:center}
      .ch-stat .num{font-size:1.8rem;font-weight:800;color:#f7c948}
      .ch-stat p{font-size:.8rem;color:#c8b8f0}
      .ch-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .ch-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#2c1654;text-align:center}
      .ch-features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
      .ch-feature{background:#f8f4ff;border-radius:12px;padding:20px;text-align:center;border:1px solid #e4d8f8}
      .ch-feature .icon{font-size:2rem;margin-bottom:8px}
      .ch-feature h3{font-weight:700;color:#2c1654;margin-bottom:4px}
      .ch-feature p{font-size:.85rem;color:#666}
      .ch-packages{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px}
      .ch-package{border:2px solid #e4d8f8;border-radius:14px;padding:28px;text-align:center}
      .ch-package.featured{border-color:#f7c948;background:#fffef0}
      .ch-package h3{font-weight:700;margin-bottom:8px;color:#2c1654}
      .ch-package .price{font-size:1.8rem;font-weight:800;color:#4a2880;margin:10px 0}
      .ch-package ul{list-style:none;text-align:left;font-size:.88rem;color:#555}
      .ch-package ul li{padding:4px 0}
      .ch-package ul li::before{content:"✓ ";color:#25d366;font-weight:700}
      .ch-events{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:16px 0}
      .ch-event{background:#2c1654;color:#f7c948;padding:6px 16px;border-radius:20px;font-size:.85rem;font-weight:600}
      .ch-whatsapp{background:#2c1654;color:#fff;padding:64px 24px;text-align:center}
      .ch-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#f7c948}
      .ch-whatsapp p{color:#c8b8f0;margin-bottom:28px}
      .ch-footer{background:#1a0c33;color:#887;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.ch-nav{display:none}.ch-stats{gap:20px}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Community Hall';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const capacitySeated: number = (d['capacitySeated'] as number) ?? 0;
  const capacityStanding: number = (d['capacityStanding'] as number) ?? 0;
  const hasGenerator: boolean = (d['hasGenerator'] as boolean) ?? true;
  const hasAc: boolean = (d['hasAC'] as boolean) ?? false;
  const hasKitchen: boolean = (d['hasKitchen'] as boolean) ?? true;
  const address: string = (d['address'] as string) ?? '';
  const lga: string = (d['lga'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20check%20availability%20at%20${encodeURIComponent(name)}`;

  const features = [
    { icon: capacitySeated > 0 ? '💺' : '🏛️', name: 'Hall Capacity', desc: capacitySeated > 0 ? `${capacitySeated.toLocaleString()} seated${capacityStanding > 0 ? `, ${capacityStanding.toLocaleString()} standing` : ''}` : 'Flexible seating configuration' },
    { icon: hasGenerator ? '🔌' : '💡', name: 'Generator', desc: hasGenerator ? '✅ Full generator backup — no NEPA worries' : '⚡ Electrical power supply' },
    { icon: hasAc ? '❄️' : '💨', name: 'Cooling', desc: hasAc ? '✅ Air conditioned hall' : 'Ceiling fans installed throughout' },
    { icon: '🎵', name: 'Sound System', desc: 'Public address system and microphones available' },
    { icon: hasKitchen ? '🍳' : '🍽️', name: 'Catering', desc: hasKitchen ? 'Kitchen available — bring your own caterer' : 'Catering area available' },
    { icon: '🅿️', name: 'Parking', desc: 'Ample parking space for guests and vehicles' },
    { icon: '🚿', name: 'Facilities', desc: 'Male and female restrooms, dressing rooms' },
    { icon: '🔒', name: 'Security', desc: 'Security personnel and gated compound' },
  ];

  const packages = [
    {
      name: 'Half Day', price: 'From ₦80,000', period: '(up to 5 hours)', featured: false,
      features: ['Morning or afternoon slot', 'Chairs and tables included', 'Generator backup', 'Security included', 'Basic sound system'],
    },
    {
      name: 'Full Day', price: 'From ₦150,000', period: '(up to 12 hours)', featured: true,
      features: ['All-day access 8am–8pm', 'Chairs and tables included', 'Generator backup', 'Security included', 'PA system included', 'Kitchen access'],
    },
    {
      name: 'Weekend Package', price: 'From ₦250,000', period: '(2 days)', featured: false,
      features: ['2 consecutive days', 'Set-up day + event day', 'All facilities included', 'Generator + security', 'Early access for décor'],
    },
  ];

  const eventTypes = ['👰 Weddings', '👶 Naming Ceremonies', '🎂 Birthdays', '🎓 Graduations', '⛪ Church Events', '🏢 Corporate Events', '🎉 Owambe Parties', '🏛️ Town Meetings'];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${lga || city}</title>
${css()}
</head>
<body>
<header class="ch-header">
  <div class="ch-logo">${name}</div>
  <nav class="ch-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Packages</a><a href="/contact">Book</a>
  </nav>
</header>
<section class="ch-hero">
  <h1>The Perfect Venue for Your Event in ${lga || city}</h1>
  <p>${hasGenerator ? 'Full generator backup.' : ''} ${hasAc ? 'Air conditioned.' : ''} ${capacitySeated > 0 ? `Seats up to ${capacitySeated.toLocaleString()} guests.` : 'Flexible capacity.'} ${address ? `Located in ${lga || city}.` : ''}</p>
  ${phone ? `<a class="ch-cta" href="${waLink}" target="_blank" rel="noopener">📱 Check Availability on WhatsApp</a>` : ''}
</section>

${capacitySeated > 0 ? `
<div class="ch-stats">
  ${capacitySeated > 0 ? `<div class="ch-stat"><div class="num">${capacitySeated.toLocaleString()}</div><p>Seated Capacity</p></div>` : ''}
  ${capacityStanding > 0 ? `<div class="ch-stat"><div class="num">${capacityStanding.toLocaleString()}</div><p>Standing Capacity</p></div>` : ''}
  ${hasGenerator ? '<div class="ch-stat"><div class="num">✅</div><p>Generator Backup</p></div>' : ''}
  ${hasAc ? '<div class="ch-stat"><div class="num">❄️</div><p>Air Conditioned</p></div>' : ''}
</div>` : ''}

<section class="ch-section">
  <h2>Events We Host</h2>
  <div class="ch-events">
    ${eventTypes.map(e => `<span class="ch-event">${e}</span>`).join('')}
  </div>
</section>

<section class="ch-section">
  <h2>Booking Packages</h2>
  <div class="ch-packages">
    ${packages.map(p => `
    <div class="ch-package${p.featured ? ' featured' : ''}">
      ${p.featured ? '<div style="color:#f7c948;font-weight:700;font-size:.85rem;margin-bottom:8px">⭐ MOST POPULAR</div>' : ''}
      <h3>${p.name}</h3>
      <div class="price">${p.price}</div>
      <p style="font-size:.85rem;color:#888;margin-bottom:16px">${p.period}</p>
      <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
      ${phone ? `<a href="${waLink}" style="display:block;margin-top:18px;background:#2c1654;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center" target="_blank" rel="noopener">Check Availability</a>` : ''}
    </div>`).join('')}
  </div>
</section>

<section class="ch-section" style="background:#f8f4ff;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Hall Features</h2>
    <div class="ch-features">
      ${features.map(f => `
      <div class="ch-feature">
        <div class="icon">${f.icon}</div>
        <h3>${f.name}</h3>
        <p>${f.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="ch-whatsapp">
  <h2>Check Availability & Book</h2>
  <p>Tell us your event date and type — we'll confirm availability and send you the full package details.</p>
  ${phone ? `<a class="ch-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book on WhatsApp</a>` : ''}
</section>

<footer class="ch-footer">
  <p>&copy; ${new Date().getFullYear()} ${name}. ${lga ? `${lga}, ` : ''}${city}, Nigeria. | A 30% deposit is required to confirm your booking.</p>
</footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Community Hall';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const mgmtBody: string = (d['managementBody'] as string) ?? 'Community Development Association';
  const yearsOp: number = (d['yearsOfOperation'] as number) ?? 0;
  const capacitySeated: number = (d['capacitySeated'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="ch-header">
  <div class="ch-logo">${name}</div>
  <nav class="ch-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Packages</a><a href="/contact">Book</a></nav>
</header>
<section class="ch-section" style="max-width:760px">
  <h2>About ${name}</h2>
  <p style="margin-bottom:16px">${name} is managed by ${mgmtBody}${yearsOp > 0 ? ` and has been serving ${city} for over ${yearsOp} years` : ''}. Our mission is to provide the community with an affordable, well-maintained venue for all events — from intimate family celebrations to large corporate gatherings.</p>
  ${capacitySeated > 0 ? `<p style="margin-bottom:16px">Hall capacity: <strong>${capacitySeated.toLocaleString()} seated guests</strong>.</p>` : ''}
  <h3 style="margin-bottom:12px;color:#2c1654">Hall Policies</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ 30% deposit required to confirm booking</li>
    <li style="padding:6px 0">✓ Balance due 7 days before the event date</li>
    <li style="padding:6px 0">✓ One booking per day — no double-booking guaranteed</li>
    <li style="padding:6px 0">✓ Your caterer, DJ, and decorator are welcome (no exclusivity)</li>
    <li style="padding:6px 0">✓ Venue must be cleared and cleaned by end of booking period</li>
    <li style="padding:6px 0">✓ Refund policy: 50% refund for cancellation 14+ days before event</li>
  </ul>
</section>
<footer class="ch-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Community Hall';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20${encodeURIComponent(name)}`;
  const packages = [
    { name: 'Half Day (Morning)', slot: '8am–1pm (5 hours)', price: 'From ₦80,000', incl: 'Hall, chairs & tables, generator backup, 1 security guard, PA system' },
    { name: 'Half Day (Evening)', slot: '3pm–8pm (5 hours)', price: 'From ₦80,000', incl: 'Hall, chairs & tables, generator backup, 1 security guard, PA system' },
    { name: 'Full Day', slot: '8am–8pm (12 hours)', price: 'From ₦150,000', incl: 'Hall, chairs & tables, generator, 2 security guards, PA system, kitchen access' },
    { name: 'Wedding Package (Full Day)', slot: '8am–9pm (13 hours)', price: 'From ₦220,000', incl: 'Full day access, extra chairs, external sound system support, 3 security guards' },
    { name: 'Weekend 2-Day Package', slot: 'Sat + Sun', price: 'From ₦250,000', incl: 'Set-up day + event day. All full-day inclusions both days' },
    { name: 'Corporate / Conference', slot: 'Custom', price: 'From ₦100,000/day', incl: 'Air conditioning (if available), projector support, business seating arrangement, whiteboard' },
    { name: 'Church / Religious Event', slot: 'Sunday or weekday', price: 'Special rate — WhatsApp for quote', incl: 'Community rate for registered religious groups' },
  ];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Packages — ${name}</title>${css()}</head>
<body>
<header class="ch-header">
  <div class="ch-logo">${name}</div>
  <nav class="ch-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Packages</a><a href="/contact">Book</a></nav>
</header>
<section class="ch-section">
  <h2>Booking Packages & Pricing</h2>
  <div class="ch-packages" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
    ${packages.map(p => `
    <div class="ch-package">
      <h3>${p.name}</h3>
      <div class="price" style="font-size:1.4rem">${p.price}</div>
      <p style="font-size:.85rem;color:#888;margin:6px 0 12px">⏰ ${p.slot}</p>
      <p style="font-size:.85rem;color:#555;margin-bottom:14px">Includes: ${p.incl}</p>
      ${phone ? `<a href="${waLink}" style="display:block;background:#25d366;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center" target="_blank" rel="noopener">Check Availability</a>` : ''}
    </div>`).join('')}
  </div>
  <p style="text-align:center;margin-top:24px;color:#888;font-size:.88rem">Prices in NGN. Final price may vary by date, season, and specific requirements. 30% deposit to confirm booking.</p>
</section>
<footer class="ch-footer"><p>&copy; ${new Date().getFullYear()} ${name}.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Community Hall';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const lga: string = (d['lga'] as string) ?? '';
  const hours: string = (d['openingHours'] as string) ?? 'Office: Mon–Fri 9am–5pm | Events: 7am–9pm daily';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Book — ${name}</title>${css()}</head>
<body>
<header class="ch-header">
  <div class="ch-logo">${name}</div>
  <nav class="ch-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Packages</a><a href="/contact">Book</a></nav>
</header>
<section class="ch-section" style="max-width:640px">
  <h2>Book the Hall</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f8f4ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Bookings & Availability)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f8f4ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Hall Address</p><p style="font-weight:700">${address}${lga ? `, ${lga}` : ''}, ${city}</p></div>` : ''}
    <div style="background:#f8f4ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Hours</p><p style="font-weight:700">${hours}</p></div>
    <div style="background:#f8f4ff;border-radius:12px;padding:16px"><p style="font-size:.9rem;color:#2c1654"><strong>To book:</strong> Tell us your event date, type of event, expected number of guests, and preferred package. We'll confirm availability and send you the booking agreement.</p></div>
    <div style="background:#fffde7;border-radius:12px;padding:14px;border:1px solid #f9a825"><p style="font-size:.88rem;color:#795548">⚠️ <strong>Peak dates fill fast:</strong> Friday, Saturday, and Sunday slots — especially December and Easter — book up to 3 months in advance.</p></div>
  </div>
  ${phone ? `<a class="ch-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Check Availability Now</a>` : ''}
</section>
<footer class="ch-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria. | A 30% deposit is required to confirm your booking.</p></footer>
</body></html>`;
}

export const communityHallCivicSpaceTemplate: WebsiteTemplateContract = {
  slug: 'community-hall-civic-space',
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
