/**
 * Savings Group / Thrift Community Portal — NF-AJO standalone (VN-AJO-001)
 * Pillar 2 — P2-savings-group-thrift-community · Milestone M9 · HIGH
 * Research brief: docs/templates/research/savings-group-thrift-community-brief.md
 *
 * Nigeria-First:
 *   • Ajo (Yoruba) · Esusu (Yoruba/Igbo) · Adashe (Hausa) · Osusu (Igbo)
 *   • Group types: ajo | esusu | cooperative | thrift
 *   • Contribution cycles: daily | weekly | biweekly | monthly
 *   • All amounts in integer kobo (T4) — ₦5,000 to ₦500,000 contribution range
 *   • Coordinator is the central trust signal — name + WhatsApp CTA is primary
 *   • CAC RC number displayed when cooperative is formally registered
 *   • Member capacity (max vs. current) displayed to drive recruitment
 *   • WhatsApp coordination is standard channel for all Nigerian savings groups
 *   • P13: No memberRefId or member PII in template context
 *
 * CSS namespace: .sg-
 * Platform Invariants: T2 strict, T3 no DB, T4 kobo, P7 CSS vars, P9 NGN, P10 375px
 */

import type { WebsiteRenderContext, WebsiteTemplateContract, WebsitePageType } from '@webwaka/verticals';

const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const fmtKobo=(k:number)=>`\u20A6${(k/100).toLocaleString('en-NG',{minimumFractionDigits:2})}`;
function waLink(phone:string|null,msg?:string){if(!phone)return null;const d=phone.replace(/\D/g,'');const i=d.startsWith('234')?d:d.startsWith('0')?'234'+d.slice(1):'234'+d;return `https://wa.me/${i}?text=${encodeURIComponent(msg??'Hello, I would like to join your savings group. Please share the contribution details and availability.')}`}

const CSS=`<style>
.sg-hero{text-align:center;padding:2.75rem 0 2rem}
.sg-logo{height:80px;width:80px;object-fit:cover;border-radius:10px;margin-bottom:1.25rem;border:2px solid var(--ww-border)}
.sg-hero h1{font-size:clamp(1.875rem,4.5vw,2.75rem);font-weight:900;line-height:1.15;margin-bottom:.625rem;color:var(--ww-text);letter-spacing:-.02em}
.sg-tagline{font-size:1rem;color:var(--ww-text-muted);max-width:40rem;margin:0 auto 1.75rem;line-height:1.6}
.sg-ctas{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}
.sg-trust-strip{display:flex;flex-wrap:wrap;gap:.5rem .875rem;justify-content:center;margin:1.5rem 0 0}
.sg-badge{display:inline-flex;align-items:center;gap:.375rem;padding:.3rem .875rem;border-radius:999px;font-size:.78rem;font-weight:700;background:var(--ww-bg-surface);border:1.5px solid var(--ww-primary);color:var(--ww-primary);white-space:nowrap}
.sg-dot{width:7px;height:7px;border-radius:50%;background:var(--ww-primary);flex-shrink:0}
.sg-avail{margin-top:.875rem;font-size:.875rem;color:var(--ww-text-muted);text-align:center}
.sg-wa-btn{display:inline-flex;align-items:center;gap:.625rem;padding:.875rem 1.75rem;background:#25D366;color:#fff;border-radius:var(--ww-radius);font-size:1rem;font-weight:700;text-decoration:none;min-height:44px;transition:filter .15s}
.sg-wa-btn:hover{filter:brightness(1.08);text-decoration:none}
.sg-sec-btn{display:inline-flex;align-items:center;gap:.5rem;padding:.75rem 1.5rem;background:transparent;border:2px solid var(--ww-primary);color:var(--ww-primary);border-radius:var(--ww-radius);font-size:.9375rem;font-weight:600;text-decoration:none;min-height:44px;transition:background .15s,color .15s}
.sg-sec-btn:hover{background:var(--ww-primary);color:#fff;text-decoration:none}
.sg-section{margin-top:2.75rem}
.sg-section-title{font-size:1.375rem;font-weight:700;margin-bottom:1.25rem;color:var(--ww-primary)}
.sg-stat-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.sg-stat-card{background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.25rem;text-align:center}
.sg-stat-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:.375rem}
.sg-stat-value{font-size:1.375rem;font-weight:900;color:var(--ww-primary);display:block}
.sg-how-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
.sg-how-step{padding:1.375rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);border-left:4px solid var(--ww-primary)}
.sg-step-num{font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ww-primary);margin:0 0 .5rem}
.sg-step-title{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0 0 .375rem}
.sg-step-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;margin:0}
.sg-grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))}
.sg-card{border:1px solid var(--ww-border);border-radius:var(--ww-radius);padding:1.375rem;background:var(--ww-bg-surface);display:flex;flex-direction:column;gap:.375rem;border-left:4px solid var(--ww-primary)}
.sg-card-name{font-size:1rem;font-weight:700;color:var(--ww-text);margin:0}
.sg-card-desc{font-size:.875rem;color:var(--ww-text-muted);line-height:1.55;flex:1;margin:0}
.sg-card-amount{font-size:.9375rem;font-weight:700;color:var(--ww-primary);margin:0}
.sg-see-all{display:inline-block;margin-top:1.25rem;font-size:.9375rem;font-weight:600;color:var(--ww-primary);text-decoration:underline}
.sg-about-strip{margin-top:2.5rem;padding:1.75rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius)}
.sg-about-strip h2{font-size:1.125rem;font-weight:700;margin-bottom:.75rem}
.sg-about-strip p{color:var(--ww-text-muted);line-height:1.75;margin-bottom:1rem;font-size:.9375rem}
.sg-info-strip{margin-top:2.5rem;padding:1.5rem;background:var(--ww-bg-surface);border:1px solid var(--ww-border);border-radius:var(--ww-radius);display:flex;flex-wrap:wrap;gap:1rem 2rem}
.sg-info-item{display:flex;flex-direction:column;gap:.25rem}
.sg-info-label{font-size:.75rem;font-weight:600;color:var(--ww-text-muted);text-transform:uppercase;letter-spacing:.04em}
.sg-info-value{font-size:.9375rem;font-weight:600;color:var(--ww-text)}
.sg-info-value a{color:var(--ww-primary)}
@media(max-width:480px){.sg-stat-grid{grid-template-columns:1fr 1fr}.sg-how-grid{grid-template-columns:1fr}.sg-grid{grid-template-columns:1fr}}
</style>`;

