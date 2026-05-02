import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { api, authApi } from '@/lib/api';
import { formatNaira } from '@/lib/currency';
import { toast } from '@/lib/toast';
import { SparklineChart } from '@/components/ui/SparklineChart';
import { ProgressChecklist } from '@/components/ui/ProgressChecklist';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { t } from '@/lib/i18n';
import { PilotFeedbackWidget } from '@/components/PilotFeedbackWidget';
import { usePilotFlag } from '@/hooks/usePilotFlag';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface TrendDay {
  date: string;
  orderCount: number;
  totalKobo: number;
}

interface TrendResponse {
  days: number;
  trend: TrendDay[];
  deltaKobo: number;
  deltaOrders: number;
}

interface TopProduct {
  name: string;
  id: string;
  units_sold: number;
  total_qty: number;
  total_kobo: number;
}

interface TopProductsResponse {
  topProducts: TopProduct[];
  days: number;
}

interface DashboardData {
  billing: BillingStatus | null;
  summary: SalesSummary | null;
  productCount: number | null;
  recentSales: SaleRow[];
  trend7: TrendDay[];
  deltaKobo: number;
  deltaOrders: number;
  topProducts: TopProduct[];
  fetchedAt: number | null;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useDashboardData(workspaceId: string | undefined) {
  const [data, setData] = useState<DashboardData>({
    billing: null, summary: null, productCount: null, recentSales: [],
    trend7: [], deltaKobo: 0, deltaOrders: 0, topProducts: [], fetchedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [partialError, setPartialError] = useState(false);
  const isOnline = useOnlineStatus();

  const loadData = useCallback(() => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    setPartialError(false);

    Promise.allSettled([
      api.get<BillingStatus>('/billing/status'),
      api.get<{ date: string } & SalesSummary>(`/pos-business/sales/${workspaceId}/summary`),
      api.get<ProductCounts>(`/pos-business/products/${workspaceId}`),
      api.get<SalesResponse>(`/pos-business/sales/${workspaceId}?limit=5`),
      api.get<TrendResponse>(`/pos-business/sales/${workspaceId}/trend?days=7`),
      api.get<TopProductsResponse>(`/pos-business/sales/${workspaceId}/top-products?limit=3`),
    ]).then(([billingRes, summaryRes, productsRes, salesRes, trendRes, topRes]) => {
      const anyFailed = [billingRes, summaryRes, productsRes, salesRes].some(r => r.status === 'rejected');
      if (anyFailed) {
        setPartialError(true);
        toast.error('Some dashboard data failed to load.');
      }
      setData({
        billing: billingRes.status === 'fulfilled' ? billingRes.value : null,
        summary: summaryRes.status === 'fulfilled' ? summaryRes.value : null,
        productCount: productsRes.status === 'fulfilled' ? productsRes.value.count : null,
        recentSales: salesRes.status === 'fulfilled' ? salesRes.value.sales.slice(0, 5) : [],
        trend7: trendRes.status === 'fulfilled' ? trendRes.value.trend : [],
        deltaKobo: trendRes.status === 'fulfilled' ? trendRes.value.deltaKobo : 0,
        deltaOrders: trendRes.status === 'fulfilled' ? trendRes.value.deltaOrders : 0,
        topProducts: topRes.status === 'fulfilled' ? topRes.value.topProducts : [],
        fetchedAt: Date.now(),
      });
      setLoading(false);
    });
  }, [workspaceId]);

  useEffect(() => { loadData(); }, [loadData]);

  return { data, loading, partialError, isOnline, reload: loadData };
}

function useEmailVerified() {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('ww_evbanner_dismissed') === '1',
  );

  useEffect(() => {
    authApi.me().then(profile => setVerified(profile.emailVerifiedAt != null)).catch(() => setVerified(null));
  }, []);

  const sendVerification = async () => {
    setSending(true);
    try {
      await authApi.sendVerification();
      toast.success('Verification email sent — check your inbox.');
    } catch {
      toast.error('Failed to send verification email. Please try again later.');
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

// Push notification prompt — shown after 3+ sales if not yet enabled
function usePushPrompt(totalOrders: number | null) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('ww_push_prompt_dismissed') === '1'
  );

  useEffect(() => {
    if (dismissed) return;
    if (totalOrders === null || totalOrders < 3) return;
    if ('Notification' in window && Notification.permission === 'default') {
      setShow(true);
    }
  }, [totalOrders, dismissed]);

  const requestPush = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      toast.success("Push notifications enabled \u2014 you'll get sale alerts!");
    }
    setShow(false);
    localStorage.setItem('ww_push_prompt_dismissed', '1');
    setDismissed(true);
  };

