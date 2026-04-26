/**
 * Cargo Truck / Fleet Operator Site — Pillar 3 Website Template
 * Niche ID: P3-cargo-truck-cargo-fleet-ops
 * Vertical: cargo-truck (priority=3, high)
 * Category: transport/freight
 * Family: NF-TRP-FRT (standalone)
 * Research brief: docs/templates/research/cargo-truck-cargo-fleet-ops-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: FRSC, VIO, LASG, SON, Road Transport Employers Assoc Nigeria, CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need cargo haulage. Please share your rates.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.cft-hero{text-align:center;padding:3rem 0 2.25rem}
.cft-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.cft-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.cft-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.cft-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.cft-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.cft-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.cft-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.cft-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.cft-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.cft-section{margin-top:2.75rem}
.cft-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.cft-routes-grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.cft-route-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;background:var(--ww-surface)}
.cft-route-path{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.cft-route-info{font-size:.8125rem;color:var(--ww-text-muted)}
.cft-fleet-grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.cft-truck-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;background:var(--ww-surface);text-align:center}
.cft-truck-icon{font-size:2rem;margin-bottom:.25rem}
.cft-truck-name{font-weight:600;font-size:.9375rem}
.cft-truck-cap{font-size:.8125rem;color:var(--ww-text-muted)}
.cft-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.cft-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.cft-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.cft-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need cargo haulage. Please share your rates and availability.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="cft-logo">` : '';
  return `<section class="cft-hero">
    ${logoHtml}
    <div class="cft-badge">🚛 FRSC Roadworthy · ECOWAS Corridor</div>
    <h1>${esc(name)}</h1>
    <p class="cft-tagline">${esc(tagline ?? 'Reliable cargo haulage — Apapa port to Kano, Onitsha, Abuja and beyond. FRSC-compliant fleet.')}</p>
    <div class="cft-ctas">
      ${wa ? `<a href="${wa}" class="cft-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp for Quote</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="cft-primary-btn">📞 Call Now</a>` : ''}
    </div>
  </section>`;
}

function buildRoutes(ctx: WebsiteRenderContext): string {
  const routes = (ctx as unknown as Record<string,unknown>)['routes'] as {path:string;info:string}[] | undefined;
  const list = routes && routes.length > 0 ? routes : [
    {path:'Lagos → Kano',info:'ECOWAS corridor, 2–3 days'},
    {path:'Apapa → Onitsha',info:'Port evacuation, 1–2 days'},
    {path:'Lagos → Abuja',info:'Expressway, 1 day'},
    {path:'Lagos → Port Harcourt',info:'Coastal route, 1–2 days'},
    {path:'Kano → Maiduguri',info:'North-East corridor'},
    {path:'Lagos → Lomé / Cotonou',info:'ECOWAS cross-border'},
  ];
  const cards = list.slice(0,6).map(r => `
    <div class="cft-route-card">
      <div class="cft-route-path">🛣️ ${esc(r.path)}</div>
      <div class="cft-route-info">${esc(r.info)}</div>
    </div>`).join('');
  return `<section class="cft-section">
    <h2 class="cft-section-title">Key Routes</h2>
    <div class="cft-routes-grid">${cards}</div>
  </section>`;
}

function buildFleet(ctx: WebsiteRenderContext): string {
  const fleet = (ctx as unknown as Record<string,unknown>)['fleet'] as {name:string;capacity:string;icon:string}[] | undefined;
  const list = fleet && fleet.length > 0 ? fleet : [
    {name:'30-ton Articulated Trailer',capacity:'30,000 kg payload',icon:'🚛'},
    {name:'20-ton Rigid Truck',capacity:'20,000 kg payload',icon:'🚚'},
    {name:'10-ton Flatbed',capacity:'10,000 kg payload',icon:'🛻'},
    {name:'Tanker (Petroleum)',capacity:'40,000 litres',icon:'⛽'},
  ];
  const cards = list.slice(0,4).map(f => `
    <div class="cft-truck-card">
      <div class="cft-truck-icon">${esc(f.icon)}</div>
      <div class="cft-truck-name">${esc(f.name)}</div>
      <div class="cft-truck-cap">${esc(f.capacity)}</div>
    </div>`).join('');
  return `<section class="cft-section">
    <h2 class="cft-section-title">Our Fleet</h2>
    <div class="cft-fleet-grid">${cards}</div>
    <p style="font-size:.875rem;color:var(--ww-text-muted);margin-top:.75rem">All vehicles are FRSC-roadworthy certified, fire-extinguisher equipped, and GPS-tracked for cargo safety.</p>
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
    phone ? `<div class="cft-contact-row"><span class="cft-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="cft-contact-row"><span class="cft-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="cft-contact-row"><span class="cft-contact-label">Base</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="cft-contact-row"><span class="cft-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="cft-section">
    <h2 class="cft-section-title">Contact Us</h2>
    <div class="cft-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="cft-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Cargo Fleet Operator, Nigeria.<br>
    FRSC Roadworthy &bull; RTEАН Member &bull; CAC Registered &bull; NDPR Compliant
  </footer>`;
}

export const cargoTruckCargoFleetOpsTemplate: WebsiteTemplateContract = {
  slug: 'cargo-truck-cargo-fleet-ops',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildRoutes(ctx), buildFleet(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
