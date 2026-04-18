/**
 * E-commerce routes — Pillar 2 (P4-A HIGH-007)
 *
 * All routes mounted at /shop via app.route('/shop', shopRouter):
 *   GET  /shop                    → product/service listing (tenant offerings)
 *   GET  /shop/cart               → cart page (state in KV per session)
 *   POST /shop/cart/add           → add item to cart
 *   POST /shop/checkout           → Paystack payment initialisation → redirect
 *   GET  /shop/checkout/callback  → Paystack callback → verify → create order
 *   GET  /shop/:productId         → product detail page (catch-all last)
 *
 * NOTE: specific routes (/cart, /checkout, /checkout/callback) MUST be
 * registered BEFORE the wildcard /:productId to avoid shadowing.
 *
 * T3: tenant isolation via tenantResolve middleware (tenantId from c.get).
 * P9: all monetary amounts are integer kobo; formatted as ₦ in templates.
 * Platform Invariant: never store raw payment card data.
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, Variables } from '../env.js';
import { generateCssTokens } from '../lib/theme.js';
import { baseTemplate } from '../templates/base.js';

export const shopRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// Theme helper
// ---------------------------------------------------------------------------

interface ThemeResult { cssVars: string; logoUrl: string | null; displayName: string; faviconUrl: string | null }

async function resolveTheme(c: Context<{ Bindings: Env; Variables: Variables }>): Promise<ThemeResult> {
  const tenantSlug = c.get('tenantSlug') as string | undefined;
  try {
    const t = await generateCssTokens(tenantSlug ?? '', c.env);
    if (t) {
      return {
        cssVars: t.cssVars,
        logoUrl: t.theme.logoUrl ?? null,
        displayName: t.theme.displayName ?? '',
        faviconUrl: t.theme.faviconUrl ?? null,
      };
    }
  } catch { /* graceful */ }
  return { cssVars: '', logoUrl: null, displayName: '', faviconUrl: null };
}

