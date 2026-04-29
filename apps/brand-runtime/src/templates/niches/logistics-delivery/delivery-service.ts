/**
 * Logistics & Delivery (Last-Mile) — Pillar 2 Website Template
 * Slug: logistics-delivery-delivery-service
 * Vertical: logistics-delivery (priority=2)
 * Category: transport
 * Nigeria-First Priority: high
 * Regulatory signals: FRSC, VIO, CAC, NIWA (waterways if applicable)
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need delivery services. Please share your rates and coverage area.')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.lgd-hero{text-align:center;padding:3rem 0 2.25rem}
.lgd-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.lgd-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.lgd-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.lgd-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.lgd-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.lgd-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.lgd-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.lgd-section{margin-top:2.75rem}
.lgd-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.lgd-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.lgd-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.lgd-card-icon{font-size:1.75rem;margin-bottom:.5rem}
.lgd-card-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.lgd-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.lgd-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.lgd-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.lgd-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need delivery services. Please share your rates and coverage.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="lgd-logo">` : '';
  return `<section class="lgd-hero">
    ${logoHtml}
    <div class="lgd-badge">🚚 Deliver · Track · Move</div>
    <h1>${esc(name)}</h1>
    <p class="lgd-tagline">${esc(tagline ?? 'Last-mile logistics and delivery service — same-day and next-day delivery, e-commerce fulfilment, bulk freight and nationwide distribution across Nigeria.')}</p>
    <div class="lgd-ctas">
      ${wa ? `<a href="${wa}" class="lgd-wa-btn" target="_blank" rel="noopener">${waSvg()} Book Delivery</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="lgd-primary-btn">📞 Call Operations</a>` : ''}
    </div>
  </section>`;
}

function buildServices(_ctx: WebsiteRenderContext): string {
  const svcs = [
    {icon:'⚡',name:'Same-Day Delivery',desc:'Pick-up and deliver within the same city in 2–6 hours. Lagos, Abuja, PH.'},
    {icon:'🌍',name:'Nationwide Delivery',desc:'Overnight and 2–3 day delivery to all 36 states and FCT.'},
    {icon:'📦',name:'E-commerce Fulfilment',desc:'Warehouse, pick, pack and ship for online stores. Integration with Jumia/Konga.'},
    {icon:'🚛',name:'Bulk Freight',desc:'Cross-country bulk cargo movement — open trucks, container vans, tankers.'},
    {icon:'📍',name:'Live Tracking',desc:'Real-time SMS and WhatsApp delivery updates for every shipment.'},
    {icon:'🏢',name:'Corporate Logistics',desc:'Dedicated fleet management for banks, FMCG companies and distributors.'},
  ];
  const cards = svcs.map(s=>`<div class="lgd-card"><div class="lgd-card-icon">${s.icon}</div><div class="lgd-card-name">${s.name}</div><div class="lgd-card-desc">${s.desc}</div></div>`).join('');
  return `<section class="lgd-section"><h2 class="lgd-section-title">Our Services</h2><div class="lgd-grid">${cards}</div></section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to book a delivery. Please share rates and coverage area.');
  return `<section class="lgd-section"><h2 class="lgd-section-title">Book a Delivery</h2>
    <div class="lgd-contact-box">
      ${address ? `<div class="lgd-contact-row"><span class="lgd-contact-label">Hub Address</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="lgd-contact-row"><span class="lgd-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="lgd-contact-row"><span class="lgd-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="lgd-contact-row"><span class="lgd-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Book Pickup</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">FRSC Licensed Fleet. CAC Registered. Payment: Paystack, bank transfer or cash on pickup. Your data handled under NDPR.</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildServices(ctx) + buildContact(ctx);
}

export const logisticsDeliveryDeliveryServiceTemplate: WebsiteTemplateContract = {
  slug: 'logistics-delivery-delivery-service',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
