/**
 * WakaPage — countdown block renderer.
 * (Phase 2 — ADR-0041)
 *
 * JavaScript-powered countdown to a target date.
 * Gracefully degrades to the target date text when JS is unavailable.
 * Timezone defaults to Africa/Lagos (Nigeria First).
 */

import type { CountdownBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderCountdownBlock(config: Partial<CountdownBlockConfig>, _ctx: RenderContext): string {
  const heading = config.heading ?? 'Countdown';
  const targetDate = config.targetDate;
  if (!targetDate) return '';

  const expiredMessage = config.expiredMessage ?? 'This event has passed.';
  const blockId = `wkp-cd-${Math.random().toString(36).slice(2, 8)}`;
  // jsStr: JSON.stringify provides correct JS string escaping; unicode escapes
  // for < > & prevent </script> injection without breaking the string value.
  const expiredJs = JSON.stringify(expiredMessage)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  let targetMs: number;
  try {
    targetMs = new Date(targetDate).getTime();
    if (!isFinite(targetMs)) return '';
  } catch {
    return '';
  }

  return `
<section class="wkp-countdown wkp-section" aria-label="${esc(heading)}">
  <h2 class="wkp-block-heading">${esc(heading)}</h2>
  <div id="${blockId}" class="wkp-cd-display" aria-live="polite" aria-atomic="true">
    <noscript><p class="wkp-cd-target">${esc(new Date(targetMs).toLocaleString('en-NG', { timeZone: 'Africa/Lagos' }))}</p></noscript>
    <div class="wkp-cd-units">
      <div class="wkp-cd-unit"><span class="wkp-cd-val" id="${blockId}-d">--</span><span class="wkp-cd-lbl">Days</span></div>
      <div class="wkp-cd-sep" aria-hidden="true">:</div>
      <div class="wkp-cd-unit"><span class="wkp-cd-val" id="${blockId}-h">--</span><span class="wkp-cd-lbl">Hours</span></div>
      <div class="wkp-cd-sep" aria-hidden="true">:</div>
      <div class="wkp-cd-unit"><span class="wkp-cd-val" id="${blockId}-m">--</span><span class="wkp-cd-lbl">Mins</span></div>
      <div class="wkp-cd-sep" aria-hidden="true">:</div>
      <div class="wkp-cd-unit"><span class="wkp-cd-val" id="${blockId}-s">--</span><span class="wkp-cd-lbl">Secs</span></div>
    </div>
  </div>
</section>
<style>
.wkp-countdown{border-top:1px solid var(--ww-border,#e5e7eb);text-align:center}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-cd-units{display:flex;align-items:center;justify-content:center;gap:.5rem;flex-wrap:wrap}
.wkp-cd-unit{display:flex;flex-direction:column;align-items:center;min-width:56px}
.wkp-cd-val{
  font-size:2rem;font-weight:800;line-height:1;
  color:var(--ww-primary);font-variant-numeric:tabular-nums;
}
.wkp-cd-lbl{font-size:.6875rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ww-text-muted,#6b7280);margin-top:.25rem}
.wkp-cd-sep{font-size:1.5rem;font-weight:700;color:var(--ww-primary);padding-bottom:1.25rem}
.wkp-cd-target{color:var(--ww-text-muted,#6b7280);font-size:.875rem}
</style>
<script>
(function(){
  var target=${targetMs};
  var expired=${expiredJs};
  var d=document.getElementById('${blockId}-d');
  var h=document.getElementById('${blockId}-h');
  var m=document.getElementById('${blockId}-m');
  var s=document.getElementById('${blockId}-s');
  if(!d||!h||!m||!s)return;
  function pad(n){return n<10?'0'+n:String(n);}
  function tick(){
    var now=Date.now();
    var diff=target-now;
    if(diff<=0){
      d.textContent='00';h.textContent='00';m.textContent='00';s.textContent='00';
      var wrap=document.getElementById('${blockId}');
      if(wrap){
        wrap.innerHTML='';
        var p=document.createElement('p');
        p.style.color='var(--ww-text-muted)';
        p.textContent=expired;
        wrap.appendChild(p);
      }
      return;
    }
    var totalSecs=Math.floor(diff/1000);
    s.textContent=pad(totalSecs%60);
    m.textContent=pad(Math.floor(totalSecs/60)%60);
    h.textContent=pad(Math.floor(totalSecs/3600)%24);
    d.textContent=String(Math.floor(totalSecs/86400));
    setTimeout(tick,1000);
  }
  tick();
})();
</script>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