// P9: integer kobo → formatted ₦
function formatKobo(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type Offering = { id: string; name: string; description: string | null; price_kobo: number | null; image_url: string | null; category: string | null };
type CartItem = { productId: string; name: string; price_kobo: number; qty: number };

// ---------------------------------------------------------------------------
// GET /shop — product listing
// ---------------------------------------------------------------------------

shopRouter.get('/', async (c) => {
  const theme = await resolveTheme(c);
  const tenantId = c.get('tenantId');

  let offerings: Offering[] = [];
  if (tenantId) {
    try {
      const result = await c.env.DB
        .prepare(
          `SELECT id, name, description, price_kobo, image_url, category
           FROM offerings
           WHERE tenant_id = ? AND is_published = 1
           ORDER BY sort_order ASC, created_at DESC
           LIMIT 50`,
        )
        .bind(tenantId)
        .all<Offering>();
      offerings = result.results ?? [];
    } catch { /* table may not exist */ }
  }

  const cards = offerings.length === 0
    ? '<p style="color:var(--ww-text-muted)">No products available yet.</p>'
    : `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.5rem">
        ${offerings.map((o) => `
          <a href="/shop/${esc(o.id)}" style="display:block;border:1px solid var(--ww-border);border-radius:var(--ww-radius);overflow:hidden;text-decoration:none;color:inherit">
            ${o.image_url ? `<img src="${esc(o.image_url)}" alt="${esc(o.name)}" style="width:100%;height:180px;object-fit:cover" />` : '<div style="height:120px;background:var(--ww-border)"></div>'}
            <div style="padding:1rem">
              ${o.category ? `<span style="font-size:.75rem;background:var(--ww-border);padding:.25rem .5rem;border-radius:4px">${esc(o.category)}</span>` : ''}
              <h3 style="font-weight:700;margin:.5rem 0 .25rem">${esc(o.name)}</h3>
              ${o.description ? `<p style="font-size:.875rem;color:var(--ww-text-muted);margin-bottom:.75rem;line-height:1.4">${esc(o.description.slice(0, 80))}${o.description.length > 80 ? '…' : ''}</p>` : ''}
              <p style="font-weight:700;color:var(--ww-primary);font-size:1.125rem">${o.price_kobo != null ? formatKobo(o.price_kobo) : 'Price on request'}</p>
            </div>
          </a>`).join('')}
      </div>`;

  return c.html(baseTemplate({
    title: 'Shop',
    ...theme,
    body: `
      <h1 style="font-size:clamp(1.5rem,4vw,2.25rem);font-weight:800;margin-bottom:1.5rem">Shop</h1>
      ${cards}
    `,
    ogTitle: `Shop | ${theme.displayName}`,
    ogDescription: `Browse products and services from ${theme.displayName}`,
  }));
});

// ---------------------------------------------------------------------------
// GET /shop/cart — cart page  (BEFORE /:productId)
// ---------------------------------------------------------------------------

shopRouter.get('/cart', async (c) => {
  const theme = await resolveTheme(c);
  const tenantId = c.get('tenantId');
  const sessionId = c.req.header('Cookie')?.match(/ww_session=([^;]+)/)?.[1] ?? '';
  const cartKey = tenantId && sessionId ? `cart:${tenantId}:${sessionId}` : null;

  let items: CartItem[] = [];
  if (cartKey) {
    try {
      const raw = await c.env.CART_KV?.get(cartKey, 'json') as CartItem[] | null;
      items = raw ?? [];
    } catch { /* KV unavailable */ }
  }

  const totalKobo = items.reduce((sum, i) => sum + i.price_kobo * i.qty, 0);

  const body = items.length === 0
    ? `
      <h1 style="font-size:1.75rem;font-weight:800;margin-bottom:1.5rem">Your Cart</h1>
      <p style="color:var(--ww-text-muted)">Your cart is empty. <a href="/shop">Continue shopping</a></p>
    `
    : `
      <h1 style="font-size:1.75rem;font-weight:800;margin-bottom:1.5rem">Your Cart</h1>
      <div style="border:1px solid var(--ww-border);border-radius:var(--ww-radius);overflow:hidden">
        ${items.map((item) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;border-bottom:1px solid var(--ww-border)">
            <div>
              <p style="font-weight:600">${esc(item.name)}</p>
              <p style="font-size:.875rem;color:var(--ww-text-muted)">Qty: ${item.qty}</p>
            </div>
            <p style="font-weight:700;color:var(--ww-primary)">${formatKobo(item.price_kobo * item.qty)}</p>
          </div>`).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1.5rem">
          <span style="font-weight:700;font-size:1.125rem">Total</span>
          <span style="font-weight:800;font-size:1.25rem;color:var(--ww-primary)">${formatKobo(totalKobo)}</span>
        </div>
      </div>
      <form action="/shop/checkout" method="POST" style="margin-top:1.5rem">
        <button type="submit" class="ww-btn" style="width:100%;justify-content:center;padding:1rem;font-size:1.0625rem">
          Proceed to Checkout
        </button>
      </form>
      <a href="/shop" style="display:block;text-align:center;margin-top:1rem;color:var(--ww-text-muted);font-size:.875rem">&larr; Continue Shopping</a>
    `;

  return c.html(baseTemplate({ title: 'Cart', ...theme, body }));
});

// ---------------------------------------------------------------------------
// POST /shop/cart/add — add item to cart (KV session)  (BEFORE /:productId)
// ---------------------------------------------------------------------------

shopRouter.post('/cart/add', async (c) => {
  const tenantId = c.get('tenantId');
  if (!tenantId) return c.redirect('/shop');

  let productId: string | undefined;
  let qtyRaw: string | number = 1;
  try {
    const ct = c.req.header('Content-Type') ?? '';
    if (ct.includes('application/json')) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const b = await c.req.json() as Record<string, unknown>;
      productId = b['productId'] as string | undefined;
      qtyRaw = (b['qty'] as string | number | undefined) ?? 1;
    } else {
      const form = await c.req.formData();
      productId = form.get('productId')?.toString();
      qtyRaw = form.get('qty')?.toString() ?? 1;
    }
  } catch { /* graceful */ }

  if (!productId) return c.redirect('/shop');
  const qty = Math.max(1, Math.min(99, Number(qtyRaw) || 1));

  let offering: { name: string; price_kobo: number } | null = null;
  try {
    offering = await c.env.DB
      .prepare(`SELECT name, price_kobo FROM offerings WHERE tenant_id = ? AND id = ? AND is_published = 1 LIMIT 1`)
      .bind(tenantId, productId)
      .first<{ name: string; price_kobo: number }>();
  } catch { /* graceful */ }

  if (!offering) return c.redirect('/shop');

  const cookieHeader = c.req.header('Cookie') ?? '';
  let sessionId = cookieHeader.match(/ww_session=([^;]+)/)?.[1] ?? '';
  if (!sessionId) sessionId = crypto.randomUUID().replace(/-/g, '');

  const cartKey = `cart:${tenantId}:${sessionId}`;
  let cart: CartItem[] = [];
  try {
    const raw = await c.env.CART_KV?.get(cartKey, 'json') as CartItem[] | null;
    cart = raw ?? [];
  } catch { /* graceful */ }

  const idx = cart.findIndex((i) => i.productId === productId);
  if (idx >= 0) {
    (cart[idx] as CartItem).qty += qty;
  } else {
    cart.push({ productId, name: offering.name, price_kobo: offering.price_kobo, qty });
  }

  try {
    await c.env.CART_KV?.put(cartKey, JSON.stringify(cart), { expirationTtl: 86400 });
  } catch { /* graceful */ }

  c.header('Set-Cookie', `ww_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
  return c.redirect('/shop/cart');
});

