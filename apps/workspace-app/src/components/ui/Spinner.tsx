interface SpinnerProps {
  size?: number;
  color?: string;
  label?: string;
}

export function Spinner({ size = 32, color = '#0F4C81', label = 'Loading…' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
        style={{ animation: 'ww-spin 0.8s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
        <style>{`@keyframes ww-spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
    </span>
  );
}

export function FullPageSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 12,
    }}>
      <Spinner size={48} />
      <p style={{ color: '#64748b', fontSize: 14 }}>Loading…</p>
    </div>
  );
}
