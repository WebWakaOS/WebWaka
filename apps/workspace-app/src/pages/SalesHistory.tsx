/**
 * B1-2: Sales History Page
 * - Date-range filter (today / 7d / 30d / custom)
 * - Sales table: order ID, date, items, payment method, VAT, total
 * - CSV export (client-side)
 * - Pagination (load more)
 * - Summary bar: total orders + total revenue in range
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError } from '@/lib/api';
import { formatNaira } from '@/lib/currency';

interface SaleRecord {
  id: string;
  created_at: string;
  payment_method: 'cash' | 'card' | 'transfer';
  total_kobo: number;
  vat_kobo: number;
  discount_kobo?: number;
  item_count: number;
  items?: Array<{ name: string; qty: number; price_kobo: number }>;
}

type Range = 'today' | '7d' | '30d' | 'custom';

function toISO(d: Date) { return d.toISOString().slice(0, 10); }
function todayStr() { return toISO(new Date()); }
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}

const PM_LABELS: Record<string, string> = { cash: '💵 Cash', card: '💳 Card', transfer: '🏦 Transfer' };

export default function SalesHistory() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;

  const [range, setRange] = useState<Range>('7d');
  const [dateFrom, setDateFrom] = useState(daysAgo(7));
  const [dateTo, setDateTo] = useState(todayStr());
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [summary, setSummary] = useState<{ total_orders: number; total_revenue: number } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const LIMIT = 20;

  const load = useCallback(async (from: string, to: string, append = false) => {
    if (!workspaceId) return;
    setLoading(true);
    setError('');
    const currentSkip = append ? skip : 0;
    try {
      const res = await api.get<{ sales: SaleRecord[]; has_more: boolean; summary: { total_orders: number; total_revenue: number } }>(
        `/pos-business/sales/${workspaceId}?from=${from}&to=${to}&limit=${LIMIT}&skip=${currentSkip}`,
      );
      setSales(prev => append ? [...prev, ...res.sales] : res.sales);
      setHasMore(res.has_more ?? false);
      if (!append) setSummary(res.summary ?? null);
      setSkip(currentSkip + res.sales.length);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load sales';
      setError(msg);
      // Graceful fallback — show empty state
      if (!append) setSales([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, skip]);

  const applyRange = (r: Range) => {
    setRange(r);
    setSkip(0);
    let from = daysAgo(7);
    let to = todayStr();
    if (r === 'today') { from = todayStr(); to = todayStr(); }
    else if (r === '7d') { from = daysAgo(7); to = todayStr(); }
    else if (r === '30d') { from = daysAgo(30); to = todayStr(); }
    setDateFrom(from);
    setDateTo(to);
    void load(from, to, false);
  };

  useEffect(() => { void load(dateFrom, dateTo, false); }, [workspaceId]); // eslint-disable-line

  // CSV export
  const exportCsv = () => {
    const headers = ['Order ID', 'Date', 'Payment', 'Items', 'Discount', 'VAT', 'Total'];
    const rows = sales.map(s => [
      s.id.slice(0, 12).toUpperCase(),
      new Date(s.created_at).toLocaleDateString('en-NG'),
      s.payment_method,
      s.item_count,
      (s.discount_kobo ?? 0) / 100,
      s.vat_kobo / 100,
      s.total_kobo / 100,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${dateFrom}-to-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>Sales History</h1>
        <button
          onClick={exportCsv}
          disabled={sales.length === 0}
          style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: sales.length === 0 ? 'not-allowed' : 'pointer', opacity: sales.length === 0 ? 0.5 : 1 }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Date range filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['today', '7d', '30d', 'custom'] as Range[]).map(r => (
          <button
            key={r}
            onClick={() => r !== 'custom' ? applyRange(r) : setRange('custom')}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: '1.5px solid', cursor: 'pointer',
              borderColor: range === r ? '#0F4C81' : '#e5e7eb',
              background: range === r ? '#0F4C81' : '#fff',
              color: range === r ? '#fff' : '#374151',
            }}
          >
            {r === 'today' ? 'Today' : r === '7d' ? 'Last 7 days' : r === '30d' ? 'Last 30 days' : 'Custom'}
          </button>
        ))}
        {range === 'custom' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
            <span style={{ color: '#9ca3af', fontSize: 13 }}>to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
            <button
              onClick={() => { setSkip(0); void load(dateFrom, dateTo, false); }}
              style={{ padding: '6px 14px', background: '#0F4C81', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >Apply</button>
          </div>
        )}
      </div>

      {/* Summary bar */}
      {summary && !loading && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 20px' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{formatNaira(summary.total_revenue)}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Total Revenue</div>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 20px' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8' }}>{summary.total_orders}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Total Orders</div>
          </div>
          {summary.total_orders > 0 && (
            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 20px' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#92400e' }}>{formatNaira(Math.round(summary.total_revenue / summary.total_orders))}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Avg. Order</div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Table */}
      {loading && sales.length === 0 ? (
        <div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ height: 52, background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)', backgroundSize: '200% 100%', borderRadius: 8, marginBottom: 8, animation: 'shimmer 1.4s infinite' }} />
          ))}
          <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        </div>
      ) : sales.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No sales in this period</h3>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Try a wider date range, or record your first sale in the POS.</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['Order ID', 'Date & Time', 'Payment', 'Items', 'VAT', 'Total', ''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <>
                    <tr key={sale.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }} onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0F4C81', fontFamily: 'monospace' }}>{sale.id.slice(0, 12).toUpperCase()}</td>
                      <td style={{ padding: '10px 12px', color: '#374151', whiteSpace: 'nowrap' }}>
                        {new Date(sale.created_at).toLocaleDateString('en-NG')}{' '}
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(sale.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>{PM_LABELS[sale.payment_method] ?? sale.payment_method}</td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{sale.item_count} item{sale.item_count !== 1 ? 's' : ''}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{formatNaira(sale.vat_kobo)}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#111827' }}>{formatNaira(sale.total_kobo)}</td>
                      <td style={{ padding: '10px 12px', color: '#9ca3af', fontSize: 12 }}>{expanded === sale.id ? '▲' : '▼'}</td>
                    </tr>
                    {expanded === sale.id && sale.items && (
                      <tr key={`${sale.id}-detail`} style={{ background: '#f9fafb' }}>
                        <td colSpan={7} style={{ padding: '8px 24px 12px' }}>
                          <table style={{ width: '100%', fontSize: 13 }}>
                            <tbody>
                              {sale.items.map((item, idx) => (
                                <tr key={idx}>
                                  <td style={{ padding: '3px 0', color: '#374151' }}>{item.name}</td>
                                  <td style={{ padding: '3px 0', color: '#6b7280', textAlign: 'right' }}>×{item.qty}</td>
                                  <td style={{ padding: '3px 0', color: '#111827', textAlign: 'right', fontWeight: 600 }}>{formatNaira(item.price_kobo * item.qty)}</td>
                                </tr>
                              ))}
                              {sale.discount_kobo && sale.discount_kobo > 0 ? (
                                <tr>
                                  <td colSpan={2} style={{ color: '#059669', paddingTop: 4 }}>Discount</td>
                                  <td style={{ textAlign: 'right', color: '#059669', paddingTop: 4 }}>−{formatNaira(sale.discount_kobo)}</td>
                                </tr>
                              ) : null}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                onClick={() => void load(dateFrom, dateTo, true)}
                disabled={loading}
                style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', color: '#374151' }}
              >
                {loading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
