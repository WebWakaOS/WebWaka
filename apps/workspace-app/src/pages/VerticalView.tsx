import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { getVerticalMeta, VERTICAL_REGISTRY } from '@/lib/verticals';
import { toast } from '@/lib/toast';

type Tab = 'overview' | 'advisory' | 'compliance';

interface AdvisoryResult {
  capability: string;
  count: number;
  summary: string;
  recommendations: string[];
  hitl_required?: boolean;
}

export default function VerticalView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) ?? 'overview';
  const [selectedVertical, setSelectedVertical] = useState('palm-oil');
  const [advisory, setAdvisory] = useState<AdvisoryResult | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);

  const meta = getVerticalMeta(selectedVertical);

  const setTab = (tab: Tab) => setSearchParams({ tab });

  const requestAdvisory = async () => {
    setAdvisoryLoading(true);
    setAdvisory(null);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setAdvisory({
        capability: meta?.aiCapability ?? 'GENERAL_ADVISORY',
        count: 12,
        summary: `Based on 12 recent transactions for your ${meta?.label ?? selectedVertical} profile, production efficiency is trending upward this quarter.`,
        recommendations: [
          'Consider restocking raw materials within 3 days based on current throughput.',
          'Peak demand detected on Thursdays — schedule additional labour.',
          'Price of competing products in your LGA has dropped by 8%. Consider a 5% price adjustment.',
        ],
        hitl_required: selectedVertical === 'creche',
      });
    } catch {
      toast.error('Advisory request failed');
    } finally {
      setAdvisoryLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span aria-hidden="true" style={{ fontSize: 36 }}>{meta?.icon ?? '🏢'}</span>
          <div>
            <h1 style={styles.heading}>{meta?.label ?? selectedVertical}</h1>
            <p style={styles.subheading}>Vertical profile &amp; AI advisory</p>
          </div>
        </div>
        <select
          value={selectedVertical}
          onChange={e => setSelectedVertical(e.target.value)}
          style={styles.verticalSelect}
          aria-label="Select vertical"
        >
          {Object.values(VERTICAL_REGISTRY).map(v => (
            <option key={v.slug} value={v.slug}>{v.icon} {v.label}</option>
          ))}
        </select>
      </header>

      <div role="tablist" aria-label="Vertical sections" style={styles.tabs}>
        {(['overview', 'advisory', 'compliance'] as Tab[]).map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setTab(tab)}
            style={{
              ...styles.tab,
              color: activeTab === tab ? '#0F4C81' : '#6b7280',
              borderBottom: activeTab === tab ? '2.5px solid #0F4C81' : '2.5px solid transparent',
              fontWeight: activeTab === tab ? 700 : 400,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-label={activeTab} style={styles.panel}>
        {activeTab === 'overview' && (
          <div>
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Status</div>
                <div style={{ ...styles.infoValue, color: '#166534' }}>Active ✓</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Profile ID</div>
                <code style={{ fontSize: 13 }}>{selectedVertical}_demo_001</code>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>AI Capability</div>
                <div style={styles.infoValue}>{meta?.aiCapability ?? 'None'}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>FSM State</div>
                <div style={styles.infoValue}>active</div>
              </div>
            </div>
            <div style={styles.sectionCard}>
              <h2 style={styles.cardHeading}>About this vertical</h2>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                Your {meta?.label} profile is fully onboarded and active on WebWaka OS.
                All regulatory compliance metadata is up to date. You can access AI-powered
                business advisory from the Advisory tab.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'advisory' && (
          <div>
            {!meta?.aiCapability ? (
              <div style={styles.emptyState}>
                <div aria-hidden="true" style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <p>This vertical does not have an AI advisory capability yet.</p>
              </div>
            ) : (
              <>
                <div style={styles.sectionCard}>
                  <h2 style={styles.cardHeading}>AI Advisory — {meta.aiCapability}</h2>
                  <p style={{ fontSize: 14, color: '#374151', marginBottom: 16, lineHeight: 1.6 }}>
                    Request AI-generated business insights based on your anonymised trading data.
                    All analysis is NDPR-compliant — personal data is never sent to AI systems.
                  </p>
                  {advisory?.hitl_required && (
                    <div role="alert" style={styles.hitlBanner}>
                      ⚠️ <strong>Human-in-the-loop required</strong> — this advisory involves sensitive data and requires human review before action.
                    </div>
                  )}
                  <Button onClick={requestAdvisory} loading={advisoryLoading} size="md">
                    {advisoryLoading ? 'Analysing…' : '🧠 Request advisory'}
                  </Button>
                </div>

                {advisory && (
                  <div style={styles.sectionCard}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Advisory results</h3>
                    <p style={{ fontSize: 14, color: '#374151', marginBottom: 16, lineHeight: 1.6 }}>
                      {advisory.summary}
                    </p>
                    <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#374151' }}>Recommendations</h4>
                    <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {advisory.recommendations.map((rec, i) => (
                        <li key={i} style={styles.recommendation}>
                          <span aria-hidden="true" style={{ fontSize: 18 }}>💡</span>
                          <span style={{ fontSize: 14, color: '#374151' }}>{rec}</span>
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 16 }}>
                      Data points analysed: {advisory.count} · Capability: {advisory.capability}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div style={styles.sectionCard}>
            <h2 style={styles.cardHeading}>Regulatory compliance</h2>
            <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {COMPLIANCE_ITEMS.map(item => (
                <div key={item.label} role="listitem" style={styles.complianceItem}>
                  <span aria-hidden="true" style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{item.desc}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: item.ok ? '#dcfce7' : '#fef9c3', color: item.ok ? '#166534' : '#92400e' }}>
                    {item.ok ? 'PASS' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const COMPLIANCE_ITEMS = [
  { icon: '🔐', label: 'NDPR Data Protection',       desc: 'Personal data handled per Nigerian DPR guidelines', ok: true },
  { icon: '📋', label: 'NAFDAC Registration',         desc: 'Food & drug regulatory compliance', ok: true },
  { icon: '🏛️',  label: 'CAC Business Registration',  desc: 'Corporate Affairs Commission filing', ok: true },
  { icon: '💸', label: 'FIRS Tax Registration',       desc: 'Federal Inland Revenue Service TIN', ok: false },
  { icon: '🌍', label: 'SON Product Certification',   desc: 'Standards Organisation of Nigeria', ok: false },
];

const styles = {
  page: { padding: '24px 20px', maxWidth: 900, margin: '0 auto' } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 } as React.CSSProperties,
  heading: { fontSize: 24, fontWeight: 700, color: '#111827' } as React.CSSProperties,
  subheading: { fontSize: 14, color: '#6b7280' } as React.CSSProperties,
  verticalSelect: { padding: '10px 14px', borderRadius: 8, border: '1.5px solid #d1d5db', fontSize: 14, minHeight: 44, background: '#fff', cursor: 'pointer' } as React.CSSProperties,
  tabs: { display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: 24 } as React.CSSProperties,
  tab: { padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, minHeight: 44, transition: 'all 0.15s ease' } as React.CSSProperties,
  panel: {} as React.CSSProperties,
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 } as React.CSSProperties,
  infoCard: { background: '#fff', borderRadius: 10, padding: '16px', border: '1px solid #e5e7eb' } as React.CSSProperties,
  infoLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 6 },
  infoValue: { fontSize: 15, fontWeight: 700, color: '#111827' } as React.CSSProperties,
  sectionCard: { background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e5e7eb', marginBottom: 16 } as React.CSSProperties,
  cardHeading: { fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 12 } as React.CSSProperties,
  hitlBanner: { background: '#fef9c3', border: '1px solid #fbbf24', borderRadius: 8, padding: '12px 16px', fontSize: 14, marginBottom: 16 } as React.CSSProperties,
  emptyState: { textAlign: 'center' as const, padding: '64px 20px', color: '#9ca3af' },
  recommendation: { display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f8f9fa', borderRadius: 8, padding: '12px 14px' } as React.CSSProperties,
  complianceItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f3f4f6' } as React.CSSProperties,
};
