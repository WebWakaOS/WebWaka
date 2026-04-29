/**
 * Recording Label Site — Pillar 3 Website Template
 * Niche ID: P3-recording-label-record-label-site
 * Vertical: recording-label (priority=3, high)
 * Category: creative
 * Family: NF-CRE-MUS (standalone)
 * Research brief: docs/templates/research/recording-label-record-label-site-brief.md
 * Nigeria-First Priority: high
 * Regulatory signals: COSON registration, CAC, NCC (online distribution)
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
  return `https://wa.me/${intl}?text=${encodeURIComponent(msg ?? 'Hello, I would like to discuss a deal with your label.')}`;
}

function safeHref(url: string): string {
  try { const p = new URL(url,'https://x'); if(p.protocol==='http:'||p.protocol==='https:') return encodeURI(url); } catch { /**/ }
  return '#';
}

const waSvg = () => `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.559 4.14 1.532 5.875L0 24l6.304-1.504A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.373l-.359-.213-3.739.892.944-3.636-.234-.373A9.817 9.817 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182c5.419 0 9.818 4.398 9.818 9.818 0 5.419-4.399 9.818-9.818 9.818z"/></svg>`;

const CSS = `<style>
.rl-hero{text-align:center;padding:3rem 0 2.5rem}
.rl-logo{height:80px;width:80px;object-fit:cover;border-radius:12px;margin-bottom:1rem;border:2px solid var(--ww-border)}
.rl-badge{display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .9rem;border-radius:999px;font-size:.8rem;font-weight:700;background:var(--ww-primary);color:#fff;margin-bottom:.875rem}
.rl-hero h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:900;line-height:1.1;margin-bottom:.625rem;letter-spacing:-.03em}
.rl-tagline{font-size:1.125rem;color:var(--ww-text-muted);max-width:38rem;margin:0 auto 2rem;line-height:1.7}
.rl-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.rl-primary-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.9rem 2rem;background:var(--ww-primary);color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.rl-primary-btn:hover{filter:brightness(1.1);text-decoration:none}
.rl-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:700;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.rl-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.rl-wa-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:filter .15s}
.rl-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.rl-section{margin-top:3rem}
.rl-section-title{font-size:1.375rem;font-weight:800;margin-bottom:1.25rem;color:var(--ww-primary)}
.rl-roster-grid{display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.rl-artist-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.5rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.5rem;border-left:4px solid var(--ww-primary)}
.rl-artist-name{font-size:1rem;font-weight:800;color:var(--ww-text);margin:0}
.rl-artist-genre{font-size:.8125rem;color:var(--ww-primary);font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.rl-artist-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.6;flex:1;margin:0}
.rl-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .75rem;justify-content:center;margin-top:2.5rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.rl-trust-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.rl-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.rl-about-strip{margin-top:2.5rem;padding:2rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.rl-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.rl-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.rl-contact-strip{margin-top:2rem;padding:1.25rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:.75rem 2rem}
.rl-strip-item{display:flex;flex-direction:column;gap:.2rem}
.rl-strip-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.rl-strip-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.rl-strip-value a{color:var(--ww-primary)}
.rl-wa-block{margin:1.75rem auto;text-align:center;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:2px solid #25D366;border-radius:var(--ww-radius);max-width:32rem}
.rl-wa-block p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:1rem}
.rl-contact-layout{display:grid;gap:2rem;margin-top:1.5rem}
@media(min-width:640px){.rl-contact-layout{grid-template-columns:1fr 1fr}}
.rl-contact-info h2,.rl-form-wrapper h2{font-size:1.125rem;font-weight:700;margin-bottom:1rem}
.rl-contact-info p{font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.625rem;line-height:1.6}
.rl-contact-info a{color:var(--ww-primary);font-weight:600}
.rl-form{display:flex;flex-direction:column;gap:.875rem}
.rl-form-group{display:flex;flex-direction:column;gap:.375rem}
.rl-form-group label{font-size:.875rem;font-weight:600;color:var(--ww-text)}
.rl-input{padding:.625rem .875rem;border:1px solid var(--ww-border);border-radius:var(--ww-radius);font-size:.9375rem;background:var(--ww-bg);color:var(--ww-text);width:100%;min-height:44px;font-family:var(--ww-font)}
.rl-input:focus{outline:2px solid var(--ww-primary);outline-offset:1px;border-color:transparent}
.rl-textarea{min-height:120px;resize:vertical}
.rl-ndpr{font-size:.8125rem;color:var(--ww-text-muted);padding:.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:calc(var(--ww-radius) - 2px);line-height:1.55}
.rl-ndpr a{color:var(--ww-primary)}
.rl-ndpr-check{display:flex;align-items:flex-start;gap:.5rem}
.rl-ndpr-check input{margin-top:.2rem;width:18px;height:18px;flex-shrink:0;accent-color:var(--ww-primary)}
.rl-ndpr-check label{font-size:.8125rem;color:var(--ww-text-muted);line-height:1.5}
.rl-submit{padding:.875rem 1.5rem;background:var(--ww-primary);color:#fff;border:none;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;cursor:pointer;min-height:44px;transition:filter .15s;font-family:var(--ww-font)}
.rl-submit:hover{filter:brightness(1.1)}
.rl-success{background:#f0fdf4;border:1px solid #86efac;border-radius:var(--ww-radius);padding:1.25rem;text-align:center;color:#166534}
.rl-about-hero{text-align:center;padding:2.5rem 0 2rem}
.rl-about-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.rl-about-body{max-width:44rem;margin:0 auto}
.rl-about-desc{color:var(--ww-text-muted);line-height:1.9;margin-bottom:2rem;font-size:1rem}
.rl-detail-list{display:flex;flex-direction:column;gap:.75rem;margin-bottom:2rem}
.rl-detail-row{display:flex;gap:1rem;align-items:flex-start}
.rl-detail-label{font-size:.875rem;font-weight:700;min-width:7rem;color:var(--ww-text);flex-shrink:0}
.rl-detail-value{font-size:.9375rem;color:var(--ww-text-muted)}
.rl-detail-value a{color:var(--ww-primary);font-weight:600}
.rl-roster-hero{text-align:center;padding:2.5rem 0 2rem}
.rl-roster-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.rl-roster-sub{color:var(--ww-text-muted);margin-bottom:1.5rem}
.rl-empty{text-align:center;color:var(--ww-text-muted);padding:3rem 1rem;font-size:1rem;line-height:1.8}
.rl-cta-strip{margin-top:2.5rem;padding:2rem 1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);text-align:center}
.rl-cta-strip h3{font-size:1.125rem;font-weight:700;margin-bottom:.5rem}
.rl-cta-strip p{color:var(--ww-text-muted);margin-bottom:1.25rem;font-size:.9375rem}
.rl-btn-row{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.rl-contact-hero{text-align:center;padding:2.5rem 0 2rem}
.rl-contact-hero h1{font-size:clamp(1.75rem,4vw,2.5rem);font-weight:900;margin-bottom:.5rem}
.rl-contact-hero p{color:var(--ww-text-muted);max-width:34rem;margin-inline:auto}
@media(max-width:375px){.rl-ctas{flex-direction:column;align-items:stretch}.rl-primary-btn,.rl-sec-btn,.rl-wa-btn{width:100%;justify-content:center}}
</style>`;

