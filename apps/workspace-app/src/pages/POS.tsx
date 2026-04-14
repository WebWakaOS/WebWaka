import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: '💵 Cash',
  card: '💳 Card',
  transfer: '🏦 Transfer',
};

export default function POS() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [checkingOut, setCheckingOut] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const [lastOrderTotal, setLastOrderTotal] = useState(0);

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

  const updateQty = useCallback((id: string, delta: number) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i)
      .filter(i => i.qty > 0)
    );
  }, []);

  const totalKobo = cart.reduce((sum, i) => sum + i.price_kobo * i.qty, 0);

  const checkout = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    if (!workspaceId) { toast.error('Workspace not found.'); return; }

    setCheckingOut(true);
    try {
      const res = await api.post<{ sale: { id: string; total_kobo: number } }>('/pos-business/sales', {
        workspace_id: workspaceId,
        payment_method: paymentMethod,
        items: cart.map(i => ({
          product_id: i.id,
          qty: i.qty,
          price_kobo: i.price_kobo,
        })),
      });
      setLastOrderId(res.sale.id.slice(0, 12).toUpperCase());
      setLastOrderTotal(res.sale.total_kobo);
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
    return (
      <div style={styles.page}>
        <div style={styles.receipt}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#166534', marginBottom: 8 }}>
            Sale recorded!
          </h2>
          <p style={{ fontSize: 15, color: '#374151', marginBottom: 4 }}>
            Order ID: <strong>{lastOrderId}</strong>
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#0F4C81', marginBottom: 24 }}>
            {formatNaira(lastOrderTotal)}
          </p>
          <Button onClick={() => setReceiptVisible(false)} size="md">
            New sale
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Point of Sale</h1>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          {cart.length > 0 && `${cart.reduce((s, i) => s + i.qty, 0)} items in cart`}
        </div>
      </header>

      <div style={styles.layout}>
        <div style={styles.productsPanel}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
            aria-label="Search products"
          />

          {loadingProducts ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af' }}>
              Loading products…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              {products.length === 0
                ? 'No active products. Add some in Offerings.'
                : 'No products match your search.'}
            </div>
          ) : (
            <div style={styles.productsGrid} role="list" aria-label="Products">
              {filtered.map(product => (
                <button
                  key={product.id}
                  role="listitem"
                  onClick={() => addToCart(product)}
                  style={styles.productCard}
                  aria-label={`Add ${product.name} to cart`}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }} aria-hidden="true">📦</div>
                  <div style={styles.productName}>{product.name}</div>
                  {product.category && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>
                      {product.category}
                    </div>
                  )}
                  <div style={styles.productPrice}>{formatNaira(product.price_kobo)}</div>
                  {product.sku && (
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>per {product.sku}</div>
                  )}
                  {product.stock_qty !== null && (
                    <div style={{ fontSize: 11, color: product.stock_qty < 5 ? '#dc2626' : '#9ca3af' }}>
                      Stock: {product.stock_qty}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={styles.cartPanel}>
          <h2 style={styles.cartHeading}>Cart</h2>

          {cart.length === 0 ? (
            <div style={styles.emptyCart}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
              <div style={{ color: '#9ca3af', fontSize: 14 }}>Tap a product to add it</div>
            </div>
          ) : (
            <div style={styles.cartItems} role="list" aria-label="Cart items">
              {cart.map(item => (
                <div key={item.id} role="listitem" style={styles.cartItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {formatNaira(item.price_kobo)} × {item.qty} = {formatNaira(item.price_kobo * item.qty)}
                    </div>
                  </div>
                  <div style={styles.qtyControls}>
                    <button
                      onClick={() => updateQty(item.id, -1)}
                      style={styles.qtyBtn}
                      aria-label={`Remove one ${item.name}`}
                    >−</button>
                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, 1)}
                      style={styles.qtyBtn}
                      aria-label={`Add one more ${item.name}`}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <>
              <div style={styles.totalRow}>
                <span style={{ fontSize: 15, color: '#374151' }}>Total</span>
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
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12,
                        fontWeight: 600, cursor: 'pointer', border: '1.5px solid', minHeight: 40,
                        borderColor: paymentMethod === method ? '#0F4C81' : '#e5e7eb',
                        background: paymentMethod === method ? '#EFF6FF' : '#fff',
                        color: paymentMethod === method ? '#0F4C81' : '#374151',
                      }}
                    >
                      {PAYMENT_LABELS[method]}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={checkout}
                loading={checkingOut}
                size="md"
                style={{ width: '100%', justifyContent: 'center' } as React.CSSProperties}
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

const styles = {
  page: { padding: '24px 20px', maxWidth: 1100, margin: '0 auto' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827' } as React.CSSProperties,
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' } as React.CSSProperties,
  productsPanel: { minWidth: 0 } as React.CSSProperties,
  searchInput: {
    width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #d1d5db',
    fontSize: 14, marginBottom: 16, outline: 'none', boxSizing: 'border-box',
  } as React.CSSProperties,
  productsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 } as React.CSSProperties,
  productCard: {
    background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
    minHeight: 120,
  } as React.CSSProperties,
  productName: { fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 4 } as React.CSSProperties,
  productPrice: { fontSize: 15, fontWeight: 800, color: '#0F4C81', marginBottom: 2 } as React.CSSProperties,
  cartPanel: {
    background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #e5e7eb',
    position: 'sticky', top: 24,
  } as React.CSSProperties,
  cartHeading: { fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 } as React.CSSProperties,
  emptyCart: { textAlign: 'center', padding: '32px 0', color: '#9ca3af' } as React.CSSProperties,
  cartItems: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 } as React.CSSProperties,
  cartItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px', borderRadius: 8, background: '#f9fafb' } as React.CSSProperties,
  qtyControls: { display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  qtyBtn: {
    width: 28, height: 28, borderRadius: 6, border: '1.5px solid #d1d5db', background: '#fff',
    cursor: 'pointer', fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
  } as React.CSSProperties,
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderTop: '1px solid #e5e7eb', marginBottom: 12,
  } as React.CSSProperties,
  receipt: {
    maxWidth: 380, margin: '60px auto', textAlign: 'center', background: '#fff',
    borderRadius: 16, padding: '48px 32px', border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  } as React.CSSProperties,
};
