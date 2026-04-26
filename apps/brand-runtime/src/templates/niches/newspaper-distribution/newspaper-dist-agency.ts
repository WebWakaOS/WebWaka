/**
 * Newspaper Distribution Agency Site — Pillar 3 Website Template
 * Niche ID: P3-newspaper-distribution-newspaper-dist-agency
 * Vertical: newspaper-distribution (priority=3, medium)
 * Category: media/print
 * Family: NF-MED-PRT (standalone)
 * Research brief: docs/templates/research/newspaper-distribution-newspaper-dist-agency-brief.md
 * Nigeria-First Priority: medium
 * Regulatory signals: NUJ, NPC (Nigeria Press Council), CAC, NDPR
 */

import type { WebsiteRenderContext, WebsiteTemplateContract } from '@webwaka/verticals';

const esc = (s: string): string =>
  s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function whatsappLink(phone: string | null, msg?: string): string | null {
  if (!phone) return null;
  const d = phone.replace(/\D/g,'');
  const intl = d.startsWith('234') ? d : d.startsWith('0') ? '234'+d.slice(1) : '234'+d;
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to subscribe to newspaper distribution.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.nda-hero{text-align:center;padding:3rem 0 2.25rem}
.nda-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.nda-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.nda-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.nda-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.nda-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.nda-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.nda-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.nda-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.nda-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.nda-section{margin-top:2.75rem}
.nda-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.nda-titles-grid{display:grid;gap:.75rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.nda-title-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;background:var(--ww-surface);text-align:center}
.nda-title-name{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.nda-title-freq{font-size:.8rem;color:var(--ww-text-muted)}
.nda-plans-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.nda-plan-card{border:2px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;background:var(--ww-surface);text-align:center}
.nda-plan-card.featured{border-color:var(--ww-primary)}
.nda-plan-name{font-weight:800;font-size:1rem;margin-bottom:.25rem}
.nda-plan-price{font-size:1.25rem;font-weight:900;color:var(--ww-primary);margin-bottom:.5rem}
.nda-plan-desc{font-size:.8125rem;color:var(--ww-text-muted)}
.nda-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.nda-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.nda-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.nda-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I would like to subscribe to newspaper distribution. Please share your plans.');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="nda-logo">` : '';
  return `<section class="nda-hero">
    ${logoHtml}
    <div class="nda-badge">📰 NPC Registered · NUJ Partner</div>
    <h1>${esc(name)}</h1>
    <p class="nda-tagline">${esc(tagline ?? 'Early-morning newspaper delivery — The Punch, Vanguard, ThisDay, BusinessDay & more. Lagos-wide coverage.')}</p>
    <div class="nda-ctas">
      ${wa ? `<a href="${wa}" class="nda-wa-btn" target="_blank" rel="noopener">${waSvg()} Subscribe via WhatsApp</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="nda-primary-btn">📞 Call Us</a>` : ''}
    </div>
  </section>`;
}

function buildTitles(ctx: WebsiteRenderContext): string {
  const titles = (ctx as unknown as Record<string,unknown>)['titles'] as {name:string;frequency:string}[] | undefined;
  const list = titles && titles.length > 0 ? titles : [
    {name:'The Punch',frequency:'Daily'},
    {name:'Vanguard',frequency:'Daily'},
    {name:'ThisDay',frequency:'Daily'},
    {name:'BusinessDay',frequency:'Mon–Sat'},
    {name:'Tribune',frequency:'Daily'},
    {name:'The Guardian',frequency:'Daily'},
    {name:'Sun News',frequency:'Daily'},
    {name:'Premium Times (print)',frequency:'Weekly'},
  ];
  const cards = list.slice(0,8).map(t => `
    <div class="nda-title-card">
      <div class="nda-title-name">📰 ${esc(t.name)}</div>
      <div class="nda-title-freq">${esc(t.frequency)}</div>
    </div>`).join('');
  return `<section class="nda-section">
    <h2 class="nda-section-title">Titles We Distribute</h2>
    <div class="nda-titles-grid">${cards}</div>
  </section>`;
}

function buildPlans(ctx: WebsiteRenderContext): string {
  const plans = (ctx as unknown as Record<string,unknown>)['plans'] as {name:string;price:string;description:string;featured?:boolean}[] | undefined;
  const list = plans && plans.length > 0 ? plans : [
    {name:'Single Title',price:'₦2,500/mo',description:'One newspaper, delivered 6 days a week to your door.',featured:false},
    {name:'Bundle (3 Titles)',price:'₦6,500/mo',description:'Your choice of 3 titles. Morning delivery before 7 AM.',featured:true},
    {name:'Corporate Bulk',price:'Custom',description:'50+ copies daily for offices, hotels, and lounges. Invoice billing.',featured:false},
  ];
  const cards = list.map(p => `
    <div class="nda-plan-card${p.featured?' featured':''}">
      <div class="nda-plan-name">${esc(p.name)}</div>
      <div class="nda-plan-price">${esc(p.price)}</div>
      <div class="nda-plan-desc">${esc(p.description)}</div>
    </div>`).join('');
  return `<section class="nda-section">
    <h2 class="nda-section-title">Subscription Plans</h2>
    <div class="nda-plans-grid">${cards}</div>
    <p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.75rem">Payment via bank transfer or Paystack. Subscription starts next business day.</p>
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
    phone ? `<div class="nda-contact-row"><span class="nda-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="nda-contact-row"><span class="nda-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="nda-contact-row"><span class="nda-contact-label">Depot</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="nda-contact-row"><span class="nda-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Subscribe Now</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="nda-section">
    <h2 class="nda-section-title">Contact & Subscribe</h2>
    <div class="nda-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="nda-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Newspaper Distribution Agency, Nigeria.<br>
    NPC Registered &bull; NUJ Partner &bull; CAC Incorporated &bull; NDPR Compliant
  </footer>`;
}

export const newspaperDistributionNewspaperDistAgencyTemplate: WebsiteTemplateContract = {
  slug: 'newspaper-distribution-newspaper-dist-agency',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildTitles(ctx), buildPlans(ctx), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
