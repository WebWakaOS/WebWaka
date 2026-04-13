import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatNaira, nairaToKobo, koboToNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';

interface Offering {
  id: string;
  name: string;
  description: string;
  priceKobo: number;
  unit: string;
  active: boolean;
  imageUrl?: string;
  category: string;
}

const DEMO_OFFERINGS: Offering[] = [
  { id: 'o1', name: 'Fresh Tomatoes', description: 'Locally grown, farm fresh', priceKobo: 45000, unit: 'kg', active: true, category: 'Produce' },
  { id: 'o2', name: 'Garri (White)', description: 'Grade A cassava garri', priceKobo: 32000, unit: 'kg', active: true, category: 'Grains' },
  { id: 'o3', name: 'Palm Oil', description: 'Unrefined red palm oil', priceKobo: 85000, unit: 'litre', active: true, category: 'Oils' },
  { id: 'o4', name: 'Fresh Catfish', description: 'Live-caught daily', priceKobo: 150000, unit: 'kg', active: false, category: 'Protein' },
];

interface OfferingFormState {
  name: string;
  description: string;
  priceNaira: string;
  unit: string;
  category: string;
}

const EMPTY_FORM: OfferingFormState = { name: '', description: '', priceNaira: '', unit: 'kg', category: 'General' };

export default function Offerings() {
  const [offerings, setOfferings] = useState<Offering[]>(DEMO_OFFERINGS);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<OfferingFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filtered = offerings.filter(o =>
    filter === 'all' ? true : filter === 'active' ? o.active : !o.active
  );

  const openNew = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (o: Offering) => {
    setEditId(o.id);
    setForm({
      name: o.name,
      description: o.description,
      priceNaira: koboToNaira(o.priceKobo).toFixed(2),
      unit: o.unit,
      category: o.category,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    const price = parseFloat(form.priceNaira);
    if (isNaN(price) || price <= 0) { toast.error('Enter a valid price'); return; }
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      if (editId) {
        setOfferings(prev => prev.map(o => o.id === editId ? {
          ...o, name: form.name, description: form.description,
          priceKobo: nairaToKobo(price), unit: form.unit, category: form.category,
        } : o));
        toast.success('Offering updated');
      } else {
        const newOffering: Offering = {
          id: `o${Date.now()}`, name: form.name, description: form.description,
          priceKobo: nairaToKobo(price), unit: form.unit, category: form.category, active: true,
        };
        setOfferings(prev => [newOffering, ...prev]);
        toast.success('Offering created');
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (id: string) => {
    setOfferings(prev => prev.map(o => o.id === id ? { ...o, active: !o.active } : o));
    toast.info('Offering status updated');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this offering? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await new Promise(r => setTimeout(r, 600));
      setOfferings(prev => prev.filter(o => o.id !== id));
      toast.success('Offering deleted');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>Offerings</h1>
          <p style={styles.subheading}>{offerings.length} products · {offerings.filter(o=>o.active).length} active</p>
        </div>
        <Button onClick={openNew} size="md">+ Add offering</Button>
      </header>

      {showForm && (
        <div role="dialog" aria-label={editId ? 'Edit offering' : 'New offering'} aria-modal="true" style={styles.modal}>
          <div style={styles.modalCard}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              {editId ? 'Edit offering' : 'New offering'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Product name" required value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))} placeholder="e.g. Fresh Tomatoes" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={styles.fieldLabel} htmlFor="desc">Description</label>
                <textarea
                  id="desc"
                  value={form.description}
                  onChange={e => setForm(p=>({...p, description: e.target.value}))}
                  placeholder="Brief description for customers"
                  rows={3}
                  style={{ ...styles.textarea }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Price (Naira)" type="number" min="0" step="0.01" required value={form.priceNaira} onChange={e => setForm(p=>({...p, priceNaira: e.target.value}))} placeholder="450.00" hint="Enter in Naira" />
                <Input label="Unit" required value={form.unit} onChange={e => setForm(p=>({...p, unit: e.target.value}))} placeholder="kg, litre, each…" />
              </div>
              <Input label="Category" value={form.category} onChange={e => setForm(p=>({...p, category: e.target.value}))} placeholder="Produce, Grains, Protein…" />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={saving}>{editId ? 'Save changes' : 'Create offering'}</Button>
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
              padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: '1.5px solid', minHeight: 36, touchAction: 'manipulation',
              borderColor: filter === f ? '#0F4C81' : '#e5e7eb',
              background: filter === f ? '#0F4C81' : '#fff',
              color: filter === f ? '#fff' : '#374151',
            }}
          >{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <div role="list" aria-label="Offerings" style={styles.list}>
        {filtered.map(offering => (
          <article key={offering.id} role="listitem" style={{ ...styles.card, opacity: offering.active ? 1 : 0.65 }}>
            <div style={styles.cardLeft}>
              <div style={styles.cardName}>{offering.name}</div>
              <div style={styles.cardDesc}>{offering.description}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={styles.tag}>{offering.category}</span>
                <span style={{ ...styles.tag, background: offering.active ? '#dcfce7' : '#fee2e2', color: offering.active ? '#166534' : '#991b1b' }}>
                  {offering.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div style={styles.cardRight}>
              <div style={styles.price}>{formatNaira(offering.priceKobo)}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>per {offering.unit}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <Button size="sm" variant="ghost" onClick={() => openEdit(offering)}>Edit</Button>
                <Button size="sm" variant="secondary" onClick={() => toggleActive(offering.id)}>
                  {offering.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button size="sm" variant="danger" loading={deleting === offering.id} onClick={() => handleDelete(offering.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
            No offerings found. <button onClick={openNew} style={{ color: '#0F4C81', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Add one</button>
          </div>
        )}
      </div>
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
  cardDesc: { fontSize: 13, color: '#6b7280' } as React.CSSProperties,
  tag: { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12, background: '#f3f4f6', color: '#374151' } as React.CSSProperties,
  price: { fontSize: 20, fontWeight: 800, color: '#0F4C81' } as React.CSSProperties,
};
