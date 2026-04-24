import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * BUG-010 / ENH-002 / ENH-020: OfflineBanner
 *
 * Shows a persistent banner when the device has no network connection.
 * The banner is visually distinct (amber), accessible (role="status",
 * aria-live="polite"), and non-intrusive — it sits above the main content
 * but below the top navigation.
 *
 * The component renders nothing when online so there is zero layout cost
 * during normal operation.
 */
export function OfflineBanner(): JSX.Element | null {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 20px',
        background: '#fef3c7',
        borderBottom: '1px solid #f59e0b',
        fontSize: 14,
        color: '#78350f',
        fontWeight: 500,
        zIndex: 150,
        position: 'sticky',
        top: 0,
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 18 }}>📶</span>
      <span>
        You&apos;re offline. Changes will sync automatically when your connection is restored.
      </span>
    </div>
  );
}
