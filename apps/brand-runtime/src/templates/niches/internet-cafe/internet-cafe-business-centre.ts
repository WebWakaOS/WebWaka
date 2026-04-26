/**
 * Internet Café / Business Centre Site — Pillar 3 Website Template
 * Niche ID: P3-internet-cafe-internet-cafe-business-centre
 * Vertical: internet-cafe (priority=3, medium)
 * Category: commerce/digital
 * Family: NF-COM-DIG (standalone)
 * Research brief: docs/templates/research/internet-cafe-internet-cafe-business-centre-brief.md
 * Nigeria-First Priority: medium
 * Regulatory signals: NCC, JAMB CBT licensing, WAEC, NITDA, CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need internet and business centre services.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ica-hero{text-align:center;padding:3rem 0 2.25rem}
.ica-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.ica-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ica-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.ica-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.ica-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ica-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ica-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ica-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ica-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ica-section{margin-top:2.75rem}
.ica-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ica-services-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
.ica-svc-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface);text-align:center}
.ica-svc-icon{font-size:1.75rem;margin-bottom:.5rem}
.ica-svc-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.ica-svc-desc{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.ica-pricing-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:.5rem}
.ica-price-row{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface);font-size:.9375rem}
.ica-price-item{font-weight:600}
.ica-price-val{font-weight:700;color:var(--ww-primary)}
.ica-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.ica-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.ica-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.ica-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone);
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="ica-logo">` : '';
  return `<section class="ica-hero">
    ${logoHtml}
    <div class="ica-badge">💻 JAMB · WAEC · NCC Compliant</div>
    <h1>${esc(name)}</h1>
    <p class="ica-tagline">${esc(tagline ?? 'High-speed internet, printing, scanning, JAMB registration & business centre services — open 7 days.')}</p>
    <div class="ica-ctas">
      ${wa ? `<a href="${wa}" class="ica-wa-btn" target="_blank" rel="noopener">${waSvg()} WhatsApp Us</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="ica-primary-btn">📞 Call Now</a>` : ''}
    </div>
  </section>`;
}

function buildServices(ctx: WebsiteRenderContext): string {
  const services = (((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).length > 0) ? ((ctx.data.services as {name:string;description?:string|null}[] | undefined) ?? []).slice(0,8) : [
    {name:'High-Speed Internet',description:'Fibre + 4G backup. Per-hour and daily passes available. Aircon seating.'},
    {name:'Printing & Photocopying',description:'A4 / A3 colour and mono. Binding, lamination, and spiral binding.'},
    {name:'Scanning & Email',description:'Document scanning, PDF conversion, and email to any address on demand.'},
    {name:'JAMB Registration',description:'JAMB UTME/DIRECT ENTRY registration, CAPS access, and CBT mock exams.'},
    {name:'WAEC & NECO',description:'WAEC/NECO result checking, credential verification, and online application support.'},
    {name:'Passport Photo',description:'Digital passport photos — Nigerian standard (white background, biometric spec).'},
    {name:'CV Typing & Design',description:'Professional CV writing, cover letters, and job application form filling.'},
    {name:'Government Forms',description:'NIN enrolment, BVN update, FRSC licence renewal, NIMC, and DL online forms.'},
  ];
  const cards = services.map((s: Record<string,unknown>) => `
    <div class="ica-svc-card">
      <div class="ica-svc-icon">💻</div>
      <div class="ica-svc-name">${esc(String(s.name ?? ''))}</div>
      <div class="ica-svc-desc">${esc(String(s.description ?? ''))}</div>
    </div>`).join('');
  return `<section class="ica-section">
    <h2 class="ica-section-title">Our Services</h2>
    <div class="ica-services-grid">${cards}</div>
  </section>`;
}

function buildPricing(ctx: WebsiteRenderContext): string {
  const pricing = (ctx as unknown as Record<string,unknown>)['pricing'] as {item:string;price:string}[] | undefined;
  const list = pricing && pricing.length > 0 ? pricing : [
    {item:'Internet — 1 hour',price:'₦200'},
    {item:'Internet — 3 hours',price:'₦500'},
    {item:'Print (A4 mono)',price:'₦30/page'},
    {item:'Print (A4 colour)',price:'₦100/page'},
    {item:'Scanning (per page)',price:'₦50'},
    {item:'JAMB Registration',price:'₦4,700 (JAMB fee)'},
  ];
  const rows = list.map(p => `
    <li class="ica-price-row">
      <span class="ica-price-item">${esc(p.item)}</span>
      <span class="ica-price-val">${esc(p.price)}</span>
    </li>`).join('');
  return `<section class="ica-section">
    <h2 class="ica-section-title">Pricing</h2>
    <ul class="ica-pricing-list">${rows}</ul>
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
    phone ? `<div class="ica-contact-row"><span class="ica-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="ica-contact-row"><span class="ica-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="ica-contact-row"><span class="ica-contact-label">Location</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="ica-contact-row"><span class="ica-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Chat Now</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="ica-section">
    <h2 class="ica-section-title">Location & Contact</h2>
    <div class="ica-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="ica-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Internet Café & Business Centre, Nigeria.<br>
    NCC Compliant &bull; CAC Registered &bull; NITDA Aligned &bull; NDPR Compliant
  </footer>`;
}

export const internetCafeInternetCafeBusinessCentreTemplate: WebsiteTemplateContract = {
  slug: 'internet-cafe-internet-cafe-business-centre',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildServices(ctx), buildPricing(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
