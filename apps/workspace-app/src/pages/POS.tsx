import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
// BUG-010: IndexedDB-backed offline queue (P6 Offline-First, TDR-0010)
import { db } from '@webwaka/offline-sync';
// BUG-046: CSS Modules — phase 1: structural/layout classes extracted
import s from './POS.module.css';

interface Product {
  id: string;
  name: string;
  price_kobo: number;
  sku: string | null;
  stock_qty: number | null;
  category: string | null;
  active: boolean;
}

interface ProductsResponse {
  products: Product[];
  count: number;
}

interface CartItem extends Product {
  qty: number;
}

type PaymentMethod = 'cash' | 'card' | 'transfer';

// BUG-050: Inline SVG icons replace emoji — emoji render inconsistently across OS/fonts
// and are excluded by screen readers when aria-hidden is not set.
const PAYMENT_ICONS: Record<PaymentMethod, string> = {
  cash: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>`,
  card: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
  transfer: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`,
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Transfer',
};

export default function POS() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;
  // BUG-010: Network status for offline queue branching
  const isOnline = useOnlineStatus();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [checkingOut, setCheckingOut] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [lastOrderVat, setLastOrderVat] = useState(0);

  useEffect(() => {
    if (!workspaceId) {
      setLoadingProducts(false);
      return;
    }
    api.get<ProductsResponse>(`/pos-business/products/${workspaceId}`)
      .then(res => setProducts(res.products.filter(p => p.active)))
      .catch(err => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error('Commerce features not available on your current plan.');
        } else {
          toast.error('Failed to load products.');
        }
      })
      .finally(() => setLoadingProducts(false));
  }, [workspaceId]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  // BUG-024: Clamp quantity between 0 and stock_qty (if known) to prevent
  // ordering more units than are physically available.
  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev
      .map(i => {
        if (i.id !== id) return i;
        const maxQty = i.stock_qty !== null ? i.stock_qty : Infinity;
        const newQty = Math.min(maxQty, Math.max(0, i.qty + delta));
        return { ...i, qty: newQty };
      })
      .filter(i => i.qty > 0)
    );
  }, []);

  // BUG-013 / COMP-005: FIRS VAT 7.5% (Nigeria Value Added Tax Act 2007 as amended 2019)
  const VAT_RATE = 0.075;
  const subtotalKobo = cart.reduce((sum, i) => sum + i.price_kobo * i.qty, 0);
  const vatKobo = Math.round(subtotalKobo * VAT_RATE);
  const totalKobo = subtotalKobo + vatKobo;

  /**
   * BUG-010: Sync any pending offline POS sales from IndexedDB.
   * Called automatically on reconnect via the 'online' event listener below.
   */
  const syncOfflineQueue = async () => {
    const pending = await db.syncQueue
      .where({ entity: 'pos_sale', status: 'pending' })
      .toArray();
    for (const item of pending) {
      try {
        await db.syncQueue.update(item.id!, { status: 'syncing' });
        await api.post('/pos-business/sales', item.payload);
        await db.syncQueue.update(item.id!, { status: 'synced', syncedAt: Date.now() });
      } catch {
        await db.syncQueue.update(item.id!, {
          status: 'failed',
          retryCount: (item.retryCount ?? 0) + 1,
        });
      }
    }
    if (pending.length > 0) {
      toast.success(`${pending.length} offline sale(s) synced.`);
    }
  };

  // BUG-010: Auto-sync queued sales when connection is restored.
  useEffect(() => {
    const handleOnline = () => { void syncOfflineQueue(); };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkout = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    if (!workspaceId) { toast.error('Workspace not found.'); return; }

    setCheckingOut(true);

    // BUG-010 / P6 Offline-First: when device has no connectivity, queue the
    // sale to IndexedDB so it is synced automatically on reconnect.
    if (!isOnline) {
      try {
        await db.syncQueue.add({
          clientId: crypto.randomUUID(),
          type: 'agent_transaction',
          entity: 'pos_sale',
          payload: {
            workspace_id: workspaceId,
            payment_method: paymentMethod,
            vat_kobo: vatKobo,
            items: cart.map(i => ({
              product_id: i.id,
              qty: i.qty,
              price_kobo: i.price_kobo,
            })),
          },
          priority: 'high',
          status: 'pending',
          retryCount: 0,
          nextRetryAt: Date.now(),
          createdAt: Date.now(),
        });
        setCart([]);
        toast.success('No connection — sale queued and will sync when back online.');
      } catch {
        toast.error('Failed to save sale for offline sync. Check storage permissions.');
      } finally {
        setCheckingOut(false);
      }
      return;
    }

    try {
      const res = await api.post<{ sale: { id: string; total_kobo: number } }>('/pos-business/sales', {
        workspace_id: workspaceId,
        payment_method: paymentMethod,
        vat_kobo: vatKobo,
        items: cart.map(i => ({
          product_id: i.id,
          qty: i.qty,
          price_kobo: i.price_kobo,
        })),
      });
      setLastOrderId(res.sale.id.slice(0, 12).toUpperCase());
      setLastOrderTotal(res.sale.total_kobo);
      setLastOrderVat(vatKobo);
      setCart([]);
      setReceiptVisible(true);
      toast.success(`Sale recorded — ${res.sale.id.slice(0, 12).toUpperCase()}`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Checkout failed. Please try again.';
      toast.error(msg);
    } finally {
      setCheckingOut(false);
    }
  };

  if (receiptVisible) {
    const receiptSubtotal = lastOrderTotal - lastOrderVat;
    return (
      <div className={s.page}>
        {/* ENH-018: Print-friendly receipt — @media print hides everything except the receipt */}
        <style>{`
          @media print {
            body > *:not(#pos-receipt-root) { display: none !important; }
            #pos-receipt-root { margin: 0; padding: 0; }
            .pos-receipt-print { box-shadow: none !important; border: none !important; max-width: 100% !important; }
            .pos-receipt-no-print { display: none !important; }
          }
        `}</style>
        <div id="pos-receipt-root" className={s.page}>
          <div className={`${s.receipt} pos-receipt-print`}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#166534', marginBottom: 8 }}>
              Sale recorded!
            </h2>
            <p style={{ fontSize: 15, color: '#374151', marginBottom: 4 }}>
              Order ID: <strong>{lastOrderId}</strong>
            </p>
            {/* COMP-005: VAT breakdown on receipt */}
            <div style={{ width: '100%', borderTop: '1px solid #e5e7eb', paddingTop: 12, marginBottom: 12, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                <span>Subtotal</span>
                <span>{formatNaira(receiptSubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                <span>VAT (7.5%)</span>
                <span>{formatNaira(lastOrderVat)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 700, color: '#0F4C81' }}>
                <span>Total</span>
                <span>{formatNaira(lastOrderTotal)}</span>
              </div>
            </div>
            <div className="pos-receipt-no-print" style={{ display: 'flex', gap: 8 }}>
              <Button onClick={() => setReceiptVisible(false)} size="md">
                New sale
              </Button>
              <Button
                onClick={() => window.print()}
                size="md"
              >
                🖨️ Print
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <h1 className={s.heading}>Point of Sale</h1>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          {cart.length > 0 && `${cart.reduce((acc, i) => acc + i.qty, 0)} items in cart`}
        </div>
      </header>

      <div className={s.layout}>
        <div className={s.productsPanel}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={s.searchInput}
            aria-label="Search products"
          />

          {loadingProducts ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#6b7280' }}>
              Loading products…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
              {products.length === 0
                ? 'No active products. Add some in Offerings.'
                : 'No products match your search.'}
            </div>
          ) : (
            <div className={s.productsGrid} role="list" aria-label="Products">
              {filtered.map(product => (
                <button
                  key={product.id}
                  role="listitem"
                  onClick={() => addToCart(product)}
                  className={s.productCard}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }} aria-hidden="true">📦</div>
                  <div className={s.productName}>{product.name}</div>
                  {product.category && (
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                      {product.category}
                    </div>
                  )}
                  <div className={s.productPrice}>{formatNaira(product.price_kobo)}</div>
                  {product.sku && (
                    <div style={{ fontSize: 11, color: '#6b7280' }}>per {product.sku}</div>
                  )}
                  {product.stock_qty !== null && (
                    <div style={{ fontSize: 11, color: product.stock_qty < 5 ? '#dc2626' : '#6b7280' }}>
                      Stock: {product.stock_qty}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={s.cartPanel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 className={s.cartHeading}>Cart</h2>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 600, padding: '4px 8px' }}
                aria-label="Clear cart"
              >
                Clear
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className={s.emptyCart}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Tap a product to add it</div>
            </div>
          ) : (
            <div className={s.cartItems} role="list" aria-label="Cart items">
              {cart.map(item => (
                <div key={item.id} role="listitem" className={s.cartItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {formatNaira(item.price_kobo)} × {item.qty} = {formatNaira(item.price_kobo * item.qty)}
                    </div>
                  </div>
                  <div className={s.qtyControls}>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      className={s.qtyBtn}
                      aria-label={`Remove one ${item.name}`}
                    >−</button>
                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      className={s.qtyBtn}
                      aria-label={`Add one more ${item.name}`}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <>
              {/* COMP-005 / ENH-017: VAT breakdown in cart */}
              <div style={{ paddingTop: 12, borderTop: '1px solid #e5e7eb', marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 3 }}>
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotalKobo)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                  <span>VAT (7.5%)</span>
                  <span>{formatNaira(vatKobo)}</span>
                </div>
              </div>
              <div className={s.totalRow}>
                <span style={{ fontSize: 15, color: '#374151' }}>Total (incl. VAT)</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#0F4C81' }}>
                  {formatNaira(totalKobo)}
                </span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Payment method
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      aria-pressed={paymentMethod === method}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12,
                        fontWeight: 600, cursor: 'pointer', border: '1.5px solid', minHeight: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        borderColor: paymentMethod === method ? '#0F4C81' : '#e5e7eb',
                        background: paymentMethod === method ? '#EFF6FF' : '#fff',
                        color: paymentMethod === method ? '#0F4C81' : '#374151',
                      }}
                    >
                      {/* BUG-050: Inline SVG icon — no emoji, accessible, OS-agnostic */}
                      <span
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: PAYMENT_ICONS[method] }}
                        style={{ display: 'inline-flex', alignItems: 'center' }}
                      />
                      {PAYMENT_LABELS[method]}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={checkout}
                loading={checkingOut}
                size="md"
                style={{ width: '100%', justifyContent: 'center' as const }}
              >
                Confirm sale — {formatNaira(totalKobo)}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// BUG-046: All static layout styles migrated to POS.module.css (phase 1 complete).
// Dynamic styles (border-color, background, color based on state) remain as inline style={{}}.

