/**
 * Events Centre / Hall Rental Site — Pillar 3 Website Template
 * Niche ID: P3-events-centre-events-centre-rental
 * Vertical: events-centre (priority=3, high)
 * Category: place/events
 * Family: NF-PLC-EVT (standalone)
 * Research brief: docs/templates/research/events-centre-events-centre-rental-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: LASG event licence, LG event permit, CAC, NAFDAC (catering), LASEPA, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function fmtKobo(k: number): string {
  return `\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
}

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to book the events centre. Please share availability and pricing.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.evc-hero{text-align:center;padding:3rem 0 2.25rem}
.evc-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.evc-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.evc-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.evc-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.evc-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.evc-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.evc-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.evc-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.evc-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.evc-section{margin-top:2.75rem}
.evc-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.evc-halls-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.evc-hall-card{border:2px solid var(--ww-border);border-radius:var(--ww-radius);overflow:hidden;background:var(--ww-surface)}
.evc-hall-card.featured{border-color:var(--ww-primary)}
.evc-hall-img{width:100%;height:150px;object-fit:cover;background:var(--ww-border);display:flex;align-items:center;justify-content:center;font-size:3rem}
.evc-hall-body{padding:1rem}
.evc-hall-name{font-weight:800;font-size:1rem;margin-bottom:.25rem}
.evc-hall-capacity{font-size:.8125rem;color:var(--ww-text-muted);margin-bottom:.5rem}
.evc-hall-price{font-size:1rem;font-weight:700;color:var(--ww-primary)}
.evc-amenities-grid{display:grid;gap:.6rem;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
.evc-amenity{display:flex;align-items:center;gap:.5rem;font-size:.9rem;padding:.5rem .75rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface)}
.evc-amenity-icon{font-size:1.1rem}
.evc-event-types{display:flex;flex-wrap:wrap;gap:.6rem}
.evc-type-chip{padding:.35rem .85rem;border-radius:999px;font-size:.8rem;font-weight:600;background:var(--ww-primary);color:#fff;opacity:.85}
.evc-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.evc-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.evc-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.evc-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I would like to book the events centre. Please share availability and pricing.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="evc-logo">` : '';
  return `<section class="evc-hero">
    ${logoHtml}
    <div class="evc-badge">🎉 Premium Events Venue · LASG Licensed</div>
    <h1>${esc(name)}</h1>
    <p class="evc-tagline">${esc(tagline ?? 'Premium events centre — weddings, corporate dinners, product launches, and owambes. AC halls, parking, and full catering.')}</p>
    <div class="evc-ctas">
      ${wa ? `<a href="${wa}" class="evc-wa-btn" target="_blank" rel="noopener">${waSvg()} Check Availability</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="evc-primary-btn">📞 Book Now</a>` : ''}
    </div>
  </section>`;
}

function buildHalls(ctx: WebsiteRenderContext): string {
  const halls = (ctx as unknown as Record<string,unknown>)['halls'] as {name:string;capacity:string;priceKobo?:number;price?:string;imageUrl?:string;featured?:boolean}[] | undefined;
  const list = halls && halls.length > 0 ? halls : [
    {name:'Grand Ballroom',capacity:'Up to 500 guests',priceKobo:35000000,featured:true},
    {name:'Conference Hall',capacity:'Up to 150 guests',priceKobo:12000000,featured:false},
    {name:'VIP Lounge',capacity:'Up to 50 guests',priceKobo:6000000,featured:false},
    {name:'Outdoor Pavilion',capacity:'Up to 300 guests',priceKobo:20000000,featured:false},
  ];
  const cards = list.slice(0,4).map(h => {
    const priceDisplay = h.priceKobo != null ? `From ${fmtKobo(h.priceKobo)}` : (h.price ?? 'Call for pricing');
    const imgHtml = h.imageUrl
      ? `<img src="${safeHref(h.imageUrl)}" alt="${esc(h.name)}" class="evc-hall-img">`
      : `<div class="evc-hall-img">🎪</div>`;
    return `<div class="evc-hall-card${h.featured?' featured':''}">
      ${imgHtml}
      <div class="evc-hall-body">
        <div class="evc-hall-name">${esc(h.name)}</div>
        <div class="evc-hall-capacity">👥 ${esc(h.capacity)}</div>
        <div class="evc-hall-price">${esc(priceDisplay)}</div>
      </div>
    </div>`;
  }).join('');
  return `<section class="evc-section">
    <h2 class="evc-section-title">Our Halls</h2>
    <div class="evc-halls-grid">${cards}</div>
    <p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.75rem">Prices are per event session. Full-day and multi-day rates available. Contact us for a bespoke quote.</p>
  </section>`;
}

function buildAmenities(ctx: WebsiteRenderContext): string {
  const amenities = (ctx as unknown as Record<string,unknown>)['amenities'] as {name:string;icon:string}[] | undefined;
  const list = amenities && amenities.length > 0 ? amenities : [
    {name:'Central Air Conditioning',icon:'❄️'},{name:'Generator Backup',icon:'⚡'},
    {name:'Ample Car Parking',icon:'🚗'},{name:'Catering Kitchen',icon:'🍽️'},
    {name:'Stage & Podium',icon:'🎤'},{name:'PA Sound System',icon:'🔊'},
    {name:'Projector & Screen',icon:'📽️'},{name:'Bridal Suite',icon:'💍'},
    {name:'Security',icon:'🔒'},{name:'Wi-Fi',icon:'📶'},
  ];
  const items = list.slice(0,10).map(a => `
    <div class="evc-amenity">
      <span class="evc-amenity-icon">${esc(a.icon)}</span>
      <span>${esc(a.name)}</span>
    </div>`).join('');
  return `<section class="evc-section">
    <h2 class="evc-section-title">Facilities & Amenities</h2>
    <div class="evc-amenities-grid">${items}</div>
  </section>`;
}

function buildEventTypes(ctx: WebsiteRenderContext): string {
  const types = (ctx as unknown as Record<string,unknown>)['eventTypes'] as string[] | undefined;
  const list = types && types.length > 0 ? types : ['Owambe / Naming Ceremony','Wedding Reception','Corporate Dinner','Product Launch','Conference / Seminar','Birthday Party','Church Programme','Graduation Party','Fundraising Gala','Award Night'];
  const chips = list.map(t => `<span class="evc-type-chip">${esc(t)}</span>`).join('');
  return `<section class="evc-section">
    <h2 class="evc-section-title">Events We Host</h2>
    <div class="evc-event-types">${chips}</div>
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
    phone ? `<div class="evc-contact-row"><span class="evc-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="evc-contact-row"><span class="evc-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="evc-contact-row"><span class="evc-contact-label">Address</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="evc-contact-row"><span class="evc-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Book via WhatsApp</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="evc-section">
    <h2 class="evc-section-title">Book a Tour or Enquire</h2>
    <div class="evc-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="evc-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Events Centre, Nigeria.<br>
    LASG Event Licensed &bull; NAFDAC Catering Compliant &bull; CAC Registered &bull; NDPR Compliant
  </footer>`;
}

export const eventsCentreEventsCentreRentalTemplate: WebsiteTemplateContract = {
  slug: 'events-centre-events-centre-rental',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildHalls(ctx), buildAmenities(ctx), buildEventTypes(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
