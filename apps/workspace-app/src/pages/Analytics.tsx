/**
 * Analytics & Reports Page
 * Wave 2 — Batch 1 (A2-3, B3-1 through B3-4)
 *
 * Features:
 * - Revenue trend chart (7 / 30 / 90 day)
 * - Top 10 products by revenue
 * - Customer count + repeat rate
 * - CSV export for accountants
 */
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { formatNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TrendDay {
  date: string;       // YYYY-MM-DD
  orderCount: number;
  totalKobo: number;
}

interface TrendResponse {
  days: number;
  trend: TrendDay[];
  deltaKobo: number;
  deltaOrders: number;
  totalKobo: number;
  totalOrders: number;
}

interface TopProduct {
  id: string;
  name: string;
  units_sold: number;
  total_kobo: number;
}

interface TopProductsResponse {
  topProducts: TopProduct[];
  days: number;
}

interface CustomerSummary {
  total_customers: number;
  repeat_customers: number;
  new_this_period: number;
}

type Period = 7 | 30 | 90;

// ─── Inline SVG Line Chart ────────────────────────────────────────────────────

function LineChart({ data, height = 140, color = '#0F4C81' }: { data: number[]; height?: number; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 600;
  const pad = 8;
  const step = (w - pad * 2) / Math.max(data.length - 1, 1);

  const points = data.map((v, i) => {
    const x = pad + i * step;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = [
    `${pad},${height - pad}`,
    ...data.map((v, i) => {
      const x = pad + i * step;
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    }),
    `${pad + (data.length - 1) * step},${height - pad}`,
  ].join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Last point dot */}
      {data.length > 0 && (() => {
        const last = data[data.length - 1]!;
        const x = pad + (data.length - 1) * step;
        const y = height - pad - ((last - min) / range) * (height - pad * 2);
        return <circle cx={x} cy={y} r="4" fill={color} stroke="#fff" strokeWidth="2" />;
      })()}
    </svg>
  );
}

// ─── Delta badge ─────────────────────────────────────────────────────────────

function DeltaBadge({ delta, unit = '₦' }: { delta: number; unit?: string }) {
  if (delta === 0) return <span style={{ fontSize: 12, color: '#9ca3af' }}>vs prev period</span>;
  const up = delta > 0;
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '2px 7px', borderRadius: 999,
      background: up ? '#f0fdf4' : '#fff5f5',
      color: up ? '#16a34a' : '#dc2626',
    }}>
      {up ? '↑' : '↓'} {unit}{Math.abs(delta / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 })}
    </span>
  );
}

// ─── CSV export helpers ───────────────────────────────────────────────────────

function exportTrendCSV(trend: TrendDay[], period: number) {
  const headers = ['Date', 'Orders', 'Revenue (₦)'];
  const rows = trend.map(d => [d.date, d.orderCount, (d.totalKobo / 100).toFixed(2)]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `revenue_${period}d_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportProductsCSV(products: TopProduct[]) {
  const headers = ['Product', 'Units Sold', 'Revenue (₦)'];
  const rows = products.map(p => [`"${p.name.replace(/"/g, '""')}"`, p.units_sold, (p.total_kobo / 100).toFixed(2)]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `top_products_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Analytics() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;

  const [period, setPeriod] = useState<Period>(30);
  const [trend, setTrend] = useState<TrendResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [trendRes, topRes] = await Promise.allSettled([
        api.get<TrendResponse>(`/pos-business/sales/${workspaceId}/trend?days=${period}`),
        api.get<TopProductsResponse>(`/pos-business/sales/${workspaceId}/top-products?days=${period}&limit=10`),
        // customers summary endpoint — may not exist yet, handled gracefully
      ]);
      if (trendRes.status === 'fulfilled') setTrend(trendRes.value);
      if (topRes.status === 'fulfilled') setTopProducts(topRes.value.topProducts ?? []);
      // Try customer summary
      try {
        const custRes = await api.get<CustomerSummary>(`/pos-business/customers/${workspaceId}/summary?days=${period}`);
        setCustomers(custRes);
      } catch {
        setCustomers(null);
      }
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, period]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalRevenue = trend?.totalKobo ?? 0;
  const totalOrders = trend?.totalOrders ?? 0;
  const avgOrderKobo = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const trendValues = (trend?.trend ?? []).map(d => d.totalKobo / 100);

  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 12, padding: '20px 24px',
    border: '1px solid #e5e7eb', flex: 1, minWidth: 160,
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div id="main-content" style={{ padding: '24px 24px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>Analytics & Reports</h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>Revenue, sales, and product performance</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Period selector */}
          {([7, 30, 90] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
              border: '1.5px solid',
              borderColor: period === p ? '#0F4C81' : '#e5e7eb',
              background: period === p ? '#eff6ff' : '#fff',
              color: period === p ? '#0F4C81' : '#6b7280',
              cursor: 'pointer',
            }}>
              {p}d
            </button>
          ))}
          <Button variant="secondary" onClick={() => trend && exportTrendCSV(trend.trend, period)}>
            ⬇ Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: '#9ca3af' }}>Loading analytics…</div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Revenue ({period}d)</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{formatNaira(totalRevenue)}</div>
              <div style={{ marginTop: 6 }}><DeltaBadge delta={trend?.deltaKobo ?? 0} /></div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Orders ({period}d)</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{totalOrders.toLocaleString()}</div>
              <div style={{ marginTop: 6 }}><DeltaBadge delta={trend?.deltaOrders ?? 0} unit="" /></div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Avg Order Value</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{formatNaira(avgOrderKobo)}</div>
            </div>
            {customers && (
              <div style={cardStyle}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Customers ({period}d)</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#111827' }}>{customers.total_customers.toLocaleString()}</div>
                {customers.repeat_customers > 0 && (
                  <div style={{ marginTop: 6, fontSize: 12, color: '#059669', fontWeight: 600 }}>
                    {Math.round((customers.repeat_customers / customers.total_customers) * 100)}% repeat
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Revenue chart */}
          {trendValues.length > 1 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Revenue Trend</h2>
                  <p style={{ color: '#9ca3af', fontSize: 12, marginTop: 2 }}>Daily revenue over last {period} days</p>
                </div>
              </div>
              <LineChart data={trendValues} height={140} color="#0F4C81" />
              {/* X-axis labels: first, middle, last */}
              {trend && trend.trend.length > 2 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#9ca3af' }}>
                  <span>{trend.trend[0]?.date}</span>
                  <span>{trend.trend[Math.floor(trend.trend.length / 2)]?.date}</span>
                  <span>{trend.trend[trend.trend.length - 1]?.date}</span>
                </div>
              )}
            </div>
          )}

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Top Products by Revenue</h2>
                <Button variant="secondary" onClick={() => exportProductsCSV(topProducts)}>⬇ CSV</Button>
              </div>
              <div>
                {topProducts.map((p, i) => {
                  const maxRevenue = topProducts[0]?.total_kobo ?? 1;
                  const pct = Math.round((p.total_kobo / maxRevenue) * 100);
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < topProducts.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <div style={{ width: 24, fontSize: 13, fontWeight: 700, color: i < 3 ? '#d97706' : '#9ca3af', textAlign: 'center' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ marginTop: 4, height: 5, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#0F4C81', borderRadius: 99 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{formatNaira(p.total_kobo)}</div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.units_sold} units</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && totalOrders === 0 && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
              <p style={{ color: '#6b7280', fontSize: 15 }}>No sales data for this period yet.</p>
              <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>Start making sales on the POS to see your analytics.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
