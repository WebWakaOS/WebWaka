/**
 * Florist / Garden Centre — Pillar 2 Website Template
 * Slug: florist-florist-garden-centre
 * Vertical: florist (priority=2)
 * Category: commerce
 * Nigeria-First Priority: medium
 * Regulatory signals: CAC, NESREA (plant import)
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need flower arrangements and décor. Can you help?')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.flo-hero{text-align:center;padding:3rem 0 2.25rem}
.flo-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.flo-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.flo-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.flo-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.flo-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.flo-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.flo-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.flo-section{margin-top:2.75rem}
.flo-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.flo-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
.flo-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.flo-card-icon{font-size:1.75rem;margin-bottom:.5rem}
.flo-card-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.flo-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.flo-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.flo-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.flo-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need flower arrangements for an event. Can you help?');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="flo-logo">` : '';
  return `<section class="flo-hero">
    ${logoHtml}
    <div class="flo-badge">🌸 Flowers · Events · Garden</div>
    <h1>${esc(name)}</h1>
    <p class="flo-tagline">${esc(tagline ?? 'Creative florist and garden centre — wedding bouquets, event floral décor, funeral wreaths, indoor plants and landscape gardening services.')}</p>
    <div class="flo-ctas">
      ${wa ? `<a href="${wa}" class="flo-wa-btn" target="_blank" rel="noopener">${waSvg()} Order Flowers</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="flo-primary-btn">📞 Call Florist</a>` : ''}
    </div>
  </section>`;
}

function buildServices(_ctx: WebsiteRenderContext): string {
  const svcs = [
    {icon:'💐',name:'Wedding Bouquets',desc:'Bridal bouquets, buttonholes, centrepieces and full chapel floral arrangements. From ₦30,000.'},
    {icon:'🌺',name:'Event Decoration',desc:'Corporate events, birthdays, naming ceremonies and anniversary floral décor.'},
    {icon:'🏵',name:'Funeral Wreaths',desc:'Sympathy wreaths and funeral tributes in fresh and artificial flowers.'},
    {icon:'🌿',name:'Indoor Plants',desc:'Peace lily, pothos, succulents, palms and rubber plants for homes and offices.'},
    {icon:'🌳',name:'Landscape & Garden',desc:'Garden design, planting, lawn maintenance and landscaping contracts.'},
    {icon:'🎁',name:'Gift Arrangements',desc:'Valentine, Mother\'s Day and birthday surprise flower baskets and gift boxes.'},
  ];
  const cards = svcs.map(s=>`<div class="flo-card"><div class="flo-card-icon">${s.icon}</div><div class="flo-card-name">${s.name}</div><div class="flo-card-desc">${s.desc}</div></div>`).join('');
  return `<section class="flo-section"><h2 class="flo-section-title">Our Services</h2><div class="flo-grid">${cards}</div></section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to order flowers for an event. Please advise.');
  return `<section class="flo-section"><h2 class="flo-section-title">Order Flowers</h2>
    <div class="flo-contact-box">
      ${address ? `<div class="flo-contact-row"><span class="flo-contact-label">Shop</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="flo-contact-row"><span class="flo-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="flo-contact-row"><span class="flo-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="flo-contact-row"><span class="flo-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Place Order</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">CAC Registered. Payment: Paystack or bank transfer. Delivery available. Your data handled under NDPR.</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildServices(ctx) + buildContact(ctx);
}

export const floristFloristGardenCentreTemplate: WebsiteTemplateContract = {
  slug: 'florist-florist-garden-centre',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
