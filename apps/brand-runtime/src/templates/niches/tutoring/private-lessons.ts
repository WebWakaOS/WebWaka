import type {
  WebsiteRenderContext,
  WebsiteTemplateContract,
  WebsitePageType,
} from '@webwaka/verticals';

/**
 * P36 — Private Tutoring / Lesson Teacher template
 * CSS namespace: .tu-
 * Platform invariants: T4 (kobo), P2 (Nigeria First — JAMB/WAEC context)
 */

function css(): string {
  return `
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff}
      .tu-header{background:#003366;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
      .tu-logo{font-size:1.3rem;font-weight:700;color:#f5d020}
      .tu-nav a{color:#c8d8e8;text-decoration:none;margin-left:18px;font-size:.95rem}
      .tu-hero{background:linear-gradient(135deg,#003366 0%,#00509e 100%);color:#fff;padding:80px 24px 64px;text-align:center}
      .tu-hero h1{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:700;margin-bottom:14px}
      .tu-hero p{font-size:1.05rem;color:#b8cfe8;max-width:560px;margin:0 auto 32px}
      .tu-cta{display:inline-block;background:#25d366;color:#fff;padding:16px 36px;border-radius:50px;font-weight:700;font-size:1.05rem;text-decoration:none}
      .tu-cta:hover{background:#1ebe5d}
      .tu-section{padding:56px 24px;max-width:1100px;margin:0 auto}
      .tu-section h2{font-size:1.7rem;font-weight:700;margin-bottom:32px;color:#003366;text-align:center}
      .tu-subjects{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px}
      .tu-subject{background:#f0f5ff;border-radius:12px;padding:18px;text-align:center;border:1px solid #d0dfff}
      .tu-subject .icon{font-size:1.8rem;margin-bottom:8px}
      .tu-subject h3{font-weight:700;color:#003366;font-size:1rem}
      .tu-subject p{font-size:.82rem;color:#666;margin-top:4px}
      .tu-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
      .tu-plan{border:2px solid #d0dfff;border-radius:14px;padding:24px;text-align:center}
      .tu-plan.featured{border-color:#f5d020;background:#fffef0}
      .tu-plan h3{font-weight:700;margin-bottom:8px}
      .tu-plan .price{font-size:1.6rem;font-weight:800;color:#00509e;margin:10px 0}
      .tu-plan ul{list-style:none;text-align:left;font-size:.88rem;color:#555}
      .tu-plan ul li{padding:4px 0}
      .tu-plan ul li::before{content:"✓ ";color:#25d366;font-weight:700}
      .tu-stats{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;margin:24px 0}
      .tu-stat{background:#f0f5ff;border-radius:12px;padding:20px 28px;text-align:center;min-width:140px}
      .tu-stat .num{font-size:2rem;font-weight:800;color:#003366}
      .tu-stat p{font-size:.85rem;color:#666}
      .tu-whatsapp{background:#003366;color:#fff;padding:64px 24px;text-align:center}
      .tu-whatsapp h2{font-size:1.7rem;margin-bottom:14px;color:#f5d020}
      .tu-whatsapp p{color:#b8cfe8;margin-bottom:28px}
      .tu-footer{background:#001e40;color:#667;text-align:center;padding:24px;font-size:.85rem}
      @media(max-width:600px){.tu-nav{display:none}}
    </style>
  `;
}

