import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';

interface Product {
  id: string;
  name: string;
  priceKobo: number;
  unit: string;
  stock?: number;
  emoji: string;
}

interface CartItem extends Product {
  qty: number;
}

const DEMO_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Fresh Tomatoes', priceKobo: 45000, unit: 'kg', stock: 50, emoji: '🍅' },
  { id: 'p2', name: 'Garri (White)',  priceKobo: 32000, unit: 'kg', stock: 200, emoji: '🌾' },
  { id: 'p3', name: 'Palm Oil',       priceKobo: 85000, unit: 'litre', stock: 30, emoji: '🫙' },
  { id: 'p4', name: 'Fresh Catfish',  priceKobo: 150000, unit: 'kg', stock: 20, emoji: '🐟' },
  { id: 'p5', name: 'Yam (tuber)',    priceKobo: 60000, unit: 'each', stock: 80, emoji: '🍠' },
  { id: 'p6', name: 'Plantain',       priceKobo: 25000, unit: 'bunch', stock: 40, emoji: '🍌' },
  { id: 'p7', name: 'Eggs',           priceKobo: 9000, unit: 'each', stock: 500, emoji: '🥚' },
  { id: 'p8', name: 'Pepper (red)',   priceKobo: 55000, unit: 'kg', stock: 60, emoji: '🌶️' },
];

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  const filtered = DEMO_PRODUCTS.filter(p =>
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

  const totalKobo = cart.reduce((sum, i) => sum + i.priceKobo * i.qty, 0);

  const checkout = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setCheckingOut(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
      setLastOrderId(orderId);
      setCart([]);
      setReceiptVisible(true);
      toast.success(`Sale recorded — ${orderId}`);
    } catch {
      toast.error('Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Point of Sale</h1>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          {cart.length > 0 ? `${cart.reduce((s,i)=>s+i.qty,0)} items in cart` : 'Add items from below'}
        </div>
      </header>

      {receiptVisible && (
        <div role="dialog" aria-label="Sale receipt" style={styles.receipt}>
          <div style={{ fontSize: 32, marginBottom: 8 }} aria-hidden="true">✅</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Sale complete!</div>
          <code style={{ fontSize: 13, color: '#0F4C81' }}>{lastOrderId}</code>
          <Button size="sm" variant="secondary" style={{ marginTop: 12 }} onClick={() => setReceiptVisible(false)}>
            New sale
          </Button>
        </div>
      )}

      <div style={styles.layout}>
        <section aria-label="Product catalogue" style={styles.catalogue}>
          <div style={styles.searchWrap}>
            <label htmlFor="pos-search" style={styles.srOnly}>Search products</label>
            <input
              id="pos-search"
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.search}
              aria-label="Search products"
            />
          </div>
          <div style={styles.grid} role="list" aria-label="Available products">
            {filtered.map(product => (
              <button
                key={product.id}
                role="listitem"
                onClick={() => addToCart(product)}
                style={styles.productCard}
                aria-label={`Add ${product.name} to cart — ${formatNaira(product.priceKobo)} per ${product.unit}`}
              >
                <span aria-hidden="true" style={{ fontSize: 32 }}>{product.emoji}</span>
                <div style={styles.productName}>{product.name}</div>
                <div style={styles.productPrice}>{formatNaira(product.priceKobo)}/{product.unit}</div>
                {product.stock !== undefined && (
                  <div style={{ fontSize: 11, color: product.stock < 10 ? '#dc2626' : '#6b7280' }}>
                    {product.stock} in stock
                  </div>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <p style={{ gridColumn: '1/-1', color: '#9ca3af', textAlign: 'center', padding: '32px 0' }}>
                No products found for "{search}"
              </p>
            )}
          </div>
        </section>

        <aside aria-label="Shopping cart" style={styles.cartPanel}>
          <h2 style={styles.cartHeading}>Cart</h2>
          {cart.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
              No items yet.<br />Tap a product to add.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
              {cart.map(item => (
                <li key={item.id} style={styles.cartItem}>
                  <span aria-hidden="true">{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{formatNaira(item.priceKobo)} each</div>
                  </div>
                  <div style={styles.qtyControls} role="group" aria-label={`Quantity of ${item.name}`}>
                    <button onClick={() => updateQty(item.id, -1)} style={styles.qtyBtn} aria-label="Decrease quantity">−</button>
                    <span style={{ minWidth: 24, textAlign: 'center', fontSize: 14, fontWeight: 600 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={styles.qtyBtn} aria-label="Increase quantity">+</button>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F4C81', minWidth: 64, textAlign: 'right' }}>
                    {formatNaira(item.priceKobo * item.qty)}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div style={styles.cartTotal}>
            <span>Total</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#0F4C81' }}>{formatNaira(totalKobo)}</span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button variant="secondary" size="sm" onClick={() => setCart([])} disabled={cart.length === 0}>
              Clear
            </Button>
            <Button fullWidth size="md" loading={checkingOut} onClick={checkout} disabled={cart.length === 0}>
              💳 Charge {totalKobo > 0 ? formatNaira(totalKobo) : ''}
            </Button>
          </div>

          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
            Powered by Paystack · NDPR compliant
          </p>
        </aside>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '24px 20px', maxWidth: 1100, margin: '0 auto' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827' } as React.CSSProperties,
  receipt: {
    background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '20px 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24,
  } as React.CSSProperties,
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' } as React.CSSProperties,
  catalogue: { flex: 1, minWidth: 280 } as React.CSSProperties,
  searchWrap: { marginBottom: 16 } as React.CSSProperties,
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' } as React.CSSProperties,
  search: {
    width: '100%', padding: '11px 14px', borderRadius: 8, border: '1.5px solid #d1d5db',
    fontSize: 15, outline: 'none', minHeight: 44,
  } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 } as React.CSSProperties,
  productCard: {
    background: '#fff', borderRadius: 12, padding: '16px 12px', border: '1.5px solid #e5e7eb',
    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    minHeight: 110, transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    touchAction: 'manipulation',
  } as React.CSSProperties,
  productName: { fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'center' } as React.CSSProperties,
  productPrice: { fontSize: 12, color: '#0F4C81', fontWeight: 600 } as React.CSSProperties,
  cartPanel: {
    width: 300, background: '#fff', borderRadius: 12, padding: '20px 16px',
    border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'sticky', top: 20,
  } as React.CSSProperties,
  cartHeading: { fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 14 } as React.CSSProperties,
  cartItem: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
  } as React.CSSProperties,
  qtyControls: { display: 'flex', alignItems: 'center', gap: 4 } as React.CSSProperties,
  qtyBtn: {
    width: 28, height: 28, borderRadius: 6, border: '1.5px solid #e5e7eb',
    background: '#f8f9fa', cursor: 'pointer', fontSize: 16, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontWeight: 700,
    minHeight: 28, touchAction: 'manipulation',
  } as React.CSSProperties,
  cartTotal: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0 0', borderTop: '2px solid #e5e7eb', marginTop: 4,
    fontSize: 15, fontWeight: 600, color: '#374151',
  } as React.CSSProperties,
};
