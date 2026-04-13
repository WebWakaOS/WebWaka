export interface ContactPageData {
  displayName: string;
  phone: string | null;
  email: string | null;
  placeName: string | null;
  tenantId: string;
}

export function contactPageBody(data: ContactPageData): string {
  return `
  <section class="ww-contact-hero">
    <h1 class="ww-h1">Contact ${esc(data.displayName)}</h1>
    <p class="ww-contact-sub">We'd love to hear from you</p>
  </section>

  <div class="ww-contact-layout">
    <div class="ww-contact-form-wrapper">
      <form class="ww-contact-form" method="POST" action="/contact" id="contactForm">
        <input type="hidden" name="tenant_id" value="${esc(data.tenantId)}" />
        <div class="ww-form-group">
          <label for="contact-name">Your name</label>
          <input id="contact-name" name="name" type="text" required autocomplete="name"
                 class="ww-input" placeholder="Adaeze Okafor" />
        </div>
        <div class="ww-form-group">
          <label for="contact-phone">Phone number</label>
          <input id="contact-phone" name="phone" type="tel" required autocomplete="tel"
                 class="ww-input" placeholder="+234 800 000 0000" />
        </div>
        <div class="ww-form-group">
          <label for="contact-email">Email (optional)</label>
          <input id="contact-email" name="email" type="email" autocomplete="email"
                 class="ww-input" placeholder="you@example.com" />
        </div>
        <div class="ww-form-group">
          <label for="contact-message">Message</label>
          <textarea id="contact-message" name="message" required rows="5"
                    class="ww-input" placeholder="How can we help you?"></textarea>
        </div>
        <button type="submit" class="ww-btn ww-btn--primary ww-btn--full">Send Message</button>
      </form>
      <div id="contactSuccess" class="ww-contact-success" style="display:none">
        <h2>Message sent!</h2>
        <p>Thank you for reaching out. We'll get back to you shortly.</p>
      </div>
    </div>

    <div class="ww-contact-info">
      <h2 class="ww-h2">Get in Touch</h2>
      ${data.phone ? `<p><strong>Phone:</strong> <a href="tel:${esc(data.phone)}">${esc(data.phone)}</a></p>` : ''}
      ${data.email ? `<p><strong>Email:</strong> <a href="mailto:${esc(data.email)}">${esc(data.email)}</a></p>` : ''}
      ${data.placeName ? `<p><strong>Location:</strong> ${esc(data.placeName)}</p>` : ''}
    </div>
  </div>

  <script>
    (function(){
      var form = document.getElementById('contactForm');
      if(!form) return;
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var fd = new FormData(form);
        var data = {};
        fd.forEach(function(v,k){ data[k] = v; });

        if('serviceWorker' in navigator && 'SyncManager' in window){
          var openReq = indexedDB.open('WebWakaOfflineDB', 2);
          openReq.onsuccess = function(){
            var db = openReq.result;
            try {
              var tx = db.transaction('syncQueue','readwrite');
              var store = tx.objectStore('syncQueue');
              store.add({
                id: 'contact_' + (crypto.randomUUID ? crypto.randomUUID().replace(/-/g,'') : Date.now() + '_' + Date.now().toString(36)),
                operationType: 'create',
                entityType: 'contact_submission',
                payload: JSON.stringify(data),
                status: 'pending',
                createdAt: Date.now(),
                clientId: 'contact_' + Date.now()
              });
              navigator.serviceWorker.ready.then(function(reg){
                if(reg.sync) reg.sync.register('webwaka-sync');
              });
              showSuccess();
            } catch(ex){ postDirect(data); }
          };
          openReq.onerror = function(){ postDirect(data); };
        } else {
          postDirect(data);
        }
      });

      function showSuccess(){
        var f = document.getElementById('contactForm');
        var s = document.getElementById('contactSuccess');
        if(f) f.style.display = 'none';
        if(s) s.style.display = 'block';
      }

      function postDirect(data){
        var btn = document.querySelector('.ww-btn--primary');
        if(btn){ btn.textContent = 'Sending…'; btn.disabled = true; }
        fetch('/contact', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(data)
        }).then(function(r){
          if(!r.ok) throw new Error('Submit failed');
          showSuccess();
        }).catch(function(){
          if(btn){ btn.textContent = 'Send Message'; btn.disabled = false; }
          alert('Could not send your message. Please try again.');
        });
      }
    })();
  </script>

  <style>
    .ww-contact-hero { text-align: center; padding: 2rem 0 1.5rem; }
    .ww-contact-sub { color: var(--ww-text-muted); margin-top: 0.5rem; }
    .ww-contact-layout { display: grid; gap: 2rem; margin-top: 2rem; grid-template-columns: 1fr; }
    @media (min-width: 768px) { .ww-contact-layout { grid-template-columns: 1fr 280px; } }
    .ww-contact-form { display: flex; flex-direction: column; gap: 1rem; }
    .ww-form-group { display: flex; flex-direction: column; gap: 0.375rem; }
    .ww-form-group label { font-size: 0.875rem; font-weight: 600; }
    .ww-input {
      display: block; width: 100%; padding: 0.625rem 0.875rem;
      border: 1px solid var(--ww-border); border-radius: var(--ww-radius);
      font-size: 1rem; outline: none; min-height: 44px;
    }
    .ww-input:focus { border-color: var(--ww-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ww-primary) 20%, transparent); }
    textarea.ww-input { resize: vertical; min-height: 120px; }
    .ww-btn--primary { background: var(--ww-primary); color: #fff; border: none; padding: 0.75rem 1.5rem; border-radius: var(--ww-radius); font-weight: 600; cursor: pointer; min-height: 44px; }
    .ww-btn--primary:hover { filter: brightness(1.1); }
    .ww-btn--full { width: 100%; justify-content: center; display: flex; align-items: center; }
    .ww-contact-info { background: var(--ww-bg-surface); border: 1px solid var(--ww-border); border-radius: var(--ww-radius); padding: 1.5rem; }
    .ww-contact-info p { margin-top: 0.75rem; color: var(--ww-text-muted); line-height: 1.6; }
    .ww-contact-success { text-align: center; padding: 3rem 1rem; }
    .ww-contact-success h2 { color: var(--ww-primary); margin-bottom: 0.5rem; }
    .ww-contact-success p { color: var(--ww-text-muted); }
  </style>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