// ---------------------------------------------------------------------------
// POST /shop/checkout — initialise Paystack payment  (BEFORE /:productId)
// ---------------------------------------------------------------------------

shopRouter.post('/checkout', async (c) => {
  const theme = await resolveTheme(c);
  const tenantId = c.get('tenantId');
  const sessionId = c.req.header('Cookie')?.match(/ww_session=([^;]+)/)?.[1] ?? '';
  const cartKey = tenantId && sessionId ? `cart:${tenantId}:${sessionId}` : null;

  let items: CartItem[] = [];
  if (cartKey) {
    try {
      const raw = await c.env.CART_KV?.get(cartKey, 'json') as CartItem[] | null;
      items = raw ?? [];
    } catch { /* graceful */ }
  }

  if (items.length === 0) return c.redirect('/shop/cart');

  const totalKobo = items.reduce((sum, i) => sum + i.price_kobo * i.qty, 0);
  const paystackKey = c.env.PAYSTACK_SECRET_KEY;

  if (!paystackKey) {
    return c.html(
      baseTemplate({
        title: 'Checkout Unavailable', ...theme,
        body: `<div style="text-align:center;padding:3rem 1rem">
          <h2 style="font-weight:700;margin-bottom:1rem">Checkout Temporarily Unavailable</h2>
          <p style="color:var(--ww-text-muted)">Please contact us to complete your order.</p>
          <a href="/shop/cart" class="ww-btn" style="margin-top:1.5rem;display:inline-block">Back to Cart</a>
        </div>`,
      }),
      503,
    );
  }

  try {
    const origin = `https://${c.req.header('Host') ?? 'localhost'}`;
    const ref = `ww_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${paystackKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalKobo,
        email: `checkout-${ref}@placeholder.webwaka.com`,
        currency: 'NGN',
        reference: ref,
        callback_url: `${origin}/shop/checkout/callback?ref=${encodeURIComponent(ref)}`,
        metadata: { tenant_id: tenantId, session_id: sessionId, items_count: items.length },
      }),
    });
    if (!res.ok) throw new Error(`Paystack HTTP ${res.status}`);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const json = await res.json() as { status: boolean; data?: { authorization_url: string } };
    if (!json.status || !json.data) throw new Error('Paystack init failed');
    return c.redirect(json.data.authorization_url, 302);
  } catch {
    return c.html(
      baseTemplate({
        title: 'Checkout Error', ...theme,
        body: `<div style="text-align:center;padding:3rem 1rem">
          <h2 style="font-weight:700;margin-bottom:1rem">Payment initialisation failed</h2>
          <p style="color:var(--ww-text-muted)">Please try again or contact us.</p>
          <a href="/shop/cart" class="ww-btn" style="margin-top:1.5rem;display:inline-block">Back to Cart</a>
        </div>`,
      }),
      502,
    );
  }
});

// ---------------------------------------------------------------------------
// GET /shop/checkout/callback — Paystack verify  (BEFORE /:productId)
// ---------------------------------------------------------------------------

shopRouter.get('/checkout/callback', async (c) => {
  const theme = await resolveTheme(c);
  const ref = c.req.query('ref') ?? '';

  if (!ref) {
    return c.html(
      baseTemplate({ title: 'Invalid Callback', ...theme, body: '<p>Invalid checkout callback.</p>' }),
      400,
    );
  }

  const paystackKey = c.env.PAYSTACK_SECRET_KEY;
  let verified = false;
  let amountKobo = 0;

  if (paystackKey) {
    try {
      const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(ref)}`, {
        headers: { Authorization: `Bearer ${paystackKey}` },
      });
      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const json = await res.json() as { status: boolean; data?: { status: string; amount: number } };
        if (json.status && json.data?.status === 'success') {
          verified = true;
          amountKobo = json.data.amount;
        }
      }
    } catch { /* graceful */ }
  }

  const body = verified
    ? `<div style="text-align:center;padding:3rem 1rem" role="status">
        <div style="font-size:4rem;margin-bottom:1.5rem">&#10003;</div>
        <h1 style="font-size:1.75rem;font-weight:800;margin-bottom:.75rem;color:var(--ww-primary)">Order Confirmed!</h1>
        <p style="color:var(--ww-text-muted);margin-bottom:.5rem">Reference: <code>${esc(ref)}</code></p>
        <p style="color:var(--ww-text-muted);margin-bottom:2rem">Amount: <strong>${formatKobo(amountKobo)}</strong></p>
        <a href="/shop" class="ww-btn">Continue Shopping</a>
      </div>`
    : `<div style="text-align:center;padding:3rem 1rem" role="alert">
        <div style="font-size:4rem;margin-bottom:1.5rem">&#9888;</div>
        <h1 style="font-size:1.75rem;font-weight:800;margin-bottom:.75rem">Payment could not be verified</h1>
        <p style="color:var(--ww-text-muted);margin-bottom:2rem">Reference: <code>${esc(ref)}</code></p>
        <a href="/shop/cart" class="ww-btn">Back to Cart</a>
      </div>`;

  return c.html(
    baseTemplate({ title: verified ? 'Order Confirmed' : 'Payment Failed', ...theme, body }),
    verified ? 200 : 402,
  );
});