function coinSvg(){return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M9 9h4.5a2.5 2.5 0 0 1 0 5H9"/></svg>`}
function waSvg(){return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.486 2 2 6.486 2 12c0 1.759.47 3.411 1.291 4.845L2 22l5.293-1.268A9.945 9.945 0 0012 22c5.514 0 10-4.486 10-10S17.514 2 12 2z"/></svg>`}

function groupTypeLabel(t:string|null):string{
  const map:Record<string,string>={ajo:'Ajo Group',esusu:'Esusu Group',cooperative:'Cooperative Society',thrift:'Thrift Group'};
  return map[t??'']??'Savings Group';
}
function freqLabel(f:string|null):string{
  const map:Record<string,string>={daily:'Daily',weekly:'Weekly',biweekly:'Bi-weekly',monthly:'Monthly'};
  return map[f??'']??f??'Regular';
}

function renderHome(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const desc=(ctx.data.description as string|null)??null;
  const logo=(ctx.data.logoUrl as string|null)??null;
  const cacRc=(ctx.data.cacRc as string|null)??null;
  const coordName=(ctx.data.coordinatorName as string|null)??null;
  const groupType=(ctx.data.groupType as string|null)??null;
  const freq=(ctx.data.contributionFrequency as string|null)??null;
  const amountKobo=(ctx.data.contributionAmountKobo as number|null)??null;
  const maxMembers=(ctx.data.maxMembers as number|null)??null;
  const currentMembers=(ctx.data.currentMembers as number|null)??null;
  const openSpots=(maxMembers!==null&&currentMembers!==null)?(maxMembers-currentMembers):null;
  const wa=waLink(phone);
  const waJoin=waLink(phone,'Hello, I would like to join your savings group. Please share the contribution amount, cycle schedule, and available positions.');
  const bio=desc&&desc.length>20?desc:null;
  const offerings=(ctx.data.offerings as Array<{name:string;description:string|null;priceKobo:number|null}>|null)??[];
  const featured=offerings.slice(0,4);
  const hasMore=offerings.length>4;
  try{return `${CSS}
<section class="sg-hero">
  ${logo?`<img src="${esc(logo)}" alt="${esc(ctx.displayName)} logo" class="sg-logo" loading="lazy">`:''}
  <h1>${esc(ctx.displayName)}</h1>
  <p class="sg-tagline">${bio?esc(bio):`${esc(groupTypeLabel(groupType))} — Saving Together, Thriving Together. Transparent Contributions &amp; Reliable Payouts.`}</p>
  <div class="sg-ctas">
    ${waJoin?`<a href="${waJoin}" target="_blank" rel="noopener noreferrer" class="sg-wa-btn">${waSvg()} Join via WhatsApp</a>`:''}
    <a href="/services" class="sg-sec-btn">${coinSvg()} How It Works</a>
  </div>
  <div class="sg-trust-strip">
    <span class="sg-badge"><span class="sg-dot"></span>${esc(groupTypeLabel(groupType))}</span>
    ${amountKobo!==null?`<span class="sg-badge"><span class="sg-dot"></span>${esc(freqLabel(freq))} ${fmtKobo(amountKobo)}</span>`:''}
    ${cacRc?`<span class="sg-badge"><span class="sg-dot"></span>CAC Reg. ${esc(cacRc)}</span>`:'<span class="sg-badge"><span class="sg-dot"></span>Trusted Group</span>'}
    ${openSpots!==null&&openSpots>0?`<span class="sg-badge"><span class="sg-dot"></span>${openSpots} Open Position${openSpots>1?'s':''}</span>`:''}
  </div>
  ${place?`<p class="sg-avail">Group based in ${esc(place)}</p>`:''}
</section>
${(amountKobo!==null||maxMembers!==null)?`<div class="sg-section"><div class="sg-stat-grid">${amountKobo!==null?`<div class="sg-stat-card"><span class="sg-stat-label">${esc(freqLabel(freq))} Contribution</span><span class="sg-stat-value">${fmtKobo(amountKobo)}</span></div>`:''} ${maxMembers!==null?`<div class="sg-stat-card"><span class="sg-stat-label">Total Slots</span><span class="sg-stat-value">${maxMembers}</span></div>`:''} ${currentMembers!==null?`<div class="sg-stat-card"><span class="sg-stat-label">Current Members</span><span class="sg-stat-value">${currentMembers}</span></div>`:''} ${openSpots!==null&&openSpots>=0?`<div class="sg-stat-card"><span class="sg-stat-label">Open Positions</span><span class="sg-stat-value" style="${openSpots===0?'color:var(--ww-text-muted)':''}">${openSpots===0?'Full':openSpots}</span></div>`:''}</div></div>`:''}
<section class="sg-section"><h2 class="sg-section-title">How It Works</h2><div class="sg-how-grid"><div class="sg-how-step"><p class="sg-step-num">Step 1</p><h3 class="sg-step-title">Join the Group</h3><p class="sg-step-desc">WhatsApp the coordinator to register. Verify the contribution amount and your payout position in the cycle.</p></div><div class="sg-how-step"><p class="sg-step-num">Step 2</p><h3 class="sg-step-title">Contribute Regularly</h3><p class="sg-step-desc">Make your ${esc(freqLabel(freq).toLowerCase())} contribution on time.${amountKobo!==null?` Amount: ${fmtKobo(amountKobo)}.`:''} Bank transfer, cash, or mobile payment accepted.</p></div><div class="sg-how-step"><p class="sg-step-num">Step 3</p><h3 class="sg-step-title">Collect Your Pot</h3><p class="sg-step-desc">When it's your turn in the rotation, you collect the full pooled contributions of all members. Reliable, on schedule.</p></div></div></section>
${featured.length?`<section class="sg-section"><h2 class="sg-section-title">Contribution Plans</h2><div class="sg-grid">${featured.map(o=>`<div class="sg-card"><h3 class="sg-card-name">${esc(o.name)}</h3>${o.description?`<p class="sg-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="sg-card-amount">Contribution: ${fmtKobo(o.priceKobo)}</p>`:`<p class="sg-card-amount" style="color:var(--ww-text-muted);font-style:italic">Ask coordinator for amount</p>`}</div>`).join('')}</div>${hasMore?`<a href="/services" class="sg-see-all">View all plans →</a>`:''}</section>`:''}
${bio?`<div class="sg-about-strip"><h2>About ${esc(ctx.displayName)}</h2><p>${esc(bio)}</p><a href="/about" style="font-size:.9375rem;font-weight:600;color:var(--ww-primary)">Learn more →</a></div>`:''}
<div class="sg-info-strip">${phone?`<div class="sg-info-item"><span class="sg-info-label">Coordinator</span><span class="sg-info-value">${coordName?esc(coordName)+'<br>':''}<a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="sg-info-item"><span class="sg-info-label">Location</span><span class="sg-info-value">${esc(place)}</span></div>`:''}<div class="sg-info-item"><span class="sg-info-label">Join Group</span><span class="sg-info-value">${waJoin?`<a href="${waJoin}" target="_blank" rel="noopener noreferrer">WhatsApp →</a>`:`<a href="/contact">Contact coordinator →</a>`}</span></div></div>`;
  }catch{return `<p style="text-align:center;padding:4rem">Group information loading…</p>`;}
}

function renderServices(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const freq=(ctx.data.contributionFrequency as string|null)??null;
  const amountKobo=(ctx.data.contributionAmountKobo as number|null)??null;
  const groupType=(ctx.data.groupType as string|null)??null;
  const waJoin=waLink(phone,'Hello, I would like to join your savings group. Please share the contribution schedule and available positions.');
  const offerings=(ctx.data.offerings as Array<{name:string;description:string|null;priceKobo:number|null}>|null)??[];
  return `${CSS}<div style="padding:2rem 0"><h1 style="font-size:1.875rem;font-weight:900;margin-bottom:1rem;color:var(--ww-primary)">How It Works</h1><p style="color:var(--ww-text-muted);margin-bottom:1.75rem;font-size:.9375rem">Our ${esc(groupTypeLabel(groupType).toLowerCase())} follows a simple rotating cycle. Every member contributes ${freq?`${esc(freqLabel(freq).toLowerCase())} `:''} ${amountKobo!==null?fmtKobo(amountKobo):''}, and on your scheduled turn you receive the full pooled pot.</p><div class="sg-how-grid"><div class="sg-how-step"><p class="sg-step-num">Step 1</p><h3 class="sg-step-title">Register &amp; Join</h3><p class="sg-step-desc">WhatsApp the coordinator. Provide your name and preferred payment method. Sign the group agreement.</p></div><div class="sg-how-step"><p class="sg-step-num">Step 2</p><h3 class="sg-step-title">Contribute on Time</h3><p class="sg-step-desc">Make your contribution before each deadline. Late payments delay other members' payouts — punctuality is key.</p></div><div class="sg-how-step"><p class="sg-step-num">Step 3</p><h3 class="sg-step-title">Collect Your Turn</h3><p class="sg-step-desc">When your position comes up in the rotation, you receive all members' contributions at once. Same amount for everyone.</p></div></div>${offerings.length?`<div style="margin-top:2rem"><h2 style="font-size:1.25rem;font-weight:700;margin-bottom:1rem;color:var(--ww-primary)">Available Plans</h2><div class="sg-grid">${offerings.map(o=>`<div class="sg-card"><h3 class="sg-card-name">${esc(o.name)}</h3>${o.description?`<p class="sg-card-desc">${esc(o.description)}</p>`:''} ${o.priceKobo!==null?`<p class="sg-card-amount">Contribution: ${fmtKobo(o.priceKobo)}</p>`:`<p class="sg-card-amount" style="color:var(--ww-text-muted);font-style:italic">Ask coordinator</p>`}${waJoin?`<a href="${waJoin}" target="_blank" rel="noopener noreferrer" class="sg-wa-btn" style="margin-top:.75rem;font-size:.875rem;padding:.625rem 1.125rem">${waSvg()} Join This Plan</a>`:''}</div>`).join('')}</div></div>`:''} ${waJoin?`<a href="${waJoin}" target="_blank" rel="noopener noreferrer" class="sg-wa-btn" style="margin-top:1.5rem">${waSvg()} WhatsApp to Join Now</a>`:''}</div>`;
}

function renderAbout(ctx:WebsiteRenderContext):string{
  const desc=(ctx.data.description as string|null)??null;
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const coordName=(ctx.data.coordinatorName as string|null)??null;
  const cacRc=(ctx.data.cacRc as string|null)??null;
  const groupType=(ctx.data.groupType as string|null)??null;
  const wa=waLink(phone);
  return `${CSS}<div style="padding:2rem 0"><h1 style="font-size:1.875rem;font-weight:900;margin-bottom:1rem;color:var(--ww-primary)">About ${esc(ctx.displayName)}</h1>${desc?`<p style="color:var(--ww-text-muted);line-height:1.8;margin-bottom:1.5rem;font-size:.9375rem">${esc(desc)}</p>`:''}<div class="sg-trust-strip" style="justify-content:flex-start;margin-bottom:1.5rem"><span class="sg-badge"><span class="sg-dot"></span>${esc(groupTypeLabel(groupType))}</span><span class="sg-badge"><span class="sg-dot"></span>Transparent Ledger</span><span class="sg-badge"><span class="sg-dot"></span>Timely Payouts</span>${cacRc?`<span class="sg-badge"><span class="sg-dot"></span>CAC Reg. ${esc(cacRc)}</span>`:''}</div>${coordName?`<p style="font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.5rem"><strong>Coordinator:</strong> ${esc(coordName)}</p>`:''} ${place?`<p style="font-size:.9375rem;color:var(--ww-text-muted);margin-bottom:.5rem"><strong>Location:</strong> ${esc(place)}</p>`:''} ${phone?`<p style="font-size:.9375rem;margin-bottom:1.25rem;color:var(--ww-text-muted)"><strong>Phone:</strong> <a href="tel:${esc(phone)}" style="color:var(--ww-primary)">${esc(phone)}</a></p>`:''} ${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="sg-wa-btn">${waSvg()} WhatsApp Coordinator</a>`:''}</div>`;
}

function renderContact(ctx:WebsiteRenderContext):string{
  const phone=(ctx.data.phone as string|null)??null;
  const place=(ctx.data.placeName as string|null)??null;
  const coordName=(ctx.data.coordinatorName as string|null)??null;
  const wa=waLink(phone,'Hello, I would like to join your savings group. Please share the contribution details and available positions.');
  return `${CSS}<div style="padding:2rem 0"><h1 style="font-size:1.875rem;font-weight:900;margin-bottom:1.5rem;color:var(--ww-primary)">Contact Coordinator</h1><p style="color:var(--ww-text-muted);margin-bottom:1.5rem;font-size:.9375rem">To join the group or ask questions about contribution amounts and payout positions, WhatsApp the coordinator directly.</p><div class="sg-info-strip" style="flex-direction:column">${coordName?`<div class="sg-info-item"><span class="sg-info-label">Coordinator Name</span><span class="sg-info-value">${esc(coordName)}</span></div>`:''} ${phone?`<div class="sg-info-item"><span class="sg-info-label">Phone / WhatsApp</span><span class="sg-info-value"><a href="tel:${esc(phone)}">${esc(phone)}</a></span></div>`:''} ${place?`<div class="sg-info-item"><span class="sg-info-label">Meeting Location</span><span class="sg-info-value">${esc(place)}</span></div>`:''}</div>${wa?`<a href="${wa}" target="_blank" rel="noopener noreferrer" class="sg-wa-btn" style="margin-top:1.5rem">${waSvg()} WhatsApp to Join Now</a>`:''}</div>`;
}

export const savingsGroupThriftCommunityTemplate: WebsiteTemplateContract = {
  slug: 'savings-group-thrift-community',
  version: '1.0.0',
  pages: ['home','about','services','contact'] as WebsitePageType[],
  renderPage(ctx:WebsiteRenderContext):string{
    switch(ctx.pageType){
      case 'about':   return renderAbout(ctx);
      case 'services':return renderServices(ctx);
      case 'contact': return renderContact(ctx);
      default:        return renderHome(ctx);
    }
  }
};
