import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatNaira } from '@/lib/currency';

interface BillingStatus {
  plan: string;
  status: string;
  days_until_expiry?: number | null;
}

interface SalesSummary {
  orderCount: number;
  totalKobo: number;
}

interface ProductCounts {
  count: number;
}

interface SaleRow {
  id: string;
  total_kobo: number;
  payment_method: string;
  created_at: number;
}

interface SalesResponse {
  sales: SaleRow[];
  count: number;
}

interface DashboardData {
  billing: BillingStatus | null;
  summary: SalesSummary | null;
  productCount: number | null;
  recentSales: SaleRow[];
}

function useDashboardData(workspaceId: string | undefined) {
  const [data, setData] = useState<DashboardData>({
    billing: null,
    summary: null,
    productCount: null,
    recentSales: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.allSettled([
      api.get<BillingStatus>('/billing/status'),
      api.get<{ date: string } & SalesSummary>(`/pos-business/sales/${workspaceId}/summary`),
      api.get<ProductCounts>(`/pos-business/products/${workspaceId}`),
      api.get<SalesResponse>(`/pos-business/sales/${workspaceId}?limit=5`),
    ]).then(([billingRes, summaryRes, productsRes, salesRes]) => {
      setData({
        billing: billingRes.status === 'fulfilled' ? billingRes.value : null,
        summary: summaryRes.status === 'fulfilled' ? summaryRes.value : null,
        productCount: productsRes.status === 'fulfilled' ? productsRes.value.count : null,
        recentSales: salesRes.status === 'fulfilled' ? salesRes.value.sales.slice(0, 5) : [],
      });
      setLoading(false);
    });
  }, [workspaceId]);

  return { data, loading };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useDashboardData(user?.workspaceId);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    {
      label: 'Revenue today',
      value: data.summary ? formatNaira(data.summary.totalKobo) : '—',
      icon: '💰',
    },
    {
      label: 'Orders today',
      value: data.summary ? String(data.summary.orderCount) : '—',
      icon: '🛒',
    },
    {
      label: 'Active offerings',
      value: data.productCount !== null ? String(data.productCount) : '—',
      icon: '📦',
    },
    {
      label: 'Plan',
      value: data.billing
        ? `${data.billing.plan.charAt(0).toUpperCase()}${data.billing.plan.slice(1)}`
        : '—',
      icon: '💳',
    },
  ];

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>{greeting} 👋</h1>
          <p style={styles.subheading}>Here's what's happening with your business today.</p>
        </div>
        <div style={styles.tenantBadge}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Tenant</span>
          <code style={{ fontSize: 12, color: '#0F4C81', fontWeight: 600 }}>{user?.tenantId ?? '—'}</code>
          {data.billing && (
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 10, marginTop: 2,
              background: data.billing.status === 'active' ? '#dcfce7' : '#fee2e2',
              color: data.billing.status === 'active' ? '#166534' : '#991b1b',
              fontWeight: 600,
            }}>
              {data.billing.status}
            </span>
          )}
        </div>
      </header>

      <section aria-label="Key metrics" style={styles.statsGrid}>
        {statCards.map(stat => (
          <article key={stat.label} style={styles.statCard}>
            <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">{stat.icon}</div>
            <div style={styles.statValue}>
              {loading ? <span style={{ color: '#d1d5db' }}>…</span> : stat.value}
            </div>
            <div style={styles.statLabel}>{stat.label}</div>
          </article>
        ))}
      </section>

      <section aria-label="Quick actions" style={styles.section}>
        <h2 style={styles.sectionHeading}>Quick actions</h2>
        <div style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <Link key={action.label} to={action.href} style={styles.actionCard}>
              <span aria-hidden="true" style={{ fontSize: 32 }}>{action.icon}</span>
              <span style={styles.actionLabel}>{action.label}</span>
              <span style={styles.actionDesc}>{action.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Recent sales" style={styles.section}>
        <h2 style={styles.sectionHeading}>Recent sales</h2>
        <div style={styles.activityList} role="list">
          {loading ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Loading…
            </div>
          ) : data.recentSales.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              No sales recorded yet.{' '}
              <Link to="/pos" style={{ color: '#0F4C81', fontWeight: 600 }}>Make a sale</Link>
            </div>
          ) : (
            data.recentSales.map(sale => (
              <div key={sale.id} role="listitem" style={styles.activityItem}>
                <span aria-hidden="true" style={{ fontSize: 20 }}>🛒</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>
                    Sale via {sale.payment_method}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {new Date(sale.created_at * 1000).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#166534' }}>
                  {formatNaira(sale.total_kobo)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

const QUICK_ACTIONS = [
  { icon: '🛒', label: 'New sale',        desc: 'Open POS terminal',     href: '/pos' },
  { icon: '📦', label: 'Add offering',    desc: 'Create new product',    href: '/offerings/new' },
  { icon: '🏢', label: 'Vertical view',   desc: 'View business profile', href: '/vertical' },
  { icon: '📊', label: 'AI Advisory',     desc: 'Request AI insights',   href: '/vertical?tab=advisory' },
];

const styles = {
  page: { padding: '24px 20px', maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 } as React.CSSProperties,
  heading: { fontSize: 26, fontWeight: 700, color: '#111827', marginBottom: 4 } as React.CSSProperties,
  subheading: { fontSize: 14, color: '#6b7280' } as React.CSSProperties,
  tenantBadge: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 } as React.CSSProperties,
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 } as React.CSSProperties,
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
  } as React.CSSProperties,
  statValue: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 } as React.CSSProperties,
  statLabel: { fontSize: 13, color: '#6b7280' } as React.CSSProperties,
  section: { marginBottom: 32 } as React.CSSProperties,
  sectionHeading: { fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 14 } as React.CSSProperties,
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 } as React.CSSProperties,
  actionCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    background: '#fff', borderRadius: 12, padding: '20px 16px', textDecoration: 'none',
    border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    transition: 'box-shadow 0.2s ease',
    minHeight: 44,
  } as React.CSSProperties,
  actionLabel: { fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'center' } as React.CSSProperties,
  actionDesc: { fontSize: 11, color: '#9ca3af', textAlign: 'center' } as React.CSSProperties,
  activityList: { background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' } as React.CSSProperties,
  activityItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    borderBottom: '1px solid #f3f4f6', minHeight: 60,
  } as React.CSSProperties,
};