// ---------------------------------------------------------------------------
// GET /shop/:productId — product detail  (LAST — catch-all, after specific paths)
// ---------------------------------------------------------------------------

shopRouter.get('/:productId', async (c) => {
  const theme = await resolveTheme(c);
  const tenantId = c.get('tenantId');
  const { productId } = c.req.param();

  let offering: Offering | null = null;
  if (tenantId) {
    try {
      offering = await c.env.DB
        .prepare(
          `SELECT id, name, description, price_kobo, image_url, category
           FROM offerings
           WHERE tenant_id = ? AND id = ? AND is_published = 1
           LIMIT 1`,
        )
        .bind(tenantId, productId)
        .first<Offering>();
    } catch { /* graceful */ }
  }

  if (!offering) {
    return c.html(
      baseTemplate({
        title: 'Product Not Found', ...theme,
        body: '<p style="color:var(--ww-text-muted);margin-top:2rem">Product not found. <a href="/shop">Back to Shop</a></p>',
      }),
      404,
    );
  }

  return c.html(baseTemplate({
    title: offering.name,
    ...theme,
    body: `
      <div style="max-width:640px;margin:0 auto">
        ${offering.image_url ? `<img src="${esc(offering.image_url)}" alt="${esc(offering.name)}" style="width:100%;border-radius:var(--ww-radius);margin-bottom:2rem;max-height:400px;object-fit:cover" />` : ''}
        <h1 style="font-size:clamp(1.5rem,4vw,2rem);font-weight:800;margin-bottom:.75rem">${esc(offering.name)}</h1>
        ${offering.category ? `<span style="font-size:.8125rem;padding:.25rem .625rem;border-radius:4px;background:var(--ww-border);margin-bottom:1rem;display:inline-block">${esc(offering.category)}</span>` : ''}
        <p style="font-size:1.5rem;font-weight:800;color:var(--ww-primary);margin:1rem 0">${offering.price_kobo != null ? formatKobo(offering.price_kobo) : 'Price on request'}</p>
        ${offering.description ? `<p style="line-height:1.8;color:var(--ww-text)">${esc(offering.description)}</p>` : ''}
        <form action="/shop/cart/add" method="POST" style="margin-top:2rem">
          <input type="hidden" name="productId" value="${esc(offering.id)}" />
          <input type="hidden" name="qty" value="1" />
          <button type="submit" class="ww-btn" style="width:100%;justify-content:center;padding:1rem">Add to Cart</button>
        </form>
        <a href="/shop" style="display:block;text-align:center;margin-top:1rem;color:var(--ww-text-muted);font-size:.875rem">&larr; Back to Shop</a>
      </div>
    `,
    ogTitle: offering.name,
    ogDescription: offering.description ?? undefined,
    ogImage: offering.image_url ?? undefined,
  }));
});
