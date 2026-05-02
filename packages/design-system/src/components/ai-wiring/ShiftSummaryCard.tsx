/**
 * ShiftSummaryCard — Wave 3 A7-5
 * "Today's Summary" AI card for the Dashboard (end-of-day).
 * Calls POST /superagent/chat with capability=shift_summary_ai.
 * Optionally auto-fetches on mount (autoFetch=true).
 */
import React, { useState, useEffect, useCallback } from 'react';
import { AIInsightWidget } from '../AIInsightWidget.js';

export interface ShiftSummaryCardProps {
  workspaceId: string;
  shiftData?: string;
  autoFetch?: boolean;
  apiBaseUrl?: string;
}

export const ShiftSummaryCard: React.FC<ShiftSummaryCardProps> = ({
  workspaceId, shiftData = 'No shift data provided.', autoFetch = false, apiBaseUrl = '',
}) => {
  const [summary, setSummary] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchSummary = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const res = await fetch(`${apiBaseUrl}/superagent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability: 'shift_summary_ai', workspaceId,
          message: `Summarise today's shift in 3-5 sentences for the business owner:\n\n${shiftData}`,
        }),
      });
      if (!res.ok) throw new Error(`AI error: HTTP ${res.status}`);
      const data = await res.json() as { reply: string };
      setSummary(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summary failed');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, shiftData, apiBaseUrl]);

  useEffect(() => {
    if (autoFetch) { void fetchSummary(); }
  }, [autoFetch, fetchSummary]);

  return (
    <section aria-label="Today's AI Shift Summary">
      <AIInsightWidget
        capability="shift_summary_ai" title="Today's Summary"
        content={summary} loading={loading} error={error}
        onRetry={fetchSummary}
        onDismiss={() => { setSummary(undefined); setError(undefined); }}
        variant="info"
      />
      {!summary && !loading && !error && (
        <button onClick={fetchSummary}
                className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
          ✨ Generate Today's Summary
        </button>
      )}
    </section>
  );
};
