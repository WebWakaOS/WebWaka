/**
 * Solar / Renewable Energy Installer — Pillar 2 Website Template
 * Slug: solar-installer-solar-installer-renewable
 * Vertical: solar-installer (priority=2)
 * Category: commerce
 * Nigeria-First Priority: high
 * Regulatory signals: NERC, NAEE, REA, SON, CAC
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need a solar system installed. Can you provide a quote and site assessment?')}`;
}
function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}
const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.slr-hero{text-align:center;padding:3rem 0 2.25rem}
.slr-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.slr-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.slr-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.slr-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.slr-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.slr-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.slr-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px}
.slr-section{margin-top:2.75rem}
.slr-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.slr-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.slr-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.slr-card-icon{font-size:1.75rem;margin-bottom:.5rem}
.slr-card-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.slr-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55}
.slr-packages-row{display:flex;flex-wrap:wrap;gap:1rem}
.slr-pkg{flex:1;min-width:180px;border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface)}
.slr-pkg-name{font-weight:700;font-size:1rem;margin-bottom:.25rem}
.slr-pkg-price{font-size:1.25rem;font-weight:900;color:var(--ww-primary);margin-bottom:.25rem}
.slr-pkg-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.slr-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.slr-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.slr-contact-label{font-weight:600;min-width:90px;color:var(--ww-primary)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
  const logoUrl = ctx.logoUrl;
  const phone = (ctx.data.phone as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need a solar system installed. Can you carry out a site assessment?');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="slr-logo">` : '';
  return `<section class="slr-hero">
    ${logoHtml}
    <div class="slr-badge">☀ Solar · Inverter · Off-Grid</div>
    <h1>${esc(name)}</h1>
    <p class="slr-tagline">${esc(tagline ?? 'NERC-registered solar and renewable energy installer — solar panels, inverter systems, battery backup, off-grid solutions and commercial solar for homes and businesses in Nigeria.')}</p>
    <div class="slr-ctas">
      ${wa ? `<a href="${wa}" class="slr-wa-btn" target="_blank" rel="noopener">${waSvg()} Get Free Assessment</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="slr-primary-btn">📞 Call Solar Engineer</a>` : ''}
    </div>
  </section>`;
}

function buildServices(_ctx: WebsiteRenderContext): string {
  const svcs = [
    {icon:'☀',name:'Solar Panel Installation',desc:'Monocrystalline and polycrystalline panels. Roof, ground-mount and carport systems.'},
    {icon:'🔋',name:'Battery Storage',desc:'Tubular, gel and lithium (LiFePO4) battery systems sized for your load.'},
    {icon:'⚡',name:'Inverter Systems',desc:'Hybrid, off-grid and grid-tied inverters. Deye, Victron, Growatt, Luminous.'},
    {icon:'🌍',name:'Off-Grid Systems',desc:'Complete energy independence for remote locations, farms and rural communities.'},
    {icon:'🏢',name:'Commercial Solar',desc:'Large-scale solar for factories, schools, hospitals and estates. ROI analysis provided.'},
    {icon:'🔧',name:'Maintenance & Repair',desc:'Panel cleaning, inverter servicing, battery health checks and performance monitoring.'},
  ];
  const cards = svcs.map(s=>`<div class="slr-card"><div class="slr-card-icon">${s.icon}</div><div class="slr-card-name">${s.name}</div><div class="slr-card-desc">${s.desc}</div></div>`).join('');
  return `<section class="slr-section"><h2 class="slr-section-title">Our Solutions</h2><div class="slr-grid">${cards}</div></section>`;
}

function buildPackages(_ctx: WebsiteRenderContext): string {
  return `<section class="slr-section"><h2 class="slr-section-title">Packages</h2>
    <div class="slr-packages-row">
      <div class="slr-pkg"><div class="slr-pkg-name">Starter</div><div class="slr-pkg-price">₦350,000+</div><div class="slr-pkg-desc">1kVA inverter · 200Ah battery · 2 × 200W panels · lights and fans</div></div>
      <div class="slr-pkg"><div class="slr-pkg-name">Home Plus</div><div class="slr-pkg-price">₦750,000+</div><div class="slr-pkg-desc">3.5kVA hybrid inverter · 400Ah · 4 × 400W panels · refrigerator + TV</div></div>
      <div class="slr-pkg"><div class="slr-pkg-name">Business</div><div class="slr-pkg-price">₦1.8M+</div><div class="slr-pkg-desc">10kVA · 800Ah lithium · 10 × 550W panels · full office load</div></div>
    </div>
    <p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.75rem">Prices in Naira (₦). Final quote after site assessment. Finance plans available. 5-year system warranty. Payment: Paystack or bank transfer.</p>
  </section>`;
}

function buildContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const address = (ctx.data.address as string | null) ?? null;
  const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I want a solar system quote. Please arrange a site visit.');
  return `<section class="slr-section"><h2 class="slr-section-title">Book a Site Assessment</h2>
    <div class="slr-contact-box">
      ${address ? `<div class="slr-contact-row"><span class="slr-contact-label">Office</span><span>${esc(address)}</span></div>` : ''}
      ${phone ? `<div class="slr-contact-row"><span class="slr-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : ''}
      ${email ? `<div class="slr-contact-row"><span class="slr-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : ''}
      ${wa ? `<div class="slr-contact-row"><span class="slr-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">${waSvg()} Get Free Quote</a></div>` : ''}
    </div>
    <p style="font-size:.75rem;color:var(--ww-text-muted);margin-top:1rem">NERC Registered. SON Certified Panels. REA Listed. CAC Incorporated. Your data handled under NDPR.</p>
  </section>`;
}

function renderPage(ctx: WebsiteRenderContext): string {
  return CSS + buildHero(ctx) + buildServices(ctx) + buildPackages(ctx) + buildContact(ctx);
}

export const solarInstallerSolarInstallerRenewableTemplate: WebsiteTemplateContract = {
  slug: 'solar-installer-solar-installer-renewable',
  version: '1.0.0',
  pages: ['home'],
  renderPage,
};
