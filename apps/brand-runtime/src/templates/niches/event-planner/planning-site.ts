/**
 * Event Planner / MC — Pillar 2 Website Template
 * Slug: event-planner-planning-site
 * Vertical: event-planner (priority=2)
 * Category: professional
 * Nigeria-First Priority: high
 * Regulatory signals: CAC, APCON, AOCN
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need event planning services. Can we discuss?')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.evp-hero{text-align:center;padding:3rem 0 2.25rem}
.evp-logo{height:80px;width:80px;object-fit:cover;border-radius:50%;margin-bottom:1rem;border:3px solid var(--ww-primary)}
.evp-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.evp-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.evp-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.evp-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.evp-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.evp-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.evp-section{margin-top:2.75rem}
.evp-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.evp-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.evp-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.evp-card-icon{font-size:1.75rem;margin-bottom:.5rem}
.evp-card-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.evp-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.evp-packages-row{display:flex;flex-wrap:wrap;gap:1rem;margin-top:.5rem}
.evp-pkg{flex:1;min-width:200px;border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.evp-pkg-name{font-weight:700;font-size:1rem;margin-bottom:.25rem}
.evp-pkg-price{font-size:1.25rem;font-weight:900;color:var(--ww-primary);margin-bottom:.5rem}
.evp-pkg-feat{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.6}
.evp-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.evp-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.evp-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need help planning an event. Can we discuss?');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="evp-logo">` : '';
  return `<section class="evp-hero">
    ${logoHtml}
    <div class="evp-badge">🎉 Events · Weddings · Corporate · MC</div>
    <h1>${esc(name)}</h1>
    <p class="evp-tagline">${esc(tagline ?? 'Award-winning event planner and MC — weddings, birthday parties, naming ceremonies, corporate events and end-of-year parties across Nigeria.')}</p>
    <div class="evp-ctas">
      ${wa ? `<a href="${wa}" class="evp-wa-btn" target="_blank" rel="noopener">${waSvg()} Plan Your Event</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="evp-primary-btn">📞 Call Now</a>` : ''}
    </div>
  </section>`;
}

function buildServices(_ctx: WebsiteRenderContext): string {
  const svcs = [
    {icon:'💍',name:'Wedding Planning',desc:'Full-service coordination from engagement to reception. Décor, catering, MC, photography.'},
    {icon:'🎂',name:'Birthday & Naming Ceremonies',desc:'Themed décor, entertainment, food, asoebi coordination and venue sourcing.'},
    {icon:'🏢',name:'Corporate Events',desc:'Product launches, end-of-year parties, AGMs, staff retreats and award nights.'},
    {icon:'🎤',name:'MC & Compere',desc:'Professional bilingual MC (English/Yoruba/Igbo/Hausa) to animate any event.'},
    {icon:'🌸',name:'Décor & Styling',desc:'Floral arrangements, draping, lighting and venue transformation.'},
    {icon:'📸',name:'Vendor Coordination',desc:'Photographer, DJ, caterer and hall booking management in one place.'},
  ];
  const cards = svcs.map(s=>`<div class="evp-card"><div class="evp-card-icon">${s.icon}</div><div class="evp-card-name">${s.name}</div><div class="evp-card-desc">${s.desc}</div></div>`).join('');
  return `<section class="evp-section"><h2 class="evp-section-title">Our Services</h2><div class="evp-grid">${cards}</div></section>`;
}

function buildPackages(_ctx: WebsiteRenderContext): string {
  return `<section class="evp-section"><h2 class="evp-section-title">Packages</h2>
    <div class="evp-packages-row">
      <div class="evp-pkg"><div class="evp-pkg-name">Essential</div><div class="evp-pkg-price">₦150,000+</div><div class="evp-pkg-feat">Day-of coordination · MC · Basic décor · Vendor list</div></div>
      <div class="evp-pkg"><div class="evp-pkg-name">Premium</div><div class="evp-pkg-price">₦350,000+</div><div class="evp-pkg-feat">Full planning · Décor · Vendor management · Photography coordination</div></div>
      <div class="evp-pkg"><div class="evp-pkg-name">Luxury</div><div class="evp-pkg-price">₦700,000+</div><div class="evp-pkg-feat">Complete end-to-end · Premium décor · Live entertainment · Catering coordination</div></div>
    </div>
    <p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.75rem">Prices in Nigerian Naira (₦). Custom quote available. 30% deposit to confirm date. Payment via Paystack or bank transfer.</p>
  </section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want to inquire about planning my event. Please advise.');
  return `<section class="evp-section"><h2 class="evp-section-title">Contact Us</h2>
    <div class="evp-contact-box">
      ${address ? `<div class="evp-contact-row"><span class="evp-contact-label">Address</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="evp-contact-row"><span class="evp-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="evp-contact-row"><span class="evp-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="evp-contact-row"><span class="evp-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Chat to Book</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">CAC Registered. Your data is handled under the Nigeria Data Protection Regulation (NDPR).</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildServices(ctx) + buildPackages(ctx) + buildContact(ctx);
}

export const eventPlannerPlanningSiteTemplate: WebsiteTemplateContract = {
  slug: 'event-planner-planning-site',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
