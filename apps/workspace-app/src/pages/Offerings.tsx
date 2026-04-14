import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatNaira, nairaToKobo, koboToNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
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
}

const EMPTY_FORM: ProductFormState = {
  name: '',
  description: '',
  priceNaira: '',
  unit: 'kg',
  category: 'General',
};

export default function Offerings() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    if (!workspaceId) {
      setLoadingProducts(false);
      return;
    }
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
    filter === 'all' ? true : filter === 'active' ? p.active : !p.active
  );

  const openNew = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      description: '',
      priceNaira: koboToNaira(p.price_kobo).toFixed(2),
      unit: p.sku ?? '',
      category: p.category ?? 'General',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const price = parseFloat(form.priceNaira);
    if (isNaN(price) || price <= 0) { toast.error('Enter a valid price'); return; }
    if (!workspaceId) { toast.error('Workspace not found.'); return; }

    setSaving(true);
    try {
      if (editId) {
        const res = await api.patch<{ product: Product }>(`/pos-business/product/${editId}`, {
          name: form.name.trim(),
          price_kobo: nairaToKobo(price),
          sku: form.unit.trim() || null,
          category: form.category.trim() || null,
        });
        setProducts(prev => prev.map(p => p.id === editId ? res.product : p));
        toast.success('Offering updated');
      } else {
        const res = await api.post<{ product: Product }>('/pos-business/products', {
          workspace_id: workspaceId,
          name: form.name.trim(),
          price_kobo: nairaToKobo(price),
          sku: form.unit.trim() || undefined,
          category: form.category.trim() || undefined,
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
      const res = await api.patch<{ product: Product }>(`/pos-business/product/${p.id}`, {
        active: !p.active,
      });
      setProducts(prev => prev.map(item => item.id === p.id ? res.product : item));
      toast.info(`Offering ${res.product.active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update offering status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this offering? This cannot be undone.')) return;
    setDeleting(id);
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
                  style={{ ...styles.textarea }}
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
              <Input
                label="Category"
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                placeholder="Produce, Grains, Protein…"
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
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
              cursor: 'pointer', border: '1.5px solid', minHeight: 36, touchAction: 'manipulation',
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
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
          Loading offerings…
        </div>
      ) : (
        <div role="list" aria-label="Offerings" style={styles.list}>
          {filtered.map(product => (
            <article
              key={product.id}
              role="listitem"
              style={{ ...styles.card, opacity: product.active ? 1 : 0.65 }}
            >
              <div style={styles.cardLeft}>
                <div style={styles.cardName}>{product.name}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  {product.category && (
                    <span style={styles.tag}>{product.category}</span>
                  )}
                  {product.sku && (
                    <span style={styles.tag}>per {product.sku}</span>
                  )}
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
                {product.sku && (
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>per {product.sku}</div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(product)}>Edit</Button>
                  <Button size="sm" variant="secondary" onClick={() => toggleActive(product)}>
                    {product.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={deleting === product.id}
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
              No offerings found.{' '}
              <button
                onClick={openNew}
                style={{ color: '#0F4C81', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Add one
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
