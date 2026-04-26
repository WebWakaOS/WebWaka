/**
 * Laundromat / Laundry Service Site — Pillar 3 Website Template
 * Niche ID: P3-laundry-service-laundry-service-site
 * Vertical: laundry-service (priority=3, medium)
 * Category: commerce/services
 * Family: NF-COM-SVC (standalone)
 * Research brief: docs/templates/research/laundry-service-laundry-service-site-brief.md
 * Nigeria-First Priority: medium
 * Regulatory signals: CAC, NESREA (NAFDAC chemicals), NDPR, Lagos LASEPA
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I need laundry services. Can you assist?')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.ldy-hero{text-align:center;padding:3rem 0 2.25rem}
.ldy-logo{height:80px;width:80px;object-fit:cover;border-radius:8px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.ldy-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem 1rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.ldy-hero h1{font-size:clamp(1.875rem,4.5vw,2.875rem);font-weight:900;line-height:1.15;margin-bottom:.5rem}
.ldy-tagline{font-size:1.0625rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 1.75rem;line-height:1.65}
.ldy-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.ldy-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.875rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.ldy-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.ldy-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.ldy-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.ldy-section{margin-top:2.75rem}
.ldy-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.ldy-pricing-list{list-style:none;padding:0;display:flex;flex-direction:column;gap:.5rem}
.ldy-price-row{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);background:var(--ww-surface);font-size:.9375rem}
.ldy-price-item{font-weight:600}
.ldy-price-val{font-weight:700;color:var(--ww-primary)}
.ldy-process-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}
.ldy-step-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1rem;background:var(--ww-surface);text-align:center}
.ldy-step-num{font-size:1.75rem;font-weight:900;color:var(--ww-primary);margin-bottom:.25rem}
.ldy-step-label{font-weight:700;font-size:.9375rem;margin-bottom:.25rem}
.ldy-step-desc{font-size:.8125rem;color:var(--ww-text-muted)}
.ldy-contact-box{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-surface);display:flex;flex-direction:column;gap:.75rem}
.ldy-contact-row{display:flex;align-items:flex-start;gap:.75rem;font-size:.9375rem}
.ldy-contact-label{font-weight:600;min-width:80px;color:var(--ww-primary)}
.ldy-footer{margin-top:3rem;padding:1.5rem 0 1rem;border-top:1px solid var(--ww-border);text-align:center;font-size:.8125rem;color:var(--ww-text-muted)}
</style>`;

function buildHero(ctx: WebsiteRenderContext): string {
  const name = ctx.displayName;
    const logoUrl = ctx.logoUrl;
    const phone = (ctx.data.phone as string | null) ?? null;
    const email = (ctx.data.email as string | null) ?? null;
    const address = (ctx.data.address as string | null) ?? null;
    const whatsapp = (ctx.data.whatsapp as string | null) ?? null;
    const tagline = (ctx.data.tagline as string | null) ?? null;
  const wa = whatsappLink(whatsapp ?? phone, 'Hello, I need laundry pickup and delivery. Can you assist?');
  const logoHtml = logoUrl ? `<img src="${safeHref(logoUrl)}" alt="${esc(name)} logo" class="ldy-logo">` : '';
  return `<section class="ldy-hero">
    ${logoHtml}
    <div class="ldy-badge">👕 Wash · Dry-Clean · Deliver</div>
    <h1>${esc(name)}</h1>
    <p class="ldy-tagline">${esc(tagline ?? 'Professional laundry & dry-cleaning — pickup & delivery in Lagos. Hotels, residentials & corporate accounts welcome.')}</p>
    <div class="ldy-ctas">
      ${wa ? `<a href="${wa}" class="ldy-wa-btn" target="_blank" rel="noopener">${waSvg()} Schedule Pickup</a>` : ''}
      ${phone ? `<a href="tel:${esc(phone)}" class="ldy-primary-btn">📞 Call Now</a>` : ''}
    </div>
  </section>`;
}

function buildPricing(ctx: WebsiteRenderContext): string {
  type Item = {item:string;price?:number;priceKobo?:number;displayPrice?:string};
  const items = (ctx.data.services as {name:string;description?:string|null}[] | undefined) as Item[] | undefined;
  const defaults: Item[] = [
    {item:'Shirt (wash & iron)',priceKobo:80000},
    {item:'Trouser (wash & iron)',priceKobo:100000},
    {item:'Suit (dry clean)',priceKobo:350000},
    {item:'Native attire (agbada)',priceKobo:500000},
    {item:'Bedsheet (per set)',priceKobo:200000},
    {item:'Duvet / Comforter',priceKobo:400000},
    {item:'Sneakers (wash)',priceKobo:150000},
    {item:'Corporate Bundle (5kg)',priceKobo:1200000},
  ];
  const list = (items && items.length > 0) ? items.slice(0,8) : defaults;
  const rows = list.map(it => {
    const price = it.priceKobo != null ? fmtKobo(it.priceKobo) : it.price != null ? fmtKobo(it.price*100) : (it.displayPrice ?? 'Call for price');
    return `<li class="ldy-price-row"><span class="ldy-price-item">${esc(it.item)}</span><span class="ldy-price-val">${esc(String(price))}</span></li>`;
  }).join('');
  return `<section class="ldy-section">
    <h2 class="ldy-section-title">Pricing</h2>
    <ul class="ldy-pricing-list">${rows}</ul>
    <p style="font-size:.8125rem;color:var(--ww-text-muted);margin-top:.75rem">Minimum order applies. Hotel B2B and corporate accounts — contact us for volume pricing.</p>
  </section>`;
}

function buildProcess(): string {
  const steps = [
    {num:'1',label:'Schedule',desc:'WhatsApp us your address and preferred pickup time.'},
    {num:'2',label:'Pickup',desc:'We collect your laundry — same day available in Lagos.'},
    {num:'3',label:'Clean',desc:'Professional wash, dry-clean, or iron as instructed.'},
    {num:'4',label:'Deliver',desc:'Clean, folded, and packaged — delivered to your door.'},
  ];
  const cards = steps.map((s: Record<string,unknown>) => `
    <div class="ldy-step-card">
      <div class="ldy-step-num">${esc(String(s.num ?? ''))}</div>
      <div class="ldy-step-label">${esc(String(s.label ?? ''))}</div>
      <div class="ldy-step-desc">${esc(String(s.desc ?? ''))}</div>
    </div>`).join('');
  return `<section class="ldy-section">
    <h2 class="ldy-section-title">How It Works</h2>
    <div class="ldy-process-grid">${cards}</div>
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
    phone ? `<div class="ldy-contact-row"><span class="ldy-contact-label">Phone</span><a href="tel:${esc(phone)}">${esc(phone)}</a></div>` : '',
    email ? `<div class="ldy-contact-row"><span class="ldy-contact-label">Email</span><a href="mailto:${esc(email)}">${esc(email)}</a></div>` : '',
    address ? `<div class="ldy-contact-row"><span class="ldy-contact-label">Location</span><span>${esc(address)}</span></div>` : '',
    wa ? `<div class="ldy-contact-row"><span class="ldy-contact-label">WhatsApp</span><a href="${wa}" target="_blank" rel="noopener">Schedule Pickup</a></div>` : '',
  ].filter(Boolean).join('');
  return `<section class="ldy-section">
    <h2 class="ldy-section-title">Contact Us</h2>
    <div class="ldy-contact-box">${rows}</div>
  </section>`;
}

function buildFooter(ctx: WebsiteRenderContext): string {
  return `<footer class="ldy-footer">
    &copy; ${new Date().getFullYear()} ${esc(ctx.displayName)} &mdash; Laundry Service, Nigeria.<br>
    CAC Registered &bull; NDPR Compliant &bull; LASEPA Approved
  </footer>`;
}

export const laundryServiceLaundryServiceSiteTemplate: WebsiteTemplateContract = {
  slug: 'laundry-service-laundry-service-site',
  version: '1.0.0',
  pages: ['home'],

  renderPage(ctx: WebsiteRenderContext): string {
    return [CSS, buildHero(ctx), buildPricing(ctx), buildProcess(), buildContact(ctx), buildFooter(ctx)].join('\n');
  },
};
