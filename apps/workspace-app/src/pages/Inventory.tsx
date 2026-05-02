/**
 * Inventory Management Page
 * Wave 2 — Batch 1 (B2-1 through B2-5, A2-1)
 *
 * Features:
 * - Full product inventory list with stock levels + low-stock indicators
 * - Bulk stock adjustment (receive / return / write-off)
 * - Low-stock threshold setting per product
 * - Inventory audit log
 * - Export to CSV
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// ConfirmModal not used — inline modals below
import { formatNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  price_kobo: number;
  stock_qty: number | null;
  low_stock_threshold: number | null;
  active: boolean;
}

interface ProductsResponse {
  products: Product[];
  count: number;
}

interface AuditEntry {
  id: string;
  product_id: string;
  product_name: string;
  change_type: 'receive' | 'return' | 'writeoff' | 'sale' | 'adjustment';
  qty_before: number;
  qty_change: number;
  qty_after: number;
  note: string | null;
  actor_email: string;
  created_at: number;
}

interface AuditResponse {
  log: AuditEntry[];
  total: number;
}

type AdjustType = 'receive' | 'return' | 'writeoff';

const ADJUST_LABELS: Record<AdjustType, string> = {
  receive: '📦 Receive Stock',
  return: '↩️ Return Stock',
  writeoff: '❌ Write Off',
};

const ADJUST_COLORS: Record<AdjustType, string> = {
  receive: '#059669',
  return: '#0F4C81',
  writeoff: '#dc2626',
};

const CHANGE_TYPE_LABELS: Record<string, string> = {
  receive: 'Received',
  return: 'Returned',
  writeoff: 'Written off',
  sale: 'Sold',
  adjustment: 'Adjusted',
};

// ─── CSV export ──────────────────────────────────────────────────────────────

function exportInventoryCSV(products: Product[]) {
  const headers = ['Name', 'SKU', 'Category', 'Price (₦)', 'Stock Qty', 'Low Stock Threshold', 'Status'];
  const rows = products.map(p => [
    `"${p.name.replace(/"/g, '""')}"`,
    p.sku ?? '',
    p.category ?? '',
    (p.price_kobo / 100).toFixed(2),
    p.stock_qty ?? 'N/A',
    p.low_stock_threshold ?? 'N/A',
    p.active ? 'Active' : 'Inactive',
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Stock badge ─────────────────────────────────────────────────────────────

function StockBadge({ qty, threshold }: { qty: number | null; threshold: number | null }) {
  if (qty === null) return <span style={{ color: '#9ca3af', fontSize: 13 }}>Untracked</span>;
  const isLow = threshold !== null ? qty <= threshold : qty === 0;
  const isOut = qty === 0;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: isOut ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7',
      color: isOut ? '#dc2626' : isLow ? '#d97706' : '#16a34a',
    }}>
      {qty} {isOut ? '• Out of stock' : isLow ? '• Low stock' : 'in stock'}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Inventory() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [tab, setTab] = useState<'inventory' | 'log'>('inventory');

  // Adjust modal
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<AdjustType>('receive');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Threshold modal
  const [threshProduct, setThreshProduct] = useState<Product | null>(null);
  const [threshVal, setThreshVal] = useState('');
  const [savingThresh, setSavingThresh] = useState(false);

  // Audit log
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await api.get<ProductsResponse>(`/pos-business/products/${workspaceId}?limit=500`);
      setProducts(res.products);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  const loadAudit = useCallback(async () => {
    if (!workspaceId) return;
    setAuditLoading(true);
    try {
      const res = await api.get<AuditResponse>(`/pos-business/inventory/${workspaceId}/log?limit=100`);
      setAuditLog(res.log ?? []);
    } catch {
      // Audit log endpoint may not exist yet — show empty state gracefully
      setAuditLog([]);
    } finally {
      setAuditLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { if (tab === 'log') loadAudit(); }, [tab, loadAudit]);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'out') return (p.stock_qty ?? 1) === 0;
    if (filter === 'low') {
      const t = p.low_stock_threshold ?? 0;
      return p.stock_qty !== null && p.stock_qty > 0 && p.stock_qty <= Math.max(t, 5);
    }
    return true;
  });

  const handleAdjust = async () => {
    if (!adjustProduct || !workspaceId) return;
    const qty = parseInt(adjustQty, 10);
    if (!qty || qty < 1) { toast.error('Enter a valid quantity'); return; }
    setAdjusting(true);
    try {
      await api.post(`/pos-business/inventory/${workspaceId}/adjust`, {
        product_id: adjustProduct.id,
        change_type: adjustType,
        qty,
        note: adjustNote || null,
      });
      toast.success(`Stock ${ADJUST_LABELS[adjustType].split(' ')[1].toLowerCase()} updated`);
      setAdjustProduct(null);
      setAdjustQty('');
      setAdjustNote('');
      loadProducts();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  const handleSaveThreshold = async () => {
    if (!threshProduct || !workspaceId) return;
    const val = parseInt(threshVal, 10);
    if (isNaN(val) || val < 0) { toast.error('Enter a valid threshold (0 or more)'); return; }
    setSavingThresh(true);
    try {
      await api.patch(`/pos-business/products/${workspaceId}/${threshProduct.id}`, {
        low_stock_threshold: val,
      });
      toast.success('Low-stock threshold saved');
      setThreshProduct(null);
      loadProducts();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to save threshold');
    } finally {
      setSavingThresh(false);
    }
  };

  // B2-2: Bulk selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAdjType, setBulkAdjType] = useState<AdjustType>('receive');
  const [bulkAdjQty, setBulkAdjQty] = useState('');
  const [bulkAdjNote, setBulkAdjNote] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);


  // B2-2: Apply bulk adjustment to all selected products
  const applyBulkAdjust = async () => {
    if (selected.size === 0) { toast.error('Select at least one product'); return; }
    const qty = parseInt(bulkAdjQty);
    if (isNaN(qty) || qty <= 0) { toast.error('Enter a valid quantity'); return; }
    if (!workspaceId) return;
    setBulkSaving(true);
    let successCount = 0;
    for (const productId of Array.from(selected)) {
      try {
        await api.post(`/pos-business/inventory/${workspaceId}/adjust`, {
          product_id: productId,
          type: bulkAdjType,
          qty,
          note: bulkAdjNote.trim() || undefined,
        });
        successCount++;
      } catch {
        // continue with other products
      }
    }
    setBulkSaving(false);
    toast.success(`Bulk adjustment applied to ${successCount} product(s)`);
    setSelected(new Set());
    setBulkAdjQty('');
    setBulkAdjNote('');
    await loadProducts();
  };

  const outCount = products.filter(p => (p.stock_qty ?? 1) === 0 && p.active).length;
  const lowCount = products.filter(p => {
    if (!p.active || p.stock_qty === null) return false;
    const t = p.low_stock_threshold ?? 5;
    return p.stock_qty > 0 && p.stock_qty <= t;
  }).length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div id="main-content" style={{ padding: '24px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Inventory</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>
            {products.length} products · {outCount > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>{outCount} out of stock · </span>}
            {lowCount > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>{lowCount} low stock</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="secondary" onClick={() => exportInventoryCSV(products)}>⬇ Export CSV</Button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #e5e7eb' }}>
        {(['inventory', 'log'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: tab === t ? 700 : 400,
            color: tab === t ? '#0F4C81' : '#6b7280',
            borderBottom: tab === t ? '2px solid #0F4C81' : '2px solid transparent',
            marginBottom: -1,
          }}>
            {t === 'inventory' ? '📦 Stock Levels' : '📋 Audit Log'}
          </button>
        ))}
      </div>

      {tab === 'inventory' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or SKU…"
              style={{ flex: 1, minWidth: 200, maxWidth: 340 }}
            />
            {(['all', 'low', 'out'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
                border: '1.5px solid',
                borderColor: filter === f ? '#0F4C81' : '#e5e7eb',
                background: filter === f ? '#eff6ff' : '#fff',
                color: filter === f ? '#0F4C81' : '#6b7280',
                cursor: 'pointer',
              }}>
                {f === 'all' ? 'All' : f === 'low' ? '⚠️ Low Stock' : '🔴 Out of Stock'}
              </button>
            ))}
          </div>


          {/* B2-2: Bulk action bar */}
          {selected.size > 0 && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>{selected.size} selected</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                {(['receive', 'return', 'writeoff'] as AdjustType[]).map(at => (
                  <button key={at} onClick={() => setBulkAdjType(at)} style={{
                    padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600, border: '1.5px solid',
                    cursor: 'pointer',
                    borderColor: bulkAdjType === at ? ADJUST_COLORS[at] : '#e5e7eb',
                    background: bulkAdjType === at ? (at === 'receive' ? '#dcfce7' : at === 'return' ? '#dbeafe' : '#fee2e2') : '#fff',
                    color: bulkAdjType === at ? ADJUST_COLORS[at] : '#6b7280',
                  }}>{ADJUST_LABELS[at]}</button>
                ))}
                <input type="number" min={1} placeholder="Qty" value={bulkAdjQty} onChange={e => setBulkAdjQty(e.target.value)}
                  style={{ width: 70, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
                <input type="text" placeholder="Note (optional)" value={bulkAdjNote} onChange={e => setBulkAdjNote(e.target.value)}
                  style={{ flex: 1, minWidth: 100, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
                <button onClick={() => void applyBulkAdjust()} disabled={bulkSaving}
                  style={{ background: '#0F4C81', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 600, cursor: bulkSaving ? 'wait' : 'pointer' }}>
                  {bulkSaving ? 'Saving…' : 'Apply to all'}
                </button>
                <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 12 }}>✕ Clear</button>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading inventory…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p style={{ color: '#6b7280', fontSize: 15 }}>
                {search || filter !== 'all' ? 'No products match your filter.' : 'No products yet. Add some in Offerings.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '10px 12px', width: 36 }}><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(p => p.id)) : new Set())} checked={selected.size === filtered.length && filtered.length > 0} /></th>
                    {['Product', 'SKU', 'Price', 'Stock', 'Threshold', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 12px', width: 36 }}><input type="checkbox" checked={selected.has(p.id)} onChange={e => setSelected(prev => { const s = new Set(prev); e.target.checked ? s.add(p.id) : s.delete(p.id); return s; })} /></td>
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111827' }}>
                        {p.name}
                        {!p.active && <span style={{ marginLeft: 6, fontSize: 11, color: '#9ca3af', background: '#f3f4f6', borderRadius: 4, padding: '1px 6px' }}>Inactive</span>}
                        {p.category && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{p.category}</div>}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', fontFamily: 'monospace', fontSize: 12 }}>{p.sku ?? '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#111827' }}>{formatNaira(p.price_kobo)}</td>
                      <td style={{ padding: '10px 12px' }}><StockBadge qty={p.stock_qty} threshold={p.low_stock_threshold} /></td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 13 }}>
                        <button onClick={() => { setThreshProduct(p); setThreshVal(String(p.low_stock_threshold ?? 5)); }}
                          style={{ background: 'none', border: '1px dashed #d1d5db', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', color: '#6b7280', fontSize: 12 }}>
                          {p.low_stock_threshold !== null ? p.low_stock_threshold : 'Set'} ✎
                        </button>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {(['receive', 'return', 'writeoff'] as AdjustType[]).map(at => (
                            <button key={at} title={ADJUST_LABELS[at]}
                              onClick={() => { setAdjustProduct(p); setAdjustType(at); setAdjustQty(''); setAdjustNote(''); }}
                              style={{
                                padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                                border: 'none', cursor: 'pointer',
                                background: at === 'receive' ? '#dcfce7' : at === 'return' ? '#dbeafe' : '#fee2e2',
                                color: ADJUST_COLORS[at],
                              }}>
                              {at === 'receive' ? '+' : at === 'return' ? '↩' : '✕'}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'log' && (
        <>
          {auditLoading ? (
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 44, background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)', backgroundSize: '200% 100%', borderRadius: 8, marginBottom: 8, animation: 'shimmer 1.4s infinite' }} />
              ))}
              <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
            </div>
          ) : auditLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <p style={{ color: '#6b7280' }}>No inventory changes recorded yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Time', 'Product', 'Action', 'Change', 'After', 'By', 'Note'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '8px 12px', color: '#9ca3af', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {new Date(e.created_at * 1000).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>{e.product_name}</td>
                      <td style={{ padding: '8px 12px' }}>{CHANGE_TYPE_LABELS[e.change_type] ?? e.change_type}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600,
                        color: e.qty_change > 0 ? '#16a34a' : '#dc2626' }}>
                        {e.qty_change > 0 ? `+${e.qty_change}` : e.qty_change}
                      </td>
                      <td style={{ padding: '8px 12px' }}>{e.qty_after}</td>
                      <td style={{ padding: '8px 12px', color: '#6b7280', fontSize: 12 }}>{e.actor_email}</td>
                      <td style={{ padding: '8px 12px', color: '#9ca3af', fontStyle: e.note ? 'normal' : 'italic' }}>{e.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Adjust modal */}
      {adjustProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setAdjustProduct(null)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 18 }}>{ADJUST_LABELS[adjustType]} — {adjustProduct.name}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['receive', 'return', 'writeoff'] as AdjustType[]).map(at => (
                  <button key={at} onClick={() => setAdjustType(at)} style={{
                    flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    border: '2px solid',
                    borderColor: adjustType === at ? ADJUST_COLORS[at] : '#e5e7eb',
                    background: adjustType === at ? (at === 'receive' ? '#f0fdf4' : at === 'return' ? '#eff6ff' : '#fff5f5') : '#fff',
                    color: adjustType === at ? ADJUST_COLORS[at] : '#9ca3af',
                    cursor: 'pointer',
                  }}>
                    {ADJUST_LABELS[at]}
                  </button>
                ))}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Quantity *</label>
                <Input type="number" min="1" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="e.g. 50" />
                {adjustProduct.stock_qty !== null && (
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Current stock: {adjustProduct.stock_qty} units</div>
                )}
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Note (optional)</label>
                <Input value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="e.g. Received from supplier" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setAdjustProduct(null)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAdjust} disabled={adjusting} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: adjustType === 'writeoff' ? '#dc2626' : '#0F4C81', color: '#fff', fontWeight: 600, fontSize: 14, cursor: adjusting ? 'not-allowed' : 'pointer', opacity: adjusting ? 0.6 : 1 }}>
                {adjusting ? 'Saving…' : 'Apply Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Threshold modal */}
      {threshProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setThreshProduct(null)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', zIndex: 1 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Low-Stock Threshold</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>Alert when stock falls to or below this quantity for <strong>{threshProduct.name}</strong>.</p>
            <Input type="number" min="0" value={threshVal} onChange={e => setThreshVal(e.target.value)} placeholder="e.g. 10" />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setThreshProduct(null)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveThreshold} disabled={savingThresh} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#0F4C81', color: '#fff', fontWeight: 600, fontSize: 14, cursor: savingThresh ? 'not-allowed' : 'pointer', opacity: savingThresh ? 0.6 : 1 }}>
                {savingThresh ? 'Saving…' : 'Save Threshold'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
