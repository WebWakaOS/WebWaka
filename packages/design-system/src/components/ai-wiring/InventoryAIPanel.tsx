/**
 * InventoryAIPanel — Wave 3 A7-2
 * "AI Reorder Suggestions" panel wired to inventory_ai capability.
 * Mount on the Inventory page.
 */
import React, { useState, useCallback } from 'react';
import { AIInsightWidget } from '../AIInsightWidget.js';

export interface InventoryAIPanelProps {
  workspaceId: string;
  inventorySnippet?: string;
  apiBaseUrl?: string;
}

async function fetchInventorySuggestion(
  workspaceId: string, inventorySnippet: string, apiBaseUrl: string,
): Promise<string> {
  const res = await fetch(`${apiBaseUrl}/superagent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      capability: 'inventory_ai', workspaceId,
      message: `Inventory snapshot:\n${inventorySnippet}\n\nSuggest reorder quantities for items below threshold.`,
    }),
  });
  if (!res.ok) throw new Error(`AI error: HTTP ${res.status}`);
  const data = await res.json() as { reply: string };
  return data.reply;
}

export const InventoryAIPanel: React.FC<InventoryAIPanelProps> = ({
  workspaceId, inventorySnippet = 'No inventory data provided.', apiBaseUrl = '',
}) => {
  const [suggestion, setSuggestion] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchSuggestion = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      setSuggestion(await fetchInventorySuggestion(workspaceId, inventorySnippet, apiBaseUrl));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI suggestion');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, inventorySnippet, apiBaseUrl]);

  return (
    <section aria-label="AI Reorder Suggestions">
      {!suggestion && !loading && !error && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-500">Get AI-powered reorder suggestions based on current stock levels.</p>
          <button onClick={fetchSuggestion}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            ✨ Get Suggestions
          </button>
        </div>
      )}
      <AIInsightWidget
        capability="inventory_ai" title="AI Reorder Suggestions"
        content={suggestion} loading={loading} error={error}
        onRetry={fetchSuggestion}
        onDismiss={() => { setSuggestion(undefined); setError(undefined); }}
        variant="suggestion"
      />
    </section>
  );
};
