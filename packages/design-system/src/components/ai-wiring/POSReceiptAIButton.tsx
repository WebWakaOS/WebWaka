/**
 * POSReceiptAIButton — Wave 3 A7-3
 * "Enhance Receipt" button for the POS receipt modal.
 * Calls POST /superagent/chat with capability=pos_receipt_ai.
 */
import React, { useState, useCallback } from 'react';
import { AIInsightWidget } from '../AIInsightWidget.js';

export interface POSReceiptAIButtonProps {
  workspaceId: string;
  receiptSummary: string;
  onEnhanced?: (text: string) => void;
  apiBaseUrl?: string;
}

export const POSReceiptAIButton: React.FC<POSReceiptAIButtonProps> = ({
  workspaceId, receiptSummary, onEnhanced, apiBaseUrl = '',
}) => {
  const [enhanced, setEnhanced] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [visible, setVisible] = useState(false);

  const enhance = useCallback(async () => {
    setVisible(true); setLoading(true); setError(undefined);
    try {
      const res = await fetch(`${apiBaseUrl}/superagent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability: 'pos_receipt_ai', workspaceId,
          message: `Enhance this receipt for the customer:\n\n${receiptSummary}`,
        }),
      });
      if (!res.ok) throw new Error(`AI error: HTTP ${res.status}`);
      const data = await res.json() as { reply: string };
      setEnhanced(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enhancement failed');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, receiptSummary, apiBaseUrl]);

  return (
    <div>
      {!visible && (
        <button onClick={enhance}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 transition">
          ✨ Enhance Receipt
        </button>
      )}
      {visible && (
        <AIInsightWidget
          capability="pos_receipt_ai" title="Enhanced Receipt"
          content={enhanced} loading={loading} error={error}
          onApply={onEnhanced} onRetry={enhance}
          onDismiss={() => setVisible(false)}
          variant="info"
        />
      )}
    </div>
  );
};
