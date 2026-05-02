import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { formatNaira, nairaToKobo, koboToNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  description?: string;
  price_kobo: number;
  category: string | null;
  active: boolean;
  stock_qty: number | null;
  sku: string | null;
}

interface ProductsResponse {
  products: Product[];
  count: number;
}

interface ProductFormState {
  name: string;
  description: string;
  priceNaira: string;
  unit: string;
  category: string;
  stockQty: string;
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  priceNaira: '',
  unit: '',
  category: 'General',
  stockQty: '',
};

export default function Offerings() {
  const { user } = useAuth();
  const location = useLocation();
  const workspaceId = user?.workspaceId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showForm, setShowForm] = useState(location.pathname === '/offerings/new');
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!workspaceId) { setLoadingProducts(false); return; }
    api.get<ProductsResponse>(`/pos-business/products/${workspaceId}?active=0`)
      .then(res => setProducts(res.products))
      .catch(err => {
        if (err instanceof ApiError && err.status === 403) {
          toast.error('Commerce features not available on your current plan.');
        } else {
          toast.error('Failed to load offerings.');
        }
      })
      .finally(() => setLoadingProducts(false));
  }, [workspaceId]);

  const filtered = products.filter(p =>
    filter === 'all' ? true : filter === 'active' ? p.active : !p.active,
  );

  const openNew = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? '',
      priceNaira: koboToNaira(p.price_kobo).toFixed(2),
      unit: p.sku ?? '',
      category: p.category ?? 'General',
      stockQty: p.stock_qty !== null ? String(p.stock_qty) : '',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const price = parseFloat(form.priceNaira);
    if (isNaN(price) || price <= 0) { toast.error('Enter a valid price'); return; }
    if (!workspaceId) { toast.error('Workspace not found.'); return; }
    const stockQty = form.stockQty.trim() ? parseInt(form.stockQty.trim(), 10) : null;
    if (form.stockQty.trim() && (isNaN(stockQty as number) || (stockQty as number) < 0)) {
      toast.error('Stock quantity must be a non-negative number');
      return;
    }

    setSaving(true);
    try {
      if (editId) {
        const res = await api.patch<{ product: Product }>(`/pos-business/product/${editId}`, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price_kobo: nairaToKobo(price),
          sku: form.unit.trim() || null,
          category: form.category.trim() || null,
          stock_qty: stockQty,
        });
        setProducts(prev => prev.map(p => p.id === editId ? res.product : p));
        toast.success('Offering updated');
      } else {
        const res = await api.post<{ product: Product }>('/pos-business/products', {
          workspace_id: workspaceId,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          price_kobo: nairaToKobo(price),
          sku: form.unit.trim() || undefined,
          category: form.category.trim() || undefined,
          ...(stockQty !== null ? { stock_qty: stockQty } : {}),
        });
        setProducts(prev => [res.product, ...prev]);
        toast.success('Offering created');
      }
      setShowForm(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Save failed. Please try again.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: Product) => {
    if (!workspaceId) return;
    try {
      const res = await api.patch<{ product: Product }>(`/pos-business/product/${p.id}`, { active: !p.active });
      setProducts(prev => prev.map(item => item.id === p.id ? res.product : item));
      toast.info(`Offering ${res.product.active ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update offering status.'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleting(id);
    setDeleteTarget(null);
    try {
      await api.delete(`/pos-business/product/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Offering deleted');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Delete failed.';
      toast.error(msg);
    } finally {
      setDeleting(null);
    }
  };

  const activeCount = products.filter(p => p.active).length;

  return (
    <div style={styles.page}>
      {/* Confirm delete modal (M7 fix: replace window.confirm) */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete offering?"
        message={`"${deleteTarget?.name ?? ''}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Offerings</h1>
          <p style={styles.subheading}>
            {loadingProducts ? 'Loading…' : `${products.length} products · ${activeCount} active`}
          </p>
        </div>
        <Button onClick={openNew} size="md">+ Add offering</Button>
      </header>

      {showForm && (
        <div
          role="dialog"
          aria-label={editId ? 'Edit offering' : 'New offering'}
          aria-modal="true"
          style={styles.modal}
        >
          <div style={styles.modalCard}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              {editId ? 'Edit offering' : 'New offering'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input
                label="Product name"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Fresh Tomatoes"
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={styles.fieldLabel} htmlFor="desc">Description</label>
                <textarea
                  id="desc"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description for customers (optional)"
                  rows={3}
                  style={styles.textarea}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Price (Naira)"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.priceNaira}
                  onChange={e => setForm(p => ({ ...p, priceNaira: e.target.value }))}
                  placeholder="450.00"
                  hint="Enter in Naira"
                />
                <Input
                  label="Unit (optional)"
                  value={form.unit}
                  onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                  placeholder="kg, litre, each…"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input
                  label="Category"
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  placeholder="Produce, Grains, Protein…"
                />
                <Input
                  label="Stock quantity (optional)"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockQty}
                  onChange={e => setForm(p => ({ ...p, stockQty: e.target.value }))}
                  placeholder="Leave blank if unlimited"
                  hint="Tracks available units"
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={saving}>
                  {editId ? 'Save changes' : 'Create offering'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', border: '1.5px solid', minHeight: 36,
              borderColor: filter === f ? '#0F4C81' : '#e5e7eb',
              background: filter === f ? '#0F4C81' : '#fff',
              color: filter === f ? '#fff' : '#374151',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loadingProducts ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>Loading offerings…</div>
      ) : (
        <div role="list" aria-label="Offerings" style={styles.list}>
          {filtered.map(product => (
            <article key={product.id} role="listitem" style={{ ...styles.card, opacity: product.active ? 1 : 0.65 }}>
              <div style={styles.cardLeft}>
                <div style={styles.cardName}>{product.name}</div>
                {product.description && (
                  <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 4 }}>{product.description}</p>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  {product.category && <span style={styles.tag}>{product.category}</span>}
                  {product.sku && <span style={styles.tag}>per {product.sku}</span>}
                  <span style={{
                    ...styles.tag,
                    background: product.active ? '#dcfce7' : '#fee2e2',
                    color: product.active ? '#166534' : '#991b1b',
                  }}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div style={styles.cardRight}>
                <div style={styles.price}>{formatNaira(product.price_kobo)}</div>
                {product.sku && <div style={{ fontSize: 12, color: '#9ca3af' }}>per {product.sku}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(product)}>Edit</Button>
                  <Button size="sm" variant="secondary" onClick={() => void toggleActive(product)}>
                    {product.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm" variant="danger"
                    loading={deleting === product.id}
                    onClick={() => setDeleteTarget(product)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{filter === 'all' ? '📦' : '🔍'}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                {filter === 'all' ? 'No offerings yet' : `No ${filter} offerings`}
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
                {filter === 'all'
                  ? 'Add your products or services so they appear in your POS and WakaPage storefront.'
                  : `Try switching to "All" or add a new ${filter} offering.`}
              </p>
              <button onClick={openNew} style={{ background: '#0F4C81', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                + Add offering
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '24px 20px', maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827' } as React.CSSProperties,
  subheading: { fontSize: 14, color: '#6b7280' } as React.CSSProperties,
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 } as React.CSSProperties,
  modalCard: { background: '#fff', borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' } as React.CSSProperties,
  fieldLabel: { fontSize: 13, fontWeight: 600, color: '#374151' } as React.CSSProperties,
  textarea: { border: '1.5px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 15, width: '100%', resize: 'vertical', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties,
  list: { display: 'flex', flexDirection: 'column', gap: 12 } as React.CSSProperties,
  card: { background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' } as React.CSSProperties,
  cardLeft: { flex: 1, minWidth: 200 } as React.CSSProperties,
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' } as React.CSSProperties,
  cardName: { fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 } as React.CSSProperties,
  tag: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: '#f3f4f6', color: '#374151' } as React.CSSProperties,
  price: { fontSize: 20, fontWeight: 800, color: '#0F4C81' } as React.CSSProperties,
};