  const dismiss = () => {
    localStorage.setItem('ww_push_prompt_dismissed', '1');
    setDismissed(true);
    setShow(false);
  };

  return { show, requestPush, dismiss };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DeltaBadge({ value, unit = 'kobo', compact = false }: { value: number; unit?: 'kobo' | 'count'; compact?: boolean }) {
  if (value === 0) return <span style={{ fontSize: 11, color: 'var(--ww-text-muted, #6b7280)', fontWeight: 500 }}>same as yesterday</span>;
  const positive = value > 0;
  const color = positive ? '#059669' : '#dc2626';
  const arrow = positive ? '↑' : '↓';
  const display = unit === 'kobo'
    ? formatNaira(Math.abs(value), { compact: true })
    : `${Math.abs(value)} ${compact ? '' : 'order'}${Math.abs(value) !== 1 && !compact ? 's' : ''}`;

  return (
    <span style={{
      fontSize: 11, fontWeight: 600, color,
      display: 'inline-flex', alignItems: 'center', gap: 2,
    }}>
      {arrow} {display} vs yesterday
    </span>
  );
}

function TopProductsCard({ products }: { products: TopProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-label="Top products" style={styles.section}>
      <h2 style={styles.sectionHeading}>Top selling (last 7 days)</h2>
      <div style={styles.activityList} role="list">
        {products.map((p, i) => (
          <div key={p.id} role="listitem" style={styles.activityItem}>
            <span style={{
              width: 24, height: 24, borderRadius: '50%', background: '#0F4C81',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {i + 1}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ww-text, #111827)' }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ww-text-muted, #6b7280)' }}>
                {p.total_qty} units · {p.units_sold} sales
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F4C81' }}>
              {formatNaira(p.total_kobo, { compact: true })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── USSD Card ────────────────────────────────────────────────────────────────

function UssdCard() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('ww_ussd_card_dismissed') === '1'
  );
  if (dismissed) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d3f6e 0%, #0F4C81 100%)',
      borderRadius: 'var(--ww-radius-lg, 12px)',
      padding: '16px 20px',
      marginBottom: 24,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ fontSize: 32, flexShrink: 0 }} aria-hidden="true">📱</div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
          USSD Access — any phone, any network
        </div>
        <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
          Your customers can find and contact you by dialling{' '}
          <strong style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: 4 }}>
            *384#
          </strong>{' '}
          — no smartphone or internet needed.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
        <Link
          to="/settings"
          style={{
            background: 'rgba(255,255,255,0.2)', color: '#fff',
            padding: '8px 14px', borderRadius: 6, fontSize: 12,
            fontWeight: 600, textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          USSD Settings →
        </Link>
        <button
          onClick={() => { localStorage.setItem('ww_ussd_card_dismissed', '1'); setDismissed(true); }}
          aria-label="Dismiss USSD notice"
          style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1,
          }}
        >×</button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  const { data, loading, isOnline } = useDashboardData(user?.workspaceId);
  const { verified, sending, dismissed, sendVerification, dismiss } = useEmailVerified();
  const push = usePushPrompt(data.summary?.orderCount ?? null);
  // FE-PILOT-01: pilot feedback widget — shown only for pilot tenants
  const { enabled: isPilot } = usePilotFlag('ai_chat_beta', user?.workspaceId);
  const isFirstTxn = (data.summary?.orderCount ?? 0) === 1;
  const [sparkRange, setSparkRange] = useState<'7d' | '30d'>('7d');

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'greeting.morning' : hour < 17 ? 'greeting.afternoon' : 'greeting.evening';
  const greeting = t(greetingKey);

  const isFreePlan = !loading && data.billing?.plan === 'free';
  const showVerifyBanner = verified === false && !dismissed;

  // Offline state
  const asOfStr = data.fetchedAt
    ? new Intl.DateTimeFormat('en-NG', { hour: '2-digit', minute: '2-digit' }).format(data.fetchedAt)
    : null;

  const statCards = [
    {
      label: t('dashboard.revenue_today'),
      value: data.summary ? formatNaira(data.summary.totalKobo) : '—',
      icon: '💰',
      locked: isFreePlan,
      trend: data.trend7.map(d => d.totalKobo),
      delta: <DeltaBadge value={data.deltaKobo} unit="kobo" />,
    },
    {
      label: t('dashboard.orders_today'),
      value: data.summary ? String(data.summary.orderCount) : '—',
      icon: '🛒',
      locked: isFreePlan,
      trend: data.trend7.map(d => d.orderCount),
      delta: <DeltaBadge value={data.deltaOrders} unit="count" />,
    },
    {
      label: t('dashboard.active_offerings'),
      value: data.productCount !== null ? String(data.productCount) : '—',
      icon: '📦',
      locked: false,
      trend: null,
      delta: null,
    },
    {
      label: t('dashboard.plan'),
      value: data.billing
        ? `${data.billing.plan.charAt(0).toUpperCase()}${data.billing.plan.slice(1)}`
        : '—',
      icon: '💳',
      locked: false,
      trend: null,
      delta: null,
    },
  ];

  return (
    <div style={styles.page}>
      {/* Offline indicator */}
      {!isOnline && (
        <div style={{
          background: '#fef3c7', border: '1px solid #fbbf24',
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8,
        }} role="alert">
          <span aria-hidden="true">📡</span>
          <span>
            <strong>Offline mode</strong> — showing cached data.
            {asOfStr && <span style={{ opacity: 0.75 }}> Last updated at {asOfStr}.</span>}
          </span>
        </div>
      )}

      <header style={styles.header}>
        <div>
          <h1 style={styles.heading}>
            {greeting} 👋
            {asOfStr && isOnline && (
              <span style={{ fontSize: 12, color: 'var(--ww-text-subtle, #9ca3af)', fontWeight: 400, marginLeft: 10 }}>
                as of {asOfStr}
              </span>
            )}
          </h1>
          <p style={styles.subheading}>Here's what's happening with your business today.</p>
        </div>
        <div style={styles.tenantBadge}>
          {(user?.businessName) && (
            <span style={{ fontSize: 13, color: 'var(--ww-text, #111827)', fontWeight: 600 }}>{user.businessName}</span>
          )}
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

      {/* Onboarding checklist */}
      <ProgressChecklist />

      {/* USSD card */}
      <UssdCard />

      {/* Stat cards with sparklines */}
      <section aria-label="Key metrics" style={styles.statsGrid}>
        {/* Sparkline range toggle */}
        <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: -8 }}>
          <span style={{ fontSize: 12, color: 'var(--ww-text-muted, #6b7280)', fontWeight: 600 }}>
            KEY METRICS
          </span>
          {!isFreePlan && (
            <div style={{ display: 'flex', gap: 4 }}>
              {(['7d', '30d'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setSparkRange(r)}
                  style={{
                    padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600,
                    background: sparkRange === r ? '#0F4C81' : 'var(--ww-surface-2, #f0f9ff)',
                    color: sparkRange === r ? '#fff' : 'var(--ww-text-muted, #6b7280)',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {statCards.map(stat => (
          <article key={stat.label} style={styles.statCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                {!loading && <div style={{ fontSize: 26, marginBottom: 4 }} aria-hidden="true">{stat.icon}</div>}
                {loading ? (
                  <>
                    {/* A3-2: skeleton shimmer */}
                    <div style={{ width: 90, height: 28, background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)', backgroundSize: '200% 100%', borderRadius: 6, marginBottom: 6, animation: 'shimmer 1.4s infinite' }} />
                    <div style={{ width: 60, height: 12, background: '#f3f4f6', borderRadius: 4 }} />
                    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
                  </>
                ) : (
                  <div style={styles.statValue}>
                    {stat.locked
                      ? <span style={{ color: '#d1d5db' }} title="Upgrade to access Commerce metrics">—</span>
                      : stat.value}
                  </div>
                )}
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
              {!stat.locked && !loading && stat.trend && stat.trend.length >= 2 && (
                <SparklineChart
                  data={stat.trend}
                  width={80}
                  height={36}
                  color="#0F4C81"
                  style={{ flexShrink: 0, marginTop: 4 }}
                />
              )}
            </div>
            {!loading && !stat.locked && stat.delta && (
              <div style={{ marginTop: 6 }}>{stat.delta}</div>
            )}
          </article>
        ))}
      </section>

      {/* Email verification banner */}
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

      {/* Push notification prompt — shown after 3rd sale */}
      {push.show && (
        <div style={{
          marginBottom: 16, borderRadius: 12, overflow: 'hidden',
          border: '1px solid #bfdbfe', background: '#eff6ff',
        }} role="alert">
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 28, flexShrink: 0 }} aria-hidden="true">🔔</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1d4ed8' }}>Enable sale notifications</div>
              <div style={{ fontSize: 13, color: '#3b82f6', lineHeight: 1.5 }}>
                Get instant alerts when sales are recorded, stock is low, or payment is received.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={() => void push.requestPush()} style={{ background: '#0F4C81', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', minHeight: 40 }}>
                Enable alerts
              </button>
              <button onClick={push.dismiss} aria-label="Dismiss" style={{ background: 'transparent', border: '1px solid #93c5fd', color: '#1d4ed8', borderRadius: 8, padding: '9px 12px', fontWeight: 600, fontSize: 13, cursor: 'pointer', minHeight: 40 }}>
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Free-plan upgrade prompt */}
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
            <Link to="/billing" style={styles.upgradeBtn} aria-label="Go to Billing to upgrade your plan">
              Upgrade plan
            </Link>
          </div>
        </div>
      )}

      {/* Top selling products */}
      {!isFreePlan && data.topProducts.length > 0 && (
        <TopProductsCard products={data.topProducts} />
      )}

      {/* Quick actions */}
      <section aria-label="Quick actions" style={styles.section}>
        <h2 style={styles.sectionHeading}>{t('dashboard.quick_actions')}</h2>
        <div style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <Link key={action.labelKey} to={action.href} style={styles.actionCard}>
              <span aria-hidden="true" style={{ fontSize: 32 }}>{action.icon}</span>
              <span style={styles.actionLabel}>{t(action.labelKey)}</span>
              <span style={styles.actionDesc}>{action.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent sales */}
      <section aria-label="Recent sales" style={styles.section}>
        <h2 style={styles.sectionHeading}>{t('dashboard.recent_sales')}</h2>
        <div style={styles.activityList} role="list">
          {loading ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>Loading…</div>
          ) : isFreePlan ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
              Sales history is available on the Growth plan.{' '}
              <Link to="/billing" style={{ color: '#0F4C81', fontWeight: 600 }}>Upgrade to unlock</Link>
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
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ww-text, #111827)' }}>
                    Sale via {sale.payment_method}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ww-text-muted, #6b7280)' }}>
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
  { icon: '🛒', labelKey: 'dashboard.new_sale',      desc: 'Open POS terminal',     href: '/pos' },
  { icon: '📦', labelKey: 'dashboard.add_offering',  desc: 'Create new product',    href: '/offerings/new' },
  { icon: '🏢', labelKey: 'dashboard.vertical_view', desc: 'View business profile', href: '/vertical' },
  { icon: '📊', labelKey: 'dashboard.ai_advisory',   desc: 'Request AI insights',   href: '/vertical?tab=advisory' },
];

const styles = {
  page: { padding: '24px 20px', maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 } as React.CSSProperties,
  heading: { fontSize: 26, fontWeight: 700, color: 'var(--ww-text, #111827)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 0 } as React.CSSProperties,
  subheading: { fontSize: 14, color: 'var(--ww-text-muted, #6b7280)' } as React.CSSProperties,
  tenantBadge: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 } as React.CSSProperties,
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 } as React.CSSProperties,
  statCard: {
    background: 'var(--ww-surface, #fff)', borderRadius: 'var(--ww-radius-lg, 12px)', padding: '18px 18px 14px',
    boxShadow: 'var(--ww-shadow, 0 1px 4px rgba(0,0,0,0.06))', border: '1px solid var(--ww-border, #f0f0f0)',
  } as React.CSSProperties,
  statValue: { fontSize: 22, fontWeight: 700, color: 'var(--ww-text, #111827)', marginBottom: 2 } as React.CSSProperties,
  statLabel: { fontSize: 13, color: 'var(--ww-text-muted, #6b7280)' } as React.CSSProperties,
  verifyBanner: { marginBottom: 16, borderRadius: 12, overflow: 'hidden', border: '1px solid #fcd34d', background: '#fffbeb' } as React.CSSProperties,
  upgradeBanner: { marginBottom: 24, borderRadius: 12, overflow: 'hidden', border: '1px solid #bfdbfe', background: '#eff6ff' } as React.CSSProperties,
  upgradeBannerInner: { display: 'flex', alignItems: 'center', padding: '16px 20px', gap: 12, flexWrap: 'wrap' } as React.CSSProperties,
  upgradeTitle: { fontSize: 14, fontWeight: 700, color: '#1d4ed8', marginBottom: 4 } as React.CSSProperties,
  upgradeDesc: { fontSize: 13, color: '#3b82f6', lineHeight: 1.5 } as React.CSSProperties,
  upgradeBtn: {
    flexShrink: 0, background: '#0F4C81', color: '#fff', padding: '10px 20px',
    borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 13,
    whiteSpace: 'nowrap', minHeight: 44, display: 'flex', alignItems: 'center',
  } as React.CSSProperties,
  section: { marginBottom: 32 } as React.CSSProperties,
  sectionHeading: { fontSize: 17, fontWeight: 700, color: 'var(--ww-text, #111827)', marginBottom: 14 } as React.CSSProperties,
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 } as React.CSSProperties,
  actionCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    background: 'var(--ww-surface, #fff)', borderRadius: 'var(--ww-radius-lg, 12px)', padding: '20px 16px',
    textDecoration: 'none', border: '1px solid var(--ww-border, #e5e7eb)',
    boxShadow: 'var(--ww-shadow, 0 1px 4px rgba(0,0,0,0.04))', transition: 'box-shadow 0.2s ease',
    minHeight: 44,
  } as React.CSSProperties,
  actionLabel: { fontSize: 13, fontWeight: 600, color: 'var(--ww-text, #111827)', textAlign: 'center' } as React.CSSProperties,
  actionDesc: { fontSize: 11, color: 'var(--ww-text-subtle, #9ca3af)', textAlign: 'center' } as React.CSSProperties,
  activityList: { background: 'var(--ww-surface, #fff)', borderRadius: 'var(--ww-radius-lg, 12px)', border: '1px solid var(--ww-border, #e5e7eb)', overflow: 'hidden' } as React.CSSProperties,
  activityItem: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
    borderBottom: '1px solid var(--ww-border, #f3f4f6)', minHeight: 60,
  } as React.CSSProperties,
};