type Offering = { name: string; description: string | null; priceKobo: number | null };

function renderHome(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const description = (ctx.data.description as string | null) ?? null;
  const tagline = (ctx.data.tagline as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const category = (ctx.data.category as string | null) ?? null;
  const featured = offerings.slice(0,6);
  const waHref = whatsappLink(phone, `Hello! I would like to discuss signing with ${ctx.displayName} or a business collaboration.`);
  const bioExcerpt = description ? (description.length > 200 ? description.slice(0,200).trimEnd()+'…' : description) : null;
  return `${CSS}
<section class="rl-hero">
  ${ctx.logoUrl ? `<img class="rl-logo" src="${safeHref(ctx.logoUrl)}" alt="${esc(ctx.displayName)} logo" />` : ''}
  <div class="rl-badge">🎵 ${esc(category ?? 'Recording Label')}</div>
  <h1>${esc(ctx.displayName)}</h1>
  <p class="rl-tagline">${esc(tagline ?? `Afrobeats, Amapiano &amp; Nigerian music — born in ${placeName ?? 'Nigeria'}, heard across the world. COSON-registered.`)}</p>
  <div class="rl-ctas">
    <a class="rl-primary-btn" href="/services">Our Artists &amp; Catalogue</a>
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="rl-wa-btn">${waSvg()} Artist Enquiries</a>` : ''}
    <a class="rl-sec-btn" href="/contact">Contact A&amp;R</a>
  </div>
</section>
${featured.length > 0 ? `
<section class="rl-section">
  <h2 class="rl-section-title">Our Artists &amp; Releases</h2>
  <div class="rl-roster-grid">
    ${featured.map(o => `
    <div class="rl-artist-card">
      <h3 class="rl-artist-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="rl-artist-genre">${esc(o.description.split('|')[0]?.trim() ?? 'Afrobeats')}</p><p class="rl-artist-desc">${esc(o.description.split('|')[1]?.trim() ?? o.description)}</p>` : ''}
      ${o.priceKobo !== null ? `<span style="font-size:.875rem;font-weight:600;color:var(--ww-primary)">Booking from ${fmtKobo(o.priceKobo)}</span>` : ''}
    </div>`).join('')}
  </div>
  ${offerings.length > 6 ? `<a href="/services" style="display:inline-block;margin-top:1rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline">View full roster &rarr;</a>` : ''}
</section>` : ''}
<div class="rl-trust-strip">
  <span class="rl-trust-badge"><span class="rl-dot"></span> COSON Registered</span>
  <span class="rl-trust-badge"><span class="rl-dot"></span> CAC Registered</span>
  <span class="rl-trust-badge"><span class="rl-dot"></span> Afrobeats &amp; Amapiano</span>
  <span class="rl-trust-badge"><span class="rl-dot"></span> Global Distribution</span>
</div>
${bioExcerpt ? `
<div class="rl-about-strip">
  <h2>About ${esc(ctx.displayName)}</h2>
  <p>${esc(bioExcerpt)}</p>
  <a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Our story &rarr;</a>
</div>` : ''}
${(phone || placeName) ? `
<div class="rl-contact-strip">
  ${placeName ? `<div class="rl-strip-item"><span class="rl-strip-label">Studio Location</span><span class="rl-strip-value">${esc(placeName)}</span></div>` : ''}
  ${phone ? `<div class="rl-strip-item"><span class="rl-strip-label">A&amp;R / Business</span><span class="rl-strip-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
  <div class="rl-strip-item"><span class="rl-strip-label">Payment</span><span class="rl-strip-value">Bank Transfer · Paystack · Invoice</span></div>
</div>` : ''}`;
}

function renderAbout(ctx: WebsiteRenderContext): string {
  const description = (ctx.data.description as string | null) ?? null;
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to learn more about ${ctx.displayName} and discuss a signing.`);
  return `${CSS}
<section class="rl-about-hero">
  <h1>About ${esc(ctx.displayName)}</h1>
  <p style="color:var(--ww-text-muted);margin-top:.5rem">Nurturing Nigerian musical talent for the world stage</p>
</section>
<div class="rl-about-body">
  <p class="rl-about-desc">${esc(description ?? `${ctx.displayName} is a Nigerian recording label dedicated to developing and distributing authentic African music — from Afrobeats and Amapiano to Afropop and highlife. Incorporated under the Corporate Affairs Commission (CAC) and registered with COSON (Copyright Society of Nigeria), we provide our artists with A&R support, professional recording, music distribution through global digital platforms (Audiomack, Boomplay, Spotify), and full brand management.`)}</p>
  <div class="rl-detail-list">
    ${placeName ? `<div class="rl-detail-row"><span class="rl-detail-label">Location</span><span class="rl-detail-value">${esc(placeName)}</span></div>` : ''}
    ${phone ? `<div class="rl-detail-row"><span class="rl-detail-label">A&amp;R Line</span><span class="rl-detail-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>` : ''}
    ${email ? `<div class="rl-detail-row"><span class="rl-detail-label">Email</span><span class="rl-detail-value"><a href="mailto:${esc(email)}">${esc(email)}</a></span></div>` : ''}
    <div class="rl-detail-row"><span class="rl-detail-label">Rights</span><span class="rl-detail-value">COSON registered · Nigerian copyright law compliant</span></div>
    <div class="rl-detail-row"><span class="rl-detail-label">Distribution</span><span class="rl-detail-value">Audiomack · Boomplay · Spotify · Apple Music · TikTok</span></div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:.75rem">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="rl-wa-btn">${waSvg()} Contact A&amp;R</a>` : ''}
    <a class="rl-primary-btn" href="/services">View Roster</a>
  </div>
</div>`;
}

function renderServices(ctx: WebsiteRenderContext): string {
  const offerings = (ctx.data.offerings ?? []) as Offering[];
  const phone = (ctx.data.phone as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to discuss joining ${ctx.displayName}'s roster or a licensing enquiry.`);
  const grid = offerings.length === 0
    ? `<div class="rl-empty"><p>Our full artist roster and catalogue are being updated.<br/>Please contact our A&amp;R team via WhatsApp for artist bookings or signing enquiries.</p><br/><a class="rl-wa-btn" href="${waHref ?? '/contact'}" target="_blank" rel="noopener noreferrer">${waSvg()} Contact A&amp;R</a></div>`
    : `<div class="rl-roster-grid">${offerings.map(o => `
    <div class="rl-artist-card">
      <h3 class="rl-artist-name">${esc(o.name)}</h3>
      ${o.description ? `<p class="rl-artist-genre">${esc(o.description.split('|')[0]?.trim() ?? 'Afrobeats')}</p><p class="rl-artist-desc">${esc(o.description.split('|')[1]?.trim() ?? o.description)}</p>` : ''}
      ${o.priceKobo !== null ? `<span style="font-size:.875rem;font-weight:600;color:var(--ww-primary)">Booking from ${fmtKobo(o.priceKobo)}</span>` : ''}
    </div>`).join('')}</div>`;
  return `${CSS}
<section class="rl-roster-hero">
  <h1>Artists &amp; Catalogue</h1>
  <p class="rl-roster-sub">${esc(ctx.displayName)} — Nigeria's next generation of musical talent</p>
</section>
<section>${grid}</section>
<div class="rl-cta-strip">
  <h3>Want to work with our artists?</h3>
  <p>For bookings, sync licensing, or signing enquiries — contact our A&amp;R team directly.</p>
  <div class="rl-btn-row">
    ${waHref ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer" class="rl-wa-btn">${waSvg()} Contact A&amp;R</a>` : ''}
    <a class="rl-sec-btn" href="/contact">Send a Message</a>
  </div>
