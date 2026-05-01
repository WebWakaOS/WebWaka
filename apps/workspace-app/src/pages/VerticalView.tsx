/**
 * VerticalView — C3 fix: AI Advisory wired to real SuperAgent /chat API.
 * H10 fix: Compliance data fetched from workspace verticals API.
 */
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { getVerticalMeta, VERTICAL_REGISTRY } from '@/lib/verticals';
import { sendChat } from '@/lib/superagent-api';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';

// ─── Searchable Vertical Selector ──────────────────────────────────────────

function VerticalSelector({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (slug: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const meta = VERTICAL_REGISTRY[value];

  const allVerticals = Object.values(VERTICAL_REGISTRY);
  const filtered = query.trim()
    ? allVerticals.filter(v =>
        v.label.toLowerCase().includes(query.toLowerCase()) ||
        v.category.toLowerCase().includes(query.toLowerCase()),
      )
    : allVerticals;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 220 }}>
      <button
        type="button"
        disabled={disabled}
        aria-label="Select business vertical"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => { setOpen(v => !v); setQuery(''); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 8, border: '1.5px solid #d1d5db',
          background: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: 14, minHeight: 44, minWidth: 220, width: '100%',
          justifyContent: 'space-between', opacity: disabled ? 0.6 : 1,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {meta?.icon && <span aria-hidden="true">{meta.icon}</span>}
          <span style={{ fontWeight: 500 }}>{meta?.label ?? value}</span>
        </span>
        <span aria-hidden="true" style={{ fontSize: 10, color: '#9ca3af' }}>▼</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Business verticals"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, marginTop: 4,
            maxHeight: 320, display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid #f3f4f6' }}>
            <input
              type="text"
              autoFocus
              placeholder="Search verticals…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                width: '100%', border: '1.5px solid #d1d5db', borderRadius: 6,
                padding: '8px 12px', fontSize: 14, outline: 'none',
              }}
              aria-label="Search business verticals"
            />
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>No verticals found</div>
            ) : (
              filtered.map(v => (
                <button
                  key={v.slug}
                  role="option"
                  aria-selected={v.slug === value}
                  type="button"
                  onClick={() => { onChange(v.slug); setOpen(false); setQuery(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 16px', border: 'none', textAlign: 'left',
                    background: v.slug === value ? '#eff6ff' : 'transparent',
                    cursor: 'pointer', fontSize: 14,
                    borderLeft: v.slug === value ? '3px solid #0F4C81' : '3px solid transparent',
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: 16 }}>{v.icon}</span>
                  <div>
                    <div style={{ fontWeight: v.slug === value ? 600 : 400, color: v.slug === value ? '#0F4C81' : '#111827' }}>
                      {v.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{v.category}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}


type Tab = 'overview' | 'advisory' | 'compliance';

interface AdvisoryResult {
  capability: string;
  summary: string;
  sessionId?: string;
  hitlPending?: boolean;
  hitlId?: string;
  wakacu?: number;
}

interface ComplianceItem {
  label: string;
  desc: string;
  icon: string;
  ok: boolean | null;   // null = loading/unknown
}

interface WorkspaceVertical {
  slug: string;
  state: string;
  activated_at: number | null;
}

const DEFAULT_COMPLIANCE: ComplianceItem[] = [
  { icon: '🔐', label: 'NDPR Data Protection',      desc: 'Personal data handled per Nigerian DPR guidelines', ok: null },
  { icon: '📋', label: 'NAFDAC Registration',        desc: 'Food & drug regulatory compliance',                ok: null },
  { icon: '🏠', label: 'CAC Business Registration', desc: 'Corporate Affairs Commission filing',             ok: null },
  { icon: '💸', label: 'FIRS Tax Registration',      desc: 'Federal Inland Revenue Service TIN',             ok: null },
  { icon: '🌍', label: 'SON Product Certification',  desc: 'Standards Organisation of Nigeria',             ok: null },
];

export default function VerticalView() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) ?? 'overview';

  // Determine active vertical from workspace or default
  const [selectedVertical, setSelectedVertical] = useState('palm-oil');
  const [workspaceVertical, setWorkspaceVertical] = useState<WorkspaceVertical | null>(null);
  const [loadingVertical, setLoadingVertical] = useState(false);

  // Advisory state
  const [advisory, setAdvisory] = useState<AdvisoryResult | null>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryError, setAdvisoryError] = useState<string | null>(null);

  // Compliance state
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>(DEFAULT_COMPLIANCE);
  const [complianceLoading, setComplianceLoading] = useState(false);

  const meta = getVerticalMeta(selectedVertical);

  const setTab = (tab: Tab) => setSearchParams({ tab });

  // Load workspace vertical info
  useEffect(() => {
    if (!user?.workspaceId) return;
    setLoadingVertical(true);
    api.get<{ verticals: WorkspaceVertical[] }>(`/workspaces/${user.workspaceId}/verticals`)
      .then(res => {
        const active = res.verticals.find(v => v.state === 'active');
        if (active) {
          setWorkspaceVertical(active);
          setSelectedVertical(active.slug);
        }
      })
      .catch(() => { /* non-blocking — user can still select manually */ })
      .finally(() => setLoadingVertical(false));
  }, [user?.workspaceId]);

  // Load compliance data when tab opened
  useEffect(() => {
    if (activeTab !== 'compliance') return;
    if (!user?.workspaceId) return;
    setComplianceLoading(true);
    api.get<{ vertical: WorkspaceVertical & { requirements?: { key: string; met: boolean }[] } }>(
      `/workspaces/${user.workspaceId}/verticals/${selectedVertical}`,
    )
      .then(res => {
        const reqs = res.vertical?.requirements ?? [];
        // Map backend requirements to display items
        setComplianceItems(
          DEFAULT_COMPLIANCE.map(item => {
            const key = item.label.toLowerCase().replace(/[^a-z]+/g, '_');
            const found = reqs.find(r => r.key.includes(key.split('_')[0]));
            return { ...item, ok: found ? found.met : item.ok };
          }),
        );
      })
      .catch(() => {
        // Fall back to neutral display if endpoint not available
        setComplianceItems(DEFAULT_COMPLIANCE.map(i => ({ ...i, ok: null })));
      })
      .finally(() => setComplianceLoading(false));
  }, [activeTab, selectedVertical, user?.workspaceId]);

  // Real advisory via SuperAgent /chat
  const requestAdvisory = async () => {
    if (!meta?.aiCapability) {
      toast.error('This vertical does not have an AI advisory capability.');
      return;
    }
    setAdvisoryLoading(true);
    setAdvisory(null);
    setAdvisoryError(null);
    try {
      const prompt =
        `You are a business advisor for a ${meta.label} business in Nigeria. ` +
        `Analyse recent sales and operational patterns and provide 3-5 specific, actionable recommendations. ` +
        `Focus on inventory management, pricing strategy, and demand forecasting. ` +
        `Format your response as a summary paragraph followed by a numbered list of recommendations.`;

      const res = await sendChat({
        message: prompt,
        capability: meta.aiCapability,
        vertical: selectedVertical,
      });

      setAdvisory({
        capability: meta.aiCapability,
        summary: res.content,
        sessionId: res.session_id,
        hitlPending: res.hitl_pending,
        hitlId: res.hitl_id,
        wakacu: res.usage?.wakacu_burned,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : 'Advisory request failed. Please try again.';
      setAdvisoryError(msg);
      toast.error(msg);
    } finally {
      setAdvisoryLoading(false);
    }
  };

  return (
    <div style={styles.page} id="main-content">
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span aria-hidden="true" style={{ fontSize: 36 }}>{meta?.icon ?? '🏢'}</span>
          <div>
            <h1 style={styles.heading}>{meta?.label ?? selectedVertical}</h1>
            <p style={styles.subheading}>Vertical profile &amp; AI advisory</p>
          </div>
          {workspaceVertical && (
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20,
              background: '#dcfce7', color: '#166534', fontWeight: 700,
            }}>ACTIVE</span>
          )}
        </div>
        <VerticalSelector
          value={selectedVertical}
          onChange={(slug) => { setSelectedVertical(slug); setAdvisory(null); setAdvisoryError(null); }}
          disabled={loadingVertical}
        />
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
                <div style={{ ...styles.infoValue, color: workspaceVertical ? '#166534' : '#92400e' }}>
                  {workspaceVertical ? 'Active ✓' : 'Not activated'}
                </div>
              </div>
              {workspaceVertical && (
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Vertical</div>
                  <code style={{ fontSize: 13 }}>{workspaceVertical.slug}</code>
                </div>
              )}
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>AI Capability</div>
                <div style={styles.infoValue}>{meta?.aiCapability ?? 'None'}</div>
              </div>
              {workspaceVertical && (
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>State</div>
                  <div style={styles.infoValue}>{workspaceVertical.state}</div>
                </div>
              )}
            </div>
            <div style={styles.sectionCard}>
              <h2 style={styles.cardHeading}>About this vertical</h2>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6 }}>
                Your {meta?.label} vertical profile gives you access to industry-specific
                AI advisory, compliance tracking, and business intelligence tools.
                Activate your vertical to unlock all features.
              </p>
              {!workspaceVertical && (
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12 }}>
                  To activate this vertical, contact your platform admin or go to Settings.
                </p>
              )}
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
                    Request real AI-generated business insights based on your workspace data.
                    All analysis is NDPR-compliant — personal data is never sent to AI systems.
                  </p>
                  {advisory?.hitlPending && (
                    <div role="alert" style={styles.hitlBanner}>
                      ⚠️ <strong>Human-in-the-loop required</strong> — this advisory involves sensitive
                      data and requires human review before action. Check the HITL queue.
                    </div>
                  )}
                  {advisoryError && (
                    <div role="alert" style={{ ...styles.hitlBanner, background: '#fef2f2', border: '1px solid #fecaca' }}>
                      <strong>Error:</strong> {advisoryError}
                    </div>
                  )}
                  <Button
                    onClick={() => void requestAdvisory()}
                    loading={advisoryLoading}
                    size="md"
                    disabled={advisoryLoading}
                  >
                    {advisoryLoading ? 'Analysing…' : '🧠 Request advisory'}
                  </Button>
                </div>

                {advisory && (
                  <div style={styles.sectionCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700 }}>Advisory results</h3>
                      {advisory.wakacu !== undefined && (
                        <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 8 }}>
                          {advisory.wakacu} WakaCU used
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 14, color: '#374151', lineHeight: 1.7,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {advisory.summary}
                    </div>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 16 }}>
                      Capability: {advisory.capability}
                      {advisory.sessionId && ` · Session: ${advisory.sessionId.slice(0, 8)}…`}
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontStyle: 'italic' }}>
                      AI responses are generated. Verify important information before acting.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'compliance' && (
          <div style={styles.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={styles.cardHeading}>Regulatory compliance</h2>
              {complianceLoading && (
                <span style={{ fontSize: 12, color: '#6b7280' }}>Loading…</span>
              )}
            </div>
            <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {complianceItems.map(item => (
                <div key={item.label} role="listitem" style={styles.complianceItem}>
                  <span aria-hidden="true" style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{item.desc}</div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                    background: item.ok === null ? '#f3f4f6' : item.ok ? '#dcfce7' : '#fef9c3',
                    color: item.ok === null ? '#6b7280' : item.ok ? '#166534' : '#92400e',
                  }}>
                    {item.ok === null ? 'CHECKING' : item.ok ? 'PASS' : 'PENDING'}
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
  complianceItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #f3f4f6' } as React.CSSProperties,
};
