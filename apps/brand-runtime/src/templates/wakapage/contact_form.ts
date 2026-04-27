/**
 * WakaPage — contact_form block renderer.
 * (Phase 2 — ADR-0041)
 *
 * Offline-capable lead capture form. Submits to POST /wakapage/leads
 * (brand-runtime endpoint that writes directly to wakapage_leads table).
 *
 * NDPR compliance: wakapage_leads PII fields (name, phone, email, message)
 * are covered by the DSAR-delete provisions documented in migration 0421.
 *
 * Nigeria First:
 *   - Phone-first (Nigerian mobile numbers)
 *   - Offline-capable via PWA Background Sync (reuses existing SW queue)
 *   - 44px touch targets on all inputs and submit button
 */

import type { ContactFormBlockConfig } from '@webwaka/wakapage-blocks';
import type { RenderContext } from '../../lib/wakapage-types.js';

export function renderContactFormBlock(config: Partial<ContactFormBlockConfig>, ctx: RenderContext): string {
  const heading = config.heading ?? 'Get in Touch';
  const fields = config.fields ?? ['name', 'phone', 'email', 'message'];
  const submitLabel = config.submitLabel ?? 'Send Message';
  const successMessage = config.successMessage ?? 'Message sent! We\'ll get back to you shortly.';
  const pageId = ctx.page.id;

  const fieldInputs = fields.map((field) => {
    switch (field) {
      case 'name':
        return `
        <div class="wkp-field">
          <label for="wkp-cf-name-${pageId}" class="wkp-label">Name <span aria-hidden="true">*</span></label>
          <input id="wkp-cf-name-${pageId}" name="name" type="text" required
                 autocomplete="name" class="wkp-input"
                 placeholder="Adaeze Okafor" aria-required="true" />
        </div>`;
      case 'phone':
        return `
        <div class="wkp-field">
          <label for="wkp-cf-phone-${pageId}" class="wkp-label">Phone <span aria-hidden="true">*</span></label>
          <input id="wkp-cf-phone-${pageId}" name="phone" type="tel" required
                 autocomplete="tel" class="wkp-input"
                 placeholder="+234 800 000 0000" aria-required="true" />
        </div>`;
      case 'email':
        return `
        <div class="wkp-field">
          <label for="wkp-cf-email-${pageId}" class="wkp-label">Email <span class="wkp-optional">(optional)</span></label>
          <input id="wkp-cf-email-${pageId}" name="email" type="email"
                 autocomplete="email" class="wkp-input" placeholder="you@example.com" />
        </div>`;
      case 'message':
        return `
        <div class="wkp-field">
          <label for="wkp-cf-message-${pageId}" class="wkp-label">Message <span aria-hidden="true">*</span></label>
          <textarea id="wkp-cf-message-${pageId}" name="message" required rows="4"
                    class="wkp-input wkp-textarea" placeholder="How can I help you?"
                    aria-required="true"></textarea>
        </div>`;
      default:
        return '';
    }
  }).join('\n');

  const formId = `wkp-cf-${pageId}`;
  const successId = `wkp-cf-success-${pageId}`;

  return `
<section class="wkp-contact-form-section wkp-section" aria-label="Contact form">
  <h2 class="wkp-block-heading">${esc(heading)}</h2>
  <form id="${formId}" class="wkp-cf" method="POST" action="/wakapage/leads" novalidate>
    <input type="hidden" name="page_id" value="${esc(pageId)}" />
    ${fieldInputs}
    <button type="submit" class="wkp-btn wkp-cf-submit">${esc(submitLabel)}</button>
  </form>
  <div id="${successId}" class="wkp-cf-success" role="status" aria-live="polite" style="display:none">
    <p>${esc(successMessage)}</p>
  </div>
</section>
<style>
.wkp-contact-form-section{border-top:1px solid var(--ww-border,#e5e7eb)}
.wkp-block-heading{font-size:1.125rem;font-weight:700;margin-bottom:1rem;color:var(--ww-text,#111827)}
.wkp-cf{display:flex;flex-direction:column;gap:1rem}
.wkp-field{display:flex;flex-direction:column;gap:.375rem}
.wkp-label{font-size:.875rem;font-weight:600;color:var(--ww-text,#111827)}
.wkp-optional{color:var(--ww-text-muted,#6b7280);font-weight:400;font-size:.8125rem}
.wkp-input{
  display:block;width:100%;padding:.625rem .875rem;
  border:1px solid var(--ww-border,#d1d5db);
  border-radius:var(--ww-radius,6px);
  font-size:1rem;font-family:inherit;min-height:44px;
  background:var(--ww-bg,#fff);color:var(--ww-text,#111827);
  outline:none;
}
.wkp-input:focus{
  border-color:var(--ww-primary);
  box-shadow:0 0 0 2px color-mix(in srgb,var(--ww-primary) 20%,transparent);
}
.wkp-textarea{min-height:100px;resize:vertical}
.wkp-cf-submit{
  background:var(--ww-primary);color:#fff;border:none;
  padding:.875rem;min-height:44px;
  border-radius:var(--ww-radius,6px);
  font-size:1rem;font-weight:700;cursor:pointer;
  transition:filter .15s;
}
.wkp-cf-submit:hover{filter:brightness(1.08)}
.wkp-cf-success{
  padding:1rem;background:var(--ww-bg-surface,#f0fdf4);
  border:1px solid var(--ww-primary);border-radius:var(--ww-radius,6px);
  color:var(--ww-primary);font-weight:600;text-align:center;
}
</style>
<script>
(function(){
  var form=document.getElementById('${formId}');
  var success=document.getElementById('${successId}');
  if(!form||!success)return;
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var fd=new FormData(form);
    var data={};
    fd.forEach(function(v,k){data[k]=v;});
    var btn=form.querySelector('button[type=submit]');

    if('serviceWorker' in navigator&&'SyncManager' in window){
      var openReq=indexedDB.open('WebWakaOfflineDB',2);
      openReq.onsuccess=function(){
        var db=openReq.result;
        try{
          var tx=db.transaction('syncQueue','readwrite');
          tx.objectStore('syncQueue').add({
            id:'lead_'+(crypto.randomUUID?crypto.randomUUID().replace(/-/g,''):Date.now().toString(36)),
            operationType:'create',
            entityType:'wakapage_lead',
            payload:JSON.stringify(data),
            status:'pending',
            createdAt:Date.now(),
            clientId:'lead_'+Date.now()
          });
          navigator.serviceWorker.ready.then(function(reg){if(reg.sync)reg.sync.register('webwaka-sync');});
          showSuccess();
        }catch(ex){postDirect(data,btn);}
      };
      openReq.onerror=function(){postDirect(data,btn);};
    }else{postDirect(data,btn);}
  });

  function showSuccess(){
    form.style.display='none';
    success.style.display='block';
  }

  function postDirect(data,btn){
    if(btn){btn.textContent='Sending…';btn.disabled=true;}
    fetch('/wakapage/leads',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    }).then(function(r){
      if(!r.ok)throw new Error('failed');
      showSuccess();
    }).catch(function(){
      if(btn){btn.textContent='${esc(submitLabel)}';btn.disabled=false;}
      alert('Could not send your message. Please try again.');
    });
  }
})();
</script>`;
}

function esc(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
