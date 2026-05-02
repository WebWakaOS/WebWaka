/**
 * usePilotFlag — FE-PILOT-01
 *
 * Checks whether a given feature flag is enabled for the current workspace/tenant.
 * Calls GET /workspace/pilot-flags/:flagName on mount.
 *
 * Response schema: { enabled: boolean }
 *
 * The hook memoises the result in sessionStorage so repeated renders
 * don't re-fetch within the same browser session.
 */

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface FlagResult {
  loading: boolean;
  enabled: boolean;
}

const CACHE_PREFIX = 'pilot_flag_cache_';

export function usePilotFlag(flagName: string, workspaceId: string | undefined): FlagResult {
  const cacheKey = `${CACHE_PREFIX}${workspaceId}_${flagName}`;

  // Check session cache first (avoid flicker on navigation)
  const cached = workspaceId ? sessionStorage.getItem(cacheKey) : null;

  const [loading, setLoading] = useState(cached === null && Boolean(workspaceId));
  const [enabled, setEnabled] = useState(cached === 'true');

  useEffect(() => {
    if (!workspaceId) return;
    if (cached !== null) return; // Already resolved from cache

    let cancelled = false;
    setLoading(true);

    api
      .get<{ enabled: boolean }>(`/workspace/pilot-flags/${encodeURIComponent(flagName)}`)
      .then((res) => {
        if (cancelled) return;
        const isEnabled = res?.enabled === true;
        sessionStorage.setItem(cacheKey, String(isEnabled));
        setEnabled(isEnabled);
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [flagName, workspaceId, cacheKey, cached]);

  return { loading, enabled };
}
