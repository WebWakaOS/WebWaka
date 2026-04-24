import { useState, useEffect } from 'react';

/**
 * BUG-010 / ENH-002: useOnlineStatus
 *
 * Returns the current network status and subscribes to online/offline events
 * so components can reactively show the OfflineBanner or disable network
 * operations when connectivity is lost.
 *
 * The hook also works correctly in SSR / test environments where `navigator`
 * may not be available — it defaults to `true` (online) in those cases.
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return (): void => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