function renderHome(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Private Lessons';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const teacherQuals: string = (d['teacherQualifications'] as string) ?? 'B.Sc. Mathematics, 10 years teaching experience';
  const jambScore: number = (d['topJambScore'] as number) ?? 0;
  const homeService: boolean = (d['homeServiceAvailable'] as boolean) ?? false;
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20a%20trial%20lesson%20at%20${encodeURIComponent(name)}`;

  const subjects = [
    { icon: '➕', name: 'Mathematics', tag: 'JAMB/WAEC' },
    { icon: '📝', name: 'English Language', tag: 'JAMB/WAEC' },
    { icon: '⚛️', name: 'Physics', tag: 'JAMB/WAEC' },
    { icon: '🧪', name: 'Chemistry', tag: 'JAMB/WAEC' },
    { icon: '🧬', name: 'Biology', tag: 'JAMB/WAEC' },
    { icon: '💰', name: 'Economics', tag: 'JAMB/WAEC' },
    { icon: '🏛️', name: 'Government', tag: 'WAEC' },
    { icon: '📊', name: 'Further Maths', tag: 'WAEC/JAMB' },
    { icon: '📚', name: 'Literature', tag: 'WAEC' },
    { icon: '🌍', name: 'Geography', tag: 'WAEC' },
  ];

  const plans = [
    { name: 'Per Session', price: '₦5,000', period: '/session', features: ['60-minute lesson', 'All subjects', 'Study materials provided', 'WhatsApp Q&A support'], featured: false },
    { name: 'Weekly (2 sessions)', price: '₦18,000', period: '/week', features: ['2 sessions per week', 'All subjects', 'Progress tracking', 'JAMB/WAEC past questions'], featured: true },
    { name: 'Monthly Intensive', price: '₦60,000', period: '/month', features: ['4 sessions/week', 'Mock examinations', 'Parent progress report', 'Priority WhatsApp support'], featured: false },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${city}</title>
${css()}
</head>
<body>
<header class="tu-header">
  <div class="tu-logo">${name}</div>
  <nav class="tu-nav">
    <a href="/">Home</a><a href="/about">About</a><a href="/services">Subjects & Fees</a><a href="/contact">Book Lesson</a>
  </nav>
</header>
<section class="tu-hero">
  <h1>Expert Private Lessons in ${city}</h1>
  <p>JAMB, WAEC, and GCE prep by qualified teachers. ${homeService ? '🏠 Home service available.' : ''} ${jambScore > 0 ? `Top student scored ${jambScore} in JAMB.` : ''}</p>
  <p style="margin-bottom:20px;font-size:.9rem;color:#a0b8d0">${teacherQuals}</p>
  ${phone ? `<a class="tu-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book a Free Trial Lesson</a>` : ''}
</section>
<section class="tu-section">
  <h2>Subjects We Cover</h2>
  <div class="tu-subjects">
    ${subjects.map(s => `
    <div class="tu-subject">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.tag}</p>
    </div>`).join('')}
  </div>
</section>
<section class="tu-section" style="background:#f0f5ff;max-width:none;padding:56px 24px">
  <div style="max-width:1100px;margin:0 auto">
    <h2>Lesson Packages</h2>
    <div class="tu-plans">
      ${plans.map(p => `
      <div class="tu-plan${p.featured ? ' featured' : ''}">
        ${p.featured ? '<div style="color:#f5d020;font-weight:700;font-size:.85rem;margin-bottom:8px">⭐ BEST VALUE</div>' : ''}
        <h3>${p.name}</h3>
        <div class="price">${p.price}<span style="font-size:1rem;font-weight:400;color:#666">${p.period}</span></div>
        <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
        ${phone ? `<a href="${waLink}" style="display:block;margin-top:18px;background:#003366;color:#fff;padding:10px;border-radius:8px;text-decoration:none;font-weight:700;text-align:center" target="_blank" rel="noopener">Book Now</a>` : ''}
      </div>`).join('')}
    </div>
  </div>
</section>
<section class="tu-whatsapp">
  <h2>Book Your Free Trial Lesson</h2>
  <p>First lesson is FREE — no commitment required. WhatsApp us to schedule.</p>
  ${phone ? `<a class="tu-cta" href="${waLink}" target="_blank" rel="noopener">📱 Book Free Trial Now</a>` : ''}
</section>
<footer class="tu-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Private Lessons';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const teacherQuals: string = (d['teacherQualifications'] as string) ?? 'Qualified teacher with years of experience';
  const yearsExp: number = (d['yearsOfExperience'] as number) ?? 0;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>About — ${name}</title>${css()}</head>
<body>
<header class="tu-header">
  <div class="tu-logo">${name}</div>
  <nav class="tu-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Subjects & Fees</a><a href="/contact">Book Lesson</a></nav>
</header>
<section class="tu-section" style="max-width:760px">
  <h2>About ${name}</h2>
  <p style="margin-bottom:16px">${teacherQuals}${yearsExp > 0 ? ` with ${yearsExp} years of teaching experience` : ''}.</p>
  <p style="margin-bottom:20px">We specialise in JAMB, WAEC, NECO, and GCE preparation — helping Nigerian students achieve their academic goals.</p>
  <h3 style="margin-bottom:12px;color:#003366">Our Teaching Philosophy</h3>
  <ul style="list-style:none;color:#555">
    <li style="padding:6px 0">✓ Simplified explanations — every student can understand</li>
    <li style="padding:6px 0">✓ Past questions and exam technique focus</li>
    <li style="padding:6px 0">✓ WhatsApp Q&A support between sessions</li>
    <li style="padding:6px 0">✓ Progress tracking and parent updates</li>
    <li style="padding:6px 0">✓ Home service available — we come to you</li>
  </ul>
</section>
<footer class="tu-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Private Lessons';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20lessons%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Subjects & Fees — ${name}</title>${css()}</head>
<body>
<header class="tu-header">
  <div class="tu-logo">${name}</div>
  <nav class="tu-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Subjects & Fees</a><a href="/contact">Book Lesson</a></nav>
</header>
<section class="tu-section">
  <h2>Subjects & Session Fees</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">
    ${[
      { type: 'Primary School (Pry 1–6)', fee: '₦4,000/session', desc: 'All core subjects: Maths, English, Basic Science, Social Studies' },
      { type: 'Junior Secondary (JSS 1–3)', fee: '₦5,000/session', desc: 'Core BECE subjects: Maths, English, Basic Technology, etc.' },
      { type: 'Senior Secondary (SS 1–3)', fee: '₦6,000/session', desc: 'WAEC/NECO preparation: all science and art subjects' },
      { type: 'JAMB/UTME Intensive Prep', fee: '₦8,000/session', desc: 'JAMB-specific prep: Maths, English, + 2 elective subjects' },
      { type: 'Post-UTME/Aptitude Test', fee: '₦10,000/session', desc: 'University-specific post-UTME screening preparation' },
      { type: 'GCE Private Candidate', fee: '₦6,000/session', desc: 'Private WAEC/GCE registration support + subject tutoring' },
      { type: 'Group Lesson (2–4 students)', fee: '₦3,000/student/session', desc: 'Group lessons at reduced rate. Minimum 2 students.' },
      { type: 'Home Lessons (teacher visits)', fee: '+₦2,000 transport', desc: 'Teacher comes to your home. Transport surcharge applies.' },
    ].map(s => `
    <div style="border:1px solid #d0dfff;border-radius:12px;padding:20px">
      <h3 style="color:#003366;margin-bottom:8px">${s.type}</h3>
      <div style="font-size:1.3rem;font-weight:800;color:#00509e;margin:8px 0">${s.fee}</div>
      <p style="font-size:.88rem;color:#666">${s.desc}</p>
      ${phone ? `<a href="${waLink}" style="display:inline-block;margin-top:12px;background:#25d366;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;font-size:.88rem" target="_blank" rel="noopener">Book</a>` : ''}
    </div>`).join('')}
  </div>
</section>
<footer class="tu-footer"><p>&copy; ${new Date().getFullYear()} ${name}.</p></footer>
</body></html>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const d = ctx.data ?? {};
  const name: string = (d['businessName'] as string) ?? 'Private Lessons';
  const phone: string = (d['whatsappPhone'] as string) ?? '';
  const address: string = (d['address'] as string) ?? '';
  const city: string = (d['city'] as string) ?? 'Lagos';
  const hours: string = (d['openingHours'] as string) ?? 'Mon–Sat: 7am–8pm | Sun: 2pm–6pm';
  const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=Hi,%20I%20want%20to%20book%20a%20trial%20lesson%20at%20${encodeURIComponent(name)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Book a Lesson — ${name}</title>${css()}</head>
<body>
<header class="tu-header">
  <div class="tu-logo">${name}</div>
  <nav class="tu-nav"><a href="/">Home</a><a href="/about">About</a><a href="/services">Subjects & Fees</a><a href="/contact">Book Lesson</a></nav>
</header>
<section class="tu-section" style="max-width:640px">
  <h2>Book a Lesson</h2>
  <div style="display:grid;gap:16px">
    ${phone ? `<div style="background:#f0f5ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">WhatsApp (Booking & Inquiries)</p><a href="${waLink}" style="font-weight:700;color:#25d366;font-size:1.1rem;text-decoration:none" target="_blank" rel="noopener">📱 ${phone}</a></div>` : ''}
    ${address ? `<div style="background:#f0f5ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Centre Address</p><p style="font-weight:700">${address}, ${city}</p></div>` : ''}
    <div style="background:#f0f5ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Hours</p><p style="font-weight:700">${hours}</p></div>
    <div style="background:#f0f5ff;border-radius:12px;padding:20px"><p style="font-size:.85rem;color:#888;margin-bottom:6px">Home Service</p><p style="font-weight:700">Available — teacher comes to you (+₦2,000 transport)</p></div>
  </div>
  ${phone ? `<a class="tu-cta" style="display:inline-block;margin-top:28px" href="${waLink}" target="_blank" rel="noopener">📱 Book Free Trial Lesson</a>` : ''}
</section>
<footer class="tu-footer"><p>&copy; ${new Date().getFullYear()} ${name}. ${city}, Nigeria.</p></footer>
</body></html>`;
}

export const tutoringPrivateLessonsTemplate: WebsiteTemplateContract = {
  slug: 'tutoring-private-lessons',
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
