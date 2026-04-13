import { useAuth } from '@/contexts/AuthContext';
import { formatNaira } from '@/lib/currency';

interface StatCard {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  icon: string;
}

const DEMO_STATS: StatCard[] = [
  { label: 'Revenue today',    value: formatNaira(48_500_00),   delta: '+12%', positive: true,  icon: '💰' },
  { label: 'Orders today',     value: '24',                      delta: '+3',   positive: true,  icon: '🛒' },
  { label: 'Active offerings', value: '18',                      icon: '📦' },
  { label: 'Float balance',    value: formatNaira(250_000_00),   icon: '💳' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
        </div>
      </header>

      <section aria-label="Key metrics" style={styles.statsGrid}>
        {DEMO_STATS.map(stat => (
          <article key={stat.label} style={styles.statCard}>
            <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">{stat.icon}</div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
            {stat.delta && (
              <div style={{ ...styles.statDelta, color: stat.positive ? '#166534' : '#991b1b' }}>
                {stat.delta} vs yesterday
              </div>
            )}
          </article>
        ))}
      </section>

      <section aria-label="Quick actions" style={styles.section}>
        <h2 style={styles.sectionHeading}>Quick actions</h2>
        <div style={styles.actionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <a key={action.label} href={action.href} style={styles.actionCard}>
              <span aria-hidden="true" style={{ fontSize: 32 }}>{action.icon}</span>
              <span style={styles.actionLabel}>{action.label}</span>
              <span style={styles.actionDesc}>{action.desc}</span>
            </a>
          ))}
        </div>
      </section>

      <section aria-label="Recent activity" style={styles.section}>
        <h2 style={styles.sectionHeading}>Recent activity</h2>
        <div style={styles.activityList} role="list">
          {DEMO_ACTIVITY.map((item, i) => (
            <div key={i} role="listitem" style={styles.activityItem}>
              <span aria-hidden="true" style={{ fontSize: 20 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{item.time}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: item.positive ? '#166534' : '#374151' }}>
                {item.amount}
              </div>
            </div>
          ))}
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

const DEMO_ACTIVITY = [
  { icon: '🛒', title: 'Sale #1024 — Tomatoes 5kg', time: '2 min ago', amount: '₦4,500', positive: true },
  { icon: '📦', title: 'Offering updated — Fresh Catfish', time: '15 min ago', amount: '', positive: false },
  { icon: '🛒', title: 'Sale #1023 — Garri 10kg', time: '42 min ago', amount: '₦3,200', positive: true },
  { icon: '💰', title: 'Float top-up received', time: '1 hr ago', amount: '₦50,000', positive: true },
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
  statDelta: { fontSize: 12, marginTop: 4, fontWeight: 500 } as React.CSSProperties,
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
