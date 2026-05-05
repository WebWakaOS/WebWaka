/**
 * Shared micro-components — Partner Admin SPA.
 * Purely presentational, no API calls.
 */
import type { CSSProperties, ReactNode } from 'react';

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 20, color = 'var(--green)' }: { size?: number; color?: string }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      border: '2px solid var(--border)',
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'pa-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ─── PageLoader ───────────────────────────────────────────────────────────────

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '3rem 0', color: 'var(--muted)', fontSize: '0.875rem',
    }}>
      <Spinner />
      {label}
    </div>
  );
}

// ─── ErrorMsg ─────────────────────────────────────────────────────────────────

export function ErrorMsg({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{
      background: 'rgba(127,29,29,0.2)', border: '1px solid rgba(220,38,38,0.4)',
      borderRadius: 10, padding: '0.875rem 1.125rem',
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      marginBottom: '1rem',
    }}>
      <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: 1 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <p style={{ color: '#fca5a5', fontSize: '0.875rem', lineHeight: 1.5 }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: '0.5rem', padding: '0.3rem 0.75rem',
              background: 'transparent', border: '1px solid rgba(220,38,38,0.4)',
              borderRadius: 6, color: '#fca5a5', fontSize: '0.8125rem',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({
  icon, title, description, action,
}: {
  icon: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div style={{
      background: 'var(--dark)', border: '1.5px dashed var(--border)',
      borderRadius: 14, padding: '2.5rem 1.5rem', textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{
        color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6,
        maxWidth: 360, margin: '0 auto',
      }}>
        {description}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: '1.25rem', padding: '0.625rem 1.375rem',
            background: 'var(--green)', color: '#fff',
            border: 'none', borderRadius: 8, fontWeight: 700,
            fontSize: '0.875rem', cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { bg: string; color: string }> = {
  active:      { bg: 'rgba(22,163,74,0.15)',   color: '#4ade80' },
  paid:        { bg: 'rgba(22,163,74,0.15)',   color: '#4ade80' },
  suspended:   { bg: 'rgba(220,38,38,0.15)',   color: '#f87171' },
  deactivated: { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' },
  pending:     { bg: 'rgba(217,119,6,0.15)',   color: '#fbbf24' },
  processing:  { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status.toLowerCase()] ?? { bg: 'rgba(107,114,128,0.15)', color: '#9ca3af' };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.05em', background: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

export function SectionHeader({
  title, description, action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
    }}>
      <div>
        <h1 style={{ fontWeight: 700, fontSize: '1.3125rem', lineHeight: 1.2 }}>{title}</h1>
        {description && (
          <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 4 }}>{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: 'var(--dark)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '1.25rem',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── InfoRow ──────────────────────────────────────────────────────────────────

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0.625rem 0', borderBottom: '1px solid var(--border)',
      gap: '1rem', flexWrap: 'wrap',
    }}>
      <span style={{ color: 'var(--muted)', fontSize: '0.8125rem', fontWeight: 500 }}>{label}</span>
      <span style={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', danger = false,
  onConfirm, onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel:  () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '1.75rem', maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        animation: 'pa-fade-in 0.15s ease',
      }}>
        <h3 id="confirm-title" style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.625rem' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--muted)', fontWeight: 600, fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1.125rem',
              background: danger ? '#dc2626' : 'var(--green)',
              color: '#fff', border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export function Toast({
  message, type = 'success', onDismiss,
}: {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
}) {
  const cfg = {
    success: { bg: 'rgba(20,83,45,0.95)',  border: '#16a34a', icon: '✅' },
    error:   { bg: 'rgba(45,10,10,0.95)',  border: '#dc2626', icon: '❌' },
    info:    { bg: 'rgba(12,26,46,0.95)',  border: '#1e40af', icon: 'ℹ️' },
  }[type];

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 12, padding: '0.875rem 1.125rem',
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        maxWidth: 360, animation: 'pa-slide-up 0.2s ease',
        backdropFilter: 'blur(4px)',
      }}
    >
      <span style={{ flexShrink: 0 }}>{cfg.icon}</span>
      <span style={{ flex: 1, fontSize: '0.875rem', lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        style={{
          background: 'none', border: 'none', color: 'var(--muted)',
          cursor: 'pointer', fontSize: '1.125rem', lineHeight: 1, padding: 2, flexShrink: 0,
        }}
      >×</button>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function Tabs({
  tabs, active, onChange,
}: {
  tabs: { id: string; label: string; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div style={{
      display: 'flex', gap: 0, borderBottom: '1px solid var(--border)',
      marginBottom: '1.5rem', overflowX: 'auto',
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '0.625rem 1rem', background: 'none', border: 'none',
            borderBottom: active === t.id ? '2px solid var(--green)' : '2px solid transparent',
            color: active === t.id ? 'var(--green)' : 'var(--muted)',
            fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
            whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.375rem',
            transition: 'color 0.15s',
          }}
        >
          {t.label}
          {(t.badge ?? 0) > 0 && (
            <span style={{
              background: '#dc2626', color: '#fff', borderRadius: 20,
              padding: '0px 6px', fontSize: '0.65rem', fontWeight: 700,
            }}>
              {t.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export function Pagination({
  page, hasMore, onPrev, onNext,
}: {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const btnStyle: CSSProperties = {
    padding: '0.4rem 0.875rem', background: 'var(--dark)',
    border: '1px solid var(--border)', borderRadius: 7,
    color: 'var(--text)', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
  };
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
      <button onClick={onPrev} disabled={page <= 1} style={btnStyle}>← Prev</button>
      <span style={{ color: 'var(--muted)', fontSize: '0.8125rem' }}>Page {page}</span>
      <button onClick={onNext} disabled={!hasMore} style={btnStyle}>Next →</button>
    </div>
  );
}