</div>`;
}

function renderContact(ctx: WebsiteRenderContext): string {
  const phone = (ctx.data.phone as string | null) ?? null;
  const email = (ctx.data.email as string | null) ?? null;
  const placeName = (ctx.data.placeName as string | null) ?? null;
  const waHref = whatsappLink(phone, `Hello! I would like to send a demo or discuss business with ${ctx.displayName}.`);
  return `${CSS}
<section class="rl-contact-hero">
  <h1>Contact A&amp;R &amp; Business</h1>
  <p>Send a demo, enquire about bookings, or discuss label services at ${esc(ctx.displayName)}.</p>
</section>
${waHref ? `<div class="rl-wa-block">
  <p>The fastest way to reach our A&amp;R team is via WhatsApp. Send your demo link or enquiry.</p>
  <a href="${waHref}" target="_blank" rel="noopener noreferrer" class="rl-wa-btn" style="display:inline-flex;justify-content:center">${waSvg()} Contact A&amp;R via WhatsApp</a>
</div>` : ''}
<div class="rl-contact-layout">
  <div class="rl-contact-info">
    <h2>Label Contacts</h2>
    ${placeName ? `<p><strong>Studio Address:</strong> ${esc(placeName)}</p>` : ''}
    ${phone ? `<p><strong>A&amp;R Line:</strong> <a href="tel:${esc(phone)}">${esc(phone)}</a></p>` : ''}
    ${email ? `<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>` : ''}
    ${!phone && !email && !placeName ? '<p>Contact details coming soon.</p>' : ''}
    <p style="margin-top:1rem;font-size:.875rem;color:var(--ww-text-muted)">Payment: Bank Transfer · Paystack · Invoice</p>
  </div>
  <div class="rl-form-wrapper">
    <h2>Send a Message</h2>
    <form class="rl-form" method="POST" action="/contact" id="rlContactForm">
      <input type="hidden" name="tenant_id" value="${esc(ctx.tenantId)}" />
      <div class="rl-form-group"><label for="rl-name">Your name / artist name</label><input id="rl-name" name="name" type="text" required autocomplete="name" class="rl-input" placeholder="e.g. Kunle Fashola (KayF)" /></div>
      <div class="rl-form-group"><label for="rl-phone">Phone / WhatsApp</label><input id="rl-phone" name="phone" type="tel" autocomplete="tel" class="rl-input" placeholder="0803 000 0000" /></div>
      <div class="rl-form-group"><label for="rl-email">Email</label><input id="rl-email" name="email" type="email" autocomplete="email" class="rl-input" placeholder="artist@example.com" /></div>
      <div class="rl-form-group"><label for="rl-msg">Your message or demo link</label><textarea id="rl-msg" name="message" required rows="5" class="rl-input rl-textarea" placeholder="e.g. I am an Afrobeats artist from Abuja. Here is my demo: https://soundcloud.com/... I would like to discuss signing with your label."></textarea></div>
      <div class="rl-ndpr"><p style="margin:0 0 .5rem;font-size:.8125rem"><strong>Privacy notice (NDPR):</strong> Your details are used only to respond to your enquiry. <a href="/privacy">Privacy Policy</a>.</p><div class="rl-ndpr-check"><input type="checkbox" id="rl-consent" name="ndpr_consent" value="yes" required /><label for="rl-consent">I consent to ${esc(ctx.displayName)} contacting me with the details above.</label></div></div>
      <button type="submit" class="rl-submit">Send Message</button>
    </form>
    <div id="rlContactSuccess" class="rl-success" style="display:none" role="status" aria-live="polite"><h3>Message received!</h3><p>Our A&amp;R team will review your submission and respond within 5 business days. Thank you!</p></div>
  </div>
</div>
<script>(function(){var f=document.getElementById('rlContactForm');if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);fetch('/contact',{method:'POST',body:d}).then(function(r){return r.ok?r.json():Promise.reject(r.status)}).then(function(){f.style.display='none';var s=document.getElementById('rlContactSuccess');if(s)s.style.display='block'}).catch(function(){f.submit()})})})();</script>`;
}

export const recordingLabelRecordLabelSiteTemplate: WebsiteTemplateContract = {
  slug: 'recording-label-record-label-site',
  version: '1.0.0',
  pages: ['home','about','services','contact'],
  renderPage(ctx: WebsiteRenderContext): string {
    try {
      switch(ctx.pageType) {
        case 'home': return renderHome(ctx);
        case 'about': return renderAbout(ctx);
        case 'services': return renderServices(ctx);
        case 'contact': return renderContact(ctx);
        default: return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Page not found.</p>`;
      }
    } catch { return `<p style="text-align:center;padding:4rem 1rem;color:var(--ww-text-muted)">Unable to load page.</p>`; }
  },
};
