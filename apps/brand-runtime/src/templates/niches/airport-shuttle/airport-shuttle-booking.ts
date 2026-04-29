/**
 * Airport Shuttle Service Booking Site — Pillar 3 Website Template
 * Niche ID: P3-airport-shuttle-airport-shuttle-booking
 * Vertical: airport-shuttle (priority=3, high)
 * Category: transport
 * Family: NF-TRP-AIR (standalone)
 * Research brief: docs/templates/research/airport-shuttle-airport-shuttle-booking-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: LASG MVAA, FRSC, VIO Lagos, FAAN airside permits, CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need an airport shuttle booking.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ash-hero{text-align:center;padding:3rem 0 2.25rem}
.ash-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.ash-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ash-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.ash-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.ash-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ash-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ash-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ash-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ash-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ash-section{margin-top:2.75rem}
.ash-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ash-routes-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.ash-route-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.ash-route-airports{font-weight:700;font-size:1rem;margin-bottom:.25rem}
.ash-route-duration{font-size:.8125rem;color:var(--ww-text-muted);margin-bottom:.5rem}
.ash-route-price{font-size:1rem;font-weight:700;color:var(--ww-primary)}
.ash-fleet-grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.ash-fleet-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;background:var(--ww-surface);text-align:center}
.ash-fleet-icon{font-size:2rem;margin-bottom:.25rem}
.ash-fleet-name{font-weight:600;font-size:.9375rem}
.ash-fleet-seats{font-size:.8125rem;color:var(--ww-text-muted)}
.ash-book-box{border:2px solid var(--ww-primary);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);text-align:center}
.ash-book-text{font-size:1rem;margin-bottom:1rem;color:var(--ww-text-muted)}
.ash-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.ash-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.ash-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.ash-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need an airport shuttle booking.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="ash-logo">` : '';
  return `<section class="ash-hero">
    ${logoHtml}
    <div class="ash-badge">✈️ MMIA · NAIA · Abuja Nnamdi Azikiwe</div>
    <h1>${esc(name)}</h1>
    <p class="ash-tagline">${esc(tagline ?? 'Reliable airport transfers — Lagos (MMIA), Abuja (NAI), Port Harcourt. Book via WhatsApp anytime.')}</p>
    <div class="ash-ctas">
      ${wa ? `<a href="${wa}" class="ash-wa-btn" target="_blank" rel="noopener">${waSvg()} Book via WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="ash-primary-btn">📞 Call to Book</a>` : ''}
    </div>
  </section>`;
}

function buildRoutes(ctx: WebsiteRenderContext): string {
  const routes = (ctx as unknown as Record<string,unknown>)['routes'] as {from:string;to:string;duration:string;price:string}[] | undefined;
  const list = routes && routes.length > 0 ? routes : [
    {from:'Victoria Island',to:'MMIA Ikeja',duration:'45–90 min',price:'₦8,000'},
    {from:'Lekki / Ajah',to:'MMIA Ikeja',duration:'60–120 min',price:'₦10,000'},
    {from:'Abuja (CBD)',to:'Nnamdi Azikiwe Airport',duration:'30–45 min',price:'₦6,000'},
    {from:'Port Harcourt (GRA)',to:'PH Airport',duration:'25–40 min',price:'₦5,500'},
    {from:'Ikeja / Maryland',to:'MMIA Ikeja',duration:'20–35 min',price:'₦4,500'},
    {from:'Airport Hotel',to:'MMIA (arrival pickup)',duration:'5 min',price:'₦3,500'},
  ];
  const cards = list.slice(0,6).map(r => `
    <div class="ash-route-card">
      <div class="ash-route-airports">📍 ${esc(r.from)} → ${esc(r.to)}</div>
      <div class="ash-route-duration">⏱ ${esc(r.duration)}</div>
      <div class="ash-route-price">From ${esc(r.price)}</div>
    </div>`).join('');
  return `<section class="ash-section">
    <h2 class="ash-section-title">Popular Routes</h2>
    <div class="ash-routes-grid">${cards}</div>
    <p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.75rem">Prices vary with traffic conditions and vehicle type. WhatsApp us for an exact quote.</p>
  </section>`;
}

function buildFleet(ctx: WebsiteRenderContext): string {
  const fleet = (ctx as unknown as Record<string,unknown>)['fleet'] as {name:string;seats:string;icon:string}[] | undefined;
  const list = fleet && fleet.length > 0 ? fleet : [
    {name:'Sedan (Toyota Corolla)',seats:'1–3 passengers',icon:'🚗'},
    {name:'Executive SUV',seats:'1–4 passengers',icon:'🚙'},
    {name:'Minivan (Sienna)',seats:'Up to 6 passengers',icon:'🚐'},
    {name:'Luxury Bus',seats:'Up to 14 passengers',icon:'🚌'},
  ];
  const cards = list.slice(0,4).map(f => `
    <div class="ash-fleet-card">
      <div class="ash-fleet-icon">${esc(f.icon)}</div>
      <div class="ash-fleet-name">${esc(f.name)}</div>
      <div class="ash-fleet-seats">${esc(f.seats)}</div>
    </div>`).join('');
  return `<section class="ash-section">
    <h2 class="ash-section-title">Our Fleet</h2>
    <div class="ash-fleet-grid">${cards}</div>
  </section>`;
}

function buildBooking(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I would like to book an airport shuttle. Please share your rates and availability.');
  return `<section class="ash-section">
    <h2 class="ash-section-title">How to Book</h2>
    <div class="ash-book-box">
      <p class="ash-book-text">Send us your flight details (date, time, terminal, pickup address) on WhatsApp and we will confirm your booking within minutes. Payment via bank transfer, POS, or Paystack on arrival.</p>
      ${wa ? `<a href="${wa}" class="ash-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp Booking</a>` : ''}
    </div>
  </section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone);
  const rows = [
    phone ? `<div class="ash-contact-row"><span class="ash-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="ash-contact-row"><span class="ash-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="ash-contact-row"><span class="ash-contact-label">Base</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="ash-contact-row"><span class="ash-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="ash-section">
    <h2 class="ash-section-title">Contact Us</h2>
    <div class="ash-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="ash-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Airport Shuttle Service, Nigeria.<br>
    LASG MVAA Compliant &bull; FRSC Roadworthy &bull; CAC Registered &bull; NDPR Compliant
  </footer>`;
}

export const airportShuttleAirportShuttleBookingTemplate: WebsiteTemplateContract = {
  slug: 'airport-shuttle-airport-shuttle-booking',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildRoutes(ctx), buildFleet(ctx), buildBooking(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
