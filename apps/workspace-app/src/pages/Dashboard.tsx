import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api, authApi } from '@/lib/api';
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

// P20-C: Email verification banner state
function useEmailVerified() {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('ww_evbanner_dismissed') === '1',
  );

  useEffect(() => {
    authApi.me()
      .then(profile => setVerified(profile.emailVerifiedAt != null))
      .catch(() => setVerified(null));
  }, []);

  const sendVerification = async () => {
    setSending(true);
    try {
      await authApi.sendVerification();
      alert('Verification email sent — check your inbox.');
    } catch {
      alert('Failed to send verification email. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  const dismiss = () => {
    sessionStorage.setItem('ww_evbanner_dismissed', '1');
    setDismissed(true);
  };

  return { verified, sending, dismissed, sendVerification, dismiss };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading } = useDashboardData(user?.workspaceId);
  const { verified, sending, dismissed, sendVerification, dismiss } = useEmailVerified();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const isFreePlan = !loading && data.billing?.plan === 'free';
  const showVerifyBanner = verified === false && !dismissed;

  const statCards = [
    {
      label: 'Revenue today',
      value: data.summary ? formatNaira(data.summary.totalKobo) : '—',
      icon: '💰',
      locked: isFreePlan,
    },
    {
      label: 'Orders today',
      value: data.summary ? String(data.summary.orderCount) : '—',
      icon: '🛒',
      locked: isFreePlan,
    },
    {
      label: 'Active offerings',
      value: data.productCount !== null ? String(data.productCount) : '—',
      icon: '📦',
      locked: false,
    },
    {
      label: 'Plan',
      value: data.billing
        ? `${data.billing.plan.charAt(0).toUpperCase()}${data.billing.plan.slice(1)}`
        : '—',
      icon: '💳',
      locked: false,
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
              {loading
                ? <span style={{ color: '#d1d5db' }}>…</span>
                : stat.locked
                  ? <span style={{ color: '#d1d5db' }} title="Upgrade to access Commerce metrics">—</span>
                  : stat.value}
            </div>
            <div style={styles.statLabel}>{stat.label}</div>
          </article>
        ))}
      </section>

      {/* P20-C: Email verification banner — shown when emailVerifiedAt is null */}
      {showVerifyBanner && (
        <div style={styles.verifyBanner} role="alert" aria-label="Email verification required">
          <div style={styles.upgradeBannerInner}>
            <div style={{ fontSize: 24, marginRight: 12, flexShrink: 0 }} aria-hidden="true">📧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 2 }}>
                Verify your email address
              </div>
              <div style={{ fontSize: 13, color: '#b45309', lineHeight: 1.5 }}>
                Confirm your email to secure your account and receive important notifications.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
              <button
                onClick={() => void sendVerification()}
                disabled={sending}
                style={{
                  background: '#92400e', color: '#fff', border: 'none', cursor: sending ? 'not-allowed' : 'pointer',
                  padding: '9px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, minHeight: 40,
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? 'Sending…' : 'Send verification email'}
              </button>
              <button
                onClick={dismiss}
                aria-label="Dismiss email verification banner"
                style={{
                  background: 'transparent', border: '1px solid #d97706', color: '#92400e',
                  cursor: 'pointer', padding: '9px 12px', borderRadius: 8, fontWeight: 600, fontSize: 13, minHeight: 40,
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* P19-E: Free-plan upgrade prompt — visible when on free plan after data loads */}
      {isFreePlan && (
        <div style={styles.upgradeBanner} role="complementary" aria-label="Plan upgrade prompt">
          <div style={styles.upgradeBannerInner}>
            <div style={{ fontSize: 28, marginRight: 16, flexShrink: 0 }} aria-hidden="true">🚀</div>
            <div style={{ flex: 1 }}>
              <div style={styles.upgradeTitle}>Revenue & sales metrics require the Growth plan</div>
              <div style={styles.upgradeDesc}>
                Your free plan includes the Discovery layer only. Upgrade to Growth to unlock the
                Commerce layer — point-of-sale, revenue tracking, orders, and advanced analytics.
              </div>
            </div>
            <Link
              to="/settings"
              style={styles.upgradeBtn}
              aria-label="Go to Settings to upgrade your plan"
            >
              Upgrade plan
            </Link>
          </div>
        </div>
      )}

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
          ) : isFreePlan ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Sales history is available on the Growth plan.{' '}
              <Link to="/settings" style={{ color: '#0F4C81', fontWeight: 600 }}>Upgrade to unlock</Link>
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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 24 } as React.CSSProperties,
  statCard: {
    background: '#fff', borderRadius: 12, padding: '20px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0',
  } as React.CSSProperties,
  statValue: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 2 } as React.CSSProperties,
  statLabel: { fontSize: 13, color: '#6b7280' } as React.CSSProperties,
  verifyBanner: {
    marginBottom: 16, borderRadius: 12, overflow: 'hidden',
    border: '1px solid #fcd34d', background: '#fffbeb',
  } as React.CSSProperties,
  upgradeBanner: {
    marginBottom: 28, borderRadius: 12, overflow: 'hidden',
    border: '1px solid #bfdbfe', background: '#eff6ff',
  } as React.CSSProperties,
  upgradeBannerInner: {
    display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 12, flexWrap: 'wrap',
  } as React.CSSProperties,
  upgradeTitle: { fontSize: 14, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 } as React.CSSProperties,
  upgradeDesc: { fontSize: 13, color: '#3b82f6', lineHeight: 1.5 } as React.CSSProperties,
  upgradeBtn: {
    flexShrink: 0, background: '#0F4C81', color: '#fff', padding: '10px 20px',
    borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13,
    whiteSpace: 'nowrap', minHeight: 44, display: 'flex', alignItems: 'center',
  } as React.CSSProperties,
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
