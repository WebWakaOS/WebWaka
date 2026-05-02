/**
 * Customers Page — CRM-lite
 * Wave 2 — Batch 1 (A2-4)
 *
 * Features:
 * - Customer list with purchase history summary
 * - Search + filter
 * - Customer detail drawer (orders, notes)
 * - Export to CSV
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatNaira } from '@/lib/currency';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Customer {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  total_orders: number;
  total_spent_kobo: number;
  last_seen: number | null;
}

interface CustomerOrder {
  id: string;
  total_kobo: number;
  payment_method: string;
  created_at: number;
}

interface CustomerDetail {
  customer: Customer;
  orders: CustomerOrder[];
}

interface CustomersResponse {
  customers: Customer[];
  total: number;
}

function exportCustomersCSV(customers: Customer[]) {
  const headers = ['Name', 'Phone', 'Email', 'Total Orders', 'Total Spent (₦)', 'Last Seen'];
  const rows = customers.map(c => [
    `"${(c.name ?? '').replace(/"/g, '""')}"`,
    c.phone ?? '',
    c.email ?? '',
    c.total_orders,
    (c.total_spent_kobo / 100).toFixed(2),
    c.last_seen ? new Date(c.last_seen * 1000).toLocaleDateString('en-NG') : '',
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Customers() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadCustomers = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await api.get<CustomersResponse>(`/pos-business/customers/${workspaceId}?limit=500`);
      setCustomers(res.customers ?? []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const loadDetail = async (c: Customer) => {
    setLoadingDetail(true);
    try {
      const res = await api.get<CustomerDetail>(`/pos-business/customers/${workspaceId}/${c.id}`);
      setSelected(res);
    } catch {
      setSelected({ customer: c, orders: [] });
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (c.name ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q) ||
      (c.email ?? '').toLowerCase().includes(q);
  });

  return (
    <div id="main-content" style={{ padding: '24px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Customers</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>{customers.length} customers</p>
        </div>
        <Button variant="secondary" onClick={() => exportCustomersCSV(customers)}>⬇ Export CSV</Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or email…" style={{ maxWidth: 340 }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Loading customers…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <p style={{ color: '#6b7280' }}>{search ? 'No customers match your search.' : 'No customer data yet. Customer records are created from POS sales.'}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Customer', 'Phone / Email', 'Orders', 'Total Spent', 'Last Seen', ''].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#111827' }}>
                    {c.name ?? <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Anonymous</span>}
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 13 }}>
                    {c.phone && <div>{c.phone}</div>}
                    {c.email && <div>{c.email}</div>}
                    {!c.phone && !c.email && <span style={{ color: '#d1d5db' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: c.total_orders >= 3 ? '#059669' : '#111827' }}>
                    {c.total_orders}
                    {c.total_orders >= 3 && <span style={{ marginLeft: 4, fontSize: 11, color: '#059669' }}>↩</span>}
                  </td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#111827' }}>{formatNaira(c.total_spent_kobo)}</td>
                  <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12 }}>
                    {c.last_seen ? new Date(c.last_seen * 1000).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => loadDetail(c)} style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                      border: '1px solid #e5e7eb', background: '#f9fafb', color: '#0F4C81', cursor: 'pointer',
                    }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500, display: 'flex',
        }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} onClick={() => setSelected(null)} />
          <div style={{
            width: '100%', maxWidth: 440, background: '#fff', overflowY: 'auto',
            padding: 24, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
                  {selected.customer.name ?? 'Anonymous Customer'}
                </h2>
                <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                  {selected.customer.phone ?? ''}{selected.customer.phone && selected.customer.email ? ' · ' : ''}{selected.customer.email ?? ''}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af', padding: 4 }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Orders', val: selected.customer.total_orders },
                { label: 'Total Spent', val: formatNaira(selected.customer.total_spent_kobo) },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{s.val}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Order History</h3>
            {loadingDetail ? (
              <div style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', padding: 20 }}>Loading…</div>
            ) : selected.orders.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: 13 }}>No orders on record.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selected.orders.map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 13 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{formatNaira(o.total_kobo)}</div>
                      <div style={{ color: '#9ca3af', fontSize: 12 }}>{o.payment_method}</div>
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12, textAlign: 'right' }}>
                      {new Date(o.created_at * 1000).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
